import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Participant } from '../participant/entities/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Stable, Participant])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
