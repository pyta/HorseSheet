import { IsUUID, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiProperty({ description: 'Contact Person ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  contactPersonId: string;

  @ApiProperty({ description: 'Payment amount', example: 100.50 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Payment date', example: '2026-01-18' })
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;
}
