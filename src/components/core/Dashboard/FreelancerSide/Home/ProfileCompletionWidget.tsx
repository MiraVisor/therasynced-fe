'use client';

import { CheckCircle2, ChevronDown, ChevronUp, Circle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProfileCompletion } from '@/hooks/queries/useFreelancers';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'profile-completion-widget:collapsed';

/**
 * Floating bottom-right widget that surfaces the freelancer's profile
 * completion checklist without taking dashboard space. Two states:
 * collapsed (compact pill) and expanded (full card). State persists in
 * localStorage so the user's preference sticks across navigation. Auto-
 * hides entirely when the profile is 100% complete.
 */
export const ProfileCompletionWidget = () => {
  const router = useRouter();
  const { data: completion } = useProfileCompletion();

  const [collapsed, setCollapsed] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setCollapsed(stored === null ? false : stored === '1');
    setHydrated(true);
  }, []);

  const updateCollapsed = (next: boolean) => {
    setCollapsed(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    }
  };

  if (!completion || !hydrated) return null;

  const { completionPercentage, isComplete, completedItems, incompleteItems, nextAction } =
    completion;

  if (isComplete) return null;

  const allItems = [
    ...completedItems.map((item) => ({ ...item, completed: true as const })),
    ...incompleteItems.map((item) => ({ ...item, completed: false as const })),
  ];
  const total = allItems.length;
  const completedCount = completedItems.length;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => updateCollapsed(false)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:bg-primary/95 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium font-inter">Setup · {completionPercentage}%</span>
        <ChevronUp className="w-4 h-4 opacity-80" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] sm:w-[360px] max-h-[calc(100vh-3rem)] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <h3 className="text-sm font-poppins font-bold text-charcoal dark:text-white">
            Complete your profile
          </h3>
          <p className="text-xs text-muted-foreground font-inter mt-0.5">
            {completedCount} of {total} done · {completionPercentage}%
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateCollapsed(true)}
          className="p-1 -m-1 text-muted-foreground hover:text-foreground rounded transition-colors"
          aria-label="Minimize"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pt-3">
        <Progress value={completionPercentage} className="h-1.5" />
      </div>

      <div className="px-4 py-3 space-y-1.5 overflow-y-auto">
        {allItems.map((item) => (
          <div
            key={item.key}
            className={cn(
              'flex items-center gap-2.5 p-2 rounded-md transition-colors',
              !item.completed && 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer',
            )}
            onClick={() => {
              if (!item.completed && item.actionUrl) {
                router.push(item.actionUrl);
              }
            }}
          >
            {item.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
            )}
            <span
              className={cn(
                'text-xs font-inter flex-1 min-w-0 truncate',
                item.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white',
              )}
            >
              {item.label}
            </span>
            {item.status === 'pending' && !item.completed && (
              <span className="text-[10px] font-inter text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 px-1.5 py-0.5 rounded shrink-0">
                Pending
              </span>
            )}
          </div>
        ))}
      </div>

      {nextAction && (
        <div className="px-4 pb-4 pt-1">
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              if (nextAction.url) {
                router.push(nextAction.url);
              }
            }}
          >
            Continue Setup
          </Button>
        </div>
      )}
    </div>
  );
};
