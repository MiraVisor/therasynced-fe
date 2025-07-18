'use client';

import Image from 'next/image';

import { StatsCard } from '@/components/core/Dashboard/AdminSide/Cards/StatsCard';
import { TotalRevenueChart } from '@/components/core/Dashboard/AdminSide/Charts/TotalRevenueChart';
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
const sampleTransactions: Transaction[] = [
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

      {/* Chart and Transaction Section - Side by side on large screens, column on small */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart Section - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <TotalRevenueChart />
        </div>

        {/* Transactions List - Takes 1/3 of the space */}
        <div
          className="bg-white rounded-[14px] border border-gray-200 shadow-md"
          style={{ height: 553, opacity: 1 }}
        >
          <h3 className="text-[20px] font-semibold mb-4 px-6 pt-6 pb-2 text-[#202224]/70">
            Total Transaction
          </h3>
          <div className="border-t border-gray-300 mx-6 mb-2" />
          <div className="overflow-auto pr-2" style={{ maxHeight: 470 }}>
            {sampleTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center border-b border-gray-200 mx-6 py-4"
              >
                <div className="flex flex-col justify-center ">
                  <div
                    className="text-[16px] font-semibold leading-none text-[#202224]/70"
                    style={{ height: 22 }}
                  >
                    {transaction.therapist}
                  </div>
                  <div
                    className="text-[12px] font-normal leading-none mt-1 text-[#202224]/70"
                    style={{ height: 22 }}
                  >
                    {transaction.date} | {transaction.session}
                  </div>
                </div>
                <div
                  className="text-[16px] font-semibold text-right leading-none text-[#202224]/70"
                  style={{ height: 22 }}
                >
                  ${transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default FinancePage;
