'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Dummy Data Type
type ReviewRequest = {
  id: string;
  therapistName: string;
  submittedAt: string;
  type: 'review' | 'report';
  status: 'pending' | 'approved' | 'rejected';
};

// Dummy Data
const dummyData: ReviewRequest[] = [
  {
    id: '1',
    therapistName: 'Dr. Sarah Khan',
    submittedAt: '2025-10-01',
    type: 'review',
    status: 'pending',
  },
  {
    id: '2',
    therapistName: 'Dr. Adeel Ahmed',
    submittedAt: '2025-10-03',
    type: 'report',
    status: 'approved',
  },
];

// Modal State Type
type ModalState = {
  open: boolean;
  request?: ReviewRequest;
};

// Column Definitions
const reviewColumns = (openModal: (row: ReviewRequest) => void): ColumnDef<ReviewRequest>[] => [
  {
    accessorKey: 'therapistName',
    header: 'Therapist',
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted On',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const color =
        status === 'approved'
          ? 'bg-green-100 text-green-800'
          : status === 'rejected'
          ? 'bg-red-100 text-red-800'
          : 'bg-yellow-100 text-yellow-800';
      return <Badge className={`px-3 py-1 rounded-md ${color}`}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button variant="outline" onClick={() => openModal(row.original)} className="text-sm">
        <Eye className="h-4 w-4 mr-1" />
        Review
      </Button>
    ),
  },
];

export default function AdminReviewApprovalsPage() {
  const [modal, setModal] = useState<ModalState>({ open: false });

  const openModal = (request: ReviewRequest) => setModal({ open: true, request });
  const closeModal = () => setModal({ open: false });

  return (
    <DashboardPageWrapper
      header={<h2 className="text-xl font-semibold text-black">Review & Report Approvals</h2>}
    >
      <DataTable
        columns={reviewColumns(openModal)}
        data={dummyData}
        title="Pending Approvals"
        searchKey="therapistName"
        searchPlaceholder="Search therapists..."
        enableSorting
        enableFiltering
        enablePagination
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
      />

      <Dialog open={modal.open} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>Name:</strong> {modal.request?.therapistName}</p>
            <p><strong>Type:</strong> {modal.request?.type}</p>
            <p><strong>Submitted:</strong> {modal.request?.submittedAt}</p>
            <p className="text-sm text-gray-600 italic">* Here you could show full review/report content *</p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="destructive" onClick={closeModal}>Reject</Button>
            <Button onClick={closeModal}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
}
