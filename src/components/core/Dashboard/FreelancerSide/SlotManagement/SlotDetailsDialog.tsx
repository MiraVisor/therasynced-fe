import { format } from 'date-fns';
import {
  Award,
  CheckCircle2,
  Edit2,
  FileText,
  Gift,
  Mail,
  MessageSquare,
  Package,
  Save,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { InvoiceGenerationDialog } from '@/components/core/Dashboard/FreelancerSide/Appointment/InvoiceGenerationDialog';
import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { bookingService } from '@/services/bookingService';
import { Appointment, LocationType, Slot } from '@/types/types';

interface SlotDetailsDialogProps {
  slot: Slot;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (slotId: string) => void;
  onEdit?: (slot: Slot) => void;
  onComplete?: () => void;
}

export const SlotDetailsDialog: React.FC<SlotDetailsDialogProps> = ({
  slot,
  isOpen,
  onClose,
  onComplete,
  onDelete,
}) => {
  const router = useRouter();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(slot.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  // Update notes when slot changes
  useEffect(() => {
    setNotes(slot.notes || '');
  }, [slot.notes]);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BOOKED':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Booked
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Completed
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

  const handleCompleteBooking = async () => {
    if (!slot.booking?.id) {
      toast.error('Booking ID not found');
      return;
    }

    setIsCompleting(true);
    let successShown = false;

    try {
      const response = await bookingService.completeBooking({
        bookingId: slot.booking.id,
      });

      // Check if response is successful
      if (response?.success) {
        successShown = true;
        toast.success(
          'Appointment marked as completed! ✅ The client will receive a stamp for this booking.',
        );

        // Call callbacks safely - don't let errors in callbacks trigger error toast
        try {
          onComplete?.();
        } catch (callbackError) {
          console.error('Error in onComplete callback:', callbackError);
          // Don't show error toast for callback errors
        }

        // Close dialog after a small delay to ensure success toast is visible
        setTimeout(() => {
          try {
            onClose();
          } catch (closeError) {
            console.error('Error closing dialog:', closeError);
          }
        }, 100);
      } else {
        // Response exists but success is false
        const errorMessage = response?.message || 'Failed to complete booking';
        toast.error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete booking';
      console.error('Booking completion error:', error);
      // Only show error toast if we haven't already shown success
      if (!successShown) {
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Failed to complete booking';
        console.error('Error completing booking:', error);
        toast.error(errorMessage);
      } else {
        // Log the error but don't show toast since we already showed success
        console.error('Error after successful completion:', error);
      }
    } finally {
      setIsCompleting(false);
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

  // Handle message button click for booked slots
  const handleMessage = () => {
    const client = slot.booking?.client;
    if (client?.id) {
      router.push(`/dashboard/messages?userId=${client.id}`);
      onClose();
    } else {
      toast.error('Client information not available');
    }
  };

  const client = slot.booking?.client;

  // Convert slot to appointment format for invoice generation
  const convertSlotToAppointment = (): Appointment | null => {
    if (!slot.booking || !client) return null;

    return {
      id: slot.booking.id,
      title: `Session with ${client.name}`,
      start: slot.startTime,
      end: slot.endTime || slot.startTime,
      status: slot.booking.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
      clientName: client.name,
      location: slot.locationType,
      notes: slot.booking.notes || slot.notes || '',
      locationType: slot.locationType,
      clientAddress: slot.locationType === LocationType.HOME ? slot.booking.clientAddress : null,
      freelancer: {
        clinicAddress: slot.location?.address || null,
      },
    };
  };

  const appointmentData = convertSlotToAppointment();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <DialogTitle className="font-poppins text-2xl font-bold text-charcoal">
              Slot Details
            </DialogTitle>
            {getStatusBadge(
              slot.booking?.status && slot.booking.status.toUpperCase() === 'COMPLETED'
                ? 'COMPLETED'
                : slot.status,
            )}
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          {/* Client Information Section (if booked or completed) */}
          {(slot.status === 'BOOKED' ||
            (slot.booking?.status && slot.booking.status.toUpperCase() === 'COMPLETED')) &&
            client && (
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
                  <div>
                    <Label className="font-inter text-xs text-muted-foreground mb-1">Address</Label>
                    <p className="font-inter text-charcoal">{slot.location.address}</p>
                    {slot.location.additionalFee > 0 && (
                      <p className="font-inter text-sm text-muted-foreground mt-1">
                        Additional Fee: EUR {slot.location.additionalFee}
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
              <div>
                <Label className="font-inter text-xs text-muted-foreground mb-1">Price</Label>
                {slot.booking?.discountAmount && slot.booking.discountAmount > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-poppins text-xl font-bold text-green-600">
                        EUR {slot.booking.totalAmount.toFixed(2)}
                      </p>
                      <span className="text-sm font-inter text-gray-500 line-through">
                        EUR {slot.basePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {slot.booking.discountPercentage}% stamp discount applied (-EUR{' '}
                      {slot.booking.discountAmount.toFixed(2)})
                    </div>
                  </div>
                ) : (
                  <p className="font-poppins text-xl font-bold text-primary">
                    EUR {slot.booking?.totalAmount?.toFixed(2) || slot.basePrice.toFixed(2)}
                  </p>
                )}
              </div>

              {slot.location && (
                <div>
                  <Label className="font-inter text-xs text-muted-foreground mb-1">Address</Label>
                  <p className="font-inter text-charcoal">{slot.location.address}</p>
                  {slot.location.additionalFee > 0 && (
                    <p className="font-inter text-sm text-muted-foreground mt-1">
                      Additional Fee: EUR {slot.location.additionalFee}
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

          {/* Booking Service Categories (if booked or completed) */}
          {slot.booking?.serviceCategories && slot.booking.serviceCategories.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <Label className="font-inter text-xs text-muted-foreground mb-2 block">
                {slot.booking.status && slot.booking.status.toUpperCase() === 'COMPLETED'
                  ? 'Completed Service Categories'
                  : 'Selected Service Categories'}
              </Label>
              <div className="space-y-2">
                {slot.booking.serviceCategories.map((category, index) => {
                  const isCompleted =
                    slot.booking?.status && slot.booking.status.toUpperCase() === 'COMPLETED';
                  return (
                    <div
                      key={category.id || index}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        isCompleted
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          isCompleted ? 'bg-purple-100' : 'bg-green-100'
                        }`}
                      >
                        <Package
                          className={`h-4 w-4 ${isCompleted ? 'text-purple-600' : 'text-green-600'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold text-charcoal mb-1">
                          {category.name || 'Service Category'}
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Stamp Discount Information */}
          {slot.booking?.discountAmount !== undefined && slot.booking.discountAmount > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 mt-0.5">
                    <Gift className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <Label className="font-inter text-sm font-semibold text-green-900">
                        Stamp Reward Applied
                      </Label>
                    </div>
                    <p className="font-inter text-sm text-green-800 mb-1">
                      Client received a {slot.booking.discountPercentage}% discount for earning
                      enough stamps
                    </p>
                    <p className="font-poppins text-lg font-bold text-green-900">
                      Discount: -EUR {slot.booking.discountAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client Rating (if booking has been rated) */}
          {slot.booking?.rating && (
            <div className="mt-6 pt-6 border-t">
              <Label className="font-inter text-xs text-muted-foreground mb-2 block">
                Client Rating
              </Label>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <RatingDisplay rating={slot.booking.rating.rating} size="md" showCount={false} />
                  <span className="font-poppins font-semibold text-charcoal">
                    {slot.booking.rating.rating}/5
                  </span>
                  {slot.booking.rating.createdAt && (
                    <span className="font-inter text-sm text-muted-foreground ml-auto">
                      Rated on {safeFormatDate(slot.booking.rating.createdAt, 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
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
        </div>

        <DialogFooter className="flex sm:flex-row flex-col gap-2 px-6 pb-6">
          {/* Message Client button - Show once for slots with client (BOOKED, COMPLETED, or CANCELLED) */}
          {client &&
            (slot.status === 'BOOKED' ||
              slot.status === 'CANCELLED' ||
              (slot.booking?.status && slot.booking.status.toUpperCase() === 'COMPLETED')) && (
              <Button
                onClick={handleMessage}
                className="bg-primary hover:bg-primary/90 text-white flex-1 sm:flex-initial"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Client
              </Button>
            )}

          {/* Generate Invoice button - Show for BOOKED or COMPLETED slots with booking */}
          {slot.booking &&
            (slot.status === 'BOOKED' ||
              (slot.booking?.status && slot.booking.status.toUpperCase() === 'COMPLETED')) && (
              <Button
                onClick={() => setShowInvoiceDialog(true)}
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary flex-1 sm:flex-initial"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
            )}

          {/* Actions for BOOKED slots */}
          {slot.status === 'BOOKED' &&
            slot.booking &&
            slot.booking.status !== 'COMPLETED' &&
            slot.booking.status !== 'completed' && (
              <Button
                onClick={handleCompleteBooking}
                disabled={isCompleting}
                className="bg-success hover:bg-success/90 text-white flex-1 sm:flex-initial"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isCompleting ? 'Completing...' : 'Mark as Completed'}
              </Button>
            )}

          {/* Actions for AVAILABLE slots */}
          {slot.status === 'AVAILABLE' && onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(slot.id)}
              className="flex-1 sm:flex-initial"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Slot
            </Button>
          )}

          {/* Actions for RESERVED slots */}
          {slot.status === 'RESERVED' && onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(slot.id)}
              className="flex-1 sm:flex-initial"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Slot
            </Button>
          )}

          {/* Close button */}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Invoice Generation Dialog */}
      {appointmentData && (
        <InvoiceGenerationDialog
          appointment={appointmentData}
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          initialPrice={slot.booking?.totalAmount || slot.basePrice}
        />
      )}
    </Dialog>
  );
};
