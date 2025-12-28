import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/service/user.service';
import { ConfigService } from '@nestjs/config';
import {
  JwtPayload,
  OAuthLoginResponse,
  OAuthProfile,
  UserTokens,
} from './model/auth-model.types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleOAuthLogin(
    oAuthProfile: OAuthProfile,
  ): Promise<OAuthLoginResponse & { refreshToken: string }> {
    const user = await this.userService.findOrCreateByOAuthId(
      oAuthProfile.oauthId,
      oAuthProfile.provider,
    );

    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString(),
    );

    await this.userService.saveRefreshToken(user._id.toString(), refreshToken);

    return {
      userId: user._id.toString(),
      accessToken,
      refreshToken,
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
      typeof (verified as Record<string, unknown>).userId !== 'string'
    ) {
      throw new UnauthorizedException();
    }

    const { userId } = verified as JwtPayload;

    const user = await this.userService.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(userId);
  }

  async logout(userId: string): Promise<void> {
    await this.userService.clearRefreshToken(userId);
  }

  private generateTokens(userId: string): UserTokens {
    const payload: JwtPayload = { userId };
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
