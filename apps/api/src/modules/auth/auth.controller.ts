import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Get current session
   */
  @Get('session')
  @UseGuards(AuthGuard)
  async getSession(@CurrentUser() user: any) {
    return { user };
  }

  /**
   * Validate session token
   */
  @Post('validate')
  @Public()
  async validateSession(@Req() req: Request) {
    const sessionToken = req.cookies['next-auth. session-token'];

    if (!sessionToken) {
      return { valid: false };
    }

    const isValid = await this.authService.validateSession(sessionToken);
    return { valid: isValid };
  }

  /**
   * Logout
   */
  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const sessionToken = req.cookies['next-auth.session-token'];

    if (sessionToken) {
      await this.authService.deleteSession(sessionToken);
    }

    // Clear cookie
    res.clearCookie('next-auth.session-token');

    return res.json({ success: true });
  }
}