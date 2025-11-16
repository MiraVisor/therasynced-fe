import api from './api';
import { ENDPOINTS } from './endpoints';

// DTOs matching the backend structure
export interface StatMetricDto {
  value: number;
  percentageChange: number;
  comparisonPeriod: string;
}

export interface AdminRevenueDto {
  totalRevenue: StatMetricDto;
  activeTherapists: StatMetricDto;
  completedSessions: StatMetricDto;
  averageSessionPrice: StatMetricDto;
  revenueThisWeek: number;
  revenueThisYear: number;
  averageMonthlyRevenue: number;
}

export interface SubscriptionStatsDto {
  totalActive: number;
  totalTrialing: number;
  totalCanceled: number;
  totalPastDue: number;
  totalUnpaid: number;
  monthlyRecurringRevenue: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  annualRecurringRevenue: number;
  retentionRate: number;
  newSubscriptionsThisMonth: number;
  canceledSubscriptionsThisMonth: number;
  averageRevenuePerSubscription: number;
  subscriptionsByPlan: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
  };
}

export interface AdminRevenueResponse {
  success: boolean;
  data: AdminRevenueDto;
  message?: string;
}

export interface AdminSubscriptionsResponse {
  success: boolean;
  data: SubscriptionStatsDto;
  message?: string;
}

const adminFinanceService = {
  // Get revenue statistics
  getRevenue: async (): Promise<AdminRevenueDto> => {
    const response = await api.get<AdminRevenueResponse>(ENDPOINTS.admin.finance.getRevenue);
    return response.data.data;
  },
  // Get subscription statistics
  getSubscriptions: async (): Promise<SubscriptionStatsDto> => {
    const response = await api.get<AdminSubscriptionsResponse>(
      ENDPOINTS.admin.finance.getSubscriptions,
    );
    return response.data.data;
  },
};

export default adminFinanceService;
export type { SubscriptionStatsDto };
