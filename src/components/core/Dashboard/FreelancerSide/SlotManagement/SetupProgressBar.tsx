'use client';

import { Check, CircleDot } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SetupProgressBarProps {
  currentStep: 'pricing' | 'availability' | 'done';
  hasPricing: boolean;
  hasSlots: boolean;
}

export const SetupProgressBar = ({ currentStep, hasPricing, hasSlots }: SetupProgressBarProps) => {
  const steps = [
    { id: 'pricing', label: 'Pricing', completed: hasPricing },
    { id: 'availability', label: 'Availability', completed: hasSlots },
    { id: 'done', label: 'Done', completed: hasPricing && hasSlots },
  ];

  const getStepStatus = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return 'pending';
    if (step.completed) return 'completed';
    if (currentStep === stepId) return 'current';
    return 'pending';
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-mint/20 to-white rounded-lg border border-gray-100">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all',
                  status === 'completed' && 'bg-green-500 border-green-500 text-white',
                  status === 'current' && 'bg-primary border-primary text-white',
                  status === 'pending' && 'bg-gray-100 border-gray-300 text-gray-400',
                )}
              >
                {status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : status === 'current' ? (
                  <CircleDot className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  status === 'completed' && 'text-green-600',
                  status === 'current' && 'text-primary',
                  status === 'pending' && 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn('w-12 h-0.5 mx-3', step.completed ? 'bg-green-500' : 'bg-gray-200')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
