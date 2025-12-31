'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangeEmail } from '@/hooks/queries/useProfile';

export function EmailSection() {
  const [isLoading, _setIsLoading] = useState(false);
  const { mutate: changeEmailMutation, isPending: isChangingEmail } = useChangeEmail();

  const handleEmailChange = (newEmail: string) => {
    if (!newEmail?.trim()) {
      toast.error('Please enter a new email address');
      return;
    }

    changeEmailMutation(
      { newEmail },
      {
        onSuccess: () => {
          toast.success('Email change request sent! Please check your email.');
          const emailInput = document.getElementById('newEmail') as HTMLInputElement;
          if (emailInput) {
            emailInput.value = '';
          }
        },
      },
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-6">Email Management</h3>
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
            className="h-11 text-sm font-inter border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors text-charcoal"
            disabled={isLoading || isChangingEmail}
          />
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white h-11 px-6 text-sm font-inter font-medium"
          onClick={() => {
            const newEmail = (document.getElementById('newEmail') as HTMLInputElement)?.value;
            if (newEmail) {
              handleEmailChange(newEmail);
            } else {
              toast.error('Please enter a new email address');
            }
          }}
          disabled={isLoading || isChangingEmail}
        >
          {isChangingEmail ? 'Processing...' : 'Change Email'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
