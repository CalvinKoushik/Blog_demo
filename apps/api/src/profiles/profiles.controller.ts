import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('trending')
  getTrendingStudents(@Query('limit') limit?: string) {
    return this.profileService.getTrendingStudents(
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('search')
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.profileService.searchProfiles(
      query,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.profileService.getByUsername(username);
  }

  @Get(':username/followers')
  getFollowers(
    @Param('username') username: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Need to get userId first
    return this.profileService.getFollowers(
      username,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':username/following')
  getFollowing(
    @Param('username') username: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.profileService.getFollowing(
      username,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() data: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      collegeName?: string;
      department?: string;
      year?: number;
      skills?: string[];
      linkedinUrl?: string;
      githubUrl?: string;
      portfolioUrl?: string;
      avatarUrl?: string;
    },
  ) {
    return this.profileService.update(user.id, data);
  }

  @Post(':userId/follow')
  @UseGuards(JwtAuthGuard)
  follow(
    @CurrentUser() user: { id: string },
    @Param('userId') userId: string,
  ) {
    return this.profileService.follow(user.id, userId);
  }

  @Delete(':userId/follow')
  @UseGuards(JwtAuthGuard)
  unfollow(
    @CurrentUser() user: { id: string },
    @Param('userId') userId: string,
  ) {
    return this.profileService.unfollow(user.id, userId);
  }
}
