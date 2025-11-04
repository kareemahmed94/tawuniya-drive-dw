'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { authService } from '@/lib/api/services/auth.service';
import { serviceService } from '@/lib/api/services/service.service';
import { Service, ServiceCategory, ServiceConfig } from '@/lib/api/types';
import { getServiceCategoryIcon, formatPoints, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | ''>('');
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceRules, setServiceRules] = useState<{
    earnRule: ServiceConfig | null;
    burnRule: ServiceConfig | null;
  } | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const allServices = await serviceService.getAllServices({ isActive: true });
      setServices(allServices);
    } catch (error: any) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterServices = useCallback(() => {
    if (!categoryFilter) {
      setFilteredServices(services);
      return;
    }
    setFilteredServices(services.filter(s => s.category === categoryFilter));
  }, [services, categoryFilter]);

  useEffect(() => {
    // Middleware handles authentication, just load services
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterServices();
  }, [filterServices]);

  const handleServiceClick = async (service: Service) => {
    setSelectedService(service);
    try {
      const rules = await serviceService.getActiveRules(service.id);
      setServiceRules(rules);
    } catch (error: any) {
      toast.error('Failed to load service rules');
      setServiceRules(null);
    }
  };

  const getCategoryLabel = (category: ServiceCategory): string => {
    const labels: Record<ServiceCategory, string> = {
      INSURANCE: 'Insurance',
      CAR_WASH: 'Car Wash',
      TOWING: 'Towing',
      RENTAL: 'Rental',
      MAINTENANCE: 'Maintenance',
      OTHER: 'Other',
    };
    return labels[category] || category;
  };

  // Middleware handles authentication - no need to get user here

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Services</h1>
          <p className="mt-2 text-gray-600">
            Browse services where you can earn or redeem points
          </p>
        </div>

        {/* Category Filter */}
        <Card>
          <CardContent className="pt-6">
            <Select
              label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ServiceCategory | '')}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'INSURANCE', label: '🛡️ Insurance' },
                { value: 'CAR_WASH', label: '🚗 Car Wash' },
                { value: 'TOWING', label: '🚙 Towing' },
                { value: 'RENTAL', label: '🚘 Rental' },
                { value: 'MAINTENANCE', label: '🔧 Maintenance' },
                { value: 'OTHER', label: '📦 Other' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Services Grid */}
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="text-gray-600">Loading services...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : filteredServices.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-gray-500">No services found</p>
                <p className="mt-2 text-sm text-gray-400">
                  {categoryFilter ? 'Try selecting a different category' : 'No active services available'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-300"
                onClick={() => handleServiceClick(service)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {getServiceCategoryIcon(service.category)}
                      </span>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <Badge className="mt-1 bg-blue-100 text-blue-800">
                          {getCategoryLabel(service.category)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href="/transactions/earn"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <button className="w-full rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
                        Earn Points
                      </button>
                    </Link>
                    <Link
                      href="/transactions/burn"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <button className="w-full rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                        Use Points
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Service Details Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 py-4">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => {
                  setSelectedService(null);
                  setServiceRules(null);
                }}
              ></div>

              <div className="relative inline-block w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">
                      {getServiceCategoryIcon(selectedService.category)}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {selectedService.name}
                      </h3>
                      <Badge className="mt-1 bg-blue-100 text-blue-800">
                        {getCategoryLabel(selectedService.category)}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setServiceRules(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {selectedService.description && (
                  <p className="text-gray-600 mb-6">{selectedService.description}</p>
                )}

                <div className="space-y-6">
                  {/* Earning Rules */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      💰 Earning Rules
                    </h4>
                    {serviceRules?.earnRule ? (
                      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                        <div className="space-y-2 text-sm text-green-800">
                          <p>
                            <strong>{formatPoints(Number(serviceRules.earnRule.pointsPerUnit))} points</strong> per{' '}
                            <strong>{formatCurrency(Number(serviceRules.earnRule.unitAmount))}</strong>
                          </p>
                          {serviceRules.earnRule.minAmount && (
                            <p>Minimum amount: {formatCurrency(Number(serviceRules.earnRule.minAmount))}</p>
                          )}
                          {serviceRules.earnRule.maxPoints && (
                            <p>Maximum points per transaction: {formatPoints(Number(serviceRules.earnRule.maxPoints))}</p>
                          )}
                          {serviceRules.earnRule.expiryDays && (
                            <p className="text-orange-700 font-medium">
                              ⚠️ Points expire after {serviceRules.earnRule.expiryDays} days
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No earning rules available</p>
                    )}
                  </div>

                  {/* Burning Rules */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      💳 Redemption Rules
                    </h4>
                    {serviceRules?.burnRule ? (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <div className="space-y-2 text-sm text-red-800">
                          <p>
                            <strong>{formatPoints(Number(serviceRules.burnRule.pointsPerUnit))} points</strong> ={' '}
                            <strong>{formatCurrency(Number(serviceRules.burnRule.unitAmount))}</strong>
                          </p>
                          {serviceRules.burnRule.minAmount && (
                            <p>Minimum redemption: {formatCurrency(Number(serviceRules.burnRule.minAmount))}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No redemption rules available</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link href="/transactions/earn" className="flex-1">
                    <button className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">
                      Earn Points
                    </button>
                  </Link>
                  <Link href="/transactions/burn" className="flex-1">
                    <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                      Use Points
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

