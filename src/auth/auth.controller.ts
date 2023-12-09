import { Controller, Post, Body, UnauthorizedException, Logger, UseGuards, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  async signUp(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    const existingUser = await this.authService.findUserByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }
    const user = await this.authService.createUser(username, password);
    const accessToken = await this.authService.generateAccessToken(user);
    return { accessToken };
  }

  @Post('signin')
  async signIn(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const accessToken = await this.authService.generateAccessToken(user);
    return { accessToken };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  async logout() {
    const user = /* Retrieve the user from the request */;
    await this.authService.logout(user);
    return 'Logout successful';
  }
}
