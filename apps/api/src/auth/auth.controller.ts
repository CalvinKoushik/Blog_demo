import { Body, Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Throttle({ auth: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Throttle({ auth: { limit: 3, ttl: 60_000 } })
  @Post('resend-verification-email')
  @UseGuards(JwtAuthGuard)
  resendVerificationEmail(@CurrentUser() user: { id: string }) {
    return this.authService.sendVerificationEmail(user.id);
  }

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @CurrentUser()
    user: {
      id: string;
      email: string;
      role: string;
      profile: {
        firstName: string;
        lastName: string;
        nickname: string | null;
        avatarUrl: string | null;
        collegeName: string | null;
        department: string | null;
        year: number | null;
      } | null;
    },
  ) {
    const profile = user.profile;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      username: profile?.nickname ?? '',
      avatarUrl: profile?.avatarUrl ?? null,
      collegeName: profile?.collegeName ?? null,
      department: profile?.department ?? null,
      year: profile?.year ?? null,
    };
  }
}
