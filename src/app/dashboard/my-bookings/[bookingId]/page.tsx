'use client';

import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { clearSelectedBooking } from '@/redux/slices/bookingSlice';
import { RootState } from '@/redux/store';

export default function BookingDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedBooking } = useSelector((state: RootState) => state.booking);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedBooking());
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedBooking?.error) {
      toast.error(selectedBooking.error);
    }
  }, [selectedBooking?.error]);

  const handleBack = () => {
    router.push('/dashboard/my-bookings');
  };

  const handleReschedule = () => {
    if (selectedBooking?.slot?.freelancer?.id) {
      router.push(
        `/dashboard/doctors/${selectedBooking.slot.freelancer.id}?rescheduleBookingId=${selectedBooking.id}`,
      );
    }
  };

  const getStatusBadge = (status: string) => {
    let badgeProps = {
      variant: 'secondary' as 'default' | 'secondary',
      className: 'text-sm',
      label: status,
    };

    switch (status) {
      case 'CONFIRMED':
        badgeProps = {
          variant: 'default',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 text-sm',
          label: 'Confirmed',
        };
        break;
      case 'PENDING':
        badgeProps = {
          variant: 'secondary',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-sm',
          label: 'Pending',
        };
        break;
      case 'CANCELLED':
        badgeProps = {
          variant: 'secondary',
          className: 'bg-red-100 text-red-800 hover:bg-red-100 text-sm',
          label: 'Cancelled',
        };
        break;
      case 'COMPLETED':
        badgeProps = {
          variant: 'secondary',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm',
          label: 'Completed',
        };
        break;
      default:
        badgeProps = {
          variant: 'secondary',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 text-sm',
          label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        };
    }

    return (
      <Badge variant={badgeProps.variant} className={badgeProps.className}>
        {badgeProps.label}
      </Badge>
    );
  };

  const booking = selectedBooking;

  if (!booking) {
    return <div>Loading...</div>;
  }

  // Debug: Display the selectedBooking object as JSON
  return (
    <DashboardPageWrapper>
      <div className="space-y-6">
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto mb-4">
          {JSON.stringify(booking, null, 2)}
        </pre>
        {(() => {
          const freelancer = booking.slot?.freelancer;
          const slot = booking.slot;
          const location = slot?.location;
          return (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                    <p className="text-gray-600">Booking ID: {booking.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(booking.status)}
                  {booking.status === 'CONFIRMED' && (
                    <Button onClick={handleReschedule} variant="outline">
                      Reschedule
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Healthcare Professional */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Healthcare Professional
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="text-lg font-bold">
                            {freelancer?.name?.charAt(0) || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {freelancer?.name || 'Unknown'}
                            </h3>
                            <p className="text-gray-600">
                              {freelancer?.specialty || 'Healthcare Professional'}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {freelancer?.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{freelancer.rating}</span>
                                {freelancer.numberOfRatings && (
                                  <span>({freelancer.numberOfRatings} reviews)</span>
                                )}
                              </div>
                            )}
                            {freelancer?.yearsOfExperience && (
                              <span>{freelancer.yearsOfExperience}+ years experience</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Appointment Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Appointment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">
                              {slot?.startTime
                                ? format(new Date(slot.startTime), 'EEEE, MMMM d, yyyy')
                                : 'Not specified'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium">
                              {slot?.startTime && slot?.endTime
                                ? `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`
                                : 'Not specified'}
                            </p>
                          </div>
                        </div>
                        {location && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium">{location.name}</p>
                              <p className="text-sm text-gray-600">{location.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Services */}
                  {booking.services && booking.services.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Services
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {booking.services.map((service: any, index: number) => (
                            <div
                              key={service.id || index}
                              className="flex justify-between items-center py-2"
                            >
                              <div>
                                <p className="font-medium">{service.name}</p>
                                {service.duration && (
                                  <p className="text-sm text-gray-500">{service.duration}</p>
                                )}
                              </div>
                              <p className="font-medium">€{service.price}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes */}
                  {booking.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{booking.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Booking Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Booking ID</span>
                          <span className="font-mono text-sm">{booking.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Created</span>
                          <span className="text-sm">
                            {booking.createdAt
                              ? format(new Date(booking.createdAt), 'MMM d, yyyy')
                              : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {booking.services && booking.services.length > 0 && (
                          <>
                            {booking.services.map((service: any, index: number) => (
                              <div
                                key={service.id || index}
                                className="flex justify-between items-center"
                              >
                                <span className="text-gray-600">{service.name}</span>
                                <span>€{service.price}</span>
                              </div>
                            ))}
                            <Separator />
                          </>
                        )}
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total</span>
                          <span className="text-blue-600">€{booking.totalAmount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  {freelancer && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{freelancer.name}</span>
                        </div>
                        {freelancer.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{freelancer.email}</span>
                          </div>
                        )}
                        {freelancer.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{freelancer.phone}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </DashboardPageWrapper>
  );
}
