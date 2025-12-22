'use client';

import { pdf } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';

import { AdminTransaction } from '@/types/transaction';

// Dynamically import heavy PDF component
const SubscriptionInvoicePDF = dynamic(
  () => import('./SubscriptionInvoicePDF').then((mod) => ({ default: mod.SubscriptionInvoicePDF })),
  {
    ssr: false,
  },
);

export interface InvoiceGenerationData {
  transaction: AdminTransaction;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
}

export async function generateSubscriptionInvoicePDF(data: InvoiceGenerationData): Promise<Blob> {
  // Generate PDF using react-pdf
  const blob = await pdf(<SubscriptionInvoicePDF data={data} />).toBlob();
  return blob;
}

export async function downloadInvoice(data: InvoiceGenerationData): Promise<void> {
  try {
    const blob = await generateSubscriptionInvoicePDF(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
}
