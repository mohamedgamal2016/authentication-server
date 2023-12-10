import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  @ApiProperty()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Password must contain at least 1 letter, 1 number, 1 special character, and be 8 characters long.',
  })
  @ApiProperty()
  readonly password: string;
}
