import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/service/user.service';
import { OauthProvider } from '../user/model/oauth-provider';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './model/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleOAuthLogin(oauthProfile: {
    oauthId: string;
    provider: OauthProvider;
  }) {
    const user = await this.userService.findOrCreateByOAuthId(
      oauthProfile.oauthId,
      oauthProfile.provider,
    );

    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString(),
    );

    // Store refresh token in database
    await this.userService.saveRefreshToken(user._id.toString(), refreshToken);

    return {
      userId: user._id.toString(),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string } | null> {
    try {
      const verified = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }) as unknown;

      if (
        !verified ||
        typeof verified !== 'object' ||
        !('userId' in verified) ||
        typeof (verified as Record<string, unknown>).userId !== 'string'
      ) {
        return null;
      }

      const { userId } = verified as JwtPayload;

      const user = await this.userService.findById(userId);
      if (!user || user.refreshToken !== refreshToken) {
        return null;
      }

      const newAccessToken = this.jwtService.sign(
        { userId },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '10m',
        },
      );

      return { accessToken: newAccessToken };
    } catch {
      return null;
    }
  }

  async logout(userId: string): Promise<boolean> {
    try {
      await this.userService.clearRefreshToken(userId);
      return true;
    } catch {
      return false;
    }
  }

  private generateTokens(userId: string) {
    const payload: JwtPayload = { userId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '10m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
