import { IsUUID, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Stable ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  stableId: string;

  @ApiProperty({ description: 'Participant ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({ description: 'Payment amount', example: 100.50 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Payment date', example: '2026-01-18' })
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiProperty({ description: 'Balance after payment', example: 500.00 })
  @IsNumber()
  @IsNotEmpty()
  balance: number;
}
