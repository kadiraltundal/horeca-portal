import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FinanceService } from '../finance.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FinanceService);
  });

  describe('findAllInvoices', () => {
    it('should return paginated invoices', async () => {
      const mockInvoices = [
        { id: 'inv-1', invoiceNumber: 'INV-001', totalAmount: 1000, store: {}, customer: {}, invoiceItems: [] },
      ];
      prisma.invoice.findMany.mockResolvedValue(mockInvoices);
      prisma.invoice.count.mockResolvedValue(1);

      const result = await service.findAllInvoices({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockInvoices);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should apply store filter', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      await service.findAllInvoices({ storeId: 'store-123' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ storeId: 'store-123' }),
        }),
      );
    });

    it('should apply status and type filters', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      await service.findAllInvoices({ status: 'PAID', type: 'SALES' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PAID', type: 'SALES' }),
        }),
      );
    });

    it('should apply date range filter', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      await service.findAllInvoices({ startDate: '2024-01-01', endDate: '2024-12-31' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            },
          }),
        }),
      );
    });
  });

  describe('findOneInvoice', () => {
    it('should return a single invoice', async () => {
      const mockInvoice = { id: 'inv-1', invoiceNumber: 'INV-001', invoiceItems: [] };
      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);

      const result = await service.findOneInvoice('inv-1');

      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.findOneInvoice('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createInvoice', () => {
    it('should create an invoice with calculated subtotal, tax, and total', async () => {
      const dto = {
        storeId: 'store-1',
        type: 'SALES',
        items: [
          { productId: 'prod-1', description: 'Product A', quantity: 2, unitPrice: 100, taxRate: 20 },
          { productId: 'prod-2', description: 'Product B', quantity: 1, unitPrice: 50, taxRate: 10 },
        ],
      };

      const expectedInvoice = {
        invoiceNumber: 'INV-001',
        storeId: 'store-1',
        type: 'SALES',
        subtotal: 250,
        taxAmount: 45,
        totalAmount: 295,
        invoiceItems: [
          { productId: 'prod-1', description: 'Product A', quantity: 2, unitPrice: 100, taxRate: 20, subtotal: 200, total: 240 },
          { productId: 'prod-2', description: 'Product B', quantity: 1, unitPrice: 50, taxRate: 10, subtotal: 50, total: 55 },
        ],
      };

      prisma.invoice.create.mockResolvedValue(expectedInvoice);

      const result = await service.createInvoice(dto);

      expect(result.subtotal).toBe(250);
      expect(result.taxAmount).toBe(45);
      expect(result.totalAmount).toBe(295);
      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 250,
            taxAmount: 45,
            totalAmount: 295,
          }),
        }),
      );
    });

    it('should use default tax rate of 20% when not provided', async () => {
      const dto = {
        storeId: 'store-1',
        type: 'SALES',
        items: [
          { productId: 'prod-1', description: 'Product A', quantity: 1, unitPrice: 100 },
        ],
      };

      prisma.invoice.create.mockResolvedValue({});

      await service.createInvoice(dto);

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 100,
            taxAmount: 20,
            totalAmount: 120,
          }),
        }),
      );
    });

    it('should generate invoice number when not provided', async () => {
      const dto = {
        storeId: 'store-1',
        type: 'SALES',
        items: [
          { productId: 'prod-1', description: 'Product A', quantity: 1, unitPrice: 100, taxRate: 0 },
        ],
      };

      prisma.invoice.create.mockResolvedValue({});

      await service.createInvoice(dto);

      const createCall = prisma.invoice.create.mock.calls[0][0];
      expect(createCall.data.invoiceNumber).toMatch(/^INV-/);
    });

    it('should use provided invoice number', async () => {
      const dto = {
        storeId: 'store-1',
        type: 'SALES',
        invoiceNumber: 'INV-CUSTOM-001',
        items: [
          { productId: 'prod-1', description: 'Product A', quantity: 1, unitPrice: 100, taxRate: 0 },
        ],
      };

      prisma.invoice.create.mockResolvedValue({});

      await service.createInvoice(dto);

      const createCall = prisma.invoice.create.mock.calls[0][0];
      expect(createCall.data.invoiceNumber).toBe('INV-CUSTOM-001');
    });
  });

  describe('updateInvoiceStatus', () => {
    it('should update invoice status to PAID with paidAt date', async () => {
      const mockInvoice = { id: 'inv-1', status: 'SENT' };
      const updatedInvoice = { ...mockInvoice, status: 'PAID', paidAt: new Date() };

      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);
      prisma.invoice.update.mockResolvedValue(updatedInvoice);

      const result = await service.updateInvoiceStatus('inv-1', 'PAID');

      expect(result.status).toBe('PAID');
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PAID',
            paidAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should update invoice status without paidAt for non-PAID status', async () => {
      const mockInvoice = { id: 'inv-1', status: 'DRAFT' };
      const updatedInvoice = { ...mockInvoice, status: 'SENT' };

      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);
      prisma.invoice.update.mockResolvedValue(updatedInvoice);

      await service.updateInvoiceStatus('inv-1', 'SENT');

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'SENT' }),
        }),
      );
      const updateCall = prisma.invoice.update.mock.calls[0][0];
      expect(updateCall.data.paidAt).toBeUndefined();
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.updateInvoiceStatus('inv-1', 'INVALID')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.updateInvoiceStatus('nonexistent', 'PAID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createExpense', () => {
    it('should create an expense', async () => {
      const dto = {
        storeId: 'store-1',
        title: 'Office Supplies',
        amount: 150,
        currency: 'TRY',
      };

      const mockExpense = { id: 'exp-1', ...dto, date: new Date() };
      prisma.expense.create.mockResolvedValue(mockExpense);

      const result = await service.createExpense(dto);

      expect(result).toEqual(mockExpense);
      expect(prisma.expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            storeId: 'store-1',
            title: 'Office Supplies',
            amount: 150,
            currency: 'TRY',
          }),
        }),
      );
    });

    it('should use default currency TRY when not provided', async () => {
      const dto = {
        storeId: 'store-1',
        title: 'Utilities',
        amount: 200,
      };

      prisma.expense.create.mockResolvedValue({});

      await service.createExpense(dto);

      expect(prisma.expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'TRY' }),
        }),
      );
    });
  });

  describe('updateExpenseStatus', () => {
    it('should update expense status to APPROVED with approvedBy', async () => {
      const mockExpense = { id: 'exp-1', status: 'PENDING' };
      const updatedExpense = { ...mockExpense, status: 'APPROVED', approvedBy: 'user-1' };

      prisma.expense.findUnique.mockResolvedValue(mockExpense);
      prisma.expense.update.mockResolvedValue(updatedExpense);

      const result = await service.updateExpenseStatus('exp-1', 'APPROVED', 'user-1');

      expect(result.status).toBe('APPROVED');
      expect(result.approvedBy).toBe('user-1');
    });

    it('should set approvedBy to null for non-APPROVED status', async () => {
      const mockExpense = { id: 'exp-1', status: 'APPROVED', approvedBy: 'user-1' };
      const updatedExpense = { ...mockExpense, status: 'REJECTED', approvedBy: null };

      prisma.expense.findUnique.mockResolvedValue(mockExpense);
      prisma.expense.update.mockResolvedValue(updatedExpense);

      await service.updateExpenseStatus('exp-1', 'REJECTED');

      expect(prisma.expense.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ approvedBy: null }),
        }),
      );
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.updateExpenseStatus('exp-1', 'INVALID')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if expense not found', async () => {
      prisma.expense.findUnique.mockResolvedValue(null);

      await expect(service.updateExpenseStatus('nonexistent', 'APPROVED')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSummary', () => {
    it('should calculate revenue, expenses, and profit', async () => {
      const mockInvoices = [
        { type: 'SALES', totalAmount: 1000 },
        { type: 'SALES', totalAmount: 500 },
        { type: 'PURCHASE', totalAmount: 300 },
      ];
      const mockExpenses = [
        { amount: 200 },
        { amount: 100 },
      ];

      prisma.invoice.findMany.mockResolvedValue(mockInvoices);
      prisma.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.getSummary({});

      expect(result.revenue).toBe(1500);
      expect(result.purchases).toBe(300);
      expect(result.expenses).toBe(300);
      expect(result.profit).toBe(900);
    });

    it('should handle empty data', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.expense.findMany.mockResolvedValue([]);

      const result = await service.getSummary({});

      expect(result.revenue).toBe(0);
      expect(result.purchases).toBe(0);
      expect(result.expenses).toBe(0);
      expect(result.profit).toBe(0);
    });

    it('should apply store filter', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.expense.findMany.mockResolvedValue([]);

      await service.getSummary({ storeId: 'store-1' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ storeId: 'store-1' }),
        }),
      );
      expect(prisma.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ storeId: 'store-1' }),
        }),
      );
    });

    it('should apply date range filter', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.expense.findMany.mockResolvedValue([]);

      await service.getSummary({ startDate: '2024-01-01', endDate: '2024-06-30' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-06-30'),
            },
          }),
        }),
      );
    });
  });
});
