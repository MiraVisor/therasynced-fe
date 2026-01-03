'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { SlotDetailsDialog } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/SlotDetailsDialog';
import { TabbedSlotsView } from '@/components/core/Dashboard/FreelancerSide/SlotManagement/TabbedSlotsView';
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
import { useDeleteSlot, useSlotStats } from '@/hooks/queries/useSlots';
import { useAuth } from '@/hooks/useAuthZustand';
import { Slot } from '@/types/types';

const SlotsPage = () => {
  const { role } = useAuth();

  // Use React Query hooks
  const { data: slotStats, isLoading: isLoadingStats, error: statsError } = useSlotStats();
  const { mutate: deleteSlotMutation } = useDeleteSlot();

  // Show error toast only when no cached data exists
  useEffect(() => {
    if (statsError && !slotStats) {
      const errorMessage =
        statsError instanceof Error ? statsError.message : 'Failed to load slot stats';
      toast.error(errorMessage);
    }
  }, [statsError, slotStats]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col gap-2 w-full">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-charcoal">My Slots</h2>
            <p className="font-inter text-muted-foreground mt-1">View and manage your time slots</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-0">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <EnhancedStatCard
            title="Total Slots"
            value={displayStats.total.toString()}
            loading={isLoadingStats && !slotStats}
          />
          <EnhancedStatCard
            title="Booked"
            value={displayStats.booked.toString()}
            loading={isLoadingStats && !slotStats}
          />
          <EnhancedStatCard
            title="Available"
            value={displayStats.available.toString()}
            loading={isLoadingStats && !slotStats}
          />
          <EnhancedStatCard
            title="Revenue"
            value={`EUR ${displayStats.revenue.toFixed(2)}`}
            loading={isLoadingStats && !slotStats}
          />
        </div>

        {/* Tabbed Slots View */}
        <TabbedSlotsView />
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
    </DashboardPageWrapper>
  );
};

export default SlotsPage;
