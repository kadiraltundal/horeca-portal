// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = jest.Mock<any, any>;

const fn = (): MockFn => jest.fn();

export const createPrismaMock = () => {
  const result: Record<string, any> = {
    user: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      delete: fn(),
      count: fn(),
    },
    product: {
      findUnique: fn(),
      findFirst: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      delete: fn(),
      count: fn(),
      groupBy: fn(),
    },
    storeProduct: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      upsert: fn(),
      count: fn(),
      groupBy: fn(),
    },
    order: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
      aggregate: fn(),
      groupBy: fn(),
    },
    orderItem: {
      findMany: fn(),
      create: fn(),
      groupBy: fn(),
    },
    payment: {
      findUnique: fn(),
      create: fn(),
      update: fn(),
    },
    coupon: {
      findUnique: fn(),
      updateMany: fn(),
    },
    brand: {
      findMany: fn(),
      create: fn(),
      update: fn(),
      delete: fn(),
    },
    supplier: {
      findMany: fn(),
      create: fn(),
      update: fn(),
      delete: fn(),
    },
    unit: {
      findMany: fn(),
      create: fn(),
    },
    tag: {
      findMany: fn(),
      create: fn(),
    },
    productTag: {
      create: fn(),
      delete: fn(),
    },
    productImage: {
      create: fn(),
      delete: fn(),
    },
    productVariant: {
      create: fn(),
      update: fn(),
      delete: fn(),
    },
    productQR: {
      findUnique: fn(),
      create: fn(),
    },
    category: {
      findMany: fn(),
      create: fn(),
      update: fn(),
      delete: fn(),
    },
    customer: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
    },
    customerDevice: {
      findUnique: fn(),
      findFirst: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      delete: fn(),
    },
    address: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
    },
    userFavorite: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      delete: fn(),
    },
    promotion: {
      findMany: fn(),
    },
    store: {
      findMany: fn(),
      findUnique: fn(),
      create: fn(),
      update: fn(),
      delete: fn(),
    },
    ecommercePlatform: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
    },
    ecommerceProduct: {
      findUnique: fn(),
      findFirst: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
    },
    ecommerceOrder: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
    },
    ecommerceSyncLog: {
      findMany: fn(),
      create: fn(),
      count: fn(),
    },
    shift: {
      findMany: fn(),
      findUnique: fn(),
      create: fn(),
      update: fn(),
      delete: fn(),
    },
    attendance: {
      findMany: fn(),
      findFirst: fn(),
      create: fn(),
      update: fn(),
    },
    performanceMetric: {
      findMany: fn(),
      create: fn(),
    },
    generatedReport: {
      findMany: fn(),
      create: fn(),
      update: fn(),
    },
    reportTemplate: {
      findMany: fn(),
    },
    refund: {
      aggregate: fn(),
    },
    invoice: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
    },
    expense: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
    },
    warehouse: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
    },
    warehouseZone: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
    },
    warehouseTask: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
    },
    warehouseStock: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      upsert: fn(),
    },
    warehouseTransfer: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      count: fn(),
    },
    supplierPortalUser: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
    },
    supplierMessage: {
      findMany: fn(),
      create: fn(),
      count: fn(),
    },
    purchaseOrder: {
      findUnique: fn(),
      findMany: fn(),
      create: fn(),
      update: fn(),
      count: fn(),
      aggregate: fn(),
    },
    $transaction: fn(),
  };

  // Make $transaction call the callback with the result object (for $transaction(fn) pattern)
  result.$transaction.mockImplementation((fnOrArray: any) => {
    if (typeof fnOrArray === 'function') {
      return fnOrArray(result);
    }
    return Promise.all(Array.isArray(fnOrArray) ? fnOrArray : []);
  });

  return result;
};
