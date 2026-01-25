import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Determines the appropriate SameSite value for cookies
   * - If cross-origin (different domains), use 'none' with secure
   * - Otherwise, use 'lax' for better security
   * - Can be overridden with COOKIE_SAME_SITE environment variable
   */
  private getCookieSameSite(req: Request, isSecure: boolean): 'lax' | 'none' | 'strict' {
    // Allow explicit override via environment variable
    const explicitSameSite = process.env.COOKIE_SAME_SITE?.toLowerCase();
    if (explicitSameSite === 'none' || explicitSameSite === 'lax' || explicitSameSite === 'strict') {
      return explicitSameSite as 'lax' | 'none' | 'strict';
    }

    const requestOrigin = req.headers.origin;
    const backendHost = req.get('host') || req.headers.host;
    
    // If no origin header, it's likely same-origin (direct request)
    if (!requestOrigin) {
      return 'lax';
    }

    try {
      const requestUrl = new URL(requestOrigin);
      // Get protocol from request (handles proxy headers)
      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const backendUrl = new URL(`${protocol}://${backendHost}`);
      
      // Compare hostnames - if different, it's cross-origin
      const isCrossOrigin = 
        requestUrl.hostname !== backendUrl.hostname ||
        requestUrl.protocol !== backendUrl.protocol;
      
      // For cross-origin, use 'none' (requires secure), otherwise 'lax'
      return isCrossOrigin && isSecure ? 'none' : 'lax';
    } catch (e) {
      // If URL parsing fails, check if CORS_ORIGIN is set (indicates cross-origin)
      const corsOrigin = process.env.CORS_ORIGIN;
      if (corsOrigin && corsOrigin !== '*' && isSecure) {
        // If CORS_ORIGIN is explicitly set, assume cross-origin
        return 'none';
      }
      return 'lax';
    }
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const { accessToken, refreshToken } = await this.authService.login(
      user,
      ip,
      userAgent,
    );

    // Set refresh token as HttpOnly cookie
    const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || '7d';
    const refreshExpiresInSeconds = this.parseExpiresIn(refreshExpiresIn);
    const isProduction = process.env.NODE_ENV === 'production';
    // Detect HTTPS even when behind reverse proxy
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const shouldUseSecureCookie = isProduction || isSecure;
    const sameSite = this.getCookieSameSite(req, shouldUseSecureCookie);
    
    // For SameSite=None, Secure must be true
    const finalSecure = sameSite === 'none' ? true : shouldUseSecureCookie;

    const cookieOptions: any = {
      httpOnly: true,
      secure: finalSecure,
      sameSite: sameSite,
      maxAge: refreshExpiresInSeconds * 1000,
      path: '/',
    };

    // Log cookie settings for debugging (remove in production)
    if (!isProduction) {
      console.log('Cookie settings:', {
        secure: finalSecure,
        sameSite: sameSite,
        isSecure,
        corsOrigin: process.env.CORS_ORIGIN,
        forwardedProto: req.headers['x-forwarded-proto'],
      });
    }

    res.cookie('rt', refreshToken, cookieOptions);

    return { accessToken };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: RefreshResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    const refreshToken = req.cookies?.rt;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken, ip, userAgent);

    // Set new refresh token as HttpOnly cookie
    const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || '7d';
    const refreshExpiresInSeconds = this.parseExpiresIn(refreshExpiresIn);
    const isProduction = process.env.NODE_ENV === 'production';
    // Detect HTTPS even when behind reverse proxy
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const shouldUseSecureCookie = isProduction || isSecure;
    const sameSite = this.getCookieSameSite(req, shouldUseSecureCookie);
    
    // For SameSite=None, Secure must be true
    const finalSecure = sameSite === 'none' ? true : shouldUseSecureCookie;

    const cookieOptions: any = {
      httpOnly: true,
      secure: finalSecure,
      sameSite: sameSite,
      maxAge: refreshExpiresInSeconds * 1000,
      path: '/',
    };

    res.cookie('rt', newRefreshToken, cookieOptions);

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies?.rt;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Detect HTTPS even when behind reverse proxy
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const shouldUseSecureCookie = isProduction || isSecure;
    const sameSite = this.getCookieSameSite(req, shouldUseSecureCookie);
    
    // For SameSite=None, Secure must be true
    const finalSecure = sameSite === 'none' ? true : shouldUseSecureCookie;

    res.clearCookie('rt', {
      httpOnly: true,
      secure: finalSecure,
      sameSite: sameSite,
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60; // Default to 7 days in seconds
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }
}

