import { IsUUID, IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServicePriceListDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiProperty({ description: 'Service ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: 'Price', example: 100.50 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'PLN', example: 'PLN' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
