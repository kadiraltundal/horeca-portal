import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const paymentNumber = this.generatePaymentNumber();

    const payment = this.paymentRepository.create({
      userId,
      orderId: createPaymentDto.orderId,
      quoteId: createPaymentDto.quoteId,
      paymentNumber,
      method: createPaymentDto.method,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency || 'USD',
      description: createPaymentDto.description,
      metadata: createPaymentDto.metadata,
    });

    this.logger.log(`Creating payment ${paymentNumber} for user ${userId}`);
    return this.paymentRepository.save(payment);
  }

  async findByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async processClick(id: string, externalId: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Payment cannot be processed');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.externalId = externalId;
    payment.paidAt = new Date();

    this.logger.log(`Processing Click payment ${payment.paymentNumber}`);
    return this.paymentRepository.save(payment);
  }

  async processPayme(id: string, externalId: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Payment cannot be processed');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.externalId = externalId;
    payment.paidAt = new Date();

    this.logger.log(`Processing Payme payment ${payment.paymentNumber}`);
    return this.paymentRepository.save(payment);
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;

    if (status === PaymentStatus.COMPLETED) {
      payment.paidAt = new Date();
    }

    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const totalPayments = await this.paymentRepository.count();
    const completedPayments = await this.paymentRepository.count({
      where: { status: PaymentStatus.COMPLETED },
    });
    const totalAmount = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'sum')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      totalPayments,
      completedPayments,
      totalAmount: parseFloat(totalAmount.sum) || 0,
    };
  }

  private generatePaymentNumber(): string {
    const date = new Date();
    const prefix = 'PAY';
    const timestamp = date.getFullYear().toString().slice(-2) +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}
