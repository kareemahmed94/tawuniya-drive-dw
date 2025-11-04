'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi, type Service } from '@/lib/admin/api-client';
import type { ServiceCategory } from '@prisma/client';
import {
  PageHeader,
  ErrorMessage,
  FilterBar,
  FilterSelect,
  SearchBar,
  Pagination,
  DeleteConfirmModal,
} from '@/components/admin';
import { ServiceGrid } from '@/components/admin/services/ServiceGrid';
import { ServiceForm } from '@/components/admin/services/ServiceForm';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, [currentPage, statusFilter, categoryFilter]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getServices({
        page: currentPage,
        limit: 12,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setServices(response.data.data ?? []);
        setTotalPages(response.data.pagination?.totalPages ?? 1);
      } else {
        setError(response.error || 'Failed to load services');
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      setError(error instanceof Error ? error.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadServices();
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      setError(null);
      const response = await adminApi.toggleServiceStatus(service.id, !service.isActive);
      if (response.success) {
        loadServices();
      } else {
        setError(response.error || 'Failed to update service status');
      }
    } catch (error) {
      console.error('Failed to toggle service status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update service status');
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleDelete = (service: Service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedService) return;

    try {
      setError(null);
      const response = await adminApi.deleteService(selectedService.id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedService(null);
        loadServices();
      } else {
        setError(response.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete service');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadServices();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedService(null);
    loadServices();
  };

  return (
    <AdminLayout title="Service Management">
      <div className="space-y-6">
        <PageHeader
          title="Services"
          description="Manage payment services and their configurations"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Service
            </button>
          }
        />

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <FilterBar>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={handleSearch}
                placeholder="Search by name..."
              />
            </div>

            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />

            <FilterSelect
              label="Category"
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value as ServiceCategory | 'all')}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'HOSPITALITY', label: 'Hospitality' },
                { value: 'RETAIL', label: 'Retail' },
                { value: 'DINING', label: 'Dining' },
                { value: 'ENTERTAINMENT', label: 'Entertainment' },
                { value: 'TRAVEL', label: 'Travel' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
          </div>
        </FilterBar>

        <ServiceGrid
          services={services}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onCreateNew={() => setShowCreateModal(true)}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <ServiceForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ServiceForm
        service={selectedService || undefined}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedService(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedService(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete ${selectedService?.name}? This action cannot be undone.`}
      />
    </AdminLayout>
  );
}
