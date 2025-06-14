import { ArrowDown, ArrowUp, Calendar, DollarSign, Star, Users } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CardsData = [
  {
    title: 'Total Appointments',
    value: '1,248',
    change: '+24',
    trend: 'up',
    icon: Calendar,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Client Rating',
    value: '4.8',
    change: '+0.2',
    trend: 'up',
    icon: Star,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    title: 'New Clients',
    value: '8',
    change: '+3',
    trend: 'up',
    icon: Users,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    title: 'Weekly Revenue',
    value: '€2,480',
    change: '+€320',
    trend: 'up',
    icon: DollarSign,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

const Stats = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
      {CardsData.map((data, index) => {
        const Icon = data.icon;
        return (
          <Card
            key={index}
            className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl lg:rounded-2xl hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 px-5 lg:px-6 pt-5 lg:pt-6">
              <div className="space-y-1">
                <CardTitle className="text-sm lg:text-base font-medium text-gray-600">
                  {data.title}
                </CardTitle>
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900">{data.value}</div>
              </div>
              <div
                className={`p-3 lg:p-4 rounded-2xl ${data.iconBg} group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`h-6 w-6 lg:h-7 lg:w-7 ${data.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="px-5 lg:px-6 pb-5 lg:pb-6">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center text-xs lg:text-sm font-medium ${
                    data.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {data.trend === 'up' ? (
                    <ArrowUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5" />
                  )}
                  {data.change}
                </div>
                <CardDescription className="text-xs lg:text-sm text-gray-500">
                  from last week
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Stats;
