import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WarehouseManagementService } from '../warehouse-management.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';

describe('WarehouseManagementService', () => {
  let service: WarehouseManagementService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseManagementService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(WarehouseManagementService);
  });

  describe('findOne', () => {
    it('should return a warehouse', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse', company: {}, warehouseStocks: [], _count: {} };
      prisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);

      const result = await service.findOne('wh-1');

      expect(result).toEqual(mockWarehouse);
    });

    it('should throw NotFoundException if warehouse not found', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createZone', () => {
    it('should create a zone in a warehouse', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      const mockZone = { id: 'zone-1', warehouseId: 'wh-1', name: 'Zone A', code: 'ZA-01' };

      prisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      prisma.warehouseZone.create.mockResolvedValue(mockZone);

      const result = await service.createZone('wh-1', {
        name: 'Zone A',
        code: 'ZA-01',
        floor: 1,
        capacity: 100,
      });

      expect(result).toEqual(mockZone);
      expect(prisma.warehouseZone.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            warehouseId: 'wh-1',
            name: 'Zone A',
            code: 'ZA-01',
          }),
        }),
      );
    });

    it('should throw NotFoundException if warehouse not found', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);

      await expect(service.createZone('nonexistent', { name: 'Zone A', code: 'ZA-01' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTransfer', () => {
    it('should throw BadRequestException when source and target warehouse are the same', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      prisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);

      await expect(
        service.createTransfer('wh-1', {
          productId: 'prod-1',
          toWarehouseId: 'wh-1',
          quantity: 10,
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if source warehouse not found', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);

      await expect(
        service.createTransfer('nonexistent', {
          productId: 'prod-1',
          toWarehouseId: 'wh-2',
          quantity: 10,
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if target warehouse not found', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      prisma.warehouse.findUnique
        .mockResolvedValueOnce(mockWarehouse) // source warehouse
        .mockResolvedValueOnce(null); // target warehouse

      await expect(
        service.createTransfer('wh-1', {
          productId: 'prod-1',
          toWarehouseId: 'nonexistent',
          quantity: 10,
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      const mockTargetWarehouse = { id: 'wh-2', name: 'Target Warehouse' };
      const mockSourceStock = { warehouseId: 'wh-1', productId: 'prod-1', quantity: 5 };

      prisma.warehouse.findUnique
        .mockResolvedValueOnce(mockWarehouse)
        .mockResolvedValueOnce(mockTargetWarehouse);
      prisma.warehouseStock.findUnique.mockResolvedValue(mockSourceStock);

      await expect(
        service.createTransfer('wh-1', {
          productId: 'prod-1',
          toWarehouseId: 'wh-2',
          quantity: 10,
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no source stock exists', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      const mockTargetWarehouse = { id: 'wh-2', name: 'Target Warehouse' };

      prisma.warehouse.findUnique
        .mockResolvedValueOnce(mockWarehouse)
        .mockResolvedValueOnce(mockTargetWarehouse);
      prisma.warehouseStock.findUnique.mockResolvedValue(null);

      await expect(
        service.createTransfer('wh-1', {
          productId: 'prod-1',
          toWarehouseId: 'wh-2',
          quantity: 10,
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a transfer transactionally', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      const mockTargetWarehouse = { id: 'wh-2', name: 'Target Warehouse' };
      const mockSourceStock = { warehouseId: 'wh-1', productId: 'prod-1', quantity: 50 };
      const mockTransfer = {
        id: 'trf-1',
        transferNumber: 'TRF-001',
        fromWarehouseId: 'wh-1',
        toWarehouseId: 'wh-2',
        productId: 'prod-1',
        quantity: 10,
        status: 'IN_TRANSIT',
        fromWarehouse: { id: 'wh-1', name: 'Main Warehouse' },
        toWarehouse: { id: 'wh-2', name: 'Target Warehouse' },
        product: { id: 'prod-1', name: 'Product A', sku: 'SKU-001' },
      };

      prisma.warehouse.findUnique
        .mockResolvedValueOnce(mockWarehouse)
        .mockResolvedValueOnce(mockTargetWarehouse);
      prisma.warehouseStock.findUnique.mockResolvedValue(mockSourceStock);

      prisma.warehouseStock.update.mockResolvedValue({});
      prisma.warehouseStock.upsert.mockResolvedValue({});
      prisma.warehouseTransfer.create.mockResolvedValue(mockTransfer);

      const result = await service.createTransfer('wh-1', {
        productId: 'prod-1',
        toWarehouseId: 'wh-2',
        quantity: 10,
        requestedBy: 'user-1',
      });

      expect(result).toEqual(mockTransfer);
      expect(prisma.warehouseStock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { quantity: { decrement: 10 } },
        }),
      );
      expect(prisma.warehouseStock.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { warehouseId_productId: { warehouseId: 'wh-2', productId: 'prod-1' } },
          create: expect.objectContaining({ quantity: 10 }),
          update: { quantity: { increment: 10 } },
        }),
      );
    });
  });

  describe('createTask', () => {
    it('should create a task in a warehouse', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      const mockTask = {
        id: 'task-1',
        warehouseId: 'wh-1',
        type: 'COUNT',
        title: 'Shelf Count',
        status: 'PENDING',
        zone: null,
      };

      prisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      prisma.warehouseTask.create.mockResolvedValue(mockTask);

      const result = await service.createTask('wh-1', {
        title: 'Shelf Count',
        description: 'Count items on shelf A-01',
      });

      expect(result).toEqual(mockTask);
      expect(prisma.warehouseTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            warehouseId: 'wh-1',
            title: 'Shelf Count',
            status: 'PENDING',
          }),
        }),
      );
    });

    it('should throw NotFoundException if warehouse not found', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);

      await expect(
        service.createTask('nonexistent', { title: 'Task' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if zone not found in warehouse', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      prisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      prisma.warehouseZone.findUnique.mockResolvedValue(null);

      await expect(
        service.createTask('wh-1', { title: 'Task', zoneId: 'zone-nonexistent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if zone belongs to different warehouse', async () => {
      const mockWarehouse = { id: 'wh-1', name: 'Main Warehouse' };
      const mockZone = { id: 'zone-1', warehouseId: 'wh-other', name: 'Zone A' };

      prisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      prisma.warehouseZone.findUnique.mockResolvedValue(mockZone);

      await expect(
        service.createTask('wh-1', { title: 'Task', zoneId: 'zone-1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const mockTask = { id: 'task-1', status: 'PENDING', completedAt: null };
      const updatedTask = { ...mockTask, status: 'IN_PROGRESS' };

      prisma.warehouseTask.findUnique.mockResolvedValue(mockTask);
      prisma.warehouseTask.update.mockResolvedValue(updatedTask);

      const result = await service.updateTaskStatus('task-1', 'IN_PROGRESS');

      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should set completedAt when status is COMPLETED', async () => {
      const mockTask = { id: 'task-1', status: 'IN_PROGRESS', completedAt: null };
      const completedAt = '2024-01-15T12:00:00Z';
      const updatedTask = { ...mockTask, status: 'COMPLETED', completedAt: new Date(completedAt) };

      prisma.warehouseTask.findUnique.mockResolvedValue(mockTask);
      prisma.warehouseTask.update.mockResolvedValue(updatedTask);

      await service.updateTaskStatus('task-1', 'COMPLETED', completedAt);

      expect(prisma.warehouseTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            completedAt: new Date(completedAt),
          }),
        }),
      );
    });

    it('should use current date as completedAt when not provided', async () => {
      const mockTask = { id: 'task-1', status: 'IN_PROGRESS', completedAt: null };
      prisma.warehouseTask.findUnique.mockResolvedValue(mockTask);
      prisma.warehouseTask.update.mockResolvedValue({});

      await service.updateTaskStatus('task-1', 'COMPLETED');

      expect(prisma.warehouseTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should preserve existing completedAt for non-COMPLETED status', async () => {
      const existingDate = new Date('2024-01-01T10:00:00Z');
      const mockTask = { id: 'task-1', status: 'COMPLETED', completedAt: existingDate };
      const updatedTask = { ...mockTask, status: 'CANCELLED', completedAt: existingDate };

      prisma.warehouseTask.findUnique.mockResolvedValue(mockTask);
      prisma.warehouseTask.update.mockResolvedValue(updatedTask);

      await service.updateTaskStatus('task-1', 'CANCELLED');

      expect(prisma.warehouseTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: existingDate,
          }),
        }),
      );
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.updateTaskStatus('task-1', 'INVALID')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if task not found', async () => {
      prisma.warehouseTask.findUnique.mockResolvedValue(null);

      await expect(service.updateTaskStatus('nonexistent', 'COMPLETED')).rejects.toThrow(NotFoundException);
    });
  });
});
