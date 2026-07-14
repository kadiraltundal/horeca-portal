import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ===== Invoices =====

  async findAllInvoices(params: {
    storeId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { storeId, status, type, startDate, endDate, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          store: true,
          customer: true,
          invoiceItems: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        store: true,
        customer: true,
        invoiceItems: {
          include: { product: true },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const invoiceNumber = dto.invoiceNumber || `INV-${Date.now().toString(36).toUpperCase()}`;

    let subtotal = 0;
    let taxAmount = 0;

    const items = dto.items.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemTaxRate = item.taxRate ?? 20;
      const itemTaxAmount = itemSubtotal * (itemTaxRate / 100);
      const itemTotal = itemSubtotal + itemTaxAmount;

      subtotal += itemSubtotal;
      taxAmount += itemTaxAmount;

      return {
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: itemTaxRate,
        subtotal: itemSubtotal,
        total: itemTotal,
      };
    });

    const totalAmount = subtotal + taxAmount;

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        storeId: dto.storeId,
        customerId: dto.customerId,
        type: dto.type,
        subtotal,
        taxAmount,
        totalAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes,
        invoiceItems: {
          create: items,
        },
      },
      include: {
        invoiceItems: true,
      },
    });
  }

  async updateInvoiceStatus(id: string, status: string) {
    const validStatuses = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const updateData: any = { status };
    if (status === 'PAID') {
      updateData.paidAt = new Date();
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { invoiceItems: true },
    });
  }

  // ===== Expenses =====

  async findAllExpenses(params: {
    storeId?: string;
    status?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { storeId, status, categoryId, startDate, endDate, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: { store: true },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createExpense(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        storeId: dto.storeId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency || 'TRY',
        date: dto.date ? new Date(dto.date) : new Date(),
        receiptUrl: dto.receiptUrl,
      },
      include: { store: true },
    });
  }

  async updateExpenseStatus(id: string, status: string, approvedBy?: string) {
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');

    return this.prisma.expense.update({
      where: { id },
      data: {
        status,
        approvedBy: status === 'APPROVED' ? approvedBy : null,
      },
      include: { store: true },
    });
  }

  async createInvoiceFromOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true } },
        store: true,
        user: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { notes: `orderId:${orderId}` },
    });
    if (existingInvoice) return existingInvoice;

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const storePrefix = order.storeId.slice(0, 4).toUpperCase();
    const invoiceCount = await this.prisma.invoice.count({
      where: { storeId: order.storeId, createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) } },
    });
    const invoiceNumber = `INV-${storePrefix}-${dateStr}-${String(invoiceCount + 1).padStart(4, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;

    const items = order.orderItems.map((item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      const itemTaxRate = (item as any).product?.vatRate ?? 20;
      const itemTaxAmount = itemSubtotal * (itemTaxRate / 100);

      subtotal += itemSubtotal;
      taxAmount += itemTaxAmount;

      return {
        productId: item.productId,
        description: (item as any).product?.name || 'Ürün',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: itemTaxRate,
        subtotal: itemSubtotal,
        total: itemSubtotal + itemTaxAmount,
      };
    });

    const totalAmount = subtotal + taxAmount - order.discountAmount;

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        storeId: order.storeId,
        customerId: order.userId,
        type: 'SALES',
        status: 'PAID',
        subtotal,
        taxAmount,
        totalAmount: Math.max(0, totalAmount),
        paidAt: new Date(),
        notes: `orderId:${orderId}`,
        invoiceItems: { create: items },
      },
      include: { invoiceItems: true },
    });
  }

  // ===== Reports =====

  async getTaxReport(params: { storeId?: string; year: number; month?: number }) {
    const { storeId, year, month } = params;

    const startDate = new Date(year, month ? month - 1 : 0, 1);
    const endDate = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year + 1, 0, 0, 23, 59, 59);

    const where: any = {
      createdAt: { gte: startDate, lte: endDate },
      status: { not: 'CANCELLED' },
    };
    if (storeId) where.storeId = storeId;

    const invoices = await this.prisma.invoice.findMany({
      where,
      select: {
        type: true,
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
      },
    });

    let salesSubtotal = 0;
    let salesTax = 0;
    let purchaseSubtotal = 0;
    let purchaseTax = 0;

    for (const invoice of invoices) {
      if (invoice.type === 'SALES') {
        salesSubtotal += invoice.subtotal;
        salesTax += invoice.taxAmount;
      } else if (invoice.type === 'PURCHASE') {
        purchaseSubtotal += invoice.subtotal;
        purchaseTax += invoice.taxAmount;
      }
    }

    return {
      period: { year, month: month || 'all' },
      sales: { subtotal: salesSubtotal, tax: salesTax },
      purchases: { subtotal: purchaseSubtotal, tax: purchaseTax },
      netTax: salesTax - purchaseTax,
    };
  }

  async getSummary(params: { storeId?: string; startDate?: string; endDate?: string }) {
    const { storeId, startDate, endDate } = params;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const invoiceWhere: any = {
      status: { not: 'CANCELLED' },
    };
    if (storeId) invoiceWhere.storeId = storeId;
    if (Object.keys(dateFilter).length) invoiceWhere.createdAt = dateFilter;

    const expenseWhere: any = {
      status: 'APPROVED',
    };
    if (storeId) expenseWhere.storeId = storeId;
    if (Object.keys(dateFilter).length) expenseWhere.date = dateFilter;

    const [invoices, expenses] = await Promise.all([
      this.prisma.invoice.findMany({
        where: invoiceWhere,
        select: { type: true, totalAmount: true },
      }),
      this.prisma.expense.findMany({
        where: expenseWhere,
        select: { amount: true },
      }),
    ]);

    let revenue = 0;
    let purchases = 0;
    for (const invoice of invoices) {
      if (invoice.type === 'SALES') revenue += invoice.totalAmount;
      else if (invoice.type === 'PURCHASE') purchases += invoice.totalAmount;
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - totalExpenses - purchases;

    return {
      revenue,
      purchases,
      expenses: totalExpenses,
      profit,
      period: { startDate: startDate || 'all', endDate: endDate || 'now' },
    };
  }
}
