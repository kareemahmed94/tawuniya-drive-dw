'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi, type AdminUser } from '@/lib/admin/api-client';
import type { AdminRole } from '@prisma/client';
import { AdminForm } from '@/components/admin/admins/AdminForm';
import {
  PageHeader,
  FilterBar,
  FilterSelect,
  SearchBar,
  Pagination,
  StatusBadge,
  LoadingState,
  EmptyState,
  DeleteConfirmModal,
} from '@/components/admin';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRole | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadAdmins();
    loadCurrentAdmin();
  }, [currentPage, roleFilter]);

  const loadCurrentAdmin = async () => {
    try {
      const response = await adminApi.getProfile();
      if (response.success && response.data) {
        setCurrentAdmin(response.data);
      }
    } catch (error) {
      console.error('Failed to load current admin:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAdmins({
        page: currentPage,
        limit: 10,
        role: roleFilter || undefined,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setAdmins(response.data.data ?? []);
        setTotalPages(response.data.pagination?.totalPages ?? 1);
      }
    } catch (error) {
      console.error('Failed to load admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadAdmins();
  };

  const handleEdit = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleDelete = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await adminApi.deleteAdmin(selectedAdmin.id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedAdmin(null);
        loadAdmins();
      }
    } catch (error) {
      console.error('Failed to delete admin:', error);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadAdmins();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedAdmin(null);
    loadAdmins();
  };

  return (
    <AdminLayout title="Admin Management">
      <div className="space-y-6">
        <PageHeader
          title="Admins"
          description="Manage admin users and their permissions"
          action={
            currentAdmin?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Admin
              </button>
            )
          }
        />

        <FilterBar>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={handleSearch}
                placeholder="Search by name or email..."
              />
            </div>

            <FilterSelect
              label="Role"
              value={roleFilter}
              onChange={(value) => setRoleFilter(value as AdminRole | '')}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'SUPER_ADMIN', label: 'Super Admin' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'STAFF', label: 'Staff' },
              ]}
            />
          </div>
        </FilterBar>

        {/* Admins Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <LoadingState />
          ) : admins.length === 0 ? (
            <EmptyState
              title="No admins found"
              description="Try adjusting your search or filter to find what you're looking for."
            />
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {admin.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={admin.role.replace('_', ' ')} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.phone || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(admin)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {currentAdmin?.role === 'SUPER_ADMIN' && admin.id !== currentAdmin.id && (
                            <button
                              onClick={() => handleDelete(admin)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <AdminForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <AdminForm
        admin={selectedAdmin || undefined}
        currentAdmin={currentAdmin || undefined}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdmin(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete ${selectedAdmin?.name}? This action cannot be undone.`}
      />
    </AdminLayout>
  );
}
