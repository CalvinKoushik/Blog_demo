import {
  Body,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  list(@Param('slug') slug: string) {
    return this.commentsService.listByPostSlug(slug);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string } | null,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(slug, user?.id ?? null, dto);
  }
}

@Controller('comments')
export class CommentActionsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.softDelete(id, user.id);
  }
}
