import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Quote, QuoteStatus } from '../quotes/entities/quote.entity';
import { Category } from '../categories/entities/category.entity';

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
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
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

    const pendingQuotes = await this.quoteRepository.count({
      where: { status: QuoteStatus.PENDING },
    });

    const totalPayments = await this.paymentRepository.count({
      where: { status: PaymentStatus.COMPLETED },
    });

    const recentOrders = await this.orderRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const topProducts = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'items')
      .select('items.product_name', 'productName')
      .addSelect('SUM(items.quantity)', 'totalQuantity')
      .addSelect('SUM(items.total_price)', 'totalRevenue')
      .groupBy('items.product_name')
      .orderBy('totalQuantity', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: parseFloat(totalRevenue?.sum) || 0,
      pendingOrders,
      completedOrders,
      pendingQuotes,
      totalPayments,
      recentOrders,
      topProducts,
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

    const totalSales = sales.reduce((sum, item) => sum + parseFloat(item.totalAmount || '0'), 0);
    const totalOrders = sales.reduce((sum, item) => sum + parseInt(item.orderCount || '0'), 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const salesByCategory = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'items')
      .innerJoin('items.product', 'product')
      .innerJoin('product.category', 'category')
      .select('category.name', 'categoryName')
      .addSelect('SUM(items.total_price)', 'totalSales')
      .groupBy('category.name')
      .orderBy('totalSales', 'DESC')
      .getRawMany();

    return {
      totalSales,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      salesByDay: sales,
      salesByCategory,
    };
  }

  async getProductReport() {
    const totalProducts = await this.productRepository.count();
    const activeProducts = await this.productRepository.count({ where: { isActive: true } });

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

    const lowStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold: 10 })
      .andWhere('product.isActive = :active', { active: true })
      .select(['product.id', 'product.name', 'product.sku', 'product.stock'])
      .orderBy('product.stock', 'ASC')
      .limit(10)
      .getMany();

    return {
      totalProducts,
      activeProducts,
      outOfStock: totalProducts - activeProducts,
      topSelling: topProducts,
      lowStock,
    };
  }

  async getUserReport() {
    const totalUsers = await this.userRepository.count();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :date', { date: thirtyDaysAgo })
      .getCount();

    const activeUsers = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.orders', 'order')
      .select('DISTINCT user.id')
      .getCount();

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const registrationTrend = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.created_at)', 'date')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('DATE(user.created_at)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

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

    return {
      totalUsers,
      newUsers,
      activeUsers,
      usersByRole,
      registrationTrend,
      topUsers,
    };
  }

  async getConversionRate() {
    const totalQuotes = await this.quoteRepository.count();
    const convertedQuotes = await this.quoteRepository.count({
      where: { status: QuoteStatus.COMPLETED },
    });

    const totalOrders = await this.orderRepository.count();
    const totalCarts = totalOrders * 1.5; // Estimate based on typical conversion

    const conversionRate = totalQuotes > 0
      ? (convertedQuotes / totalQuotes) * 100
      : 0;

    const quotesToOrders = totalQuotes > 0
      ? (totalOrders / totalQuotes) * 100
      : 0;

    const cartAbandonment = totalCarts > 0
      ? ((totalCarts - totalOrders) / totalCarts) * 100
      : 0;

    return {
      totalVisitors: totalCarts,
      totalOrders,
      conversionRate: Math.round(conversionRate * 100) / 100,
      quotesToOrders: Math.round(quotesToOrders * 100) / 100,
      cartAbandonment: Math.round(cartAbandonment * 100) / 100,
      totalQuotes,
      convertedQuotes,
    };
  }
}
