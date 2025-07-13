import Image from 'next/image';
import React from 'react';

import { DashboardPageWrapper } from '../DashboardPageWrapper';
import { SearchBar } from '../SearchBar';
import {
  mockApplicationsData,
  mockAppointmentsData,
  mockChartData,
  mockStatsData,
} from '../mockData';
import { ApplicationCard } from './Cards/ApplicationCard';
import { AppointmentCard } from './Cards/AppointmentCard';
import { CardContainer } from './Cards/CardContainer';
import { RevenueChart } from './Cards/RevenueChart';
import { StatsCard } from './Cards/StatsCard';

type IconName = 'users' | 'clients' | 'calendar' | 'money';

const AdminHome = () => {
  // Map icons to their components
  const iconComponents = {
    users: <Image src="/svgs/UsersIcon.svg" alt="Users" width={24} height={24} />,
    clients: <Image src="/svgs/ClientsIcon.svg" alt="Clients" width={24} height={24} />,
    calendar: <Image src="/svgs/CalendarIcon.svg" alt="Calendar" width={24} height={24} />,
    money: <Image src="/svgs/MoneyIcon.svg" alt="Money" width={24} height={24} />,
  };
  const iconBgColors: Record<IconName, string> = {
    users: '#e5e4ff',
    clients: '#fff3d6',
    calendar: '#ffded1',
    money: '#d9f7e8',
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReviewApplication = (_id: number) => {
    // Handle application review - would typically connect to an API
  };

  return (
    <DashboardPageWrapper
      header={
        <div className="flex w-full items-center gap-4">
          <div className="flex-shrink-0">
            <h1 className="font-open-sans font-semibold text-[24px] leading-[100%] text-black">
              Dashboard Overview
            </h1>
          </div>
          <div className="flex-grow flex justify-end max-w-md">
            <SearchBar placeholder={'Search'} />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStatsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={iconComponents[stat.iconName as IconName]}
              bgColor={iconBgColors[stat.iconName as IconName]}
            />
          ))}
        </div>

        {/* Applications and Appointments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardContainer title="New Therapist Applications">
            {mockApplicationsData.map((application) => (
              <ApplicationCard
                key={application.id}
                name={application.name}
                specialty={application.specialty}
                onReview={() => handleReviewApplication(application.id)}
              />
            ))}
          </CardContainer>

          <CardContainer title="Today's Appointments">
            {mockAppointmentsData.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                name={appointment.name}
                time={appointment.time}
                condition={appointment.condition}
                status={appointment.status}
              />
            ))}
          </CardContainer>
        </div>

        {/* Revenue Chart */}
        <RevenueChart month={mockChartData.month} />
      </div>
    </DashboardPageWrapper>
  );
};

export default AdminHome;
