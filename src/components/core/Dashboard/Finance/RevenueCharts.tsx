'use client';

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

import { ChartsSkeleton } from '@/components/ui/skeletons/ChartsSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminRevenueDto, SubscriptionStatsDto } from '@/services/adminFinanceService';

interface RevenueChartsProps {
  revenueData: AdminRevenueDto | null;
  subscriptionData: SubscriptionStatsDto | null;
  isLoading: boolean;
}

export function RevenueCharts({ revenueData, subscriptionData, isLoading }: RevenueChartsProps) {
  const formatCurrency = (value: number): string => {
    return `EUR ${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatYAxisTick = (value: number): string => {
    if (value >= 1000000) {
      return `EUR ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `EUR ${(value / 1000).toFixed(1)}k`;
    } else {
      return `EUR ${value}`;
    }
  };

  if (isLoading) {
    return <ChartsSkeleton />;
  }

  return (
    <Tabs defaultValue="revenue" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid mb-6">
        <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
        <TabsTrigger value="status">Status Distribution</TabsTrigger>
        <TabsTrigger value="plans">Plans Breakdown</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue" className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-poppins font-semibold text-lg text-gray-700 mb-4">Booking Revenue</h3>
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
                          name: 'Bronze',
                          value: subscriptionData.subscriptionsByPlan?.BRONZE ?? 0,
                          color: '#5E54F3',
                        },
                        {
                          name: 'Silver',
                          value: subscriptionData.subscriptionsByPlan?.SILVER ?? 0,
                          color: '#06B6D4',
                        },
                        {
                          name: 'Gold',
                          value: subscriptionData.subscriptionsByPlan?.GOLD ?? 0,
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
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
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
                          value: subscriptionData.subscriptionsByPlan?.BRONZE ?? 0,
                          color: '#5E54F3',
                        },
                        {
                          name: 'Silver',
                          value: subscriptionData.subscriptionsByPlan?.SILVER ?? 0,
                          color: '#06B6D4',
                        },
                        {
                          name: 'Gold',
                          value: subscriptionData.subscriptionsByPlan?.GOLD ?? 0,
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
      </TabsContent>
    </Tabs>
  );
}
