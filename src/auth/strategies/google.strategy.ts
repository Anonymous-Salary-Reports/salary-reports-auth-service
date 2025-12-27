import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OauthProvider } from '../../user/model/oauth-provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET')!,
      callbackURL:
        configService.get('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3001/auth/google-redirect',
      scope: ['openid'], // 'openid' gets you the ID token with 'sub'
    });
  }

  // passport-google-oauth20 provides several function signatures; we only need the profile
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = {
      oauthId: profile.id,
      provider: OauthProvider.GOOGLE,
    };

    done(null, user);
  }
}
