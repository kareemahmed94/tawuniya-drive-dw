'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  adminApi,
  type ServiceAnalytics,
  type UserEngagementMetrics,
  type ExpiryAnalytics,
  type TransactionTrend,
} from '@/lib/admin/api-client';

export default function AnalyticsPage() {
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics[]>([]);
  const [engagement, setEngagement] = useState<UserEngagementMetrics | null>(null);
  const [expiry, setExpiry] = useState<ExpiryAnalytics | null>(null);
  const [trends, setTrends] = useState<TransactionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendDays, setTrendDays] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    loadAnalytics();
  }, [trendDays]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesRes, engagementRes, expiryRes, trendsRes] = await Promise.all([
        adminApi.getServiceAnalytics(),
        adminApi.getUserEngagementMetrics(),
        adminApi.getExpiryAnalytics(),
        adminApi.getTransactionTrends(trendDays),
      ]);

      if (servicesRes.success && servicesRes.data) {
        setServiceAnalytics(servicesRes.data);
      }
      if (engagementRes.success && engagementRes.data) {
        setEngagement(engagementRes.data);
      }
      if (expiryRes.success && expiryRes.data) {
        setExpiry(expiryRes.data);
      }
      if (trendsRes.success && trendsRes.data) {
        setTrends(trendsRes.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* User Engagement Metrics */}
        {engagement && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">User Engagement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Users"
                value={engagement.totalUsers.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
                color="blue"
              />
              <MetricCard
                label="Active (Last 30 Days)"
                value={engagement.activeUsersLast30Days.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                color="green"
              />
              <MetricCard
                label="New Users (Last 30 Days)"
                value={engagement.newUsersLast30Days.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                }
                color="purple"
              />
              <MetricCard
                label="Avg Transactions/User"
                value={engagement.avgTransactionsPerUser.toFixed(1)}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
                color="indigo"
              />
            </div>

            {/* Top Users Table */}
            {engagement.topUsers.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Top Users by Balance</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earned</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Burned</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Balances</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {engagement.topUsers.map((user) => (
                        <tr key={user.userId} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                            <div className="text-xs text-gray-500">{user.userEmail}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {user.balance.toLocaleString()} pts
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600">
                            +{user.totalEarned.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            -{user.totalBurned.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.activeBalances}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Points Expiry Analytics */}
        {expiry && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Points Expiry Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard
                label="Expiring (7 Days)"
                value={expiry.pointsExpiringNext7Days.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="orange"
              />
              <MetricCard
                label="Expiring (30 Days)"
                value={expiry.pointsExpiringNext30Days.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="yellow"
              />
              <MetricCard
                label="Expired (Last 30 Days)"
                value={expiry.pointsExpiredLast30Days.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                color="red"
              />
              <MetricCard
                label="Total Expired (All Time)"
                value={expiry.totalExpiredPoints.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                color="gray"
              />
              <MetricCard
                label="Affected Users"
                value={expiry.affectedUsers.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
                color="pink"
              />
            </div>
          </div>
        )}

        {/* Service Analytics */}
        {serviceAnalytics.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Service Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Transactions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Burn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points Earned</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points Burned</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serviceAnalytics.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{service.category.toLowerCase()}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {service.totalTransactions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {service.earnTransactions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {service.burnTransactions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        +{service.totalPointsEarned.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">
                        -{service.totalPointsBurned.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        ${service.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Service Performance Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Points Distribution by Service</h4>
              <div className="space-y-2">
                {serviceAnalytics
                  .filter((s) => s.totalPointsEarned + s.totalPointsBurned > 0)
                  .map((service) => {
                    const total = serviceAnalytics.reduce(
                      (sum, s) => sum + s.totalPointsEarned + s.totalPointsBurned,
                      0
                    );
                    const percentage = total > 0 ? ((service.totalPointsEarned + service.totalPointsBurned) / total) * 100 : 0;
                    return (
                      <div key={service.id} className="flex items-center">
                        <div className="w-32 text-sm text-gray-700 truncate">{service.name}</div>
                        <div className="flex-1 mx-4">
                          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-right text-sm text-gray-600">
                          {(service.totalPointsEarned + service.totalPointsBurned).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Trends */}
        {trends.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Transaction Trends</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setTrendDays(7)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    trendDays === 7
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTrendDays(30)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    trendDays === 30
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setTrendDays(90)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    trendDays === 90
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  90 Days
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Transactions</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {trends.reduce((sum, t) => sum + t.earnTransactions + t.burnTransactions, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600">Total Points Earned</div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {trends.reduce((sum, t) => sum + t.pointsEarned, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600">Total Points Burned</div>
                <div className="text-2xl font-bold text-red-900 mt-1">
                  {trends.reduce((sum, t) => sum + t.pointsBurned, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600">Total Revenue</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  ${trends.reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Transaction Trends Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Transaction Volume</h4>
              <SimpleLineChart data={trends} />
            </div>

            {/* Points Trends Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Points Flow (Earned vs Burned)</h4>
              <SimpleAreaChart data={trends} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'indigo' | 'orange' | 'yellow' | 'red' | 'gray' | 'pink';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

// Simple Line Chart Component
function SimpleLineChart({ data }: { data: TransactionTrend[] }) {
  const maxValue = Math.max(
    ...data.map((d) => d.earnTransactions + d.burnTransactions),
    1
  );
  const chartHeight = 200;

  return (
    <div className="relative" style={{ height: `${chartHeight + 40}px` }}>
      <svg className="w-full h-full" viewBox={`0 0 ${data.length * 40} ${chartHeight + 40}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={chartHeight * ratio + 20}
            x2={data.length * 40}
            y2={chartHeight * ratio + 20}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Data line */}
        <polyline
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2"
          points={data
            .map(
              (d, i) =>
                `${i * 40 + 20},${chartHeight + 20 - (d.earnTransactions + d.burnTransactions) / maxValue * chartHeight}`
            )
            .join(' ')}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const y = chartHeight + 20 - (d.earnTransactions + d.burnTransactions) / maxValue * chartHeight;
          return (
            <circle
              key={i}
              cx={i * 40 + 20}
              cy={y}
              r="4"
              fill="#4f46e5"
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) {
            return (
              <text
                key={i}
                x={i * 40 + 20}
                y={chartHeight + 35}
                textAnchor="middle"
                className="text-xs fill-gray-600"
                fontSize="10"
              >
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}

// Simple Area Chart Component
function SimpleAreaChart({ data }: { data: TransactionTrend[] }) {
  const maxPoints = Math.max(
    ...data.map((d) => Math.max(d.pointsEarned, d.pointsBurned)),
    1
  );
  const chartHeight = 200;

  return (
    <div className="relative" style={{ height: `${chartHeight + 40}px` }}>
      <svg className="w-full h-full" viewBox={`0 0 ${data.length * 40} ${chartHeight + 40}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={chartHeight * ratio + 20}
            x2={data.length * 40}
            y2={chartHeight * ratio + 20}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Earned area */}
        <polygon
          fill="#10b981"
          fillOpacity="0.3"
          points={`0,${chartHeight + 20} ${data
            .map(
              (d, i) =>
                `${i * 40 + 20},${chartHeight + 20 - (d.pointsEarned / maxPoints) * chartHeight}`
            )
            .join(' ')} ${data.length * 40 - 20},${chartHeight + 20}`}
        />

        {/* Burned area */}
        <polygon
          fill="#ef4444"
          fillOpacity="0.3"
          points={`0,${chartHeight + 20} ${data
            .map(
              (d, i) =>
                `${i * 40 + 20},${chartHeight + 20 - (d.pointsBurned / maxPoints) * chartHeight}`
            )
            .join(' ')} ${data.length * 40 - 20},${chartHeight + 20}`}
        />

        {/* Earned line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          points={data
            .map(
              (d, i) =>
                `${i * 40 + 20},${chartHeight + 20 - (d.pointsEarned / maxPoints) * chartHeight}`
            )
            .join(' ')}
        />

        {/* Burned line */}
        <polyline
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          points={data
            .map(
              (d, i) =>
                `${i * 40 + 20},${chartHeight + 20 - (d.pointsBurned / maxPoints) * chartHeight}`
            )
            .join(' ')}
        />

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) {
            return (
              <text
                key={i}
                x={i * 40 + 20}
                y={chartHeight + 35}
                textAnchor="middle"
                className="text-xs fill-gray-600"
                fontSize="10"
              >
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          }
          return null;
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Points Earned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Points Burned</span>
        </div>
      </div>
    </div>
  );
}

