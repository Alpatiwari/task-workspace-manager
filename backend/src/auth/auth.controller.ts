import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestLoginDto } from './dto/guest-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  guestLogin(@Body() dto: GuestLoginDto) {
    return this.authService.guestLogin(dto);
  }

  @Post('google')
  googleLogin(@Body() profile: { email: string; name?: string; avatarUrl?: string }) {
    return this.authService.googleLogin(profile);
  }
}
