import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateIndividualServicePriceListDto } from './create-individual-service-price-list.dto';

export class UpdateIndividualServicePriceListDto extends PartialType(CreateIndividualServicePriceListDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsNumber()
  @IsOptional()
  version?: number;
}
