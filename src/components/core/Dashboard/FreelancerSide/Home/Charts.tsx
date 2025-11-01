'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const chartData = [
  { day: 'Mon', current: 4, last: 3 },
  { day: 'Tue', current: 6, last: 4 },
  { day: 'Wed', current: 5, last: 5 },
  { day: 'Thu', current: 7, last: 6 },
  { day: 'Fri', current: 8, last: 7 },
  { day: 'Sat', current: 3, last: 2 },
  { day: 'Sun', current: 2, last: 1 },
];

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

const Charts = () => {
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
