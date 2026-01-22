import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/service/user.service';
import { ConfigService } from '@nestjs/config';
import {
  JwtPayload,
  OAuthLoginResponse,
  OAuthProfile,
  UserTokens,
} from '../model/auth-model.types';
import { Role } from '../../user/model/role';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleOAuthLogin(
    oAuthProfile: OAuthProfile,
  ): Promise<OAuthLoginResponse> {
    const user = await this.userService.findOrCreateByOAuthId(
      oAuthProfile.oauthId,
      oAuthProfile.provider,
    );

    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString(),
      user.role,
    );

    await this.userService.saveRefreshToken(user._id.toString(), refreshToken);

    return {
      userId: user._id.toString(),
      accessToken,
      refreshToken,
      role: user.role,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<UserTokens> {
    const verified = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    }) as unknown;

    if (
      !verified ||
      typeof verified !== 'object' ||
      !('userId' in verified) ||
      typeof (verified as Record<string, unknown>).userId !== 'string' ||
      !('role' in verified) ||
      typeof (verified as Record<string, unknown>).role !== 'string'
    ) {
      throw new UnauthorizedException();
    }

    const { userId, role } = verified as JwtPayload;

    const user = await this.userService.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(userId, role);
  }

  async logout(userId: string): Promise<void> {
    await this.userService.clearRefreshToken(userId);
  }

  private generateTokens(userId: string, role: Role = Role.USER): UserTokens {
    const payload: JwtPayload = { userId, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
