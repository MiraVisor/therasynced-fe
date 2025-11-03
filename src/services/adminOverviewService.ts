import api from './api';
import { ENDPOINTS } from './endpoints';

// DTOs matching the backend structure
export interface StatMetricDto {
  value: number;
  percentageChange: number;
  comparisonPeriod: string;
}

export interface RevenueChartDataDto {
  date: string;
  profit: number;
  loss: number;
}

export interface AdminOverviewDto {
  totalUsers: StatMetricDto;
  activeClients: StatMetricDto;
  sessionsThisMonth: StatMetricDto;
  revenue: StatMetricDto;
  monthlyRevenueChart: RevenueChartDataDto[];
}

export interface AdminOverviewResponse {
  success: boolean;
  data: AdminOverviewDto;
  message?: string;
}

const adminOverviewService = {
  // Get admin overview statistics and charts
  getOverview: async (): Promise<AdminOverviewDto> => {
    const response = await api.get<AdminOverviewResponse>(ENDPOINTS.admin.overview.get);
    return response.data.data;
  },
};

export default adminOverviewService;
