import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { reserveSlot } from '@/redux/api/overviewApi';
import {
  clearReservedSlots,
  confirmSlotReservation,
  releaseSlotReservation,
  setSocketConnected,
  updateMultipleSlots,
  updateSlotStatus,
} from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import socketService from '@/services/socketService';

export const useSocketSlots = (freelancerId?: string) => {
  const dispatch = useDispatch();
  const { socketConnected, reservedSlots } = useSelector((state: RootState) => state.overview);
  const isConnectedRef = useRef(false);
  const freelancerIdRef = useRef(freelancerId);

  // Update ref when freelancerId changes
  useEffect(() => {
    freelancerIdRef.current = freelancerId;
  }, [freelancerId]);

  useEffect(() => {
    // Connect to socket service only once
    if (!isConnectedRef.current) {
      socketService.connect();
      isConnectedRef.current = true;
    }

    // Update Redux state when socket connects/disconnects
    const checkConnection = () => {
      const connected = socketService.isSocketConnected();
      if (connected !== socketConnected) {
        dispatch(setSocketConnected(connected));
      }
    };

    // Check connection status periodically
    const interval = setInterval(checkConnection, 2000);

    // Listen for socket events
    const handleSlotStatusUpdated = (event: CustomEvent) => {
      dispatch(updateSlotStatus(event.detail));
    };

    const handleMultipleSlotsUpdated = (event: CustomEvent) => {
      dispatch(updateMultipleSlots(event.detail));
    };

    const handleSlotReserved = (event: CustomEvent) => {
      console.log('=== SLOT RESERVED EVENT ===');
      console.log('Full event:', event);
      console.log('Event detail:', event.detail);
      console.log('Event detail type:', typeof event.detail);
      console.log('Event detail keys:', Object.keys(event.detail || {}));
      console.log('Current reserved slots:', reservedSlots);

      // Handle different possible data structures from backend
      const eventData = event.detail;
      const slotId = eventData.slotId || eventData.slot?.id || eventData.id;
      const statusInfo = eventData.statusInfo;

      console.log('Extracted slotId:', slotId);
      console.log('Slot status from event:', eventData.slot?.status);
      console.log('StatusInfo from event:', statusInfo);

      if (!slotId) {
        console.error('No slotId found in slot-reserved event:', eventData);
        return;
      }

      // This is a reservation - update slot status to reserved
      dispatch(
        updateSlotStatus({
          slotId,
          status: 'RESERVED',
          isBooked: false, // Reservations are not booked
          statusInfo: statusInfo || {
            status: 'RESERVED',
            isAvailable: false,
            isReserved: true,
            isBooked: false,
            canBeReserved: false,
            statusMessage: 'Reserved by another user',
          },
        }),
      );

      // Check if this slot is in our reserved slots (meaning we reserved it)
      const isOurReservation = reservedSlots.includes(slotId);

      if (isOurReservation) {
        // We reserved this slot - update our tracking
        dispatch(reserveSlot(slotId) as any);
      } else {
        // Someone else reserved this slot - show notification
        toast.info('A slot you were viewing has been reserved by another user.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };

    // NEW: Handle slot booked event
    const handleSlotBooked = (event: CustomEvent) => {
      console.log('Slot booked event received:', event.detail);
      const { slotId, statusInfo } = event.detail;
      dispatch(
        updateSlotStatus({
          slotId: slotId || event.detail.slot?.id,
          status: 'BOOKED',
          isBooked: true,
          statusInfo: statusInfo || {
            status: 'BOOKED',
            isAvailable: false,
            isReserved: false,
            isBooked: true,
            canBeReserved: false,
            statusMessage: 'Booked',
          },
        }),
      );
    };

    // NEW: Handle slot removed event
    const handleSlotRemoved = (event: CustomEvent) => {
      console.log('Slot removed event received:', event.detail);
      const { slotId, statusInfo } = event.detail;
      dispatch(
        updateSlotStatus({
          slotId: slotId || event.detail.slotId,
          status: 'BOOKED',
          isBooked: true,
          statusInfo: statusInfo || {
            status: 'BOOKED',
            isAvailable: false,
            isReserved: false,
            isBooked: true,
            canBeReserved: false,
            statusMessage: 'Booked',
          },
        }),
      );
    };

    // Handle slot released event
    const handleSlotReleased = (event: CustomEvent) => {
      console.log('Slot released event received:', event.detail);
      const eventData = event.detail;
      const slotId = eventData.slotId || eventData.slot?.id || eventData.id;
      const statusInfo = eventData.statusInfo;

      if (!slotId) {
        console.error('No slotId found in slot-released event:', eventData);
        return;
      }

      // Update slot status to available
      dispatch(
        updateSlotStatus({
          slotId,
          status: 'AVAILABLE',
          isBooked: false,
          statusInfo: statusInfo || {
            status: 'AVAILABLE',
            isAvailable: true,
            isReserved: false,
            isBooked: false,
            canBeReserved: true,
            statusMessage: 'Available for booking',
          },
        }),
      );

      // Remove from our tracking if it was in our reserved slots
      if (reservedSlots.includes(slotId)) {
        dispatch(releaseSlotReservation({ slotId }));
      }
    };

    const handleSlotReservationConfirmed = (event: CustomEvent) => {
      console.log('=== SLOT RESERVATION CONFIRMED ===');
      console.log('Event detail:', event.detail);
      dispatch(confirmSlotReservation(event.detail));
    };

    const handleSlotReservationFailed = (event: CustomEvent) => {
      console.error('Slot reservation failed:', event.detail);
      // Optionally show a toast notification
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
      clearInterval(interval);
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
    };
  }, [dispatch, reservedSlots]);

  useEffect(() => {
    // Join freelancer slots room when freelancerId is provided and socket is connected
    if (freelancerId && socketService.isSocketConnected()) {
      socketService.joinFreelancerSlots(freelancerId);
    }

    // Leave room when freelancerId changes or component unmounts
    return () => {
      if (freelancerId) {
        socketService.leaveFreelancerSlots(freelancerId);
      }
    };
  }, [freelancerId]);

  // Slot reservation functions - memoized to prevent unnecessary re-renders
  const reserveSlotForUser = useCallback((slotId: string, duration: number = 300000) => {
    socketService.reserveSlot(slotId, duration);
  }, []);

  const releaseSlotForUser = useCallback(
    (slotId: string) => {
      socketService.releaseSlot(slotId);
      dispatch(releaseSlotReservation({ slotId }));
    },
    [dispatch],
  );

  const clearAllReservations = useCallback(() => {
    // Release all reserved slots
    reservedSlots.forEach((slotId) => {
      socketService.releaseSlot(slotId);
    });
    dispatch(clearReservedSlots());
  }, [reservedSlots, dispatch]);

  const isSlotReserved = useCallback(
    (slotId: string) => {
      return reservedSlots.includes(slotId);
    },
    [reservedSlots],
  );

  return {
    socketConnected,
    isConnected: socketService.isSocketConnected(),
    reservedSlots,
    reserveSlot: reserveSlotForUser,
    releaseSlot: releaseSlotForUser,
    clearAllReservations,
    isSlotReserved,
  };
};
