// Re-export Prisma types
export type {
  User,
  Asset,
  AssetFile,
  AssetVersion,
  AssetProof,
  Cart,
  CartItem,
  Order,
  OrderItem,
  UserAsset,
  DownloadLog,
  Earning,
  PayoutRequest,
  Notification,
  SupportTicket,
  TicketMessage,
  AssetType,
  AssetStatus,
  LicenseType,
  FileType,
  ProofType,
  ProofStatus,
  PaymentStatus,
  PayoutStatus,
  NotificationType,
  TicketStatus,
  TicketPriority,
} from '@assetbox/database';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Asset Types
export interface AssetWithOwner {
  id: string;
  title: string;
  description: string;
  assetType: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  licenseType: string;
  price: number;
  status: string;
  viewCount: number;
  totalDownloads: number;
  createdAt:  Date;
  updatedAt: Date;
  owner: {
    id: string;
    name:  string | null;
    username: string | null;
    image: string | null;
  };
  files: {
    id: string;
    fileType: string;
    fileUrl: string;
    fileSize: bigint;
    fileFormat: string;
    mimeType: string;
  }[];
}

export interface AssetListItem {
  id:  string;
  title: string;
  price: number;
  assetType: string;
  category: string;
  thumbnailUrl: string | null;
  totalDownloads: number;
  viewCount: number;
  owner: {
    username: string | null;
    image: string | null;
  };
}

// Cart Types
export interface CartWithItems {
  id: string;
  items: {
    id: string;
    assetId: string;
    asset: AssetListItem;
  }[];
  totalAmount: number;
}

// User Types
export interface UserProfile {
  id:  string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  isAdmin: boolean;
  paymentVerified: boolean;
  walletBalance: number;
  createdAt: Date;
}

export interface UserStats {
  totalAssets: number;
  totalSales: number;
  totalEarnings: number;
  totalDownloads: number;
  pendingPayouts: number;
}

// Upload Types
export interface CreateAssetDto {
  title:  string;
  description: string;
  assetType: string;
  category:  string;
  subcategory?:  string;
  tags?:  string[];
  licenseType?:  string;
  price: number;
}

export interface SubmitAssetDto {
  proof: {
    type: 'FILE' | 'TEXT' | 'LINK';
    data: string;
  };
}

// Search Types
export interface SearchParams {
  query?:  string;
  assetType?: string;
  category?: string;
  subcategory?: string;
  licenseType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'relevance' | 'newest' | 'popular' | 'price_asc' | 'price_desc';
  page?: number;
  limit?:  number;
}

// Notification Types
export interface NotificationItem {
  id:  string;
  type: string;
  title:  string;
  message: string;
  data:  Record<string, any> | null;
  isRead: boolean;
  createdAt:  Date;
}

// Wallet Types
export interface EarningItem {
  id:  string;
  amount: number;
  platformFee: number;
  createdAt: Date;
  asset: {
    id: string;
    title:  string;
  };
}

export interface PayoutRequestItem {
  id: string;
  amount: number;
  status: string;
  adminNote: string | null;
  processedAt: Date | null;
  createdAt: Date;
}