export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: 'photography' | 'videography' | 'sound';
  clientName?: string;
  projectDate?: Date;
  featured: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  media: PortfolioMedia[];
}

export interface PortfolioMedia {
  id: string;
  portfolioItemId: string;
  mediaType: 'image' | 'video' | 'audio';
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  altText?: string;
  sortOrder: number;
  createdAt: Date;
}

export interface PortfolioFilters {
  category?: string;
  featured?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  clientName?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePortfolioItemData {
  title: string;
  description?: string;
  category: 'photography' | 'videography' | 'sound';
  clientName?: string;
  projectDate?: Date;
  featured?: boolean;
  tags?: string[];
}

export interface UpdatePortfolioItemData {
  title?: string;
  description?: string;
  category?: 'photography' | 'videography' | 'sound';
  clientName?: string;
  projectDate?: Date;
  featured?: boolean;
  tags?: string[];
}

export interface CreatePortfolioMediaData {
  portfolioItemId: string;
  mediaType: 'image' | 'video' | 'audio';
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  altText?: string;
  sortOrder?: number;
}

export interface UpdatePortfolioMediaData {
  mediaType?: 'image' | 'video' | 'audio';
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  altText?: string;
  sortOrder?: number;
}

export interface BulkMediaOperation {
  operation: 'delete' | 'update' | 'reorder';
  mediaIds: string[];
  data?: Partial<UpdatePortfolioMediaData>;
}

export interface ContentVersion {
  id: string;
  portfolioItemId: string;
  version: number;
  changes: Record<string, any>;
  userId: string;
  createdAt: Date;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}