'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FreelancerDashboardOverview } from '@/types/types';

interface ChartsProps {
  dashboardData: FreelancerDashboardOverview | null;
}

const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-charcoal mb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-teal">
            Current Week: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-primary">
            Last Week: <span className="font-medium">{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const Charts = ({ dashboardData }: ChartsProps) => {
  // Transform API data to chart format
  const getChartData = () => {
    if (!dashboardData?.weeklyAppointments) {
      // Return empty data if not loaded
      return [
        { day: 'Mon', current: 0, last: 0 },
        { day: 'Tue', current: 0, last: 0 },
        { day: 'Wed', current: 0, last: 0 },
        { day: 'Thu', current: 0, last: 0 },
        { day: 'Fri', current: 0, last: 0 },
        { day: 'Sat', current: 0, last: 0 },
        { day: 'Sun', current: 0, last: 0 },
      ];
    }

    const { currentWeek, lastWeek } = dashboardData.weeklyAppointments;

    return [
      { day: 'Mon', current: currentWeek.monday, last: lastWeek.monday },
      { day: 'Tue', current: currentWeek.tuesday, last: lastWeek.tuesday },
      { day: 'Wed', current: currentWeek.wednesday, last: lastWeek.wednesday },
      { day: 'Thu', current: currentWeek.thursday, last: lastWeek.thursday },
      { day: 'Fri', current: currentWeek.friday, last: lastWeek.friday },
      { day: 'Sat', current: currentWeek.saturday, last: lastWeek.saturday },
      { day: 'Sun', current: currentWeek.sunday, last: lastWeek.sunday },
    ];
  };

  const chartData = getChartData();

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Weekly Appointments
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          Current vs Last Week
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-full h-[300px] lg:h-[400px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              left: 0,
              right: 0,
              top: 20,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fill: '#2C3E50', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fill: '#2C3E50', fontSize: 12 }}
            />
            <Tooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: 'rgba(38, 166, 154, 0.1)' }}
            />

            <Bar
              dataKey="current"
              name="Current Week"
              fill="#26A69A"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
              className="hover:fill-teal transition-all duration-200"
            />
            <Bar
              dataKey="last"
              name="Last Week"
              fill="#007745"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
              className="hover:fill-primary transition-all duration-200"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default Charts;
