'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FreelancerDashboardOverview } from '@/types/types';

interface ChartsProps {
  dashboardData: FreelancerDashboardOverview | null;
  isLoading?: boolean;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
  }>;
  label?: string;
}

const ChartTooltipContent = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-poppins font-semibold text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.dataKey} className="flex items-center gap-2 text-sm font-inter">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: entry.dataKey === 'current' ? '#007745' : '#e5e7eb',
                }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {entry.dataKey === 'current' ? 'This Week' : 'Last Week'}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Charts = ({ dashboardData, isLoading = false }: ChartsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-100 dark:bg-gray-800/50 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const getChartData = () => {
    if (!dashboardData?.weeklyAppointments) {
      return [
        { day: 'Mon', current: 0, last: 0 },
        { day: 'Tue', current: 0, last: 0 },
        { day: 'Wed', current: 0, last: 0 },
        { day: 'Thu', current: 0, last: 0 },
        { day: 'Fri', current: 0, last: 0 },
        { day: 'Sat', current: 0, last: 0 },
        { day: 'Sun', current: 0, last: 0 },
      ];
    }

    const { currentWeek, lastWeek } = dashboardData.weeklyAppointments;

    return [
      { day: 'Mon', current: currentWeek.monday, last: lastWeek.monday },
      { day: 'Tue', current: currentWeek.tuesday, last: lastWeek.tuesday },
      { day: 'Wed', current: currentWeek.wednesday, last: lastWeek.wednesday },
      { day: 'Thu', current: currentWeek.thursday, last: lastWeek.thursday },
      { day: 'Fri', current: currentWeek.friday, last: lastWeek.friday },
      { day: 'Sat', current: currentWeek.saturday, last: lastWeek.saturday },
      { day: 'Sun', current: currentWeek.sunday, last: lastWeek.sunday },
    ];
  };

  const chartData = getChartData();
  const totalCurrent = chartData.reduce((sum, d) => sum + d.current, 0);
  const totalLast = chartData.reduce((sum, d) => sum + d.last, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
              Weekly Appointments
            </CardTitle>
            <CardDescription className="font-inter">
              Comparing this week to last week
            </CardDescription>
          </div>
          <div className="flex items-center gap-6 text-sm font-inter">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-gray-600 dark:text-gray-400">This Week</span>
              <span className="font-poppins font-semibold text-gray-900 dark:text-white">
                {totalCurrent}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <span className="text-gray-600 dark:text-gray-400">Last Week</span>
              <span className="font-poppins font-semibold text-gray-900 dark:text-white">
                {totalLast}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ left: -10, right: 0, top: 10, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="0" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: 'rgba(0, 119, 69, 0.04)' }}
              />
              <Bar
                dataKey="last"
                name="Last Week"
                fill="#e5e7eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="current"
                name="This Week"
                fill="#007745"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Charts;
