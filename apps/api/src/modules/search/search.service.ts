import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { MeiliSearch, Index } from 'meilisearch';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../../services/storage/storage.service';

export interface AssetDocument {
  id: string;
  title: string;
  description: string;
  assetType: string;
  category: string;
  subcategory?:  string;
  tags:  string[];
  price: number;
  licenseType: string;
  ownerId: string;
  ownerUsername: string;
  thumbnailUrl?: string;
  totalDownloads:  number;
  viewCount: number;
  createdAt: number; // timestamp for sorting
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private assetsIndex: Index<AssetDocument>;

  constructor(
    @Inject('MEILISEARCH') private readonly meili: MeiliSearch,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async onModuleInit() {
    await this.initializeIndex();
    await this.autoSyncAssets();
  }

  /**
   * Auto-sync assets if index is empty
   */
  private async autoSyncAssets() {
    try {
      const stats = await this.assetsIndex.getStats();
      
      if (stats.numberOfDocuments === 0) {
        this.logger.log('Index is empty, syncing all approved assets...');
        
        const assets = await this.prisma.asset.findMany({
          where: {
            status: 'APPROVED',
            deletedAt: null,
          },
          include: {
            owner: {
              select: {
                username: true,
              },
            },
            files: {
              where: { fileType: 'THUMBNAIL' },
              take: 1,
            },
          },
        });

        if (assets.length > 0) {
          const searchDocuments: AssetDocument[] = assets.map((asset) => ({
            id: asset.id,
            title: asset.title,
            description: asset.description,
            assetType: asset.assetType,
            category: asset.category,
            subcategory: asset.subcategory || undefined,
            tags: asset.tags,
            price: Number(asset.price),
            licenseType: asset.licenseType,
            ownerId: asset.ownerId,
            ownerUsername: asset.owner.username || '',
            thumbnailUrl: asset.files[0]?.fileUrl
              ? this.storage.getPublicUrl(asset.files[0].fileUrl)
              : undefined,
            totalDownloads: asset.totalDownloads,
            viewCount: asset.viewCount,
            createdAt: asset.createdAt.getTime(),
          }));

          await this.indexAssets(searchDocuments);
          this.logger.log(`Auto-synced ${assets.length} assets to search index`);
        }
      } else {
        this.logger.log(`Index already contains ${stats.numberOfDocuments} documents`);
      }
    } catch (error) {
      this.logger.error(`Failed to auto-sync assets: ${error.message}`);
    }
  }

  /**
   * Initialize Meilisearch index
   */
  private async initializeIndex() {
    try {
      // Create or get assets index
      this.assetsIndex = this.meili.index<AssetDocument>('assets');

      // Configure searchable attributes
      await this.assetsIndex.updateSearchableAttributes([
        'title',
        'description',
        'tags',
        'category',
        'subcategory',
        'assetType',
        'ownerUsername',
      ]);

      // Configure filterable attributes
      await this.assetsIndex.updateFilterableAttributes([
        'assetType',
        'category',
        'subcategory',
        'licenseType',
        'price',
        'ownerId',
      ]);

      // Configure sortable attributes
      await this.assetsIndex.updateSortableAttributes([
        'createdAt',
        'price',
        'totalDownloads',
        'viewCount',
      ]);

      // Configure ranking rules
      await this.assetsIndex.updateRankingRules([
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ]);

      this.logger.log('Meilisearch index initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Meilisearch:  ${error.message}`);
    }
  }

  /**
   * Index a single asset
   */
  async indexAsset(asset: AssetDocument) {
    try {
      await this.assetsIndex.addDocuments([asset]);
      this.logger.log(`Asset indexed: ${asset.id}`);
    } catch (error) {
      this.logger. error(`Failed to index asset ${asset.id}: ${error.message}`);
    }
  }

  /**
   * Index multiple assets
   */
  async indexAssets(assets: AssetDocument[]) {
    try {
      await this.assetsIndex.addDocuments(assets);
      this.logger.log(`${assets.length} assets indexed`);
    } catch (error) {
      this.logger.error(`Failed to index assets: ${error.message}`);
    }
  }

  /**
   * Update asset in index
   */
  async updateAsset(assetId: string, updates:  Partial<AssetDocument>) {
    try {
      await this.assetsIndex.updateDocuments([{ id: assetId, ...updates }]);
      this.logger.log(`Asset updated in index: ${assetId}`);
    } catch (error) {
      this.logger.error(`Failed to update asset ${assetId}: ${error.message}`);
    }
  }

  /**
   * Remove asset from index
   */
  async removeAsset(assetId: string) {
    try {
      await this.assetsIndex.deleteDocument(assetId);
      this.logger.log(`Asset removed from index: ${assetId}`);
    } catch (error) {
      this.logger.error(`Failed to remove asset ${assetId}:  ${error.message}`);
    }
  }

  /**
   * Search assets
   */
  async search(query: string, options: {
    filters?: string[];
    sort?: string[];
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const { filters = [], sort = [], limit = 20, offset = 0 } = options;

      const result = await this.assetsIndex. search(query, {
        filter: filters. length > 0 ? filters :  undefined,
        sort: sort. length > 0 ? sort :  undefined,
        limit,
        offset,
      });

      return {
        hits: result.hits,
        total: result.estimatedTotalHits || 0,
        query:  result.query,
        processingTimeMs: result.processingTimeMs,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      return {
        hits: [],
        total: 0,
        query,
        processingTimeMs: 0,
      };
    }
  }

  /**
   * Build filter string for Meilisearch
   */
  buildFilters(params: {
    assetType?: string;
    category?: string;
    subcategory?: string;
    licenseType?: string;
    minPrice?: number;
    maxPrice?: number;
    ownerId?: string;
  }): string[] {
    const filters: string[] = [];

    if (params. assetType) {
      filters.push(`assetType = "${params.assetType}"`);
    }

    if (params.category) {
      filters.push(`category = "${params.category}"`);
    }

    if (params.subcategory) {
      filters.push(`subcategory = "${params.subcategory}"`);
    }

    if (params.licenseType) {
      filters.push(`licenseType = "${params.licenseType}"`);
    }

    if (params. minPrice !== undefined && params.maxPrice !== undefined) {
      filters.push(`price ${params.minPrice} TO ${params.maxPrice}`);
    } else if (params.minPrice !== undefined) {
      filters.push(`price >= ${params.minPrice}`);
    } else if (params.maxPrice !== undefined) {
      filters.push(`price <= ${params.maxPrice}`);
    }

    if (params.ownerId) {
      filters.push(`ownerId = "${params.ownerId}"`);
    }

    return filters;
  }

  /**
   * Build sort array for Meilisearch
   */
  buildSort(sortBy?:  string): string[] {
    const sortMap: Record<string, string[]> = {
      newest: ['createdAt:desc'],
      oldest: ['createdAt:asc'],
      popular:  ['totalDownloads:desc', 'viewCount:desc'],
      price_asc: ['price:asc'],
      price_desc: ['price:desc'],
    };

    return sortMap[sortBy || ''] || [];
  }

  /**
   * Clear entire index (use with caution)
   */
  async clearIndex() {
    try {
      await this.assetsIndex.deleteAllDocuments();
      this.logger.warn('All documents deleted from index');
    } catch (error) {
      this.logger.error(`Failed to clear index: ${error.message}`);
    }
  }

  /**
   * Get index stats
   */
  async getStats() {
    try {
      const stats = await this.assetsIndex.getStats();
      return stats;
    } catch (error) {
      this.logger.error(`Failed to get index stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the assets index (for use by other services)
   */
  getIndex() {
    return this.assetsIndex;
  }
}
