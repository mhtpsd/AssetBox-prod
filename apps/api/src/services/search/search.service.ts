import { Injectable, OnModuleInit } from '@nestjs/common';
import { MeiliSearch, Index } from 'meilisearch';
import { ConfigService } from '@nestjs/config';

interface AssetDocument {
  id:  string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  subcategory: string | null;
  assetType: string;
  licenseType: string;
  price: number;
  ownerId: string;
  ownerName: string;
  ownerUsername: string;
  thumbnailUrl: string | null;
  totalDownloads: number;
  viewCount: number;
  createdAt: number; // Unix timestamp for sorting
}

@Injectable()
export class SearchService implements OnModuleInit {
  private client: MeiliSearch;
  private index: Index<AssetDocument>;

  constructor(private readonly config: ConfigService) {
    this.client = new MeiliSearch({
      host: this.config.get('MEILISEARCH_HOST') || 'http://localhost:7700',
      apiKey: this.config.get('MEILISEARCH_API_KEY'),
    });
  }

  async onModuleInit() {
    this.index = this. client.index('assets');

    // Configure index settings
    await this.index.updateSettings({
      searchableAttributes: [
        'title',
        'description',
        'tags',
        'category',
        'subcategory',
        'ownerName',
        'ownerUsername',
      ],
      filterableAttributes: [
        'assetType',
        'category',
        'subcategory',
        'licenseType',
        'price',
        'ownerId',
      ],
      sortableAttributes: [
        'price',
        'createdAt',
        'totalDownloads',
        'viewCount',
      ],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
    });
  }

  async indexAsset(asset:  any) {
    const document: AssetDocument = {
      id:  asset.id,
      title: asset. title,
      description: asset.description,
      tags: asset.tags,
      category: asset.category,
      subcategory: asset.subcategory,
      assetType: asset.assetType,
      licenseType: asset.licenseType,
      price: Number(asset.price),
      ownerId: asset.ownerId,
      ownerName: asset. owner?.name || '',
      ownerUsername:  asset.owner?.username || '',
      thumbnailUrl: asset. files?.find((f: any) => f.fileType === 'THUMBNAIL')?.fileUrl || null,
      totalDownloads: asset. totalDownloads,
      viewCount:  asset.viewCount,
      createdAt: new Date(asset.createdAt).getTime(),
    };

    await this.index.addDocuments([document]);
  }

  async removeAsset(assetId: string) {
    await this.index.deleteDocument(assetId);
  }

  async search(params: {
    query: string;
    filters?: {
      assetType?: string;
      category?: string;
      licenseType?: string;
      minPrice?: number;
      maxPrice?: number;
    };
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const { query, filters, sort, page = 1, limit = 20 } = params;

    // Build filter string
    const filterParts:  string[] = [];

    if (filters?. assetType) {
      filterParts.push(`assetType = "${filters.assetType}"`);
    }
    if (filters?. category) {
      filterParts.push(`category = "${filters.category}"`);
    }
    if (filters?.licenseType) {
      filterParts. push(`licenseType = "${filters.licenseType}"`);
    }
    if (filters?.minPrice !== undefined) {
      filterParts.push(`price >= ${filters.minPrice}`);
    }
    if (filters?.maxPrice !== undefined) {
      filterParts.push(`price <= ${filters.maxPrice}`);
    }

    // Build sort
    let sortArray: string[] = [];
    switch (sort) {
      case 'price_asc':
        sortArray = ['price: asc'];
        break;
      case 'price_desc':
        sortArray = ['price:desc'];
        break;
      case 'newest':
        sortArray = ['createdAt:desc'];
        break;
      case 'popular':
        sortArray = ['totalDownloads:desc'];
        break;
      default:
        // Relevance (default Meilisearch behavior)
        break;
    }

    const result = await this.index.search(query, {
      filter: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
      sort:  sortArray.length > 0 ?  sortArray :  undefined,
      offset: (page - 1) * limit,
      limit,
    });

    return {
      items: result.hits,
      total: result.estimatedTotalHits,
      page,
      limit,
      totalPages: Math.ceil((result.estimatedTotalHits || 0) / limit),
    };
  }
}