'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import invoiceService from '@/services/invoiceService';

interface InvoiceDownloadButtonProps {
  transactionId: string;
  invoiceId?: string;
  invoiceNumber?: string;
}

export function InvoiceDownloadButton({
  transactionId,
  invoiceId,
  invoiceNumber: _invoiceNumber,
}: InvoiceDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Use invoiceId if available, otherwise use transactionId
      const idToUse = invoiceId || transactionId;

      // Get invoice details from API
      const invoiceData = await invoiceService.getInvoice(idToUse);

      // If invoice has a PDF URL, download directly
      if (invoiceData.invoicePdf) {
        invoiceService.downloadInvoicePDF(invoiceData.invoicePdf);
        toast.success('Invoice opened in new tab');
      } else if (invoiceData.hostedInvoiceUrl) {
        // Open hosted invoice URL
        window.open(invoiceData.hostedInvoiceUrl, '_blank', 'noopener,noreferrer');
        toast.success('Invoice opened in new tab');
      } else {
        toast.error('Invoice PDF not available. Please contact support.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again or contact support.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}
      className="h-8 w-8 p-0"
      title="Download invoice"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="sr-only">Download invoice</span>
    </Button>
  );
}
