'use client';

import { useState } from 'react';

import { StampDetail } from './StampDetail';
import { StampSummary } from './StampSummary';

export default function StampsManagement() {
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [viewingStampDetail, setViewingStampDetail] = useState(false);

  const handleViewStampDetail = (therapistId: string) => {
    setSelectedTherapistId(therapistId);
    setViewingStampDetail(true);
  };

  const handleBackToStamps = () => {
    setViewingStampDetail(false);
    setSelectedTherapistId(null);
  };

  // If viewing stamp detail, show detail view
  if (viewingStampDetail && selectedTherapistId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Stamp Details</h2>
            <p className="text-gray-600">View your stamp progress with this freelancer</p>
          </div>
        </div>
        <StampDetail therapistId={selectedTherapistId} onBack={handleBackToStamps} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Freelancer Stamps</h2>
          <p className="text-gray-600">
            Earn stamps with each appointment and unlock discounts on future bookings
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">How Stamps Work</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Earn 1 stamp for each completed appointment with a freelancer</li>
            <li>When you reach the target number of stamps, you&apos;ll unlock a discount</li>
            <li>The discount is automatically applied to your next booking with that freelancer</li>
            <li>After using your reward, stamps reset and you can earn them again</li>
          </ul>
        </div>
      </div>

      <StampSummary onViewDetail={handleViewStampDetail} />
    </div>
  );
}
