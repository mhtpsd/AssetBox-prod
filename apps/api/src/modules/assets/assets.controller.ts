import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import {
  CreateAssetDto,
  UpdateAssetDto,
  SubmitAssetDto,
  QueryAssetsDto,
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('assets')
@UseGuards(AuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * Create a new asset
   */
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAssetDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.assetsService.create(userId, dto, files);
  }

  /**
   * Get current user's assets
   */
  @Get('my-uploads')
  async getMyAssets(
    @CurrentUser('id') userId: string,
    @Query() query: QueryAssetsDto,
  ) {
    return this. assetsService.findMyAssets(userId, query);
  }

  /**
   * Get asset by ID
   */
  @Get(':id')
  async getAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.assetsService.findById(id, userId);
  }

  /**
   * Update asset
   */
  @Patch(': id')
  @UseInterceptors(FilesInterceptor('files', 10))
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.assetsService.update(userId, id, dto, files);
  }

  /**
   * Submit asset for review
   */
  @Post(': id/submit')
  async submit(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitAssetDto,
  ) {
    return this. assetsService.submit(userId, id, dto);
  }

  /**
   * Delete asset
   */
  @Delete(':id')
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assetsService. delete(userId, id);
  }

  /**
   * Get asset versions
   */
  @Get(':id/versions')
  async getVersions(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assetsService. getVersions(userId, id);
  }
}