'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { authService } from '@/lib/api/services/auth.service';
import { walletService } from '@/lib/api/services/wallet.service';
import { transactionService } from '@/lib/api/services/transaction.service';
import { WalletStatistics, Transaction, PointBalance } from '@/lib/api/types';
import { formatCurrency, formatPoints, formatRelativeTime, getTransactionTypeBadge } from '@/lib/utils';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<WalletStatistics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [expiringPoints, setExpiringPoints] = useState<PointBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    loadDashboardData(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [statsData, transactionsData, expiringData] = await Promise.all([
        walletService.getStatistics(userId),
        transactionService.getTransactions(userId, { limit: 5 }),
        walletService.getExpiringPoints(userId, 30),
      ]);

      setStats(statsData);
      setRecentTransactions(transactionsData.data);
      setExpiringPoints(expiringData.expiringPoints);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Mobile-First Header */}
        <div className="lg:text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="mt-1 text-sm lg:text-base text-gray-600">Welcome back!</p>
        </div>

        {/* Points Expiring Alert - Mobile First */}
        {expiringPoints.length > 0 && (
          <Alert variant="warning" title="⚠️ Points Expiring Soon!">
            <p className="text-sm">
              You have <strong>{formatPoints(expiringPoints.reduce((sum, p) => sum + Number(p.points), 0))} points</strong> expiring in the next 30 days.
            </p>
            <Link href="/transactions/history" className="mt-2 inline-block text-sm font-medium underline">
              View details →
            </Link>
          </Alert>
        )}

        {/* Main Balance Card - Mobile First Large Display */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-100 mb-2">Current Balance</p>
              <p className="text-4xl lg:text-5xl font-bold mb-2">
                {formatPoints(stats?.currentBalance || 0)}
              </p>
              <p className="text-sm text-blue-100">points</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Buttons - Mobile First Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link href="/transactions/earn">
            <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-md active:scale-95 transition-transform">
              <div className="text-center">
                <div className="text-3xl mb-2">➕</div>
                <p className="text-sm font-semibold">Earn</p>
                <p className="text-xs text-green-100 mt-1">Points</p>
              </div>
            </div>
          </Link>

          <Link href="/transactions/burn">
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-md active:scale-95 transition-transform">
              <div className="text-center">
                <div className="text-3xl mb-2">💳</div>
                <p className="text-sm font-semibold">Use</p>
                <p className="text-xs text-purple-100 mt-1">Points</p>
              </div>
            </div>
          </Link>

          <Link href="/transactions/history">
            <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white shadow-md active:scale-95 transition-transform">
              <div className="text-center">
                <div className="text-3xl mb-2">📜</div>
                <p className="text-sm font-semibold">History</p>
                <p className="text-xs text-orange-100 mt-1">Transactions</p>
              </div>
            </div>
          </Link>

          <Link href="/services">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 text-white shadow-md active:scale-95 transition-transform">
              <div className="text-center">
                <div className="text-3xl mb-2">🚗</div>
                <p className="text-sm font-semibold">Services</p>
                <p className="text-xs text-indigo-100 mt-1">Browse</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards - Mobile First Compact Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs font-medium text-green-700 mb-1">Earned</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  +{formatPoints(stats?.totalEarned || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs font-medium text-red-700 mb-1">Used</p>
                <p className="text-xl lg:text-2xl font-bold text-red-600">
                  -{formatPoints(stats?.totalBurned || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-700 mb-1">Expired</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-600">
                  {formatPoints(stats?.totalExpired || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs font-medium text-blue-700 mb-1">Last 30d</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">
                  +{formatPoints(stats?.recentActivity?.earned || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions - Mobile First List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg lg:text-xl">Recent Activity</CardTitle>
              <Link href="/transactions/history">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No transactions yet.</p>
                <Link href="/transactions/earn">
                  <Button className="mt-4" size="sm">
                    Start Earning Points
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const badge = getTransactionTypeBadge(transaction.type);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'EARN' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <span className="text-lg">
                            {transaction.type === 'EARN' ? '➕' : '💳'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.service?.name || 'Service'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className={`text-sm font-bold ${
                          transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'EARN' ? '+' : '-'}
                          {formatPoints(transaction.points)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
