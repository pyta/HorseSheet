import { IsUUID, IsNotEmpty, IsDateString, IsString, IsInt, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityScheduleEntryDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiProperty({ description: 'Date', example: '2026-01-18' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Time', example: '10:00:00' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ description: 'Duration in minutes', example: 60 })
  @IsInt()
  @IsNotEmpty()
  duration: number;

  @ApiProperty({ description: 'Instructor ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  instructorId: string;

  @ApiProperty({ description: 'Activity ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

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
