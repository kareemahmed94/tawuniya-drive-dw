'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { authService } from '@/lib/api/services/auth.service';
import { transactionService } from '@/lib/api/services/transaction.service';
import { serviceService } from '@/lib/api/services/service.service';
import { Transaction, Service, TransactionType } from '@/lib/api/types';
import {
  formatCurrency,
  formatPoints,
  formatRelativeTime,
  formatDateTime,
  getTransactionTypeBadge,
  getTransactionStatusBadge,
  getServiceCategoryIcon,
} from '@/lib/utils';
import { toast } from 'sonner';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Load user only on client side to avoid hydration issues
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    // Middleware handles authentication
    if (user) {
      loadServices();
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, typeFilter, serviceFilter, startDate, endDate, user]);

  const loadServices = async () => {
    try {
      const allServices = await serviceService.getAllServices();
      setServices(allServices);
    } catch (error: any) {
      console.error('Failed to load services:', error);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await transactionService.getTransactions(user.id, {
        page: currentPage,
        limit: 20,
        type: typeFilter || undefined,
        serviceId: serviceFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setTransactions(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error: any) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterReset = () => {
    setTypeFilter('');
    setServiceFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="mt-2 text-gray-600">
            View all your wallet transactions and activity
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as TransactionType | '');
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'EARN', label: 'Earned' },
                  { value: 'BURN', label: 'Burned' },
                  { value: 'EXPIRED', label: 'Expired' },
                  { value: 'ADJUSTMENT', label: 'Adjustment' },
                ]}
              />

              <Select
                label="Service"
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Services' },
                  ...services.map(service => ({
                    value: service.id,
                    label: service.name,
                  })),
                ]}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            {(typeFilter || serviceFilter || startDate || endDate) && (
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={handleFilterReset}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="text-gray-600">Loading transactions...</p>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions found</p>
                <p className="mt-2 text-sm text-gray-400">
                  Try adjusting your filters or start earning points!
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => {
                        const typeBadge = getTransactionTypeBadge(transaction.type);
                        const statusBadge = getTransactionStatusBadge(transaction.status);
                        return (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDateTime(transaction.createdAt)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatRelativeTime(transaction.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {transaction.service
                                    ? getServiceCategoryIcon(transaction.service.category)
                                    : '📦'}
                                </span>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {transaction.service?.name || 'N/A'}
                                  </div>
                                  {transaction.description && (
                                    <div className="text-xs text-gray-500 truncate max-w-xs">
                                      {transaction.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={typeBadge.color}>{typeBadge.label}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`text-sm font-semibold ${
                                  transaction.type === 'EARN'
                                    ? 'text-green-600'
                                    : transaction.type === 'BURN'
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                {transaction.type === 'EARN' ? '+' : '-'}
                                {formatPoints(transaction.points)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatPoints(transaction.balanceAfter)}
                              </div>
                              <div className="text-xs text-gray-500">
                                from {formatPoints(transaction.balanceBefore)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

