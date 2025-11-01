import { Calendar, Heart, MessageCircle, Star } from 'lucide-react';

import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';

const CardsData = [
  {
    title: 'Total Sessions',
    value: '48',
    trend: {
      value: 12.5,
      isUp: true,
      label: 'this year',
    },
    icon: Calendar,
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    sparklineData: [5, 6, 8, 7, 9, 10, 8],
  },
  {
    title: 'Upcoming Bookings',
    value: '5',
    trend: {
      value: 25.0,
      isUp: true,
      label: 'this month',
    },
    icon: Calendar,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    sparklineData: [2, 3, 4, 3, 5, 5, 5],
  },
  {
    title: 'Favorite Freelancers',
    value: '8',
    trend: {
      value: 14.3,
      isUp: true,
      label: 'this month',
    },
    icon: Heart,
    iconBg: 'bg-error/10',
    iconColor: 'text-error',
    sparklineData: [6, 7, 7, 8, 8, 8, 8],
  },
  {
    title: 'Avg Rating Given',
    value: '4.9',
    trend: {
      value: 2.1,
      isUp: true,
      label: 'recent sessions',
    },
    icon: Star,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    sparklineData: [4.6, 4.7, 4.8, 4.8, 4.9, 4.9, 4.9],
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
            }}
          />
        );
      })}
    </div>
  );
};

export default Stats;
