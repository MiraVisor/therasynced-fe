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
    <div className="bg-transparent">
      <div className="bg-transparent flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-0">
        {/* Left: Icon and Title */}
        <div className="flex items-center gap-2 min-w-[180px]">
          <span className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 bg-white mr-1">
            <Circle className="h-4 w-4 text-gray-300" />
          </span>
          <span className="text-[22px] font-medium text-black leading-tight">Total Revenue</span>
        </div>
        {/* Center: Provisions Month label and line */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full justify-center">
            <span className="block h-[4px] w-[110px] rounded-full bg-[#e8e6f2] mr-3 mt-1" />
            <span className="text-base font-normal text-gray-300 tracking-wide select-none">
              Provisions Month
            </span>
          </div>
        </div>
        {/* Right: Month/Year selector and more button */}
        <div className="flex items-center gap-2 min-w-[220px] justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <span className="mr-2">
                  {selectedMonth} {selectedYear}
                </span>
                <ChevronDown className="h-5 w-5 text-[#5E54F3]" />
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
          <button className="ml-2 p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
            <MoreHorizontal className="h-5 w-5 text-[#5E54F3]" />
          </button>
        </div>
      </div>
      <div className="relative h-[340px]">
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{ top: 40, right: 15, left: 15, bottom: 10 }}
            style={{ overflow: 'hidden', background: 'transparent' }}
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
    </div>
  );
}
