import { IsOptional, IsString, IsDateString } from 'class-validator';

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DashboardStatsDto {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  pendingQuotes: number;
  recentOrders: any[];
  topProducts: any[];

  constructor(partial: Partial<DashboardStatsDto>) {
    Object.assign(this, partial);
  }
}

export class SalesReportDto extends DateRangeDto {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByDay: any[];
  salesByCategory: any[];

  constructor(partial: Partial<SalesReportDto>) {
    super();
    Object.assign(this, partial);
  }
}

export class ProductReportDto {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  topSelling: any[];
  lowStock: any[];

  constructor(partial: Partial<ProductReportDto>) {
    Object.assign(this, partial);
  }
}

export class UserReportDto {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  usersByRole: any[];
  registrationTrend: any[];

  constructor(partial: Partial<UserReportDto>) {
    Object.assign(this, partial);
  }
}

export class ConversionReportDto {
  totalVisitors: number;
  totalOrders: number;
  conversionRate: number;
  quotesToOrders: number;
  cartAbandonment: number;

  constructor(partial: Partial<ConversionReportDto>) {
    Object.assign(this, partial);
  }
}
