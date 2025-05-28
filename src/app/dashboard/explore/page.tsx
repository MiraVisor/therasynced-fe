'use client';

import { useAuth } from '@/redux/hooks/useAppHooks';

const ExlorePage = () => {
  const { role: userRole } = useAuth();

  return (
    <div>
      Exlore Page as <span className="text-red-500 text-xl font-bold uppercase">{userRole}</span>
    </div>
  );
};

export default ExlorePage;
