import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Quote, QuoteStatus } from '../quotes/entities/quote.entity';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
  ) {}

  async getDashboard() {
    const totalOrders = await this.orderRepository.count();
    const totalProducts = await this.productRepository.count();
    const totalUsers = await this.userRepository.count();
    const totalRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'sum')
      .where('order.status != :status', { status: OrderStatus.CANCELLED })
      .getRawOne();

    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
    });

    const completedOrders = await this.orderRepository.count({
      where: { status: OrderStatus.DELIVERED },
    });

    return {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: parseFloat(totalRevenue.sum) || 0,
      pendingOrders,
      completedOrders,
    };
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    const query = this.orderRepository.createQueryBuilder('order');

    if (startDate) {
      query.andWhere('order.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('order.created_at <= :endDate', { endDate });
    }

    const sales = await query
      .select('DATE(order.created_at)', 'date')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total_amount)', 'totalAmount')
      .groupBy('DATE(order.created_at)')
      .orderBy('date', 'DESC')
      .getRawMany();

    return sales;
  }

  async getProductReport() {
    const topProducts = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'items')
      .select('items.product_name', 'productName')
      .addSelect('SUM(items.quantity)', 'totalQuantity')
      .addSelect('SUM(items.total_price)', 'totalRevenue')
      .groupBy('items.product_name')
      .orderBy('totalQuantity', 'DESC')
      .limit(10)
      .getRawMany();

    return topProducts;
  }

  async getUserReport() {
    const topUsers = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total_amount)', 'totalSpent')
      .groupBy('user.id')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .orderBy('totalSpent', 'DESC')
      .limit(10)
      .getRawMany();

    return topUsers;
  }

  async getConversionRate() {
    const totalQuotes = await this.quoteRepository.count();
    const convertedQuotes = await this.quoteRepository.count({
      where: { status: QuoteStatus.COMPLETED },
    });

    const conversionRate = totalQuotes > 0
      ? (convertedQuotes / totalQuotes) * 100
      : 0;

    return {
      totalQuotes,
      convertedQuotes,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }
}
