import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from 'src/common/enum';

export class RegisterDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'timothy@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'Timothy',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'USER',
    enum: UserRole,
    required: false,
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'timothy@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
