import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UsersService } from './users.service';

import { UpdateProfileDto } from './dto/update-profile.dto';

import { SearchPeopleDto } from './dto/search-people.dto';



@Controller('users')

export class UsersController {

  constructor(private readonly usersService: UsersService) {}



  @Get('search')

  @UseGuards(OptionalJwtAuthGuard)

  searchPeople(

    @Query() dto: SearchPeopleDto,

    @CurrentUser() user: { id: string } | null,

  ) {

    return this.usersService.searchPeople(

      dto.q,

      user?.id,

      dto.cursor,

      dto.limit,

    );

  }



  @Patch('me')

  @UseGuards(JwtAuthGuard)

  updateMe(

    @CurrentUser() user: { id: string },

    @Body() dto: UpdateProfileDto,

  ) {

    return this.usersService.updateMyProfile(user.id, dto);

  }



  @Get(':username/activity')

  getActivity(@Param('username') username: string) {

    return this.usersService.getUserActivity(username);

  }



  @Get(':username')

  async getProfile(@Param('username') username: string) {

    return this.usersService.getUserProfileByUsername(username);

  }

}

