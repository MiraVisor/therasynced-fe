'use client';

import { format } from 'date-fns';
import { AlertCircle, Award, CheckCircle, Clock, MapPin, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { ConfirmationDialog } from '@/components/core/Dashboard/AdminSide/Components/ConfirmationDialog';
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
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import adminVerificationService, {
  type VerificationDetailsResponse,
} from '@/services/adminVerificationService';

const VerificationDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const freelancerId = Array.isArray(id) ? id[0] : id;

  const [verification, setVerification] = useState<VerificationDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCertificateApproveDialogOpen, setIsCertificateApproveDialogOpen] = useState(false);
  const [isCertificateRejectDialogOpen, setIsCertificateRejectDialogOpen] = useState(false);
  const [certificateRejectionReason, setCertificateRejectionReason] = useState('');
  const [isCertificateSubmitting, setIsCertificateSubmitting] = useState(false);

  useEffect(() => {
    if (freelancerId) {
      fetchVerificationDetails();
    }
  }, [freelancerId]);

  const fetchVerificationDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminVerificationService.getDetails(freelancerId);
      if (response.success) {
        setVerification(response.data);
      } else {
        setError('Failed to load verification details');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch verification details');
      toast.error(error.message || 'Failed to fetch verification details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!verification) return;
    try {
      setIsSubmitting(true);
      const response = await adminVerificationService.approve({
        freelancerId: verification.id,
      });
      if (response.success) {
        toast.success('Verification approved successfully');
        setIsApproveDialogOpen(false);
        fetchVerificationDetails();
        router.push('/dashboard/admin/verifications');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!verification || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await adminVerificationService.reject({
        freelancerId: verification.id,
        rejectionReason: rejectionReason.trim(),
      });
      if (response.success) {
        toast.success('Verification rejected successfully');
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        fetchVerificationDetails();
        router.push('/dashboard/admin/verifications');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveCertificate = async () => {
    if (!verification) return;
    try {
      setIsCertificateSubmitting(true);
      const response = await adminVerificationService.approveCertificate({
        freelancerId: verification.id,
      });
      if (response.success) {
        toast.success('First Aid Certificate approved successfully');
        setIsCertificateApproveDialogOpen(false);
        fetchVerificationDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve certificate');
    } finally {
      setIsCertificateSubmitting(false);
    }
  };

  const handleRejectCertificate = async () => {
    if (!verification || !certificateRejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      setIsCertificateSubmitting(true);
      const response = await adminVerificationService.rejectCertificate({
        freelancerId: verification.id,
        rejectionReason: certificateRejectionReason.trim(),
      });
      if (response.success) {
        toast.success('First Aid Certificate rejected successfully');
        setIsCertificateRejectDialogOpen(false);
        setCertificateRejectionReason('');
        fetchVerificationDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject certificate');
    } finally {
      setIsCertificateSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Details</h1>
        }
      >
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

  if (error || !verification) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Details</h1>
        }
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-error mb-4" />
            <p className="font-open-sans text-lg text-foreground mb-4">
              {error || 'Verification not found'}
            </p>
            <Button variant="outline" onClick={() => router.push('/dashboard/admin/verifications')}>
              Back to Verifications
            </Button>
          </div>
        </div>
      </DashboardPageWrapper>
    );
  }

  const timelineEvents: TimelineEvent[] = [
    {
      id: 'verification-requested',
      title: 'Verification Requested',
      description: `Freelancer ${verification.name} submitted verification request`,
      timestamp: verification.verificationRequestedAt || new Date().toISOString(),
      status: 'completed' as const,
      icon: <Clock className="h-5 w-5 text-info" />,
    },
    ...(verification.verificationApprovedAt
      ? [
          {
            id: 'verification-approved',
            title: 'Verification Approved',
            description: 'Verification has been approved',
            timestamp: verification.verificationApprovedAt,
            status: 'completed' as const,
            icon: <CheckCircle className="h-5 w-5 text-success" />,
          },
        ]
      : []),
    ...(verification.verificationRejectedAt
      ? [
          {
            id: 'verification-rejected',
            title: 'Verification Rejected',
            description:
              verification.verificationRejectionReason || 'Verification has been rejected',
            timestamp: verification.verificationRejectedAt,
            status: 'rejected' as const,
            icon: <XCircle className="h-5 w-5 text-error" />,
          },
        ]
      : []),
  ];

  const canApproveOrReject = verification.verificationStatus === 'PENDING';

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Details</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard/admin/verifications')}>
            Back to Queue
          </Button>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Status Header */}
        <EnhancedCard variant="default" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusBadge status={verification.verificationStatus} size="lg" />
              <div>
                <h2 className="font-poppins text-xl font-semibold text-foreground">
                  {verification.name}
                </h2>
                <p className="font-open-sans text-sm text-muted-foreground">{verification.email}</p>
              </div>
            </div>
            {canApproveOrReject && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(true)}
                  className="text-error border-error hover:bg-error/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => setIsApproveDialogOpen(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </EnhancedCard>

        {/* Profile Information */}
        <EnhancedCard variant="default" className="p-6">
          <h3 className="font-poppins text-lg font-semibold text-foreground mb-4">
            Profile Information
          </h3>
          <ProfileCard
            id={verification.id}
            name={verification.name}
            email={verification.email}
            profilePicture={verification.profilePicture}
            showRole={false}
          />
        </EnhancedCard>

        {/* Verification Documents */}
        {verification.verificationDocuments && verification.verificationDocuments.length > 0 && (
          <EnhancedCard variant="default" className="p-6">
            <h3 className="font-poppins text-lg font-semibold text-foreground mb-4">
              Verification Documents ({verification.verificationDocuments.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verification.verificationDocuments.map((doc, index) => (
                <DocumentPreview
                  key={doc.id || index}
                  url={doc.url}
                  fileName={`${doc.type || 'Document'} ${index + 1}`}
                />
              ))}
            </div>
          </EnhancedCard>
        )}

        {/* First Aid Certificate */}
        <EnhancedCard variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-poppins text-lg font-semibold text-foreground">
              First Aid Certificate
            </h3>
            {verification.firstAidCertificate ? (
              <StatusBadge status={verification.firstAidCertificate.status} size="sm" />
            ) : (
              <Badge variant="outline" className="font-inter text-xs">
                Not Uploaded
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {verification.firstAidCertificate ? (
              <>
                <DocumentPreview
                  url={verification.firstAidCertificate.url}
                  fileName="First Aid Certificate"
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-open-sans">
                      Uploaded:{' '}
                      {format(
                        new Date(verification.firstAidCertificate.uploadedAt),
                        'MMM dd, yyyy',
                      )}
                    </span>
                  </div>

                  {verification.firstAidCertificate.approvedAt && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-open-sans">
                        Approved:{' '}
                        {format(
                          new Date(verification.firstAidCertificate.approvedAt),
                          'MMM dd, yyyy HH:mm',
                        )}
                      </span>
                    </div>
                  )}

                  {verification.firstAidCertificate.rejectedAt && (
                    <div className="flex items-center gap-2 text-sm text-error">
                      <XCircle className="h-4 w-4" />
                      <span className="font-open-sans">
                        Rejected:{' '}
                        {format(
                          new Date(verification.firstAidCertificate.rejectedAt),
                          'MMM dd, yyyy HH:mm',
                        )}
                      </span>
                    </div>
                  )}

                  {verification.firstAidCertificate.rejectionReason && (
                    <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                      <p className="font-inter font-medium text-sm text-error mb-1">
                        Rejection Reason:
                      </p>
                      <p className="font-open-sans text-sm text-foreground">
                        {verification.firstAidCertificate.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {verification.firstAidCertificate.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setIsCertificateRejectDialogOpen(true)}
                      className="text-error border-error hover:bg-error/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Certificate
                    </Button>
                    <Button onClick={() => setIsCertificateApproveDialogOpen(true)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Certificate
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 border border-border rounded-lg bg-muted/50">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-open-sans text-base text-muted-foreground">
                  First Aid Certificate has not been uploaded yet
                </p>
              </div>
            )}
          </div>
        </EnhancedCard>

        {/* Services */}
        {verification.services && verification.services.length > 0 && (
          <EnhancedCard variant="default" className="p-6">
            <h3 className="font-poppins text-lg font-semibold text-foreground mb-4">
              Services ({verification.services.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verification.services.map((service) => (
                <div
                  key={service.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="font-inter font-medium text-foreground">{service.name}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="font-inter text-xs">
                      ${service.price}
                    </Badge>
                    <span className="font-open-sans text-xs text-muted-foreground">
                      {service.duration} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCard>
        )}

        {/* Locations */}
        {verification.locations && verification.locations.length > 0 && (
          <EnhancedCard variant="default" className="p-6">
            <h3 className="font-poppins text-lg font-semibold text-foreground mb-4">
              Locations ({verification.locations.length})
            </h3>
            <div className="space-y-3">
              {verification.locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-inter font-medium text-sm text-foreground">
                      {location.address}
                    </div>
                    <div className="font-open-sans text-xs text-muted-foreground">
                      {location.city}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCard>
        )}

        {/* Verification Timeline */}
        <EnhancedCard variant="default" className="p-6">
          <h3 className="font-poppins text-lg font-semibold text-foreground mb-4">
            Verification Timeline
          </h3>
          <Timeline events={timelineEvents} />
        </EnhancedCard>

        {/* Approve Verification Dialog */}
        <ConfirmationDialog
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
          onConfirm={handleApprove}
          title="Approve Verification"
          description="Are you sure you want to approve this verification? The freelancer will be notified."
          confirmText={isSubmitting ? 'Approving...' : 'Approve'}
          isLoading={isSubmitting}
        />

        {/* Reject Verification Dialog */}
        <ConfirmationDialog
          open={isRejectDialogOpen}
          onOpenChange={(open) => {
            setIsRejectDialogOpen(open);
            if (!open) setRejectionReason('');
          }}
          onConfirm={handleReject}
          title="Reject Verification"
          description="Please provide a reason for rejection. The freelancer will be notified."
          confirmText={isSubmitting ? 'Rejecting...' : 'Reject'}
          isLoading={isSubmitting}
          variant="destructive"
        >
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejectionReason" className="font-inter font-medium">
                Rejection Reason *
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this verification is being rejected..."
                className="mt-2 font-open-sans"
                rows={4}
                required
              />
            </div>
          </div>
        </ConfirmationDialog>

        {/* Approve Certificate Dialog */}
        <ConfirmationDialog
          open={isCertificateApproveDialogOpen}
          onOpenChange={setIsCertificateApproveDialogOpen}
          onConfirm={handleApproveCertificate}
          title="Approve First Aid Certificate"
          description="Are you sure you want to approve this first aid certificate?"
          confirmText={isCertificateSubmitting ? 'Approving...' : 'Approve'}
          isLoading={isCertificateSubmitting}
        />

        {/* Reject Certificate Dialog */}
        <ConfirmationDialog
          open={isCertificateRejectDialogOpen}
          onOpenChange={(open) => {
            setIsCertificateRejectDialogOpen(open);
            if (!open) setCertificateRejectionReason('');
          }}
          onConfirm={handleRejectCertificate}
          title="Reject First Aid Certificate"
          description="Please provide a reason for rejection."
          confirmText={isCertificateSubmitting ? 'Rejecting...' : 'Reject'}
          isLoading={isCertificateSubmitting}
          variant="destructive"
        >
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="certificateRejectionReason" className="font-inter font-medium">
                Rejection Reason *
              </Label>
              <Textarea
                id="certificateRejectionReason"
                value={certificateRejectionReason}
                onChange={(e) => setCertificateRejectionReason(e.target.value)}
                placeholder="Explain why this certificate is being rejected..."
                className="mt-2 font-open-sans"
                rows={4}
                required
              />
            </div>
          </div>
        </ConfirmationDialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default VerificationDetailPage;
