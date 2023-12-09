import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, password: hashedPassword });
    return user.save();
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.userModel.findOne({ username }).exec();
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.findUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload = { username: user.username };
    return this.jwtService.signAsync(payload);
  }

  async logout(user: User): Promise<void> {
    // Perform any necessary logout actions (e.g., invalidating tokens)
    this.logger.log(`User ${user.username} logged out.`);
  }
}
