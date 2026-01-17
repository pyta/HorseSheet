import { IsOptional, IsDateString, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterScheduleEntryDto {
  @ApiPropertyOptional({ description: 'Start date', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2024-01-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Instructor ID', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  instructorId?: string;

  @ApiPropertyOptional({ description: 'Participant ID', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  participantId?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;
}
