'use client';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { ChartsSkeleton } from '@/components/ui/skeletons/ChartsSkeleton';
import { PlansOverviewSkeleton } from '@/components/ui/skeletons/PlansOverviewSkeleton';
import { RevenueMetricsSkeleton } from '@/components/ui/skeletons/RevenueMetricsSkeleton';
import { SubscriptionAnalyticsSkeleton } from '@/components/ui/skeletons/SubscriptionAnalyticsSkeleton';
import { SubscriptionStatusSkeleton } from '@/components/ui/skeletons/SubscriptionStatusSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import adminFinanceService, {
  AdminRevenueDto,
  SubscriptionStatsDto,
} from '@/services/adminFinanceService';

export default function FinancePage() {
  const [revenueData, setRevenueData] = useState<AdminRevenueDto | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch finance data
  useEffect(() => {
    const fetchFinance = async () => {
      const hasData = revenueData !== null || subscriptionData !== null;
      try {
        if (!hasData) {
          setInitialLoading(true);
        } else {
          setIsLoading(true);
        }
        setError(null);
        const [revenue, subscriptions] = await Promise.all([
          adminFinanceService.getRevenue(),
          adminFinanceService.getSubscriptions(),
        ]);
        setRevenueData(revenue);
        setSubscriptionData(subscriptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load finance data';
        setError(errorMessage);
        // Don't clear data on error if we have existing data
        if (!hasData) {
          setRevenueData(null);
          setSubscriptionData(null);
        }
      } finally {
        setIsLoading(false);
        setInitialLoading(false);
      }
    };

    fetchFinance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show error as toast only on initial load
  useEffect(() => {
    if (error && initialLoading) {
      toast.error(`Failed to load finance data: ${error}`);
    }
  }, [error, initialLoading]);

  // Format currency value
  const formatCurrency = (value: number): string => {
    return `EUR ${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Format number value
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Format Y-axis tick for charts
  const formatYAxisTick = (value: number): string => {
    if (value >= 1000000) {
      return `EUR ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `EUR ${(value / 1000).toFixed(1)}k`;
    } else {
      return `EUR ${value}`;
    }
  };

  const statsData = revenueData
    ? [
        {
          title: 'Total Revenue',
          value: formatCurrency(revenueData.totalRevenue.value),
          trend: {
            value: Math.abs(revenueData.totalRevenue.percentageChange),
            isUp: revenueData.totalRevenue.percentageChange >= 0,
            label: revenueData.totalRevenue.comparisonPeriod,
          },
          icon: DollarSign,
          iconColor: 'text-primary',
          iconBg: 'bg-primary/10',
        },
        {
          title: 'Active Therapists',
          value: formatNumber(revenueData.activeTherapists.value),
          trend: {
            value: Math.abs(revenueData.activeTherapists.percentageChange),
            isUp: revenueData.activeTherapists.percentageChange >= 0,
            label: revenueData.activeTherapists.comparisonPeriod,
          },
          icon: Users,
          iconColor: 'text-success',
          iconBg: 'bg-success/10',
        },
        {
          title: 'Completed Sessions',
          value: formatNumber(revenueData.completedSessions.value),
          trend: {
            value: Math.abs(revenueData.completedSessions.percentageChange),
            isUp: revenueData.completedSessions.percentageChange >= 0,
            label: revenueData.completedSessions.comparisonPeriod,
          },
          icon: Calendar,
          iconColor: 'text-info',
          iconBg: 'bg-info/10',
        },
        {
          title: 'Average session price',
          value: formatCurrency(revenueData.averageSessionPrice.value),
          trend: {
            value: Math.abs(revenueData.averageSessionPrice.percentageChange),
            isUp: revenueData.averageSessionPrice.percentageChange >= 0,
            label: revenueData.averageSessionPrice.comparisonPeriod,
          },
          icon: TrendingUp,
          iconColor: 'text-warning',
          iconBg: 'bg-warning/10',
        },
      ]
    : [
        {
          title: 'Total Revenue',
          value: 'EUR 0',
          trend: undefined,
          icon: DollarSign,
          iconColor: 'text-primary',
          iconBg: 'bg-primary/10',
        },
        {
          title: 'Active Therapists',
          value: '0',
          trend: undefined,
          icon: Users,
          iconColor: 'text-success',
          iconBg: 'bg-success/10',
        },
        {
          title: 'Completed Sessions',
          value: '0',
          trend: undefined,
          icon: Calendar,
          iconColor: 'text-info',
          iconBg: 'bg-info/10',
        },
        {
          title: 'Average session price',
          value: 'EUR 0',
          trend: undefined,
          icon: TrendingUp,
          iconColor: 'text-warning',
          iconBg: 'bg-warning/10',
        },
      ];

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div>
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Finance Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track revenue, subscriptions, and financial metrics
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Section - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Main Stats in 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <EnhancedStatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  trend={stat.trend}
                  icon={Icon}
                  iconColor={stat.iconColor}
                  iconBg={stat.iconBg}
                  interactive
                  loading={initialLoading || (isLoading && !revenueData && !subscriptionData)}
                  onClick={() => {
                    // Navigate to details or show modal
                  }}
                />
              );
            })}
          </div>

          {/* Right: Revenue Metrics */}
          {initialLoading || (isLoading && !revenueData && !subscriptionData) ? (
            <RevenueMetricsSkeleton />
          ) : (
            <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/10 rounded-xl p-6 border border-primary/20 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-poppins font-bold text-lg text-charcoal">Revenue Metrics</h2>
                </div>
                <div className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded">
                  Subscription
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">
                      MRR
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="font-poppins text-2xl font-bold text-charcoal mb-1">
                    {subscriptionData
                      ? formatCurrency(subscriptionData.monthlyRecurringRevenue)
                      : 'EUR 0'}
                  </div>
                  <div className="text-xs text-gray-500">Monthly Recurring</div>
                </div>
                <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">
                      Monthly
                    </div>
                    <div className="w-2 h-2 rounded-full bg-info"></div>
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
                              ((subscriptionData.monthlyRevenue -
                                subscriptionData.lastMonthRevenue) /
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
                              ((subscriptionData.lastMonthRevenue -
                                subscriptionData.monthlyRevenue) /
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
                    <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">
                      ARR
                    </div>
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                  </div>
                  <div className="font-poppins text-2xl font-bold text-charcoal mb-1">
                    {subscriptionData
                      ? formatCurrency(subscriptionData.annualRecurringRevenue)
                      : 'EUR 0'}
                  </div>
                  <div className="text-xs text-gray-500">Annual Recurring</div>
                </div>
                <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-inter text-gray-500 uppercase tracking-wide">
                      ARPU
                    </div>
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
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
          )}
        </div>

        {/* Subscription Overview - Combined Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Status */}
          {isLoading ? (
            <SubscriptionStatusSkeleton />
          ) : (
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-poppins font-bold text-lg text-charcoal">
                    Subscription Status
                  </h3>
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
                  <div className="text-xs font-inter font-medium text-gray-600 mt-1">Canceled</div>
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
          )}

          {/* Subscription Analytics */}
          {isLoading ? (
            <SubscriptionAnalyticsSkeleton />
          ) : (
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
                    ></div>
                  </div>
                </div>

                {/* New & Canceled */}
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
                          <div className="text-xs font-inter text-gray-500">
                            Canceled this month
                          </div>
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
          )}
        </div>

        {/* Plans Overview */}
        {isLoading ? (
          <PlansOverviewSkeleton />
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-poppins font-bold text-lg text-charcoal">
                  Subscription Plans Distribution
                </h3>
                <p className="text-xs text-gray-500 mt-1">Active subscriptions by tier</p>
              </div>
              {/* <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-primary hover:text-primary/80"
                onClick={() => {
                  toast.info('Plan details coming soon');
                }}
              >
                View Details
                <ChevronRight className="h-4 w-4" />
              </Button> */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/20 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30"></div>
                      <span className="font-inter font-semibold text-gray-700">Bronze Plan</span>
                    </div>
                    <div className="px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary">
                      Starter
                    </div>
                  </div>
                  <div className="font-poppins text-5xl font-bold text-charcoal mb-3">
                    {subscriptionData
                      ? formatNumber(subscriptionData.subscriptionsByPlan.BRONZE)
                      : '0'}
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
                            width: `${subscriptionData && subscriptionData.totalActive > 0 ? Math.round((subscriptionData.subscriptionsByPlan.BRONZE / subscriptionData.totalActive) * 100) : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-info/10 to-info/5 p-6 border border-info/20 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-info shadow-lg shadow-info/30"></div>
                      <span className="font-inter font-semibold text-gray-700">Silver Plan</span>
                    </div>
                    <div className="px-2 py-1 bg-info/10 rounded text-xs font-medium text-info">
                      Popular
                    </div>
                  </div>
                  <div className="font-poppins text-5xl font-bold text-charcoal mb-3">
                    {subscriptionData
                      ? formatNumber(subscriptionData.subscriptionsByPlan.SILVER)
                      : '0'}
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
                            width: `${subscriptionData && subscriptionData.totalActive > 0 ? Math.round((subscriptionData.subscriptionsByPlan.SILVER / subscriptionData.totalActive) * 100) : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-success/10 to-success/5 p-6 border border-success/20 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-success shadow-lg shadow-success/30"></div>
                      <span className="font-inter font-semibold text-gray-700">Gold Plan</span>
                    </div>
                    <div className="px-2 py-1 bg-success/10 rounded text-xs font-medium text-success">
                      Pro
                    </div>
                  </div>
                  <div className="font-poppins text-5xl font-bold text-charcoal mb-3">
                    {subscriptionData
                      ? formatNumber(subscriptionData.subscriptionsByPlan.GOLD)
                      : '0'}
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
                            width: `${subscriptionData && subscriptionData.totalActive > 0 ? Math.round((subscriptionData.subscriptionsByPlan.GOLD / subscriptionData.totalActive) * 100) : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid mb-6">
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="status">Status Distribution</TabsTrigger>
            <TabsTrigger value="plans">Plans Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            {isLoading ? (
              <ChartsSkeleton />
            ) : (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">
                    Revenue Comparison
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          revenueData
                            ? [
                                { name: 'This Month', value: revenueData.totalRevenue.value },
                                { name: 'Avg Monthly', value: revenueData.averageMonthlyRevenue },
                                { name: 'This Week', value: revenueData.revenueThisWeek },
                                { name: 'This Year', value: revenueData.revenueThisYear },
                              ]
                            : [
                                { name: 'This Month', value: 0 },
                                { name: 'Avg Monthly', value: 0 },
                                { name: 'This Week', value: 0 },
                                { name: 'This Year', value: 0 },
                              ]
                        }
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#888' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#888' }}
                          tickFormatter={formatYAxisTick}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar dataKey="value" fill="#5E54F3" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">
                    Subscription Revenue Metrics
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          subscriptionData
                            ? [
                                { name: 'MRR', value: subscriptionData.monthlyRecurringRevenue },
                                { name: 'Monthly', value: subscriptionData.monthlyRevenue },
                                { name: 'Last Month', value: subscriptionData.lastMonthRevenue },
                                { name: 'ARR', value: subscriptionData.annualRecurringRevenue },
                              ]
                            : [
                                { name: 'MRR', value: 0 },
                                { name: 'Monthly', value: 0 },
                                { name: 'Last Month', value: 0 },
                                { name: 'ARR', value: 0 },
                              ]
                        }
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#888' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#888' }}
                          tickFormatter={formatYAxisTick}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar dataKey="value" fill="#5E54F3" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="status">
            {isLoading ? (
              <ChartsSkeleton />
            ) : (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">
                  Subscription Status Distribution
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          subscriptionData
                            ? [
                                {
                                  name: 'Active',
                                  value: subscriptionData.totalActive,
                                  color: '#10B981',
                                },
                                {
                                  name: 'Trialing',
                                  value: subscriptionData.totalTrialing,
                                  color: '#F59E0B',
                                },
                                {
                                  name: 'Canceled',
                                  value: subscriptionData.totalCanceled,
                                  color: '#EF4444',
                                },
                                {
                                  name: 'Past Due',
                                  value: subscriptionData.totalPastDue,
                                  color: '#F97316',
                                },
                                {
                                  name: 'Unpaid',
                                  value: subscriptionData.totalUnpaid,
                                  color: '#DC2626',
                                },
                              ]
                            : [
                                { name: 'Active', value: 0, color: '#10B981' },
                                { name: 'Trialing', value: 0, color: '#F59E0B' },
                                { name: 'Canceled', value: 0, color: '#EF4444' },
                                { name: 'Past Due', value: 0, color: '#F97316' },
                                { name: 'Unpaid', value: 0, color: '#DC2626' },
                              ]
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(subscriptionData
                          ? [
                              {
                                name: 'Active',
                                value: subscriptionData.totalActive,
                                color: '#10B981',
                              },
                              {
                                name: 'Trialing',
                                value: subscriptionData.totalTrialing,
                                color: '#F59E0B',
                              },
                              {
                                name: 'Canceled',
                                value: subscriptionData.totalCanceled,
                                color: '#EF4444',
                              },
                              {
                                name: 'Past Due',
                                value: subscriptionData.totalPastDue,
                                color: '#F97316',
                              },
                              {
                                name: 'Unpaid',
                                value: subscriptionData.totalUnpaid,
                                color: '#DC2626',
                              },
                            ]
                          : [
                              { name: 'Active', value: 0, color: '#10B981' },
                              { name: 'Trialing', value: 0, color: '#F59E0B' },
                              { name: 'Canceled', value: 0, color: '#EF4444' },
                              { name: 'Past Due', value: 0, color: '#F97316' },
                              { name: 'Unpaid', value: 0, color: '#DC2626' },
                            ]
                        ).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="plans">
            {isLoading ? (
              <ChartsSkeleton />
            ) : (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">
                  Subscriptions by Plan
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        subscriptionData
                          ? [
                              {
                                name: 'Bronze',
                                value: subscriptionData.subscriptionsByPlan.BRONZE,
                                color: '#5E54F3',
                              },
                              {
                                name: 'Silver',
                                value: subscriptionData.subscriptionsByPlan.SILVER,
                                color: '#06B6D4',
                              },
                              {
                                name: 'Gold',
                                value: subscriptionData.subscriptionsByPlan.GOLD,
                                color: '#10B981',
                              },
                            ]
                          : [
                              { name: 'Bronze', value: 0, color: '#5E54F3' },
                              { name: 'Silver', value: 0, color: '#06B6D4' },
                              { name: 'Gold', value: 0, color: '#10B981' },
                            ]
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '12px',
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {(subscriptionData
                          ? [
                              {
                                name: 'Bronze',
                                value: subscriptionData.subscriptionsByPlan.BRONZE,
                                color: '#5E54F3',
                              },
                              {
                                name: 'Silver',
                                value: subscriptionData.subscriptionsByPlan.SILVER,
                                color: '#06B6D4',
                              },
                              {
                                name: 'Gold',
                                value: subscriptionData.subscriptionsByPlan.GOLD,
                                color: '#10B981',
                              },
                            ]
                          : [
                              { name: 'Bronze', value: 0, color: '#5E54F3' },
                              { name: 'Silver', value: 0, color: '#06B6D4' },
                              { name: 'Gold', value: 0, color: '#10B981' },
                            ]
                        ).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageWrapper>
  );
}
