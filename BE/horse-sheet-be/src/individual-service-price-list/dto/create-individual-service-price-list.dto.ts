import { IsUUID, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIndividualServicePriceListDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiPropertyOptional({ description: 'Service ID', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  serviceId?: string | null;

  @ApiProperty({ description: 'Price', example: 100.50 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'PLN', example: 'PLN' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Participant ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  participantId: string;
}
