'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createComplaint } from '@/redux/api/complaintApi';
import { ComplaintCategory } from '@/types/types';

const complaintSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ReportFreelancerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerId: string;
  freelancerName: string;
}

const COMPLAINT_CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'UNPROFESSIONAL_BEHAVIOR', label: 'Unprofessional Behavior' },
  { value: 'SAFETY_CONCERN', label: 'Safety Concern' },
  { value: 'NO_SHOW', label: 'No Show' },
  { value: 'LATE_CANCELLATION', label: 'Late Cancellation' },
  { value: 'INAPPROPRIATE_CONDUCT', label: 'Inappropriate Conduct' },
  { value: 'POOR_SERVICE_QUALITY', label: 'Poor Service Quality' },
  { value: 'OTHER', label: 'Other' },
];

export const ReportFreelancerDialog = ({
  isOpen,
  onClose,
  freelancerId,
  freelancerName,
}: ReportFreelancerDialogProps) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: '',
      reason: '',
      description: '',
    },
  });

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createComplaint({
          reportedUserId: freelancerId,
          category: data.category as ComplaintCategory,
          reason: data.reason,
          description: data.description,
          evidence: [],
        }) as any,
      );

      if (createComplaint.fulfilled.match(result)) {
        toast.success('Complaint submitted successfully');
        reset();
        onClose();
      } else {
        toast.error('Failed to submit complaint');
      }
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = watch('category');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Report {freelancerName}
          </DialogTitle>
          <DialogDescription>
            Please provide details about your complaint. This information will be reviewed by our
            admin team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {COMPLAINT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Brief Reason *</Label>
            <Input
              id="reason"
              {...register('reason')}
              placeholder="e.g., Arrived 30 minutes late"
              className={errors.reason ? 'border-red-500' : ''}
            />
            {errors.reason && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Please provide a detailed explanation of the incident..."
              rows={5}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <p>
                  False reports may result in action against your account. Please only report
                  legitimate concerns.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  Submit Report
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
