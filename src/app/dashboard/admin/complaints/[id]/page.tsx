'use client';

import { AlertTriangle, Ban, Mail, Shield } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DocumentPreview } from '@/components/core/Dashboard/AdminSide/Components/DocumentPreview';
import { ProfileCard } from '@/components/core/Dashboard/AdminSide/Components/ProfileCard';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import {
  Timeline,
  type TimelineEvent,
} from '@/components/core/Dashboard/AdminSide/Components/Timeline';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ComplaintDetailSkeleton } from '@/components/ui/skeletons/ComplaintDetailSkeleton';
import { Textarea } from '@/components/ui/textarea';
import adminComplaintService, {
  type TakeActionDto,
  type UpdateComplaintStatusDto,
} from '@/services/adminComplaintService';
import { Complaint, ComplaintStatus } from '@/types/types';

const ComplaintDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<ComplaintStatus>('PENDING');
  const [adminResponse, setAdminResponse] = useState('');
  const [actionType, setActionType] = useState<'WARN' | 'SUSPEND'>('WARN');
  const [actionReason, setActionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState(7);

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetails();
    }
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const response = await adminComplaintService.getDetails(complaintId);
      if (response.success) {
        const data = response.data;
        setComplaint(data);
        setStatus(data.status);
        setAdminResponse(data.adminResponse || '');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch complaint details');
      router.push('/dashboard/admin/complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!complaint) return;
    try {
      setIsSubmitting(true);
      const updateData: UpdateComplaintStatusDto = {
        status,
        adminNotes: adminResponse || undefined,
      };
      const response = await adminComplaintService.updateStatus(complaint.id, updateData);
      if (response.success) {
        toast.success('Complaint status updated successfully');
        setIsStatusDialogOpen(false);
        fetchComplaintDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update complaint status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTakeAction = async () => {
    if (!complaint) return;
    try {
      setIsSubmitting(true);
      const actionData: TakeActionDto = {
        action: actionType,
        reason: actionReason,
        duration: actionType === 'SUSPEND' ? suspensionDays : undefined,
      };
      const response = await adminComplaintService.takeAction(complaint.id, actionData);
      if (response.success) {
        toast.success(
          `User ${actionType === 'WARN' ? 'warned' : 'suspended'} successfully. Email sent.`,
        );
        setIsActionDialogOpen(false);
        setActionReason('');
        fetchComplaintDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to take action');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Complaint Details</h1>
        }
      >
        <ComplaintDetailSkeleton />
      </DashboardPageWrapper>
    );
  }

  if (!complaint) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Complaint Details</h1>
        }
      >
        <EnhancedCard variant="default" className="p-6 text-center">
          <p className="font-open-sans text-base text-muted-foreground">Complaint not found</p>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/admin/complaints')}
            className="mt-4"
          >
            Back to Complaints
          </Button>
        </EnhancedCard>
      </DashboardPageWrapper>
    );
  }

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Complaint Submitted',
      description: `Reported by ${complaint.reporter.name}`,
      timestamp: complaint.createdAt,
      status: 'completed',
    },
    ...(complaint.status !== 'PENDING'
      ? [
          {
            id: '2',
            title: `Status Updated to ${complaint.status}`,
            timestamp: complaint.updatedAt,
            status:
              complaint.status === 'RESOLVED'
                ? 'completed'
                : complaint.status === 'DISMISSED'
                  ? 'rejected'
                  : 'pending',
          } as TimelineEvent,
        ]
      : []),
  ];

  const canTakeAction = complaint.status === 'PENDING' || complaint.status === 'UNDER_REVIEW';

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Complaint Details</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard/admin/complaints')}>
            Back to Complaints
          </Button>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Status and Actions Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <StatusBadge status={complaint.status} size="lg" />
            <Badge variant="outline" className="font-inter capitalize">
              {complaint.category.replace(/_/g, ' ').toLowerCase()}
            </Badge>
          </div>
          <div className="flex gap-2">
            {canTakeAction && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(true)}
                  className="font-inter"
                >
                  Update Status
                </Button>
                <Button onClick={() => setIsActionDialogOpen(true)} className="font-inter">
                  <Shield className="h-4 w-4 mr-2" />
                  Take Action
                </Button>
              </>
            )}
          </div>
        </div>

        {/* User Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileCard
            id={complaint.reporter.id}
            name={complaint.reporter.name}
            email={complaint.reporter.email}
            showRole={false}
            className="cursor-pointer"
            onClick={() => {
              // Navigate to user profile if needed
            }}
          />
          <ProfileCard
            id={complaint.reportedUser.id}
            name={complaint.reportedUser.name}
            email={complaint.reportedUser.email}
            role={complaint.reportedUser.role}
            className="cursor-pointer"
            onClick={() => {
              // Navigate to user profile if needed
            }}
          />
        </div>

        {/* Complaint Details */}
        <EnhancedCard variant="default" className="p-6">
          <h2 className="font-poppins text-lg font-semibold text-foreground mb-4">
            Complaint Information
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="font-inter font-medium text-sm text-muted-foreground">Reason</Label>
              <p className="font-inter font-medium text-base text-foreground mt-1">
                {complaint.reason}
              </p>
            </div>
            <Separator />
            <div>
              <Label className="font-inter font-medium text-sm text-muted-foreground">
                Description
              </Label>
              <p className="font-open-sans text-base text-foreground mt-1 whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>
            {complaint.evidence && complaint.evidence.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="font-inter font-medium text-sm text-muted-foreground mb-2 block">
                    Evidence ({complaint.evidence.length} file
                    {complaint.evidence.length > 1 ? 's' : ''})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {complaint.evidence.map((url, index) => (
                      <DocumentPreview key={index} url={url} fileName={`Evidence ${index + 1}`} />
                    ))}
                  </div>
                </div>
              </>
            )}
            {complaint.adminResponse && (
              <>
                <Separator />
                <div>
                  <Label className="font-inter font-medium text-sm text-muted-foreground">
                    Admin Response
                  </Label>
                  <p className="font-open-sans text-base text-foreground mt-1 whitespace-pre-wrap">
                    {complaint.adminResponse}
                  </p>
                </div>
              </>
            )}
          </div>
        </EnhancedCard>

        {/* Timeline */}
        <EnhancedCard variant="default" className="p-6">
          <h2 className="font-poppins text-lg font-semibold text-foreground mb-4">
            Complaint Timeline
          </h2>
          <Timeline events={timelineEvents} />
        </EnhancedCard>

        {/* Update Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                Update Complaint Status
              </DialogTitle>
              <DialogDescription className="font-open-sans">
                Update the status of this complaint
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status" className="font-inter font-medium">
                  Status *
                </Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as ComplaintStatus)}
                >
                  <SelectTrigger className="font-open-sans mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="DISMISSED">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="adminResponse" className="font-inter font-medium">
                  Admin Response (Optional)
                </Label>
                <Textarea
                  id="adminResponse"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Add notes or response..."
                  className="font-open-sans mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Take Action Dialog */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">Take Action on User</DialogTitle>
              <DialogDescription className="font-open-sans">
                {actionType === 'WARN'
                  ? 'Send a warning email to the reported user'
                  : 'Suspend the reported user account'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="actionType" className="font-inter font-medium">
                  Action Type *
                </Label>
                <Select
                  value={actionType}
                  onValueChange={(value) => setActionType(value as 'WARN' | 'SUSPEND')}
                >
                  <SelectTrigger className="font-open-sans mt-2">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WARN">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Warn User
                      </div>
                    </SelectItem>
                    <SelectItem value="SUSPEND">
                      <div className="flex items-center gap-2">
                        <Ban className="h-4 w-4 text-error" />
                        Suspend User
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {actionType === 'SUSPEND' && (
                <div>
                  <Label htmlFor="suspensionDays" className="font-inter font-medium">
                    Suspension Duration (Days) *
                  </Label>
                  <Select
                    value={suspensionDays.toString()}
                    onValueChange={(value) => setSuspensionDays(parseInt(value))}
                  >
                    <SelectTrigger className="font-open-sans mt-2">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="actionReason" className="font-inter font-medium">
                  Reason for Action *
                </Label>
                <Textarea
                  id="actionReason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Explain why you are ${actionType === 'WARN' ? 'warning' : 'suspending'} this user...`}
                  className="font-open-sans mt-2"
                  rows={4}
                  required
                />
              </div>
              <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                <p className="font-open-sans text-sm text-foreground">
                  <Mail className="h-4 w-4 inline mr-2" />
                  An email notification will be sent to {complaint.reportedUser.name} (
                  {complaint.reportedUser.email})
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsActionDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTakeAction}
                disabled={isSubmitting || !actionReason}
                variant={actionType === 'SUSPEND' ? 'destructive' : 'default'}
              >
                {isSubmitting
                  ? 'Processing...'
                  : actionType === 'WARN'
                    ? 'Send Warning'
                    : 'Suspend User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default ComplaintDetailPage;
