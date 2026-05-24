'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, AlertTriangle, Send } from 'lucide-react';
// Unused imports removed: useState, toast
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { useCreateComplaint } from '@/hooks/queries/useComplaints';
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
  const { mutate: createComplaintMutation, isPending: isSubmitting } = useCreateComplaint();

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
    createComplaintMutation(
      {
        reportedUserId: freelancerId,
        category: data.category as ComplaintCategory,
        reason: data.reason,
        description: data.description,
        evidence: [],
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  // Unused variable removed - was: const _selectedCategory = watch('category');

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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          aria-label="Report freelancer form"
        >
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-600">*</span>
            </Label>
            <Select
              value={watch('category') ?? undefined}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger
                className="w-full"
                id="category"
                aria-required="true"
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? 'category-error' : undefined}
              >
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
              <p
                id="category-error"
                className="text-sm text-red-600 flex items-center gap-1"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Brief Reason <span className="text-red-600">*</span>
            </Label>
            <Input
              id="reason"
              {...register('reason')}
              placeholder="e.g., Arrived 30 minutes late"
              className={errors.reason ? 'border-red-500' : ''}
              aria-required="true"
              aria-invalid={!!errors.reason}
              aria-describedby={errors.reason ? 'reason-error' : undefined}
            />
            {errors.reason && (
              <p
                id="reason-error"
                className="text-sm text-red-600 flex items-center gap-1"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Detailed Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Please provide a detailed explanation of the incident..."
              rows={5}
              className={errors.description ? 'border-red-500' : ''}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p
                id="description-error"
                className="text-sm text-red-600 flex items-center gap-1"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              aria-label="Cancel complaint submission"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              aria-label="Submit complaint"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  Submit Report
                  <Send className="ml-2 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
