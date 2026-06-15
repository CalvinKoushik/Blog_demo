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
import { BookmarksService } from './bookmarks.service';

@Controller()
export class BookmarksController {
  constructor(private readonly bookmarks: BookmarksService) {}

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: { id: string }) {
    return this.bookmarks.listSaved(user.id);
  }

  @Get('posts/:slug/bookmark')
  @UseGuards(OptionalJwtAuthGuard)
  status(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string } | null,
  ) {
    return this.bookmarks.status(slug, user?.id);
  }

  @Post('posts/:slug/bookmark')
  @UseGuards(JwtAuthGuard)
  save(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.bookmarks.bookmark(slug, user.id);
  }

  @Delete('posts/:slug/bookmark')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.bookmarks.unbookmark(slug, user.id);
  }
}
