import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateActivityPriceListDto } from './create-activity-price-list.dto';

export class UpdateActivityPriceListDto extends PartialType(CreateActivityPriceListDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsNumber()
  @IsOptional()
  version?: number;
}
