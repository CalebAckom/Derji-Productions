import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BookingList } from '@/components/admin/BookingList';
import { BookingDetails } from '@/components/admin/BookingDetails';
import { Modal, ModalHeader, ModalBody } from '@/components/ui';
import { Booking } from '@/types';
import { get, put } from '@/utils/api';

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    loadBookings();
  }, [filters]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.search) queryParams.append('search', filters.search);
      
      const bookingData = await get<Booking[]>(`/bookings?${queryParams.toString()}`);
      setBookings(bookingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = async (bookingId: string, status: Booking['status']) => {
    try {
      await put(`/bookings/${bookingId}`, { status });
      await loadBookings();
      
      // Update selected booking if it's the one being updated
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedBooking(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Booking Management</h1>
            <p className="text-secondary-600 mt-2">
              Manage client bookings and appointments.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <BookingList
          bookings={bookings}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onViewDetails={handleViewDetails}
          onStatusUpdate={handleStatusUpdate}
        />

        <Modal isOpen={isDetailsOpen} onClose={handleCloseDetails}>
          <ModalHeader>
            Booking Details
          </ModalHeader>
          <ModalBody>
            {selectedBooking && (
              <BookingDetails
                booking={selectedBooking}
                onStatusUpdate={handleStatusUpdate}
                onClose={handleCloseDetails}
              />
            )}
          </ModalBody>
        </Modal>
      </div>
    </AdminLayout>
  );
}