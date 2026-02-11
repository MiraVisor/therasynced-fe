'use client';

import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { TabbedSlotsView } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/TabbedSlotsView';
import { WeeklyCalendarGrid } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/WeeklyCalendarGrid';
import { Button } from '@/components/ui/button';
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
import { useDeleteSlot, useMySlots, useSlotStats } from '@/hooks/queries/useSlots';
import { useAuth } from '@/hooks/useAuthZustand';
import { Slot } from '@/types/types';

const SlotsPage = () => {
  const { role } = useAuth();

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  // UI state
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Data hooks
  const { data: slotStats, isLoading: isLoadingStats, error: statsError } = useSlotStats();
  const { mutate: deleteSlotMutation } = useDeleteSlot();

  // Get slots for the current week view
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const { data: weekSlots = [], isLoading: isLoadingSlots } = useMySlots({
    page: 1,
    limit: 500,
    weekStart: format(currentWeekStart, "yyyy-MM-dd'T'00:00:00"),
    weekEnd: format(weekEnd, "yyyy-MM-dd'T'23:59:59"),
    sortBy: 'startTime',
    sortOrder: 'asc',
  });

  // Show error toast only when no cached data exists
  useEffect(() => {
    if (statsError && !slotStats) {
      const errorMessage =
        statsError instanceof Error ? statsError.message : 'Failed to load slot stats';
      toast.error(errorMessage);
    }
  }, [statsError, slotStats]);

  const handleDeleteFromDialog = (slotId: string) => {
    setShowDetailsDialog(false);
    setSelectedSlot(null);
    deleteSlotMutation(slotId);
  };

  const handleDeleteSlot = () => {
    if (!selectedSlot) return;
    setShowDeleteDialog(false);
    deleteSlotMutation(selectedSlot.id, {
      onSuccess: () => {
        setSelectedSlot(null);
      },
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart((prev) => (direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)));
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const isCurrentWeek = useMemo(() => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  }, [currentWeekStart]);

  // Use API stats
  const displayStats = useMemo(() => {
    if (slotStats) {
      return {
        total: slotStats.totalSlots || 0,
        booked: slotStats.bookedSlots || 0,
        available: slotStats.availableSlots || 0,
        revenue: slotStats.revenue || 0,
      };
    }
    return { total: 0, booked: 0, available: 0, revenue: 0 };
  }, [slotStats]);

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-poppins font-bold text-charcoal">My Slots</h2>
              <p className="font-inter text-muted-foreground mt-1">
                View and manage your time slots
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/availability">
                <Plus className="h-4 w-4 mr-2" />
                Create Slots
              </Link>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <EnhancedStatCard
            title="Total Slots"
            value={displayStats.total.toString()}
            loading={isLoadingStats && !slotStats}
            simple
          />
          <EnhancedStatCard
            title="Booked"
            value={displayStats.booked.toString()}
            loading={isLoadingStats && !slotStats}
            simple
          />
          <EnhancedStatCard
            title="Available"
            value={displayStats.available.toString()}
            loading={isLoadingStats && !slotStats}
            simple
          />
          <EnhancedStatCard
            title="Revenue"
            value={`EUR ${displayStats.revenue.toFixed(2)}`}
            loading={isLoadingStats && !slotStats}
            simple
          />
        </div>

        {/* Week Navigation and Calendar Grid */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-poppins">Weekly Overview</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={isCurrentWeek ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={goToThisWeek}
                  className="min-w-[180px]"
                >
                  {isCurrentWeek
                    ? 'This Week'
                    : `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`}
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WeeklyCalendarGrid
              weekStart={currentWeekStart}
              slots={weekSlots}
              isLoading={isLoadingSlots}
            />
          </CardContent>
        </Card>

        {/* Slots List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-poppins">All Slots</CardTitle>
            <CardDescription>View and manage all your time slots</CardDescription>
          </CardHeader>
          <CardContent>
            <TabbedSlotsView />
          </CardContent>
        </Card>
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
            // React Query will automatically refetch
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
    </DashboardPageWrapper>
  );
};

export default SlotsPage;
