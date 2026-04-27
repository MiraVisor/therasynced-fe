'use client';

import { InvoiceDownloadButton } from '@/components/core/Dashboard/FreelancerSide/Subscription/InvoiceDownloadButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AdminTransaction } from '@/types/transaction';

interface TransactionDetailsModalProps {
  transaction: AdminTransaction;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  const formatCurrency = (amount: number) => {
    return `EUR ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-poppins font-bold">Transaction Details</DialogTitle>
          <DialogDescription>Complete information about this transaction</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Transaction Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                  <p className="font-mono text-sm font-medium">{transaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Invoice ID</p>
                  <p className="font-mono text-sm font-medium">{transaction.invoiceId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-sm font-medium">{formatDate(transaction.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      transaction.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : transaction.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Freelancer Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Freelancer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-sm font-medium">{transaction.freelancerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium">{transaction.freelancerEmail}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Payment Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Plan</span>
                  <span className="text-sm font-medium capitalize">{transaction.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Amount</span>
                  <span className="text-sm font-medium">{formatCurrency(transaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Payment Method
              </h3>
              <p className="text-sm font-medium capitalize">{transaction.paymentMethod}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {transaction.invoiceId && (
              <InvoiceDownloadButton
                transactionId={transaction.transactionId}
                invoiceId={transaction.invoiceId}
              />
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
