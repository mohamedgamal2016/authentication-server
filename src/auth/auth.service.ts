import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    try {
      const { username, email, password } = signUpDto;

      const hashedPassword = await bcrypt.hash(password, 10);

      const isUserExisted = await this.userModel.findOne({ email });
      if (isUserExisted)
        throw new BadRequestException(
          'user with this email already registered.',
        );

      const user = await this.userModel.create({
        username,
        email,
        password: hashedPassword,
      });

      const token = this.jwtService.sign({ id: user._id });

      return { token };
    } catch (error) {
      this.logger.error(`Error happened in sign up ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const token = this.jwtService.sign({ id: user._id });

      return { token };
    } catch (error) {
      this.logger.error(`Error happened in login ${error}`);
      throw new BadRequestException(error.message);
    }
  }
}
