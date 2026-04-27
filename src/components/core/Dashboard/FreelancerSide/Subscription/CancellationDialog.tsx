'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionPlan } from '@/types/subscription';

interface CancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  subscriptionEndDate?: string;
  currentPlan?: SubscriptionPlan;
  onDowngrade?: () => void;
  isLoading?: boolean;
  isTrialing?: boolean;
  trialEndDate?: string | null;
}

const cancellationReasons = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using', label: 'Not using the service enough' },
  { value: 'found_alternative', label: 'Found an alternative' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'temporary', label: 'Temporary pause' },
  { value: 'other', label: 'Other' },
];

const featuresLost = [
  'Access to all premium features',
  'Ability to create slots',
  'Ability to accept bookings',
  'Analytics and reports (if applicable)',
  'Priority search placement',
];

export function CancellationDialog({
  isOpen,
  onClose,
  onConfirm,
  subscriptionEndDate,
  currentPlan,
  onDowngrade,
  isLoading = false,
  isTrialing = false,
  trialEndDate,
}: CancellationDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const handleConfirm = () => {
    const finalReason = reason === 'other' ? customReason : reason;
    onConfirm(finalReason || undefined);
    // Reset form
    setReason('');
    setCustomReason('');
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    onClose();
  };

  const endDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
  const trialEnd = trialEndDate ? new Date(trialEndDate) : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            We're sorry to see you go. Please let us know why you're canceling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isTrialing && trialEnd ? (
            <Alert className="border-orange-500 bg-orange-50
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800
                Your subscription has been canceled. You'll continue with trial access until{' '}
                {trialEnd.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                . No payment will be required, and you can continue using the platform during this
                time.
              </AlertDescription>
            </Alert>
          ) : endDate ? (
            <Alert className="border-orange-500 bg-orange-50
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800
                Your subscription will remain active until{' '}
                {endDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                . You can resume anytime before then.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for cancellation (optional)</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {cancellationReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Please tell us more</Label>
              <Textarea
                id="custom-reason"
                placeholder="Share your feedback..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {!isTrialing && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4
              <p className="mb-2 text-sm font-semibold text-red-800
                What you'll lose:
              </p>
              <ul className="space-y-1 text-sm text-red-700
                {featuresLost.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isTrialing && (
            <Alert className="border-blue-500 bg-blue-50
              <AlertDescription className="text-blue-800
                <p className="font-medium mb-1">Good news!</p>
                <p className="text-sm">
                  Since you're canceling during your trial period, you'll keep your trial access
                  until{' '}
                  {trialEnd?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  . You won't lose any features during this time, and no payment will be required.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {onDowngrade && currentPlan && currentPlan.name !== 'BRONZE' && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Consider downgrading instead:</p>
                  <p className="text-sm text-muted-foreground">
                    You can switch to a lower tier plan instead of canceling. This way, you'll keep
                    access to the platform with fewer features.
                  </p>
                  <Button onClick={onDowngrade} variant="outline" size="sm" className="mt-2">
                    View Lower Plans
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline" disabled={isLoading}>
            Keep Subscription
          </Button>
          <Button onClick={handleConfirm} variant="destructive" disabled={isLoading}>
            {isLoading ? 'Canceling...' : 'Cancel Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
