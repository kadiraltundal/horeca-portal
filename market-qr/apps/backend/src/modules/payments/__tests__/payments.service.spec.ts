import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';
import { mockOrder, mockPayment } from '../../../test-utils/mock-fixtures';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  describe('initialize', () => {
    it('should initialize a payment', async () => {
      const order = mockOrder({ status: 'PENDING' });
      const payment = mockPayment();

      prisma.order.findUnique.mockResolvedValue(order);
      prisma.payment.create.mockResolvedValue(payment);

      const result = await service.initialize({
        orderId: 'order-123',
        method: 'CASH',
      });

      expect(result.status).toBe('PENDING');
      expect(result.method).toBe('CASH');
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.initialize({ orderId: 'nonexistent', method: 'CASH' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order is not pending', async () => {
      const order = mockOrder({ status: 'PAID' });
      prisma.order.findUnique.mockResolvedValue(order);

      await expect(
        service.initialize({ orderId: 'order-123', method: 'CASH' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirm', () => {
    it('should confirm a payment', async () => {
      const payment = mockPayment({ status: 'PENDING' });
      const confirmedPayment = { ...payment, status: 'SUCCESS' };
      prisma.payment.findUnique
        .mockResolvedValueOnce(payment)
        .mockResolvedValueOnce(confirmedPayment);
      prisma.$transaction.mockResolvedValue([]);

      const result = await service.confirm('order-123');

      expect(result!.status).toBe('SUCCESS');
    });

    it('should throw NotFoundException if payment not found', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.confirm('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('fail', () => {
    it('should mark payment as failed', async () => {
      const payment = mockPayment({ status: 'PENDING' });
      const failedPayment = { ...payment, status: 'FAILED', webhookLog: 'Insufficient funds' };
      prisma.payment.findUnique
        .mockResolvedValueOnce(payment)
        .mockResolvedValueOnce(failedPayment);
      prisma.payment.update.mockResolvedValue(failedPayment);

      const result = await service.fail('order-123', 'Insufficient funds');

      expect(result!.status).toBe('FAILED');
      expect(result!.webhookLog).toBe('Insufficient funds');
    });

    it('should throw NotFoundException if payment not found', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.fail('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatus', () => {
    it('should return payment status', async () => {
      const payment = mockPayment();
      prisma.payment.findUnique.mockResolvedValue(payment);

      const result = await service.getStatus('order-123');

      expect(result).toEqual(payment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.getStatus('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
