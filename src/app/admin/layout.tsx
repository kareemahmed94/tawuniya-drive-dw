'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminApi } from '@/lib/admin/api-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      return;
    }

    // Check if user is authenticated
    const token = adminApi.getToken();
    if (!token) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // Don't wrap login page with layout
  if (pathname === '/admin/login') {
    return children;
  }

  return children;
}

