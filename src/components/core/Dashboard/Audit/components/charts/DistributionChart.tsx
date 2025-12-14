'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export interface DistributionDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface DistributionChartProps {
  data: DistributionDataPoint[];
  title?: string;
  description?: string;
  colors?: string[];
  height?: number;
  loading?: boolean;
}

const defaultColors = [
  '#8884d8', // Purple
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7300', // Orange
  '#0088fe', // Blue
  '#00c49f', // Teal
  '#ffbb28', // Amber
  '#ff8042', // Red-Orange
];

export function DistributionChart({
  data,
  title,
  description,
  colors = defaultColors,
  height = 300,
  loading,
}: DistributionChartProps) {
  const chartConfig: ChartConfig = data.reduce((acc, item, index) => {
    const color = item.color || colors[index % colors.length];
    acc[item.name] = {
      label: item.name,
      color: color,
    };
    return acc;
  }, {} as ChartConfig);

  if (loading) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => {
                const color = entry.color || colors[index % colors.length];
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
