'use client';

import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Database,
  FileDown,
  FileText,
  Home,
  LogOut,
  Map,
  MessageSquare,
  Receipt,
  Settings,
  Shield,
  Tag,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuthZustand';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import { RoleType } from '@/types/types';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: RoleType | null;
}

interface NavigationLink {
  name: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavigationLink[];
}

const navigationLinks: Record<RoleType, NavigationLink[]> = {
  PATIENT: [
    {
      name: 'Home',
      url: '/dashboard',
      icon: Home,
    },
    {
      name: 'Book',
      url: '/dashboard/book',
      icon: Map,
    },
    {
      name: 'Sessions',
      url: '/dashboard/my-bookings',
      icon: Calendar,
    },
    {
      name: 'Messages',
      url: '/dashboard/messages',
      icon: MessageSquare,
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
    {
      name: 'My Slots',
      url: '/dashboard/slots',
      icon: Calendar,
    },
    {
      name: 'Messages',
      url: '/dashboard/messages',
      icon: MessageSquare,
    },
    {
      name: 'Verification',
      url: '/dashboard/verification',
      icon: Shield,
    },
    {
      name: 'Analytics',
      url: '/dashboard/analytics',
      icon: BarChart,
    },
    {
      name: 'Forms',
      url: '/dashboard/forms',
      icon: FileText,
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
      name: 'Verification Queue',
      url: '/dashboard/admin/verifications',
      icon: Shield,
    },
    {
      name: 'Complaints',
      url: '/dashboard/admin/complaints',
      icon: AlertTriangle,
    },
    {
      name: 'Bookings',
      url: '/dashboard/admin-bookings',
      icon: Calendar,
    },
    {
      name: 'Transactions',
      url: '/dashboard/admin/transactions',
      icon: Receipt,
    },
    {
      name: 'Refunds',
      url: '/dashboard/admin/refunds',
      icon: FileDown,
    },
    {
      name: 'Finance',
      url: '/dashboard/finance',
      icon: Wallet,
    },
    {
      name: 'Subscriptions',
      url: '/dashboard/admin/subscriptions',
      icon: CreditCard,
    },
    {
      name: 'User Subscriptions',
      url: '/dashboard/admin/user-subscriptions',
      icon: UserCheck,
    },
    {
      name: 'Configuration',
      icon: Settings,
      subItems: [
        {
          name: 'Job Titles',
          url: '/dashboard/admin/job-titles',
          icon: Briefcase,
        },
        {
          name: 'Service Categories',
          url: '/dashboard/admin/service-categories',
          icon: Tag,
        },
        {
          name: 'Document Requirements',
          url: '/dashboard/admin/document-requirements',
          icon: ClipboardCheck,
        },
        {
          name: 'Form Templates',
          url: '/dashboard/admin/forms',
          icon: FileText,
        },
      ],
    },
    {
      name: 'Compliance',
      icon: Database,
      subItems: [
        {
          name: 'Health Data Logs',
          url: '/dashboard/admin/health-data-logs',
          icon: Activity,
        },
        {
          name: 'Data Breaches',
          url: '/dashboard/admin/audit?tab=breaches',
          icon: Database,
        },
        {
          name: 'DPC Exports',
          url: '/dashboard/admin/exports',
          icon: FileDown,
        },
      ],
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout } = useAuth();
  const { state } = useSidebar();
  // Role is guaranteed to be provided when component renders
  const links = userRole ? navigationLinks[userRole] : [];
  const unreadCounts = useChatStore((state) => state.unreadCounts);
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    Configuration: false,
    Compliance: false,
  });

  // Auto-open sections if current path matches a subItem
  React.useEffect(() => {
    if (userRole === 'ADMIN') {
      const configSubItems = links.find((item) => item.name === 'Configuration')?.subItems || [];
      const complianceSubItems = links.find((item) => item.name === 'Compliance')?.subItems || [];

      const isInConfig = configSubItems.some(
        (subItem) => pathname === subItem.url || pathname.startsWith(subItem.url || ''),
      );
      const isInCompliance = complianceSubItems.some(
        (subItem) => pathname === subItem.url || pathname.startsWith(subItem.url || ''),
      );

      setOpenSections((prev) => ({
        ...prev,
        Configuration: isInConfig,
        Compliance: isInCompliance,
      }));
    }
  }, [pathname, userRole, links]);

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  const toggleSection = (sectionName: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const isSubItemActive = (subItem: NavigationLink) => {
    if (!subItem.url) return false;
    // Handle query params for audit page
    if (subItem.url.includes('?')) {
      const [baseUrl, query] = subItem.url.split('?');
      if (!query) return false;
      const [queryKey, queryValue] = query.split('=');
      if (pathname === baseUrl && queryKey) {
        const currentTab = searchParams.get(queryKey);
        return currentTab === queryValue || (queryValue === 'breaches' && !currentTab);
      }
      return false;
    }
    return pathname === subItem.url || pathname.startsWith(subItem.url);
  };

  return (
    <Sidebar variant="sidebar" collapsible={'icon'} className="p-4 bg-dashboard !border-r-0 ">
      <SidebarHeader className="mx-auto w-full ">
        <div
          className="flex items-center justify-center px-2 mx-auto cursor-pointer min-h-[40px]"
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
            {links.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isOpen = hasSubItems ? openSections[item.name] : false;
              const isActive = hasSubItems
                ? item.subItems?.some((subItem) => isSubItemActive(subItem))
                : pathname === item.url;

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    className={cn(
                      'h-[40px] bg-secondary/20 transition-all duration-200 px-5 cursor-pointer',
                      'hover:bg-accent active:bg-accent/50',
                      resolvedTheme === 'dark' ? 'text-foreground' : 'text-foreground/90',
                      'data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground',
                      isMobile &&
                        'group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:hover:translate-x-0',
                    )}
                    isActive={isActive}
                    onClick={() => {
                      if (hasSubItems) {
                        toggleSection(item.name);
                      } else if (item.url) {
                        handleNavigation(item.url);
                      }
                    }}
                  >
                    <div className="mx-auto flex items-center gap-3 relative w-full">
                      <div className="relative">
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
                      </div>
                      <span className="text-sm font-medium flex-1">{item.name}</span>
                      {hasSubItems && (
                        <div className="ml-auto">
                          {isOpen ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </div>
                      )}
                      {item.name === 'Messages' && totalUnreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                        >
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </Badge>
                      )}
                    </div>
                  </SidebarMenuButton>
                  {hasSubItems && isOpen && (
                    <SidebarMenuSub>
                      {item.subItems?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.name}>
                          <SidebarMenuSubButton
                            isActive={isSubItemActive(subItem)}
                            onClick={() => subItem.url && handleNavigation(subItem.url)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <subItem.icon className="size-4" />
                            <span>{subItem.name}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
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
                  router.replace('/');
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
