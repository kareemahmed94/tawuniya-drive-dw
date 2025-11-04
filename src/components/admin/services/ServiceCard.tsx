'use client';

import { adminApi, type Service } from '@/lib/admin/api-client';
import { StatusBadge } from '@/components/admin';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
}

export function ServiceCard({ service, onEdit, onDelete, onToggleStatus }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
          <p className="text-sm text-gray-500 mt-1 capitalize">{service.category.toLowerCase()}</p>
        </div>
        <StatusBadge status={service.isActive ? 'Active' : 'Inactive'} />
      </div>

      {service.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
      )}

      {service.iconUrl && (
        <div className="mb-4">
          <img
            src={service.iconUrl}
            alt={service.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onToggleStatus(service)}
          className={`p-2 rounded-lg ${
            service.isActive
              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
          }`}
          title={service.isActive ? 'Deactivate' : 'Activate'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                service.isActive
                  ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                  : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              }
            />
          </svg>
        </button>
        <button
          onClick={() => onEdit(service)}
          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg"
          title="Edit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(service)}
          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

