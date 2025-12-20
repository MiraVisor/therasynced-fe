'use client';

import { addDays, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { CreateSlotForm } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/CreateSlotForm';
import { DaySlotSection } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/DaySlotSection';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { UpgradeModal } from '@/components/core/Dashboard/FreelancerSide/Subscription/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeleteSlot, useMySlots, useSlotStats } from '@/hooks/queries/useSlots';
import { useMySubscription, useSubscriptionPlans } from '@/hooks/queries/useSubscription';
import { useAuth } from '@/hooks/useAuthZustand';
import { Slot } from '@/types/types';

const SlotsPage = () => {
  const router = useRouter();
  const { role } = useAuth();

  // Calculate week date for query
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const weekDate = currentWeekStart.toISOString().split('T')[0];

  // Use React Query hooks
  const { data: slots = [], isLoading } = useMySlots({
    page: 1,
    limit: 1000,
    sortBy: 'startTime',
    sortOrder: 'asc',
    weekStart: weekDate,
  });
  const { data: slotStats, isLoading: isLoadingStats } = useSlotStats();
  const { mutate: deleteSlotMutation } = useDeleteSlot();
  const { data: plans = [] } = useSubscriptionPlans();
  const { data: currentSubscription } = useMySubscription();
  const [showCreateSlotForm, setShowCreateSlotForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isNavigatingWeek, setIsNavigatingWeek] = useState(false);

  const handleSlotCreateSuccess = () => {
    setShowCreateSlotForm(false);
    // Scroll to top to see the new slots
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // React Query will automatically refetch slots
  };

  const handleCreateSlotClick = () => {
    // Check if user is inactive - redirect to subscription page
    if (currentSubscription?.status === 'INACTIVE') {
      toast.error('Please subscribe to create slots');
      router.push('/dashboard/account?tab=subscription');
      return;
    }

    // Check subscription limits before opening the form
    if (currentSubscription?.plan) {
      const { maxSlots } = currentSubscription.plan;
      if (maxSlots !== null && slotStats && slotStats.totalSlots >= maxSlots) {
        // Show upgrade modal
        setShowUpgradeModal(true);
        return;
      }
    }
    setShowCreateSlotForm(true);
  };

  const handleUpgradeClose = () => {
    setShowUpgradeModal(false);
  };

  const handleSlotClick = (slot: Slot) => {
    router.push(`/dashboard/slots/${slot.id}`);
  };

  const handleDeleteFromDialog = (slotId: string) => {
    setShowDetailsDialog(false);
    setSelectedSlot(null);
    deleteSlotMutation(slotId, {
      onSuccess: () => {
        // React Query will automatically refetch slots and stats
      },
    });
  };

  const handleDeleteSlot = () => {
    if (!selectedSlot) return;
    setShowDeleteDialog(false);
    deleteSlotMutation(selectedSlot.id, {
      onSuccess: () => {
        setSelectedSlot(null);
        // React Query will automatically refetch slots and stats
      },
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setIsNavigatingWeek(true);
    if (direction === 'prev') {
      const newWeekStart = addDays(currentWeekStart, -7);
      setCurrentWeekStart(newWeekStart);
    } else {
      const newWeekStart = addDays(currentWeekStart, 7);
      setCurrentWeekStart(newWeekStart);
    }
    // React Query will automatically refetch when currentWeekStart changes
    setTimeout(() => setIsNavigatingWeek(false), 500);
  };

  const handleDatePickerChange = (date: Date | undefined) => {
    if (date) {
      const newWeekStart = startOfWeek(date, { weekStartsOn: 1 });
      setCurrentWeekStart(newWeekStart);
      // React Query will automatically refetch
    }
  };

  const getWeekDays = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  };

  const getSlotsForDate = (date: Date) => {
    const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

    return slots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      // Only show slots that fall within the current week
      return slotDate >= weekStart && slotDate < weekEnd && isSameDay(slotDate, date);
    });
  };

  // Use API stats - these are global stats, not week-specific
  const displayStats = useMemo(() => {
    if (slotStats) {
      return {
        total: slotStats.totalSlots || 0,
        booked: slotStats.bookedSlots || 0,
        available: slotStats.availableSlots || 0,
        revenue: slotStats.revenue || 0,
      };
    }

    // Return zeros while loading - don't use week-specific slots for global stats
    return {
      total: 0,
      booked: 0,
      available: 0,
      revenue: 0,
    };
  }, [slotStats]);

  const weekDays = getWeekDays();

  // Check if slot limit is reached
  const isSlotLimitReached = useMemo(() => {
    // First check canCreateSlots from subscription status (for trial freelancers)
    if (currentSubscription?.canCreateSlots === false) {
      return true;
    }

    // If unlimited, never reached
    if (slotStats?.subscriptionInfo?.isUnlimited) return false;

    // Check if remaining slots is 0
    if (slotStats?.subscriptionInfo?.remainingSlots === 0) return true;

    // Fallback check: if maxSlots is set and totalSlots >= maxSlots
    if (
      currentSubscription?.plan?.maxSlots !== null &&
      currentSubscription?.plan?.maxSlots !== undefined &&
      slotStats &&
      slotStats.totalSlots >= (currentSubscription.plan.maxSlots || 0)
    ) {
      return true;
    }

    return false;
  }, [slotStats, currentSubscription]);

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-poppins font-bold text-charcoal">Your Schedule</h2>
              <p className="font-inter text-muted-foreground mt-1">
                Manage your availability and bookings for the week
              </p>
            </div>
            {!isSlotLimitReached ? (
              <Button onClick={handleCreateSlotClick} className="h-11 px-6">
                <Plus className="h-5 w-5 mr-2" />
                Add Availability
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={() => setShowUpgradeModal(true)}
                      disabled
                      variant="outline"
                      className="h-11 px-6"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Availability
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {currentSubscription?.canCreateSlots === false
                      ? currentSubscription?.message ||
                        "You've reached the trial limit of 5 slots. Upgrade to create more."
                      : "You've reached your slot limit. Upgrade to create more."}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Create Slot Form - Inline */}
        {showCreateSlotForm && (
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-poppins font-semibold text-charcoal">
                    Add Your Availability
                  </CardTitle>
                  <CardDescription>
                    Set up your available times for clients to book. You can add multiple slots at
                    once.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateSlotForm(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CreateSlotForm onSuccess={handleSlotCreateSuccess} />
            </CardContent>
          </Card>
        )}

        {/* Subscription Info Section */}
        {slotStats?.subscriptionInfo && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-poppins font-semibold text-lg text-charcoal">
                  Subscription & Slot Limits
                </h3>
                <p className="font-inter text-sm text-gray-500 mt-1">
                  {slotStats.subscriptionInfo.planName
                    ? `${slotStats.subscriptionInfo.planName} Plan`
                    : 'No active subscription'}
                </p>
              </div>
              {slotStats.subscriptionInfo.remainingSlots === 0 && (
                <div className="px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg">
                  <span className="text-xs font-inter font-medium text-error">
                    Slot limit reached
                  </span>
                </div>
              )}
            </div>

            {slotStats.subscriptionInfo.isUnlimited ? (
              <div className="flex items-center gap-2 p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="flex-1">
                  <div className="font-poppins text-2xl font-bold text-success mb-1">
                    Unlimited Slots
                  </div>
                  <div className="font-inter text-sm text-gray-600">
                    {slotStats.subscriptionInfo.activeSlotsCount} active slot
                    {slotStats.subscriptionInfo.activeSlotsCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ) : slotStats.subscriptionInfo.planName ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-inter text-sm font-medium text-gray-700">
                    {slotStats.subscriptionInfo.activeSlotsCount} /{' '}
                    {slotStats.subscriptionInfo.maxSlots} slots used
                  </span>
                  <span className="font-inter text-sm font-medium text-charcoal">
                    {slotStats.subscriptionInfo.remainingSlots !== null
                      ? `${slotStats.subscriptionInfo.remainingSlots} remaining`
                      : 'Unlimited'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      slotStats.subscriptionInfo.remainingSlots === 0
                        ? 'bg-error'
                        : slotStats.subscriptionInfo.remainingSlots !== null &&
                            slotStats.subscriptionInfo.remainingSlots <= 2
                          ? 'bg-warning'
                          : 'bg-success'
                    }`}
                    style={{
                      width: `${Math.min(
                        (slotStats.subscriptionInfo.activeSlotsCount /
                          (slotStats.subscriptionInfo.maxSlots || 1)) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
                {slotStats.subscriptionInfo.remainingSlots === 0 && (
                  <div className="mt-3 p-3 bg-error/5 border border-error/20 rounded-lg">
                    <p className="text-sm font-inter text-error">
                      You&apos;ve reached your slot limit. Please upgrade your plan to create more
                      slots.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => router.push('/dashboard/account?tab=subscription')}
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-inter text-gray-600 mb-3">
                  Please subscribe to create slots and start accepting bookings.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => router.push('/dashboard/account?tab=subscription')}
                >
                  View Plans
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <EnhancedStatCard
            title="Total Slots"
            value={displayStats.total.toString()}
            icon={CalendarIcon}
            iconColor="text-info"
            iconBg="bg-info/10"
            loading={isLoadingStats && !slotStats}
          />
          <EnhancedStatCard
            title="Booked"
            value={displayStats.booked.toString()}
            icon={Clock}
            iconColor="text-success"
            iconBg="bg-success/10"
            loading={isLoadingStats && !slotStats}
          />
          <EnhancedStatCard
            title="Available"
            value={displayStats.available.toString()}
            icon={TrendingUp}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            loading={isLoadingStats && !slotStats}
          />
          <EnhancedStatCard
            title="Revenue"
            value={`€${displayStats.revenue.toFixed(2)}`}
            icon={DollarSign}
            iconColor="text-warning"
            iconBg="bg-warning/10"
            loading={isLoadingStats && !slotStats}
          />
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center justify-between gap-4 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="h-10 w-10 p-0"
              disabled={isNavigatingWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-base lg:text-lg font-semibold text-charcoal hover:bg-gray-100 px-4 py-2"
                  disabled={isNavigatingWeek}
                >
                  {format(currentWeekStart, 'MMM d')} -{' '}
                  {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={currentWeekStart}
                  onSelect={(date) => {
                    if (date) {
                      handleDatePickerChange(date);
                    }
                  }}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="h-10 w-10 p-0"
              disabled={isNavigatingWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day Sections */}
        {isNavigatingWeek || (isLoading && slots.length === 0) ? (
          <div className="space-y-6">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border p-8 min-h-[300px]">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                  <div className="space-y-3 mt-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {weekDays.map((date) => {
              const daySlots = getSlotsForDate(date);
              return (
                <div key={date.toISOString()} id={`day-section-${date.toISOString()}`}>
                  <DaySlotSection date={date} slots={daySlots} onSlotClick={handleSlotClick} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slot Details Dialog */}
      {selectedSlot && (
        <SlotDetailsDialog
          slot={selectedSlot}
          isOpen={showDetailsDialog}
          onClose={() => {
            setShowDetailsDialog(false);
            setSelectedSlot(null);
          }}
          onDelete={handleDeleteFromDialog}
          onComplete={() => {
            // React Query will automatically refetch slots and stats
          }}
        />
      )}

      {/* Delete Slot Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this slot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Keep Slot
            </Button>
            <Button variant="destructive" onClick={handleDeleteSlot}>
              Cancel Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      {currentSubscription?.plan && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={handleUpgradeClose}
          currentPlan={currentSubscription.plan}
          availablePlans={plans}
          currentSlots={slotStats?.totalSlots || 0}
          maxSlots={currentSubscription.plan.maxSlots || 0}
        />
      )}
    </DashboardPageWrapper>
  );
};

export default SlotsPage;
