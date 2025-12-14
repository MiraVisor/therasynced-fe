'use client';

import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  description?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  loading,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={`flex-1 ${className || ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          {description && <Skeleton className="h-4 w-32" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex-1 ${className || ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(trend.value)}%
            </span>
            <span>{trend.label}</span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface StatsCardsGridProps {
  children: ReactNode;
  className?: string;
}

export function StatsCardsGrid({ children, className }: StatsCardsGridProps) {
  return (
    <div className={`flex gap-4 ${className || ''}`}>
      {children}
    </div>
  );
}
