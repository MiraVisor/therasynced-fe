import { format } from 'date-fns';
import { CheckCircle2, Edit2, Mail, MapPin, Package, Save, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocationType, Slot } from '@/types/types';

interface SlotDetailsDialogProps {
  slot: Slot;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (slotId: string) => void;
  onEdit?: (slot: Slot) => void;
}

export const SlotDetailsDialog: React.FC<SlotDetailsDialogProps> = ({ slot, isOpen, onClose }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(slot.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update notes when slot changes
  useEffect(() => {
    setNotes(slot.notes || '');
  }, [slot.notes]);

  // Debug: Log service categories
  useEffect(() => {
    if (isOpen) {
      console.log('Slot in dialog:', slot);
      console.log('Available Service Categories:', slot.availableServiceCategories);
      console.log('Available Service Categories length:', slot.availableServiceCategories?.length);
    }
  }, [isOpen, slot]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Booked
          </Badge>
        );
      case 'AVAILABLE':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">Available</Badge>
        );
      case 'RESERVED':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1">
            Reserved
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 px-3 py-1">
            <XCircle className="h-3 w-3 mr-1.5" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      // TODO: Call API to update slot notes
      // await dispatch(updateSlot({ id: slot.id, notes }));
      setIsEditingNotes(false);
      // toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const locationText = slot.locationType === LocationType.HOME ? 'Home Visit' : 'Clinic';

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined | null, formatString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatString);
  };

  // Safely create date objects

  const client = slot.booking?.client;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="font-poppins text-2xl font-bold text-charcoal">
                Slot Details
              </DialogTitle>
              {getStatusBadge(slot.status)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          {/* Client Information Section (if booked) */}
          {slot.status === 'BOOKED' && client && (
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="text-xl font-poppins font-semibold bg-primary/10 text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-poppins text-xl font-bold text-charcoal mb-1">
                    {client.name}
                  </h3>
                  <p className="font-inter text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Two Column Information Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
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

              <div>
                <Label className="font-inter text-xs text-muted-foreground mb-1">Price</Label>
                <p className="font-poppins text-xl font-bold text-charcoal">€{slot.basePrice}</p>
                {slot.booking && (
                  <p className="font-inter text-sm text-muted-foreground mt-1">
                    Total: €{slot.booking.totalAmount}
                  </p>
                )}
              </div>

              {slot.startTime && (
                <div>
                  <Label className="font-inter text-xs text-muted-foreground mb-1">Slot Date</Label>
                  <p className="font-poppins font-semibold text-charcoal">
                    {safeFormatDate(slot.startTime, 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <Label className="font-inter text-xs text-muted-foreground mb-1">Location</Label>
                <p className="font-poppins font-semibold text-charcoal text-lg">{locationText}</p>
                {slot.location && (
                  <p className="font-inter text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {slot.location.name}
                  </p>
                )}
              </div>

              {slot.location && (
                <div>
                  <Label className="font-inter text-xs text-muted-foreground mb-1">Address</Label>
                  <p className="font-inter text-charcoal">{slot.location.address}</p>
                  {slot.location.additionalFee > 0 && (
                    <p className="font-inter text-sm text-muted-foreground mt-1">
                      Additional Fee: €{slot.location.additionalFee}
                    </p>
                  )}
                </div>
              )}

              {slot.reservedUntil && (
                <div>
                  <Label className="font-inter text-xs text-muted-foreground mb-1">
                    Reserved Until
                  </Label>
                  <p className="font-poppins font-semibold text-charcoal">
                    {safeFormatDate(slot.reservedUntil, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Available Service Categories */}
          {slot.availableServiceCategories && slot.availableServiceCategories.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <Label className="font-inter text-xs text-muted-foreground mb-2 block">
                Available Service Categories
              </Label>
              <div className="space-y-2">
                {slot.availableServiceCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins font-semibold text-charcoal mb-1">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="font-inter text-sm text-muted-foreground mb-1">
                          {category.description}
                        </p>
                      )}
                      {category.jobTitle && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {category.jobTitle.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Services (if booked) */}
          {slot.booking && slot.booking.services && slot.booking.services.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <Label className="font-inter text-xs text-muted-foreground mb-2 block">
                Booked Services
              </Label>
              <div className="space-y-2">
                {slot.booking.services.map((service: any, index: number) => (
                  <div
                    key={service.id || index}
                    className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200"
                  >
                    <span className="font-poppins font-semibold text-charcoal">
                      {service.name || 'Service'}
                    </span>
                    {service.price && (
                      <span className="font-inter text-sm text-muted-foreground">
                        €{service.price}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Notes (if booked) */}
          {slot.booking?.notes && (
            <div className="mt-6 pt-6 border-t">
              <Label className="font-inter text-xs text-muted-foreground mb-2 block">
                Client Notes
              </Label>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-inter text-sm text-charcoal whitespace-pre-wrap">
                  {slot.booking.notes}
                </p>
              </div>
            </div>
          )}

          {/* Slot Notes - Editable */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-inter text-xs text-muted-foreground">Your Notes</Label>
              {!isEditingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingNotes(true)}
                  className="h-7 px-2 text-xs"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this slot..."
                  className="min-h-[80px] font-inter text-sm"
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
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 min-h-[50px] border border-gray-200">
                {notes ? (
                  <p className="font-inter text-sm text-charcoal whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="font-inter text-sm text-muted-foreground italic">
                    No notes added yet.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cancellation Info */}
          {slot.status === 'CANCELLED' && slot.booking && (
            <div className="mt-6 pt-6 border-t">
              <Label className="font-inter text-xs text-muted-foreground mb-2 block">
                Cancellation Information
              </Label>
              <p className="font-inter text-sm text-muted-foreground">
                Cancelled on {safeFormatDate(slot.booking.updatedAt, 'MMMM d, yyyy')} at{' '}
                {safeFormatDate(slot.booking.updatedAt, 'h:mm a')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
