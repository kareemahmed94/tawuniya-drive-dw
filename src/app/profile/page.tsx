'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/lib/api/services/auth.service';
import { User } from '@/lib/api/types';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);

      // Parse name into first_name and last_name
      const nameParts = profile.name?.split(' ') || [];
      setFormData({
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: profile.email || '',
        phone: profile.phone || '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error('Failed to load profile');
      router.push('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.phone && !/^\+966[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format +966XXXXXXXXX';
    }

    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const updateData: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string | null;
        password?: string;
      } = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedProfile = await authService.updateProfile(updateData);

      // Update localStorage
      authService.saveUser(updatedProfile);

      toast.success('Profile updated successfully!');

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

      // Reload profile
      await loadProfile();
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm lg:text-base text-gray-600">
            Update your personal information
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  required
                />

                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+966XXXXXXXXX"
              />

              {/* Password Change Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Change Password (Optional)
                </h3>
                <div className="space-y-4">
                  <Input
                    label="New Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Leave blank to keep current password"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {user?.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

