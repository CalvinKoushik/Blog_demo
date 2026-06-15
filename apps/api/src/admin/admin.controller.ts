import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { RemovePostDto } from './dto/remove-post.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // USER MANAGEMENT ENDPOINTS
  @Get('users')
  async listUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.adminService.listUsers(page, limit);
  }

  @Get('users/:id')
  async getUser(@Param('id') userId: string) {
    return this.adminService.getUser(userId);
  }

  @Patch('users/:id/suspend')
  async suspendUser(
    @Param('id') userId: string,
    @Body() dto: SuspendUserDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.adminService.suspendUser(userId, admin.id, dto);
  }

  @Patch('users/:id/unsuspend')
  async unsuspendUser(
    @Param('id') userId: string,
    @CurrentUser() admin: { id: string },
  ) {
    return this.adminService.unsuspendUser(userId, admin.id);
  }

  @Delete('users/:id')
  async deleteUser(
    @Param('id') userId: string,
    @CurrentUser() admin: { id: string },
  ) {
    return this.adminService.deleteUser(userId, admin.id);
  }

  // ANALYTICS ENDPOINTS
  @Get('analytics/overview')
  async getOverviewStats() {
    return this.adminService.getOverviewStats();
  }

  // AUDIT LOGS ENDPOINTS
  @Get('audit-logs')
  async getAuditLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
  ) {
    return this.adminService.getAuditLogs(page, limit);
  }

  // POST MANAGEMENT ENDPOINTS
  @Patch('posts/:id/remove')
  async removePost(
    @Param('id') postId: string,
    @Body() dto: RemovePostDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.adminService.removePost(postId, admin.id, dto);
  }

  @Patch('posts/:id/restore')
  async restorePost(
    @Param('id') postId: string,
    @CurrentUser() admin: { id: string },
  ) {
    return this.adminService.restorePost(postId, admin.id);
  }
}
