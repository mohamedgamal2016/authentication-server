import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/signup.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth Controller')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiBody({
    description: 'User to be created',
    type: SignUpDto,
  })
  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string }> {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiBody({
    description: 'User to be authenticated',
    type: LoginDto,
  })
  @Post('/login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return this.authService.login(loginDto);
  }
}
