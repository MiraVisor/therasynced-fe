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
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
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
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getDecodedToken } from '@/lib/utils';
import { getSubscriptionPlans } from '@/redux/api/subscriptionApi';
import { useAppDispatch, useAppSelector, useAuth } from '@/redux/hooks/useAppHooks';
import { deleteSlot, fetchMySlots, fetchMySlotsStats } from '@/redux/slices/slotSlice';
import { RootState } from '@/redux/store';
import { Slot } from '@/types/types';

const SlotsPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { role } = useAuth();
  const { slots, isLoading, isCreating, slotStats, isLoadingStats, initialLoadingStats } =
    useSelector((state: RootState) => state.slot);
  const { currentSubscription, plans } = useAppSelector((state) => state.subscription);
  const [showCreateSlotForm, setShowCreateSlotForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isNavigatingWeek, setIsNavigatingWeek] = useState(false);

  const fetchSlotsForWeek = async (weekStartDate: Date, resetSlots = false) => {
    const decodedToken = getDecodedToken();
    const freelancerId = decodedToken?.sub;

    if (!freelancerId) return;

    // Calculate week range (Monday 00:00 to Sunday 23:59:59)
    const weekStart = new Date(weekStartDate);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekStartDate.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    try {
      const response = await dispatch(
        fetchMySlots({
          page: 1,
          limit: 1000,
          freelancerId,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
        }) as any,
      ).unwrap();

      if (resetSlots) {
        // Replace slots on week change
        dispatch({ type: 'slot/setSlots', payload: response.data });
      } else {
        // Append slots when loading more weeks
        dispatch({ type: 'slot/appendSlots', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      toast.error('Failed to load slots for this week');
    }
  };

  // Fetch subscription and stats on mount
  useEffect(() => {
    const hasStats = slotStats !== null;
    const hasPlans = plans.length > 0;
    dispatch(fetchMySlotsStats({ silent: hasStats }) as any);
    dispatch(getSubscriptionPlans({ silent: hasPlans }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    fetchSlotsForWeek(currentWeekStart, true);
  }, [dispatch, currentWeekStart]);

  const handleSlotCreateSuccess = () => {
    setShowCreateSlotForm(false);
    fetchSlotsForWeek(currentWeekStart, true);
    dispatch(fetchMySlotsStats({ silent: true }) as any);
    // Scroll to top to see the new slots
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const maxSlots = currentSubscription.plan.maxSlots;
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

  const handleDeleteFromDialog = async (slotId: string) => {
    setShowDetailsDialog(false);
    setSelectedSlot(null);
    try {
      await dispatch(deleteSlot(slotId) as any).unwrap();
      toast.success('Slot deleted successfully');
      // Update stats after successful deletion
      dispatch(fetchMySlotsStats({ silent: true }) as any);
      // Note: The slot is already removed from UI via optimistic update in the reducer
      // We don't refresh the slots list here to avoid race conditions where the server
      // might not have processed the delete yet and would restore the slot
      // The optimistic update ensures immediate UI feedback
    } catch (error: any) {
      const errorMessage = error?.error || error?.message || 'Failed to delete slot';
      toast.error(errorMessage);
      // Refresh to restore the slot if deletion failed (optimistic update will be overwritten)
      fetchSlotsForWeek(currentWeekStart, true);
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;
    setShowDeleteDialog(false);
    setSelectedSlot(null);
    try {
      await dispatch(deleteSlot(selectedSlot.id) as any).unwrap();
      toast.success('Slot deleted successfully');
      dispatch(fetchMySlotsStats({ silent: true }) as any);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete slot');
      fetchSlotsForWeek(currentWeekStart, true);
    }
  };

  const navigateWeek = async (direction: 'prev' | 'next') => {
    setIsNavigatingWeek(true);
    try {
      if (direction === 'prev') {
        const newWeekStart = addDays(currentWeekStart, -7);
        setCurrentWeekStart(newWeekStart);
        fetchSlotsForWeek(newWeekStart, true);
      } else {
        const newWeekStart = addDays(currentWeekStart, 7);
        setCurrentWeekStart(newWeekStart);
        fetchSlotsForWeek(newWeekStart, true);
      }
    } finally {
      setIsNavigatingWeek(false);
    }
  };

  const handleDatePickerChange = (date: Date | undefined) => {
    if (date) {
      const newWeekStart = startOfWeek(date, { weekStartsOn: 1 });
      setCurrentWeekStart(newWeekStart);
      fetchSlotsForWeek(newWeekStart, true);
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

  // Use API stats when available, fallback to calculated stats
  const displayStats = useMemo(() => {
    if (slotStats) {
      return {
        total: slotStats.totalSlots,
        booked: slotStats.bookedSlots,
        available: slotStats.availableSlots,
        revenue: slotStats.revenue,
      };
    }

    // Fallback calculation
    const bookedSlots = slots.filter((s) => s.status === 'BOOKED');
    const availableSlots = slots.filter((s) => s.status === 'AVAILABLE');
    const totalRevenue = bookedSlots.reduce((sum, slot) => sum + slot.basePrice, 0);

    return {
      total: slots.length,
      booked: bookedSlots.length,
      available: availableSlots.length,
      revenue: totalRevenue,
    };
  }, [slotStats, slots]);

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
              <Button onClick={handleCreateSlotClick} disabled={isCreating} className="h-11 px-6">
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Availability
                  </>
                )}
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
            loading={initialLoadingStats || (isLoadingStats && !slotStats)}
          />
          <EnhancedStatCard
            title="Booked"
            value={displayStats.booked.toString()}
            icon={Clock}
            iconColor="text-success"
            iconBg="bg-success/10"
            loading={initialLoadingStats || (isLoadingStats && !slotStats)}
          />
          <EnhancedStatCard
            title="Available"
            value={displayStats.available.toString()}
            icon={TrendingUp}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            loading={initialLoadingStats || (isLoadingStats && !slotStats)}
          />
          <EnhancedStatCard
            title="Revenue"
            value={`€${displayStats.revenue.toFixed(2)}`}
            icon={DollarSign}
            iconColor="text-warning"
            iconBg="bg-warning/10"
            loading={initialLoadingStats || (isLoadingStats && !slotStats)}
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
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-3 mt-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
            // Refresh slots after completion
            fetchSlotsForWeek(currentWeekStart, true);
            fetchMySlotsStats({ silent: true });
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
