import { Module } from '@nestjs/common';
import { CommentActionsController, CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController, CommentActionsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
