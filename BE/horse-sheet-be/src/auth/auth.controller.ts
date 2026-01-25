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

    res.cookie('rt', refreshToken, {
      httpOnly: true,
      secure: shouldUseSecureCookie,
      sameSite: 'lax',
      maxAge: refreshExpiresInSeconds * 1000,
      path: '/',
    });

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

    res.cookie('rt', newRefreshToken, {
      httpOnly: true,
      secure: shouldUseSecureCookie,
      sameSite: 'lax',
      maxAge: refreshExpiresInSeconds * 1000,
      path: '/',
    });

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

    res.clearCookie('rt', {
      httpOnly: true,
      secure: shouldUseSecureCookie,
      sameSite: 'lax',
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

