/**
 * Transaction-related types for admin
 */

export interface AdminTransaction {
  transactionId: string;
  date: string; // ISO timestamp
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  plan: 'BRONZE' | 'SILVER' | 'GOLD';
  amount: number; // EUR
  commission: number; // EUR
  netAmount: number; // EUR
  paymentMethod: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  invoiceId: string;
  chargeId?: string;
  // Additional fields from details endpoint
  periodStart?: string;
  periodEnd?: string;
  invoiceUrl?: string;
  hostedInvoiceUrl?: string;
  currency?: string;
  commissionPercentage?: number;
}

export interface TransactionStats {
  totalRevenue: number; // EUR
  totalTransactions: number;
  averageTransactionValue: number; // EUR
  totalCommission: number; // EUR
  netRevenue: number; // EUR
  revenueByPlan: Record<string, number>; // Plan name -> revenue
  revenueByPaymentMethod: Record<string, number>; // Payment method -> revenue
  transactionsByStatus: Record<string, number>; // Status -> count
}

export interface TransactionFilters {
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  status?: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'all';
  plan?: 'BRONZE' | 'SILVER' | 'GOLD' | 'all';
  freelancerId?: string;
  paymentMethod?: string | 'all';
  search?: string; // Freelancer name or email
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
