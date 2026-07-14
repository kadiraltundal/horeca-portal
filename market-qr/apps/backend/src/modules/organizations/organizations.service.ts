import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  // Company
  async findAllCompanies() {
    return this.prisma.company.findMany({
      include: {
        _count: { select: { regions: true, warehouses: true, users: true } },
      },
    });
  }

  async findCompany(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { regions: true, warehouses: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async createCompany(data: { name: string; taxNumber?: string; address?: string; phone?: string; email?: string }) {
    return this.prisma.company.create({ data });
  }

  async updateCompany(id: string, data: any) {
    await this.findCompany(id);
    return this.prisma.company.update({ where: { id }, data });
  }

  // Region
  async findAllRegions(companyId?: string) {
    const where = companyId ? { companyId } : {};
    return this.prisma.region.findMany({
      where,
      include: { _count: { select: { stores: true } } },
    });
  }

  async createRegion(data: { companyId: string; name: string }) {
    return this.prisma.region.create({ data });
  }

  async updateRegion(id: string, data: any) {
    return this.prisma.region.update({ where: { id }, data });
  }

  async removeRegion(id: string) {
    return this.prisma.region.delete({ where: { id } });
  }

  // Warehouse
  async findAllWarehouses(companyId?: string) {
    const where = companyId ? { companyId } : {};
    return this.prisma.warehouse.findMany({
      where,
      include: { _count: { select: { batches: true, warehouseStocks: true } } },
    });
  }

  async findWarehouse(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { warehouseStocks: { include: { warehouse: true } } },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async createWarehouse(data: { companyId: string; name: string; address?: string; phone?: string }) {
    return this.prisma.warehouse.create({ data });
  }

  async updateWarehouse(id: string, data: any) {
    await this.findWarehouse(id);
    return this.prisma.warehouse.update({ where: { id }, data });
  }

  async removeWarehouse(id: string) {
    return this.prisma.warehouse.delete({ where: { id } });
  }
}
