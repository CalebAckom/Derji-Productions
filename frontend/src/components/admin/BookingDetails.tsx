import { Button } from '@/components/ui';
import { Booking } from '@/types';

interface BookingDetailsProps {
  booking: Booking;
  onStatusUpdate: (bookingId: string, status: Booking['status']) => void;
  onClose: () => void;
}

export function BookingDetails({ booking, onStatusUpdate, onClose }: BookingDetailsProps) {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">{booking.clientName}</h2>
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* Booking Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">Contact Information</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-secondary-700">Name:</span>
              <span className="ml-2 text-secondary-900">{booking.clientName}</span>
            </div>
            <div>
              <span className="font-medium text-secondary-700">Email:</span>
              <span className="ml-2 text-secondary-900">{booking.clientEmail}</span>
            </div>
            {booking.clientPhone && (
              <div>
                <span className="font-medium text-secondary-700">Phone:</span>
                <span className="ml-2 text-secondary-900">{booking.clientPhone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">Booking Details</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-secondary-700">Date:</span>
              <span className="ml-2 text-secondary-900">{new Date(booking.bookingDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-secondary-700">Time:</span>
              <span className="ml-2 text-secondary-900">
                {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
              </span>
            </div>
            {booking.service && (
              <div>
                <span className="font-medium text-secondary-700">Service:</span>
                <span className="ml-2 text-secondary-900">{booking.service.name}</span>
              </div>
            )}
            {booking.location && (
              <div>
                <span className="font-medium text-secondary-700">Location:</span>
                <span className="ml-2 text-secondary-900">{booking.location}</span>
              </div>
            )}
            {booking.budgetRange && (
              <div>
                <span className="font-medium text-secondary-700">Budget:</span>
                <span className="ml-2 text-secondary-900">{booking.budgetRange}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Details */}
      {booking.projectDetails && (
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Project Details</h3>
          <div className="bg-secondary-50 p-4 rounded-md">
            <p className="text-secondary-700">{booking.projectDetails}</p>
          </div>
        </div>
      )}

      {/* Notes */}
      {booking.notes && (
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Notes</h3>
          <div className="bg-secondary-50 p-4 rounded-md">
            <p className="text-secondary-700">{booking.notes}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-secondary-200">
        <div className="flex space-x-2">
          {booking.status === 'pending' && (
            <>
              <Button
                variant="primary"
                onClick={() => onStatusUpdate(booking.id, 'confirmed')}
              >
                Confirm Booking
              </Button>
              <Button
                variant="outline"
                onClick={() => onStatusUpdate(booking.id, 'cancelled')}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Cancel Booking
              </Button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <Button
              variant="primary"
              onClick={() => onStatusUpdate(booking.id, 'completed')}
            >
              Mark as Completed
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