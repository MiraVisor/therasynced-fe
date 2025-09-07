'use client';

import {
  BarChart,
  Calendar,
  FileText,
  Home,
  LogOut,
  Map,
  MessageSquare,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { RoleType } from '@/types/types';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: RoleType | null;
}

const navigationLinks = {
  PATIENT: [
    {
      name: 'Home',
      url: '/dashboard',
      icon: Home,
    },
    {
      name: 'Explore',
      url: '/dashboard/explore',
      icon: Map,
    },
    {
      name: 'My Bookings',
      url: '/dashboard/my-bookings',
      icon: Calendar,
    },
    {
      name: 'Account',
      url: '/dashboard/account',
      icon: Settings,
    },
  ],
  FREELANCER: [
    {
      name: 'Overview',
      url: '/dashboard',
      icon: Home,
    },
    // {
    //   name: 'Appointments',
    //   url: '/dashboard/appointments',
    //   icon: Calendar,
    // },
    {
      name: 'Bookings',
      url: '/dashboard/slots',
      icon: Calendar,
    },
    {
      name: 'Messages',
      url: '/dashboard/messages',
      icon: MessageSquare,
    },
    {
      name: 'Services',
      url: '/dashboard/services',
      icon: Users,
    },
    {
      name: 'Analytics',
      url: '/dashboard/analytics',
      icon: BarChart,
    },
    {
      name: 'Account',
      url: '/dashboard/account',
      icon: Settings,
    },
  ],
  ADMIN: [
    {
      name: 'Overview',
      url: '/dashboard',
      icon: Home,
    },
    {
      name: 'Freelancers',
      url: '/dashboard/freelancers',
      icon: Users,
    },
    {
      name: 'Reviews & Reports',
      url: '/dashboard/reviews',
      icon: FileText,
    },
    {
      name: 'Bookings',
      url: '/dashboard/bookings',
      icon: Calendar,
    },
    {
      name: 'Finance',
      url: '/dashboard/finance',
      icon: Wallet,
    },
    {
      name: 'Account',
      url: '/dashboard/account',
      icon: Settings,
    },
  ],
};

export function AppSidebar({ userRole }: AppSidebarProps) {
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { state } = useSidebar();
  const links = userRole ? navigationLinks[userRole] : [];

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <Sidebar variant="sidebar" collapsible={'icon'} className="p-4 bg-dashboard !border-r-0 ">
      <SidebarHeader className="mx-auto w-full ">
        <div
          className="flex items-center justify-between gap-2 px-2 mx-auto cursor-pointer"
          onClick={() => router.push('/dashboard')}
        >
          <Image
            src={`/svgs/NewLogoLight.svg`}
            alt="logo"
            width={150}
            height={40}
            priority
            className="transition-transform duration-300"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className={cn(isMobile && 'group-data-[collapsible=icon]:block')}>
          <SidebarMenu>
            {links.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    'h-[40px] bg-secondary/20 transition-all duration-200 px-5 cursor-pointer',
                    'hover:bg-accent active:bg-accent/50',
                    resolvedTheme === 'dark' ? 'text-foreground' : 'text-foreground/90',

                    'data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground',
                    isMobile &&
                      'group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:hover:translate-x-0',
                  )}
                  isActive={pathname === item.url}
                >
                  <div
                    className="mx-auto flex items-center gap-3"
                    onClick={() => handleNavigation(item.url)}
                  >
                    <item.icon
                      className={cn(
                        'size-5 transition-all duration-200',
                        resolvedTheme === 'dark' ? 'text-foreground' : 'text-foreground/90',
                        'group-hover:scale-110',
                        isMobile &&
                          'group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:group-hover:scale-110',
                        isMobile && resolvedTheme === 'dark'
                          ? 'group-data-[collapsible=icon]:group-hover:text-accent-foreground'
                          : 'group-data-[collapsible=icon]:group-hover:text-accent-foreground',
                      )}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <SidebarSeparator />
        <div className="p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  logout();
                  router.push('/authentication/sign-in');
                }}
                variant="ghost"
                className="w-full gap-2"
              >
                <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" hidden={state !== 'collapsed' || isMobile}>
              <p>Sign Out</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
