'use client';

import { useAuth } from '@/redux/hooks/useAppHooks';

const MyBookingsPage = () => {
  const { role: userRole } = useAuth();

  return (
    <div>
      My Bookings with Role as{' '}
      <span className="text-red-500 text-xl font-bold uppercase">{userRole}</span>
    </div>
  );
};

export default MyBookingsPage;
