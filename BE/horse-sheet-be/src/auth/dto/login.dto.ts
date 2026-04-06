import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  /** Email or 6-digit user number */
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address or 6-digit user number',
  })
  @IsString()
  login: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;
}

