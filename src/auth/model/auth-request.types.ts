import { Request } from 'express';
import { OauthProvider } from '../../user/model/oauth-provider';
import { JwtPayload } from './jwt-payload.interface';

export type OAuthRequest = Request & {
  user: { oauthId: string; provider: OauthProvider };
};

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};
