'use client';

import { format } from 'date-fns';
import { ArrowRight, Camera, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { LocationDropdown } from '@/components/common/input/LocationDropdown';
import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfileSectionSkeleton } from '@/components/ui/skeletons/ProfileSectionSkeleton';
import { Textarea } from '@/components/ui/textarea';
import { useJobTitles } from '@/hooks/queries/useJobTitles';
import { useProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/queries/useProfile';
import { useAuth } from '@/hooks/useAuthZustand';
import { cn } from '@/lib/utils';
import { JobTitle, ROLES } from '@/types/types';

import { RatingVisibilityToggle } from './RatingVisibilityToggle';

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  gender: string;
  dob: string;
  county: string;
  cityTown: string;
  description?: string; // Bio/description field
  isEmailVerified?: boolean;
  isActive?: boolean;
  role?: string;
  mainJobTitle?: JobTitle;
  mainJobTitleId?: string;
  clinicAddress?: string;
  homeAddress?: string; // Home address for bookings
}

export function ProfileSection() {
  const { role } = useAuth();
  const [isPersonalInfoLoading, setIsPersonalInfoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: profileData, isLoading: loading, isFetching: initialLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: uploadProfilePicture, isPending: isUploadingPicture } = useUploadProfilePicture();
  const { data: jobTitles = [], isLoading: isLoadingJobTitles } = useJobTitles();

  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    county: '',
    cityTown: '',
    gender: '',
    dob: '',
    description: '',
    mainJobTitle: undefined,
    mainJobTitleId: undefined,
    clinicAddress: '',
    homeAddress: '',
  });

  useEffect(() => {
    if (profileData) {
      // Normalize date of birth to YYYY-MM-DD format
      let normalizedDob = '';
      if (profileData.dob) {
        try {
          const date = new Date(profileData.dob);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            normalizedDob = `${year}-${month}-${day}`;
          } else {
            // If it's already in YYYY-MM-DD format, use it as is
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(profileData.dob)) {
              normalizedDob = profileData.dob;
            }
          }
        } catch (error) {
          // If parsing fails, try to use the original value if it matches YYYY-MM-DD
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(profileData.dob)) {
            normalizedDob = profileData.dob;
          }
        }
      }

      setFormData({
        id: profileData.id,
        name: profileData.name || '',
        email: profileData.email || '',
        profilePicture: profileData.profilePicture || undefined, // Ensure it's undefined if empty, not empty string
        gender: profileData.gender || '',
        dob: normalizedDob,
        county: profileData.county || '',
        cityTown: profileData.cityTown || '',
        description: profileData.description || '',
        isEmailVerified: profileData.isEmailVerified,
        isActive: true,
        role: profileData.role || '',
        mainJobTitleId: profileData.mainJobTitle?.id,
        mainJobTitle: profileData.mainJobTitle,
        clinicAddress: profileData.clinicAddress || '',
        homeAddress: profileData.homeAddress || '',
      });

      // Debug: Log profile picture URL
      if (process.env.NODE_ENV === 'development') {
        console.log('[ProfileSection] Profile picture URL:', profileData.profilePicture);
        console.log('[ProfileSection] Profile data:', {
          hasProfilePicture: !!profileData.profilePicture,
          profilePictureLength: profileData.profilePicture?.length || 0,
        });
      }

      // Reset preview when profile data changes
      setPreviewUrl(null);
    }
  }, [profileData]);

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

  const handlePersonalInfoUpdate = async () => {
    try {
      setIsPersonalInfoLoading(true);

      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }

      let dobToSend = formData.dob;
      if (formData.dob) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(formData.dob)) {
          toast.error('Invalid date format for Date of Birth. Please use YYYY-MM-DD format');
          return;
        }

        const dateParts = formData.dob.split('-');
        const year = parseInt(dateParts[0] || '0');
        const month = parseInt(dateParts[1] || '1') - 1;
        const day = parseInt(dateParts[2] || '1');
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

        dobToSend = formData.dob;
      }

      const updateData: {
        name: string;
        county?: string;
        cityTown?: string;
        gender?: string;
        dob?: string;
        description?: string;
        homeAddress?: string;
      } = {
        name: formData.name.trim(),
      };

      if (formData.county?.trim()) {
        updateData.county = formData.county.trim();
      }
      if (formData.cityTown?.trim()) {
        updateData.cityTown = formData.cityTown.trim();
      }
      if (formData.gender) {
        updateData.gender = formData.gender;
      }
      if (formData.dob) {
        updateData.dob = dobToSend;
      }
      if (formData.description?.trim()) {
        updateData.description = formData.description.trim();
      }
      // Always include homeAddress (even if empty) so backend can clear it if needed
      updateData.homeAddress = formData.homeAddress?.trim() || '';

      updateProfile(updateData, {
        onSuccess: () => {
          // Toast is already shown in the hook
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsPersonalInfoLoading(false);
    }
  };

  const handleProfessionalInfoUpdate = () => {
    const updateData: {
      mainJobTitleId?: string | null;
      clinicAddress?: string;
    } = {};

    // Handle job title: send ID if selected, null if cleared
    if (formData.mainJobTitle) {
      updateData.mainJobTitleId = formData.mainJobTitle.id;
    } else if (formData.mainJobTitleId !== undefined) {
      // If it was previously set but now cleared, send null
      updateData.mainJobTitleId = null;
    }

    // Always include clinicAddress (even if empty) so backend can clear it if needed
    updateData.clinicAddress = formData.clinicAddress?.trim() || '';

    updateProfile(updateData, {
      onSuccess: () => {
        // Toast is already shown in the hook
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WEBP image.');
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 2MB.');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPicture = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select an image file.');
      return;
    }

    uploadProfilePicture(file, {
      onSuccess: (response) => {
        // Immediately update the profile picture URL from the response
        if (response?.data?.profilePicture) {
          setFormData((prev) => ({
            ...prev,
            profilePicture: response.data.profilePicture,
          }));
        }
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const handleRemovePreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if ((initialLoading || loading) && !profileData) {
    return <ProfileSectionSkeleton showProfessionalSection={role === ROLES.FREELANCER} />;
  }

  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-poppins font-semibold text-gray-900">Personal Information</h3>
        </div>

        {/* Profile Picture Upload Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Profile Picture</Label>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-gray-300">
                <ProfileAvatarImage
                  src={
                    previewUrl ||
                    (formData.profilePicture?.trim() ? formData.profilePicture : undefined)
                  }
                  alt={formData.name || 'Profile'}
                  isCurrentUser={true}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-poppins font-bold">
                  {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {isUploadingPicture && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploadingPicture}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPicture}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {previewUrl ? 'Change Picture' : 'Upload Picture'}
                </Button>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePreview}
                    disabled={isUploadingPicture}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
              {previewUrl && (
                <Button
                  type="button"
                  onClick={handleUploadPicture}
                  disabled={isUploadingPicture}
                  className="bg-primary hover:bg-primary/90 text-white"
                  isLoading={isUploadingPicture}
                >
                  {isUploadingPicture ? 'Uploading...' : 'Save Picture'}
                </Button>
              )}
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, WEBP. Max size: 2MB
              </p>
            </div>
          </div>
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
              className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal"
              disabled={((initialLoading || loading) && !profileData) || isPersonalInfoLoading}
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
              className="h-11 text-sm font-inter border-gray-300 bg-gray-50 cursor-not-allowed text-charcoal">
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
                  ? 'Client'
                  : formData.role === ROLES.FREELANCER
                    ? 'Freelancer'
                    : formData.role === ROLES.ADMIN
                      ? 'Admin'
                      : 'Unknown'
              }
              className="h-11 text-sm font-inter border-gray-300 bg-gray-50 cursor-not-allowed text-charcoal">
              disabled
            />
            <p className="text-xs text-gray-500">Role cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="county" className="text-sm font-medium text-gray-700">
              County
            </Label>
            <div className="h-11">
              <LocationDropdown
                value={
                  formData.county && formData.county.trim() !== ''
                    ? formData.county
                    : 'Select your county'
                }
                onValueChange={(value: string) => handleInputChange('county', value)}
                placeholder="Select your county"
                searchPlaceholder="Search counties..."
                emptyMessage="No county found."
                className="h-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityTown" className="text-sm font-medium text-gray-700">
              City/Town
            </Label>
            <Input
              id="cityTown"
              placeholder="Enter your city or town"
              value={formData.cityTown || ''}
              onChange={(e) => handleInputChange('cityTown', e.target.value)}
              className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal"
              disabled={((initialLoading || loading) && !profileData) || isPersonalInfoLoading}
            />
          </div>

          {/* Home Address - Only for patients */}
          {role === ROLES.PATIENT && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="homeAddress" className="text-sm font-medium text-gray-700">
                Home Address
              </Label>
              <Input
                id="homeAddress"
                placeholder="Enter your home address for bookings"
                value={formData.homeAddress || ''}
                onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal"
                disabled={((initialLoading || loading) && !profileData) || isPersonalInfoLoading}
              />
              <p className="text-xs text-gray-500">
                This address will be used for home visit bookings. You can leave it empty and
                provide it when booking.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Gender
            </Label>
            <Select
              value={formData.gender ?? undefined}
              onValueChange={(value) => handleInputChange('gender', value)}
              disabled={((initialLoading || loading) && !profileData) || isPersonalInfoLoading}
            >
              <SelectTrigger className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal data-[placeholder]:text-gray-500">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male" className="text-sm font-inter">
                  Male
                </SelectItem>
                <SelectItem value="female" className="text-sm font-inter">
                  Female
                </SelectItem>
                <SelectItem value="other" className="text-sm font-inter">
                  Other
                </SelectItem>
                <SelectItem value="prefer_not_to_say" className="text-sm font-inter">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (Bio)
            </Label>
            <Textarea
              id="description"
              placeholder="Tell us about yourself..."
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[100px] text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal resize-none"
              disabled={((initialLoading || loading) && !profileData) || isPersonalInfoLoading}
            />
            <p className="text-xs text-gray-500">
              Optional: Add a brief description about yourself
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-medium text-gray-700">
              Date of Birth
              <span className="text-xs font-normal text-gray-500 ml-1">(Must be 18+)</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={((initialLoading || loading) && !profileData) || isPersonalInfoLoading}
                  className={cn(
                    'w-full h-11 justify-start text-left font-normal text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors',
                    !formData.dob && 'text-gray-500',
                    formData.dob && 'text-charcoal',
                  )}
                >
                  {formData.dob ? (
                    format(new Date(formData.dob), 'PPP')
                  ) : (
                    <span>Select your date of birth</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dob ? new Date(formData.dob) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const today = new Date();
                      const minAge = new Date(
                        today.getFullYear() - 18,
                        today.getMonth(),
                        today.getDate(),
                      );
                      if (date > minAge) {
                        toast.error('You must be at least 18 years old');
                        return;
                      }
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      handleInputChange('dob', `${year}-${month}-${day}`);
                    } else {
                      handleInputChange('dob', '');
                    }
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    const minAge = new Date(
                      today.getFullYear() - 18,
                      today.getMonth(),
                      today.getDate(),
                    );
                    return date > minAge || date > today;
                  }}
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear() - 18}
                  defaultMonth={
                    new Date(
                      new Date().getFullYear() - 18,
                      new Date().getMonth(),
                      new Date().getDate(),
                    )
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              You must be at least 18 years old to use this service
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto text-sm font-inter font-medium"
            onClick={handlePersonalInfoUpdate}
            disabled={
              isPersonalInfoLoading ||
              isUpdatingProfile ||
              ((initialLoading || loading) && !profileData)
            }
            isLoading={isPersonalInfoLoading || isUpdatingProfile}
          >
            {isPersonalInfoLoading || isUpdatingProfile ? (
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
            <h3 className="text-lg font-poppins font-semibold text-gray-900">
              Professional Information
            </h3>
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
              Freelancer
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
                Job Title
              </Label>
              <Select
                value={formData.mainJobTitle?.id ?? undefined}
                onValueChange={(value) => {
                  if (value === 'clear') {
                    // Clear selection
                    setFormData((prev) => ({
                      ...prev,
                      mainJobTitle: undefined,
                      mainJobTitleId: undefined,
                    }));
                  } else {
                    const selectedJobTitle = jobTitles.find((jt) => jt.id === value);
                    if (selectedJobTitle) {
                      handleJobTitleChange(selectedJobTitle);
                    }
                  }
                }}
                disabled={((initialLoading || loading) && !profileData) || isLoadingJobTitles}
              >
                <SelectTrigger className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal data-[placeholder]:text-gray-500">
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
                    <>
                      {formData.mainJobTitle && (
                        <SelectItem value="clear" className="text-sm font-inter text-gray-500">
                          Clear selection
                        </SelectItem>
                      )}
                      {jobTitles.map((jobTitle) => (
                        <SelectItem
                          key={jobTitle.id}
                          value={jobTitle.id}
                          className="text-sm font-inter"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium font-inter">{jobTitle.name}</span>
                            {jobTitle.description && (
                              <span className="text-xs text-gray-500 font-inter">
                                - {jobTitle.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <RatingVisibilityToggle />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicAddress" className="text-sm font-medium text-gray-700">
                Clinic Address
              </Label>
              <Input
                id="clinicAddress"
                placeholder="Enter your clinic or practice address"
                value={formData.clinicAddress || ''}
                onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal"
                disabled={(initialLoading || loading) && !profileData}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto text-sm font-inter font-medium"
              onClick={handleProfessionalInfoUpdate}
              disabled={isUpdatingProfile || ((initialLoading || loading) && !profileData)}
              isLoading={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
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
}
