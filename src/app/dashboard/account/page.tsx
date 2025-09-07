'use client';

import {
  ArrowRight,
  BadgeCheck,
  Bell,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mail,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DatePicker } from '@/components/common/input/DatePicker';
import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { changeEmail, changePassword, getProfile, updateProfile } from '@/redux/api/profileApi';
import { useAuth } from '@/redux/hooks/useAppHooks';

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  gender: string;
  dob: string;
  city: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  role?: string;
}

export default function AccountPage() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { role, logout } = useAuth();

  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    city: '',
    gender: '',
    dob: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [, setProfileUpdated] = useState(false);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsProfileLoading(true);
      console.log('Loading user profile...'); // Debug log

      const response = await getProfile();
      console.log('Profile API Response:', response); // Debug log

      // Handle the actual API response structure
      let userData: any;
      if (response && response.success && response.data && response.data.user) {
        // Actual API structure: { success: true, data: { user: { ... } } }
        userData = response.data.user;
      } else {
        console.error('Unexpected API response structure:', response);
        toast.error('Invalid profile data received from server');
        return;
      }

      console.log('Extracted User Data:', userData); // Debug log

      // Validate that we have the minimum required data
      if (!userData || !userData.id) {
        console.error('Missing required user data:', userData);
        toast.error('Profile data is incomplete');
        return;
      }

      // Format the DOB from ISO string to YYYY-MM-DD for the date input
      let formattedDob = '';
      if (userData.dob) {
        try {
          const date = new Date(userData.dob);
          if (!isNaN(date.getTime())) {
            formattedDob = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
          }
        } catch (error) {
          console.error('Error formatting DOB:', error);
        }
      }

      const newFormData = {
        id: userData.id,
        name: userData.name || '',
        email: userData.email || '',
        profilePicture: userData.profilePicture,
        gender: userData.gender || '',
        dob: formattedDob,
        city: userData.city || '',
        isEmailVerified: userData.isEmailVerified || false,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        role: userData.role || '',
      };

      console.log('Setting Form Data:', newFormData); // Debug log
      setFormData(newFormData);
      setProfileLoaded(true);
    } catch (error: any) {
      console.error('Failed to load user profile:', error);

      // More specific error messages
      if (error?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error?.status === 404) {
        toast.error('Profile not found. Please contact support.');
      } else if (error?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error?.message || 'Failed to load user profile');
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: UserProfile) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(
      (prev: { currentPassword: string; newPassword: string; confirmPassword: string }) => ({
        ...prev,
        [field]: value,
      }),
    );
  };

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);

      // Basic validation
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }

      if (!formData.city || !formData.city.trim()) {
        toast.error('City is required');
        return;
      }

      if (!formData.gender) {
        toast.error('Please select your gender');
        return;
      }

      // Validate and format the DOB before sending to API
      let dobToSend = formData.dob;
      if (formData.dob) {
        try {
          const date = new Date(formData.dob);
          if (!isNaN(date.getTime())) {
            // Convert YYYY-MM-DD back to ISO string for API
            dobToSend = date.toISOString();
          } else {
            toast.error('Invalid date format for Date of Birth');
            return;
          }
        } catch (error) {
          toast.error('Invalid date format for Date of Birth');
          return;
        }
      }

      const response = await updateProfile({
        name: formData.name.trim(),
        city: formData.city.trim(),
        gender: formData.gender,
        dob: dobToSend,
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        setProfileUpdated(true);
        await loadUserProfile(); // Reload the profile to get updated data
        // Show success state briefly
        setProfileLoaded(true);

        // Reset success state after 3 seconds
        setTimeout(() => setProfileUpdated(false), 3000);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        toast.success('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.message || 'Failed to update password');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (newEmail: string) => {
    try {
      setIsLoading(true);
      const response = await changeEmail({
        newEmail,
      });

      if (response.success) {
        toast.success('Email change initiated. Please check your new email for verification.');
        await loadUserProfile();
      } else {
        toast.error(response.message || 'Failed to initiate email change');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to initiate email change');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (faqId: string) => {
    setExpandedFaqs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const handleSignOut = () => {
    setShowSignOutModal(false);
    logout();
  };

  // Show billing only for freelancers and admins
  const showBilling = role === 'FREELANCER' || role === 'ADMIN';

  const navigationTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(showBilling ? [{ id: 'billing', label: 'Billing', icon: CreditCard }] : []),
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const renderProfileSection = () => (
    <div className="space-y-8">
      {/* Profile Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              disabled={isProfileLoading || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-11 border-gray-300 bg-gray-50 cursor-not-allowed"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              User Role
            </Label>
            <Input
              id="role"
              placeholder="User role"
              value={formData.role || ''}
              className="h-11 border-gray-300 bg-gray-50 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500">Role cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">
              City
            </Label>

            <div className="h-11">
              <LocationDropdown
                value={formData.city || ''}
                onValueChange={(value: string) => handleInputChange('city', value)}
                placeholder="Select your city"
                searchPlaceholder="Search locations..."
                emptyMessage="No location found."
                className="h-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Gender
            </Label>
            <Select
              value={formData.gender || ''}
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-medium text-gray-700">
              Date of Birth
            </Label>

            <div className="h-11">
              <DatePicker
                title=""
                value={formData.dob ? new Date(formData.dob) : undefined}
                onChange={(date) =>
                  handleInputChange('dob', date ? date.toISOString().split('T')[0] : '')
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white h-11 px-6 w-full sm:w-auto"
            onClick={handleProfileUpdate}
            disabled={isLoading || isProfileLoading}
          >
            {isLoading ? (
              <>Saving...</>
            ) : (
              <>
                Save Changes
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div className="space-y-8">
      {/* Account Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Account Status</span>
            </div>
            <Badge
              className={
                formData.isActive
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }
            >
              {formData.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Email Verification</span>
            </div>
            <Badge
              className={
                formData.isEmailVerified
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              }
            >
              {formData.isEmailVerified ? 'Verified' : 'Not Verified'}
            </Badge>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex items-center gap-3 mb-2">
              <BadgeCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">User Role</span>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              {role || 'Unknown'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Email Management */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Management</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail" className="text-sm font-medium text-gray-700">
              New Email Address
            </Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="Enter new email address"
              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white h-11 px-6"
            onClick={() => {
              const newEmail = (document.getElementById('newEmail') as HTMLInputElement)?.value;
              if (newEmail) {
                handleEmailChange(newEmail);
              } else {
                toast.error('Please enter a new email address');
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Change Email'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Password Management</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white h-11 px-6 w-full sm:w-auto"
            onClick={handlePasswordUpdate}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
            <Lock className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
          <p className="text-sm text-red-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => toast.info('Account deletion coming soon')}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Types</h3>

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

  const renderBillingSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Plan:</span>
                <span className="font-medium text-gray-900">Free</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Next billing:</span>
                <span className="text-sm text-gray-900">Never</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-600 mb-4">No payment method added</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Payment method functionality coming soon')}
                className="border-gray-300 hover:bg-gray-50"
              >
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing History</h3>
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-base">No billing history available</p>
          <p className="text-gray-400 text-sm mt-1">Your billing history will appear here</p>
        </div>
      </div>
    </div>
  );

  const renderHelpSection = () => (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Help & Support</h3>

        <div className="space-y-6">
          {/* Contact Admin Button */}
          <div className="text-center py-8">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Need Help?</h4>
            <p className="text-gray-600 mb-6">Contact our admin team for personalized assistance</p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white h-12 px-8"
              onClick={() => toast.info('Contact admin functionality coming soon')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Admin
            </Button>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h4>

            {[
              {
                id: 'faq1',
                question: 'How do I update my profile information?',
                answer:
                  'You can update your profile information in the Profile tab. Simply edit the fields and click "Save Changes" to apply your updates.',
              },
              {
                id: 'faq2',
                question: 'How do I change my password?',
                answer:
                  'Go to the Account tab and use the Password Management section. Enter your current password, then your new password twice to confirm.',
              },
              {
                id: 'faq3',
                question: 'How do I manage my notification preferences?',
                answer:
                  'Navigate to the Notifications tab to configure your email, push, and SMS notification settings according to your preferences.',
              },
              {
                id: 'faq4',
                question: 'What should I do if I forgot my password?',
                answer:
                  'If you forgot your password, you can reset it through the login page. Click on "Forgot Password" and follow the instructions sent to your email.',
              },
            ].map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaqs.has(faq.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFaqs.has(faq.id) && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!profileLoaded) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if profile failed to load
  if (!formData.id) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600 text-lg">Manage your account settings and preferences</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Profile</h3>
          <p className="text-red-600 mb-6">
            We couldn&apos;t load your profile information. Please try again.
          </p>
          <Button onClick={loadUserProfile} className="bg-red-600 hover:bg-red-700 text-white">
            Retry Loading Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
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
      <div className="bg-gray-50 rounded-xl p-8">
        {activeSection === 'profile' && renderProfileSection()}
        {activeSection === 'account' && renderAccountSection()}
        {activeSection === 'notifications' && renderNotificationsSection()}
        {activeSection === 'billing' && showBilling && renderBillingSection()}
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
