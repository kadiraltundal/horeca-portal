import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CheckInDto, CheckOutDto } from './dto/check-in-out.dto';
import { CreatePerformanceDto } from './dto/create-performance.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  // ===== Shifts =====

  async findShifts(query: { storeId?: string; date?: string }) {
    const where: Prisma.ShiftWhereInput = {};

    if (query.storeId) {
      where.storeId = query.storeId;
    }

    if (query.date) {
      const date = new Date(query.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.startTime = { gte: startOfDay, lte: endOfDay };
    }

    return this.prisma.shift.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async createShift(data: CreateShiftDto) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      throw new BadRequestException('Bitiş zamanı başlangıç zamanından sonra olmalıdır');
    }

    return this.prisma.shift.create({
      data: {
        storeId: data.storeId,
        userId: data.userId,
        startTime: start,
        endTime: end,
        notes: data.notes,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, name: true } },
      },
    });
  }

  async updateShift(id: string, data: Partial<CreateShiftDto>) {
    const existing = await this.prisma.shift.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vardiya bulunamadı');

    const updateData: Prisma.ShiftUpdateInput = {};
    if (data.storeId) updateData.store = { connect: { id: data.storeId } };
    if (data.userId) updateData.user = { connect: { id: data.userId } };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, name: true } },
      },
    });
  }

  async deleteShift(id: string) {
    const existing = await this.prisma.shift.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vardiya bulunamadı');

    await this.prisma.shift.delete({ where: { id } });
    return { message: 'Vardiya başarıyla silindi' };
  }

  // ===== Attendance =====

  async findAttendance(storeId: string) {
    return this.prisma.attendance.findMany({
      where: { storeId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async checkIn(data: CheckInDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId: data.userId,
        storeId: data.storeId,
        date: { gte: today, lt: tomorrow },
      },
    });

    if (existing) {
      throw new BadRequestException('Bugün zaten check-in yapılmış');
    }

    return this.prisma.attendance.create({
      data: {
        userId: data.userId,
        storeId: data.storeId,
        checkIn: new Date(),
        notes: data.notes,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, name: true } },
      },
    });
  }

  async checkOut(data: CheckOutDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId: data.userId,
        storeId: data.storeId,
        date: { gte: today, lt: tomorrow },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Bugün check-in kaydı bulunamadı');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Bugün zaten check-out yapılmış');
    }

    const now = new Date();
    const hoursWorked = (now.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        notes: data.notes || attendance.notes,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, name: true } },
      },
    });
  }

  // ===== Performance =====

  async findPerformance(query: { storeId?: string; userId?: string; metricType?: string; period?: string }) {
    const where: Prisma.PerformanceMetricWhereInput = {};

    if (query.storeId) where.storeId = query.storeId;
    if (query.userId) where.userId = query.userId;
    if (query.metricType) where.metricType = query.metricType;
    if (query.period) where.period = query.period;

    return this.prisma.performanceMetric.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPerformance(data: CreatePerformanceDto) {
    return this.prisma.performanceMetric.create({
      data: {
        userId: data.userId,
        storeId: data.storeId,
        metricType: data.metricType,
        value: data.value,
        period: data.period,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: { select: { id: true, name: true } },
      },
    });
  }
}
