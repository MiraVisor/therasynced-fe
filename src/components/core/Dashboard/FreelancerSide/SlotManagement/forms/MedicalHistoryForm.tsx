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
import { MedicalHistoryFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

const medicalHistorySchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  pastSurgeries: z.string().optional(),
  familyHistory: z.string().optional(),
  lifestyleFactors: z.string().optional(),
  chiefComplaint: z.string().optional(),
  historyOfPresentIllness: z.string().optional(),
  reviewOfSystems: z.string().optional(),
});

interface MedicalHistoryFormProps {
  initialData?: Record<string, any> | null;
  onSubmit: (data: MedicalHistoryFormData) => void;
  slot: Slot;
}

export const MedicalHistoryForm: React.FC<MedicalHistoryFormProps> = ({
  initialData,
  onSubmit,
  slot,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicalHistoryFormData>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: initialData || {
      patientName: slot.booking?.client?.name || '',
      dateOfBirth: '',
      gender: '',
      address: '',
      phone: '',
      email: slot.booking?.client?.email || '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalConditions: '',
      currentMedications: '',
      allergies: '',
      pastSurgeries: '',
      familyHistory: '',
      lifestyleFactors: '',
      chiefComplaint: '',
      historyOfPresentIllness: '',
      reviewOfSystems: '',
    },
  });

  const onSubmitForm = (data: MedicalHistoryFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins text-xl font-semibold text-charcoal">
            Medical History Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="font-inter text-sm font-medium">
                  Patient Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patientName"
                  {...register('patientName')}
                  placeholder="Enter patient name"
                  className="font-inter"
                />
                {errors.patientName && (
                  <p className="font-inter text-sm text-red-500">{errors.patientName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="font-inter text-sm font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  className="font-inter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="font-inter text-sm font-medium">
                  Gender
                </Label>
                <Input
                  id="gender"
                  {...register('gender')}
                  placeholder="e.g., Male, Female"
                  className="font-inter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-inter text-sm font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="Phone number"
                  className="font-inter"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="font-inter text-sm font-medium">
                  Address
                </Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Full address"
                  className="font-inter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-inter text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@example.com"
                  className="font-inter"
                />
                {errors.email && (
                  <p className="font-inter text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact" className="font-inter text-sm font-medium">
                  Emergency Contact Name
                </Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  placeholder="Contact name"
                  className="font-inter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone" className="font-inter text-sm font-medium">
                  Emergency Phone
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  {...register('emergencyPhone')}
                  placeholder="Emergency phone number"
                  className="font-inter"
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">Medical History</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalConditions" className="font-inter text-sm font-medium">
                  Current Medical Conditions
                </Label>
                <Textarea
                  id="medicalConditions"
                  {...register('medicalConditions')}
                  placeholder="List any current medical conditions..."
                  className="min-h-[100px] font-open-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications" className="font-inter text-sm font-medium">
                  Current Medications
                </Label>
                <Textarea
                  id="currentMedications"
                  {...register('currentMedications')}
                  placeholder="List current medications and dosages..."
                  className="min-h-[100px] font-open-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="font-inter text-sm font-medium">
                  Allergies
                </Label>
                <Textarea
                  id="allergies"
                  {...register('allergies')}
                  placeholder="List any allergies (medications, food, environmental)..."
                  className="min-h-[100px] font-open-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pastSurgeries" className="font-inter text-sm font-medium">
                  Past Surgeries
                </Label>
                <Textarea
                  id="pastSurgeries"
                  {...register('pastSurgeries')}
                  placeholder="List past surgeries and dates..."
                  className="min-h-[100px] font-open-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyHistory" className="font-inter text-sm font-medium">
                  Family History
                </Label>
                <Textarea
                  id="familyHistory"
                  {...register('familyHistory')}
                  placeholder="Relevant family medical history..."
                  className="min-h-[100px] font-open-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifestyleFactors" className="font-inter text-sm font-medium">
                  Lifestyle Factors
                </Label>
                <Textarea
                  id="lifestyleFactors"
                  {...register('lifestyleFactors')}
                  placeholder="Exercise, diet, smoking, alcohol, etc..."
                  className="min-h-[100px] font-open-sans"
                />
              </div>
            </div>
          </div>

          {/* Presenting Complaint */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">
              Presenting Complaint
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint" className="font-inter text-sm font-medium">
                  Chief Complaint
                </Label>
                <Textarea
                  id="chiefComplaint"
                  {...register('chiefComplaint')}
                  placeholder="Main reason for visit..."
                  className="min-h-[100px] font-open-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="historyOfPresentIllness" className="font-inter text-sm font-medium">
                  History of Present Illness
                </Label>
                <Textarea
                  id="historyOfPresentIllness"
                  {...register('historyOfPresentIllness')}
                  placeholder="Detailed history of the current complaint..."
                  className="min-h-[120px] font-open-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewOfSystems" className="font-inter text-sm font-medium">
                  Review of Systems
                </Label>
                <Textarea
                  id="reviewOfSystems"
                  {...register('reviewOfSystems')}
                  placeholder="Systematic review of body systems..."
                  className="min-h-[120px] font-open-sans"
                />
              </div>
            </div>
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
