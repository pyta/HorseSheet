import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateIndividualActivityPriceListDto } from './create-individual-activity-price-list.dto';

export class UpdateIndividualActivityPriceListDto extends PartialType(CreateIndividualActivityPriceListDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsNumber()
  @IsOptional()
  version?: number;
}
