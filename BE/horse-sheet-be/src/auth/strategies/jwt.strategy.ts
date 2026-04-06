import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // Payload already contains roles from login, but verify user is still active
    const user = await this.authService.findUserById(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }
    // Use roles and stableIds from token payload (set at login/refresh)
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      stableIds: payload.stableIds || [],
    };
  }
}

