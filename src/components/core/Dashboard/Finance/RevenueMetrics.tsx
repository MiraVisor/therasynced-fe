'use client';

import { ArrowDownRight, ArrowUpRight, CreditCard } from 'lucide-react';

import { RevenueMetricsSkeleton } from '@/components/ui/skeletons/RevenueMetricsSkeleton';
import { SubscriptionStatsDto } from '@/services/adminFinanceService';

interface RevenueMetricsProps {
  subscriptionData: SubscriptionStatsDto | null;
  isLoading: boolean;
}

export function RevenueMetrics({ subscriptionData, isLoading }: RevenueMetricsProps) {
  const formatCurrency = (value: number): string => {
    return `EUR ${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  if (isLoading) {
    return <RevenueMetricsSkeleton />;
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/10 rounded-xl p-6 border border-primary/20 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-poppins font-bold text-lg text-charcoal">Revenue Metrics</h2>
        </div>
        <div className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded">Subscription</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">MRR</div>
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="font-poppins text-2xl font-bold text-charcoal mb-1">
            {subscriptionData ? formatCurrency(subscriptionData.monthlyRecurringRevenue) : 'EUR 0'}
          </div>
          <div className="text-xs text-gray-500">Monthly Recurring</div>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">Monthly</div>
            <div className="w-2 h-2 rounded-full bg-info" />
          </div>
          <div className="font-poppins text-2xl font-bold text-charcoal mb-1">
            {subscriptionData ? formatCurrency(subscriptionData.monthlyRevenue) : 'EUR 0'}
          </div>
          {subscriptionData?.lastMonthRevenue !== undefined &&
          subscriptionData.lastMonthRevenue !== 0 ? (
            <div className="flex items-center gap-1">
              {subscriptionData.monthlyRevenue >= subscriptionData.lastMonthRevenue ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-success" />
                  <span className="text-xs text-success font-medium">
                    {(
                      ((subscriptionData.monthlyRevenue - subscriptionData.lastMonthRevenue) /
                        subscriptionData.lastMonthRevenue) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-error" />
                  <span className="text-xs text-error font-medium">
                    {(
                      ((subscriptionData.lastMonthRevenue - subscriptionData.monthlyRevenue) /
                        subscriptionData.lastMonthRevenue) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </>
              )}
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400">No comparison data</div>
          )}
        </div>
        <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">ARR</div>
            <div className="w-2 h-2 rounded-full bg-success" />
          </div>
          <div className="font-poppins text-2xl font-bold text-charcoal mb-1">
            {subscriptionData ? formatCurrency(subscriptionData.annualRecurringRevenue) : 'EUR 0'}
          </div>
          <div className="text-xs text-gray-500">Annual Recurring</div>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">ARPU</div>
            <div className="w-2 h-2 rounded-full bg-warning" />
          </div>
          <div className="font-poppins text-2xl font-bold text-charcoal mb-1">
            {subscriptionData
              ? formatCurrency(subscriptionData.averageRevenuePerSubscription)
              : 'EUR 0'}
          </div>
          <div className="text-xs text-gray-500">Avg per User</div>
        </div>
      </div>
    </div>
  );
}
