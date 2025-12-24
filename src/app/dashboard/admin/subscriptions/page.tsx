'use client';

import { Check, CheckCircle2, Edit2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import adminSubscriptionService, {
  UpdateSubscriptionPlanDto,
} from '@/services/adminSubscriptionService';
import { PlanType, SubscriptionPlan } from '@/types/types';

const SubscriptionsPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      const hasData = plans.length > 0;
      try {
        if (!hasData) {
          setInitialLoading(true);
        } else {
          setLoading(true);
        }
        const plansData = await adminSubscriptionService.getPlans();
        setPlans(plansData);
      } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        const errorMessage =
          apiError.response?.data?.message || 'Failed to fetch subscription plans';
        // Only show error toast on initial load
        if (!hasData) {
          toast.error(errorMessage);
        }
        // Don't clear data on error if we have existing data
        if (!hasData) {
          setPlans([]);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle price update
  const handlePriceUpdate = async () => {
    if (!selectedPlan) return;

    if (editPrice <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData: UpdateSubscriptionPlanDto = {
        price: editPrice,
      };
      await adminSubscriptionService.updatePlan(selectedPlan.name, updateData);
      toast.success('Plan price updated successfully');
      setIsEditDialogOpen(false);
      // Refresh plans
      const plansData = await adminSubscriptionService.getPlans();
      setPlans(plansData);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Failed to update plan price');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setEditPrice(plan.price);
    setIsEditDialogOpen(true);
  };

  // Get plan styling - unified color scheme

  // Sort plans: Bronze, Silver, Gold
  const sortedPlans = [...plans].sort((a, b) => {
    const order: Record<PlanType, number> = { BRONZE: 1, SILVER: 2, GOLD: 3 };
    return order[a.name] - order[b.name];
  });

  return (
    <DashboardPageWrapper
      header={
        <div>
          <h1 className="font-poppins font-bold text-3xl text-charcoal mb-2">Subscription Plans</h1>
          <p className="text-muted-foreground font-inter text-sm">
            Manage pricing for Bronze, Silver, and Gold subscription plans
          </p>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {initialLoading || (loading && plans.length === 0) ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-border rounded-2xl p-8 bg-card animate-pulse shadow-lg"
              >
                <div className="h-7 bg-muted rounded w-1/3 mb-6" />
                <div className="h-12 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4 mb-6" />
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:gap-8 md:grid-cols-3">
            {sortedPlans.map((plan) => {
              return (
                <div
                  key={plan.id}
                  className="group relative flex flex-col h-full bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Card Content */}
                  <div className="p-8 flex flex-col h-full">
                    {/* Plan Header */}
                    <div className="mb-8">
                      <h3 className="font-poppins font-bold text-3xl text-charcoal mb-3 leading-tight">
                        {plan.displayName}
                      </h3>
                      {plan.description && (
                        <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    {/* Price Section */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="font-poppins font-bold text-6xl leading-none text-primary">
                          EUR {plan.price}
                        </span>
                        <span className="font-inter text-lg text-muted-foreground font-medium">
                          /month
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(plan)}
                        className="w-full font-inter text-sm font-medium border-2 border-primary text-primary hover:bg-primary/10 transition-all"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Price
                      </Button>
                    </div>

                    {/* Features List */}
                    <div className="flex-grow mb-8">
                      <h4 className="font-poppins font-semibold text-lg text-charcoal mb-5">
                        What&apos;s Included
                      </h4>
                      <ul className="space-y-3.5">
                        {plan.features && plan.features.length > 0 ? (
                          plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 font-inter text-sm text-foreground leading-relaxed"
                            >
                              <div className="mt-0.5 flex-shrink-0 rounded-full p-0.5 bg-primary/10">
                                <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={3} />
                              </div>
                              <span className="flex-1">{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className="font-inter text-sm text-muted-foreground italic">
                            No features listed
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Price Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-poppins font-bold text-xl">
                Edit Plan Price: {selectedPlan?.displayName}
              </DialogTitle>
              <DialogDescription className="font-inter text-sm text-muted-foreground">
                Update the monthly price for this subscription plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="font-inter font-medium">
                  Monthly Price (EUR)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                  className="font-inter text-lg h-12"
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
                className="font-inter"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handlePriceUpdate}
                disabled={isSubmitting}
                className="font-inter bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  'Saving...'
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default SubscriptionsPage;
