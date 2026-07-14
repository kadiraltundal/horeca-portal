import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private svc: CmsService) {}

  @Get('banners')
  @Public()
  findAllBanners(@Query('position') position?: string) { return this.svc.findAllBanners(position); }
  @Post('banners')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  createBanner(@Body() body: any) { return this.svc.createBanner(body); }
  @Put('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  updateBanner(@Param('id') id: string, @Body() body: any) { return this.svc.updateBanner(id, body); }
  @Delete('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  removeBanner(@Param('id') id: string) { return this.svc.removeBanner(id); }

  @Get('pages')
  @Public()
  findAllPages() { return this.svc.findAllPages(); }
  @Get('pages/:slug')
  @Public()
  findPage(@Param('slug') slug: string) { return this.svc.findPage(slug); }
  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  createPage(@Body() body: any) { return this.svc.createPage(body); }
  @Put('pages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  updatePage(@Param('id') id: string, @Body() body: any) { return this.svc.updatePage(id, body); }
  @Delete('pages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  removePage(@Param('id') id: string) { return this.svc.removePage(id); }

  @Get('blog')
  @Public()
  findAllBlogs() { return this.svc.findAllBlogs(); }
  @Get('blog/:slug')
  @Public()
  findBlog(@Param('slug') slug: string) { return this.svc.findBlog(slug); }
  @Post('blog')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  createBlog(@Body() body: any) { return this.svc.createBlog(body); }
  @Put('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  updateBlog(@Param('id') id: string, @Body() body: any) { return this.svc.updateBlog(id, body); }
  @Delete('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  removeBlog(@Param('id') id: string) { return this.svc.removeBlog(id); }

  @Get('faq')
  @Public()
  findAllFaq(@Query('category') category?: string) { return this.svc.findAllFaq(category); }
  @Post('faq')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  createFaq(@Body() body: any) { return this.svc.createFaq(body); }
  @Put('faq/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  updateFaq(@Param('id') id: string, @Body() body: any) { return this.svc.updateFaq(id, body); }
  @Delete('faq/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  removeFaq(@Param('id') id: string) { return this.svc.removeFaq(id); }

  @Get('announcements')
  @Public()
  findAllAnnouncements() { return this.svc.findAllAnnouncements(); }
  @Post('announcements')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  createAnnouncement(@Body() body: any) { return this.svc.createAnnouncement(body); }
  @Put('announcements/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  updateAnnouncement(@Param('id') id: string, @Body() body: any) { return this.svc.updateAnnouncement(id, body); }
  @Delete('announcements/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') @ApiBearerAuth()
  removeAnnouncement(@Param('id') id: string) { return this.svc.removeAnnouncement(id); }
}
