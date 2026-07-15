import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Public()
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Put(':key')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.SETTINGS_UPDATE)
  setValue(
    @Param('key') key: string,
    @Body() body: { value: string; description?: string },
  ) {
    return this.settingsService.setValue(key, body.value, body.description);
  }
}
