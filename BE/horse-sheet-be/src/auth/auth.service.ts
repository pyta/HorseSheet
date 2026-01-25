import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async login(user: User, ip?: string, userAgent?: string) {
    const roles = user.userRoles?.map((ur) => ur.role?.code) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.generateRefreshToken(
      user.id,
      ip,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshTokenValue: string, ip?: string, userAgent?: string) {
    if (!refreshTokenValue) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenHash = this.hashToken(refreshTokenValue);
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user', 'user.userRoles', 'user.userRoles.role'],
    });

    if (!refreshToken || !refreshToken.user || !refreshToken.user.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    refreshToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(refreshToken);

    // Generate new tokens
    const user = refreshToken.user;
    const roles = user.userRoles?.map((ur) => ur.role?.code) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessToken = this.jwtService.sign(payload);

    const newRefreshToken = await this.generateRefreshToken(
      user.id,
      ip,
      userAgent,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenValue: string) {
    if (!refreshTokenValue) {
      return;
    }

    const tokenHash = this.hashToken(refreshTokenValue);
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    });

    if (refreshToken) {
      refreshToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  private async generateRefreshToken(
    userId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<string> {
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshTokenValue);

    const expiresIn = this.configService.get<string>('REFRESH_EXPIRES_IN') || '7d';
    const expiresInSeconds = this.parseExpiresIn(expiresIn);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
      ip,
      userAgent,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return refreshTokenValue;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
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

