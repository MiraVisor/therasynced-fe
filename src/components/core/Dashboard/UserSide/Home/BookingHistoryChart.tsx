'use client';

import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { usePatientBookingHistory } from '@/hooks/queries/useBookings';

interface BookingHistoryChartProps {
  className?: string;
}

interface ChartDataPoint {
  period: string;
  bookings: number;
}

interface SummaryStats {
  total: number;
  average: number;
  trend: number; // percentage change
  thisMonth: number;
  lastMonth: number;
}

const BookingHistoryChart = ({ className }: BookingHistoryChartProps) => {
  const { data: bookingsData = [], isLoading: loading } = usePatientBookingHistory({
    page: 1,
    limit: 100,
  });

  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const initialLoading = loading && !bookingsData;

  useEffect(() => {
    if (bookingsData && Array.isArray(bookingsData)) {
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Aggregate bookings by week for the last 12 weeks
      const weeklyBookings: Record<string, number> = {};
      const monthlyBookings: Record<string, number> = {};

      bookingsData.forEach((booking: any) => {
        const bookingDate = new Date(booking.slot?.startTime || booking.createdAt);
        if (bookingDate >= threeMonthsAgo) {
          // Weekly aggregation
          const weekStart = new Date(bookingDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
          const weekKey = weekStart.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          weeklyBookings[weekKey] = (weeklyBookings[weekKey] || 0) + 1;

          // Monthly aggregation for stats
          const monthKey = bookingDate.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          });
          monthlyBookings[monthKey] = (monthlyBookings[monthKey] || 0) + 1;
        }
      });

      // Generate chart data for the last 12 weeks
      const chartData: ChartDataPoint[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7);
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const period = weekStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        chartData.push({
          period,
          bookings: weeklyBookings[period] || 0,
        });
      }

      setData(chartData);

      // Calculate summary statistics
      const currentMonth = now.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const lastMonthDate = new Date(now);
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonth = lastMonthDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      const thisMonthCount = monthlyBookings[currentMonth] || 0;
      const lastMonthCount = monthlyBookings[lastMonth] || 0;
      const total = Object.values(monthlyBookings).reduce((sum, count) => sum + count, 0);
      const average =
        chartData.length > 0
          ? Math.round((total / Object.keys(monthlyBookings).length) * 10) / 10
          : 0;

      const trend =
        lastMonthCount > 0
          ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
          : thisMonthCount > 0
            ? 100
            : 0;

      setStats({
        total,
        average,
        trend,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
      });
    }
  }, [bookingsData]);

  const isLoading = initialLoading || (loading && data.length === 0 && !stats);
  if (isLoading) {
    return (
      <Card
        className={`${className} border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl`}
      >
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-16 mx-auto mb-1 animate-pulse"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-12 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="h-[220px] bg-gray-100 dark:bg-gray-800/20 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className={`${className} border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl`}
      >
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-4">
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Booking History
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Your appointments over the last 12 weeks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-[220px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Unable to load booking data</p>
              <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    bookings: {
      label: 'Bookings',
      color: 'hsl(142, 76%, 36%)', // Green color
    },
  };

  const hasData = data.length > 0 && data.some((d) => d.bookings > 0);

  return (
    <Card
      className={`${className} border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl`}
    >
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-4">
        <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
          Booking History
        </CardTitle>
        <CardDescription className="font-inter">
          Your appointments over the last 12 weeks
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center">
              <p className="text-xs font-inter text-muted-foreground mb-1">Total</p>
              <p className="text-xl font-poppins font-semibold text-charcoal">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-inter text-muted-foreground mb-1">Avg/Month</p>
              <p className="text-xl font-poppins font-semibold text-charcoal">{stats.average}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-inter text-muted-foreground mb-1">Trend</p>
              <div className="flex items-center justify-center gap-1">
                {stats.trend > 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-600" />
                ) : stats.trend < 0 ? (
                  <ArrowDown className="h-4 w-4 text-red-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                )}
                <p
                  className={`text-xl font-poppins font-semibold ${stats.trend > 0 ? 'text-green-600' : stats.trend < 0 ? 'text-red-600' : 'text-charcoal'}`}
                >
                  {Math.abs(stats.trend)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[220px] w-full !aspect-auto">
            <AreaChart
              data={data}
              margin={{
                left: 8,
                right: 8,
                top: 8,
                bottom: 8,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fill: '#2C3E50', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fill: '#2C3E50', fontSize: 11 }}
                width={30}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(38, 166, 154, 0.1)' }}
                content={<ChartTooltipContent />}
              />
              <Area
                dataKey="bookings"
                type="monotone"
                fill="var(--color-bookings)"
                fillOpacity={0.3}
                stroke="var(--color-bookings)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">No booking data available</p>
              <p className="text-xs text-muted-foreground">Your booking history will appear here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingHistoryChart;
