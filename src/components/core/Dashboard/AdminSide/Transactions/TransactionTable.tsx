'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Download, Eye, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { InvoiceDownloadButton } from '@/components/core/Dashboard/FreelancerSide/Subscription/InvoiceDownloadButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminTransaction } from '@/types/transaction';

import { TransactionDetailsModal } from './TransactionDetailsModal';

interface TransactionTableProps {
  transactions: AdminTransaction[];
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export function TransactionTable({
  transactions,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  page = 1,
  pageSize = 20,
  totalPages = 1,
}: TransactionTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return `EUR ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: AdminTransaction['status']) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PAID: {
        label: 'Paid',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      PENDING: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      },
      FAILED: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
      REFUNDED: {
        label: 'Refunded',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      },
    };

    const config = statusConfig[status] || statusConfig['PENDING'];

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config?.className || ''}`}
      >
        {config?.label || status}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: AdminTransaction['paymentMethod']) => {
    if (method === 'paypal') {
      return <span className="text-xs font-semibold text-blue-600">PayPal</span>;
    }
    if (method === 'stripe') {
      return <span className="text-xs font-semibold text-indigo-600">Stripe</span>;
    }
    return <span className="text-xs capitalize">{method}</span>;
  };

  const columns: ColumnDef<AdminTransaction>[] = [
    {
      accessorKey: 'transactionId',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Transaction ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('transactionId')}</div>,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'freelancerName',
      header: 'Freelancer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.freelancerName}</div>
          <div className="text-xs text-gray-500">{row.original.freelancerEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      cell: ({ row }) => <span className="capitalize font-medium">{row.getValue('plan')}</span>,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-semibold">{formatCurrency(row.getValue('amount'))}</div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ row }) => getPaymentMethodBadge(row.getValue('paymentMethod')),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      id: 'invoice',
      header: 'Invoice',
      cell: ({ row }) => {
        const transaction = row.original;
        return transaction.invoiceId ? (
          <InvoiceDownloadButton
            transactionId={transaction.transactionId}
            invoiceId={transaction.invoiceId}
          />
        ) : (
          <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedTransaction(transaction);
                  setIsDetailsModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {transaction.invoiceId && (
                <DropdownMenuItem
                  onClick={() => {
                    // Handle invoice download
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={transactions}
        title="All Transactions"
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        pageSize={pageSize}
        showSearch={false}
        showSorting={true}
        loading={isLoading}
        initialLoading={isLoading}
        externalPageIndex={page - 1}
        externalPageSize={pageSize}
        totalPages={totalPages}
        onExternalPageChange={(pageIndex) => onPageChange?.(pageIndex + 1)}
        onExternalPageSizeChange={onPageSizeChange}
      />

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </>
  );
}
