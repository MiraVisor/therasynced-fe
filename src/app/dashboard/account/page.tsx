'use client';

import {
  Award,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataAccessLogsSection } from '@/components/core/Dashboard/Account/DataAccessLogsSection';
import { DataRightsSection } from '@/components/core/Dashboard/Account/DataRightsSection';
import { EmailSection } from '@/components/core/Dashboard/Account/EmailSection';
import { HelpSection } from '@/components/core/Dashboard/Account/HelpSection';
import { PasswordSection } from '@/components/core/Dashboard/Account/PasswordSection';
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

export default function AccountPage() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSubscriptionLoading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { role, logout } = useAuth();

  // Use React Query hooks
  const { data: profileData, isLoading: loading, isFetching: initialLoading } = useProfile();

  useEffect(() => {
    const section = searchParams.get('section') || searchParams.get('tab');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const handleSignOut = () => {
    setShowSignOutModal(false);
    logout();
    window.location.href = '/authentication/sign-in';
  };

  // Show billing only for freelancers and admins
  const showBilling = role === ROLES.FREELANCER;
  // Show stamps only for patients (users)
  const showStamps = role === 'PATIENT';

  const navigationTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'data-rights', label: 'Data Rights', icon: FileText },
    { id: 'logs', label: 'Data Access Logs', icon: ClipboardList },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(showBilling ? [{ id: 'subscription', label: 'Subscription', icon: CreditCard }] : []),
    ...(showStamps ? [{ id: 'stamps', label: 'Stamps', icon: Award }] : []),
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
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
        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-poppins font-semibold text-red-800 mb-4">Danger Zone</h3>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
            <p className="text-sm text-red-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              className="bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto"
              variant="destructive"
              size="sm"
              onClick={() => toast.info('Account deletion coming soon')}
            >
              Delete Account
              <Trash2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
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
              onClick={() => setActiveSection(tab.id)}
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
        {activeSection === 'data-rights' && <DataRightsSection />}
        {activeSection === 'logs' && <DataAccessLogsSection />}
        {activeSection === 'notifications' && renderNotificationsSection()}
        {activeSection === 'subscription' &&
          showBilling &&
          (isSubscriptionLoading ? <SubscriptionSectionSkeleton /> : <SubscriptionManagement />)}
        {activeSection === 'stamps' && showStamps && <StampsManagement />}
        {activeSection === 'help' && renderHelpSection()}
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
