import { Controller, Get, Query } from '@nestjs/common';
import { MarketplaceService, MarketplaceQueryParams } from './marketplace.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('marketplace')
@Public()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  async list(@Query() query: MarketplaceQueryParams) {
    return this.marketplaceService.search(query);
  }

  @Get('search')
  async search(@Query() query: MarketplaceQueryParams) {
    return this.marketplaceService.search(query);
  }

  @Get('categories')
  async getCategories() {
    return this.marketplaceService.getCategories();
  }

  @Get('featured')
  async getFeatured(@Query('limit') limit?: number) {
    return this.marketplaceService.getFeatured(limit || 8);
  }
}