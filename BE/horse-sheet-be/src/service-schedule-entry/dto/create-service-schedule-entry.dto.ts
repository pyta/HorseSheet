import { IsUUID, IsNotEmpty, IsDateString, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceScheduleEntryDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiProperty({ description: 'Start date', example: '2026-01-18' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Duration', example: 'day' })
  @IsString()
  @IsNotEmpty()
  duration: string; // day / month / ...

  @ApiProperty({ description: 'Service ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Participant IDs', type: [String], format: 'uuid' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  participantIds: string[];
}
