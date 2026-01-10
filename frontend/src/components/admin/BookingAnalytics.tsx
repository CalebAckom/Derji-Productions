import { Card, CardHeader, CardBody } from '@/components/ui';

interface BookingAnalyticsProps {
  data: {
    byStatus: Array<{ status: string; count: number }>;
    byService: Array<{ service: string; count: number }>;
    byMonth: Array<{ month: string; count: number; revenue: number }>;
  };
}

export function BookingAnalytics({ data }: BookingAnalyticsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-secondary-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-secondary-900">
          Booking Analytics
        </h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Bookings by Status */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">By Status</h4>
            <div className="space-y-2">
              {data.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                    <span className="text-sm text-secondary-700 capitalize">{item.status}</span>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Top Services</h4>
            <div className="space-y-2">
              {data.byService.slice(0, 5).map((item, index) => (
                <div key={item.service} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-secondary-500 w-4">#{index + 1}</span>
                    <span className="text-sm text-secondary-700">{item.service}</span>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Monthly Trend</h4>
            <div className="space-y-2">
              {data.byMonth.slice(-6).map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-700">{item.month}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-secondary-900">{item.count} bookings</div>
                    <div className="text-xs text-secondary-500">${item.revenue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}