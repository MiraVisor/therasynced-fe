/**
 * Analytics and dashboard types
 */

export interface TrendData {
  value: number;
  trendPercentage: number;
  trendDirection: 'up' | 'down';
  sparklineData: number[];
}

export interface WeeklyAppointments {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface FreelancerDashboardOverview {
  todayBookings: number;
  todayRevenue: number; // Revenue in cents/base currency
  unreadMessages: number;
  growthPercentage: number;
  totalAppointments: TrendData;
  clientRating: TrendData;
  newClients: TrendData;
  weeklyRevenue: TrendData;
  weeklyAppointments: {
    currentWeek: WeeklyAppointments;
    lastWeek: WeeklyAppointments;
  };
}

export interface FreelancerDashboardOverviewResponse {
  success: boolean;
  message?: string;
  data: FreelancerDashboardOverview;
  meta?: {
    timestamp?: string;
    path?: string;
  };
}

// Search filters interface
export interface SearchFilters {
  query: string;
  specialty: string[];
  serviceCategories: string[];
  location: string;
  priceMin?: number;
  priceMax?: number;
  sessionType: ('HOME' | 'CLINIC')[];
  availableThisWeek: boolean;
  verificationStatus: ('PENDING' | 'APPROVED' | 'REJECTED')[];
  minRating?: number;
  tier?: ('GOLD' | 'SILVER' | 'BRONZE')[];
}
