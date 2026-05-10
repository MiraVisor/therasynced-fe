'use client';

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { ConfirmationDialog } from '@/components/core/Dashboard/AdminSide/Components/ConfirmationDialog';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useAdminFreelancerRequirementsStatus } from '@/hooks/queries/useDocumentRequirements';
import { useAdminGetFileSignedUrl } from '@/hooks/queries/useFreelancerFiles';
import adminVerificationService, {
  type VerificationDetailsResponse,
} from '@/services/adminVerificationService';
import documentRequirementService, {
  type FreelancerRequirementStatus,
} from '@/services/documentRequirementService';

function getExpiryStatus(expiryDate: string): { label: string; className: string } {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);

  if (diffMs < 0) return { label: 'Expired', className: 'bg-red-100 text-red-700 border-red-200' };
  if (diffMonths <= 6)
    return { label: 'Expiring Soon', className: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'Valid', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
}

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

  // Track which documents the admin has reviewed (opened/viewed)
  const [reviewedDocIds, setReviewedDocIds] = useState<Set<string>>(new Set());
  // Track saving state for expiry dates
  const [savingExpiryFileId, setSavingExpiryFileId] = useState<string | null>(null);

  const signedUrlMutation = useAdminGetFileSignedUrl();

  // Fetch document requirements status for this freelancer
  const { data: requirementsStatus, isLoading: isLoadingRequirements } =
    useAdminFreelancerRequirementsStatus(freelancerId ?? null);

  useEffect(() => {
    if (freelancerId) {
      fetchVerificationDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freelancerId]);

  const fetchVerificationDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminVerificationService.getDetails(freelancerId || '');
      if (response.success) {
        setVerification(response.data);
      } else {
        setError('Failed to load verification details');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch verification details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived requirement metrics ──
  const mandatoryRequirements = useMemo(
    () => requirementsStatus?.filter((r) => r.requirement.isMandatory) ?? [],
    [requirementsStatus],
  );
  const mandatoryUploaded = useMemo(
    () => mandatoryRequirements.filter((r) => r.uploaded),
    [mandatoryRequirements],
  );
  const allMandatoryUploaded =
    mandatoryRequirements.length === 0 || mandatoryUploaded.length === mandatoryRequirements.length;

  const mandatoryReviewed = useMemo(
    () => mandatoryUploaded.filter((r) => r.uploadedFile && reviewedDocIds.has(r.uploadedFile.id)),
    [mandatoryUploaded, reviewedDocIds],
  );
  const allMandatoryReviewed =
    mandatoryUploaded.length === 0 || mandatoryReviewed.length === mandatoryUploaded.length;

  // Total uploaded docs (all categories)
  const totalUploadedDocs = requirementsStatus?.filter((r) => r.uploaded).length ?? 0;
  const totalRequirements = requirementsStatus?.length ?? 0;

  // All mandatory documents must be uploaded (not a hardcoded number)
  const hasEnoughDocs = allMandatoryUploaded;

  // Approve: needs all mandatory uploaded + all mandatory reviewed
  const canApprove = hasEnoughDocs && allMandatoryReviewed;

  // Reject: only needs at least one doc uploaded to evaluate
  const canReject = totalUploadedDocs > 0;

  const totalMandatory = mandatoryRequirements.length;
  const reviewProgress =
    totalMandatory > 0 ? Math.round((mandatoryReviewed.length / totalMandatory) * 100) : 100;

  // ── Handlers ──
  const handleApprove = async () => {
    if (!verification) return;
    try {
      setIsSubmitting(true);
      const response = await adminVerificationService.approve({
        freelancerId: verification.id,
      });
      if (response.success) {
        toast.success('Verification approved');
        setIsApproveDialogOpen(false);
        router.push('/dashboard/admin/verifications');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve verification');
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
        toast.success('Verification rejected');
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        router.push('/dashboard/admin/verifications');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject verification');
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
        toast.success('Certificate approved');
        setIsCertificateApproveDialogOpen(false);
        fetchVerificationDetails();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve certificate');
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
        toast.success('Certificate rejected');
        setIsCertificateRejectDialogOpen(false);
        setCertificateRejectionReason('');
        fetchVerificationDetails();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject certificate');
    } finally {
      setIsCertificateSubmitting(false);
    }
  };

  const handleViewDocument = useCallback(
    async (fileId: string) => {
      try {
        const data = await signedUrlMutation.mutateAsync(fileId);
        const response = await fetch(data.signedUrl, { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch file');

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

        setReviewedDocIds((prev) => {
          const next = new Set(Array.from(prev));
          next.add(fileId);
          return next;
        });
      } catch {
        toast.error('Failed to load document. Please try again.');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleSetExpiry = useCallback(async (fileId: string, dateStr: string) => {
    if (!dateStr) return;
    try {
      setSavingExpiryFileId(fileId);
      await documentRequirementService.setFileExpiry(fileId, new Date(dateStr).toISOString());
      toast.success('Expiry date saved');
    } catch {
      toast.error('Failed to save expiry date');
    } finally {
      setSavingExpiryFileId(null);
    }
  }, []);

  // ── Loading ──
  if (isLoading) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Review</h1>
        }
      >
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

  // ── Error ──
  if (error || !verification) {
    return (
      <DashboardPageWrapper
        header={
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Review</h1>
        }
      >
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle className="h-10 w-10 text-error" />
          <p className="text-sm text-muted-foreground">{error || 'Verification not found'}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/admin/verifications')}
          >
            Back to Queue
          </Button>
        </div>
      </DashboardPageWrapper>
    );
  }

  const currentStatus = verification.verificationStatus || 'PENDING';

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/admin/verifications')}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Verification Review</h1>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── Freelancer Header + Actions ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-poppins text-lg font-semibold text-foreground">
                      {verification.name}
                    </h2>
                    <StatusBadge status={currentStatus} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">{verification.email}</p>
                  {verification.mainJobTitle && (
                    <Badge variant="secondary" className="mt-1.5 text-xs">
                      {verification.mainJobTitle.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action buttons - disabled until freelancer has uploaded enough docs */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={!canReject}
                  className="text-error border-error/40 hover:bg-error/10 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsApproveDialogOpen(true)}
                  disabled={!canApprove}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Approve
                </Button>
              </div>
            </div>

            {/* Status info */}
            {!hasEnoughDocs && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs text-amber-600">
                  Freelancer has uploaded {totalUploadedDocs} of {totalRequirements} documents. All
                  mandatory documents must be uploaded before approval.
                </p>
              </div>
            )}
            {hasEnoughDocs && totalMandatory > 0 && !allMandatoryReviewed && (
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Review Progress</span>
                  <span className="text-xs text-muted-foreground">
                    {mandatoryReviewed.length}/{totalMandatory}
                  </span>
                </div>
                <Progress value={reviewProgress} className="h-1.5" />
              </div>
            )}

            {/* Show previous rejection reason if exists */}
            {verification.verificationRejectionReason && currentStatus === 'REJECTED' && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs font-medium text-error">Previous rejection reason:</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {verification.verificationRejectionReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Document Requirements Checklist ── */}
        {isLoadingRequirements ? (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Loading requirements...</span>
              </div>
            </CardContent>
          </Card>
        ) : requirementsStatus && requirementsStatus.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Document Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {requirementsStatus.map((item: FreelancerRequirementStatus) => {
                  const isReviewed = item.uploadedFile && reviewedDocIds.has(item.uploadedFile.id);
                  const expiry = item.uploadedFile?.expiryDate
                    ? getExpiryStatus(item.uploadedFile.expiryDate)
                    : null;
                  return (
                    <div key={item.requirement.id} className="py-3 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Status icon */}
                          {item.uploaded ? (
                            isReviewed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            )
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground truncate">
                                {item.requirement.name}
                              </span>
                              {item.requirement.isMandatory && (
                                <span className="text-[10px] font-medium text-red-600">*</span>
                              )}
                              {expiry && (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 h-4 ${expiry.className}`}
                                >
                                  {expiry.label}
                                </Badge>
                              )}
                            </div>
                            {item.uploadedFile && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.uploadedFile.fileName}
                                {' · '}
                                {new Date(item.uploadedFile.createdAt).toLocaleDateString('en-IE', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                                {item.uploadedFile.expiryDate && (
                                  <>
                                    {' · Expires '}
                                    {new Date(item.uploadedFile.expiryDate).toLocaleDateString(
                                      'en-IE',
                                      { day: 'numeric', month: 'short', year: 'numeric' },
                                    )}
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex-shrink-0">
                          {item.uploaded && item.uploadedFile ? (
                            <Button
                              variant={isReviewed ? 'ghost' : 'outline'}
                              size="sm"
                              onClick={() => handleViewDocument(item.uploadedFile!.id)}
                              className="h-7 text-xs gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              {isReviewed ? 'View' : 'Review'}
                            </Button>
                          ) : (
                            <span className="text-xs text-amber-500">Missing</span>
                          )}
                        </div>
                      </div>

                      {/* Expiry date input for documents that have hasExpiry */}
                      {item.uploaded && item.uploadedFile && item.requirement.hasExpiry && (
                        <div className="flex items-center gap-2 ml-7">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <Input
                            type="date"
                            className="h-7 text-xs w-40"
                            defaultValue={
                              item.uploadedFile.expiryDate
                                ? new Date(item.uploadedFile.expiryDate).toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(e) => {
                              if (e.target.value && item.uploadedFile) {
                                handleSetExpiry(item.uploadedFile.id, e.target.value);
                              }
                            }}
                            disabled={savingExpiryFileId === item.uploadedFile.id}
                          />
                          {savingExpiryFileId === item.uploadedFile.id && (
                            <LoadingSpinner size="sm" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                <span className="text-red-600">*</span> Required documents must be reviewed before
                approving.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground text-center">
                No document requirements defined for this role.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── First Aid Certificate ── */}
        {(verification.firstAidCertificate ||
          requirementsStatus?.some((r) =>
            r.requirement.name.toLowerCase().includes('first aid'),
          )) && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">First Aid Certificate</CardTitle>
                {verification.firstAidCertificate ? (
                  <StatusBadge status={verification.firstAidCertificate.status} size="sm" />
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Not Uploaded
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {verification.firstAidCertificate ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Uploaded{' '}
                      {verification.firstAidCertificate.uploadedAt
                        ? new Date(verification.firstAidCertificate.uploadedAt).toLocaleDateString(
                            'en-IE',
                            { day: 'numeric', month: 'short', year: 'numeric' },
                          )
                        : 'N/A'}
                    </span>
                    {/* View button - find file ID from freelancerFiles */}
                    {(() => {
                      const certFile = verification.freelancerFiles?.find(
                        (f) => f.category === 'FIRST_AID_CERTIFICATE',
                      );
                      return certFile ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(certFile.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      ) : verification.firstAidCertificate?.url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(verification.firstAidCertificate!.url, '_blank')
                          }
                          className="h-7 text-xs gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      ) : null;
                    })()}
                  </div>

                  {verification.firstAidCertificate.rejectionReason && (
                    <div className="bg-error/5 border border-error/20 rounded p-2.5">
                      <p className="text-xs text-error">
                        <span className="font-medium">Rejection reason: </span>
                        {verification.firstAidCertificate.rejectionReason}
                      </p>
                    </div>
                  )}

                  {verification.firstAidCertificate.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCertificateRejectDialogOpen(true)}
                        className="text-error border-error/40 hover:bg-error/10 h-7 text-xs"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setIsCertificateApproveDialogOpen(true)}
                        className="h-7 text-xs"
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not uploaded yet.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Services ── */}
        {verification.services && verification.services.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Services ({verification.services.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {verification.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-medium text-foreground">{service.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>${service.price}</span>
                      <span>·</span>
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Locations ── */}
        {verification.locations && verification.locations.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Locations ({verification.locations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {verification.locations.map((location) => (
                  <div key={location.id} className="py-2.5">
                    <p className="text-sm font-medium text-foreground">{location.address}</p>
                    <p className="text-xs text-muted-foreground">{location.city}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Dialogs ── */}
        <ConfirmationDialog
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
          onConfirm={handleApprove}
          title="Approve Verification"
          description="The freelancer will be notified and can begin creating appointment slots."
          confirmText={isSubmitting ? 'Approving...' : 'Approve'}
          isLoading={isSubmitting}
        />

        <ConfirmationDialog
          open={isRejectDialogOpen}
          onOpenChange={(open) => {
            setIsRejectDialogOpen(open);
            if (!open) setRejectionReason('');
          }}
          onConfirm={handleReject}
          title="Reject Verification"
          description="Provide a reason for rejection. The freelancer will be notified."
          confirmText={isSubmitting ? 'Rejecting...' : 'Reject'}
          isLoading={isSubmitting}
          variant="destructive"
        >
          <div className="py-3">
            <Label htmlFor="rejectionReason" className="text-sm font-medium">
              Reason *
            </Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this verification is being rejected..."
              className="mt-1.5"
              rows={3}
              required
            />
          </div>
        </ConfirmationDialog>

        <ConfirmationDialog
          open={isCertificateApproveDialogOpen}
          onOpenChange={setIsCertificateApproveDialogOpen}
          onConfirm={handleApproveCertificate}
          title="Approve First Aid Certificate"
          description="Are you sure you want to approve this certificate?"
          confirmText={isCertificateSubmitting ? 'Approving...' : 'Approve'}
          isLoading={isCertificateSubmitting}
        />

        <ConfirmationDialog
          open={isCertificateRejectDialogOpen}
          onOpenChange={(open) => {
            setIsCertificateRejectDialogOpen(open);
            if (!open) setCertificateRejectionReason('');
          }}
          onConfirm={handleRejectCertificate}
          title="Reject First Aid Certificate"
          description="Provide a reason for rejection."
          confirmText={isCertificateSubmitting ? 'Rejecting...' : 'Reject'}
          isLoading={isCertificateSubmitting}
          variant="destructive"
        >
          <div className="py-3">
            <Label htmlFor="certificateRejectionReason" className="text-sm font-medium">
              Reason *
            </Label>
            <Textarea
              id="certificateRejectionReason"
              value={certificateRejectionReason}
              onChange={(e) => setCertificateRejectionReason(e.target.value)}
              placeholder="Explain why this certificate is being rejected..."
              className="mt-1.5"
              rows={3}
              required
            />
          </div>
        </ConfirmationDialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default VerificationDetailPage;
