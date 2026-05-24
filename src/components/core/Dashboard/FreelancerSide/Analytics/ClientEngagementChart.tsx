'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientEngagementData {
  retentionRate: number;
  repeatClientPercentage: number;
  newClients: number;
  returningClients: number;
  averageSessionsPerClient: number;
  clientLifetimeValue: number;
  totalClients: number;
}

interface ClientEngagementChartProps {
  data?: ClientEngagementData;
  isLoading?: boolean;
}

const COLORS = ['#26A69A', '#007745', '#10b981', '#3b82f6'];

const ClientEngagementChart = ({ data, isLoading = false }: ClientEngagementChartProps) => {
  if (isLoading) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="w-full h-full bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalClients === 0) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Client Engagement
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Client retention and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-charcoal mb-1">No client data yet</p>
            <p className="text-xs text-muted-foreground">
              Client engagement metrics will appear here once you have active clients
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'New Clients', value: data.newClients, color: COLORS[0] },
    { name: 'Returning Clients', value: data.returningClients, color: COLORS[1] },
  ];

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Client Engagement
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          Client retention and engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-inter text-muted-foreground">Retention Rate</p>
            <p className="text-xl font-poppins font-bold text-charcoal">
              {data.retentionRate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-inter text-muted-foreground">Repeat Clients</p>
            <p className="text-xl font-poppins font-bold text-charcoal">
              {data.repeatClientPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-inter text-muted-foreground">Avg Sessions/Client</p>
            <p className="text-xl font-poppins font-bold text-charcoal">
              {data.averageSessionsPerClient.toFixed(1)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-inter text-muted-foreground">Client Lifetime Value</p>
            <p className="text-xl font-poppins font-bold text-primary">
              EUR {data.clientLifetimeValue.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '8px',
                }}
                formatter={(value: number) => [value, 'Clients']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientEngagementChart;
