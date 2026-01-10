import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'add-portfolio',
      label: 'Add Portfolio Item',
      description: 'Upload new work to showcase',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => navigate('/admin/portfolio'),
      variant: 'primary' as const
    },
    {
      id: 'view-bookings',
      label: 'View Bookings',
      description: 'Check upcoming appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => navigate('/admin/bookings'),
      variant: 'outline' as const
    },
    {
      id: 'check-inquiries',
      label: 'Check Inquiries',
      description: 'Review new messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => navigate('/admin/inquiries'),
      variant: 'outline' as const
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      description: 'Check performance metrics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => navigate('/admin/analytics'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant}
          size="sm"
          onClick={action.onClick}
          className="w-full justify-start text-left"
        >
          <div className="flex items-center space-x-3">
            {action.icon}
            <div>
              <div className="font-medium">{action.label}</div>
              <div className="text-xs opacity-75">{action.description}</div>
            </div>
          </div>
        </Button>
      ))}
      
      <div className="pt-4 border-t border-secondary-200">
        <h4 className="text-sm font-medium text-secondary-900 mb-2">Quick Links</h4>
        <div className="space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-primary-600 hover:text-primary-700"
          >
            View Live Website →
          </a>
          <button className="block text-sm text-secondary-600 hover:text-secondary-700">
            System Settings
          </button>
          <button className="block text-sm text-secondary-600 hover:text-secondary-700">
            Help & Support
          </button>
        </div>
      </div>
    </div>
  );
}