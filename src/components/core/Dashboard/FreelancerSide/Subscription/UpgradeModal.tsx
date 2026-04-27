'use client';

import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlanType, SubscriptionPlan } from '@/types/types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: SubscriptionPlan | null;
  availablePlans?: SubscriptionPlan[];
  currentSlots: number;
  maxSlots: number;
}

export const UpgradeModal = ({
  isOpen,
  onClose,
  currentPlan: _currentPlan,
  availablePlans,
  currentSlots,
  maxSlots,
}: UpgradeModalProps) => {
  const router = useRouter();

  const upgradePlans = availablePlans?.filter(
    (plan) => plan.maxSlots === null || plan.maxSlots > maxSlots,
  );

  const handleUpgrade = (planType: PlanType) => {
    router.push(`/dashboard/account?tab=subscription&upgrade=${planType}`);
    onClose();
  };

  if (!upgradePlans || upgradePlans.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Slot Limit Reached
          </DialogTitle>
          <DialogDescription>
            You have reached your subscription limit of {maxSlots} active slots ({currentSlots}/
            {maxSlots} used). Upgrade to a plan with more slots to create additional time slots.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {upgradePlans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                <p className="text-sm text-gray-600">
                  {plan.maxSlots === null ? 'Unlimited slots' : `Up to ${plan.maxSlots} slots`}
                </p>
              </div>
              <Button
                onClick={() => handleUpgrade(plan.name)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Upgrade
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
