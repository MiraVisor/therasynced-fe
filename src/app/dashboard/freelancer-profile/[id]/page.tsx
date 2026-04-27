'use client';

import { format } from 'date-fns';
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
import { useMemo, useState } from 'react';

import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';
import { ReportFreelancerDialog } from '@/components/core/Dashboard/Complaints/ReportFreelancerDialog';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationBadge } from '@/components/ui/verification-badge';
import {
  useFavoriteFreelancer,
  useFavoriteFreelancers,
  useFreelancerById,
} from '@/hooks/queries/useFreelancers';
import { useFreelancerRatings } from '@/hooks/queries/useRatings';
import { useAvailableSlots } from '@/hooks/queries/useSlots';

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const freelancerId = params['id'] as string;
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { mutate: toggleFavorite, isPending: isFavoriteLoading } = useFavoriteFreelancer();

  // Fetch freelancer details using the new endpoint
  const { data: freelancerData, isLoading, error } = useFreelancerById(freelancerId);

  // Get slots for availability display
  const { data: slots = [] } = useAvailableSlots(freelancerId, {});

  // Get ratings for display
  const { data: ratingsData } = useFreelancerRatings(freelancerId, {
    page: 1,
    limit: 10,
  });

  // Calculate slot statistics
  const slotStats = useMemo(() => {
    if (!slots || slots.length === 0) {
      return {
        availableSlots: 0,
        todaySlots: 0,
        tomorrowSlots: 0,
        thisWeekSlots: 0,
        upcomingSlots: [] as typeof slots,
      };
    }

    const now = new Date();
    const available = slots.filter(
      (slot) => slot.status === 'AVAILABLE' && new Date(slot.startTime) > now,
    );

    const sortedSlots = available.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const todaySlots = sortedSlots.filter(
      (slot) => format(new Date(slot.startTime), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'),
    );
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowSlots = sortedSlots.filter(
      (slot) => format(new Date(slot.startTime), 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd'),
    );

    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thisWeekSlots = sortedSlots.filter((slot) => new Date(slot.startTime) <= weekFromNow);

    return {
      availableSlots: available.length,
      todaySlots: todaySlots.length,
      tomorrowSlots: tomorrowSlots.length,
      thisWeekSlots: thisWeekSlots.length,
      upcomingSlots: sortedSlots.slice(0, 6),
    };
  }, [slots]);

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const ratings = ratingsData?.data || [];

    ratings.forEach((rating: { rating?: number }) => {
      const ratingValue = rating.rating || 0;
      if (ratingValue >= 1 && ratingValue <= 5) {
        distribution[ratingValue as keyof typeof distribution]++;
      }
    });

    return {
      distribution,
      total: ratings.length,
    };
  }, [ratingsData]);

  // Calculate average rating
  const displayRating = useMemo(() => {
    const ratings = ratingsData?.data || [];
    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc: number, rating: { rating?: number }) => {
      return acc + (rating.rating || 0);
    }, 0);

    return sum / ratings.length;
  }, [ratingsData]);

  const totalRatings = ratingsData?.data?.length || 0;
  const freelancerName = freelancerData?.profile?.name || 'Unknown';
  const { data: favoriteFreelancers = [] } = useFavoriteFreelancers();
  const isFavorite = favoriteFreelancers.some((fav) => fav.id === freelancerId);

  const handleFavorite = () => {
    if (freelancerId) {
      toggleFavorite(freelancerId);
    }
  };

  const handleMessage = () => {
    if (freelancerId) {
      router.push(`/dashboard/chat?userId=${freelancerId}`);
    }
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

  if (error || !freelancerData) {
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
          <Button onClick={() => router.push('/dashboard/book')} variant="outline">
            Browse Freelancers
          </Button>
        </div>
      </DashboardPageWrapper>
    );
  }

  const { profile, jobTitle, serviceCategories, slotDurations, serviceLocationPricing } =
    freelancerData;

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
          {/* Hero Section */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-mint/10 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white shadow-lg">
                  <ProfileAvatarImage
                    src={profile.profilePicture || undefined}
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
                      status={
                        (profile.verificationStatus as
                          | 'APPROVED'
                          | 'verified'
                          | 'unverified'
                          | 'pending'
                          | 'rejected'
                          | 'PENDING'
                          | 'REJECTED'
                          | 'UNVERIFIED') || 'unverified'
                      }
                      size="md"
                    />
                  </div>

                  {jobTitle?.name && (
                    <p className="text-lg font-inter text-primary font-medium">{jobTitle.name}</p>
                  )}

                  {/* Rating Stars */}
                  {totalRatings > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= Math.floor(displayRating);
                          const isHalf =
                            star === Math.ceil(displayRating) && displayRating % 1 !== 0;
                          return (
                            <div key={star} className="relative h-5 w-5">
                              <Star className="h-5 w-5 fill-gray-200 text-gray-300" />
                              {(isFilled || isHalf) && (
                                <div
                                  className={`absolute inset-0 overflow-hidden ${isHalf ? 'w-1/2' : 'w-full'}`}
                                >
                                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {displayRating.toFixed(1)} ({totalRatings} review
                        {totalRatings !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}

                  {/* Location - Below Ratings */}
                  {(profile.county || profile.cityTown) && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {profile.cityTown && profile.county
                          ? `${profile.cityTown}, ${profile.county}`
                          : profile.county || profile.cityTown}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-50 border border-gray-200 p-1 rounded-xl w-full justify-start gap-1 h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 =inactive]:text-gray-400 =inactive]:hover:text-gray-200"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 =inactive]:text-gray-400 =inactive]:hover:text-gray-200"
              >
                Availability
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 =inactive]:text-gray-400 =inactive]:hover:text-gray-200"
              >
                Pricing
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Action Buttons */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-gray-200 hover:border-primary hover:bg-primary/5"
                      onClick={handleFavorite}
                      disabled={isFavoriteLoading}
                    >
                      <Heart
                        className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                      />
                      <span>{isFavorite ? 'Saved' : 'Save'}</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-gray-200 hover:border-primary hover:bg-primary/5"
                      onClick={handleMessage}
                    >
                      <MessageCircle className="h-4 w-4 text-gray-500" />
                      <span>Message</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-red-200 hover:border-red-400 hover:bg-red-50"
                      onClick={() => setShowReportDialog(true)}
                    >
                      <span className="text-red-500">⚠</span>
                      <span className="text-red-600">Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                      {profile.description ? (
                        <p className="text-sm font-inter text-gray-700 leading-relaxed whitespace-pre-line">
                          {profile.description}
                        </p>
                      ) : (
                        <p className="text-sm font-inter text-gray-500 italic">
                          No description provided yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Services Section */}
                  {serviceCategories && serviceCategories.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Services Offered
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {serviceCategories.map((service) => (
                            <div
                              key={service.id}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                            >
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="font-inter text-sm text-gray-900">
                                {service.name}
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
                              {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = star <= Math.floor(displayRating);
                                const isHalf =
                                  star === Math.ceil(displayRating) && displayRating % 1 !== 0;
                                return (
                                  <div key={star} className="relative h-4 w-4">
                                    <Star className="h-4 w-4 fill-gray-200 text-gray-300" />
                                    {(isFilled || isHalf) && (
                                      <div
                                        className={`absolute inset-0 overflow-hidden ${isHalf ? 'w-1/2' : 'w-full'}`}
                                      >
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
                  {profile.verificationStatus === 'APPROVED' &&
                    profile.verificationStatus !== null && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Award className="h-5 w-5 text-primary" />
                            Certifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">
                              Verified Professional
                            </span>
                          </div>
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
                      {(profile.county || profile.cityTown) && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Location</span>
                          <span className="font-medium">
                            {profile.cityTown && profile.county
                              ? `${profile.cityTown}, ${profile.county}`
                              : profile.county || profile.cityTown}
                          </span>
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
                          <div
                            key={slot.id}
                            className="p-4 border border-gray-200 rounded-xl"
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
                            <div className="text-xs text-gray-500">{duration} min</div>
                          </div>
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
                        <p className="text-sm text-blue-600">Available Today</p>
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
                        <p className="text-sm text-purple-600">This Week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              {/* Duration Pricing */}
              {slotDurations && slotDurations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Pricing by Session Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {slotDurations
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

              {/* Service Location Pricing */}
              {serviceLocationPricing && serviceLocationPricing.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Pricing by Service & Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Group by service category */}
                      {serviceCategories.map((service) => {
                        const servicePricing = serviceLocationPricing.filter(
                          (p) => p.serviceCategory.id === service.id,
                        );

                        if (servicePricing.length === 0) return null;

                        return (
                          <div
                            key={service.id}
                            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                          >
                            <h4 className="font-poppins font-semibold text-gray-900 mb-3">
                              {service.name}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {servicePricing.map((location, idx) => (
                                <div
                                  key={`${location.locationType}-${idx}`}
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
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No pricing available */}
              {(!slotDurations || slotDurations.length === 0) &&
                (!serviceLocationPricing || serviceLocationPricing.length === 0) && (
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
        </div>
      </DashboardPageWrapper>

      {/* Report Dialog */}
      <ReportFreelancerDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        freelancerId={freelancerId}
        freelancerName={freelancerName}
      />
    </>
  );
}
