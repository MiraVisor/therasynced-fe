import { InvoiceDetails } from '@/types/invoice';

import api from './api';
import { ENDPOINTS } from './endpoints';

export interface InvoiceResponse {
  success: boolean;
  data: InvoiceDetails;
}

const invoiceService = {
  // Get invoice data for an invoice ID
  getInvoice: async (invoiceId: string): Promise<InvoiceDetails> => {
    const response = await api.get<InvoiceResponse>(ENDPOINTS.subscription.invoice(invoiceId));
    return response.data.data;
  },

  // Download invoice PDF directly from URL
  downloadInvoicePDF: async (invoiceUrl: string): Promise<void> => {
    // Open invoice URL in new tab or download
    window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
  },
};

export default invoiceService;
