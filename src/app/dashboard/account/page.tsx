'use client';

import { Award, CreditCard, HelpCircle, Shield, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { EmailSection } from '@/components/core/Dashboard/Account/EmailSection';
import { HelpSection } from '@/components/core/Dashboard/Account/HelpSection';
import { PasswordSection } from '@/components/core/Dashboard/Account/PasswordSection';
import { PrivacyConsentSection } from '@/components/core/Dashboard/Account/PrivacyConsentSection';
import { ProfileSection } from '@/components/core/Dashboard/Account/ProfileSection';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import SubscriptionManagement from '@/components/core/Dashboard/FreelancerSide/Subscription/SubscriptionManagement';
import StampsManagement from '@/components/core/Dashboard/UserSide/Loyalty/StampsManagement';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  AccountSectionSkeleton,
  SubscriptionSectionSkeleton,
} from '@/components/ui/skeletons/AccountSectionSkeleton';
import { useProfile } from '@/hooks/queries/useProfile';
import { useAuth } from '@/hooks/useAuthZustand';
import { ROLES } from '@/types/types';

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSubscriptionLoading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { role, logout } = useAuth();

  // Use React Query hooks
  const { data: profileData, isLoading: loading, isFetching: initialLoading } = useProfile();

  // Determine active section from query params
  useEffect(() => {
    // Check for tab or section query param, or direct param like ?profile
    const tabParam = searchParams.get('tab') || searchParams.get('section');
    const directParam = searchParams.get('profile')
      ? 'profile'
      : searchParams.get('account')
        ? 'account'
        : searchParams.get('subscription')
          ? 'subscription'
          : searchParams.get('stamps')
            ? 'stamps'
            : searchParams.get('help')
              ? 'help'
              : null;

    const section = tabParam || directParam || 'profile';

    if (section && section !== activeSection) {
      setActiveSection(section);
    }

    // Show subscription success toast
    const subscriptionSuccess = searchParams.get('subscription');
    if (subscriptionSuccess === 'success') {
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.pathname + url.search);
      setTimeout(() => {
        toast.success('Subscription activated successfully!');
      }, 100);
    }
  }, [searchParams, activeSection]);

  const handleSignOut = () => {
    setShowSignOutModal(false);
    logout();
    window.location.href = '/authentication/sign-in';
  };

  // Handle tab navigation with URL updates
  const handleTabClick = (sectionId: string) => {
    setActiveSection(sectionId);

    // Build the new URL with query params
    const basePath = '/dashboard/account';
    const params = new URLSearchParams();

    // Use tab=sectionId format
    params.set('tab', sectionId);

    // Preserve subscription view query param if navigating to subscription
    if (sectionId === 'subscription') {
      const currentView = searchParams.get('view');
      if (currentView) {
        params.set('view', currentView);
      }
    }

    // Preserve other query params (like subscription success, upgrade, etc.)
    const subscriptionSuccess = searchParams.get('subscription');
    const upgradeParam = searchParams.get('upgrade');
    if (subscriptionSuccess) {
      params.set('subscription', subscriptionSuccess);
    }
    if (upgradeParam) {
      params.set('upgrade', upgradeParam);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${basePath}?${queryString}` : `${basePath}?tab=${sectionId}`;

    // Navigate to new URL
    router.push(newUrl, { scroll: false });
  };

  // Show billing only for freelancers and admins
  const showBilling = role === ROLES.FREELANCER;
  // Show stamps only for patients (users)
  const showStamps = role === 'PATIENT';

  const navigationTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(showBilling ? [{ id: 'subscription', label: 'Subscription', icon: CreditCard }] : []),
    ...(showStamps ? [{ id: 'stamps', label: 'Stamps', icon: Award }] : []),
    ...(role !== ROLES.ADMIN ? [{ id: 'help', label: 'Help & Support', icon: HelpCircle }] : []),
  ];

  const renderProfileSection = () => <ProfileSection />;

  const renderAccountSection = () => {
    if ((initialLoading || loading) && !profileData) {
      return <AccountSectionSkeleton />;
    }

    return (
      <div className="space-y-8">
        <EmailSection />
        <PasswordSection />
        <PrivacyConsentSection />
      </div>
    );
  };

  const renderNotificationsSection = () => (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-6">
          Notification Types
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
            <span className="text-sm font-medium text-gray-900">Appointment reminders</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Appointment notification settings coming soon')}
              className="border-gray-300 hover:bg-gray-50"
            >
              Configure
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
            <span className="text-sm font-medium text-gray-900">Payment updates</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Payment notification settings coming soon')}
              className="border-gray-300 hover:bg-gray-50"
            >
              Configure
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
            <span className="text-sm font-medium text-gray-900">Marketing emails</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info('Marketing notification settings coming soon')}
              className="text-gray-600 hover:bg-gray-50"
            >
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpSection = () => <HelpSection />;

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="space-y-1">
          <h1 className="text-3xl font-poppins font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 text-lg">Manage your account settings and preferences</p>
        </div>
      }
    >
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
        {navigationTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeSection === tab.id
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        {activeSection === 'profile' && renderProfileSection()}
        {activeSection === 'account' && renderAccountSection()}
        {activeSection === 'notifications' && renderNotificationsSection()}
        {activeSection === 'subscription' &&
          showBilling &&
          (isSubscriptionLoading ? <SubscriptionSectionSkeleton /> : <SubscriptionManagement />)}
        {activeSection === 'stamps' && showStamps && <StampsManagement />}
        {activeSection === 'help' && role !== ROLES.ADMIN && renderHelpSection()}
      </div>

      {/* Sign Out Confirmation Modal */}
      <AlertDialog open={showSignOutModal} onOpenChange={setShowSignOutModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You will need to sign in again to access your
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardPageWrapper>
  );
}

function AccountPageSkeleton() {
  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-1">
          <h1 className="text-3xl font-poppins font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 text-lg">Manage your account settings and preferences</p>
        </div>
      }
    >
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageSkeleton />}>
      <AccountPageContent />
    </Suspense>
  );
}
