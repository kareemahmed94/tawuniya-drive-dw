'use client';

import { useState, useEffect } from 'react';
import { adminApi, type Service } from '@/lib/admin/api-client';
import type { ServiceCategory } from '@prisma/client';
import { Modal, ErrorMessage } from '@/components/admin';

interface ServiceFormProps {
  service?: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ServiceForm({ service, isOpen, onClose, onSuccess }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: (service?.category || 'OTHER') as ServiceCategory,
    iconUrl: service?.iconUrl || '',
    isActive: service?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        category: service.category,
        iconUrl: service.iconUrl || '',
        isActive: service.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'OTHER',
        iconUrl: '',
        isActive: true,
      });
    }
    setError('');
  }, [service, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Service name is required');
      return;
    }

    if (formData.name.length < 2) {
      setError('Service name must be at least 2 characters');
      return;
    }

    if (formData.iconUrl && !isValidUrl(formData.iconUrl)) {
      setError('Please enter a valid icon URL');
      return;
    }

    setLoading(true);

    try {
      const response = service
        ? await adminApi.updateService(service.id, {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            category: formData.category,
            iconUrl: formData.iconUrl.trim() || null,
            isActive: formData.isActive,
          })
        : await adminApi.createService({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            category: formData.category,
            iconUrl: formData.iconUrl.trim() || null,
            isActive: formData.isActive,
          });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Operation failed');
        if (response.errors) {
          const errorMessages = Object.entries(response.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          setError(errorMessages || response.error || 'Operation failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Edit Service' : 'Create Service'}
      size="md"
    >
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            minLength={2}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Hotel Booking"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="HOSPITALITY">Hospitality</option>
            <option value="RETAIL">Retail</option>
            <option value="DINING">Dining</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            <option value="TRAVEL">Travel</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Optional description for this service"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL</label>
          <input
            type="url"
            value={formData.iconUrl}
            onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com/icon.png"
          />
          {formData.iconUrl && (
            <div className="mt-2">
              <img
                src={formData.iconUrl}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Icon preview</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Leave empty if no icon needed</p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (service ? 'Updating...' : 'Creating...') : service ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

