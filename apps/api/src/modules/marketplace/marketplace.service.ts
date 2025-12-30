import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../../services/storage/storage.service';
import { SearchService } from '../search/search.service';

export interface MarketplaceQueryParams {
  query?: string;
  assetType?: string;
  category?: string;
  subcategory?: string;
  licenseType?: string;
  minPrice?:  number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly searchService:  SearchService,
  ) {}

  async search(params: MarketplaceQueryParams) {
    const {
      query = '',
      assetType,
      category,
      subcategory,
      licenseType,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = params;

    const offset = (page - 1) * limit;

    // Build filters
    const filters = this.searchService.buildFilters({
      assetType,
      category,
      subcategory,
      licenseType,
      minPrice,
      maxPrice,
    });

    // Build sort
    const sortArray = this.searchService.buildSort(sort);

    // Search using Meilisearch
    const searchResult = await this.searchService.search(query, {
      filters,
      sort: sortArray,
      limit,
      offset,
    });

    // Get full asset details from database
    const assetIds = searchResult.hits. map((hit:  any) => hit.id);
    
    if (assetIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const assets = await this.prisma. asset.findMany({
      where: {
        id: { in: assetIds },
        status: 'APPROVED',
        deletedAt: null,
      },
      include: {
        files: {
          where: { fileType: 'THUMBNAIL' },
          take: 1,
        },
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Maintain search order
    const orderedAssets = assetIds
      .map((id) => assets.find((a) => a.id === id))
      .filter(Boolean);

    const formattedAssets = orderedAssets.map((asset) => ({
      id: asset! .id,
      title: asset!.title,
      assetType: asset!.assetType,
      category: asset! .category,
      price: Number(asset!.price),
      totalDownloads: asset!.totalDownloads,
      viewCount: asset!.viewCount,
      thumbnailUrl:  asset!.files[0]?.fileUrl
        ? this.storage.getPublicUrl(asset!.files[0]. fileUrl)
        : null,
      owner: {
        username: asset!.owner.username,
        image: asset!.owner.image,
      },
      createdAt: asset!.createdAt,
    }));

    return {
      items: formattedAssets,
      total: searchResult.total,
      page,
      limit,
      totalPages: Math.ceil(searchResult. total / limit),
    };
  }

  // Keep existing methods...
  async getCategories() {
    const categories = await this.prisma. asset.groupBy({
      by: ['category'],
      where: {
        status: 'APPROVED',
        deletedAt: null,
      },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });

    return categories. map((c) => ({
      name: c.category,
      count: c._count. category,
    }));
  }

  async getFeatured(limit = 8) {
    const assets = await this.prisma.asset.findMany({
      where: {
        status: 'APPROVED',
        deletedAt:  null,
      },
      include: {
        files: {
          where: { fileType: 'THUMBNAIL' },
          take: 1,
        },
        owner: {
          select: {
            id:  true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { totalDownloads: 'desc' },
      take: limit,
    });

    return assets.map((asset) => ({
      id: asset.id,
      title: asset.title,
      assetType: asset.assetType,
      category: asset.category,
      price: Number(asset.price),
      totalDownloads: asset.totalDownloads,
      viewCount: asset. viewCount,
      thumbnailUrl: asset.files[0]?. fileUrl
        ? this.storage.getPublicUrl(asset. files[0].fileUrl)
        : null,
      owner:  {
        username: asset.owner.username,
        image: asset.owner.image,
      },
    }));
  }
}