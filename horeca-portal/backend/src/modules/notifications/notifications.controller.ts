import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { Permission } from '../../common/types/permission.types';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions(Permission.NOTIFICATIONS_READ)
  findAll(
    @Request() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findByUser(
      req.user.id,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  @RequirePermissions(Permission.NOTIFICATIONS_READ)
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Put(':id/read')
  @RequirePermissions(Permission.NOTIFICATIONS_READ)
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  @RequirePermissions(Permission.NOTIFICATIONS_READ)
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
