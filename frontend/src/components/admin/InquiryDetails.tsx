import { Button } from '@/components/ui';
import { ContactInquiry } from '@/types';

interface InquiryDetailsProps {
  inquiry: ContactInquiry;
  onStatusUpdate: (inquiryId: string, status: ContactInquiry['status']) => void;
  onClose: () => void;
}

export function InquiryDetails({ inquiry, onStatusUpdate, onClose }: InquiryDetailsProps) {
  const getStatusColor = (status: ContactInquiry['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-secondary-100 text-secondary-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">{inquiry.name}</h2>
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${getStatusColor(inquiry.status)}`}>
            {inquiry.status}
          </span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">Contact Information</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-secondary-700">Name:</span>
              <span className="ml-2 text-secondary-900">{inquiry.name}</span>
            </div>
            <div>
              <span className="font-medium text-secondary-700">Email:</span>
              <span className="ml-2 text-secondary-900">{inquiry.email}</span>
            </div>
            {inquiry.phone && (
              <div>
                <span className="font-medium text-secondary-700">Phone:</span>
                <span className="ml-2 text-secondary-900">{inquiry.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">Inquiry Details</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-secondary-700">Date:</span>
              <span className="ml-2 text-secondary-900">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
            </div>
            {inquiry.serviceInterest && (
              <div>
                <span className="font-medium text-secondary-700">Service Interest:</span>
                <span className="ml-2 text-secondary-900">{inquiry.serviceInterest}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject */}
      {inquiry.subject && (
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Subject</h3>
          <div className="bg-secondary-50 p-4 rounded-md">
            <p className="text-secondary-700 font-medium">{inquiry.subject}</p>
          </div>
        </div>
      )}

      {/* Message */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Message</h3>
        <div className="bg-secondary-50 p-4 rounded-md">
          <p className="text-secondary-700 whitespace-pre-wrap">{inquiry.message}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-secondary-200">
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={() => window.open(`mailto:${inquiry.email}?subject=Re: ${inquiry.subject || 'Your inquiry'}`)}
          >
            Reply via Email
          </Button>
          {inquiry.status === 'new' && (
            <Button
              variant="outline"
              onClick={() => onStatusUpdate(inquiry.id, 'responded')}
            >
              Mark as Responded
            </Button>
          )}
          {inquiry.status !== 'closed' && (
            <Button
              variant="outline"
              onClick={() => onStatusUpdate(inquiry.id, 'closed')}
              className="text-secondary-600 hover:text-secondary-700"
            >
              Close Inquiry
            </Button>
          )}
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}