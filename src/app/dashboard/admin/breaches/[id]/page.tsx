'use client';

import { AlertCircle, ArrowLeft, CheckCircle2, Mail, Shield } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  formatBreachDate,
  getRiskLevelBadgeVariant,
  getRiskLevelLabel,
  getStatusBadgeVariant,
  getStatusLabel,
} from '@/components/common/DataTable/breach-columns';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  useBreachById,
  useNotifyUsersAboutBreach,
  useReportBreachToDpc,
  useUpdateBreachStatus,
} from '@/hooks/queries/useDataRights';
import { useAuthStore } from '@/stores/authStore';
import { BreachStatus } from '@/types/dataRights';
import { ROLES } from '@/types/types';

const BreachDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const breachId = params['id'] as string;
  const { isAuthenticated, role } = useAuthStore();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isReportDpcDialogOpen, setIsReportDpcDialogOpen] = useState(false);
  const [isNotifyUsersDialogOpen, setIsNotifyUsersDialogOpen] = useState(false);
  const [status, setStatus] = useState<BreachStatus>(BreachStatus.DETECTED);
  const [statusNotes, setStatusNotes] = useState('');
  const [dpcNotes, setDpcNotes] = useState('');
  const [notificationNotes, setNotificationNotes] = useState('');

  const { data: breachResponse, isLoading: loading, error: breachError } = useBreachById(breachId);
  const breach = breachResponse?.data || null;

  const updateStatusMutation = useUpdateBreachStatus();
  const reportDpcMutation = useReportBreachToDpc();
  const notifyUsersMutation = useNotifyUsersAboutBreach();

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/authentication/sign-in');
      return;
    }
    if (role && role !== ROLES.ADMIN) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    }
  }, [isAuthenticated, role, router]);

  useEffect(() => {
    if (breach) {
      setStatus(breach.status);
    }
  }, [breach]);

  useEffect(() => {
    if (breachError) {
      if ((breachError as any)?.status === 404) {
        router.push('/dashboard/admin/audit');
      } else {
        router.push('/dashboard/admin/audit');
      }
    }
  }, [breachError, router]);

  const handleStatusUpdate = async () => {
    if (!breach) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: breach.id,
        data: {
          status,
          notes: statusNotes || undefined,
        },
      });
      setIsStatusDialogOpen(false);
      setStatusNotes('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReportToDpc = async () => {
    if (!breach) return;
    try {
      await reportDpcMutation.mutateAsync({
        id: breach.id,
        notes: dpcNotes || undefined,
      });
      setIsReportDpcDialogOpen(false);
      setDpcNotes('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleNotifyUsers = async () => {
    if (!breach) return;
    try {
      await notifyUsersMutation.mutateAsync({
        id: breach.id,
        notes: notificationNotes || undefined,
      });
      setIsNotifyUsersDialogOpen(false);
      setNotificationNotes('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getNextStatusOptions = (currentStatus: BreachStatus): BreachStatus[] => {
    switch (currentStatus) {
      case BreachStatus.DETECTED:
        return [BreachStatus.INVESTIGATING];
      case BreachStatus.INVESTIGATING:
        return [BreachStatus.CONTAINED];
      case BreachStatus.CONTAINED:
        return [BreachStatus.RESOLVED];
      case BreachStatus.RESOLVED:
        return [];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <DashboardPageWrapper
        header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Breach Details</h1>}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="font-open-sans text-muted-foreground">Loading breach details...</p>
          </div>
        </div>
      </DashboardPageWrapper>
    );
  }

  if (!breach) {
    return (
      <DashboardPageWrapper
        header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Breach Details</h1>}
      >
        <Card className="p-6 text-center">
          <p className="font-open-sans text-base text-muted-foreground">Breach not found</p>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/admin/breaches')}
            className="mt-4"
          >
            Back to Breaches
          </Button>
        </Card>
      </DashboardPageWrapper>
    );
  }

  const nextStatusOptions = getNextStatusOptions(breach.status);
  const canUpdateStatus = nextStatusOptions.length > 0;

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center gap-4 w-full">
          <Button variant="outline" onClick={() => router.push('/dashboard/admin/audit')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Data Breach Details</h1>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status and Risk Level Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <Badge
              variant={getStatusBadgeVariant(breach.status)}
              className="font-inter text-base px-3 py-1"
            >
              {getStatusLabel(breach.status)}
            </Badge>
            <Badge
              variant={getRiskLevelBadgeVariant(breach.riskLevel)}
              className="font-inter text-base px-3 py-1"
            >
              {getRiskLevelLabel(breach.riskLevel)} Risk
            </Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            {canUpdateStatus && (
              <Button
                variant="outline"
                onClick={() => {
                  if (nextStatusOptions[0]) {
                    setStatus(nextStatusOptions[0]);
                    setIsStatusDialogOpen(true);
                  }
                }}
                className="font-inter"
              >
                Update Status
              </Button>
            )}
            {!breach.reportedToDpc && (
              <Button
                variant="outline"
                onClick={() => setIsReportDpcDialogOpen(true)}
                className="font-inter"
              >
                <Mail className="h-4 w-4 mr-2" />
                Report to DPC
              </Button>
            )}
            {!breach.notifiedUsers && (
              <Button onClick={() => setIsNotifyUsersDialogOpen(true)} className="font-inter">
                <Mail className="h-4 w-4 mr-2" />
                Notify Users
              </Button>
            )}
          </div>
        </div>

        {/* Status Workflow Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins font-semibold">Status Workflow</CardTitle>
            <CardDescription className="font-open-sans">
              Current status and workflow progression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {[
                BreachStatus.DETECTED,
                BreachStatus.INVESTIGATING,
                BreachStatus.CONTAINED,
                BreachStatus.RESOLVED,
              ].map((statusItem, index) => {
                const isActive = breach.status === statusItem;
                const isCompleted =
                  [
                    BreachStatus.DETECTED,
                    BreachStatus.INVESTIGATING,
                    BreachStatus.CONTAINED,
                    BreachStatus.RESOLVED,
                  ].indexOf(breach.status) >
                  [
                    BreachStatus.DETECTED,
                    BreachStatus.INVESTIGATING,
                    BreachStatus.CONTAINED,
                    BreachStatus.RESOLVED,
                  ].indexOf(statusItem);

                return (
                  <div key={statusItem} className="flex items-center gap-2 min-w-[140px]">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : isCompleted
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-200 text-gray-500 border-gray-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="font-inter font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`font-inter text-xs text-center ${
                          isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {getStatusLabel(statusItem)}
                      </span>
                    </div>
                    {index < 3 && (
                      <div
                        className={`h-0.5 w-8 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Breach Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins font-semibold">Breach Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-inter font-medium text-sm text-muted-foreground">
                Description
              </Label>
              <p className="font-open-sans text-base text-foreground mt-1 whitespace-pre-wrap">
                {breach.description}
              </p>
            </div>
            <Separator />
            <div>
              <Label className="font-inter font-medium text-sm text-muted-foreground">
                Data Categories
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {breach.dataCategories.map((category, index) => (
                  <Badge key={index} variant="outline" className="font-inter">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-inter font-medium text-sm text-muted-foreground">
                  Affected Users
                </Label>
                <p className="font-inter font-semibold text-lg text-foreground mt-1">
                  {breach.affectedUsers.toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="font-inter font-medium text-sm text-muted-foreground">
                  Detected At
                </Label>
                <p className="font-inter text-base text-foreground mt-1">
                  {formatBreachDate(breach.detectedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className={
              breach.reportedToDpc
                ? 'border-green-200
                : 'border-red-200
            }
          >
            <CardHeader>
              <CardTitle className="font-poppins font-semibold flex items-center gap-2">
                {breach.reportedToDpc ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                DPC Reporting Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {breach.reportedToDpc ? (
                <div>
                  <p className="font-inter text-green-600 font-semibold mb-1">Reported</p>
                  {breach.reportedAt && (
                    <p className="font-open-sans text-sm text-muted-foreground">
                      Reported on: {formatBreachDate(breach.reportedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-inter text-red-600 font-semibold mb-1">Not Reported</p>
                  <p className="font-open-sans text-sm text-muted-foreground">
                    Must be reported within 72 hours for high-risk breaches
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className={
              breach.notifiedUsers
                ? 'border-green-200
                : 'border-red-200
            }
          >
            <CardHeader>
              <CardTitle className="font-poppins font-semibold flex items-center gap-2">
                {breach.notifiedUsers ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                User Notification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {breach.notifiedUsers ? (
                <div>
                  <p className="font-inter text-green-600 font-semibold mb-1">Users Notified</p>
                  {breach.notifiedAt && (
                    <p className="font-open-sans text-sm text-muted-foreground">
                      Notified on: {formatBreachDate(breach.notifiedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-inter text-red-600 font-semibold mb-1">Not Notified</p>
                  <p className="font-open-sans text-sm text-muted-foreground">
                    Affected users must be notified without undue delay
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins font-semibold">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-inter font-semibold">Breach Detected</p>
                  <p className="font-open-sans text-sm text-muted-foreground">
                    {formatBreachDate(breach.detectedAt)}
                  </p>
                </div>
              </div>
              {breach.reportedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="font-inter font-semibold">Reported to DPC</p>
                    <p className="font-open-sans text-sm text-muted-foreground">
                      {formatBreachDate(breach.reportedAt)}
                    </p>
                  </div>
                </div>
              )}
              {breach.notifiedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="font-inter font-semibold">Users Notified</p>
                    <p className="font-open-sans text-sm text-muted-foreground">
                      {formatBreachDate(breach.notifiedAt)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
                <div>
                  <p className="font-inter font-semibold">Last Updated</p>
                  <p className="font-open-sans text-sm text-muted-foreground">
                    {formatBreachDate(breach.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">Update Breach Status</DialogTitle>
              <DialogDescription className="font-open-sans">
                Update the status of this breach following the workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status" className="font-inter font-medium">
                  New Status *
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as BreachStatus)}>
                  <SelectTrigger className="font-open-sans mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {getStatusLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Next status in workflow:{' '}
                  {nextStatusOptions[0] ? getStatusLabel(nextStatusOptions[0]) : 'N/A'}
                </p>
              </div>
              <div>
                <Label htmlFor="statusNotes" className="font-inter font-medium">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="statusNotes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  className="font-open-sans mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsStatusDialogOpen(false);
                  setStatusNotes('');
                }}
                disabled={
                  updateStatusMutation.isPending ||
                  reportDpcMutation.isPending ||
                  notifyUsersMutation.isPending
                }
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report to DPC Dialog */}
        <Dialog open={isReportDpcDialogOpen} onOpenChange={setIsReportDpcDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">Report to DPC</DialogTitle>
              <DialogDescription className="font-open-sans">
                Mark this breach as reported to the Data Protection Commission
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="font-open-sans text-sm text-amber-800
                  <strong>Note:</strong> High-risk breaches must be reported to the DPC within 72
                  hours of detection.
                </p>
              </div>
              <div>
                <Label htmlFor="dpcNotes" className="font-inter font-medium">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="dpcNotes"
                  value={dpcNotes}
                  onChange={(e) => setDpcNotes(e.target.value)}
                  placeholder="Add notes about the DPC report..."
                  className="font-open-sans mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportDpcDialogOpen(false);
                  setDpcNotes('');
                }}
                disabled={reportDpcMutation.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleReportToDpc} disabled={reportDpcMutation.isPending}>
                {reportDpcMutation.isPending ? 'Processing...' : 'Mark as Reported'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notify Users Dialog */}
        <Dialog open={isNotifyUsersDialogOpen} onOpenChange={setIsNotifyUsersDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">Notify Users</DialogTitle>
              <DialogDescription className="font-open-sans">
                Mark affected users as notified about this breach
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                <p className="font-open-sans text-sm text-foreground">
                  <Mail className="h-4 w-4 inline mr-2" />
                  This will mark {breach.affectedUsers.toLocaleString()} affected users as notified.
                </p>
              </div>
              <div>
                <Label htmlFor="notificationNotes" className="font-inter font-medium">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notificationNotes"
                  value={notificationNotes}
                  onChange={(e) => setNotificationNotes(e.target.value)}
                  placeholder="Add notes about the user notification..."
                  className="font-open-sans mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsNotifyUsersDialogOpen(false);
                  setNotificationNotes('');
                }}
                disabled={notifyUsersMutation.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleNotifyUsers} disabled={notifyUsersMutation.isPending}>
                {notifyUsersMutation.isPending ? 'Processing...' : 'Mark as Notified'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default BreachDetailPage;
