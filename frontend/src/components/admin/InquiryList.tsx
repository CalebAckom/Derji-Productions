import { Card, CardBody, Button, Input } from '@/components/ui';
import { ContactInquiry } from '@/types';

interface InquiryListProps {
  inquiries: ContactInquiry[];
  isLoading: boolean;
  filters: {
    status: string;
    dateFrom: string;
    dateTo: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  onViewDetails: (inquiry: ContactInquiry) => void;
  onStatusUpdate: (inquiryId: string, status: ContactInquiry['status']) => void;
}

export function InquiryList({
  inquiries,
  isLoading,
  filters,
  onFiltersChange,
  onViewDetails,
  onStatusUpdate
}: InquiryListProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getStatusColor = (status: ContactInquiry['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-secondary-100 text-secondary-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardBody>
              <div className="h-4 bg-secondary-200 rounded mb-2"></div>
              <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search inquiries..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                From Date
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                To Date
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => onFiltersChange({ status: '', dateFrom: '', dateTo: '', search: '' })}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Inquiries List */}
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <p className="text-secondary-500">No inquiries found</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {inquiry.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary-600 mb-2">
                      <div>
                        <span className="font-medium">Email:</span> {inquiry.email}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(inquiry.createdAt).toLocaleDateString()}
                      </div>
                      {inquiry.serviceInterest && (
                        <div>
                          <span className="font-medium">Interest:</span> {inquiry.serviceInterest}
                        </div>
                      )}
                    </div>
                    {inquiry.subject && (
                      <p className="text-sm font-medium text-secondary-700 mb-1">
                        Subject: {inquiry.subject}
                      </p>
                    )}
                    <p className="text-sm text-secondary-600 line-clamp-2">
                      {inquiry.message}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(inquiry)}
                    >
                      Details
                    </Button>
                    {inquiry.status === 'new' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onStatusUpdate(inquiry.id, 'responded')}
                      >
                        Mark Responded
                      </Button>
                    )}
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