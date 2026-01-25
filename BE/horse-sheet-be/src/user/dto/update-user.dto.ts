import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Password (optional, only update if provided)' })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsNumber()
  @IsOptional()
  version?: number;
}

