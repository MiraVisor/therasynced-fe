'use client';

import { BillingHistoryTable } from './BillingHistoryTable';
import { PaymentMethodCard } from './PaymentMethodCard';

interface BillingTabProps {
  className?: string;
}

export function BillingTab({ className = '' }: BillingTabProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Payment Method Section */}
      <PaymentMethodCard />

      {/* Billing History Section */}
      <BillingHistoryTable />
    </div>
  );
}
