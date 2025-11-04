'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/lib/api/services/auth.service';
import { transactionService } from '@/lib/api/services/transaction.service';
import { serviceService } from '@/lib/api/services/service.service';
import { walletService } from '@/lib/api/services/wallet.service';
import { Service, ServiceConfig } from '@/lib/api/types';
import { formatCurrency, formatPoints, getServiceCategoryIcon } from '@/lib/utils';
import { toast } from 'sonner';

// Preset amounts for quick actions
const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

export default function EarnPointsPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [earnRule, setEarnRule] = useState<ServiceConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRule, setLoadingRule] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const user = authService.getUser();

  useEffect(() => {
    if (user) {
      loadServices();
      loadBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadEarnRule(selectedService.id);
      setSelectedAmount(null);
    } else {
      setEarnRule(null);
      setSelectedAmount(null);
    }
  }, [selectedService]);

  const loadServices = async () => {
    try {
      const activeServices = await serviceService.getAllServices({ isActive: true });
      setServices(activeServices);
    } catch (error: any) {
      toast.error('Failed to load services');
    }
  };

  const loadBalance = async () => {
    if (!user) return;
    try {
      const currentBalance = await walletService.getBalance(user.id);
      setBalance(currentBalance);
    } catch (error: any) {
      console.error('Failed to load balance:', error);
    }
  };

  const loadEarnRule = async (serviceId: string) => {
    setLoadingRule(true);
    try {
      const rules = await serviceService.getActiveRules(serviceId);
      setEarnRule(rules.earnRule);
    } catch (error: any) {
      toast.error('Failed to load earning rules');
      setEarnRule(null);
    } finally {
      setLoadingRule(false);
    }
  };

  const calculatePoints = (amount: number): number => {
    if (!earnRule) return 0;

    // Check minimum amount
    if (earnRule.minAmount && amount < Number(earnRule.minAmount)) {
      return 0;
    }

    // Calculate: (amount / unitAmount) * pointsPerUnit
    const points = (amount / Number(earnRule.unitAmount)) * Number(earnRule.pointsPerUnit);
    
    // Apply max points limit if exists
    const finalPoints = earnRule.maxPoints && points > Number(earnRule.maxPoints)
      ? Number(earnRule.maxPoints)
      : points;

    return Math.round(finalPoints * 100) / 100;
  };

  const handleQuickEarn = async (amount: number) => {
    if (!user || !selectedService || !earnRule) {
      toast.error('Please select a service first');
      return;
    }

    if (earnRule.minAmount && amount < Number(earnRule.minAmount)) {
      toast.error(`Minimum amount is ${formatCurrency(Number(earnRule.minAmount))}`);
      return;
    }

    const pointsToEarn = calculatePoints(amount);
    if (pointsToEarn === 0) {
      toast.error('Invalid amount for this service');
      return;
    }

    setLoading(true);
    try {
      const result = await transactionService.earnPoints({
        userId: user.id,
        serviceId: selectedService.id,
        amount: amount,
        description: `${selectedService.name} - ${formatCurrency(amount)}`,
      });

      toast.success(
        `Successfully earned ${formatPoints(result.pointsEarned)} points!`
      );
      
      // Reset selection
      setSelectedService(null);
      setSelectedAmount(null);
      
      // Reload balance
      loadBalance();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to earn points';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Earn Points</h1>
          <p className="mt-1 text-sm lg:text-base text-gray-600">
            Select a service and choose an amount to earn points
          </p>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-green-100 mb-2">Current Balance</p>
              <p className="text-3xl lg:text-4xl font-bold">
                {formatPoints(balance)} <span className="text-lg">points</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Service</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getServiceCategoryIcon(service.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Rules */}
        {selectedService && loadingRule && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading earning rules...</p>
            </CardContent>
          </Card>
        )}

        {/* No Rule Available */}
        {selectedService && !loadingRule && !earnRule && (
          <Alert variant="warning" title="No Earning Rule">
            This service doesn't have an active earning rule. Please contact support.
          </Alert>
        )}

        {/* Earning Options */}
        {selectedService && earnRule && (
          <>
            {/* Rule Info */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-green-700 mb-1">Earning Rate</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatPoints(Number(earnRule.pointsPerUnit))} points per {formatCurrency(Number(earnRule.unitAmount))}
                  </p>
                  {earnRule.minAmount && (
                    <p className="text-xs text-green-700 mt-1">
                      Minimum: {formatCurrency(Number(earnRule.minAmount))}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Amount Buttons */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Amount</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {PRESET_AMOUNTS.map((amount) => {
                  const points = calculatePoints(amount);
                  const isDisabled = points === 0 || (earnRule.minAmount && amount < Number(earnRule.minAmount));
                  const isSelected = selectedAmount === amount;
                  
                  return (
                    <button
                      key={amount}
                      onClick={() => !isDisabled && setSelectedAmount(amount)}
                      disabled={isDisabled || loading}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 bg-white hover:border-blue-300 active:scale-95'
                      }`}
                    >
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</p>
                        {points > 0 && (
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            +{formatPoints(points)}
                          </p>
                        )}
                        {isDisabled && earnRule.minAmount && (
                          <p className="text-xs text-gray-500 mt-1">Min required</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Earn Button */}
            {selectedAmount && (
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-blue-100 mb-2">You will earn</p>
                    <p className="text-4xl font-bold mb-2">
                      +{formatPoints(calculatePoints(selectedAmount))}
                    </p>
                    <p className="text-sm text-blue-100">
                      for {formatCurrency(selectedAmount)} transaction
                    </p>
                  </div>
                  <Button
                    onClick={() => handleQuickEarn(selectedAmount)}
                    isLoading={loading}
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 text-lg"
                  >
                    Earn Points Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Expiry Warning */}
            {earnRule.expiryDays && (
              <Alert variant="warning" title="⚠️ Points Expiry">
                Points earned from this service will expire after {earnRule.expiryDays} days.
              </Alert>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
