'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SOAPNoteFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

const soapNoteSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  date: z.string().min(1, 'Date is required'),
  sessionType: z.string().optional(),
  duration: z.string().optional(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
});

interface SOAPNoteFormProps {
  initialData?: Record<string, any> | null;
  onSubmit: (data: SOAPNoteFormData) => void;
  slot: Slot;
}

export const SOAPNoteForm: React.FC<SOAPNoteFormProps> = ({ initialData, onSubmit, slot }) => {
  const defaultDate = format(new Date(slot.startTime), 'yyyy-MM-dd');
  const defaultDuration = slot.duration.toString();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SOAPNoteFormData>({
    resolver: zodResolver(soapNoteSchema),
    defaultValues: initialData || {
      patientName: slot.booking?.client?.name || '',
      date: defaultDate,
      sessionType: '',
      duration: defaultDuration,
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    },
  });

  const onSubmitForm = (data: SOAPNoteFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins text-xl font-semibold text-charcoal">
            SOAP Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="font-inter text-sm font-medium">
                Patient Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="patientName"
                {...register('patientName')}
                placeholder="Enter patient name"
              />
              {errors.patientName && (
                <p className="font-inter text-sm text-red-500">{errors.patientName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="font-inter text-sm font-medium">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input id="date" type="date" {...register('date')} className="font-inter" />
              {errors.date && (
                <p className="font-inter text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionType" className="font-inter text-sm font-medium">
                Session Type
              </Label>
              <Input
                id="sessionType"
                {...register('sessionType')}
                placeholder="e.g., Initial Assessment, Follow-up"
                className="font-inter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="font-inter text-sm font-medium">
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                {...register('duration')}
                placeholder="e.g., 60"
                className="font-inter"
              />
            </div>
          </div>

          {/* SUBJECTIVE */}
          <div className="space-y-2">
            <Label htmlFor="subjective" className="font-inter text-sm font-medium">
              SUBJECTIVE - Client symptoms, history, aggravating/easing factors
            </Label>
            <Textarea
              id="subjective"
              {...register('subjective')}
              placeholder="Enter subjective information..."
              className="min-h-[120px] font-open-sans"
            />
          </div>

          {/* OBJECTIVE */}
          <div className="space-y-2">
            <Label htmlFor="objective" className="font-inter text-sm font-medium">
              OBJECTIVE - Observations, ROM, strength, palpation findings, tests
            </Label>
            <Textarea
              id="objective"
              {...register('objective')}
              placeholder="Enter objective findings..."
              className="min-h-[120px] font-open-sans"
            />
          </div>

          {/* ASSESSMENT */}
          <div className="space-y-2">
            <Label htmlFor="assessment" className="font-inter text-sm font-medium">
              ASSESSMENT - Clinical reasoning, progress, response to treatment
            </Label>
            <Textarea
              id="assessment"
              {...register('assessment')}
              placeholder="Enter assessment..."
              className="min-h-[120px] font-open-sans"
            />
          </div>

          {/* PLAN */}
          <div className="space-y-2">
            <Label htmlFor="plan" className="font-inter text-sm font-medium">
              PLAN - Treatment plan, exercises, load progressions, next session focus
            </Label>
            <Textarea
              id="plan"
              {...register('plan')}
              placeholder="Enter treatment plan..."
              className="min-h-[120px] font-open-sans"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} className="font-inter font-semibold">
          {isSubmitting ? 'Saving...' : 'Save Form'}
        </Button>
      </div>
    </form>
  );
};
