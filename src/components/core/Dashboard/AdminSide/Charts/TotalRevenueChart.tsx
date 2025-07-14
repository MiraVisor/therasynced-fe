'use client';

import { ChevronDown, Circle, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Updated chart data with two data series
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const chartConfig = {
  primary: {
    label: 'This Month',
    theme: {
      light: '#5E54F3',
      dark: '#7C74FF',
    },
  },
  secondary: {
    label: 'Last Month',
    theme: {
      light: '#E0E0E0',
      dark: '#AAAAAA',
    },
  },
} satisfies ChartConfig;

export function TotalRevenueChart() {
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [chartData, setChartData] = useState(() => generateChartData());

  // Value to display at the top of the chart
  const currentValue = 220342123;

  function generateChartData() {
    const points = [];
    // Control points for our curves
    const primaryControlPoints = [
      180000, 160000, 185000, 170000, 195000, 250000, 235000, 200000, 220000,
    ];
    const secondaryControlPoints = [
      140000, 130000, 145000, 155000, 135000, 160000, 150000, 165000, 155000,
    ];

    // Create a smooth curve between control points
    for (let i = 0; i < 30; i++) {
      const segment = Math.floor(i / (30 / (primaryControlPoints.length - 1)));
      const stepSize = 30 / (primaryControlPoints.length - 1);
      const progress = (i % stepSize) / stepSize;

      // Calculate interpolated values between control points with small variation
      let primary = primaryControlPoints[segment];
      if (segment < primaryControlPoints.length - 1) {
        primary += progress * (primaryControlPoints[segment + 1] - primaryControlPoints[segment]);
      }
      primary += Math.random() * 10000 - 5000;

      let secondary = secondaryControlPoints[segment];
      if (segment < secondaryControlPoints.length - 1) {
        secondary +=
          progress * (secondaryControlPoints[segment + 1] - secondaryControlPoints[segment]);
      }
      secondary += Math.random() * 8000 - 4000;

      points.push({
        day: i + 1,
        primary: Math.round(primary),
        secondary: Math.round(secondary),
      });
    }

    return points;
  }

  // Handle month change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setChartData(generateChartData());
  };

  // Handle year change
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setChartData(generateChartData());
  };

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="bg-transparent flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <Circle className="h-5 w-5 text-gray-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Total Revenue</h3>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
                <span>
                  {selectedMonth} {selectedYear}
                </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <div className="grid gap-4 p-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Month</h4>
                  <Select value={selectedMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Year</h4>
                  <Select value={selectedYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <button className="p-1 rounded-md hover:bg-gray-100">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-bold">{new Intl.NumberFormat().format(currentValue)}</div>
          <div className="text-sm text-gray-500">{selectedMonth}</div>
        </div>

        <div className="relative h-[340px]">
          {/* Provisions Month line and text */}
          <div className="absolute top-0 w-full flex items-center justify-between mb-3 z-10 pointer-events-none">
            <div className="h-[1px] bg-gray-200 flex-grow mr-2"></div>
            <span className="text-xs text-gray-400 px-1 whitespace-nowrap">Provisions Month</span>
            <div className="h-[1px] bg-gray-200 flex-grow ml-2 mr-10"></div>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {selectedMonth} {selectedYear}
            </span>
          </div>

          <ChartContainer config={chartConfig}>
            <LineChart
              data={chartData}
              margin={{ top: 40, right: 15, left: 15, bottom: 10 }}
              style={{ overflow: 'hidden' }}
            >
              <defs>
                <pattern id="verticalDotLine" patternUnits="userSpaceOnUse" width="10" height="10">
                  <path
                    d="M0,0 v10"
                    stroke="#5E54F3"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                    fill="none"
                  />
                </pattern>
              </defs>
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#888' }}
                tickFormatter={(value) => (value % 5 === 0 ? value : '')}
                domain={[1, 30]}
              />
              <YAxis hide={true} domain={['dataMin - 20000', 'dataMax + 20000']} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              {/* Vertical dotted line at day 15 */}
              <ReferenceLine x={15} stroke="#5E54F3" strokeWidth={1.5} strokeDasharray="3,3" />

              {/* Add a dot at day 15 */}
              <ReferenceDot
                x={15}
                y={chartData.find((item) => item.day === 15)?.primary || 0}
                r={5}
                fill="#5E54F3"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="primary"
                strokeWidth={2.5}
                stroke="var(--color-primary)"
                activeDot={{ r: 6, fill: '#5E54F3', stroke: '#ffffff', strokeWidth: 2 }}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="secondary"
                strokeWidth={2}
                stroke="var(--color-secondary)"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
