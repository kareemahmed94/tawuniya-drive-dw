'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, type AdminUser } from '@/lib/admin/api-client';

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load admin profile on mount
  const loadProfile = useCallback(async () => {
    const token = adminApi.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await adminApi.getProfile();
      if (response.success && response.data) {
        setAdmin(response.data);
      } else {
        // Invalid token, clear it
        adminApi.logout();
        setAdmin(null);
      }
    } catch (error) {
      console.error('Failed to load admin profile:', error);
      adminApi.logout();
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (email: string, password: string) => {
    try {
      const response = await adminApi.login(email, password);
      
      if (response.success && response.data) {
        setAdmin(response.data.admin);
        router.push('/admin/dashboard');
        return { success: true };
      }

      return {
        success: false,
        error: response.error || 'Login failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const logout = () => {
    adminApi.logout();
    setAdmin(null);
    router.push('/admin/login');
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

