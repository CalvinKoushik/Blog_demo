import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FollowsService } from './follows.service';

@Controller('users/:username/follow')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  status(
    @Param('username') username: string,
    @CurrentUser() user: { id: string } | null,
  ) {
    return this.followsService.status(user?.id, username);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  follow(
    @Param('username') username: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.followsService.follow(user.id, username);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  unfollow(
    @Param('username') username: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.followsService.unfollow(user.id, username);
  }
}
