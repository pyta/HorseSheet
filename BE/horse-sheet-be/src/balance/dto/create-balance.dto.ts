import { IsUUID, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBalanceDto {
  @ApiProperty({ description: 'Contact person ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  contactPersonId: string;

  @ApiProperty({ description: 'Balance amount', example: 500.00 })
  @IsNumber()
  @IsNotEmpty()
  balance: number;
}

