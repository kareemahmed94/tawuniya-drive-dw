'use client';

import { useState } from 'react';
import { adminApi, type AdminUser } from '@/lib/admin/api-client';
import type { AdminRole } from '@prisma/client';
import { Modal, ErrorMessage } from '@/components/admin';

interface AdminFormProps {
  admin?: AdminUser;
  currentAdmin?: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminForm({
  admin,
  currentAdmin,
  isOpen,
  onClose,
  onSuccess,
}: AdminFormProps) {
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    password: '',
    phone: admin?.phone || '',
    role: (admin?.role || 'ADMIN') as AdminRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!admin;
  const canEditRole = currentAdmin?.role === 'SUPER_ADMIN' && (!admin || currentAdmin.id !== admin.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        const updateData: Record<string, string> = {
          name: formData.name,
          email: formData.email,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        if (formData.phone) {
          updateData.phone = formData.phone;
        }

        if (canEditRole) {
          updateData.role = formData.role;
        }

        const response = await adminApi.updateAdmin(admin.id, updateData);
        if (response.success) {
          onSuccess();
        } else {
          setError(response.error || 'Failed to update admin');
        }
      } else {
        const response = await adminApi.createAdmin(formData);
        if (response.success) {
          onSuccess();
        } else {
          setError(response.error || 'Failed to create admin');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Admin' : 'Create New Admin'}
      size="md"
    >
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isEdit ? 'New Password (leave empty to keep current)' : 'Password'}
          </label>
          <input
            type="password"
            required={!isEdit}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="+966501234567"
          />
        </div>

        {canEditRole && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Admin' : 'Create Admin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

