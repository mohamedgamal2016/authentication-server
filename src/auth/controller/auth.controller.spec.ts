import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schema/user.schema';
import { LoginDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/signup.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should return a token after signing up', async () => {
      const signUpDto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@1234',
      };

      jest
        .spyOn(authService, 'signUp')
        .mockResolvedValue({ token: 'mockToken' });

      const result = await controller.signUp(signUpDto);
      expect(result).toEqual({ token: 'mockToken' });
    });

    it('should throw BadRequestException if user with email already exists', async () => {
      const signUpDto: SignUpDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Test@1234',
      };

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(
          new BadRequestException('user with this email already registered.'),
        );

      await expect(controller.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return a token after login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test@1234',
      };

      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ token: 'mockToken' });

      const result = await controller.login(loginDto);
      expect(result).toEqual({ token: 'mockToken' });
    });
    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'IncorrectPassword',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(
          new UnauthorizedException('Invalid email or password'),
        );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
