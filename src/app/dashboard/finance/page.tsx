'use client';

import Image from 'next/image';

import { StatsCard } from '@/components/core/Dashboard/AdminSide/Cards/StatsCard';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';

// Define transaction type
export type Transaction = {
  id: string;
  therapist: string;
  date: string;
  session: string;
  amount: number;
};

// Define stats data
const financeStats = [
  {
    title: 'Total Revenue',
    value: '$40,689',
    trend: { value: 8.5, isUp: true, timeframe: 'last month' },
    icon: <Image src="/svgs/UsersIcon.svg" alt="Revenue" width={24} height={24} />,
    bgColor: '#e8ebfd',
  },
  {
    title: 'Active Therapist',
    value: '42',
    trend: { value: 5, isUp: true, timeframe: 'this month' },
    icon: <Image src="/svgs/ClientsIcon.svg" alt="Therapist" width={24} height={24} />,
    bgColor: '#fff3d6',
  },
  {
    title: 'Completed Sessions',
    value: '327',
    trend: { value: 12, isUp: true, timeframe: 'last month' },
    icon: <Image src="/svgs/CalendarIcon.svg" alt="Sessions" width={24} height={24} />,
    bgColor: '#ffded1',
  },
  {
    title: 'Average Session Price',
    value: '$72',
    trend: { value: 4.3, isUp: false, timeframe: 'last month' },
    icon: <Image src="/svgs/MoneyIcon.svg" alt="Price" width={24} height={24} />,
    bgColor: '#d9f7e8',
  },
];

// Sample data for transactions
export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    therapist: 'Sarah Johnson',
    date: '7 May',
    session: 'Therapy Session',
    amount: 85,
  },
  {
    id: '2',
    therapist: 'Sarah Johnson',
    date: '7 May',
    session: 'Therapy Session',
    amount: 85,
  },
  {
    id: '3',
    therapist: 'Sarah Johnson',
    date: '7 May',
    session: 'Therapy Session',
    amount: 85,
  },
  {
    id: '4',
    therapist: 'Sarah Johnson',
    date: '7 May',
    session: 'Therapy Session',
    amount: 85,
  },
  {
    id: '5',
    therapist: 'Sarah Johnson',
    date: '7 May',
    session: 'Therapy Session',
    amount: 85,
  },
  {
    id: '6',
    therapist: 'Sarah Johnson',
    date: '7 May',
    session: 'Therapy Session',
    amount: 85,
  },
];

// No columns needed for simple list

const FinancePage = () => {
  return (
    <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Finance</h2>}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {financeStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="text-gray-400">◯</span>
            </div>
            <h3 className="text-lg font-semibold">Total Revenue</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">March 2025</span>
            <button className="p-1 rounded-md">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 10L12 14L16 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="p-1 rounded-md">⋯</button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-bold">220,342,123</div>
          <div className="text-sm text-gray-500">May</div>
        </div>

        <div className="h-64 relative">
          {/* Line chart visualization */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gray-200"></div>
          </div>
          <div className="absolute inset-0">
            <div
              className="h-full w-full"
              style={{
                background: `
                  linear-gradient(transparent, transparent 30%, rgba(79, 70, 229, 0.2) 30%, transparent 80%),
                  url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,80 Q50,20 100,60 T200,40 T300,60 T400,30 T500,50 T600,40 T700,60 T800,40' stroke='%234F46E5' fill='none' stroke-width='2'/%3E%3C/svg%3E")
                  center / cover no-repeat
                `,
              }}
            >
              {/* This creates a simple visual representation of a line chart */}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
            <div>1</div>
            <div>5</div>
            <div>10</div>
            <div>15</div>
            <div>20</div>
            <div>25</div>
            <div>30</div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Total Transaction</h3>

        <div className="overflow-auto max-h-96 pr-2">
          {sampleTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center py-4 border-b border-gray-100"
            >
              <div>
                <div className="font-medium">{transaction.therapist}</div>
                <div className="text-sm text-gray-500">
                  {transaction.date} | {transaction.session}
                </div>
              </div>
              <div className="font-medium">${transaction.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default FinancePage;
