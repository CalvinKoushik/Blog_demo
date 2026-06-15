import { Controller, Get, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DiscoverService } from './discover.service';

@Controller('discover')
export class DiscoverController {
  constructor(private readonly discover: DiscoverService) {}

  @Get('trending-categories')
  trendingCategories() {
    return this.discover.trendingCategories();
  }

  @Get('trending-tags')
  trendingTags() {
    return this.discover.trendingTags();
  }

  @Get('suggested-creators')
  @UseGuards(OptionalJwtAuthGuard)
  suggestedCreators(@CurrentUser() user: { id: string } | null) {
    return this.discover.suggestedCreators(user?.id);
  }
}
