'use client';

import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from 'lucide-react';

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

  if (isLoading) {
    return <SubscriptionMetricsSkeleton />;
  }

  if (!metricsData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Conversion & Retention Section - Unique Metrics */}
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
