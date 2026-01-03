'use client';

import { pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Download, FileText, Loader2, Plus, Trash2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/hooks/queries/useProfile';
import { Appointment } from '@/types/types';

import type { InvoiceData } from './InvoicePDF';

// Dynamically import heavy PDF component
const InvoicePDF = dynamic(
  () => import('./InvoicePDF').then((mod) => ({ default: mod.InvoicePDF })),
  {
    ssr: false,
  },
);

interface InvoiceGenerationDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrice?: number;
}

interface ServiceItem {
  id: string;
  name: string;
  price: string;
}

export const InvoiceGenerationDialog = ({
  appointment,
  open,
  onOpenChange,
  initialPrice,
}: InvoiceGenerationDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [basePrice, setBasePrice] = useState(initialPrice?.toString() || '');
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Get user profile from React Query
  const { data: profile } = useProfile();

  // Initialize business name from user profile
  useEffect(() => {
    if (profile?.name) {
      setBusinessName(profile.name);
    }
  }, [profile]);

  // Update basePrice when initialPrice changes
  useEffect(() => {
    if (initialPrice) {
      setBasePrice(initialPrice.toString());
    }
  }, [initialPrice]);

  const calculateTotal = () => {
    const base = parseFloat(basePrice) || 0;
    const servicesTotal = services.reduce((sum, service) => {
      return sum + (parseFloat(service.price) || 0);
    }, 0);
    return base + servicesTotal;
  };

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: '', price: '' }]);
  };

  const removeService = (id: string) => {
    setServices(services.filter((service) => service.id !== id));
  };

  const updateService = (id: string, field: 'name' | 'price', value: string) => {
    setServices(
      services.map((service) => (service.id === id ? { ...service, [field]: value } : service)),
    );
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    return `INV-${format(date, 'yyyyMMdd')}-${timestamp}`;
  };

  const handleDownloadInvoice = async () => {
    const total = calculateTotal();

    if (!basePrice || parseFloat(basePrice) <= 0) {
      toast.error('Please enter a valid base price');
      return;
    }

    if (total <= 0) {
      toast.error('Total amount must be greater than 0');
      return;
    }

    // Validate services
    for (const service of services) {
      if (!service.name.trim()) {
        toast.error('Please enter a name for all services or remove empty ones');
        return;
      }
      if (!service.price || parseFloat(service.price) <= 0) {
        toast.error('Please enter a valid price for all services');
        return;
      }
    }

    setIsGenerating(true);

    try {
      // Use profile from Redux instead of localStorage
      const invoiceData: InvoiceData = {
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toISOString(),
        businessName: businessName.trim() || profile?.name || 'Business Name',
        freelancerName: profile?.name || 'Freelancer Name',
        freelancerEmail: profile?.email || '',
        freelancerAddress:
          appointment.freelancer?.clinicAddress || profile?.clinicAddress || undefined,
        userName: appointment.clientName,
        userEmail: '', // Not available in appointment data
        appointmentDate: appointment.start,
        appointmentTime: `${format(new Date(appointment.start), 'h:mm a')} - ${format(new Date(appointment.end), 'h:mm a')}`,
        duration: Math.round(
          (new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / 60000,
        ),
        services: services.map((service) => ({
          name: service.name,
          price: parseFloat(service.price),
        })),
        basePrice: parseFloat(basePrice),
        totalAmount: total,
        notes: appointment.notes || undefined,
        locationType: appointment.location,
        location:
          appointment.location === 'CLINIC'
            ? appointment.freelancer?.clinicAddress || profile?.clinicAddress || undefined
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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            Generate Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto px-6 py-4 flex-1">
          {/* Prefilled Appointment Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Appointment Details
            </h3>
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">User Name</p>
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
          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <Label htmlFor="businessName" className="text-sm font-semibold">
                Business/Practice Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessName"
                type="text"
                placeholder="e.g., Your Practice Name"
                className="mt-1.5"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will appear at the top of the invoice
              </p>
            </div>

            {/* Base Price */}
            <div>
              <Label htmlFor="basePrice" className="text-sm font-semibold">
                Base Price <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  EUR
                </span>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-12"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <Label className="text-sm font-semibold">Additional Services (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addService}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </Button>
              </div>

              {services.length > 0 && (
                <div className="space-y-3 mt-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg border"
                    >
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Service name"
                          value={service.name}
                          onChange={(e) => updateService(service.id, 'name', e.target.value)}
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            EUR
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-12"
                            value={service.price}
                            onChange={(e) => updateService(service.id, 'price', e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(service.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Display */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">
                  EUR {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
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
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="px-6 py-4 border-t bg-background shrink-0">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleDownloadInvoice}
              disabled={isGenerating}
              className="gap-2 w-full sm:w-auto"
            >
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
