'use client';

import { format } from 'date-fns';
import {
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  PieChart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
interface Transaction {
  id: string;
  clientName: string;
  date: string;
  service: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: 'card' | 'cash' | 'transfer';
}

interface EarningsData {
  date: string;
  earnings: number;
  sessions: number;
}

// Mock data - replace with actual API calls
const mockTransactions: Transaction[] = [
  {
    id: '1',
    clientName: 'John Smith',
    date: '2025-01-15',
    service: 'Therapy Session',
    amount: 120,
    status: 'completed',
    paymentMethod: 'card',
  },
  {
    id: '2',
    clientName: 'Sarah Johnson',
    date: '2025-01-14',
    service: 'Premium Consultation',
    amount: 180,
    status: 'completed',
    paymentMethod: 'transfer',
  },
  {
    id: '3',
    clientName: 'Mike Wilson',
    date: '2025-01-13',
    service: 'Home Visit',
    amount: 150,
    status: 'completed',
    paymentMethod: 'cash',
  },
  {
    id: '4',
    clientName: 'Emily Davis',
    date: '2025-01-12',
    service: 'Therapy Session',
    amount: 120,
    status: 'pending',
    paymentMethod: 'card',
  },
  {
    id: '5',
    clientName: 'David Brown',
    date: '2025-01-11',
    service: 'Specialized Equipment Session',
    amount: 200,
    status: 'completed',
    paymentMethod: 'card',
  },
  {
    id: '6',
    clientName: 'Lisa Anderson',
    date: '2025-01-10',
    service: 'Therapy Session',
    amount: 120,
    status: 'cancelled',
    paymentMethod: 'card',
  },
];

const mockEarningsData: EarningsData[] = [
  { date: '2025-01-01', earnings: 850, sessions: 7 },
  { date: '2025-01-02', earnings: 920, sessions: 8 },
  { date: '2025-01-03', earnings: 780, sessions: 6 },
  { date: '2025-01-04', earnings: 1100, sessions: 9 },
  { date: '2025-01-05', earnings: 950, sessions: 8 },
  { date: '2025-01-06', earnings: 1200, sessions: 10 },
  { date: '2025-01-07', earnings: 1050, sessions: 9 },
];

const FinancePage = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [earningsData, setEarningsData] = useState<EarningsData[]>(mockEarningsData);
  const [showPending, setShowPending] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate stats
  const totalEarnings = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingEarnings = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSessions = transactions.filter((t) => t.status === 'completed').length;
  const avgSessionPrice = totalSessions > 0 ? totalEarnings / totalSessions : 0;

  // Calculate trends (mock data)
  const previousMonthEarnings = totalEarnings * 0.85; // 15% increase
  const earningsTrend = ((totalEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showPending || transaction.status === 'completed';
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'cash':
        return '💵';
      case 'transfer':
        return '🏦';
      default:
        return '💰';
    }
  };

  const handleExport = () => {
    // Mock export functionality
    const csvContent = [
      'Date,Client,Service,Amount,Status,Payment Method',
      ...filteredTransactions.map(
        (t) => `${t.date},${t.clientName},${t.service},${t.amount},${t.status},${t.paymentMethod}`,
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <LoadingSpinner size="lg" />
  //     </div>
  //   );
  // }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-2xl font-bold">Finance & Analytics</h2>
          <p className="text-gray-600">Track your earnings and financial performance</p>
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showPending ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPending(!showPending)}
              >
                {showPending ? (
                  <Eye className="h-4 w-4 mr-1" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-1" />
                )}
                {showPending ? 'Show All' : 'Hide Pending'}
              </Button>
            </div>
            <Input
              className="md:ml-auto w-full md:w-64"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    €{totalEarnings.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    {earningsTrend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-xs ${earningsTrend > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {Math.abs(earningsTrend).toFixed(1)}% from last month
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Pending Earnings</p>
                  <p className="text-2xl font-bold text-blue-900">
                    €{pendingEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {transactions.filter((t) => t.status === 'pending').length} pending payments
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completed Sessions</p>
                  <p className="text-2xl font-bold text-purple-900">{totalSessions}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {transactions.filter((t) => t.status === 'cancelled').length} cancelled
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Avg. Session Price</p>
                  <p className="text-2xl font-bold text-amber-900">€{avgSessionPrice.toFixed(0)}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {transactions.length} total transactions
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Earnings Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Earnings chart will be implemented here</p>
                    <p className="text-sm text-gray-400">Showing data for {timeRange}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['card', 'cash', 'transfer'].map((method) => {
                    const methodTransactions = transactions.filter(
                      (t) => t.paymentMethod === method,
                    );
                    const methodTotal = methodTransactions.reduce((sum, t) => sum + t.amount, 0);
                    const percentage = totalEarnings > 0 ? (methodTotal / totalEarnings) * 100 : 0;

                    return (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPaymentMethodIcon(method)}</span>
                          <span className="text-sm font-medium capitalize">{method}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">€{methodTotal.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Best day</span>
                  <span className="text-sm font-medium">Wednesday</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Peak hours</span>
                  <span className="text-sm font-medium">2-4 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Most popular service</span>
                  <span className="text-sm font-medium">Therapy Session</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Client retention</span>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No transactions found</div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.clientName}</p>
                        <p className="text-sm text-gray-500">{transaction.service}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{transaction.amount}</p>
                      <Badge className={`${getStatusColor(transaction.status)} text-white text-xs`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageWrapper>
  );
};

export default FinancePage;
