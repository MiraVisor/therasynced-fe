'use client';

import { ArrowDown, ArrowUp, CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

  // Get plan color scheme
  const getPlanColors = () => {
    switch (plan.name) {
      case 'BRONZE':
        return {
          border: 'border-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          text: 'text-amber-700 dark:text-amber-300',
          accent: 'bg-amber-600',
        };
      case 'SILVER':
        return {
          border: 'border-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-800/50',
          text: 'text-gray-700 dark:text-gray-300',
          accent: 'bg-gray-400',
        };
      case 'GOLD':
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-700 dark:text-yellow-300',
          accent: 'bg-yellow-500',
        };
      default:
        return {
          border: 'border-primary',
          bg: 'bg-primary/10',
          text: 'text-primary',
          accent: 'bg-primary',
        };
    }
  };

  const planColors = getPlanColors();

  // Determine if this is an upgrade or downgrade
  const getUpgradeDowngradeStatus = () => {
    if (!hasActiveSubscription || !currentPlanName || isCurrentPlan) return null;

    const planOrder: PlanType[] = ['BRONZE', 'SILVER', 'GOLD'];
    const currentIndex =
      currentPlanName && planOrder.includes(currentPlanName as PlanType)
        ? planOrder.indexOf(currentPlanName as PlanType)
        : -1;
    const targetIndex = planOrder.indexOf(plan.name);

    if (targetIndex > currentIndex) {
      return { type: 'upgrade', icon: ArrowUp, label: 'Upgrade' };
    } else if (targetIndex < currentIndex) {
      return { type: 'downgrade', icon: ArrowDown, label: 'Downgrade' };
    }
    return null;
  };

  const upgradeDowngrade = getUpgradeDowngradeStatus();

  return (
    <Card
      className={`group relative flex h-full flex-col transition-all duration-300 ${
        isCurrentPlan
          ? `border-2 ${planColors.border} ${planColors.bg} shadow-md`
          : 'border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-lg hover:scale-[1.02]'
      } ${isRecommended && !isCurrentPlan ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}
    >
      {isRecommended && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <Badge className="bg-primary text-white">Current Plan</Badge>
        </div>
      )}

      {upgradeDowngrade && (
        <div className="absolute -top-3 right-4 z-10">
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              upgradeDowngrade.type === 'upgrade'
                ? 'border-green-500 text-green-700 dark:text-green-400'
                : 'border-orange-500 text-orange-700 dark:text-orange-400'
            }`}
          >
            {upgradeDowngrade.type === 'upgrade' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {upgradeDowngrade.label}
          </Badge>
        </div>
      )}

      <CardHeader className="flex-grow pb-6 pt-8">
        <CardTitle
          className={`text-2xl font-poppins font-bold mb-2 ${
            isCurrentPlan ? planColors.text : 'text-charcoal'
          }`}
        >
          {plan.displayName}
        </CardTitle>
        <CardDescription className="text-sm font-inter text-gray-600 dark:text-gray-400 mb-6">
          {plan.description}
        </CardDescription>

        {/* Pricing - Very Prominent */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-5xl font-poppins font-bold ${
                isCurrentPlan ? planColors.text : 'text-charcoal'
              }`}
            >
              EUR {plan.price.toFixed(2)}
            </span>
            <span className="text-lg font-inter text-gray-600 dark:text-gray-400">/month</span>
          </div>
        </div>

        {/* Plan Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <CheckCircle2
              className={`h-4 w-4 flex-shrink-0 ${isCurrentPlan ? planColors.text : 'text-primary'}`}
            />
            <span className="font-medium">{displaySlots}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle2
              className={`h-4 w-4 flex-shrink-0 ${isCurrentPlan ? planColors.text : 'text-primary'}`}
            />
            <span>{plan.commissionRate}% commission rate</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4 pb-6">
        <div>
          <h4 className="mb-4 text-sm font-poppins font-semibold text-charcoal uppercase tracking-wide">
            Features Included
          </h4>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm font-inter text-gray-700 dark:text-gray-300"
              >
                <CheckCircle2
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                    isCurrentPlan ? planColors.text : 'text-primary'
                  }`}
                />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      {onSelectPlan && (
        <div className="px-6 pb-6 pt-0">
          <Button
            onClick={() => onSelectPlan(plan.name)}
            disabled={isCurrentPlan || isLoading}
            className={`w-full transition-all duration-200 font-medium ${
              isCurrentPlan
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-primary hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-white'
            }`}
            size="lg"
          >
            {isLoading
              ? 'Processing...'
              : isCurrentPlan
                ? 'Current Plan'
                : hasActiveSubscription
                  ? upgradeDowngrade
                    ? `${upgradeDowngrade.label} to ${plan.displayName}`
                    : 'Switch to this Plan'
                  : 'Select Plan'}
          </Button>
        </div>
      )}
    </Card>
  );
};
