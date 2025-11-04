'use client';

import { type Service } from '@/lib/admin/api-client';
import { ServiceCard } from './ServiceCard';
import { LoadingState, EmptyState } from '@/components/admin';

interface ServiceGridProps {
  services: Service[];
  loading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onCreateNew: () => void;
}

export function ServiceGrid({
  services,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateNew,
}: ServiceGridProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="No services found"
        description="Get started by creating a new service."
        action={
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Service
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}

