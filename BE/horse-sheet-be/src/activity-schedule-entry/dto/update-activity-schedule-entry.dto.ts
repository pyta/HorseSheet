import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateActivityScheduleEntryDto } from './create-activity-schedule-entry.dto';

export class UpdateActivityScheduleEntryDto extends PartialType(CreateActivityScheduleEntryDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsNumber()
  @IsOptional()
  version?: number;
}
