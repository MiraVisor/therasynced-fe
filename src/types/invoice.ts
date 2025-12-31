/**
 * Invoice-related types
 */

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  transactionId: string;
  invoiceNumber: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  planName: string;
  amount: number;
  commission: number;
  netAmount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingHistoryItem {
  invoiceId: string;
  date: string; // ISO timestamp
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  planName: 'BRONZE' | 'SILVER' | 'GOLD';
  amount: number; // EUR
  status: string; // Invoice status
  invoiceUrl?: string; // PDF URL or hosted invoice URL
  paymentMethodId?: string;
  paymentMethodType?: string;
}

export interface BillingHistoryResponse {
  items: BillingHistoryItem[];
  total: number;
  hasMore: boolean;
}

export interface InvoiceDetails {
  invoiceId: string;
  invoiceNumber: string;
  issueDate: string; // ISO timestamp
  dueDate: string; // ISO timestamp
  status: string;
  subtotal: number; // EUR
  tax: number; // EUR
  total: number; // EUR
  currency: string;
  invoicePdf?: string; // PDF URL
  hostedInvoiceUrl?: string; // Hosted invoice URL
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number; // EUR
    total: number; // EUR
  }>;
  planName: string;
  periodStart: string; // Date string
  periodEnd: string; // Date string
  paymentMethodId?: string;
  paymentMethodType?: string;
}

// Legacy type for backward compatibility
export interface BillingTransaction {
  id: string;
  transactionId: string;
  invoiceNumber?: string;
  purchaseDate: string;
  endDate: string;
  packageName: string;
  amount: number;
  paymentMethod: 'stripe' | 'paypal' | 'other';
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description?: string;
  invoiceId?: string;
}

export interface PaymentMethod {
  id: string;
  type: string; // e.g., "card"
  brand?: string; // Card brand (optional)
  last4?: string; // Last 4 digits (optional)
  expMonth?: number; // Expiry month (optional)
  expYear?: number; // Expiry year (optional)
  isDefault: boolean;
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  customerId: string;
}
