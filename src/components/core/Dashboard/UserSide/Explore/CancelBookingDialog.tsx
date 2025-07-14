import React, { useState } from 'react';

import DotLoader from '@/components/common/DotLoader';
import { Button } from '@/components/ui/button';

interface CancelBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

const CancelBookingDialog: React.FC<CancelBookingDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
}) => {
  const [reason, setReason] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Cancel Booking</h2>
        <label className="block mb-2 text-sm font-medium text-gray-700">Reason (optional)</label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-4 min-h-[80px]"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter a reason for cancellation (optional)"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)} disabled={loading}>
            {loading ? <DotLoader size={12} /> : 'Cancel Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingDialog;
