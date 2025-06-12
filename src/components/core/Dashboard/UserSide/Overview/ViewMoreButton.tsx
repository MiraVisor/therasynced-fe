import React from 'react';

import { Button } from '@/components/ui/button';

export const ViewMoreButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div className="flex justify-center mt-8">
    <Button className="bg-green-700 hover:bg-green-800 text-white px-8" onClick={onClick}>
      View more
    </Button>
  </div>
);
