'use client';

import { pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Download, FileText, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Appointment } from '@/types/types';

import { InvoiceData, InvoicePDF } from './InvoicePDF';

interface InvoiceGenerationDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrice?: number;
}

export const InvoiceGenerationDialog = ({
  appointment,
  open,
  onOpenChange,
  initialPrice,
}: InvoiceGenerationDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalAmount, setTotalAmount] = useState(initialPrice?.toString() || '');

  // Update totalAmount when initialPrice changes
  useEffect(() => {
    if (initialPrice) {
      setTotalAmount(initialPrice.toString());
    }
  }, [initialPrice]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    return `INV-${format(date, 'yyyyMMdd')}-${timestamp}`;
  };

  const handleDownloadInvoice = async () => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsGenerating(true);

    try {
      // Get user data from localStorage
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;

      const invoiceData: InvoiceData = {
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toISOString(),
        freelancerName: user?.name || 'Freelancer Name',
        freelancerEmail: user?.email || '',
        freelancerAddress: appointment.freelancer?.clinicAddress || undefined,
        patientName: appointment.clientName,
        patientEmail: '', // Not available in appointment data
        appointmentDate: appointment.start,
        appointmentTime: `${format(new Date(appointment.start), 'h:mm a')} - ${format(new Date(appointment.end), 'h:mm a')}`,
        duration: Math.round(
          (new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / 60000,
        ),
        services: [],
        basePrice: parseFloat(totalAmount),
        totalAmount: parseFloat(totalAmount),
        notes: appointment.notes || undefined,
        locationType: appointment.location,
        location:
          appointment.location === 'CLINIC'
            ? appointment.freelancer?.clinicAddress || undefined
            : appointment.clientAddress || undefined,
      };

      // Generate PDF
      const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceData.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            Generate Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prefilled Appointment Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Appointment Details
            </h3>
            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Patient Name</p>
                <p className="font-medium">{appointment.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                <p className="font-medium">{format(new Date(appointment.start), 'MMM dd, yyyy')}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(appointment.start), 'h:mm a')} -{' '}
                  {format(new Date(appointment.end), 'h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="font-medium">
                  {Math.round(
                    (new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) /
                      60000,
                  )}{' '}
                  minutes
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p className="font-medium capitalize">{appointment.location.toLowerCase()}</p>
                {appointment.location === 'CLINIC' && appointment.freelancer?.clinicAddress && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {appointment.freelancer.clinicAddress}
                  </p>
                )}
                {appointment.location === 'HOME' && appointment.clientAddress && (
                  <p className="text-xs text-muted-foreground mt-1">{appointment.clientAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div>
            <Label htmlFor="totalAmount" className="text-sm font-semibold">
              Total Amount <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                EUR
              </span>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-12"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter the total amount to be charged for this session
            </p>
          </div>

          {/* Preview Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Invoice Preview</h4>
                <p className="text-xs text-muted-foreground">
                  The invoice will include all appointment details, your contact information, and
                  the amount specified above. It will be generated as a professional PDF document.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleDownloadInvoice} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
