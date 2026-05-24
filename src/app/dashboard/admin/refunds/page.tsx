'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle2, Clock, Eye, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import refundService, { RefundRequest } from '@/services/refundService';
import { useAuthStore } from '@/stores/authStore';

export default function AdminRefundsPage() {
  const { role } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Fetch refund requests
  const { data: allRequests, isLoading } = useQuery({
    queryKey: ['refundRequests', activeTab],
    queryFn: async () => {
      const status =
        activeTab === 'all'
          ? undefined
          : (activeTab.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED');
      const response = await refundService.adminGetAll(status);
      return response.data as RefundRequest[];
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      refundService.adminApprove(id, { adminNotes: adminNotes.trim() || undefined }),
    onSuccess: () => {
      toast.success('Refund request approved and processed successfully');
      setIsApproveDialogOpen(false);
      setAdminNotes('');
      queryClient.invalidateQueries({ queryKey: ['refundRequests'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to approve refund request');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      refundService.adminReject(id, { adminNotes: rejectionReason.trim() }),
    onSuccess: () => {
      toast.success('Refund request rejected');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['refundRequests'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reject refund request');
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      PENDING: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800  ',
        icon: Clock,
      },
      APPROVED: {
        label: 'Approved',
        className: 'bg-green-100 text-green-800  ',
        icon: CheckCircle2,
      },
      REJECTED: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-800  ',
        icon: XCircle,
      },
      PROCESSED: {
        label: 'Processed',
        className: 'bg-blue-100 text-blue-800  ',
        icon: CheckCircle2,
      },
    };

    const config = statusConfig[status] ?? statusConfig['PENDING'];
    const Icon = config?.icon ?? Clock;

    return (
      <Badge className={config?.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config?.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `EUR ${amount.toFixed(2)}`;
  };

  const handleViewDetails = (request: RefundRequest) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const handleApprove = (request: RefundRequest) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setIsApproveDialogOpen(true);
  };

  const handleReject = (request: RefundRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const stats = {
    total: allRequests?.length || 0,
    pending: allRequests?.filter((r) => r.status === 'PENDING').length || 0,
    approved: allRequests?.filter((r) => r.status === 'APPROVED').length || 0,
    rejected: allRequests?.filter((r) => r.status === 'REJECTED').length || 0,
  };

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col sm:flex-row w-full items-start gap-4">
          <div className="flex-shrink-0">
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Refund Requests</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and process refund requests from freelancers
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Requests</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : !allRequests || allRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No refund requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allRequests.map((request) => (
                      <Card key={request.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">
                                  {request.freelancer?.name || 'Unknown Freelancer'}
                                </h3>
                                {getStatusBadge(request.status)}
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <strong>Invoice:</strong> {request.invoiceId}
                                </p>
                                <p>
                                  <strong>Amount:</strong> {formatCurrency(request.amount)}
                                </p>
                                <p>
                                  <strong>Reason:</strong> {request.reason}
                                </p>
                                <p>
                                  <strong>Submitted:</strong>{' '}
                                  {format(new Date(request.createdAt), 'PPp')}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(request)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {request.status === 'PENDING' && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApprove(request)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleReject(request)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Details Dialog */}
        {selectedRequest && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Refund Request Details</DialogTitle>
                <DialogDescription>Invoice: {selectedRequest.invoiceId}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Freelancer</Label>
                  <p className="font-semibold">{selectedRequest.freelancer?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.freelancer?.email}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-semibold">{formatCurrency(selectedRequest.amount)}</p>
                </div>
                <div>
                  <Label>Reason</Label>
                  <p>{selectedRequest.reason}</p>
                </div>
                {selectedRequest.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>
                )}
                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div>
                    <Label>Attachments</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {selectedRequest.attachments.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => window.open(url, '_blank')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              window.open(url, '_blank');
                            }
                          }}
                          className="w-full h-32 rounded-md border overflow-hidden cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label={`View attachment ${index + 1}`}
                        >
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRequest.adminNotes && (
                  <div>
                    <Label>Admin Notes</Label>
                    <p className="whitespace-pre-wrap">{selectedRequest.adminNotes}</p>
                  </div>
                )}
                {selectedRequest.stripeRefundId && (
                  <div>
                    <Label>Stripe Refund ID</Label>
                    <p className="font-mono text-sm">{selectedRequest.stripeRefundId}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Approve Dialog */}
        {selectedRequest && (
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Refund Request</DialogTitle>
                <DialogDescription>
                  This will process the refund through Stripe. Amount:{' '}
                  {formatCurrency(selectedRequest.amount)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Admin Notes (Optional)</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(selectedRequest.id)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve & Process
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Reject Dialog */}
        {selectedRequest && (
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Refund Request</DialogTitle>
                <DialogDescription>
                  Provide a reason for rejecting this refund request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this refund request is being rejected..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(selectedRequest.id)}
                    disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  >
                    {rejectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardPageWrapper>
  );
}
