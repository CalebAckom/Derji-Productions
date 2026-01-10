import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AnalyticsOverview } from '@/components/admin/AnalyticsOverview';
import { BookingAnalytics } from '@/components/admin/BookingAnalytics';
import { PortfolioAnalytics } from '@/components/admin/PortfolioAnalytics';
import { InquiryAnalytics } from '@/components/admin/InquiryAnalytics';
import { Card, CardHeader, CardBody, Button } from '@/components/ui';
import { get } from '@/utils/api';

interface AnalyticsData {
  overview: {
    totalBookings: number;
    totalInquiries: number;
    totalPortfolioItems: number;
    totalUsers: number;
    revenueThisMonth: number;
    bookingsThisMonth: number;
    inquiriesThisMonth: number;
    conversionRate: number;
  };
  bookings: {
    byStatus: Array<{ status: string; count: number }>;
    byService: Array<{ service: string; count: number }>;
    byMonth: Array<{ month: string; count: number; revenue: number }>;
  };
  portfolio: {
    byCategory: Array<{ category: string; count: number }>;
    viewsByItem: Array<{ title: string; views: number }>;
    uploadsByMonth: Array<{ month: string; count: number }>;
  };
  inquiries: {
    byStatus: Array<{ status: string; count: number }>;
    byService: Array<{ service: string; count: number }>;
    byMonth: Array<{ month: string; count: number }>;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0] // today
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to
      });
      
      const data = await get<AnalyticsData>(`/analytics?${queryParams.toString()}`);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const queryParams = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to,
        format: 'pdf'
      });
      
      // This would typically trigger a file download
      const response = await fetch(`/api/analytics/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${dateRange.from}-to-${dateRange.to}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Analytics & Reports</h1>
            <p className="text-secondary-600 mt-2">
              Track your business performance and insights.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-secondary-700">From:</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="px-3 py-2 border border-secondary-300 rounded-md text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-secondary-700">To:</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="px-3 py-2 border border-secondary-300 rounded-md text-sm"
              />
            </div>
            <Button variant="outline" onClick={handleExportReport}>
              Export Report
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardBody>
                  <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                  <div className="h-8 bg-secondary-200 rounded"></div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : analyticsData ? (
          <div className="space-y-6">
            {/* Overview Stats */}
            <AnalyticsOverview data={analyticsData.overview} />
            
            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BookingAnalytics data={analyticsData.bookings} />
              <PortfolioAnalytics data={analyticsData.portfolio} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InquiryAnalytics data={analyticsData.inquiries} />
              
              {/* Additional metrics can be added here */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Performance Summary
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-600">Conversion Rate</span>
                      <span className="font-semibold text-primary-600">
                        {analyticsData.overview.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-600">Avg. Monthly Revenue</span>
                      <span className="font-semibold text-green-600">
                        ${analyticsData.overview.revenueThisMonth.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-600">Active Portfolio Items</span>
                      <span className="font-semibold text-secondary-900">
                        {analyticsData.overview.totalPortfolioItems}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}