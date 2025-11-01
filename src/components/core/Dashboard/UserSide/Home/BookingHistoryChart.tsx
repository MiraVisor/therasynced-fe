'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { getPatientBookingHistory } from '@/redux/api/bookingApi';

interface BookingHistoryChartProps {
  className?: string;
}

interface ChartDataPoint {
  period: string;
  bookings: number;
}

const BookingHistoryChart = ({ className }: BookingHistoryChartProps) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setLoading(true);
        const response = await getPatientBookingHistory({
          page: 1,
          limit: 100,
        });

        if (response.success && Array.isArray(response.data)) {
          // Aggregate bookings by month for the last 6 months
          const now = new Date();
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

          const monthlyBookings: Record<string, number> = {};

          response.data.forEach((booking: any) => {
            const bookingDate = new Date(booking.slot?.startTime || booking.createdAt);
            if (bookingDate >= sixMonthsAgo) {
              const monthKey = bookingDate.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              });
              monthlyBookings[monthKey] = (monthlyBookings[monthKey] || 0) + 1;
            }
          });

          // Generate chart data for the last 6 months
          const chartData: ChartDataPoint[] = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const period = date.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            });
            chartData.push({
              period,
              bookings: monthlyBookings[period] || 0,
            });
          }

          setData(chartData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load booking history');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">{error}</p>
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
          Booking History
        </CardTitle>
        <CardDescription>Your appointments over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="bookings"
              type="monotone"
              fill="var(--color-bookings)"
              fillOpacity={0.4}
              stroke="var(--color-bookings)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BookingHistoryChart;
