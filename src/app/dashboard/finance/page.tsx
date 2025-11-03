'use client';

import {
  AlertTriangle,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
        console.error('Error fetching admin finance:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinance();
  }, []);

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

  if (isLoading) {
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

  if (error) {
    return (
      <DashboardPageWrapper
        header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Finance</h1>}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-error mb-4">Error loading finance data</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
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
    : [];

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Finance</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Subscription Statistics Section */}
        {subscriptionData && (
          <div className="space-y-6">
            <h2 className="font-poppins font-bold text-xl text-charcoal">
              Subscription Statistics
            </h2>

            {/* Subscription Counts */}
            <div className="space-y-4">
              <h3 className="font-poppins font-semibold text-lg text-gray-700">
                Subscription Counts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-success" />
                    <span className="font-inter text-sm text-gray-600">Active</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatNumber(subscriptionData.totalActive)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="font-inter text-sm text-gray-600">Trialing</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatNumber(subscriptionData.totalTrialing)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-error" />
                    <span className="font-inter text-sm text-gray-600">Canceled</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatNumber(subscriptionData.totalCanceled)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="font-inter text-sm text-gray-600">Past Due</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatNumber(subscriptionData.totalPastDue)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-red-500" />
                    <span className="font-inter text-sm text-gray-600">Unpaid</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatNumber(subscriptionData.totalUnpaid)}
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Metrics */}
            <div className="space-y-4">
              <h3 className="font-poppins font-semibold text-lg text-gray-700">Revenue Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-inter text-sm text-gray-600">
                      Monthly Recurring Revenue (MRR)
                    </span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatCurrency(subscriptionData.monthlyRecurringRevenue)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-info" />
                    <span className="font-inter text-sm text-gray-600">Monthly Revenue</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatCurrency(subscriptionData.monthlyRevenue)}
                  </p>
                  {subscriptionData.lastMonthRevenue && (
                    <div className="mt-2 flex items-center gap-1">
                      {subscriptionData.monthlyRevenue >= subscriptionData.lastMonthRevenue ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-error" />
                      )}
                      <span className="font-inter text-xs text-gray-500">
                        Last month: {formatCurrency(subscriptionData.lastMonthRevenue)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-success" />
                    <span className="font-inter text-sm text-gray-600">
                      Annual Recurring Revenue (ARR)
                    </span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatCurrency(subscriptionData.annualRecurringRevenue)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-warning" />
                    <span className="font-inter text-sm text-gray-600">Last Month Revenue</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatCurrency(subscriptionData.lastMonthRevenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Analytics */}
            <div className="space-y-4">
              <h3 className="font-poppins font-semibold text-lg text-gray-700">
                Subscription Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <span className="font-inter text-sm text-gray-600">Retention Rate</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {subscriptionData.retentionRate}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-inter text-sm text-gray-600">New This Month</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatNumber(subscriptionData.newSubscriptionsThisMonth)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-error" />
                    <span className="font-inter text-sm text-gray-600">Canceled This Month</span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatNumber(subscriptionData.canceledSubscriptionsThisMonth)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-info" />
                    <span className="font-inter text-sm text-gray-600">
                      Avg Revenue per Subscription
                    </span>
                  </div>
                  <p className="font-poppins text-2xl font-bold text-charcoal">
                    {formatCurrency(subscriptionData.averageRevenuePerSubscription)}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscriptions by Plan */}
            <div className="space-y-4">
              <h3 className="font-poppins font-semibold text-lg text-gray-700">
                Subscriptions by Plan
              </h3>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-4 w-4 rounded bg-primary"></div>
                      <span className="font-inter font-semibold text-gray-700">Basic</span>
                    </div>
                    <p className="font-poppins text-3xl font-bold text-charcoal">
                      {formatNumber(subscriptionData.subscriptionsByPlan.BASIC)}
                    </p>
                    <p className="font-inter text-sm text-gray-500 mt-1">
                      {subscriptionData.totalActive > 0
                        ? `${Math.round(
                            (subscriptionData.subscriptionsByPlan.BASIC /
                              subscriptionData.totalActive) *
                              100,
                          )}% of active`
                        : '0% of active'}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-4 w-4 rounded bg-info"></div>
                      <span className="font-inter font-semibold text-gray-700">Standard</span>
                    </div>
                    <p className="font-poppins text-3xl font-bold text-charcoal">
                      {formatNumber(subscriptionData.subscriptionsByPlan.STANDARD)}
                    </p>
                    <p className="font-inter text-sm text-gray-500 mt-1">
                      {subscriptionData.totalActive > 0
                        ? `${Math.round(
                            (subscriptionData.subscriptionsByPlan.STANDARD /
                              subscriptionData.totalActive) *
                              100,
                          )}% of active`
                        : '0% of active'}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-4 w-4 rounded bg-success"></div>
                      <span className="font-inter font-semibold text-gray-700">Premium</span>
                    </div>
                    <p className="font-poppins text-3xl font-bold text-charcoal">
                      {formatNumber(subscriptionData.subscriptionsByPlan.PREMIUM)}
                    </p>
                    <p className="font-inter text-sm text-gray-500 mt-1">
                      {subscriptionData.totalActive > 0
                        ? `${Math.round(
                            (subscriptionData.subscriptionsByPlan.PREMIUM /
                              subscriptionData.totalActive) *
                              100,
                          )}% of active`
                        : '0% of active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {revenueData && subscriptionData && (
          <div className="space-y-6">
            <h2 className="font-poppins font-bold text-xl text-charcoal">Financial Charts</h2>

            {/* Revenue Comparison Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">
                Revenue Comparison
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Total Revenue',
                        value: revenueData.totalRevenue.value,
                      },
                      {
                        name: 'Average Monthly',
                        value: revenueData.averageMonthlyRevenue,
                      },
                      {
                        name: 'This Week',
                        value: revenueData.revenueThisWeek,
                      },
                      {
                        name: 'This Year',
                        value: revenueData.revenueThisYear,
                      },
                    ]}
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
                        padding: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill="#5E54F3" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subscription Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Status Pie Chart */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">
                  Subscription Status Distribution
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: subscriptionData.totalActive, color: '#10B981' },
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
                          { name: 'Unpaid', value: subscriptionData.totalUnpaid, color: '#DC2626' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Active', value: subscriptionData.totalActive, color: '#10B981' },
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
                          { name: 'Unpaid', value: subscriptionData.totalUnpaid, color: '#DC2626' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subscriptions by Plan Chart */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">
                  Subscriptions by Plan
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
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
                      ]}
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
                          padding: '8px',
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {[
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
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Revenue Metrics Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">
                Revenue Metrics
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'MRR',
                        value: subscriptionData.monthlyRecurringRevenue,
                      },
                      {
                        name: 'Monthly Revenue',
                        value: subscriptionData.monthlyRevenue,
                      },
                      {
                        name: 'Last Month',
                        value: subscriptionData.lastMonthRevenue,
                      },
                      {
                        name: 'ARR',
                        value: subscriptionData.annualRecurringRevenue,
                      },
                    ]}
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
                        padding: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill="#5E54F3" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  );
}
