import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { Public } from '../../common/decorators/public.decorator';
import { MarketplaceQueryDto } from './dto/marketplace-query.dto';

@Controller('marketplace')
@Public()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  async list(@Query() query: MarketplaceQueryDto) {
    return this.marketplaceService.search(query);
  }

  @Get('search')
  async search(@Query() query: MarketplaceQueryDto) {
    return this.marketplaceService.search(query);
  }

  @Get('categories')
  async getCategories() {
    return this.marketplaceService.getCategories();
  }

  @Get('featured')
  async getFeatured(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.marketplaceService.getFeatured(limit);
  }
}