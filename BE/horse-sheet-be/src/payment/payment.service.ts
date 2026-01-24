import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Stable } from '../stable/entities/stable.entity';
import { ContactPerson } from '../contact-person/entities/contact-person.entity';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Stable)
    private readonly stableRepository: Repository<Stable>,
    @InjectRepository(ContactPerson)
    private readonly contactPersonRepository: Repository<ContactPerson>,
    private readonly queueService: QueueService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Validate stable exists and is active
    const stable = await this.stableRepository.findOne({
      where: { id: createPaymentDto.stableId, deletedAt: IsNull() },
    });

    if (!stable) {
      throw new BadRequestException(
        `Stable with ID ${createPaymentDto.stableId} not found or inactive`,
      );
    }

    // Validate contact person exists and is active
    const contactPerson = await this.contactPersonRepository.findOne({
      where: {
        id: createPaymentDto.contactPersonId,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!contactPerson) {
      throw new BadRequestException(
        `Contact person with ID ${createPaymentDto.contactPersonId} not found or inactive`,
      );
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentDate: new Date(createPaymentDto.paymentDate),
    });
    
    const savedPayment = await this.paymentRepository.save(payment);

    // Add balance update message to queue
    await this.queueService.addBalanceUpdate({
      value: savedPayment.amount,
      contactPersonId: savedPayment.contactPersonId,
    });

    return savedPayment;
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['stable', 'contactPerson'],
      order: { paymentDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stable', 'contactPerson'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    // Optimistic locking check
    if (
      updatePaymentDto.version !== undefined &&
      payment.version !== updatePaymentDto.version
    ) {
      throw new ConflictException(
        'The payment has been modified by another user. Please refresh and try again.',
      );
    }

    // Validate contact person if updating
    if (updatePaymentDto.contactPersonId) {
      const contactPerson = await this.contactPersonRepository.findOne({
        where: {
          id: updatePaymentDto.contactPersonId,
          deletedAt: IsNull(),
          isActive: true,
        },
      });

      if (!contactPerson) {
        throw new BadRequestException(
          `Contact person with ID ${updatePaymentDto.contactPersonId} not found or inactive`,
        );
      }
    }

    // Track old amount for balance calculation
    const oldAmount = payment.amount;
    const oldContactPersonId = payment.contactPersonId;

    // Update fields
    if (updatePaymentDto.paymentDate) {
      payment.paymentDate = new Date(updatePaymentDto.paymentDate);
    }
    if (updatePaymentDto.amount !== undefined) {
      payment.amount = updatePaymentDto.amount;
    }
    if (updatePaymentDto.contactPersonId) {
      payment.contactPersonId = updatePaymentDto.contactPersonId;
    }

    const savedPayment = await this.paymentRepository.save(payment);

    // Add balance update messages to queue
    if (updatePaymentDto.amount !== undefined || updatePaymentDto.contactPersonId) {
      // If contact person changed, subtract from old and add to new
      if (updatePaymentDto.contactPersonId && updatePaymentDto.contactPersonId !== oldContactPersonId) {
        await this.queueService.addBalanceUpdate({
          value: -oldAmount,
          contactPersonId: oldContactPersonId,
        });

        await this.queueService.addBalanceUpdate({
          value: savedPayment.amount,
          contactPersonId: savedPayment.contactPersonId,
        });
      } else {
        // Same contact person, just update amount difference
        const amountDifference = savedPayment.amount - oldAmount;
        await this.queueService.addBalanceUpdate({
          value: amountDifference,
          contactPersonId: savedPayment.contactPersonId,
        });
      }
    }

    return savedPayment;
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    
    await this.queueService.addBalanceUpdate({
      value: -payment.amount,
      contactPersonId: payment.contactPersonId,
    });

    await this.paymentRepository.softRemove(payment);
  }
}
