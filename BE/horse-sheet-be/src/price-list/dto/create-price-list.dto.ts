import { IsUUID, IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePriceListDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiPropertyOptional({ description: 'Activity ID', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.serviceId)
  activityId?: string;

  @ApiPropertyOptional({ description: 'Service ID', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.activityId)
  serviceId?: string;

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
