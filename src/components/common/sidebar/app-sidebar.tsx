'use client';

import {
  BadgeCheck,
  BarChart,
  Bell,
  Calendar,
  ChevronsUpDown,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Map,
  MessageSquare,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
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
      name: 'Messages',
      url: '/dashboard/messages',
      icon: MessageSquare,
    },
  ],
  FREELANCER: [
    {
      name: 'Overview',
      url: '/dashboard',
      icon: Home,
    },
    {
      name: 'Appointments',
      url: '/dashboard/appointments',
      icon: Calendar,
    },
    {
      name: 'Messages',
      url: '/dashboard/messages',
      icon: MessageSquare,
    },
    {
      name: 'Services',
      url: '/dashboard/serivces',
      icon: Users,
    },
    {
      name: 'Finance & Analytics',
      url: '/dashboard/finance',
      icon: BarChart,
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
  ],
};

export function AppSidebar({ userRole }: AppSidebarProps) {
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const links = userRole ? navigationLinks[userRole] : [];

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  const handleLogout = () => {
    logout();
    router.push('/authentication/sign-in');
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    'hover:bg-accent active:bg-accent/50',
                    'data-[state=open]:bg-accent mx-auto',
                    'data-[state=open]:border data-[state=open]:border-primary',
                    resolvedTheme === 'dark'
                      ? 'data-[state=open]:text-foreground'
                      : 'data-[state=open]:text-foreground/90',
                  )}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Mehad Nadeem</span>
                    <span className="truncate text-xs text-muted-foreground/70">xyz@gmail.com</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/70" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  'w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg ml-1',
                  resolvedTheme === 'dark' ? 'bg-background' : 'bg-background',
                )}
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Mehad Nadeem</span>
                      <span className="truncate text-xs text-muted-foreground/70">
                        xyz@gmail.com
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator
                  className={cn(resolvedTheme === 'dark' ? 'bg-border/40' : 'bg-border/20')}
                />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className={cn(
                      'hover:!bg-bg-accent/50',
                      resolvedTheme === 'dark'
                        ? 'hover:!text-foreground'
                        : 'hover:!text-foreground/90',
                    )}
                  >
                    <Sparkles
                      className={cn(
                        'mr-2 size-4',
                        resolvedTheme === 'dark'
                          ? 'text-muted-foreground/70'
                          : 'text-muted-foreground/80',
                      )}
                    />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator
                  className={cn(resolvedTheme === 'dark' ? 'bg-border/40' : 'bg-border/20')}
                />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className={cn(
                      'hover:!bg-bg-accent/50',
                      resolvedTheme === 'dark'
                        ? 'hover:!text-foreground'
                        : 'hover:!text-foreground/90',
                    )}
                  >
                    <BadgeCheck
                      className={cn(
                        'mr-2 size-4',
                        resolvedTheme === 'dark'
                          ? 'text-muted-foreground/70'
                          : 'text-muted-foreground/80',
                      )}
                    />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      'hover:!bg-bg-accent/50',
                      resolvedTheme === 'dark'
                        ? 'hover:!text-foreground'
                        : 'hover:!text-foreground/90',
                    )}
                  >
                    <CreditCard
                      className={cn(
                        'mr-2 size-4',
                        resolvedTheme === 'dark'
                          ? 'text-muted-foreground/70'
                          : 'text-muted-foreground/80',
                      )}
                    />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      'hover:!bg-bg-accent/50',
                      resolvedTheme === 'dark'
                        ? 'hover:!text-foreground'
                        : 'hover:!text-foreground/90',
                    )}
                  >
                    <Bell
                      className={cn(
                        'mr-2 size-4',
                        resolvedTheme === 'dark'
                          ? 'text-muted-foreground/70'
                          : 'text-muted-foreground/80',
                      )}
                    />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={cn(
                    'text-destructive hover:!bg-destructive hover:!text-destructive-foreground',
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
