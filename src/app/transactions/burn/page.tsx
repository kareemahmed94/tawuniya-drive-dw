'use client';

import { useState, useEffect, useMemo } from 'react';
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

export default function BurnPointsPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [burnRule, setBurnRule] = useState<ServiceConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRule, setLoadingRule] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [selectedPoints, setSelectedPoints] = useState<number | null>(null);
  const user = authService.getUser();

  // Generate preset point amounts based on balance
  const presetPoints = useMemo(() => {
    const amounts = [50, 100, 200, 500, 1000];
    return amounts.filter(amount => amount <= balance).slice(0, 5);
  }, [balance]);

  useEffect(() => {
    if (user) {
      loadServices();
      loadBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadBurnRule(selectedService.id);
      setSelectedPoints(null);
    } else {
      setBurnRule(null);
      setSelectedPoints(null);
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

  const loadBurnRule = async (serviceId: string) => {
    setLoadingRule(true);
    try {
      const rules = await serviceService.getActiveRules(serviceId);
      setBurnRule(rules.burnRule);
    } catch (error: any) {
      toast.error('Failed to load redemption rules');
      setBurnRule(null);
    } finally {
      setLoadingRule(false);
    }
  };

  const calculateSAR = (points: number): number => {
    if (!burnRule) return 0;

    // Calculate: (points / pointsPerUnit) * unitAmount
    const sar = (points / Number(burnRule.pointsPerUnit)) * Number(burnRule.unitAmount);
    return Math.round(sar * 100) / 100;
  };

  const handleQuickBurn = async (points: number) => {
    if (!user || !selectedService || !burnRule) {
      toast.error('Please select a service first');
      return;
    }

    if (points > balance) {
      toast.error(`You don't have enough points. Your balance is ${formatPoints(balance)} points.`);
      return;
    }

    if (points <= 0) {
      toast.error('Please select a valid amount of points');
      return;
    }

    setLoading(true);
    try {
      const result = await transactionService.burnPoints({
        userId: user.id,
        serviceId: selectedService.id,
        points: points,
        description: `${selectedService.name} - ${formatPoints(points)} points`,
      });

      toast.success(
        `Successfully used ${formatPoints(result.pointsBurned)} points! You saved ${formatCurrency(result.amountInSAR)}.`
      );

      // Reset selection
      setSelectedService(null);
      setSelectedPoints(null);

      // Reload balance
      loadBalance();

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/home');
      }, 1500);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to use points';
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Use Points</h1>
          <p className="mt-1 text-sm lg:text-base text-gray-600">
            Redeem your points to get discounts on services
          </p>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-purple-100 mb-2">Available Balance</p>
              <p className="text-3xl lg:text-4xl font-bold">
                {formatPoints(balance)} <span className="text-lg">points</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Insufficient Balance Warning */}
        {balance === 0 && (
          <Alert variant="warning" title="No Points Available">
            You don't have any points to redeem. Start earning points first!
          </Alert>
        )}

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
                      ? 'border-purple-500 bg-purple-50 shadow-md'
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading redemption rules...</p>
            </CardContent>
          </Card>
        )}

        {/* No Rule Available */}
        {selectedService && !loadingRule && !burnRule && (
          <Alert variant="warning" title="No Redemption Rule">
            This service doesn't have an active redemption rule. Please contact support.
          </Alert>
        )}

        {/* Redemption Options */}
        {selectedService && burnRule && (
          <>
            {/* Rule Info */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-red-700 mb-1">Redemption Rate</p>
                  <p className="text-lg font-bold text-red-900">
                    {formatPoints(Number(burnRule.pointsPerUnit))} points = {formatCurrency(Number(burnRule.unitAmount))}
                  </p>
                  {burnRule.minAmount && (
                    <p className="text-xs text-red-700 mt-1">
                      Minimum redemption: {formatCurrency(Number(burnRule.minAmount))}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Point Buttons */}
            {presetPoints.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Points</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {presetPoints.map((points) => {
                    const sar = calculateSAR(points);
                    const isSelected = selectedPoints === points;

                    return (
                      <button
                        key={points}
                        onClick={() => setSelectedPoints(points)}
                        disabled={loading}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300 active:scale-95'
                        }`}
                      >
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{formatPoints(points)}</p>
                          {sar > 0 && (
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              = {formatCurrency(sar)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Use All Balance Button */}
            {balance > 0 && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Or use all your points
                    </p>
                    <Button
                      onClick={() => setSelectedPoints(balance)}
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      Use All {formatPoints(balance)} Points
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Burn Button */}
            {selectedPoints && selectedPoints <= balance && (
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-purple-100 mb-2">You will save</p>
                    <p className="text-4xl font-bold mb-2">
                      {formatCurrency(calculateSAR(selectedPoints))}
                    </p>
                    <p className="text-sm text-purple-100">
                      by using {formatPoints(selectedPoints)} points
                    </p>
                  </div>
                  <Button
                    onClick={() => handleQuickBurn(selectedPoints)}
                    isLoading={loading}
                    className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold py-3 text-lg"
                  >
                    Use Points Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Insufficient Balance Warning */}
            {selectedPoints && selectedPoints > balance && (
              <Alert variant="danger" title="Insufficient Balance">
                You don't have enough points. Your current balance is {formatPoints(balance)} points.
              </Alert>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
