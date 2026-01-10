import { Card, CardHeader, CardBody } from '@/components/ui';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { QuickActions } from '@/components/admin/QuickActions';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600 mt-2">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        
        {/* Dashboard Statistics */}
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-secondary-900">
                  Recent Activity
                </h2>
              </CardHeader>
              <CardBody>
                <RecentActivity />
              </CardBody>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-secondary-900">
                  Quick Actions
                </h2>
              </CardHeader>
              <CardBody>
                <QuickActions />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}