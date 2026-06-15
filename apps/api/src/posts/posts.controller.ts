import {

  Body,

  Controller,

  Delete,

  Get,

  Param,

  Patch,

  Post,

  Query,

  UseGuards,

} from '@nestjs/common';

import { PostsService } from './posts.service';

import { CreatePostDto } from './dto/create-post.dto';

import { UpdatePostDto } from './dto/update-post.dto';

import { FeedQueryDto } from './dto/feed-query.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';



@Controller('posts')

export class PostsController {

  constructor(private readonly postsService: PostsService) {}



  @Get()

  @UseGuards(OptionalJwtAuthGuard)

  getFeed(

    @Query() query: FeedQueryDto,

    @CurrentUser() user: { id: string } | null,

  ) {

    if (query.q?.trim() || query.category || query.type) {

      return this.postsService.searchPosts(query, user?.id);

    }

    if (query.feed === 'following') {

      if (!user) return { items: [], nextCursor: null };

      return this.postsService.getFollowingFeed(user.id, query);

    }

    return this.postsService.getRankedFeed(user?.id, query);

  }



  @Get('me')

  @UseGuards(JwtAuthGuard)

  getMyPosts(

    @CurrentUser() user: { id: string },

    @Query('published') published?: string,

  ) {

    if (published === 'true') {

      return this.postsService.getMyPosts(user.id, true);

    }

    if (published === 'false') {

      return this.postsService.getMyPosts(user.id, false);

    }

    return this.postsService.getMyPosts(user.id);

  }



  @Get('categories')

  getCategories() {

    return this.postsService.getCategories();

  }



  @Get(':slug')

  @UseGuards(OptionalJwtAuthGuard)

  getPostBySlug(

    @Param('slug') slug: string,

    @CurrentUser() user: { id: string } | null,

  ) {

    return this.postsService.getPostBySlug(slug, user?.id);

  }



  @Post()

  @UseGuards(JwtAuthGuard)

  createPost(

    @CurrentUser() user: { id: string },

    @Body() dto: CreatePostDto,

  ) {

    return this.postsService.createPost(user.id, dto);

  }



  @Patch(':slug')

  @UseGuards(JwtAuthGuard)

  updatePost(

    @Param('slug') slug: string,

    @CurrentUser() user: { id: string },

    @Body() dto: UpdatePostDto,

  ) {

    return this.postsService.updatePost(slug, user.id, dto);

  }



  @Delete(':slug')

  @UseGuards(JwtAuthGuard)

  deletePost(

    @Param('slug') slug: string,

    @CurrentUser() user: { id: string },

  ) {

    return this.postsService.softDeletePost(slug, user.id);

  }

}

