'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { useAuth } from '@/redux/hooks/useAppHooks';

interface LayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const centerLayoutRoutes = ['/authentication/sign-in'];
  const isCenterLayout = !isAuthenticated || centerLayoutRoutes.includes(pathname);

  if (isCenterLayout) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">{children}</div>
    );
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">{children}</div>
    );
  }

  return (
    <div className="overflow-x-hidden min-h-screen flex">
      {/* Top NavBar */}
      <div className="fixed bg-background top-0 left-0 right-0 z-10">Navbar Component Here</div>

      {/* Left Sidebar */}
      <div className="hidden md:block fixed bg-background border-r border-gray-300 top-20 left-0 w-52 min-h-screen overflow-y-auto z-2">
        SideBar
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-2 px-4 mt-20 ml-0 md:ml-52 overflow-auto relative z-1">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
