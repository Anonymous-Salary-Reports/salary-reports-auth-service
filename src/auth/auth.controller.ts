import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { AuthService } from './auth.service';
import { OauthProvider } from '../user/model/oauth-provider';
import type {
  AuthenticatedRequest,
  OAuthRequest,
} from './model/auth-request.types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  @UseGuards(GoogleOAuthGuard)
  async login() {}

  @Get('/google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async redirect(@Req() req: OAuthRequest) {
    const oauthUser = req.user as { oauthId: string; provider: OauthProvider };
    return this.authService.handleOAuthLogin(oauthUser);
  }

  @Post('/refresh')
  @UseGuards(JwtAuthGuard)
  async refreshAccessToken(@Body() body: { refreshToken: string }) {
    const refreshToken: string = body.refreshToken;
    const result = await this.authService.refreshAccessToken(refreshToken);
    if (!result) {
      return { error: 'Invalid refresh token' };
    }
    return result;
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthenticatedRequest) {
    const ok = await this.authService.logout(req.user.userId);
    if (!ok) {
      return { error: 'Logout failed' };
    }
    return {
      success: true,
      message: 'Logged out successfully. Please discard your tokens.',
    };
  }
}
