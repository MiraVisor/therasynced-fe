'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { bookingColumns } from '@/components/common/DataTable/columns';
import type { Booking } from '@/components/common/DataTable/columns';
import { DataTable } from '@/components/common/DataTable/data-table';
import DotLoader from '@/components/common/DotLoader';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import RateFreelancerDialog from '@/components/core/Dashboard/UserSide/MyBookings/RateFreelancerDialog';
import { fetchPatientBookings } from '@/redux/slices/bookingSlice';
import { RootState } from '@/redux/store';

const FIRST_TIME_RATING_BANNER_KEY = 'myBookingsFirstTimeRatingBannerDismissed';

export default function MyBookingsPage() {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state: RootState) => state.booking);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  // Banner state: show only for first-time users (localStorage)
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if not dismissed before
    if (!localStorage.getItem(FIRST_TIME_RATING_BANNER_KEY)) {
      setShowBanner(true);
    }
  }, []);

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem(FIRST_TIME_RATING_BANNER_KEY, 'true');
  };

  useEffect(() => {
    dispatch(fetchPatientBookings({ sort: sortOrder }) as any);
  }, [dispatch, sortOrder]);

  // Transform API data to Booking[] for DataTable
  const mappedBookings: Booking[] = Array.isArray(bookings)
    ? bookings.map((b: any) => {
        const slot = b.slot || {};
        const freelancer = slot.freelancer || {};
        // Map rating from new response structure
        const ratingObj = b.freelancerRating;
        // Format date and time from slot.startTime
        let date = '';
        let time = '';
        if (slot.startTime) {
          const d = new Date(slot.startTime);
          date = d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        let status = b.status;
        if (status === 'CONFIRMED') status = 'Confirmed';
        if (status === 'CANCELLED') status = 'Cancelled';
        return {
          id: b.id,
          name: freelancer.name || '-',
          date,
          time,
          email: freelancer.name || '-',
          price: slot.basePrice ?? 0,
          status,
          freelancerId: slot.freelancerId || freelancer.id || '',
          ratings: ratingObj ? ratingObj.rating : null,
          ratingReview: ratingObj ? ratingObj.review : null,
          hasRating: !!ratingObj,
        };
      })
    : [];

  // Row click handler
  const handleRowClick = (booking: Booking) => {
    if (booking.status === 'Confirmed' && !booking.hasRating) {
      setSelectedBooking(booking);
      setRateDialogOpen(true);
    }
  };

  return (
    <DashboardPageWrapper header={<h2 className="text-xl font-semibold">Check Your Bookings</h2>}>
      {showBanner && (
        <div
          className="relative flex items-center justify-between w-full mb-4 px-4 py-2 rounded-lg backdrop-blur-md bg-green-200/60 border border-green-300 shadow-md"
          style={{ minHeight: '40px' }}
        >
          <span className="text-green-900 text-sm font-medium">
            <span className="font-semibold">New:</span> You can now rate your freelancer after your
            session is completed. Simply click on the booking session you wish to rate.
          </span>
          <button
            aria-label="Dismiss banner"
            className="ml-4 p-1 rounded hover:bg-green-300/40 transition-colors"
            onClick={handleDismissBanner}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {loading ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <DotLoader size={14} />
          <span className="mt-2 text-gray-500 text-sm">Loading bookings...</span>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <>
          <DataTable
            columns={bookingColumns}
            data={mappedBookings}
            title="All Bookings"
            searchKey="name"
            searchPlaceholder="Search..."
            enableSorting={true}
            enableFiltering={true}
            enableColumnVisibility={true}
            enablePagination={true}
            pageSize={8}
            pageSizeOptions={[5, 10, 20, 30, 40]}
            onRowClick={handleRowClick}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
          <RateFreelancerDialog
            open={rateDialogOpen}
            onClose={() => setRateDialogOpen(false)}
            freelancerName={selectedBooking?.name || ''}
            freelancerId={selectedBooking?.freelancerId || ''}
            bookingId={selectedBooking?.id || ''}
          />
        </>
      )}
    </DashboardPageWrapper>
  );
}
