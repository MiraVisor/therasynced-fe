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
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import adminFinanceService, {
  AdminRevenueDto,
  SubscriptionStatsDto,
} from '@/services/adminFinanceService';

export default function FinancePage() {
  const [revenueData, setRevenueData] = useState<AdminRevenueDto | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch finance data
  useEffect(() => {
    const fetchFinance = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [revenue, subscriptions] = await Promise.all([
          adminFinanceService.getRevenue(),
          adminFinanceService.getSubscriptions(),
        ]);
        setRevenueData(revenue);
        setSubscriptionData(subscriptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load finance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinance();
  }, []);

  // Show error as toast when it occurs
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load finance data: ${error}`);
    }
  }, [error]);

  // Format currency value
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format number value
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (isLoading && !revenueData && !subscriptionData) {
    return (
      <DashboardPageWrapper
        header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Finance</h1>}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

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
          value: '$0',
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
          value: '$0',
          trend: undefined,
          icon: TrendingUp,
          iconColor: 'text-warning',
          iconBg: 'bg-warning/10',
        },
      ];

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Finance Overview</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Updated just now</span>
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
                  onClick={() => {
                    // Navigate to details or show modal
                  }}
                />
              );
            })}
          </div>

          {/* Right: Revenue Metrics */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-poppins font-bold text-lg text-charcoal">Revenue Metrics</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur rounded-lg p-4">
                <div className="text-xs font-inter text-gray-500 uppercase mb-1">MRR</div>
                <div className="font-poppins text-xl font-bold text-charcoal">
                  {subscriptionData
                    ? formatCurrency(subscriptionData.monthlyRecurringRevenue)
                    : '$0'}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-4">
                <div className="text-xs font-inter text-gray-500 uppercase mb-1">
                  Monthly Revenue
                </div>
                <div className="font-poppins text-xl font-bold text-charcoal">
                  {subscriptionData ? formatCurrency(subscriptionData.monthlyRevenue) : '$0'}
                </div>
                {subscriptionData?.lastMonthRevenue !== undefined &&
                  subscriptionData.lastMonthRevenue !== 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {subscriptionData.monthlyRevenue >= subscriptionData.lastMonthRevenue ? (
                        <ArrowUpRight className="h-3 w-3 text-success" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-error" />
                      )}
                      <span className="text-xs text-gray-500">
                        vs {formatCurrency(subscriptionData.lastMonthRevenue)}
                      </span>
                    </div>
                  )}
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-4">
                <div className="text-xs font-inter text-gray-500 uppercase mb-1">ARR</div>
                <div className="font-poppins text-xl font-bold text-charcoal">
                  {subscriptionData
                    ? formatCurrency(subscriptionData.annualRecurringRevenue)
                    : '$0'}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-4">
                <div className="text-xs font-inter text-gray-500 uppercase mb-1">Avg per Sub</div>
                <div className="font-poppins text-xl font-bold text-charcoal">
                  {subscriptionData
                    ? formatCurrency(subscriptionData.averageRevenuePerSubscription)
                    : '$0'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Overview - Combined Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Status */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-poppins font-bold text-lg text-charcoal">Subscription Status</h3>
              <div className="text-sm font-inter text-gray-500">
                Total:{' '}
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="flex flex-col items-center justify-center p-4 bg-success/5 rounded-lg border border-success/20">
                <Users className="h-5 w-5 text-success mb-2" />
                <div className="font-poppins text-2xl font-bold text-charcoal">
                  {subscriptionData ? formatNumber(subscriptionData.totalActive) : '0'}
                </div>
                <div className="text-xs font-inter text-gray-600 mt-1">Active</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-warning/5 rounded-lg border border-warning/20">
                <Clock className="h-5 w-5 text-warning mb-2" />
                <div className="font-poppins text-2xl font-bold text-charcoal">
                  {subscriptionData ? formatNumber(subscriptionData.totalTrialing) : '0'}
                </div>
                <div className="text-xs font-inter text-gray-600 mt-1">Trialing</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-error/5 rounded-lg border border-error/20">
                <XCircle className="h-5 w-5 text-error mb-2" />
                <div className="font-poppins text-2xl font-bold text-charcoal">
                  {subscriptionData ? formatNumber(subscriptionData.totalCanceled) : '0'}
                </div>
                <div className="text-xs font-inter text-gray-600 mt-1">Canceled</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="h-5 w-5 text-orange-500 mb-2" />
                <div className="font-poppins text-2xl font-bold text-charcoal">
                  {subscriptionData ? formatNumber(subscriptionData.totalPastDue) : '0'}
                </div>
                <div className="text-xs font-inter text-gray-600 mt-1">Past Due</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Zap className="h-5 w-5 text-red-500 mb-2" />
                <div className="font-poppins text-2xl font-bold text-charcoal">
                  {subscriptionData ? formatNumber(subscriptionData.totalUnpaid) : '0'}
                </div>
                <div className="text-xs font-inter text-gray-600 mt-1">Unpaid</div>
              </div>
            </div>
          </div>

          {/* Subscription Analytics */}
          <div className="bg-gradient-to-br from-info/5 to-info/10 rounded-xl p-6 border border-info/20">
            <h3 className="font-poppins font-bold text-lg text-charcoal mb-4">Analytics</h3>
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-inter text-gray-600">Retention Rate</span>
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div className="font-poppins text-3xl font-bold text-charcoal">
                  {subscriptionData ? `${subscriptionData.retentionRate}%` : '0%'}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-success/10 rounded">
                      <ArrowUpRight className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm font-inter text-gray-600">New this month</span>
                  </div>
                  <div className="font-poppins text-xl font-bold text-charcoal">
                    {subscriptionData
                      ? formatNumber(subscriptionData.newSubscriptionsThisMonth)
                      : '0'}
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-error/10 rounded">
                      <ArrowDownRight className="h-3 w-3 text-error" />
                    </div>
                    <span className="text-sm font-inter text-gray-600">Canceled this month</span>
                  </div>
                  <div className="font-poppins text-xl font-bold text-charcoal">
                    {subscriptionData
                      ? formatNumber(subscriptionData.canceledSubscriptionsThisMonth)
                      : '0'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-poppins font-bold text-lg text-charcoal mb-6">
            Subscription Plans Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="font-inter font-semibold text-gray-700">Basic Plan</span>
              </div>
              <div className="font-poppins text-4xl font-bold text-charcoal mb-2">
                {subscriptionData ? formatNumber(subscriptionData.subscriptionsByPlan.BASIC) : '0'}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${subscriptionData && subscriptionData.totalActive > 0 ? Math.round((subscriptionData.subscriptionsByPlan.BASIC / subscriptionData.totalActive) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-inter text-gray-600 min-w-[3rem]">
                  {subscriptionData && subscriptionData.totalActive > 0
                    ? `${Math.round((subscriptionData.subscriptionsByPlan.BASIC / subscriptionData.totalActive) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-info/10 to-info/5 p-6 border border-info/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-info"></div>
                <span className="font-inter font-semibold text-gray-700">Standard Plan</span>
              </div>
              <div className="font-poppins text-4xl font-bold text-charcoal mb-2">
                {subscriptionData
                  ? formatNumber(subscriptionData.subscriptionsByPlan.STANDARD)
                  : '0'}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-info h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${subscriptionData && subscriptionData.totalActive > 0 ? Math.round((subscriptionData.subscriptionsByPlan.STANDARD / subscriptionData.totalActive) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-inter text-gray-600 min-w-[3rem]">
                  {subscriptionData && subscriptionData.totalActive > 0
                    ? `${Math.round((subscriptionData.subscriptionsByPlan.STANDARD / subscriptionData.totalActive) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/10 to-success/5 p-6 border border-success/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="font-inter font-semibold text-gray-700">Premium Plan</span>
              </div>
              <div className="font-poppins text-4xl font-bold text-charcoal mb-2">
                {subscriptionData
                  ? formatNumber(subscriptionData.subscriptionsByPlan.PREMIUM)
                  : '0'}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-success h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${subscriptionData && subscriptionData.totalActive > 0 ? Math.round((subscriptionData.subscriptionsByPlan.PREMIUM / subscriptionData.totalActive) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-inter text-gray-600 min-w-[3rem]">
                  {subscriptionData && subscriptionData.totalActive > 0
                    ? `${Math.round((subscriptionData.subscriptionsByPlan.PREMIUM / subscriptionData.totalActive) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid mb-6">
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="status">Status Distribution</TabsTrigger>
            <TabsTrigger value="plans">Plans Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
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
                            { name: 'Total Revenue', value: revenueData.totalRevenue.value },
                            { name: 'Avg Monthly', value: revenueData.averageMonthlyRevenue },
                            { name: 'This Week', value: revenueData.revenueThisWeek },
                            { name: 'This Year', value: revenueData.revenueThisYear },
                          ]
                        : [
                            { name: 'Total Revenue', value: 0 },
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
                      tickFormatter={(value) => `$${value / 1000}k`}
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
                      tickFormatter={(value) => `$${value / 1000}k`}
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
          </TabsContent>

          <TabsContent value="status">
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
          </TabsContent>

          <TabsContent value="plans">
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
                              name: 'Basic',
                              value: subscriptionData.subscriptionsByPlan.BASIC,
                              color: '#5E54F3',
                            },
                            {
                              name: 'Standard',
                              value: subscriptionData.subscriptionsByPlan.STANDARD,
                              color: '#06B6D4',
                            },
                            {
                              name: 'Premium',
                              value: subscriptionData.subscriptionsByPlan.PREMIUM,
                              color: '#10B981',
                            },
                          ]
                        : [
                            { name: 'Basic', value: 0, color: '#5E54F3' },
                            { name: 'Standard', value: 0, color: '#06B6D4' },
                            { name: 'Premium', value: 0, color: '#10B981' },
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
                              name: 'Basic',
                              value: subscriptionData.subscriptionsByPlan.BASIC,
                              color: '#5E54F3',
                            },
                            {
                              name: 'Standard',
                              value: subscriptionData.subscriptionsByPlan.STANDARD,
                              color: '#06B6D4',
                            },
                            {
                              name: 'Premium',
                              value: subscriptionData.subscriptionsByPlan.PREMIUM,
                              color: '#10B981',
                            },
                          ]
                        : [
                            { name: 'Basic', value: 0, color: '#5E54F3' },
                            { name: 'Standard', value: 0, color: '#06B6D4' },
                            { name: 'Premium', value: 0, color: '#10B981' },
                          ]
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageWrapper>
  );
}
