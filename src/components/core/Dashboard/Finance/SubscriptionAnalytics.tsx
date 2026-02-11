'use client';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

import { SubscriptionAnalyticsSkeleton } from '@/components/ui/skeletons/SubscriptionAnalyticsSkeleton';
import { SubscriptionStatusSkeleton } from '@/components/ui/skeletons/SubscriptionStatusSkeleton';
import { SubscriptionStatsDto } from '@/services/adminFinanceService';

interface SubscriptionAnalyticsProps {
  subscriptionData: SubscriptionStatsDto | null;
  isLoading: boolean;
}

export function SubscriptionAnalytics({ subscriptionData, isLoading }: SubscriptionAnalyticsProps) {
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (isLoading) {
    return (
      <>
        <SubscriptionStatusSkeleton />
        <SubscriptionAnalyticsSkeleton />
      </>
    );
  }

  return (
    <>
      {/* Subscription Status */}
      <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-poppins font-bold text-lg text-charcoal">Subscription Status</h3>
            <p className="text-xs text-gray-500 mt-1">Current subscription distribution</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <div className="text-xs font-inter text-gray-500 uppercase">Total</div>
            <div className="font-poppins font-bold text-charcoal">
              {subscriptionData
                ? formatNumber(
                    subscriptionData.totalActive +
                      subscriptionData.totalTrialing +
                      subscriptionData.totalCanceled +
                      subscriptionData.totalPastDue +
                      subscriptionData.totalUnpaid,
                  )
                : '0'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="group flex flex-col items-center justify-center p-4 bg-success/5 rounded-lg border border-success/20 cursor-pointer">
            <div className="p-2 bg-success/10 rounded-full mb-2">
              <Users className="h-4 w-4 text-success" />
            </div>
            <div className="font-poppins text-2xl font-bold text-charcoal">
              {subscriptionData ? formatNumber(subscriptionData.totalActive) : '0'}
            </div>
            <div className="text-xs font-inter font-medium text-gray-600 mt-1">Active</div>
          </div>
          <div className="group flex flex-col items-center justify-center p-4 bg-warning/5 rounded-lg border border-warning/20 cursor-pointer">
            <div className="p-2 bg-warning/10 rounded-full mb-2">
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <div className="font-poppins text-2xl font-bold text-charcoal">
              {subscriptionData ? formatNumber(subscriptionData.totalTrialing) : '0'}
            </div>
            <div className="text-xs font-inter font-medium text-gray-600 mt-1">Trialing</div>
          </div>
          <div className="group flex flex-col items-center justify-center p-4 bg-error/5 rounded-lg border border-error/20 cursor-pointer">
            <div className="p-2 bg-error/10 rounded-full mb-2">
              <XCircle className="h-4 w-4 text-error" />
            </div>
            <div className="font-poppins text-2xl font-bold text-charcoal">
              {subscriptionData ? formatNumber(subscriptionData.totalCanceled) : '0'}
            </div>
            <div className="text-xs font-inter font-medium text-gray-600 mt-1">Cancelled</div>
          </div>
          <div className="group flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer">
            <div className="p-2 bg-orange-100 rounded-full mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="font-poppins text-2xl font-bold text-charcoal">
              {subscriptionData ? formatNumber(subscriptionData.totalPastDue) : '0'}
            </div>
            <div className="text-xs font-inter font-medium text-gray-600 mt-1">Past Due</div>
          </div>
          <div className="group flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200 cursor-pointer">
            <div className="p-2 bg-red-100 rounded-full mb-2">
              <Zap className="h-4 w-4 text-red-500" />
            </div>
            <div className="font-poppins text-2xl font-bold text-charcoal">
              {subscriptionData ? formatNumber(subscriptionData.totalUnpaid) : '0'}
            </div>
            <div className="text-xs font-inter font-medium text-gray-600 mt-1">Unpaid</div>
          </div>
        </div>
      </div>

      {/* Subscription Analytics */}
      <div className="bg-gradient-to-br from-info/5 via-info/3 to-info/10 rounded-xl p-6 border border-info/20 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-poppins font-bold text-lg text-charcoal">Analytics</h3>
          <div className="p-1.5 bg-info/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-info" />
          </div>
        </div>
        <div className="space-y-3">
          {/* Retention Rate - Highlighted */}
          <div className="bg-white/90 backdrop-blur rounded-xl p-5 border border-info/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-inter text-gray-500 uppercase tracking-wide mb-1">
                  Retention Rate
                </div>
                <div className="font-poppins text-4xl font-bold text-charcoal">
                  {subscriptionData ? `${subscriptionData.retentionRate}%` : '0%'}
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success to-success/70 rounded-full"
                style={{
                  width: `${subscriptionData ? subscriptionData.retentionRate : 0}%`,
                }}
              />
            </div>
          </div>

          {/* New & Cancelled */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <div className="text-xs font-inter text-gray-500">New this month</div>
                    <div className="font-poppins text-2xl font-bold text-charcoal">
                      {subscriptionData
                        ? formatNumber(subscriptionData.newSubscriptionsThisMonth)
                        : '0'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error/10 rounded-lg">
                    <ArrowDownRight className="h-4 w-4 text-error" />
                  </div>
                  <div>
                    <div className="text-xs font-inter text-gray-500">Cancelled this month</div>
                    <div className="font-poppins text-2xl font-bold text-charcoal">
                      {subscriptionData
                        ? formatNumber(subscriptionData.canceledSubscriptionsThisMonth)
                        : '0'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Churn Rate */}
          {subscriptionData &&
            subscriptionData.totalActive > 0 &&
            subscriptionData.canceledSubscriptionsThisMonth > 0 && (
              <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-inter text-gray-500 uppercase tracking-wide">
                    Churn Rate
                  </span>
                  <span className="text-xs font-medium text-error">This Month</span>
                </div>
                <div className="font-poppins text-xl font-bold text-charcoal">
                  {(
                    (subscriptionData.canceledSubscriptionsThisMonth /
                      subscriptionData.totalActive) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
