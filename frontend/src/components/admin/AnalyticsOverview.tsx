import { Card, CardBody } from '@/components/ui';

interface AnalyticsOverviewProps {
  data: {
    totalBookings: number;
    totalInquiries: number;
    totalPortfolioItems: number;
    totalUsers: number;
    revenueThisMonth: number;
    bookingsThisMonth: number;
    inquiriesThisMonth: number;
    conversionRate: number;
  };
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const stats = [
    {
      title: 'Total Bookings',
      value: data.totalBookings,
      change: `+${data.bookingsThisMonth} this month`,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900'
    },
    {
      title: 'Total Inquiries',
      value: data.totalInquiries,
      change: `+${data.inquiriesThisMonth} this month`,
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      textColor: 'text-green-900'
    },
    {
      title: 'Portfolio Items',
      value: data.totalPortfolioItems,
      change: 'Active items',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-900'
    },
    {
      title: 'Monthly Revenue',
      value: `$${data.revenueThisMonth.toLocaleString()}`,
      change: `${data.conversionRate.toFixed(1)}% conversion rate`,
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.bgColor} border-0`}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 mb-1">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}