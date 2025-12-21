import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import socketService from '@/services/socketService';
import { useSlotStore } from '@/stores/slotStore';

export const useSocketSlots = (freelancerId?: string) => {
  const {
    socketConnected,
    reservedSlots,
    setSocketConnected,
    updateSlotStatus,
    updateMultipleSlots,
    reserveSlot,
    releaseSlot,
    confirmSlotReservation,
  } = useSlotStore();

  const isConnectedRef = useRef(false);
  const freelancerIdRef = useRef(freelancerId);

  // Update ref when freelancerId changes
  useEffect(() => {
    freelancerIdRef.current = freelancerId;
  }, [freelancerId]);

  // Join/leave freelancer slots room when freelancerId changes
  useEffect(() => {
    if (freelancerId && socketService.isSocketConnected()) {
      socketService.joinFreelancerSlots(freelancerId);
    }

    return () => {
      if (freelancerId && socketService.isSocketConnected()) {
        socketService.leaveFreelancerSlots(freelancerId);
      }
    };
  }, [freelancerId]);

  useEffect(() => {
    // Connect to socket service only once
    if (!isConnectedRef.current) {
      socketService.connect();
      isConnectedRef.current = true;
    }

    // Update Zustand state when socket connects/disconnects
    const checkConnection = () => {
      const connected = socketService.isSocketConnected();
      if (connected !== socketConnected) {
        setSocketConnected(connected);
      }
    };

    // Check connection status periodically
    const interval = setInterval(checkConnection, 2000);

    // Listen for socket events
    const handleSlotStatusUpdated = (event: CustomEvent) => {
      // Backend sends: { freelancerId, slot: { id, freelancerId, locationType, startTime, endTime, status, reservedUntil }, timestamp }
      const { slot, freelancerId } = event.detail;
      if (slot?.id) {
        updateSlotStatus(slot.id, {
          status: slot.status,
          isAvailable: slot.status === 'AVAILABLE',
          isReserved: slot.status === 'RESERVED',
          isBooked: slot.status === 'BOOKED',
          canBeReserved: slot.status === 'AVAILABLE',
          statusMessage: `Status: ${slot.status}`,
        });
      }
    };

    const handleMultipleSlotsUpdated = (event: CustomEvent) => {
      // Backend sends: { freelancerId, slots: SlotData[], timestamp }
      const { slots, freelancerId } = event.detail;
      if (Array.isArray(slots)) {
        const updates = slots.map((slot) => ({
          slotId: slot.id,
          statusInfo: {
            status: slot.status,
            isAvailable: slot.status === 'AVAILABLE',
            isReserved: slot.status === 'RESERVED',
            isBooked: slot.status === 'BOOKED',
            canBeReserved: slot.status === 'AVAILABLE',
            statusMessage: `Status: ${slot.status}`,
          },
        }));
        updateMultipleSlots(updates);
      }
    };

    const handleSlotReserved = (event: CustomEvent) => {
      // Backend sends: { freelancerId, slot: SlotData, timestamp }
      const { slot, freelancerId } = event.detail;
      const slotId = slot?.id;

      if (!slotId) {
        console.error('No slotId found in slot-reserved event:', event.detail);
        return;
      }

      // This is a reservation - update slot status to reserved
      updateSlotStatus(slotId, {
        status: slot.status || 'RESERVED',
        isAvailable: false,
        isReserved: true,
        isBooked: false,
        canBeReserved: false,
        statusMessage: 'Reserved by another user',
      });

      // Check if this slot is in our reserved slots (meaning we reserved it)
      const isOurReservation = reservedSlots.includes(slotId);

      if (isOurReservation) {
        // We reserved this slot - update our tracking
        reserveSlot(slotId);
      } else {
        // Someone else reserved this slot - show notification
        toast.info('A slot you were viewing has been reserved by another user.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };

    const handleSlotBooked = (event: CustomEvent) => {
      // Backend sends: { freelancerId, slot: SlotData, timestamp }
      const { slot, freelancerId } = event.detail;
      const slotId = slot?.id;
      if (slotId) {
        updateSlotStatus(slotId, {
          status: slot.status || 'BOOKED',
          isAvailable: false,
          isReserved: false,
          isBooked: true,
          canBeReserved: false,
          statusMessage: 'Booked',
        });
      }
    };

    const handleSlotRemoved = (event: CustomEvent) => {
      // Backend sends: { freelancerId, slotId, timestamp }
      const { slotId, freelancerId } = event.detail;
      if (slotId) {
        updateSlotStatus(slotId, {
          status: 'BOOKED',
          isAvailable: false,
          isReserved: false,
          isBooked: true,
          canBeReserved: false,
          statusMessage: 'Booked',
        });
      }
    };

    const handleSlotReleased = (event: CustomEvent) => {
      // Backend may send different structures, handle both
      const eventData = event.detail;
      const slotId = eventData.slotId ?? eventData.slot?.id ?? eventData.id;

      if (!slotId) {
        console.error('No slotId found in slot-released event:', eventData);
        return;
      }

      // Update slot status to available
      updateSlotStatus(slotId, {
        status: 'AVAILABLE',
        isAvailable: true,
        isReserved: false,
        isBooked: false,
        canBeReserved: true,
        statusMessage: 'Available for booking',
      });

      // Remove from our tracking if it was in our reserved slots
      if (reservedSlots.includes(slotId)) {
        releaseSlot(slotId);
      }
    };

    const handleSlotReservationConfirmed = (event: CustomEvent) => {
      const { slotId } = event.detail;
      if (slotId) {
        confirmSlotReservation(slotId);
      }
    };

    const handleSlotReservationFailed = (event: CustomEvent) => {
      console.error('Slot reservation failed:', event.detail);
    };

    // Add event listeners
    window.addEventListener('slot-status-updated', handleSlotStatusUpdated as EventListener);
    window.addEventListener('multiple-slots-updated', handleMultipleSlotsUpdated as EventListener);
    window.addEventListener('slot-reserved', handleSlotReserved as EventListener);
    window.addEventListener('slot-booked', handleSlotBooked as EventListener);
    window.addEventListener('slot-removed', handleSlotRemoved as EventListener);
    window.addEventListener('slot-released', handleSlotReleased as EventListener);
    window.addEventListener(
      'slot-reservation-confirmed',
      handleSlotReservationConfirmed as EventListener,
    );
    window.addEventListener(
      'slot-reservation-failed',
      handleSlotReservationFailed as EventListener,
    );

    return () => {
      window.removeEventListener('slot-status-updated', handleSlotStatusUpdated as EventListener);
      window.removeEventListener(
        'multiple-slots-updated',
        handleMultipleSlotsUpdated as EventListener,
      );
      window.removeEventListener('slot-reserved', handleSlotReserved as EventListener);
      window.removeEventListener('slot-booked', handleSlotBooked as EventListener);
      window.removeEventListener('slot-removed', handleSlotRemoved as EventListener);
      window.removeEventListener('slot-released', handleSlotReleased as EventListener);
      window.removeEventListener(
        'slot-reservation-confirmed',
        handleSlotReservationConfirmed as EventListener,
      );
      window.removeEventListener(
        'slot-reservation-failed',
        handleSlotReservationFailed as EventListener,
      );
      clearInterval(interval);
    };
  }, [
    socketConnected,
    reservedSlots,
    setSocketConnected,
    updateSlotStatus,
    updateMultipleSlots,
    reserveSlot,
    releaseSlot,
    confirmSlotReservation,
  ]);

  // Reserve a slot
  const reserveSlotLocal = useCallback(
    async (slotId: string, duration: number = 300000) => {
      try {
        // Call API to reserve slot
        await api.post(ENDPOINTS.slots?.reserve ?? `/slots/${slotId}/reserve`, {
          duration,
        });

        // Update local state
        reserveSlot(slotId);
        updateSlotStatus(slotId, {
          status: 'RESERVED',
          isAvailable: false,
          isReserved: true,
          isBooked: false,
          canBeReserved: false,
          statusMessage: 'Reserved by you',
        });

        // Emit socket event using service method
        socketService.reserveSlot(slotId, duration);
      } catch (error) {
        console.error('Failed to reserve slot:', error);
        throw error;
      }
    },
    [reserveSlot, updateSlotStatus],
  );

  // Release a slot reservation
  const releaseSlotLocal = useCallback(
    async (slotId: string) => {
      try {
        // Call API to release slot
        await api.post(ENDPOINTS.slots?.release ?? `/slots/${slotId}/release`);

        // Update local state
        releaseSlot(slotId);
        updateSlotStatus(slotId, {
          status: 'AVAILABLE',
          isAvailable: true,
          isReserved: false,
          isBooked: false,
          canBeReserved: true,
          statusMessage: 'Available for booking',
        });

        // Emit socket event using service method
        socketService.releaseSlot(slotId);
      } catch (error) {
        console.error('Failed to release slot:', error);
        throw error;
      }
    },
    [releaseSlot, updateSlotStatus],
  );

  // Check if a slot is reserved
  const isSlotReserved = useCallback(
    (slotId: string) => {
      return reservedSlots.includes(slotId);
    },
    [reservedSlots],
  );

  return {
    isConnected: socketConnected,
    reservedSlots,
    reserveSlot: reserveSlotLocal,
    releaseSlot: releaseSlotLocal,
    isSlotReserved,
  };
};
