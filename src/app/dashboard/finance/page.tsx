'use client';

import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

import { TotalRevenueChart } from '@/components/core/Dashboard/AdminSide/Charts/TotalRevenueChart';
import { TotalTransactionList } from '@/components/core/Dashboard/AdminSide/Finance/TotalTransactionList';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';

// Mock Stats Data
const mockStats = [
  {
    title: 'Total Revenue',
    value: '$40,689',
    trend: { value: 8.5, isUp: true, label: 'from last month' },
    icon: DollarSign,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    sparklineData: [38000, 39000, 40000, 40500, 40800, 40650, 40689],
  },
  {
    title: 'Active Therapists',
    value: '42',
    trend: { value: 5, isUp: true, label: 'this month' },
    icon: Users,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    sparklineData: [38, 39, 40, 41, 42, 41, 42],
  },
  {
    title: 'Completed Sessions',
    value: '327',
    trend: { value: 12, isUp: true, label: 'from last month' },
    icon: Calendar,
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
    sparklineData: [290, 300, 310, 320, 325, 326, 327],
  },
  {
    title: 'Average session price',
    value: '$72',
    trend: { value: 4.3, isUp: false, label: 'from last month' },
    icon: TrendingUp,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
    sparklineData: [75, 74, 73, 72, 73, 72, 72],
  },
];

// Mock Transaction Data
const mockTransactions = [
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
  { name: 'Sarah Johnson', date: '7 May', amount: '85' },
];

export default function FinancePage() {
  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Finance</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat, index) => {
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
                sparklineData={stat.sparklineData}
                interactive
                onClick={() => {
                  // Navigate to details or show modal
                }}
              />
            );
          })}
        </div>

        {/* Chart & Transaction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Chart (2/3 width) */}
          <div className="lg:col-span-8">
            <div className="h-full">
              <TotalRevenueChart />
            </div>
          </div>

          {/* Transactions (1/3 width) */}
          <div className="lg:col-span-4">
            <div className="h-full w-full">
              <TotalTransactionList transactions={mockTransactions} />
            </div>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
