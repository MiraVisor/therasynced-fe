import { Calendar, DollarSign, Star, Users } from 'lucide-react';

import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';

const CardsData = [
  {
    title: 'Total Appointments',
    value: '1,248',
    trend: {
      value: 8.5,
      isUp: true,
      label: 'from last month',
    },
    icon: Calendar,
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    sparklineData: [12, 15, 18, 20, 22, 24, 26],
  },
  {
    title: 'Client Rating',
    value: '4.8',
    trend: {
      value: 2.1,
      isUp: true,
      label: 'from last month',
    },
    icon: Star,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    sparklineData: [4.5, 4.6, 4.7, 4.7, 4.8, 4.8, 4.8],
  },
  {
    title: 'New Clients',
    value: '8',
    trend: {
      value: 15.2,
      isUp: true,
      label: 'this month',
    },
    icon: Users,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    sparklineData: [3, 5, 6, 7, 8, 8, 8],
  },
  {
    title: 'Weekly Revenue',
    value: '€2,480',
    trend: {
      value: 12.8,
      isUp: true,
      label: 'from last week',
    },
    icon: DollarSign,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    sparklineData: [2100, 2200, 2300, 2350, 2400, 2450, 2480],
  },
];

const Stats = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {CardsData.map((data, index) => {
        const Icon = data.icon;
        return (
          <EnhancedStatCard
            key={index}
            title={data.title}
            value={data.value}
            trend={data.trend}
            icon={Icon}
            iconColor={data.iconColor}
            iconBg={data.iconBg}
            sparklineData={data.sparklineData}
            interactive
            onClick={() => {
              // Navigate to details or show modal
              console.log('Clicked:', data.title);
            }}
          />
        );
      })}
    </div>
  );
};

export default Stats;
