'use client';

import {
  ArrowRight,
  Award,
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
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { DatePicker } from '@/components/common/input/DatePicker';
import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import SubscriptionManagement from '@/components/core/Dashboard/FreelancerSide/Subscription/SubscriptionManagement';
import LoyaltyManagement from '@/components/core/Dashboard/UserSide/Loyalty/LoyaltyManagement';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccountSectionSkeleton } from '@/components/ui/skeletons/AccountSectionSkeleton';
import { HelpSectionSkeleton } from '@/components/ui/skeletons/HelpSectionSkeleton';
import { ProfileSectionSkeleton } from '@/components/ui/skeletons/ProfileSectionSkeleton';
import { getActiveJobTitles } from '@/redux/api/jobTitleApi';
import { changeEmail, changePassword, getProfile, updateProfile } from '@/redux/api/profileApi';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { JobTitle, ROLES } from '@/types/types';

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
  // Professional information for freelancers
  mainJobTitle?: JobTitle;
  mainJobTitleId?: string; // Add this to store the ID from API
  clinicAddress?: string;
}

export default function AccountPage() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [isLoadingJobTitles, setIsLoadingJobTitles] = useState(false);
  const { role, logout } = useAuth();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    city: '',
    gender: '',
    dob: '',
    mainJobTitle: undefined,
    mainJobTitleId: undefined,
    clinicAddress: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [, setProfileUpdated] = useState(false);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      await loadJobTitles();
      await loadUserProfile();
    };
    loadData();
  }, []);

  // Update job title when job titles are loaded and we have a mainJobTitleId
  useEffect(() => {
    if (jobTitles.length > 0 && formData.mainJobTitleId && !formData.mainJobTitle) {
      const jobTitle = jobTitles.find((jt) => jt.id === formData.mainJobTitleId);
      if (jobTitle) {
        setFormData((prev) => ({
          ...prev,
          mainJobTitle: jobTitle,
        }));
      }
    }
  }, [jobTitles, formData.mainJobTitleId, formData.mainJobTitle]);

  const loadJobTitles = async () => {
    try {
      setIsLoadingJobTitles(true);
      const response = await dispatch(getActiveJobTitles() as any);

      if (response.payload && Array.isArray(response.payload) && response.payload.length > 0) {
        setJobTitles(response.payload);
      } else {
        setJobTitles([]);
      }
    } catch (error) {
      // Don't show error toast for job titles as it's not critical
      setJobTitles([]);
    } finally {
      setIsLoadingJobTitles(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setIsProfileLoading(true);

      const response = await getProfile();

      // Handle the actual API response structure
      let userData: any;
      if (response && response.success && response.data && response.data.user) {
        // Actual API structure: { success: true, data: { user: { ... } } }
        userData = response.data.user;
      } else {
        toast.error('Invalid profile data received from server');
        setIsProfileLoading(false);
        return;
      }

      // Validate that we have the minimum required data
      if (!userData || !userData.id) {
        toast.error('Profile data is incomplete');
        setIsProfileLoading(false);
        return;
      }

      // Handle DOB without timezone conversion
      let formattedDob = '';
      if (userData.dob) {
        // If DOB is already in YYYY-MM-DD format, use it directly
        if (/^\d{4}-\d{2}-\d{2}$/.test(userData.dob)) {
          formattedDob = userData.dob;
        } else {
          // If it's an ISO string, extract just the date part
          try {
            const date = new Date(userData.dob);
            if (!isNaN(date.getTime())) {
              // Extract YYYY-MM-DD from ISO string without timezone conversion
              const isoString = date.toISOString();
              formattedDob = isoString.split('T')[0];
            }
          } catch (error) {}
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
        // Professional information
        mainJobTitleId: userData.mainJobTitleId, // Store the ID from API
        mainJobTitle: userData.mainJobTitleId
          ? jobTitles.find((jt) => jt.id === userData.mainJobTitleId)
          : undefined,
        clinicAddress: userData.clinicAddress || '',
      };

      setFormData(newFormData);
    } catch (error: any) {
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

  const handleJobTitleChange = (jobTitle: JobTitle) => {
    setFormData((prev: UserProfile) => ({
      ...prev,
      mainJobTitle: jobTitle,
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

      // Validate DOB format without timezone conversion
      let dobToSend = formData.dob;
      if (formData.dob) {
        // Validate YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(formData.dob)) {
          toast.error('Invalid date format for Date of Birth. Please use YYYY-MM-DD format');
          return;
        }

        // Validate the date is actually valid
        const dateParts = formData.dob.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2]);
        const testDate = new Date(year, month, day);

        if (
          isNaN(testDate.getTime()) ||
          testDate.getFullYear() !== year ||
          testDate.getMonth() !== month ||
          testDate.getDate() !== day
        ) {
          toast.error('Invalid date for Date of Birth');
          return;
        }

        // Send as YYYY-MM-DD format without timezone conversion
        dobToSend = formData.dob;
      }

      const response = await updateProfile({
        name: formData.name.trim(),
        ...(formData.city && { city: formData.city.trim() }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.dob && { dob: dobToSend }),
        ...(formData.mainJobTitle && { mainJobTitleId: formData.mainJobTitle.id }),
        ...(formData.clinicAddress && { clinicAddress: formData.clinicAddress }),
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        setProfileUpdated(true);
        await loadUserProfile();

        setTimeout(() => setProfileUpdated(false), 3000);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
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
    window.location.href = '/authentication/sign-in';
  };

  // Show billing only for freelancers and admins
  const showBilling = role === 'FREELANCER' || role === 'ADMIN';
  // Show loyalty for users and freelancers
  const showLoyalty = role === 'PATIENT' || role === 'FREELANCER';

  const navigationTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(showBilling ? [{ id: 'subscription', label: 'Subscription', icon: CreditCard }] : []),
    ...(showLoyalty ? [{ id: 'loyalty', label: 'Loyalty', icon: Award }] : []),
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const renderProfileSection = () => {
    if (isProfileLoading) {
      return <ProfileSectionSkeleton showProfessionalSection={role === ROLES.FREELANCER} />;
    }

    return (
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
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-colors"
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
                className="h-11 border-gray-300 bg-gray-50 cursor-not-allowed transition-colors"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role
              </Label>
              <Input
                id="role"
                placeholder="Role"
                value={
                  formData.role === ROLES.PATIENT
                    ? 'User'
                    : formData.role === ROLES.FREELANCER
                      ? 'Freelancer'
                      : formData.role === ROLES.ADMIN
                        ? 'Admin'
                        : 'Unknown'
                }
                className="h-11 border-gray-300 bg-gray-50 cursor-not-allowed transition-colors"
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
                  value={
                    formData.city && formData.city.trim() !== ''
                      ? formData.city
                      : 'Select your city'
                  }
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
                <SelectTrigger className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-colors">
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
                    handleInputChange(
                      'dob',
                      date
                        ? (() => {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })()
                        : '',
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto"
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

        {/* Professional Information Section - Only for Freelancers */}
        {role === ROLES.FREELANCER && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                Freelancer
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
                  Job Title
                </Label>
                <Select
                  value={formData.mainJobTitle?.id || ''}
                  onValueChange={(value) => {
                    const selectedJobTitle = jobTitles.find((jt) => jt.id === value);
                    if (selectedJobTitle) {
                      handleJobTitleChange(selectedJobTitle);
                    }
                  }}
                  disabled={isProfileLoading || isLoading || isLoadingJobTitles}
                >
                  <SelectTrigger className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-colors">
                    <SelectValue
                      placeholder={
                        isLoadingJobTitles
                          ? 'Loading job titles...'
                          : jobTitles.length === 0
                            ? 'No job titles available'
                            : 'Select your job title'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                        No job titles available
                      </div>
                    ) : (
                      jobTitles.map((jobTitle) => (
                        <SelectItem key={jobTitle.id} value={jobTitle.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{jobTitle.name}</span>
                            {jobTitle.description && (
                              <span className="text-xs text-gray-500">
                                - {jobTitle.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Clinic Address */}
              <div className="space-y-2">
                <Label htmlFor="clinicAddress" className="text-sm font-medium text-gray-700">
                  Clinic Address
                </Label>
                <Input
                  id="clinicAddress"
                  placeholder="Enter your clinic or practice address"
                  value={formData.clinicAddress || ''}
                  onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-colors"
                  disabled={isProfileLoading || isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto"
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
        )}
      </div>
    );
  };

  const renderAccountSection = () => {
    if (isProfileLoading) {
      return <AccountSectionSkeleton />;
    }

    return (
      <div className="space-y-8">
        {/* Account Status */}
        {/* <div className="bg-white border border-gray-200 rounded-xl p-6">
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
                <span className="text-sm font-medium text-gray-700">Role</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {role?.toUpperCase() === 'PATIENT'
                  ? 'User'
                  : role?.toString() === ROLES.FREELANCER
                    ? 'Freelancer'
                    : role?.toString() === ROLES.ADMIN
                      ? 'Admin'
                      : 'Unknown'}
              </Badge>
            </div>
          </div>
        </div> */}

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
                autoComplete="off"
                defaultValue=""
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-colors"
              />
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6"
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
                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-colors pr-10"
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
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-colors"
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
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-colors"
              />
            </div>

            <Button
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto"
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

  const renderHelpSection = () => {
    if (isProfileLoading) {
      return <HelpSectionSkeleton />;
    }

    return (
      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Help & Support</h3>

          <div className="space-y-6">
            {/* Contact Admin Button */}
            <div className="text-center py-8">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Need Help?</h4>
              <p className="text-gray-600 mb-6">
                Contact our admin team for personalized assistance
              </p>
              <Button
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-12 px-8"
                onClick={() => toast.info('Contact admin functionality coming soon')}
              >
                Contact Admin
                <Mail className="h-4 w-4 ml-2" />
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
  };

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
      <div className="bg-gray-50 rounded-xl">
        {activeSection === 'profile' && renderProfileSection()}
        {activeSection === 'account' && renderAccountSection()}
        {activeSection === 'notifications' && renderNotificationsSection()}
        {activeSection === 'subscription' && showBilling && <SubscriptionManagement />}
        {activeSection === 'loyalty' && showLoyalty && <LoyaltyManagement />}
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
