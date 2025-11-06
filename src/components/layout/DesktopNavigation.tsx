'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/api/services/auth.service';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { User } from '@/lib/api/types';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface DesktopNavigationProps {
  items: NavItem[];
}

/**
 * Top Navigation Bar - Desktop/Web Only
 */
export function DesktopNavigation({ items }: DesktopNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(authService.getUser());
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span className="text-xl font-bold text-blue-600">Tawuniya Wallet</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="text-lg">👤</span>
              {mounted && (
                <span className="hidden xl:inline">{user?.name || 'Profile'}</span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-700 hover:text-gray-900"
            >
              🚪 Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

