import { IsDateString, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DuplicateScheduleEntryDto {
  @ApiProperty({ description: 'New date', example: '2024-01-20' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'New time', example: '14:00' })
  @IsString()
  @IsOptional()
  time?: string;
}
