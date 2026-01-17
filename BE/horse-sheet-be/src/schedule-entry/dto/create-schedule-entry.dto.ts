import { IsUUID, IsNotEmpty, IsDateString, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParticipantServiceDto {
  @ApiProperty({ description: 'Participant ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  participantId: string;

  @ApiPropertyOptional({ description: 'Service ID', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  serviceId?: string;
}

export class CreateScheduleEntryDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiProperty({ description: 'Date', example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Time', example: '10:00' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ description: 'Instructor ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  instructorId: string;

  @ApiProperty({ description: 'Activity ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

  @ApiProperty({ description: 'Participant IDs', type: [String], format: 'uuid' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  participantIds: string[];

  @ApiPropertyOptional({
    description: 'Participant service associations',
    type: [ParticipantServiceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantServiceDto)
  @IsOptional()
  participantServices?: ParticipantServiceDto[];
}
