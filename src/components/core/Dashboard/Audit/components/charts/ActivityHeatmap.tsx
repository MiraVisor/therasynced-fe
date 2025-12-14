'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface HeatmapDataPoint {
  date: string;
  value: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDataPoint[];
  title?: string;
  description?: string;
  loading?: boolean;
}

export function ActivityHeatmap({
  data,
  title,
  description,
  loading,
}: ActivityHeatmapProps) {
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
            <div className="text-sm text-muted-foreground">Loading heatmap data...</div>
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

  // Generate last 90 days
  const days: { date: Date; value: number }[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dataPoint = data.find((d) => d.date === dateStr);
    days.push({
      date,
      value: dataPoint?.value || 0,
    });
  }

  // Group by weeks
  const weeks: { date: Date; value: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getIntensity = (value: number) => {
    if (value === 0) return 'bg-muted';
    const intensity = Math.min(value / maxValue, 1);
    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 0.5) return 'bg-blue-400 dark:bg-blue-700';
    if (intensity < 0.75) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-300';
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${getIntensity(day.value)}`}
                    title={`${day.date.toLocaleDateString()}: ${day.value} events`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900" />
              <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700" />
              <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-500" />
              <div className="w-3 h-3 rounded-sm bg-blue-800 dark:bg-blue-300" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
