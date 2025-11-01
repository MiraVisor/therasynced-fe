'use client';

import Image from 'next/image';
import { useState } from 'react';

import { StatsCard } from '@/components/core/Dashboard/AdminSide/Cards/StatsCard';
import { TotalRevenueChart } from '@/components/core/Dashboard/AdminSide/Charts/TotalRevenueChart';
import { TotalTransactionList } from '@/components/core/Dashboard/AdminSide/Finance/TotalTransactionList';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';

// Mock Stats Data
const mockStats = [
  {
    title: 'Total Revenue',
    value: '$40,689',
    trend: { value: 8.5, isUp: true, timeframe: 'from last month' },
    icon: '/svgs/UsersIcon.svg',
    bgColor: '#e5e4ff',
  },
  {
    title: 'Active Therapists',
    value: '42',
    trend: { value: 5, isUp: true, timeframe: 'this month' },
    icon: '/svgs/ClientsIcon.svg',
    bgColor: '#fff3d6',
  },
  {
    title: 'Completed Sessions',
    value: '327',
    trend: { value: 12, isUp: true, timeframe: 'from last month' },
    icon: '/svgs/ClientsIcon.svg',
    bgColor: '#fff3d6',
  },
  {
    title: 'Average session price',
    value: '$72',
    trend: { value: 4.3, isUp: false, timeframe: 'from last month' },
    icon: '/svgs/ClientsIcon.svg',
    bgColor: '#fff3d6',
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
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={<Image src={stat.icon} alt={stat.title} width={24} height={24} />}
              bgColor={stat.bgColor}
            />
          ))}
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
