import React from 'react';

import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className }) => {
  return <hr className={cn('w-full border-0 h-px bg-[#D7D7D7]', className)} />;
};
