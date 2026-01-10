import { Card, CardHeader, CardBody } from '@/components/ui';

interface PortfolioAnalyticsProps {
  data: {
    byCategory: Array<{ category: string; count: number }>;
    viewsByItem: Array<{ title: string; views: number }>;
    uploadsByMonth: Array<{ month: string; count: number }>;
  };
}

export function PortfolioAnalytics({ data }: PortfolioAnalyticsProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'photography': return 'bg-blue-500';
      case 'videography': return 'bg-green-500';
      case 'sound': return 'bg-purple-500';
      default: return 'bg-secondary-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-secondary-900">
          Portfolio Analytics
        </h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Portfolio by Category */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">By Category</h4>
            <div className="space-y-2">
              {data.byCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)}`}></div>
                    <span className="text-sm text-secondary-700 capitalize">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Viewed Items */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Most Viewed</h4>
            <div className="space-y-2">
              {data.viewsByItem.slice(0, 5).map((item, index) => (
                <div key={item.title} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-secondary-500 w-4">#{index + 1}</span>
                    <span className="text-sm text-secondary-700 truncate">{item.title}</span>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">{item.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Activity */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Upload Activity</h4>
            <div className="space-y-2">
              {data.uploadsByMonth.slice(-6).map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-700">{item.month}</span>
                  <span className="text-sm font-medium text-secondary-900">{item.count} uploads</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}