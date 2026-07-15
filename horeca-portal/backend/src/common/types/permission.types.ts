export enum Permission {
  // Products
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_READ = 'products:read',
  PRODUCTS_UPDATE = 'products:update',
  PRODUCTS_DELETE = 'products:delete',

  // Categories
  CATEGORIES_CREATE = 'categories:create',
  CATEGORIES_READ = 'categories:read',
  CATEGORIES_UPDATE = 'categories:update',
  CATEGORIES_DELETE = 'categories:delete',

  // Brands
  BRANDS_CREATE = 'brands:create',
  BRANDS_READ = 'brands:read',
  BRANDS_UPDATE = 'brands:update',
  BRANDS_DELETE = 'brands:delete',

  // Orders
  ORDERS_CREATE = 'orders:create',
  ORDERS_READ = 'orders:read',
  ORDERS_UPDATE = 'orders:update',
  ORDERS_DELETE = 'orders:delete',

  // Payments
  PAYMENTS_CREATE = 'payments:create',
  PAYMENTS_READ = 'payments:read',
  PAYMENTS_UPDATE = 'payments:update',

  // Quotes
  QUOTES_CREATE = 'quotes:create',
  QUOTES_READ = 'quotes:read',
  QUOTES_UPDATE = 'quotes:update',
  QUOTES_DELETE = 'quotes:delete',

  // Vendors
  VENDORS_CREATE = 'vendors:create',
  VENDORS_READ = 'vendors:read',
  VENDORS_UPDATE = 'vendors:update',
  VENDORS_DELETE = 'vendors:delete',
  VENDORS_APPROVE = 'vendors:approve',

  // Campaigns
  CAMPAIGNS_CREATE = 'campaigns:create',
  CAMPAIGNS_READ = 'campaigns:read',
  CAMPAIGNS_UPDATE = 'campaigns:update',
  CAMPAIGNS_DELETE = 'campaigns:delete',

  // Users
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Reports
  REPORTS_READ = 'reports:read',

  // Notifications
  NOTIFICATIONS_READ = 'notifications:read',
  NOTIFICATIONS_SEND = 'notifications:send',

  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',

  // Favorites
  FAVORITES_READ = 'favorites:read',
  FAVORITES_CREATE = 'favorites:create',
  FAVORITES_DELETE = 'favorites:delete',

  // Search
  SEARCH_READ = 'search:read',

  // Import
  IMPORT_CREATE = 'import:create',
  IMPORT_READ = 'import:read',

  // Recommendations
  RECOMMENDATIONS_READ = 'recommendations:read',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(Permission),
  manager: [
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_UPDATE,
    Permission.CATEGORIES_READ,
    Permission.BRANDS_READ,
    Permission.ORDERS_READ,
    Permission.ORDERS_UPDATE,
    Permission.PAYMENTS_READ,
    Permission.PAYMENTS_UPDATE,
    Permission.QUOTES_READ,
    Permission.QUOTES_UPDATE,
    Permission.VENDORS_READ,
    Permission.VENDORS_APPROVE,
    Permission.CAMPAIGNS_READ,
    Permission.CAMPAIGNS_UPDATE,
    Permission.USERS_READ,
    Permission.REPORTS_READ,
    Permission.NOTIFICATIONS_READ,
    Permission.NOTIFICATIONS_SEND,
    Permission.IMPORT_READ,
    Permission.IMPORT_CREATE,
    Permission.RECOMMENDATIONS_READ,
  ],
  vendor: [
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_CREATE,
    Permission.PRODUCTS_UPDATE,
    Permission.PRODUCTS_DELETE,
    Permission.ORDERS_READ,
    Permission.QUOTES_READ,
    Permission.CAMPAIGNS_READ,
    Permission.NOTIFICATIONS_READ,
    Permission.REPORTS_READ,
    Permission.RECOMMENDATIONS_READ,
  ],
  supplier: [
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_CREATE,
    Permission.PRODUCTS_UPDATE,
    Permission.ORDERS_READ,
    Permission.QUOTES_READ,
    Permission.NOTIFICATIONS_READ,
    Permission.RECOMMENDATIONS_READ,
  ],
  customer: [
    Permission.PRODUCTS_READ,
    Permission.CATEGORIES_READ,
    Permission.BRANDS_READ,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_READ,
    Permission.PAYMENTS_CREATE,
    Permission.PAYMENTS_READ,
    Permission.QUOTES_CREATE,
    Permission.QUOTES_READ,
    Permission.FAVORITES_READ,
    Permission.FAVORITES_CREATE,
    Permission.FAVORITES_DELETE,
    Permission.CAMPAIGNS_READ,
    Permission.NOTIFICATIONS_READ,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.SEARCH_READ,
    Permission.RECOMMENDATIONS_READ,
  ],
};
