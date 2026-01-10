import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserList } from '@/components/admin/UserList';
import { UserForm } from '@/components/admin/UserForm';
import { Button, Modal, ModalHeader, ModalBody } from '@/components/ui';
import { User } from '@/types';
import { get, del } from '@/utils/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    role: '',
    search: ''
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.search) queryParams.append('search', filters.search);
      
      const userData = await get<User[]>(`/users?${queryParams.toString()}`);
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await del(`/users/${id}`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    loadUsers();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">User Management</h1>
            <p className="text-secondary-600 mt-2">
              Manage system users and their permissions.
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            Add User
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <UserList
          users={users}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal isOpen={isFormOpen} onClose={handleFormCancel}>
          <ModalHeader>
            {editingUser ? 'Edit User' : 'Add User'}
          </ModalHeader>
          <ModalBody>
            <UserForm
              user={editingUser}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </ModalBody>
        </Modal>
      </div>
    </AdminLayout>
  );
}