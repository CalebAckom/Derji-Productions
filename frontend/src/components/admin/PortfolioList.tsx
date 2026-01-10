import { Card, CardBody, Button, Input } from '@/components/ui';
import { PortfolioItem } from '@/types';

interface PortfolioListProps {
  items: PortfolioItem[];
  isLoading: boolean;
  filters: {
    category: string;
    featured: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
}

export function PortfolioList({
  items,
  isLoading,
  filters,
  onFiltersChange,
  onEdit,
  onDelete
}: PortfolioListProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardBody>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-secondary-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-16 h-8 bg-secondary-200 rounded"></div>
                  <div className="w-16 h-8 bg-secondary-200 rounded"></div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search portfolio items..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                <option value="photography">Photography</option>
                <option value="videography">Videography</option>
                <option value="sound">Sound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Featured
              </label>
              <select
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Items</option>
                <option value="true">Featured Only</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => onFiltersChange({ category: '', featured: '', search: '' })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Portfolio Items */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-secondary-500">No portfolio items found</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardBody>
                <div className="flex items-center space-x-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-secondary-100 rounded overflow-hidden flex-shrink-0">
                    {item.media && item.media.length > 0 ? (
                      <img
                        src={item.media[0].thumbnailUrl || item.media[0].fileUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-secondary-900 truncate">
                        {item.title}
                      </h3>
                      {item.featured && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-secondary-500">
                      <span className="capitalize">{item.category}</span>
                      {item.clientName && <span>Client: {item.clientName}</span>}
                      {item.projectDate && (
                        <span>Date: {new Date(item.projectDate).toLocaleDateString()}</span>
                      )}
                      <span>{item.media?.length || 0} media files</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}