'use client';

import { AlertCircle, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getComplaintDetails,
  getComplaintsAgainstMe,
  getMyComplaints,
} from '@/redux/api/complaintApi';
import { RootState } from '@/redux/store';
import { ComplaintCategory, ComplaintStatus } from '@/types/types';

export default function MyComplaintsPage() {
  const dispatch = useDispatch();
  const { myComplaints, complaintsAgainstMe, selectedComplaint, isLoading, error } = useSelector(
    (state: RootState) => state.complaint,
  );
  const [selectedTab, setSelectedTab] = useState('filed');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getMyComplaints() as any),
          dispatch(getComplaintsAgainstMe() as any),
        ]);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleViewDetails = async (complaintId: string) => {
    try {
      await dispatch(getComplaintDetails(complaintId) as any);
    } catch (error) {
      toast.error('Failed to load complaint details');
    }
  };

  const filteredComplaints = (complaints: any[]) => {
    if (statusFilter === 'all') return complaints;
    return complaints.filter((c) => c.status === statusFilter);
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      case 'DISMISSED':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Dismissed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: ComplaintCategory) => {
    const labels: Record<ComplaintCategory, string> = {
      HARASSMENT: 'Harassment',
      UNPROFESSIONAL_BEHAVIOR: 'Unprofessional Behavior',
      SAFETY_CONCERN: 'Safety Concern',
      NO_SHOW: 'No Show',
      LATE_CANCELLATION: 'Late Cancellation',
      INAPPROPRIATE_CONDUCT: 'Inappropriate Conduct',
      POOR_SERVICE_QUALITY: 'Poor Service Quality',
      OTHER: 'Other',
    };
    return labels[category] || category;
  };

  if (isLoading && !myComplaints.length && !complaintsAgainstMe.length) {
    return (
      <DashboardPageWrapper
        header={
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-gray-600">View and manage your complaints</p>
          </div>
        }
      >
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-600">View and manage your complaints</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="DISMISSED">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="filed">Complaints I Filed</TabsTrigger>
            <TabsTrigger value="against">Complaints Against Me</TabsTrigger>
          </TabsList>

          <TabsContent value="filed" className="space-y-4">
            {filteredComplaints(myComplaints).length > 0 ? (
              filteredComplaints(myComplaints).map((complaint) => (
                <Card key={complaint.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Against: {complaint.reportedUser?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(complaint.status)}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Category:</span>
                        <Badge variant="outline" className="ml-2">
                          {getCategoryLabel(complaint.category)}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Reason:</span>
                        <p className="text-sm text-gray-600">{complaint.reason}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Description:</span>
                        <p className="text-sm text-gray-600">{complaint.description}</p>
                      </div>

                      {complaint.adminResponse && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                          <p className="text-sm text-blue-800">{complaint.adminResponse}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(complaint.id)}
                      className="mt-4"
                    >
                      View Full Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {statusFilter === 'all'
                      ? 'No complaints filed yet'
                      : 'No complaints with this status'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="against" className="space-y-4">
            {filteredComplaints(complaintsAgainstMe).length > 0 ? (
              filteredComplaints(complaintsAgainstMe).map((complaint) => (
                <Card key={complaint.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Reported by: {complaint.reporter?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(complaint.status)}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Category:</span>
                        <Badge variant="outline" className="ml-2">
                          {getCategoryLabel(complaint.category)}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Reason:</span>
                        <p className="text-sm text-gray-600">{complaint.reason}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Description:</span>
                        <p className="text-sm text-gray-600">{complaint.description}</p>
                      </div>

                      {complaint.adminResponse && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-yellow-900 mb-1">
                            Admin Response:
                          </p>
                          <p className="text-sm text-yellow-800">{complaint.adminResponse}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(complaint.id)}
                      className="mt-4"
                    >
                      View Full Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <p className="text-gray-500">
                    {statusFilter === 'all'
                      ? 'No complaints filed against you'
                      : 'No complaints with this status'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageWrapper>
  );
}
