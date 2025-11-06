'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/services/auth.service';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      // Users are always customers - admins use separate login
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
