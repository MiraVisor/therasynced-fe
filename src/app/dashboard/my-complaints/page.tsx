'use client';

import { AlertTriangle, Shield } from 'lucide-react';
import { AlertCircle, Ban, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { FilterBar } from '@/components/core/Dashboard/AdminSide/Components/FilterBar';
import { StatusBadge } from '@/components/core/Dashboard/AdminSide/Components/StatusBadge';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getComplaintsAgainstMe, getMyComplaints } from '@/redux/api/complaintApi';
import { RootState } from '@/redux/store';
import { ComplaintCategory, ComplaintStatus } from '@/types/types';

export default function MyComplaintsPage() {
  const dispatch = useDispatch();
  const { myComplaints, complaintsAgainstMe, isLoading, error } = useSelector(
    (state: RootState) => state.complaint,
  );
  const [selectedTab, setSelectedTab] = useState('filed');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getMyComplaints({}) as any),
          dispatch(getComplaintsAgainstMe({}) as any),
        ]);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        toast.error('Failed to fetch complaints');
      }
    };

    fetchData();
  }, [dispatch]);

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

  const filteredComplaints = (complaints: any[]) => {
    let filtered = complaints;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.reason?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          (selectedTab === 'filed' && c.reportedUser?.name?.toLowerCase().includes(query)) ||
          (selectedTab === 'against' && c.reporter?.name?.toLowerCase().includes(query)),
      );
    }

    return filtered;
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  const currentComplaints =
    selectedTab === 'filed'
      ? filteredComplaints(myComplaints)
      : filteredComplaints(complaintsAgainstMe);

  const stats = {
    filed: {
      total: myComplaints.length,
      pending: myComplaints.filter((c) => c.status === 'PENDING').length,
      underReview: myComplaints.filter((c) => c.status === 'UNDER_REVIEW').length,
      resolved: myComplaints.filter((c) => c.status === 'RESOLVED').length,
      warned: 0,
      suspended: 0,
    },
    against: {
      total: complaintsAgainstMe.length,
      pending: complaintsAgainstMe.filter((c) => c.status === 'PENDING').length,
      underReview: complaintsAgainstMe.filter((c) => c.status === 'UNDER_REVIEW').length,
      resolved: complaintsAgainstMe.filter((c) => c.status === 'RESOLVED').length,
      warned: complaintsAgainstMe.filter((c) => c.actionTaken === 'WARNED').length,
      suspended: complaintsAgainstMe.filter((c) => c.actionTaken === 'SUSPENDED').length,
    },
  };

  const currentStats = selectedTab === 'filed' ? stats.filed : stats.against;

  if (isLoading && !myComplaints.length && !complaintsAgainstMe.length) {
    return (
      <DashboardPageWrapper
        header={<h1 className="font-poppins font-bold text-2xl text-charcoal">My Complaints</h1>}
      >
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">My Complaints</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <EnhancedStatCard
            title="Total"
            value={currentStats.total.toString()}
            icon={FileText}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            sparklineData={Array.from({ length: 7 }, () => currentStats.total)}
          />
          <EnhancedStatCard
            title="Pending"
            value={currentStats.pending.toString()}
            icon={AlertCircle}
            iconColor="text-warning"
            iconBg="bg-warning/10"
            sparklineData={Array.from({ length: 7 }, () => currentStats.pending)}
          />
          <EnhancedStatCard
            title="Under Review"
            value={currentStats.underReview.toString()}
            icon={Shield}
            iconColor="text-info"
            iconBg="bg-info/10"
            sparklineData={Array.from({ length: 7 }, () => currentStats.underReview)}
          />
          <EnhancedStatCard
            title="Resolved"
            value={currentStats.resolved.toString()}
            icon={FileText}
            iconColor="text-success"
            iconBg="bg-success/10"
            sparklineData={Array.from({ length: 7 }, () => currentStats.resolved)}
          />
          {selectedTab === 'against' && (
            <>
              <EnhancedStatCard
                title="Warned"
                value={currentStats.warned.toString()}
                icon={AlertTriangle}
                iconColor="text-warning"
                iconBg="bg-warning/10"
                sparklineData={Array.from({ length: 7 }, () => currentStats.warned)}
              />
              <EnhancedStatCard
                title="Suspended"
                value={currentStats.suspended.toString()}
                icon={Ban}
                iconColor="text-error"
                iconBg="bg-error/10"
                sparklineData={Array.from({ length: 7 }, () => currentStats.suspended)}
              />
            </>
          )}
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={`Search ${selectedTab === 'filed' ? 'filed complaints' : 'complaints against me'}...`}
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'Under Review', value: 'UNDER_REVIEW' },
                { label: 'Resolved', value: 'RESOLVED' },
                { label: 'Dismissed', value: 'DISMISSED' },
              ],
              onValueChange: setStatusFilter,
            },
          ]}
          onReset={handleResetFilters}
        />

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full md:w-[500px] grid-cols-2">
            <TabsTrigger value="filed" className="font-inter">
              Complaints I Filed
            </TabsTrigger>
            <TabsTrigger value="against" className="font-inter">
              Complaints Against Me
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filed" className="space-y-4 mt-6">
            {currentComplaints.length > 0 ? (
              currentComplaints.map((complaint) => (
                <EnhancedCard key={complaint.id} variant="default" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-poppins text-lg font-semibold text-foreground">
                            Against: {complaint.reportedUser?.name}
                          </h3>
                          <StatusBadge status={complaint.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-inter text-xs">
                            {getCategoryLabel(complaint.category)}
                          </Badge>
                          <span className="font-open-sans text-xs text-muted-foreground">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div>
                        <span className="font-inter font-medium text-sm text-muted-foreground">
                          Reason:
                        </span>
                        <p className="font-open-sans text-sm text-foreground mt-1">
                          {complaint.reason}
                        </p>
                      </div>
                      <div>
                        <span className="font-inter font-medium text-sm text-muted-foreground">
                          Description:
                        </span>
                        <p className="font-open-sans text-sm text-foreground mt-1">
                          {complaint.description}
                        </p>
                      </div>
                    </div>

                    {complaint.adminResponse && (
                      <>
                        <Separator />
                        <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                          <p className="font-inter font-medium text-sm text-info mb-1">
                            Admin Response:
                          </p>
                          <p className="font-open-sans text-sm text-foreground">
                            {complaint.adminResponse}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </EnhancedCard>
              ))
            ) : (
              <EnhancedCard variant="default" className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-open-sans text-base text-muted-foreground">
                  {statusFilter === 'all' && !searchQuery
                    ? 'No complaints filed yet'
                    : 'No complaints match your filters'}
                </p>
              </EnhancedCard>
            )}
          </TabsContent>

          <TabsContent value="against" className="space-y-4 mt-6">
            {currentComplaints.length > 0 ? (
              currentComplaints.map((complaint) => (
                <EnhancedCard key={complaint.id} variant="default" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-poppins text-lg font-semibold text-foreground">
                            Complaint Filed Against You
                            {complaint.reporter?.name && ` by ${complaint.reporter.name}`}
                          </h3>
                          <StatusBadge status={complaint.status} size="sm" />
                          {complaint.actionTaken && (
                            <StatusBadge
                              status={complaint.actionTaken === 'WARNED' ? 'WARNED' : 'SUSPENDED'}
                              size="sm"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-inter text-xs">
                            {getCategoryLabel(complaint.category)}
                          </Badge>
                          <span className="font-open-sans text-xs text-muted-foreground">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div>
                        <span className="font-inter font-medium text-sm text-muted-foreground">
                          Reason:
                        </span>
                        <p className="font-open-sans text-sm text-foreground mt-1">
                          {complaint.reason}
                        </p>
                      </div>
                      <div>
                        <span className="font-inter font-medium text-sm text-muted-foreground">
                          Description:
                        </span>
                        <p className="font-open-sans text-sm text-foreground mt-1">
                          {complaint.description}
                        </p>
                      </div>
                    </div>

                    {complaint.actionTaken && (
                      <>
                        <Separator />
                        <div
                          className={`rounded-lg p-3 border ${
                            complaint.actionTaken === 'SUSPENDED'
                              ? 'bg-error/10 border-error/20'
                              : 'bg-warning/10 border-warning/20'
                          }`}
                        >
                          <p
                            className={`font-inter font-medium text-sm mb-1 ${
                              complaint.actionTaken === 'SUSPENDED' ? 'text-error' : 'text-warning'
                            }`}
                          >
                            Action Taken: {complaint.actionTaken}
                            {complaint.actionTaken === 'SUSPENDED' && (
                              <Ban className="h-4 w-4 inline ml-2" />
                            )}
                            {complaint.actionTaken === 'WARNED' && (
                              <AlertTriangle className="h-4 w-4 inline ml-2" />
                            )}
                          </p>
                          {complaint.adminResponse && (
                            <p className="font-open-sans text-sm text-foreground">
                              {complaint.adminResponse}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {complaint.adminResponse && !complaint.actionTaken && (
                      <>
                        <Separator />
                        <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                          <p className="font-inter font-medium text-sm text-info mb-1">
                            Admin Response:
                          </p>
                          <p className="font-open-sans text-sm text-foreground">
                            {complaint.adminResponse}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </EnhancedCard>
              ))
            ) : (
              <EnhancedCard variant="default" className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-open-sans text-base text-muted-foreground">
                  {statusFilter === 'all' && !searchQuery
                    ? 'No complaints filed against you'
                    : 'No complaints match your filters'}
                </p>
              </EnhancedCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageWrapper>
  );
}
