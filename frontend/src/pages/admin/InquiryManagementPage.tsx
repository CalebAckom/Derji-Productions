import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { InquiryList } from '@/components/admin/InquiryList';
import { InquiryDetails } from '@/components/admin/InquiryDetails';
import { Modal, ModalHeader, ModalBody } from '@/components/ui';
import { ContactInquiry } from '@/types';
import { get, put } from '@/utils/api';

export default function InquiryManagementPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    loadInquiries();
  }, [filters]);

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.search) queryParams.append('search', filters.search);
      
      const inquiryData = await get<ContactInquiry[]>(`/contact?${queryParams.toString()}`);
      setInquiries(inquiryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = async (inquiryId: string, status: ContactInquiry['status']) => {
    try {
      await put(`/contact/${inquiryId}`, { status });
      await loadInquiries();
      
      // Update selected inquiry if it's the one being updated
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inquiry status');
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedInquiry(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Inquiry Management</h1>
            <p className="text-secondary-600 mt-2">
              Manage client inquiries and contact form submissions.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <InquiryList
          inquiries={inquiries}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onViewDetails={handleViewDetails}
          onStatusUpdate={handleStatusUpdate}
        />

        <Modal isOpen={isDetailsOpen} onClose={handleCloseDetails}>
          <ModalHeader>
            Inquiry Details
          </ModalHeader>
          <ModalBody>
            {selectedInquiry && (
              <InquiryDetails
                inquiry={selectedInquiry}
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