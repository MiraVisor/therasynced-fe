'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { EnhancedBookingSearch } from '@/components/core/Dashboard/UserSide/Booking/EnhancedBookingSearch';

/**
 * Enhanced Booking Page
 *
 * Clean booking flow with search by name, location, or date.
 * Full booking flow integrated: search → select freelancer → date → time → service → location → confirm
 */
export default function EnhancedBookingPage() {
  return (
    <DashboardPageWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-mint/5 via-white to-primary/5 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-charcoal mb-4">
              Book an Appointment
            </h1>
            <p className="text-lg text-gray-600 font-inter max-w-2xl mx-auto">
              Search by name, location, or browse by date to find and book with your preferred
              freelancer
            </p>
          </div>
        </div>

        {/* Enhanced Search Component */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EnhancedBookingSearch />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
