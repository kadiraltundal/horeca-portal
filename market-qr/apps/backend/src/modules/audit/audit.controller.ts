import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AuditController {
  constructor(private svc: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Audit log listesi' })
  findAll(
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) { return this.svc.findAll(entity, userId, page ? +page : 1, limit ? +limit : 50); }

  @Get('entity/:entity/:entityId')
  @ApiOperation({ summary: 'Varlık geçmişini getir' })
  findByEntity(@Param('entity') entity: string, @Param('entityId') entityId: string) {
    return this.svc.findByEntity(entity, entityId);
  }
}
