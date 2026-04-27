'use client';

import { format, isToday, isTomorrow } from 'date-fns';
import {
  ArrowLeft,
  Award,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';
import { ReportFreelancerDialog } from '@/components/core/Dashboard/Complaints/ReportFreelancerDialog';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { ProfileBookingDialog } from '@/components/core/Dashboard/UserSide/Profile/ProfileBookingDialog';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import {
  useFavoriteFreelancer,
  useInfiniteSearchFreelancers,
} from '@/hooks/queries/useFreelancers';
import { useFreelancerRatings } from '@/hooks/queries/useRatings';
import { useAvailableSlots } from '@/hooks/queries/useSlots';
import { Expert, Slot } from '@/types/types';
import { mapOneFreelancerToExpert } from '@/utils/freelancerMapper';

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const freelancerId = params['id'] as string;
  const [expert, setExpert] = useState<Expert | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [preselectedSlotId, setPreselectedSlotId] = useState<string | null>(null);
  const { mutate: toggleFavorite, isPending: isFavoriteLoading } = useFavoriteFreelancer();

  // Fetch freelancer data
  const { data: searchData, isLoading: isLoadingSearch } = useInfiniteSearchFreelancers({
    limit: 1,
    query: freelancerId,
  });

  // Get slots for this freelancer
  const { data: slots = [] } = useAvailableSlots(freelancerId, {});

  // Get ratings for this freelancer
  const { data: ratingsData } = useFreelancerRatings(freelancerId, {
    page: 1,
    limit: 10,
  });

  // Extract expert from search results
  useEffect(() => {
    if (searchData?.pages) {
      const allFreelancers = searchData.pages.flatMap((page) => page.freelancers || []);
      const foundFreelancer = allFreelancers.find((f) => f.id === freelancerId);
      if (foundFreelancer) {
        const mappedExpert = mapOneFreelancerToExpert(foundFreelancer);
        setExpert(mappedExpert);
      }
    }
  }, [searchData, freelancerId]);

  // Calculate slot statistics
  const slotStats = useMemo(() => {
    if (!slots || slots.length === 0) {
      return {
        availableSlots: 0,
        todaySlots: 0,
        tomorrowSlots: 0,
        thisWeekSlots: 0,
        nextAvailable: null as Slot | null,
        upcomingSlots: [] as Slot[],
      };
    }

    const now = new Date();
    const available = slots.filter(
      (slot) => slot.status === 'AVAILABLE' && new Date(slot.startTime) > now,
    );

    const sortedSlots = available.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const todaySlots = sortedSlots.filter((slot) => isToday(new Date(slot.startTime)));
    const tomorrowSlots = sortedSlots.filter((slot) => isTomorrow(new Date(slot.startTime)));

    // Get next 7 days slots
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thisWeekSlots = sortedSlots.filter((slot) => new Date(slot.startTime) <= weekFromNow);

    return {
      availableSlots: available.length,
      todaySlots: todaySlots.length,
      tomorrowSlots: tomorrowSlots.length,
      thisWeekSlots: thisWeekSlots.length,
      nextAvailable: sortedSlots[0] || null,
      upcomingSlots: sortedSlots.slice(0, 6), // Show next 6 slots
    };
  }, [slots]);

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const ratings = ratingsData?.data || [];

    ratings.forEach((rating) => {
      const ratingValue = (rating as { rating?: number })['rating'];
      if (ratingValue && ratingValue >= 1 && ratingValue <= 5) {
        distribution[ratingValue as keyof typeof distribution]++;
      }
    });

    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    return { distribution, total };
  }, [ratingsData]);

  const isLoading = isLoadingSearch && !expert;
  const hasAvailableSlots = slots && slots.length > 0;

  const freelancerName = expert?.name || expert?.cardInfo?.name || 'Freelancer';
  const displayRating =
    expert?.cardInfo?.averageRating !== undefined && expert.cardInfo.averageRating !== null
      ? expert.cardInfo.averageRating
      : (expert?.rating ?? 0);
  const totalRatings = expert?.cardInfo?.totalRatings || 0;

  const handleFavorite = () => {
    if (isFavoriteLoading || !expert) return;
    toggleFavorite(expert.id, {
      onSuccess: () => {
        setExpert({ ...expert, isFavorite: !expert.isFavorite });
      },
    });
  };

  const handleBookNow = (slotId?: string) => {
    if (slotId) {
      setPreselectedSlotId(slotId);
    } else {
      setPreselectedSlotId(null);
    }
    setShowBookingDialog(true);
  };

  const handleMessage = () => {
    router.push(`/dashboard/messages?freelancerId=${freelancerId}`);
  };

  // Format next available slot date nicely
  const formatNextAvailable = (slot: Slot | null) => {
    if (!slot) return 'No slots available';
    const slotDate = new Date(slot.startTime);
    if (isToday(slotDate)) {
      return `Today at ${format(slotDate, 'h:mm a')}`;
    }
    if (isTomorrow(slotDate)) {
      return `Tomorrow at ${format(slotDate, 'h:mm a')}`;
    }
    return format(slotDate, "EEE, MMM d 'at' h:mm a");
  };

  if (isLoading) {
    return (
      <DashboardPageWrapper
        header={
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        }
      >
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

  if (!expert) {
    return (
      <DashboardPageWrapper
        header={
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-2">
            Freelancer Not Found
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We couldn&apos;t find the freelancer you&apos;re looking for.
          </p>
          <Button onClick={() => router.push('/dashboard/explore')} variant="outline">
            Browse Freelancers
          </Button>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <>
      <DashboardPageWrapper
        header={
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Hero Section - Redesigned */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-mint/10 p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Avatar and Basic Info */}
                <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
                  <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white shadow-lg">
                    <ProfileAvatarImage
                      src={expert.profilePicture || undefined}
                      alt={freelancerName}
                    />
                    <AvatarFallback className="bg-primary text-white text-2xl md:text-3xl font-poppins font-bold">
                      {freelancerName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gray-900">
                        {freelancerName}
                      </h1>
                      <VerificationBadge
                        status={expert.verificationStatus || 'unverified'}
                        size="md"
                      />
                    </div>

                    {expert.jobTitle?.name && (
                      <p className="text-lg font-inter text-primary font-medium">
                        {expert.jobTitle.name}
                      </p>
                    )}

                    {/* Rating Summary */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <RatingDisplay
                          rating={displayRating}
                          reviewCount={totalRatings}
                          size="lg"
                          showCount={true}
                        />
                      </div>

                      {(expert.county || expert.cityTown) && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {expert.cityTown && expert.county
                              ? `${expert.cityTown}, ${expert.county}`
                              : expert.county || expert.cityTown}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Stats Pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {slotStats.nextAvailable && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 gap-1.5"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Next: {formatNextAvailable(slotStats.nextAvailable)}
                        </Badge>
                      )}
                      {slotStats.todaySlots > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 gap-1.5"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {slotStats.todaySlots} slot{slotStats.todaySlots > 1 ? 's' : ''} today
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Section */}
                <div className="lg:w-72 space-y-4">
                  {/* Primary CTA */}
                  {hasAvailableSlots ? (
                    <Button
                      className="w-full h-14 text-lg font-semibold shadow-md bg-primary hover:bg-primary/90 text-white rounded-xl"
                      onClick={() => handleBookNow()}
                    >
                      <CalendarDays className="h-5 w-5 mr-2" />
                      Book a Session
                    </Button>
                  ) : (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block w-full">
                            <Button
                              variant="outline"
                              className="w-full h-14 text-lg font-semibold shadow-md bg-gray-100 text-gray-500 border-2 border-gray-300 cursor-not-allowed rounded-xl">
                              disabled
                            >
                              <CalendarDays className="h-5 w-5 mr-2" />
                              No Slots Available
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This freelancer has no available slots right now</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="h-11 flex flex-col items-center gap-0.5 p-2 border-gray-200 hover:border-primary hover:bg-primary/5"
                      onClick={handleFavorite}
                      disabled={isFavoriteLoading}
                    >
                      <Heart
                        className={`h-4 w-4 ${expert.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                      />
                      <span className="text-[10px] text-gray-600">
                        {expert.isFavorite ? 'Saved' : 'Save'}
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-11 flex flex-col items-center gap-0.5 p-2 border-gray-200 hover:border-primary hover:bg-primary/5"
                      onClick={handleMessage}
                    >
                      <MessageCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-[10px] text-gray-600">Message</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-11 flex flex-col items-center gap-0.5 p-2 border-red-200 hover:border-red-400 hover:bg-red-50"
                      onClick={() => setShowReportDialog(true)}
                    >
                      <span className="text-red-500 text-sm">⚠</span>
                      <span className="text-[10px] text-red-600">Report</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 bg-gray-50">
              <div className="p-4 text-center">
                <div className="text-2xl font-poppins font-bold text-primary">
                  {slotStats.availableSlots}
                </div>
                <div className="text-xs font-inter text-gray-500">
                  Available Slots
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-poppins font-bold text-primary">{totalRatings}</div>
                <div className="text-xs font-inter text-gray-500">
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-poppins font-bold text-primary">
                  {displayRating > 0 ? displayRating.toFixed(1) : '—'}
                </div>
                <div className="text-xs font-inter text-gray-500">
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-poppins font-bold text-primary">
                  {slotStats.thisWeekSlots}
                </div>
                <div className="text-xs font-inter text-gray-500 Week</div>">
              </div>
            </div>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl w-full justify-start overflow-x-auto">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Availability
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Reviews ({totalRatings})
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Pricing
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        About {freelancerName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {expert.description ? (
                        <p className="text-sm font-inter text-gray-700 leading-relaxed whitespace-pre-line">
                          {expert.description}
                        </p>
                      ) : (
                        <p className="text-sm font-inter text-gray-500 italic">
                          No description provided yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Services Section */}
                  {expert.serviceCategoryPricing && expert.serviceCategoryPricing.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Services Offered
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {expert.serviceCategoryPricing.map((service) => (
                            <div
                              key={service.serviceId}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="font-inter text-sm text-gray-900">
                                  {service.serviceName}
                                </span>
                              </div>
                              <span className="text-sm font-poppins font-semibold text-primary">
                                From €{service.price?.toFixed(2) || '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Ratings Breakdown */}
                  {totalRatings > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Star className="h-5 w-5 text-primary fill-primary" />
                          Rating Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Overall Rating */}
                          <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-xl min-w-[120px]">
                            <div className="text-4xl font-poppins font-bold text-primary">
                              {displayRating.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(displayRating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{totalRatings} reviews</p>
                          </div>

                          {/* Distribution */}
                          <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => {
                              const count =
                                ratingDistribution.distribution[
                                  stars as keyof typeof ratingDistribution.distribution
                                ];
                              const percentage =
                                ratingDistribution.total > 0
                                  ? (count / ratingDistribution.total) * 100
                                  : 0;
                              return (
                                <div key={stars} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 w-12">
                                    <span className="text-sm font-medium text-gray-700">
                                      {stars}
                                    </span>
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                  </div>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-500 w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  {/* Certifications */}
                  {(expert.verificationStatus === 'APPROVED' ||
                    expert.verificationStatus === 'verified' ||
                    expert.firstAidCertificateStatus === 'APPROVED') && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Award className="h-5 w-5 text-primary" />
                          Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(expert.verificationStatus === 'APPROVED' ||
                          expert.verificationStatus === 'verified') && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">
                              Verified Professional
                            </span>
                          </div>
                        )}
                        {expert.firstAidCertificateStatus === 'APPROVED' && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">
                              First Aid Certified
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-primary" />
                        Quick Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {expert.cardInfo?.yearsOfExperience && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Experience</span>
                          <span className="font-medium">{expert.cardInfo.yearsOfExperience}</span>
                        </div>
                      )}
                      {(expert.county || expert.cityTown) && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Location</span>
                          <span className="font-medium">
                            {expert.cityTown && expert.county
                              ? `${expert.cityTown}, ${expert.county}`
                              : expert.county || expert.cityTown}
                          </span>
                        </div>
                      )}
                      {expert.tier && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Tier</span>
                          <Badge variant="outline" className="capitalize">
                            {expert.tier}
                          </Badge>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Response</span>
                        <span className="font-medium text-green-600">Usually within 24h</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Available Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {slotStats.upcomingSlots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slotStats.upcomingSlots.map((slot) => {
                        const slotDate = new Date(slot.startTime);
                        const endDate = new Date(slot.endTime);
                        const duration = Math.round(
                          (endDate.getTime() - slotDate.getTime()) / (1000 * 60),
                        );

                        return (
                          <button
                            key={slot.id}
                            onClick={() => handleBookNow(slot.id)}
                            className="group p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                                <span className="text-xs font-medium text-primary uppercase">
                                  {format(slotDate, 'MMM')}
                                </span>
                                <span className="text-lg font-bold text-primary">
                                  {format(slotDate, 'd')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {format(slotDate, 'EEEE')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {format(slotDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{duration} min</span>
                              <span className="text-xs font-medium text-primary group-hover:underline">
                                Book →
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No upcoming slots available</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Check back later for new availability
                      </p>
                    </div>
                  )}

                  {slotStats.availableSlots > 6 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => handleBookNow()}>
                        View All {slotStats.availableSlots} Slots
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Availability Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-700">
                          {slotStats.todaySlots}
                        </p>
                        <p className="text-sm text-blue-600 Today</p>">
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-700">
                          {slotStats.tomorrowSlots}
                        </p>
                        <p className="text-sm text-green-600">
                          Available Tomorrow
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CalendarDays className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-700">
                          {slotStats.thisWeekSlots}
                        </p>
                        <p className="text-sm text-purple-600 Week</p>">
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              {totalRatings > 0 ? (
                <>
                  {/* Rating Summary */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="text-center">
                          <div className="text-5xl font-poppins font-bold text-gray-900">
                            {displayRating.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= Math.round(displayRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Based on {totalRatings} review{totalRatings !== 1 ? 's' : ''}
                          </p>
                        </div>

                        <Separator orientation="vertical" className="hidden sm:block h-24" />

                        <div className="flex-1 w-full">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count =
                              ratingDistribution.distribution[
                                stars as keyof typeof ratingDistribution.distribution
                              ];
                            const percentage =
                              ratingDistribution.total > 0
                                ? (count / ratingDistribution.total) * 100
                                : 0;
                            return (
                              <div key={stars} className="flex items-center gap-3 py-1">
                                <div className="flex items-center gap-1 w-16">
                                  <span className="text-sm font-medium">{stars}</span>
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                </div>
                                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-500 w-12 text-right">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reviews List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {ratingsData?.data?.map((rating) => {
                          const patient = (rating as { patient?: { name: string } })['patient'];
                          const createdAt = (rating as { createdAt?: string | Date })['createdAt'];
                          const ratingValue = (rating as { rating?: number })['rating'];
                          const comment = (rating as { comment?: string })['comment'];

                          return (
                            <div
                              key={(rating as { id: string }).id}
                              className="p-4 bg-gray-50 rounded-xl"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {patient?.name?.charAt(0).toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-poppins font-medium text-gray-900">
                                      {patient?.name || 'Anonymous'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {createdAt
                                        ? format(new Date(createdAt), 'MMM d, yyyy')
                                        : 'Unknown date'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= (ratingValue || 0)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'fill-gray-200 text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {comment && (
                                <p className="text-sm text-gray-600">
                                  {comment}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-500">Be the first to review {freelancerName}!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              {/* Duration Pricing */}
              {expert.durationPricing && expert.durationPricing.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Pricing by Session Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {expert.durationPricing
                        .sort((a, b) => a.duration - b.duration)
                        .map((dp) => (
                          <div
                            key={dp.duration}
                            className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 text-center hover:border-primary transition-colors"
                          >
                            <div className="text-xs font-inter text-gray-500 mb-1 uppercase tracking-wide">
                              {dp.duration} minutes
                            </div>
                            <div className="text-2xl font-poppins font-bold text-primary">
                              €{dp.price.toFixed(2)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Category Pricing */}
              {expert.serviceCategoryPricing && expert.serviceCategoryPricing.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Pricing by Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {expert.serviceCategoryPricing.map((sp) => (
                        <div
                          key={sp.serviceId}
                          className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-poppins font-semibold text-gray-900">
                              {sp.serviceName}
                            </h4>
                            <span className="text-lg font-poppins font-bold text-primary">
                              From €{sp.price.toFixed(2)}
                            </span>
                          </div>

                          {sp.locations && sp.locations.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {sp.locations.map((location, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {location.locationType === 'HOME'
                                        ? 'Home Visit'
                                        : 'At Clinic'}
                                    </span>
                                  </div>
                                  <span className="font-poppins font-semibold text-primary">
                                    €{location.price.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No pricing available */}
              {(!expert.durationPricing || expert.durationPricing.length === 0) &&
                (!expert.serviceCategoryPricing || expert.serviceCategoryPricing.length === 0) && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Pricing Not Set
                      </h3>
                      <p className="text-gray-500">
                        Contact {freelancerName} for pricing information
                      </p>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>
          </Tabs>

          {/* Sticky CTA at bottom */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 md:-mx-8 shadow-lg mt-8">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div>
                <p className="font-poppins font-semibold text-gray-900">
                  {freelancerName}
                </p>
                <p className="text-sm text-gray-600">
                  {hasAvailableSlots
                    ? `${slotStats.availableSlots} slots available`
                    : 'No slots available'}
                </p>
              </div>
              {hasAvailableSlots ? (
                <Button
                  className="h-12 px-8 text-base font-semibold shadow-md bg-primary hover:bg-primary/90 text-white rounded-xl"
                  onClick={() => handleBookNow()}
                >
                  Book a Session
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="h-12 px-8 text-base font-semibold shadow-md bg-gray-100 text-gray-500 border-2 border-gray-300 cursor-not-allowed rounded-xl">
                  disabled
                >
                  No Slots Available
                </Button>
              )}
            </div>
          </div>
        </div>
      </DashboardPageWrapper>

      {/* Report Dialog */}
      <ReportFreelancerDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        freelancerId={freelancerId}
        freelancerName={freelancerName}
      />

      {/* Booking Dialog */}
      {expert && (
        <ProfileBookingDialog
          isOpen={showBookingDialog}
          onClose={() => {
            setShowBookingDialog(false);
            setPreselectedSlotId(null);
          }}
          expert={expert}
          preselectedSlotId={preselectedSlotId}
        />
      )}
    </>
  );
}
