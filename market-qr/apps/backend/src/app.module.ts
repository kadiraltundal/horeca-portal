import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { StoresModule } from './modules/stores/stores.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QrModule } from './modules/qr/qr.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BatchesModule } from './modules/batches/batches.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { CustomersModule } from './modules/customers/customers.module';
import { MediaModule } from './modules/media/media.module';
import { CmsModule } from './modules/cms/cms.module';
import { ScanModule } from './modules/scan/scan.module';
import { AuditModule } from './modules/audit/audit.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { StockMovementModule } from './modules/stock-movement/stock-movement.module';
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { RefundModule } from './modules/refund/refund.module';
import { CashDrawerModule } from './modules/cash-drawer/cash-drawer.module';
import { ZReportModule } from './modules/z-report/z-report.module';
import { FinanceModule } from './modules/finance/finance.module';
import { WarehouseManagementModule } from './modules/warehouse-management/warehouse-management.module';
import { StaffModule } from './modules/staff/staff.module';
import { SupplierPortalModule } from './modules/supplier-portal/supplier-portal.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { EcommerceModule } from './modules/ecommerce/ecommerce.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { CustomerServiceModule } from './modules/customer-service/customer-service.module';
import { GiftCardModule } from './modules/gift-card/gift-card.module';
import { PrismaService } from './config/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    StoresModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
    AnalyticsModule,
    NotificationsModule,
    QrModule,
    OrganizationsModule,
    BatchesModule,
    PricingModule,
    PromotionsModule,
    LoyaltyModule,
    CustomersModule,
    MediaModule,
    CmsModule,
    ScanModule,
    AuditModule,
    SchedulerModule,
    DashboardModule,
    SuppliersModule,
    StockMovementModule,
    PurchaseOrderModule,
    RefundModule,
    CashDrawerModule,
    ZReportModule,
    FinanceModule,
    WarehouseManagementModule,
    StaffModule,
    SupplierPortalModule,
    ReportsModule,
    MobileModule,
    EcommerceModule,
    ReturnsModule,
    DeliveryModule,
    CustomerServiceModule,
    GiftCardModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
