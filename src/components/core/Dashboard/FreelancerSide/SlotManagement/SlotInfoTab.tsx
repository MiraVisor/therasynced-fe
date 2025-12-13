'use client';

import { format } from 'date-fns';
import {
  Building,
  Clock,
  DollarSign,
  Edit2,
  Home,
  MessageCircle,
  Save,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { LocationType, Slot } from '@/types/types';

interface SlotInfoTabProps {
  slot: Slot;
}

export const SlotInfoTab: React.FC<SlotInfoTabProps> = ({ slot }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(slot.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return (
          <Badge className="bg-success/10 text-success border border-success/20">✓ Booked</Badge>
        );
      case 'AVAILABLE':
        return <Badge className="bg-info/10 text-info border border-info/20">○ Available</Badge>;
      case 'RESERVED':
        return (
          <Badge className="bg-warning/10 text-warning border border-warning/20">◐ Reserved</Badge>
        );
      case 'CANCELLED':
        return <Badge className="bg-error/10 text-error border border-error/20">× Cancelled</Badge>;
      default:
        return null;
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      // For POC: Save to localStorage
      const storedSlots = localStorage.getItem('slots');
      if (storedSlots) {
        try {
          const parsedSlots = JSON.parse(storedSlots);
          const updatedSlots = parsedSlots.map((s: Slot) =>
            s.id === slot.id ? { ...s, notes } : s,
          );
          localStorage.setItem('slots', JSON.stringify(updatedSlots));
        } catch (error) {
          console.error('Error updating notes:', error);
        }
      }
      setIsEditingNotes(false);
      // In a real app, you would call the API here
      // await dispatch(updateSlot({ id: slot.id, notes }));
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const locationIcon =
    slot.locationType === LocationType.HOME ? (
      <Home className="h-4 w-4" />
    ) : (
      <Building className="h-4 w-4" />
    );

  const locationText = slot.locationType === LocationType.HOME ? 'Home Visit' : 'Clinic';

  const slotDate = new Date(slot.startTime);
  const slotEndTime = new Date(new Date(slot.startTime).getTime() + slot.duration * 60000);

  const client = slot.booking?.client;

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h3 className="font-poppins text-xl font-bold text-charcoal">Slot Information</h3>
            <p className="font-inter text-muted-foreground mt-1">
              {format(slotDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {getStatusBadge(slot.status)}
        </div>

        {/* Time and Duration */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-poppins font-semibold text-charcoal mb-1">Time</h4>
            <p className="font-inter text-muted-foreground">
              {format(slotDate, 'h:mm a')} - {format(slotEndTime, 'h:mm a')}
            </p>
            <p className="font-inter text-sm text-muted-foreground mt-1">
              Duration: {slot.duration} minutes
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-teal/10">{locationIcon}</div>
          <div className="flex-1">
            <h4 className="font-poppins font-semibold text-charcoal mb-1">Location</h4>
            <p className="font-inter text-muted-foreground">{locationText}</p>
            {slot.location && (
              <p className="font-inter text-sm text-muted-foreground mt-1">
                {slot.location.name} - {slot.location.address}
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-success/10">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <h4 className="font-poppins font-semibold text-charcoal mb-1">Price</h4>
            <p className="font-poppins text-xl font-bold text-charcoal">€{slot.basePrice}</p>
          </div>
        </div>

        {/* Form Type */}
        {slot.formType && slot.formType !== 'NONE' && (
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-info/10">
              <MessageCircle className="h-5 w-5 text-info" />
            </div>
            <div className="flex-1">
              <h4 className="font-poppins font-semibold text-charcoal mb-1">Form Type</h4>
              <p className="font-inter text-muted-foreground">{slot.formType}</p>
            </div>
          </div>
        )}

        {/* Client Information (if booked) */}
        {slot.status === 'BOOKED' && client && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-poppins font-semibold text-charcoal">Client Information</h4>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="text-lg font-poppins font-semibold bg-primary/10 text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-poppins font-semibold text-charcoal">Client</h4>
                  <p className="font-inter text-muted-foreground">{client.name}</p>
                  <p className="font-inter text-sm text-muted-foreground">{client.email}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Booking Notes (if available) */}
        {slot.booking?.notes && (
          <>
            <Separator />
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-info/10">
                <MessageCircle className="h-5 w-5 text-info" />
              </div>
              <div className="flex-1">
                <h4 className="font-poppins font-semibold text-charcoal mb-2">Client Notes</h4>
                <div className="bg-mint/30 rounded-lg p-3">
                  <p className="font-inter text-sm text-charcoal">{slot.booking.notes}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cancelled Info */}
        {slot.status === 'CANCELLED' && slot.booking && (
          <>
            <Separator />
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-error/10">
                <XCircle className="h-5 w-5 text-error" />
              </div>
              <div className="flex-1">
                <h4 className="font-poppins font-semibold text-charcoal mb-1">Cancellation Info</h4>
                <p className="font-inter text-sm text-muted-foreground">
                  Cancelled on {format(new Date(slot.booking.updatedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Slot Notes - Editable */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <Label className="font-poppins font-semibold text-charcoal">Your Notes</Label>
            </div>
            {!isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
                className="h-8 px-3 text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1.5" />
                Edit
              </Button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this slot (e.g., preparation, special instructions)..."
                className="min-h-[100px] font-inter text-sm"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingNotes(false);
                    setNotes(slot.notes || '');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {isSaving ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-mint/30 rounded-lg p-4 min-h-[60px]">
              {notes ? (
                <p className="font-inter text-sm text-charcoal whitespace-pre-wrap">{notes}</p>
              ) : (
                <p className="font-inter text-sm text-muted-foreground italic">
                  No notes added yet. Click edit to add notes.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
