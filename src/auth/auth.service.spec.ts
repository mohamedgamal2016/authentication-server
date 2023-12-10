import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { BadRequestException } from '@nestjs/common';
import { User } from './schema/user.schema';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should create a new user and return a token', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@1234',
      };

      const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
      const mockedUser = {
        _id: 'someId',
        username: signUpDto.username,
        email: signUpDto.email,
        password: hashedPassword,
      } as User;
      const mockToken = 'mockToken';

      jest.spyOn(service['userModel'], 'findOne').mockResolvedValue(null);
      // jest.spyOn(service['userModel'], 'create').mockResolvedValue(mockedUser);
      jest.spyOn(service['jwtService'], 'sign').mockReturnValue(mockToken);

      const result = await service.signUp(signUpDto);

      expect(service['userModel'].findOne).toHaveBeenCalledWith({
        email: signUpDto.email,
      });
      expect(service['userModel'].create).toHaveBeenCalledWith({
        username: signUpDto.username,
        email: signUpDto.email,
        password: hashedPassword,
      });
      expect(service['jwtService'].sign).toHaveBeenCalledWith({
        id: mockedUser._id,
      });
      expect(result).toEqual({ token: mockToken });
    });

    it('should throw BadRequestException on signup error', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@1234',
      };

      jest.spyOn(service['userModel'], 'findOne').mockResolvedValue(null);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return a token if login credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test@1234',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const existingUser = {
        _id: 'someObjectId',
        email: loginDto.email,
        password: hashedPassword,
      };
      const mockToken = 'mockToken';

      jest
        .spyOn(service['userModel'], 'findOne')
        .mockResolvedValue(existingUser);
      jest.spyOn(service['jwtService'], 'sign').mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(service['userModel'].findOne).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      expect(service['jwtService'].sign).toHaveBeenCalledWith({
        id: existingUser._id,
      });
      expect(result).toEqual({ token: mockToken });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      const nonExistingUser = {
        email: 'nonexistent@example.com',
        password: 'Test@1234',
      };

      jest.spyOn(service['userModel'], 'findOne').mockResolvedValue(null);

      await expect(service.login(nonExistingUser as LoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'IncorrectPassword',
      };

      const hashedPassword = await bcrypt.hash('Test@1234', 10);
      const existingUser = { email: loginDto.email, password: hashedPassword };

      jest
        .spyOn(service['userModel'], 'findOne')
        .mockResolvedValue(existingUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
