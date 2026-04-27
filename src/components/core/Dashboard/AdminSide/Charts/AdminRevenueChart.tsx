'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdminRevenueChartProps {
  month: string;
  months: string[];
  onMonthChange: (month: string) => void;
  xLabels: string[];
  profitData: number[];
  lossData: number[];
  title?: string;
  showSelector?: boolean;
}

export function AdminRevenueChart({
  month,
  months,
  onMonthChange,
  xLabels,
  profitData,
  lossData,
  title = 'Monthly Revenue',
  showSelector = true,
}: AdminRevenueChartProps) {
  // Transform the data into the format Recharts expects
  const data = xLabels.map((label, index) => ({
    name: label,
    profit: profitData[index],
    loss: lossData[index],
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-soft">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-poppins text-xl font-semibold text-charcoal">
          {title}
        </h2>
        {showSelector && months.length > 1 && (
          <div className="flex items-center gap-2">
            <Select value={month} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>

              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFA07A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFA07A" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E6E6FA" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#E6E6FA" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="#FFA07A"
              fillOpacity={1}
              fill="url(#colorLoss)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#E6E6FA"
              fillOpacity={1}
              fill="url(#colorProfit)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#FFA07A]" />
          <span className="text-sm text-gray-600">Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#E6E6FA]" />
          <span className="text-sm text-gray-600">Profit</span>
        </div>
      </div>
    </div>
  );
}
