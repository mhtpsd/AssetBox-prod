import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   */
  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService. findById(userId);
  }

  /**
   * Update current user profile
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this. usersService.updateProfile(userId, dto);
  }

  /**
   * Accept terms of service
   */
  @Post('me/accept-terms')
  async acceptTerms(@CurrentUser('id') userId: string) {
    return this. usersService.acceptTerms(userId);
  }

  /**
   * Get current user statistics
   */
  @Get('me/stats')
  async getMyStats(@CurrentUser('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  /**
   * Get current user's recent earnings
   */
  @Get('me/earnings')
  async getMyEarnings(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    return this. usersService.getRecentEarnings(userId, days || 30);
  }

  /**
   * Get public user profile by username
   */
  @Public()
  @Get(': username')
  async getProfile(@Param('username') username: string) {
    return this.usersService. findByUsername(username);
  }

  /**
   * Get public user's assets
   */
  @Public()
  @Get(':username/assets')
  async getUserAssets(
    @Param('username') username: string,
    @Query('page') page?:  number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getUserAssets(username, page || 1, limit || 20);
  }
}