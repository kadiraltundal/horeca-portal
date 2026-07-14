import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // Banners
  async findAllBanners(position?: string) {
    const where: any = { isActive: true };
    if (position) where.position = position;
    return this.prisma.cmsBanner.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }
  async createBanner(data: any) { return this.prisma.cmsBanner.create({ data }); }
  async updateBanner(id: string, data: any) { return this.prisma.cmsBanner.update({ where: { id }, data }); }
  async removeBanner(id: string) { return this.prisma.cmsBanner.delete({ where: { id } }); }

  // Pages
  async findPage(slug: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }
  async findAllPages() { return this.prisma.cmsPage.findMany({ orderBy: { createdAt: 'desc' } }); }
  async createPage(data: any) { return this.prisma.cmsPage.create({ data }); }
  async updatePage(id: string, data: any) { return this.prisma.cmsPage.update({ where: { id }, data }); }
  async removePage(id: string) { return this.prisma.cmsPage.delete({ where: { id } }); }

  // Blog
  async findBlog(slug: string) {
    const blog = await this.prisma.cmsBlog.findUnique({ where: { slug } });
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }
  async findAllBlogs() { return this.prisma.cmsBlog.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }); }
  async createBlog(data: any) { return this.prisma.cmsBlog.create({ data }); }
  async updateBlog(id: string, data: any) { return this.prisma.cmsBlog.update({ where: { id }, data }); }
  async removeBlog(id: string) { return this.prisma.cmsBlog.delete({ where: { id } }); }

  // FAQ
  async findAllFaq(category?: string) {
    const where: any = { isActive: true };
    if (category) where.category = category;
    return this.prisma.cmsFaq.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }
  async createFaq(data: any) { return this.prisma.cmsFaq.create({ data }); }
  async updateFaq(id: string, data: any) { return this.prisma.cmsFaq.update({ where: { id }, data }); }
  async removeFaq(id: string) { return this.prisma.cmsFaq.delete({ where: { id } }); }

  // Announcements
  async findAllAnnouncements() {
    return this.prisma.cmsAnnouncement.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  }
  async createAnnouncement(data: any) { return this.prisma.cmsAnnouncement.create({ data }); }
  async updateAnnouncement(id: string, data: any) { return this.prisma.cmsAnnouncement.update({ where: { id }, data }); }
  async removeAnnouncement(id: string) { return this.prisma.cmsAnnouncement.delete({ where: { id } }); }
}
