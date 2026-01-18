import { IsUUID, IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityPriceListDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiProperty({ description: 'Activity ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

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
