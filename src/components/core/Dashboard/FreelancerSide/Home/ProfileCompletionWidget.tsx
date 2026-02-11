'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProfile } from '@/hooks/queries/useProfile';
import { useVerificationStatus } from '@/hooks/queries/useVerification';
import { cn } from '@/lib/utils';

interface CompletionItem {
  key: string;
  label: string;
  completed: boolean;
  link?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export const ProfileCompletionWidget = () => {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: verificationStatus } = useVerificationStatus();

  const completionItems: CompletionItem[] = [
    {
      key: 'basicInfo',
      label: 'Complete your basic information',
      completed: !!(profile?.name && profile?.email && profile?.city),
      link: '/dashboard/account?tab=profile',
    },
    {
      key: 'profilePhoto',
      label: 'Add a profile photo',
      completed: !!profile?.profilePicture,
      link: '/dashboard/account?tab=profile',
    },
    {
      key: 'mainJobTitle',
      label: 'Select your job title',
      completed: !!profile?.mainJobTitleId,
      link: '/dashboard/account?tab=profile',
    },
    {
      key: 'clinicAddress',
      label: 'Add your clinic address',
      completed: !!profile?.clinicAddress,
      link: '/dashboard/account?tab=profile',
    },
    {
      key: 'verificationDocuments',
      label: 'Submit verification documents',
      completed: verificationStatus?.verificationStatus === 'APPROVED',
      status:
        verificationStatus?.verificationStatus === 'APPROVED'
          ? 'approved'
          : verificationStatus?.verificationStatus === 'REJECTED'
            ? 'rejected'
            : 'pending',
      link: '/dashboard/verification',
    },
  ];

  const completedCount = completionItems.filter((item) => item.completed).length;
  const totalCount = completionItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const isComplete = completionPercentage === 100;

  // Don't show if profile is complete
  if (isComplete) {
    return null;
  }

  const incompleteItems = completionItems.filter((item) => !item.completed);
  const nextItem = incompleteItems[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="font-inter">
              {completedCount} of {totalCount} items completed
            </CardDescription>
          </div>
          <span className="text-2xl font-poppins font-bold text-primary">
            {completionPercentage}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <Progress value={completionPercentage} className="h-2 mb-6" />

        {/* Checklist */}
        <div className="space-y-3">
          {completionItems.map((item) => (
            <div
              key={item.key}
              className={cn(
                'flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors',
                !item.completed && 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer',
              )}
              onClick={() => {
                if (!item.completed && item.link) {
                  router.push(item.link);
                }
              }}
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    'font-inter',
                    item.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white',
                  )}
                >
                  {item.label}
                </span>
              </div>
              {item.status === 'pending' && !item.completed && (
                <span className="text-xs font-inter text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded">
                  Pending Review
                </span>
              )}
              {item.status === 'rejected' && (
                <span className="text-xs font-inter text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded">
                  Rejected
                </span>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        {nextItem && (
          <Button
            className="w-full mt-6"
            onClick={() => {
              if (nextItem.link) {
                router.push(nextItem.link);
              }
            }}
          >
            Continue Setup
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
