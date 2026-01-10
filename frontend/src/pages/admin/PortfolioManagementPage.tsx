import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PortfolioList } from '@/components/admin/PortfolioList';
import { PortfolioForm } from '@/components/admin/PortfolioForm';
import { Button, Modal, ModalHeader, ModalBody } from '@/components/ui';
import { PortfolioItem } from '@/types';
import { get, del } from '@/utils/api';

export default function PortfolioManagementPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    featured: '',
    search: ''
  });

  useEffect(() => {
    loadPortfolioItems();
  }, [filters]);

  const loadPortfolioItems = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.featured) queryParams.append('featured', filters.featured);
      if (filters.search) queryParams.append('search', filters.search);
      
      const items = await get<PortfolioItem[]>(`/portfolio?${queryParams.toString()}`);
      setPortfolioItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      await del(`/portfolio/${id}`);
      await loadPortfolioItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio item');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    loadPortfolioItems();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Portfolio Management</h1>
            <p className="text-secondary-600 mt-2">
              Manage your portfolio items and media content.
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            Add Portfolio Item
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <PortfolioList
          items={portfolioItems}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal isOpen={isFormOpen} onClose={handleFormCancel}>
          <ModalHeader>
            {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </ModalHeader>
          <ModalBody>
            <PortfolioForm
              item={editingItem}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </ModalBody>
        </Modal>
      </div>
    </AdminLayout>
  );
}