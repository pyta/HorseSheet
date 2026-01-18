import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateServiceScheduleEntryDto } from './create-service-schedule-entry.dto';

export class UpdateServiceScheduleEntryDto extends PartialType(CreateServiceScheduleEntryDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsNumber()
  @IsOptional()
  version?: number;
}
