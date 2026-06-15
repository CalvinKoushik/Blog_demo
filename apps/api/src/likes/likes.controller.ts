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
import { LikesService } from './likes.service';

@Controller('posts/:slug/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  status(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string } | null,
  ) {
    return this.likesService.counts(slug, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  like(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.likesService.like(slug, user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  unlike(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.likesService.unlike(slug, user.id);
  }
}
