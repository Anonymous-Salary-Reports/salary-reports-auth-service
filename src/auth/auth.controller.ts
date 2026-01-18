import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { AuthService } from './auth.service';
import type {
  AuthenticatedRequest,
  LogoutResponse,
  OAuthRequest,
} from './model/auth-model.types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/login')
  @UseGuards(GoogleOAuthGuard)
  async login() {}

  @Get('/google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async redirect(
    @Req() req: OAuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    const { userId, accessToken, refreshToken } =
      await this.authService.handleOAuthLogin(req.user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(
      `http://localhost:5173/auth/callback?token=${accessToken}&userId=${userId}`,
    );
  }

  @Post('/refresh')
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const tokens = await this.authService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production', // HTTPS only in prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthenticatedRequest): Promise<LogoutResponse> {
    try {
      await this.authService.logout(req.user.userId);
    } catch (error) {
      return { success: false, message: `Logout failed due to ${error}` };
    }

    return {
      success: true,
      message: 'Logged out successfully. Please discard your tokens.',
    };
  }
}
