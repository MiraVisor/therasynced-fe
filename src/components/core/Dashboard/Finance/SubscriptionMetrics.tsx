'use client';

import { ArrowDown, ArrowUp, CreditCard, TrendingDown, TrendingUp } from 'lucide-react';

import { SubscriptionMetricsSkeleton } from '@/components/ui/skeletons/SubscriptionMetricsSkeleton';
import { SubscriptionMetrics } from '@/services/adminFinanceService';

interface SubscriptionMetricsProps {
  metricsData: SubscriptionMetrics | null;
  isLoading: boolean;
}

export function SubscriptionMetricsComponent({ metricsData, isLoading }: SubscriptionMetricsProps) {
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatCurrency = (value: number): string => {
    return `EUR ${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  if (isLoading) {
    return <SubscriptionMetricsSkeleton />;
  }

  if (!metricsData) {
    return null;
  }

  const planColors = {
    BRONZE: 'primary',
    SILVER: 'info',
    GOLD: 'success',
  } as const;

  const planLabels = {
    BRONZE: 'Bronze',
    SILVER: 'Silver',
    GOLD: 'Gold',
  } as const;

  return (
    <div className="space-y-6">
      {/* Revenue Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/10 rounded-xl p-6 border border-primary/20 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-poppins font-bold text-lg text-charcoal">Revenue Metrics</h2>
          </div>
          <div className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded">Metrics</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">
                Total Revenue
              </div>
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="font-poppins text-2xl font-bold text-charcoal mb-1">
              {formatCurrency(metricsData.totalRevenue)}
            </div>
            <div className="text-xs text-gray-500">Monthly Revenue</div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">ARPU</div>
              <div className="w-2 h-2 rounded-full bg-warning" />
            </div>
            <div className="font-poppins text-2xl font-bold text-charcoal mb-1">
              {formatCurrency(metricsData.averageRevenuePerUser)}
            </div>
            <div className="text-xs text-gray-500">Average Revenue Per User</div>
          </div>
        </div>
      </div>

      {/* Conversion & Churn Section */}
      <div className="bg-gradient-to-br from-info/5 via-info/3 to-info/10 rounded-xl p-6 border border-info/20 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-poppins font-bold text-lg text-charcoal">Conversion & Retention</h3>
          <div className="p-1.5 bg-info/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-info" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">
                Trial to Paid Conversion
              </div>
              <div
                className={`p-2 rounded-lg ${
                  metricsData.trialToPaidConversionRate > 70
                    ? 'bg-success/10'
                    : metricsData.trialToPaidConversionRate > 50
                      ? 'bg-warning/10'
                      : 'bg-error/10'
                }`}
              >
                <TrendingUp
                  className={`h-4 w-4 ${
                    metricsData.trialToPaidConversionRate > 70
                      ? 'text-success'
                      : metricsData.trialToPaidConversionRate > 50
                        ? 'text-warning'
                        : 'text-error'
                  }`}
                />
              </div>
            </div>
            <div className="font-poppins text-3xl font-bold text-charcoal mb-2">
              {metricsData.trialToPaidConversionRate.toFixed(1)}%
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metricsData.trialToPaidConversionRate > 70
                    ? 'bg-gradient-to-r from-success to-success/70'
                    : metricsData.trialToPaidConversionRate > 50
                      ? 'bg-gradient-to-r from-warning to-warning/70'
                      : 'bg-gradient-to-r from-error to-error/70'
                }`}
                style={{
                  width: `${Math.min(metricsData.trialToPaidConversionRate, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">
                Churn Rate
              </div>
              <div
                className={`p-2 rounded-lg ${
                  metricsData.churnRate < 10 ? 'bg-success/10' : 'bg-error/10'
                }`}
              >
                <TrendingDown
                  className={`h-4 w-4 ${metricsData.churnRate < 10 ? 'text-success' : 'text-error'}`}
                />
              </div>
            </div>
            <div className="font-poppins text-3xl font-bold text-charcoal mb-2">
              {metricsData.churnRate.toFixed(1)}%
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metricsData.churnRate < 10
                    ? 'bg-gradient-to-r from-success to-success/70'
                    : 'bg-gradient-to-r from-error to-error/70'
                }`}
                style={{
                  width: `${Math.min(metricsData.churnRate, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-poppins font-bold text-lg text-charcoal">
              Subscription Distribution by Plan
            </h3>
            <p className="text-xs text-gray-500 mt-1">Breakdown of active subscriptions</p>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(metricsData.subscriptionsByPlan).map(([plan, count]) => {
            const planKey = plan as keyof typeof planColors;
            const colorClass = planColors[planKey] || 'primary';
            const label = planLabels[planKey] || plan;
            const percentage =
              metricsData.totalSubscriptions > 0
                ? (count / metricsData.totalSubscriptions) * 100
                : 0;

            const getColorClasses = (color: string) => {
              switch (color) {
                case 'primary':
                  return {
                    dot: 'bg-primary shadow-primary/30',
                    bar: 'bg-gradient-to-r from-primary to-primary/70',
                  };
                case 'info':
                  return {
                    dot: 'bg-info shadow-info/30',
                    bar: 'bg-gradient-to-r from-info to-info/70',
                  };
                case 'success':
                  return {
                    dot: 'bg-success shadow-success/30',
                    bar: 'bg-gradient-to-r from-success to-success/70',
                  };
                default:
                  return {
                    dot: 'bg-primary shadow-primary/30',
                    bar: 'bg-gradient-to-r from-primary to-primary/70',
                  };
              }
            };

            const colors = getColorClasses(colorClass);

            return (
              <div key={plan} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${colors.dot} shadow-lg`} />
                    <span className="font-inter font-semibold text-gray-700">{label} Plan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-poppins text-lg font-bold text-charcoal">
                      {formatNumber(count)}
                    </span>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors.bar}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Changes */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-poppins font-bold text-lg text-charcoal">Plan Changes</h3>
            <p className="text-xs text-gray-500 mt-1">Upgrades and downgrades</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-success/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="text-xs font-inter text-gray-500">Upgrades</div>
                <div className="font-poppins text-2xl font-bold text-charcoal">
                  {formatNumber(metricsData.upgradeCount)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-warning/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <ArrowDown className="h-4 w-4 text-warning" />
              </div>
              <div>
                <div className="text-xs font-inter text-gray-500">Downgrades</div>
                <div className="font-poppins text-2xl font-bold text-charcoal">
                  {formatNumber(metricsData.downgradeCount)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
