import { Request } from 'express';
import { OauthProvider } from '../../user/model/oauth-provider';

export type OAuthProfile = { oauthId: string; provider: OauthProvider };

export type UserTokens = { accessToken: string; refreshToken: string };

export type OAuthRequest = Request & {
  user: OAuthProfile;
};

export type OAuthLoginResponse = {
  userId: string;
  accessToken: string;
};

export type JwtPayload = {
  userId: string;
};

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

export type LogoutResponse = {
  success: boolean;
  message: string;
};
