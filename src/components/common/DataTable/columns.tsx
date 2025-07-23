'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, Calendar, Clock, MapPin, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// Define the booking type based on API response
export type Booking = {
  id: string;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
    freelancer: {
      id: string;
      name: string;
      specialty: string;
      avatar?: string;
    };
    location?: {
      name: string;
      address: string;
    };
  };
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalAmount: number;
  services?: Array<{
    id: string;
    name: string;
    price: number;
    duration?: string;
  }>;
  notes?: string;
  createdAt: string;
};

// Booking Details Modal Component
const BookingDetailsModal = ({
  booking,
  isOpen,
  onClose,
}: {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();

  const handleReschedule = () => {
    if (booking?.slot?.freelancer?.id) {
      router.push(
        `/dashboard/doctors/${booking.slot.freelancer.id}?rescheduleBookingId=${booking.id}`,
      );
      onClose();
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

  if (!booking) return null;

  const freelancer = booking.slot.freelancer;
  const slot = booking.slot;
  const location = slot.location;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Booking Details</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(booking.status)}
              {booking.status === 'CONFIRMED' && (
                <Button onClick={handleReschedule} variant="outline" size="sm">
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
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Healthcare Professional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg font-bold">
                        {freelancer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{freelancer.name}</h3>
                        <p className="text-gray-600">{freelancer.specialty}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                          {slot.startTime
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
                          {slot.startTime && slot.endTime
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
                    <CardTitle className="text-lg">Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {booking.services.map((service, index) => (
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
                    <CardTitle className="text-lg">Notes</CardTitle>
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
                      <span className="text-gray-600">Created</span>
                      <span className="text-sm">
                        {booking.createdAt
                          ? format(new Date(booking.createdAt), 'MMM d, yyyy')
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {booking.services && booking.services.length > 0 && (
                      <>
                        {booking.services.map((service, index) => (
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Booking Actions Component
const BookingActions = ({ booking }: { booking: Booking }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReschedule = () => {
    const url = `/dashboard/doctors/${booking.slot.freelancer.id}?rescheduleBookingId=${booking.id}`;
    console.log('Navigating to reschedule:', url);
    router.push(url);
  };

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleViewDetails} className="text-xs">
          View
        </Button>
        {booking.status === 'CONFIRMED' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReschedule}
            className="text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            Reschedule
          </Button>
        )}
      </div>

      <BookingDetailsModal
        booking={booking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'slot.freelancer.name',
    header: () => {
      return (
        <div className="font-semibold text-sm text-black text-left">Healthcare Professional</div>
      );
    },
    cell: ({ row }) => {
      const freelancer = row.original.slot.freelancer;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-bold">
              {freelancer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 text-sm">{freelancer.name}</div>
            <div className="text-xs text-gray-500">{freelancer.specialty}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'slot.startTime',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold text-sm text-black text-left hover:bg-transparent p-0"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startTime = new Date(row.original.slot.startTime);
      return (
        <div className="font-medium text-gray-900 text-sm whitespace-nowrap text-left">
          {format(startTime, 'MMM d, yyyy')}
        </div>
      );
    },
  },
  {
    accessorKey: 'slot.startTime',
    header: () => {
      return (
        <div className="font-semibold text-sm text-black text-left flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Time
        </div>
      );
    },
    cell: ({ row }) => {
      const startTime = new Date(row.original.slot.startTime);
      const endTime = new Date(row.original.slot.endTime);
      return (
        <div className="text-sm text-gray-600 whitespace-nowrap text-left">
          {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
        </div>
      );
    },
  },
  {
    accessorKey: 'slot.location.name',
    header: () => {
      return (
        <div className="font-semibold text-sm text-black text-left flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Location
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 whitespace-nowrap text-left">
        {row.original.slot.location?.name || 'Not specified'}
      </div>
    ),
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold text-sm text-black text-left hover:bg-transparent p-0"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('totalAmount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);

      return (
        <div className="font-medium text-gray-900 text-sm whitespace-nowrap text-left">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => {
      return <div className="font-semibold text-sm text-black text-left">Status</div>;
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

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
    },
  },
  {
    id: 'actions',
    header: () => {
      return <div className="font-semibold text-sm text-black text-left">Actions</div>;
    },
    cell: ({ row }) => {
      const booking = row.original;
      return <BookingActions booking={booking} />;
    },
  },
];

// Sample data for testing - this will be replaced by real API data
export const sampleBookings: Booking[] = [
  {
    id: '1',
    slot: {
      id: 'slot1',
      startTime: '2025-04-01T17:00:00Z',
      endTime: '2025-04-01T18:00:00Z',
      freelancer: {
        id: 'freelancer1',
        name: 'Dr. Jane Cooper',
        specialty: 'Physiotherapy',
      },
      location: {
        name: 'Dublin Medical Center',
        address: '123 Healthcare St, Dublin',
      },
    },
    status: 'CONFIRMED',
    totalAmount: 200,
    services: [{ id: 'service1', name: 'Therapeutic Massage', price: 200 }],
    createdAt: '2025-03-25T10:00:00Z',
  },
  {
    id: '2',
    slot: {
      id: 'slot2',
      startTime: '2025-04-02T18:00:00Z',
      endTime: '2025-04-02T19:00:00Z',
      freelancer: {
        id: 'freelancer2',
        name: 'Dr. Floyd Miles',
        specialty: 'Chiropractic',
      },
      location: {
        name: 'Wellness Clinic',
        address: '456 Health Ave, Dublin',
      },
    },
    status: 'PENDING',
    totalAmount: 150,
    services: [{ id: 'service2', name: 'Chiropractic Adjustment', price: 150 }],
    createdAt: '2025-03-26T14:30:00Z',
  },
  {
    id: '3',
    slot: {
      id: 'slot3',
      startTime: '2025-04-03T18:00:00Z',
      endTime: '2025-04-03T19:30:00Z',
      freelancer: {
        id: 'freelancer3',
        name: 'Dr. Ronald Richards',
        specialty: 'Sports Medicine',
      },
      location: {
        name: 'Sports Medicine Center',
        address: '789 Fitness Blvd, Dublin',
      },
    },
    status: 'CANCELLED',
    totalAmount: 300,
    services: [{ id: 'service3', name: 'Sports Injury Assessment', price: 300 }],
    createdAt: '2025-03-27T09:15:00Z',
  },
  {
    id: '4',
    slot: {
      id: 'slot4',
      startTime: '2025-04-04T20:00:00Z',
      endTime: '2025-04-04T21:00:00Z',
      freelancer: {
        id: 'freelancer4',
        name: 'Dr. Marvin McKinney',
        specialty: 'Rehabilitation',
      },
      location: {
        name: 'Rehab Center',
        address: '321 Recovery Rd, Dublin',
      },
    },
    status: 'COMPLETED',
    totalAmount: 500,
    services: [{ id: 'service4', name: 'Rehabilitation Session', price: 500 }],
    createdAt: '2025-03-28T16:45:00Z',
  },
];

// Legacy export for backward compatibility
export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
];
