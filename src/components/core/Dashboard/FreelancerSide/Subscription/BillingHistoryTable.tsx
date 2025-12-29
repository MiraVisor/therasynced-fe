'use client';

import { Download, FileText, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useBillingHistoryFlat } from '@/hooks/queries/useBillingHistory';

import { InvoiceDownloadButton } from './InvoiceDownloadButton';
import { RefundRequestDialog } from './RefundRequestDialog';

export function BillingHistoryTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<{
    invoiceId: string;
    amount: number;
  } | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const {
    data: transactions,
    isLoading,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useBillingHistoryFlat(20);

  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      transaction.planName.toLowerCase().includes(query) ||
      transaction.invoiceId.toLowerCase().includes(query) ||
      false
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `EUR ${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusConfig: Record<string, { label: string; className: string }> = {
      paid: {
        label: 'Paid',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      },
      failed: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
      refunded: {
        label: 'Refunded',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      },
    };

    const config = statusConfig[statusLower] || statusConfig['pending'];

    if (!config) {
      return <span className="text-xs text-gray-500">{status}</span>;
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (methodType?: string) => {
    if (!methodType) return <span className="text-xs">•</span>;
    if (methodType.toLowerCase().includes('paypal')) {
      return <span className="text-xs font-semibold text-blue-600">PP</span>;
    }
    if (methodType.toLowerCase().includes('card')) {
      return <span className="text-xs font-semibold text-indigo-600">CC</span>;
    }
    return <span className="text-xs">•</span>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-poppins font-bold text-charcoal mb-2">Billing History</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and download your past invoices
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by plan name or invoice ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-poppins font-semibold text-charcoal mb-2">
              {searchQuery ? 'No Results Found' : 'No Billing History'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery
                ? 'No transactions found matching your search.'
                : 'Your billing history will appear here once you make your first payment.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-200 dark:border-gray-700">
                    <TableHead className="font-poppins font-semibold text-charcoal">Date</TableHead>
                    <TableHead className="font-poppins font-semibold text-charcoal">
                      Period
                    </TableHead>
                    <TableHead className="font-poppins font-semibold text-charcoal">Plan</TableHead>
                    <TableHead className="font-poppins font-semibold text-charcoal">
                      Amount
                    </TableHead>
                    <TableHead className="font-poppins font-semibold text-charcoal">
                      Payment Method
                    </TableHead>
                    <TableHead className="font-poppins font-semibold text-charcoal">
                      Status
                    </TableHead>
                    <TableHead className="font-poppins font-semibold text-charcoal">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.invoiceId}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-inter py-4">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell className="font-inter text-sm py-4 text-gray-600 dark:text-gray-400">
                        {transaction.periodStart} - {transaction.periodEnd}
                      </TableCell>
                      <TableCell className="font-inter font-medium capitalize py-4">
                        {transaction.planName}
                      </TableCell>
                      <TableCell className="font-inter font-semibold text-charcoal py-4">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethodType)}
                          <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                            {transaction.paymentMethodType || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {transaction.invoiceUrl ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(transaction.invoiceUrl, '_blank')}
                              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="View invoice"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <InvoiceDownloadButton
                              transactionId={transaction.invoiceId}
                              invoiceId={transaction.invoiceId}
                            />
                          )}
                          {transaction.status === 'paid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice({
                                  invoiceId: transaction.invoiceId,
                                  amount: transaction.amount,
                                });
                                setIsRefundDialogOpen(true);
                              }}
                              className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Request refund"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Refund
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  size="lg"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Transactions'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Refund Request Dialog */}
      {selectedInvoice && (
        <RefundRequestDialog
          isOpen={isRefundDialogOpen}
          onClose={() => {
            setIsRefundDialogOpen(false);
            setSelectedInvoice(null);
          }}
          invoiceId={selectedInvoice.invoiceId}
          invoiceAmount={selectedInvoice.amount}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </Card>
  );
}
