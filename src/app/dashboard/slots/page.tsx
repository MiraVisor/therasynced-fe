'use client';

import { addDays, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DatePicker } from '@/components/common/input/DatePicker';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { CreateSlotForm } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/CreateSlotForm';
import { DaySlotSection } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/DaySlotSection';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { UpgradeModal } from '@/components/core/Dashboard/FreelancerSide/Subscription/UpgradeModal';
import { Button } from '@/components/ui/button';
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
import { getDecodedToken } from '@/lib/utils';
import * as slotApi from '@/redux/api/slotApi';
import { getSubscriptionPlans } from '@/redux/api/subscriptionApi';
import { useAppDispatch, useAppSelector, useAuth } from '@/redux/hooks/useAppHooks';
import { deleteSlot, fetchMySlots, fetchMySlotsStats } from '@/redux/slices/slotSlice';
import { RootState } from '@/redux/store';
import { Slot, SlotStats } from '@/types/types';

const SlotsPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { role } = useAuth();
  const {
    slots,
    isLoading,
    isCreating,
    slotStats,
    isLoadingStats,
    initialLoadingStats,
    backgroundRefreshingStats,
  } = useSelector((state: RootState) => state.slot);
  const { currentSubscription, plans } = useAppSelector((state) => state.subscription);
  const [showCreateSlotForm, setShowCreateSlotForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    setSelectedSlot(slot);
    setShowDetailsDialog(true);
  };

  const handleDeleteFromDialog = (slotId: string) => {
    dispatch(deleteSlot(slotId) as any);
    setShowDetailsDialog(false);
    dispatch(fetchMySlots({ page: 1, limit: 100 }) as any);
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
      setShowDatePicker(false);
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

  const renderSlotCard = (slot: Slot) => {
    return <div key={slot.id} />;
  };

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-poppins font-bold text-charcoal">Your Schedule</h2>
              <p className="font-inter text-muted-foreground mt-1">
                Manage your availability and bookings for the week
              </p>
            </div>
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
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <EnhancedStatCard
            title="Total Slots"
            value={displayStats.total.toString()}
            icon={Calendar}
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

            <Button
              variant="ghost"
              onClick={() => setShowDatePicker(true)}
              className="text-base lg:text-lg font-semibold text-charcoal hover:bg-gray-100 px-4 py-2"
              disabled={isNavigatingWeek}
            >
              {format(currentWeekStart, 'MMM d')} -{' '}
              {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </Button>

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

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
            <DialogDescription>Choose a date to navigate to that week</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DatePicker value={currentWeekStart} onChange={handleDatePickerChange} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Slot Form Dialog */}
      <Dialog open={showCreateSlotForm} onOpenChange={setShowCreateSlotForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Your Availability</DialogTitle>
            <DialogDescription>
              Set up your available times for clients to book. You can add multiple slots at once.
            </DialogDescription>
          </DialogHeader>
          <CreateSlotForm onSuccess={handleSlotCreateSuccess} />
        </DialogContent>
      </Dialog>

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
