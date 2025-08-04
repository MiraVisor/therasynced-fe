import { Users } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';

interface SectionHeaderProps {
  totalCount?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ totalCount = 0 }) => (
  <div className="flex items-center justify-between">
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Expert Therapists</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Connect with certified mental health professionals dedicated to your well-being
      </p>
    </div>
    <Badge variant="secondary" className="text-sm">
      {totalCount}+ Available
    </Badge>
  </div>
);
