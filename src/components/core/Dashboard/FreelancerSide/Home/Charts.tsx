'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#2563eb',
  },
  mobile: {
    label: 'Mobile',
    color: '#60a5fa',
  },
} satisfies ChartConfig;

const Charts = () => {
  return (
    <Card className="w-full border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl md:rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <CardTitle className="text-base md:text-lg lg:text-xl font-semibold text-gray-800">
          Analytics Overview
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
          January - June 2024
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 lg:p-8">
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 8,
              right: 8,
              top: 16,
              bottom: 16,
            }}
          >
            <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tickFormatter={(value) => value.slice(0, 3)}
              tick={{ fill: '#666', fontSize: 11 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line dataKey="desktop" type="monotone" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line dataKey="mobile" type="monotone" stroke="#7c3aed" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default Charts;
