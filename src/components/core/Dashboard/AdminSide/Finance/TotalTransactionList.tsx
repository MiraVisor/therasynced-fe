import React from 'react';

import { Divider } from '@/components/ui/Divider';

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
    <div className="bg-white rounded-xl border shadow-sm py-4 pl-4 pr-0 w-full">
      <div className="pr-3">
        <h3 className="text-md font-semibold mb-4">Total Transaction</h3>
        <Divider className="mt-6 bg-[#000000] mb-3 mr-2" />
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {transactions.map((tx, index) => (
          <>
            <div key={index} className="flex justify-between items-center text-sm">
              <div>
                <div className="font-medium text-black">{tx.name}</div>
                <div className="text-gray-500">{tx.date} | Therapy Session</div>
              </div>
              <div className="font-semibold">${tx.amount}</div>
            </div>
            {index < transactions.length - 1 && <Divider className="my-2 text-gray-200" />}
          </>
        ))}
      </div>
    </div>
  );
};
