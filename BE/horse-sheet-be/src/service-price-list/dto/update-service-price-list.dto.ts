import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateServicePriceListDto } from './create-service-price-list.dto';

export class UpdateServicePriceListDto extends PartialType(CreateServicePriceListDto) {
  @ApiPropertyOptional({ description: 'Version for optimistic locking' })
  @IsNumber()
  @IsOptional()
  version?: number;
}
