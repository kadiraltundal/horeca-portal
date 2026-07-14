import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';

@Injectable()
export class CustomerServiceService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20, status?: string, priority?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: {
          include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        rating: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  async create(data: CreateTicketDto, userId: string) {
    return this.prisma.supportTicket.create({
      data: {
        subject: data.subject,
        description: data.description,
        category: data.category || 'OTHER',
        priority: data.priority || 'MEDIUM',
        userId,
        storeId: data.storeId,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async update(id: string, data: UpdateTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException('Cannot update a closed ticket');
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async addMessage(id: string, data: AddMessageDto, userId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException('Cannot add message to a closed ticket');
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: userId,
        content: data.content,
        isInternal: data.isInternal || false,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    if (ticket.status === 'OPEN') {
      await this.prisma.supportTicket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return message;
  }

  async closeTicket(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException('Ticket is already closed');
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async rateTicket(id: string, userId: string, rating: number, comment?: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.status !== 'CLOSED') {
      throw new BadRequestException('Can only rate closed tickets');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const existing = await this.prisma.ticketRating.findUnique({ where: { ticketId: id } });
    if (existing) {
      throw new BadRequestException('Ticket already rated');
    }

    return this.prisma.ticketRating.create({
      data: {
        ticketId: id,
        userId,
        rating,
        comment,
      },
    });
  }

  async getStats() {
    const [total, open, inProgress, resolved, closed, byPriority] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
      this.prisma.supportTicket.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
