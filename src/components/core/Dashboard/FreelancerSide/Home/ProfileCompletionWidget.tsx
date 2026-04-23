'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProfileCompletion } from '@/hooks/queries/useFreelancers';
import { cn } from '@/lib/utils';

/**
 * Frontend used to calculate completion itself by checking `profile.city`
 * and similar fields — those names never matched the actual User model
 * (which has `county` and `cityTown`), so items like "basic info" could
 * never tick off. Now we use the backend's `/freelancer/profile-completion`
 * endpoint as the single source of truth. It reads the real columns and
 * returns per-item completion state already computed.
 */
export const ProfileCompletionWidget = () => {
  const router = useRouter();
  const { data: completion } = useProfileCompletion();

  if (!completion) return null;

  const { completionPercentage, isComplete, completedItems, incompleteItems, nextAction } =
    completion;

  // Don't show if profile is already complete
  if (isComplete) {
    return null;
  }

  // Merge completed + incomplete into one display list, preserving the
  // order the backend returns. Completed items render with a strikethrough,
  // incomplete items are clickable and route to the relevant page.
  const allItems = [
    ...completedItems.map((item) => ({ ...item, completed: true as const })),
    ...incompleteItems.map((item) => ({ ...item, completed: false as const })),
  ];
  const total = allItems.length;
  const completedCount = completedItems.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="font-inter">
              {completedCount} of {total} items completed
            </CardDescription>
          </div>
          <span className="text-2xl font-poppins font-bold text-primary">
            {completionPercentage}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={completionPercentage} className="h-2 mb-6" />

        <div className="space-y-3">
          {allItems.map((item) => (
            <div
              key={item.key}
              className={cn(
                'flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors',
                !item.completed && 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer',
              )}
              onClick={() => {
                if (!item.completed && item.actionUrl) {
                  router.push(item.actionUrl);
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
            </div>
          ))}
        </div>

        {nextAction && (
          <Button
            className="w-full mt-6"
            onClick={() => {
              if (nextAction.url) {
                router.push(nextAction.url);
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
