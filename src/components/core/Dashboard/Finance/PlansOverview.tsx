'use client';

import { PlansOverviewSkeleton } from '@/components/ui/skeletons/PlansOverviewSkeleton';
import { SubscriptionStatsDto } from '@/services/adminFinanceService';

interface PlansOverviewProps {
  subscriptionData: SubscriptionStatsDto | null;
  isLoading: boolean;
}

export function PlansOverview({ subscriptionData, isLoading }: PlansOverviewProps) {
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (isLoading) {
    return <PlansOverviewSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-poppins font-bold text-lg text-charcoal">
            Subscription Plans Distribution
          </h3>
          <p className="text-xs text-gray-500 mt-1">Active subscriptions by tier</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/20 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30" />
                <span className="font-inter font-semibold text-gray-700">Bronze Plan</span>
              </div>
              <div className="px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary">
                Starter
              </div>
            </div>
            <div className="font-poppins text-5xl font-bold text-charcoal mb-3">
              {subscriptionData ? formatNumber(subscriptionData.subscriptionsByPlan.BRONZE) : '0'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">of active plans</span>
                <span className="font-semibold text-primary">
                  {subscriptionData && subscriptionData.totalActive > 0
                    ? `${Math.round((subscriptionData.subscriptionsByPlan.BRONZE / subscriptionData.totalActive) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full"
                    style={{
                      width: `${
                        subscriptionData && subscriptionData.totalActive > 0
                          ? Math.round(
                              (subscriptionData.subscriptionsByPlan.BRONZE /
                                subscriptionData.totalActive) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-info/10 to-info/5 p-6 border border-info/20 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-info shadow-lg shadow-info/30" />
                <span className="font-inter font-semibold text-gray-700">Silver Plan</span>
              </div>
              <div className="px-2 py-1 bg-info/10 rounded text-xs font-medium text-info">
                Popular
              </div>
            </div>
            <div className="font-poppins text-5xl font-bold text-charcoal mb-3">
              {subscriptionData ? formatNumber(subscriptionData.subscriptionsByPlan.SILVER) : '0'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">of active plans</span>
                <span className="font-semibold text-info">
                  {subscriptionData && subscriptionData.totalActive > 0
                    ? `${Math.round((subscriptionData.subscriptionsByPlan.SILVER / subscriptionData.totalActive) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-info to-info/70 h-full rounded-full"
                    style={{
                      width: `${
                        subscriptionData && subscriptionData.totalActive > 0
                          ? Math.round(
                              (subscriptionData.subscriptionsByPlan.SILVER /
                                subscriptionData.totalActive) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-success/10 to-success/5 p-6 border border-success/20 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-success shadow-lg shadow-success/30" />
                <span className="font-inter font-semibold text-gray-700">Gold Plan</span>
              </div>
              <div className="px-2 py-1 bg-success/10 rounded text-xs font-medium text-success">
                Pro
              </div>
            </div>
            <div className="font-poppins text-5xl font-bold text-charcoal mb-3">
              {subscriptionData ? formatNumber(subscriptionData.subscriptionsByPlan.GOLD) : '0'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">of active plans</span>
                <span className="font-semibold text-success">
                  {subscriptionData && subscriptionData.totalActive > 0
                    ? `${Math.round((subscriptionData.subscriptionsByPlan.GOLD / subscriptionData.totalActive) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-success to-success/70 h-full rounded-full"
                    style={{
                      width: `${
                        subscriptionData && subscriptionData.totalActive > 0
                          ? Math.round(
                              (subscriptionData.subscriptionsByPlan.GOLD /
                                subscriptionData.totalActive) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
