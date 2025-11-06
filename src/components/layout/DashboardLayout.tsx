'use client';

import { ReactNode } from 'react';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileNavigation } from './MobileNavigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Responsive Dashboard Layout
 * - Desktop/Web: Top navigation bar
 * - Mobile: Bottom navigation bar
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Navigation items for user-facing pages
  const navigation = [
    { name: 'Home', href: '/home', icon: '🏠' },
    { name: 'Earn', href: '/transactions/earn', icon: '➕' },
    { name: 'Use', href: '/transactions/burn', icon: '💳' },
    { name: 'History', href: '/transactions/history', icon: '📜' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {/* Desktop Top Navigation */}
      <DesktopNavigation items={navigation} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:pt-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation items={navigation} />
    </div>
  );
}
