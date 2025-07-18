'use client';

import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', revenue: 186000, appointments: 80 },
  { month: 'February', revenue: 305000, appointments: 200 },
  { month: 'March', revenue: 237000, appointments: 120 },
  { month: 'April', revenue: 173000, appointments: 190 },
  { month: 'May', revenue: 209000, appointments: 130 },
  { month: 'June', revenue: 214000, appointments: 140 },
];

const chartConfig = {
  revenue: {
    label: 'Revenue',
    theme: {
      light: '#4F46E5',
      dark: '#818CF8',
    },
  },
  appointments: {
    label: 'Appointments',
    theme: {
      light: '#22C55E',
      dark: '#4ADE80',
    },
  },
} satisfies ChartConfig;

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-gray-400">◯</span>
          </div>
          <CardTitle>Total Revenue</CardTitle>
        </div>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-bold">$220,342,123</div>
          <div className="text-sm text-gray-500">May</div>
        </div>
        <div className="h-64">
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="appointments"
                type="monotone"
                stroke="var(--color-appointments)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing total revenue and appointments for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
