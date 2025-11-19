import React from 'react';

import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Separator } from '@/components/ui/separator';

type Transaction = {
  name: string;
  date: string;
  amount: string;
};

type Props = {
  transactions: Transaction[];
};

export const TotalTransactionList = ({ transactions }: Props) => {
  return (
    <EnhancedCard variant="default" className="p-6 w-full">
      <div>
        <h3 className="font-poppins text-lg font-semibold text-foreground mb-4">
          Total Transaction
        </h3>
        <Separator className="mb-4" />
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {transactions.map((tx, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-inter font-medium text-sm text-foreground">{tx.name}</div>
                <div className="font-open-sans text-xs text-muted-foreground mt-1">
                  {tx.date} | Therapy Session
                </div>
              </div>
              <div className="font-poppins font-semibold text-sm text-foreground">
                EUR {tx.amount}
              </div>
            </div>
            {index < transactions.length - 1 && <Separator className="my-2" />}
          </React.Fragment>
        ))}
      </div>
    </EnhancedCard>
  );
};
