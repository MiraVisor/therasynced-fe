'use client';

import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangePassword } from '@/hooks/queries/useProfile';

export function PasswordSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: changePasswordMutation, isPending: isChangingPassword } = useChangePassword();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(
      (prev: { currentPassword: string; newPassword: string; confirmPassword: string }) => ({
        ...prev,
        [field]: value,
      }),
    );
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

    changePasswordMutation(
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          // Toast is already shown in the hook
        },
      },
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-6">Password Management</h3>

      <div className="space-y-4">
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
              className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal pr-10"
              disabled={isLoading || isChangingPassword}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal pr-10"
                disabled={isLoading || isChangingPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal pr-10"
                disabled={isLoading || isChangingPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <Button
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 w-full sm:w-auto text-sm font-inter font-medium"
          onClick={handlePasswordUpdate}
          disabled={isLoading || isChangingPassword}
          isLoading={isChangingPassword}
        >
          {isChangingPassword ? 'Updating...' : 'Update Password'}
          <Lock className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
