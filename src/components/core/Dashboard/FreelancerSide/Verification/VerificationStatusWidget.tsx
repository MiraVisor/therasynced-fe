'use client';

import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getFirstAidCertificateStatus } from '@/redux/api/certificateApi';
import { getVerificationDocuments, getVerificationStatus } from '@/redux/api/verificationApi';
import { RootState } from '@/redux/store';

interface VerificationStatusWidgetProps {
  className?: string;
}

export default function VerificationStatusWidget({ className }: VerificationStatusWidgetProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get data from Redux store
  const verificationState = useSelector((state: RootState) => state.verification);
  const certificateState = useSelector((state: RootState) => state.certificate);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          dispatch(getVerificationStatus({}) as any),
          dispatch(getFirstAidCertificateStatus() as any),
          dispatch(getVerificationDocuments() as any),
        ]);
      } catch (error) {
        console.error('Error fetching verification data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const verificationStatus = verificationState?.verificationStatus || 'NOT_SUBMITTED';
  const certificateStatus = certificateState?.certificate?.firstAidCertificateStatus || 'PENDING';
  const documents = verificationState?.documents || [];

  const getStatusBadge = (status: string) => {
    if (status === 'APPROVED') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return null;
  };

  const getVerificationProgress = () => {
    let completed = 0;
    const total = 2; // Certificate + Documents

    if (certificateStatus === 'APPROVED') completed++;
    if (documents.length > 0) completed++;

    return (completed / total) * 100;
  };

  const isVerificationComplete = () => {
    return certificateStatus === 'APPROVED' && verificationStatus === 'APPROVED';
  };

  const getStatusMessage = () => {
    if (isVerificationComplete()) {
      return 'Your verification is complete! You now have a verified badge on your profile.';
    }

    if (verificationStatus === 'PENDING') {
      return "Your verification is under review. We'll notify you once it's processed.";
    }

    if (verificationStatus === 'REJECTED') {
      return 'Your verification was rejected. Please check the reason and resubmit your documents.';
    }

    if (documents.length === 0 && certificateStatus !== 'APPROVED') {
      return 'Complete your verification by uploading your first aid certificate and professional documents.';
    }

    if (documents.length > 0 && certificateStatus !== 'APPROVED') {
      return 'Upload your first aid certificate to complete the verification process.';
    }

    if (certificateStatus === 'APPROVED' && documents.length === 0) {
      return 'Upload your professional documents to complete the verification process.';
    }

    return 'Upload your documents to get verified and build trust with patients.';
  };

  const getStatusColor = () => {
    if (isVerificationComplete()) return 'text-green-600';
    if (verificationStatus === 'PENDING') return 'text-yellow-600';
    if (verificationStatus === 'REJECTED') return 'text-red-600';
    return 'text-blue-600';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-poppins font-semibold">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
          {getStatusBadge(verificationStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-gray-600">{Math.round(getVerificationProgress())}% Complete</span>
          </div>
          <Progress value={getVerificationProgress()} className="h-2" />
        </div>

        {/* Status Message */}
        <p className={`text-sm ${getStatusColor()}`}>{getStatusMessage()}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
            <FileText className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-xs font-medium">Certificate</p>
              <p className="text-xs text-gray-600">
                {certificateStatus === 'APPROVED' ? 'Approved' : 'Pending'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
            <Award className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-xs font-medium">Documents</p>
              <p className="text-xs text-gray-600">{documents.length} uploaded</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => router.push('/dashboard/verification')}
          className="w-full"
          variant={isVerificationComplete() ? 'outline' : 'default'}
        >
          {isVerificationComplete() ? 'View Verification' : 'Complete Verification'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        {/* Rejection Alert */}
        {verificationStatus === 'REJECTED' && verificationState?.verificationRejectionReason && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-xs">
              <strong>Rejection Reason:</strong> {verificationState.verificationRejectionReason}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
