'use client';

import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanType, SubscriptionPlan } from '@/types/types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlanName?: string;
  isRecommended?: boolean;
  onSelectPlan?: (planType: PlanType) => void;
  isLoading?: boolean;
  hasActiveSubscription?: boolean;
}

export const PlanCard = ({
  plan,
  currentPlanName,
  isRecommended = false,
  onSelectPlan,
  isLoading = false,
  hasActiveSubscription = false,
}: PlanCardProps) => {
  const isCurrentPlan = currentPlanName === plan.name;
  const displaySlots = plan.maxSlots === null ? 'Unlimited slots' : `Up to ${plan.maxSlots} slots`;

  return (
    <Card
      className={`relative flex h-full flex-col transition-all duration-300 ${
        isCurrentPlan
          ? 'border-2 border-primary bg-primary/5'
          : 'border border-gray-200 dark:border-gray-700 hover:border-primary/50'
      } ${isRecommended ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            Recommended
          </span>
        </div>
      )}

      <CardHeader className="flex-grow pb-4">
        <CardTitle className="text-2xl font-bold text-primary">{plan.displayName}</CardTitle>
        <CardDescription className="text-base">{plan.description}</CardDescription>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">€{plan.price}</span>
            <span className="text-gray-600 dark:text-gray-400">/month</span>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{displaySlots}</div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-3 pb-6">
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Features:</h4>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      {onSelectPlan && (
        <div className="p-6 pt-0">
          <Button
            onClick={() => onSelectPlan(plan.name)}
            disabled={isCurrentPlan || isLoading}
            className={`w-full ${isCurrentPlan ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'}`}
          >
            {isLoading
              ? 'Loading...'
              : isCurrentPlan
                ? 'Current Plan'
                : hasActiveSubscription
                  ? 'Switch to this Plan'
                  : 'Select Plan'}
          </Button>
        </div>
      )}
    </Card>
  );
};
