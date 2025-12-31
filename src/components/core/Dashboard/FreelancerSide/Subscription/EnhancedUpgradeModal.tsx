'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SubscriptionPlan } from '@/types/subscription';
import { PlanType } from '@/types/types';

import { FeatureComparison } from './FeatureComparison';
import { PlanCard } from './PlanCard';

interface EnhancedUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  currentPlanName?: PlanType;
  onSelectPlan?: (planType: PlanType) => void;
  isLoading?: boolean;
}

export function EnhancedUpgradeModal({
  isOpen,
  onClose,
  plans,
  currentPlanName,
  onSelectPlan,
  isLoading = false,
}: EnhancedUpgradeModalProps) {
  const router = useRouter();

  const handleViewAllPlans = () => {
    onClose();
    router.push('/dashboard/account?tab=subscription&view=plans');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-poppins font-bold">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            You've reached your slot limit. Upgrade to unlock more slots and features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Plan Selection */}
          <div>
            <h3 className="text-lg font-poppins font-semibold mb-4">Recommended Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans
                .filter((plan) => plan.name !== currentPlanName)
                .map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    currentPlanName={currentPlanName}
                    onSelectPlan={onSelectPlan}
                    isLoading={isLoading}
                    hasActiveSubscription={!!currentPlanName}
                  />
                ))}
            </div>
          </div>

          {/* Feature Comparison */}
          {plans.length > 0 && (
            <div>
              <h3 className="text-lg font-poppins font-semibold mb-4">Compare Plans</h3>
              <FeatureComparison plans={plans} currentPlanName={currentPlanName} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleViewAllPlans} variant="outline" className="flex-1">
              View All Plans
            </Button>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
