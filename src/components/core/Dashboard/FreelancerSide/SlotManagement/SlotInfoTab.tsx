'use client';

import { format } from 'date-fns';
import { Edit2, Euro, Mail, MapPin, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { LocationType, Slot } from '@/types/types';

interface SlotInfoTabProps {
  slot: Slot;
}

export const SlotInfoTab = ({ slot }: SlotInfoTabProps) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(slot.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(slot.notes || '');
  }, [slot.notes]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      // POC: Save to localStorage
      const storageKey = `slot_notes_${slot.id}`;
      localStorage.setItem(storageKey, notes);
      setIsEditingNotes(false);
      toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BOOKED':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 font-inter">
            Booked
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 font-inter">
            Completed
          </Badge>
        );
      case 'AVAILABLE':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 font-inter">
            Available
          </Badge>
        );
      case 'RESERVED':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1 font-inter">
            Reserved
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 px-3 py-1 font-inter">
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const safeFormatDate = (dateString: string | undefined | null, formatString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatString);
  };

  const locationText = slot.locationType === LocationType.HOME ? 'Home Visit' : 'Clinic';
  const client = slot.booking?.client;

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-poppins font-semibold text-charcoal">Slot Information</h3>
          <p className="text-sm font-inter text-muted-foreground mt-1">
            View and manage slot details
          </p>
        </div>
        {getStatusBadge(
          slot.booking?.status && slot.booking.status.toUpperCase() === 'COMPLETED'
            ? 'COMPLETED'
            : slot.status,
        )}
      </div>

      {/* Client Information Card (if booked) */}
      {client &&
        (slot.status === 'BOOKED' || slot.booking?.status?.toUpperCase() === 'COMPLETED') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-poppins font-semibold text-charcoal flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="text-xl font-poppins font-semibold bg-primary/10 text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label className="font-inter text-xs text-muted-foreground">Name</Label>
                    <p className="font-poppins font-semibold text-charcoal text-lg">
                      {client.name}
                    </p>
                  </div>
                  <div>
                    <Label className="font-inter text-xs text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Email
                    </Label>
                    <p className="font-inter text-charcoal">{client.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Slot Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Slot Details
          </CardTitle>
          <CardDescription className="font-inter">
            Time, location, and pricing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <Label className="font-inter text-xs text-muted-foreground mb-1">Date</Label>
                <p className="font-poppins font-semibold text-charcoal">
                  {slot.startTime ? safeFormatDate(slot.startTime, 'EEEE, MMM d, yyyy') : 'N/A'}
                </p>
              </div>

              <div>
                <Label className="font-inter text-xs text-muted-foreground mb-1">Time</Label>
                <p className="font-poppins font-semibold text-charcoal text-lg">
                  {slot.startTime
                    ? `${safeFormatDate(slot.startTime, 'h:mm a')} - ${safeFormatDate(
                        slot.endTime || undefined,
                        'h:mm a',
                      )}`
                    : 'Time not available'}
                </p>
                <p className="font-inter text-sm text-muted-foreground mt-1">
                  Duration: {slot.duration || 0} minutes
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <Label className="font-inter text-xs text-muted-foreground mb-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Location Type
                </Label>
                <p className="font-poppins font-semibold text-charcoal text-lg">{locationText}</p>
                {slot.location && (
                  <div className="mt-2">
                    <Label className="font-inter text-xs text-muted-foreground mb-1">Address</Label>
                    <p className="font-inter text-charcoal">{slot.location.address}</p>
                  </div>
                )}
                {slot.booking?.clientAddress && slot.locationType === LocationType.HOME && (
                  <div className="mt-2">
                    <Label className="font-inter text-xs text-muted-foreground mb-1">
                      Client Address
                    </Label>
                    <p className="font-inter text-charcoal">{slot.booking.clientAddress}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="font-inter text-xs text-muted-foreground mb-1 flex items-center gap-2">
                  <Euro className="h-3 w-3" />
                  Price
                </Label>
                <p className="font-poppins font-semibold text-charcoal text-lg">
                  €{slot.basePrice?.toFixed(2) || '0.00'}
                </p>
                {slot.booking?.totalAmount && slot.booking.totalAmount !== slot.basePrice && (
                  <p className="font-inter text-sm text-muted-foreground mt-1">
                    Total: €{slot.booking.totalAmount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Notes (if booked) */}
      {slot.booking?.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
              Booking Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-open-sans text-sm text-charcoal whitespace-pre-wrap">
              {slot.booking.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Slot Notes (Editable) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
                Slot Notes
              </CardTitle>
              <CardDescription className="font-inter">
                Add internal notes about this slot (visible only to you)
              </CardDescription>
            </div>
            {!isEditingNotes && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
                className="font-inter"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this slot..."
                rows={4}
                className="font-open-sans text-sm"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  size="sm"
                  className="font-inter"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNotes(slot.notes || '');
                    setIsEditingNotes(false);
                  }}
                  size="sm"
                  className="font-inter"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="font-open-sans text-sm text-charcoal whitespace-pre-wrap">
              {notes || 'No notes added yet.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Empty State for Available Slots */}
      {slot.status === 'AVAILABLE' && !client && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="font-inter text-muted-foreground">
                This slot is available and waiting for a booking.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
