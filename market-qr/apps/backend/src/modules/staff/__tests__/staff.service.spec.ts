import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StaffService } from '../staff.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';

describe('StaffService', () => {
  let service: StaffService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(StaffService);
  });

  describe('findShifts', () => {
    it('should return shifts with user and store info', async () => {
      const shifts = [
        {
          id: 'shift-1',
          storeId: 'store-123',
          userId: 'user-123',
          startTime: new Date('2026-07-09T08:00:00.000Z'),
          endTime: new Date('2026-07-09T17:00:00.000Z'),
          user: { id: 'user-123', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
          store: { id: 'store-123', name: 'Test Store' },
        },
      ];
      prisma.shift.findMany.mockResolvedValue(shifts);

      const result = await service.findShifts({});

      expect(result).toEqual(shifts);
      expect(prisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: expect.any(Object),
            store: expect.any(Object),
          }),
        }),
      );
    });

    it('should filter by storeId', async () => {
      prisma.shift.findMany.mockResolvedValue([]);

      await service.findShifts({ storeId: 'store-123' });

      const callArgs = prisma.shift.findMany.mock.calls[0][0];
      expect(callArgs.where.storeId).toBe('store-123');
    });

    it('should filter by date', async () => {
      prisma.shift.findMany.mockResolvedValue([]);

      await service.findShifts({ date: '2026-07-09' });

      const callArgs = prisma.shift.findMany.mock.calls[0][0];
      expect(callArgs.where.startTime).toEqual({
        gte: expect.any(Date),
        lte: expect.any(Date),
      });
    });
  });

  describe('createShift', () => {
    it('should create a shift when endTime > startTime', async () => {
      const shiftData = {
        storeId: 'store-123',
        userId: 'user-123',
        startTime: '2026-07-09T08:00:00.000Z',
        endTime: '2026-07-09T17:00:00.000Z',
      };
      const createdShift = {
        id: 'shift-1',
        ...shiftData,
        startTime: new Date(shiftData.startTime),
        endTime: new Date(shiftData.endTime),
        user: { id: 'user-123', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        store: { id: 'store-123', name: 'Test Store' },
      };
      prisma.shift.create.mockResolvedValue(createdShift);

      const result = await service.createShift(shiftData);

      expect(result).toEqual(createdShift);
      expect(prisma.shift.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            storeId: 'store-123',
            userId: 'user-123',
          }),
        }),
      );
    });

    it('should throw BadRequestException when endTime <= startTime', async () => {
      const shiftData = {
        storeId: 'store-123',
        userId: 'user-123',
        startTime: '2026-07-09T17:00:00.000Z',
        endTime: '2026-07-09T08:00:00.000Z',
      };

      await expect(service.createShift(shiftData)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when endTime equals startTime', async () => {
      const shiftData = {
        storeId: 'store-123',
        userId: 'user-123',
        startTime: '2026-07-09T08:00:00.000Z',
        endTime: '2026-07-09T08:00:00.000Z',
      };

      await expect(service.createShift(shiftData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateShift', () => {
    it('should update an existing shift', async () => {
      const existingShift = { id: 'shift-1', storeId: 'store-123', userId: 'user-123' };
      prisma.shift.findUnique.mockResolvedValue(existingShift);
      prisma.shift.update.mockResolvedValue({ ...existingShift, notes: 'Updated notes' });

      const result = await service.updateShift('shift-1', { notes: 'Updated notes' });

      expect(result.notes).toBe('Updated notes');
    });

    it('should throw NotFoundException when shift not found', async () => {
      prisma.shift.findUnique.mockResolvedValue(null);

      await expect(service.updateShift('nonexistent', { notes: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteShift', () => {
    it('should delete an existing shift', async () => {
      const existingShift = { id: 'shift-1', storeId: 'store-123' };
      prisma.shift.findUnique.mockResolvedValue(existingShift);
      prisma.shift.delete.mockResolvedValue(existingShift);

      const result = await service.deleteShift('shift-1');

      expect(result).toEqual({ message: 'Vardiya başarıyla silindi' });
    });

    it('should throw NotFoundException when shift not found', async () => {
      prisma.shift.findUnique.mockResolvedValue(null);

      await expect(service.deleteShift('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkIn', () => {
    it('should create attendance record when no check-in exists', async () => {
      prisma.attendance.findFirst.mockResolvedValue(null);
      const created = {
        id: 'att-1',
        userId: 'user-123',
        storeId: 'store-123',
        checkIn: new Date(),
        user: { id: 'user-123', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        store: { id: 'store-123', name: 'Test Store' },
      };
      prisma.attendance.create.mockResolvedValue(created);

      const result = await service.checkIn({ userId: 'user-123', storeId: 'store-123' });

      expect(result).toEqual(created);
      expect(prisma.attendance.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when already checked in today', async () => {
      prisma.attendance.findFirst.mockResolvedValue({
        id: 'att-existing',
        userId: 'user-123',
        storeId: 'store-123',
        checkIn: new Date(),
      });

      await expect(
        service.checkIn({ userId: 'user-123', storeId: 'store-123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkOut', () => {
    it('should update attendance with checkOut and hoursWorked', async () => {
      const checkInTime = new Date(Date.now() - 8 * 60 * 60 * 1000);
      prisma.attendance.findFirst.mockResolvedValue({
        id: 'att-1',
        userId: 'user-123',
        storeId: 'store-123',
        checkIn: checkInTime,
        checkOut: null,
        notes: 'old notes',
      });
      const updated = {
        id: 'att-1',
        checkOut: new Date(),
        hoursWorked: 8.0,
        notes: 'new notes',
      };
      prisma.attendance.update.mockResolvedValue(updated);

      const result = await service.checkOut({
        userId: 'user-123',
        storeId: 'store-123',
        notes: 'new notes',
      });

      expect(result.hoursWorked).toBe(8.0);
      expect(result.notes).toBe('new notes');
    });

    it('should throw NotFoundException when no check-in record found', async () => {
      prisma.attendance.findFirst.mockResolvedValue(null);

      await expect(
        service.checkOut({ userId: 'user-123', storeId: 'store-123' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already checked out', async () => {
      prisma.attendance.findFirst.mockResolvedValue({
        id: 'att-1',
        userId: 'user-123',
        storeId: 'store-123',
        checkIn: new Date(),
        checkOut: new Date(),
        notes: null,
      });

      await expect(
        service.checkOut({ userId: 'user-123', storeId: 'store-123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPerformance', () => {
    it('should create a performance metric', async () => {
      const perfData = {
        userId: 'user-123',
        storeId: 'store-123',
        metricType: 'SALES',
        value: 95.5,
        period: 'DAILY',
        startDate: '2026-07-09T00:00:00.000Z',
        endDate: '2026-07-09T23:59:59.999Z',
      };
      const created = {
        id: 'perf-1',
        ...perfData,
        startDate: new Date(perfData.startDate),
        endDate: new Date(perfData.endDate),
        user: { id: 'user-123', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        store: { id: 'store-123', name: 'Test Store' },
      };
      prisma.performanceMetric.create.mockResolvedValue(created);

      const result = await service.createPerformance(perfData);

      expect(result).toEqual(created);
      expect(result.metricType).toBe('SALES');
      expect(result.value).toBe(95.5);
    });
  });
});
