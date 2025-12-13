'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { SOAPNoteFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

// Zod schema for SOAP Note form
const soapNoteSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  date: z.string().min(1, 'Date is required'),
  therapistName: z.string().min(1, 'Therapist name is required'),
  durationOfTreatment: z.string().optional(),
  primaryAreaOfPain: z.string().optional(),
  reasonForVisit: z.string().optional(),
  painReliefGoals: z.object({
    painRelief: z.boolean(),
    relieveTension: z.boolean(),
    relieveStress: z.boolean(),
    relieveAnxiety: z.boolean(),
    improveQualityOfLife: z.boolean(),
    other: z.boolean(),
    otherText: z.string().optional(),
  }),
  intensityOfPain: z.string().optional(),
  sensationOfPain: z.object({
    sharp: z.boolean(),
    dull: z.boolean(),
    aching: z.boolean(),
    throbbing: z.boolean(),
    burning: z.boolean(),
    stabbing: z.boolean(),
    shooting: z.boolean(),
    tingling: z.boolean(),
    numbness: z.boolean(),
    other: z.boolean(),
    otherText: z.string().optional(),
  }),
  associatedSymptoms: z.object({
    headaches: z.boolean(),
    fatigue: z.boolean(),
    nausea: z.boolean(),
    dizziness: z.boolean(),
    weakness: z.boolean(),
    numbness: z.boolean(),
    tingling: z.boolean(),
    swelling: z.boolean(),
    stiffness: z.boolean(),
    other: z.boolean(),
    otherText: z.string().optional(),
  }),
  aggravatingFactors: z.string().optional(),
  easingFactors: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  surgeries: z.string().optional(),
  socialHistory: z.string().optional(),
  specificIncident: z.object({
    yes: z.boolean(),
    no: z.boolean(),
    details: z.string().optional(),
  }),
  previousTreatment: z.string().optional(),
  otherHealthcarePractitioners: z.object({
    yes: z.boolean(),
    no: z.boolean(),
    details: z.string().optional(),
  }),
  painPreventsParticipation: z.object({
    work: z.boolean(),
    hobbies: z.boolean(),
    exercise: z.boolean(),
    dailyActivities: z.boolean(),
    other: z.boolean(),
    otherText: z.string().optional(),
  }),
  postureAssessment: z.object({
    headPosition: z.string().optional(),
    shoulderPosition: z.string().optional(),
    spinalCurves: z.string().optional(),
    pelvicTilt: z.string().optional(),
    footPosition: z.string().optional(),
    otherObservations: z.string().optional(),
  }),
  rangeOfMotion: z.string().optional(),
  muscleStrength: z.string().optional(),
  palpationFindings: z.string().optional(),
  specialTests: z.string().optional(),
  neurologicalScreen: z.string().optional(),
  vascularScreen: z.string().optional(),
  functionalTasks: z.string().optional(),
  clinicalImpression: z.string().optional(),
  shortTermGoals: z.string().optional(),
  longTermGoals: z.string().optional(),
  assessmentDetails: z.object({
    progress: z.string().optional(),
    responseToTreatment: z.string().optional(),
    duration: z.string().optional(),
  }),
  treatmentPlan: z.string().optional(),
  exercisesPrescribed: z.string().optional(),
  modalitiesUsed: z.string().optional(),
  educationProvided: z.string().optional(),
  referrals: z.string().optional(),
  nextSessionFocus: z.string().optional(),
  treatmentAreas: z.object({
    neck: z.boolean(),
    shoulder: z.boolean(),
    back: z.boolean(),
    hip: z.boolean(),
    knee: z.boolean(),
    ankle: z.boolean(),
    foot: z.boolean(),
    other: z.boolean(),
    otherText: z.string().optional(),
  }),
});

interface SOAPNoteFormProps {
  initialData?: SOAPNoteFormData;
  onSubmit: (data: SOAPNoteFormData) => void;
  slot: Slot;
}

const defaultValues: SOAPNoteFormData = {
  patientName: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  therapistName: '',
  durationOfTreatment: '',
  primaryAreaOfPain: '',
  reasonForVisit: '',
  painReliefGoals: {
    painRelief: false,
    relieveTension: false,
    relieveStress: false,
    relieveAnxiety: false,
    improveQualityOfLife: false,
    other: false,
    otherText: '',
  },
  intensityOfPain: '',
  sensationOfPain: {
    sharp: false,
    dull: false,
    aching: false,
    throbbing: false,
    burning: false,
    stabbing: false,
    shooting: false,
    tingling: false,
    numbness: false,
    other: false,
    otherText: '',
  },
  associatedSymptoms: {
    headaches: false,
    fatigue: false,
    nausea: false,
    dizziness: false,
    weakness: false,
    numbness: false,
    tingling: false,
    swelling: false,
    stiffness: false,
    other: false,
    otherText: '',
  },
  aggravatingFactors: '',
  easingFactors: '',
  pastMedicalHistory: '',
  medications: '',
  allergies: '',
  surgeries: '',
  socialHistory: '',
  specificIncident: {
    yes: false,
    no: false,
    details: '',
  },
  previousTreatment: '',
  otherHealthcarePractitioners: {
    yes: false,
    no: false,
    details: '',
  },
  painPreventsParticipation: {
    work: false,
    hobbies: false,
    exercise: false,
    dailyActivities: false,
    other: false,
    otherText: '',
  },
  postureAssessment: {
    headPosition: '',
    shoulderPosition: '',
    spinalCurves: '',
    pelvicTilt: '',
    footPosition: '',
    otherObservations: '',
  },
  rangeOfMotion: '',
  muscleStrength: '',
  palpationFindings: '',
  specialTests: '',
  neurologicalScreen: '',
  vascularScreen: '',
  functionalTasks: '',
  clinicalImpression: '',
  shortTermGoals: '',
  longTermGoals: '',
  assessmentDetails: {
    progress: '',
    responseToTreatment: '',
    duration: '',
  },
  treatmentPlan: '',
  exercisesPrescribed: '',
  modalitiesUsed: '',
  educationProvided: '',
  referrals: '',
  nextSessionFocus: '',
  treatmentAreas: {
    neck: false,
    shoulder: false,
    back: false,
    hip: false,
    knee: false,
    ankle: false,
    foot: false,
    other: false,
    otherText: '',
  },
};

export const SOAPNoteForm = ({ initialData, onSubmit, slot }: SOAPNoteFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SOAPNoteFormData>({
    resolver: zodResolver(soapNoteSchema),
    defaultValues: initialData || defaultValues,
  });

  // Pre-fill patient name from booking if available
  useEffect(() => {
    if (slot.booking?.client && !initialData?.patientName) {
      setValue('patientName', slot.booking.client.name);
    }
    if (slot.startTime && !initialData?.date) {
      setValue('date', format(new Date(slot.startTime), 'yyyy-MM-dd'));
    }
  }, [slot, initialData, setValue]);

  const painReliefGoals = watch('painReliefGoals');
  const sensationOfPain = watch('sensationOfPain');
  const associatedSymptoms = watch('associatedSymptoms');
  const specificIncident = watch('specificIncident');
  const otherHealthcarePractitioners = watch('otherHealthcarePractitioners');
  const painPreventsParticipation = watch('painPreventsParticipation');
  const treatmentAreas = watch('treatmentAreas');

  const handleCheckboxChange = (path: string, checked: boolean) => {
    setValue(path as any, checked, { shouldValidate: true });
  };

  const handleRadioChange = (path: string, value: boolean) => {
    const [parent, field] = path.split('.');
    const current = watch(parent as any);
    setValue(`${parent}.yes` as any, field === 'yes' ? value : false, { shouldValidate: true });
    setValue(`${parent}.no` as any, field === 'no' ? value : false, { shouldValidate: true });
  };

  const onFormSubmit = (data: SOAPNoteFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-poppins font-semibold text-charcoal">
            SOAP Note
          </CardTitle>
          <CardDescription className="font-inter">
            Subjective, Objective, Assessment, and Plan documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="subjective" className="w-full">
            <TabsList className="font-inter h-12 gap-2 p-1">
              <TabsTrigger value="subjective" className="px-6 py-2.5 text-base font-semibold">
                SUBJECTIVE
              </TabsTrigger>
              <TabsTrigger value="objective" className="px-6 py-2.5 text-base font-semibold">
                OBJECTIVE
              </TabsTrigger>
              <TabsTrigger value="plan" className="px-6 py-2.5 text-base font-semibold">
                PLAN
              </TabsTrigger>
            </TabsList>

            {/* SUBJECTIVE Tab */}
            <TabsContent value="subjective" className="space-y-6 mt-6">
              {/* Patient & Session Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Patient & Session Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Patient Name <span className="text-error">*</span>
                    </Label>
                    <Input
                      {...register('patientName')}
                      className="font-inter"
                      placeholder="Patient Name"
                    />
                    {errors.patientName && (
                      <p className="text-xs text-error font-inter">{errors.patientName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Date <span className="text-error">*</span>
                    </Label>
                    <Input type="date" {...register('date')} className="font-inter" />
                    {errors.date && (
                      <p className="text-xs text-error font-inter">{errors.date.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Therapist Name <span className="text-error">*</span>
                    </Label>
                    <Input
                      {...register('therapistName')}
                      className="font-inter"
                      placeholder="Therapist Name"
                    />
                    {errors.therapistName && (
                      <p className="text-xs text-error font-inter">
                        {errors.therapistName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Duration of Treatment</Label>
                    <Input
                      {...register('durationOfTreatment')}
                      className="font-inter"
                      placeholder="E.g., 60 minutes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Primary Area of Pain</Label>
                    <Input
                      {...register('primaryAreaOfPain')}
                      className="font-inter"
                      placeholder="E.g., Lower Back"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Reason for Visit</Label>
                    <Input
                      {...register('reasonForVisit')}
                      className="font-inter"
                      placeholder="Reason for Visit"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pain Relief Goals */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Pain Relief Goals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'painRelief', label: 'Pain Relief' },
                    { key: 'relieveTension', label: 'Relieve Tension' },
                    { key: 'relieveStress', label: 'Relieve Stress' },
                    { key: 'relieveAnxiety', label: 'Relieve Anxiety' },
                    { key: 'improveQualityOfLife', label: 'Improve Quality of Life' },
                    { key: 'other', label: 'Other' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`painReliefGoals.${key}`}
                        checked={painReliefGoals[key as keyof typeof painReliefGoals] as boolean}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(`painReliefGoals.${key}`, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`painReliefGoals.${key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
                {painReliefGoals.other && (
                  <div className="mt-2">
                    <Textarea
                      {...register('painReliefGoals.otherText')}
                      placeholder="Please Specify..."
                      rows={2}
                      className="font-open-sans text-sm"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Pain Intensity */}
              <div className="space-y-2">
                <Label className="font-inter text-sm font-medium">Intensity of Pain (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  {...register('intensityOfPain')}
                  className="font-inter"
                  placeholder="0-10"
                />
              </div>

              <Separator />

              {/* Sensation of Pain */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Sensation of Pain
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'sharp', label: 'Sharp' },
                    { key: 'dull', label: 'Dull' },
                    { key: 'aching', label: 'Aching' },
                    { key: 'throbbing', label: 'Throbbing' },
                    { key: 'burning', label: 'Burning' },
                    { key: 'stabbing', label: 'Stabbing' },
                    { key: 'shooting', label: 'Shooting' },
                    { key: 'tingling', label: 'Tingling' },
                    { key: 'numbness', label: 'Numbness' },
                    { key: 'other', label: 'Other' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sensationOfPain.${key}`}
                        checked={sensationOfPain[key as keyof typeof sensationOfPain] as boolean}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(`sensationOfPain.${key}`, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`sensationOfPain.${key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
                {sensationOfPain.other && (
                  <div className="mt-2">
                    <Textarea
                      {...register('sensationOfPain.otherText')}
                      placeholder="Please Specify..."
                      rows={2}
                      className="font-open-sans text-sm"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Associated Symptoms */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Associated Symptoms
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'headaches', label: 'Headaches' },
                    { key: 'fatigue', label: 'Fatigue' },
                    { key: 'nausea', label: 'Nausea' },
                    { key: 'dizziness', label: 'Dizziness' },
                    { key: 'weakness', label: 'Weakness' },
                    { key: 'numbness', label: 'Numbness' },
                    { key: 'tingling', label: 'Tingling' },
                    { key: 'swelling', label: 'Swelling' },
                    { key: 'stiffness', label: 'Stiffness' },
                    { key: 'other', label: 'Other' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`associatedSymptoms.${key}`}
                        checked={
                          associatedSymptoms[key as keyof typeof associatedSymptoms] as boolean
                        }
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(`associatedSymptoms.${key}`, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`associatedSymptoms.${key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
                {associatedSymptoms.other && (
                  <div className="mt-2">
                    <Textarea
                      {...register('associatedSymptoms.otherText')}
                      placeholder="Please Specify..."
                      rows={2}
                      className="font-open-sans text-sm"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Aggravating Factors</Label>
                  <Textarea
                    {...register('aggravatingFactors')}
                    placeholder="What makes the pain worse?"
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Easing Factors</Label>
                  <Textarea
                    {...register('easingFactors')}
                    placeholder="What makes the pain better?"
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Past Medical History</Label>
                  <Textarea
                    {...register('pastMedicalHistory')}
                    placeholder="Previous medical conditions..."
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Medications</Label>
                  <Textarea
                    {...register('medications')}
                    placeholder="Current medications..."
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Allergies</Label>
                  <Textarea
                    {...register('allergies')}
                    placeholder="Known allergies..."
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Surgeries</Label>
                  <Textarea
                    {...register('surgeries')}
                    placeholder="Previous surgeries..."
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-inter text-sm font-medium">Social History</Label>
                  <Textarea
                    {...register('socialHistory')}
                    placeholder="Social history..."
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
              </div>

              <Separator />

              {/* Specific Incident */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Specific Incident
                </h3>
                <RadioGroup
                  value={specificIncident.yes ? 'yes' : specificIncident.no ? 'no' : ''}
                  onValueChange={(value) => handleRadioChange('specificIncident', value === 'yes')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="specificIncident-yes" />
                    <Label
                      htmlFor="specificIncident-yes"
                      className="font-inter text-sm font-normal cursor-pointer"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="specificIncident-no" />
                    <Label
                      htmlFor="specificIncident-no"
                      className="font-inter text-sm font-normal cursor-pointer"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {(specificIncident.yes || specificIncident.no) && (
                  <div className="mt-2">
                    <Textarea
                      {...register('specificIncident.details')}
                      placeholder="Please Provide Details..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Previous Treatment */}
              <div className="space-y-2">
                <Label className="font-inter text-sm font-medium">Previous Treatment</Label>
                <Textarea
                  {...register('previousTreatment')}
                  placeholder="Previous treatment history..."
                  rows={3}
                  className="font-open-sans text-sm"
                />
              </div>

              <Separator />

              {/* Other Healthcare Practitioners */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Other Healthcare Practitioners
                </h3>
                <RadioGroup
                  value={
                    otherHealthcarePractitioners.yes
                      ? 'yes'
                      : otherHealthcarePractitioners.no
                        ? 'no'
                        : ''
                  }
                  onValueChange={(value) =>
                    handleRadioChange('otherHealthcarePractitioners', value === 'yes')
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="otherHealthcarePractitioners-yes" />
                    <Label
                      htmlFor="otherHealthcarePractitioners-yes"
                      className="font-inter text-sm font-normal cursor-pointer"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="otherHealthcarePractitioners-no" />
                    <Label
                      htmlFor="otherHealthcarePractitioners-no"
                      className="font-inter text-sm font-normal cursor-pointer"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {(otherHealthcarePractitioners.yes || otherHealthcarePractitioners.no) && (
                  <div className="mt-2">
                    <Textarea
                      {...register('otherHealthcarePractitioners.details')}
                      placeholder="Please Provide Details..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Pain Prevents Participation */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Pain Prevents Participation
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'work', label: 'Work' },
                    { key: 'hobbies', label: 'Hobbies' },
                    { key: 'exercise', label: 'Exercise' },
                    { key: 'dailyActivities', label: 'Daily Activities' },
                    { key: 'other', label: 'Other' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`painPreventsParticipation.${key}`}
                        checked={
                          painPreventsParticipation[
                            key as keyof typeof painPreventsParticipation
                          ] as boolean
                        }
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            `painPreventsParticipation.${key}`,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`painPreventsParticipation.${key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
                {painPreventsParticipation.other && (
                  <div className="mt-2">
                    <Textarea
                      {...register('painPreventsParticipation.otherText')}
                      placeholder="Please Specify..."
                      rows={2}
                      className="font-open-sans text-sm"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* OBJECTIVE Tab */}
            <TabsContent value="objective" className="space-y-6 mt-6">
              {/* Posture Assessment */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Posture Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'headPosition', label: 'Head Position' },
                    { key: 'shoulderPosition', label: 'Shoulder Position' },
                    { key: 'spinalCurves', label: 'Spinal Curves' },
                    { key: 'pelvicTilt', label: 'Pelvic Tilt' },
                    { key: 'footPosition', label: 'Foot Position' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label className="font-inter text-sm font-medium">{label}</Label>
                      <Input
                        {...register(`postureAssessment.${key}` as any)}
                        className="font-inter"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Other Observations</Label>
                  <Textarea
                    {...register('postureAssessment.otherObservations')}
                    placeholder="Additional observations..."
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
              </div>

              <Separator />

              {/* Objective Measurements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Range of Motion</Label>
                  <Textarea
                    {...register('rangeOfMotion')}
                    placeholder="ROM findings..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Muscle Strength</Label>
                  <Textarea
                    {...register('muscleStrength')}
                    placeholder="Muscle strength findings..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Palpation Findings</Label>
                  <Textarea
                    {...register('palpationFindings')}
                    placeholder="Palpation findings..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Special Tests</Label>
                  <Textarea
                    {...register('specialTests')}
                    placeholder="Special test results..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Neurological Screen</Label>
                  <Textarea
                    {...register('neurologicalScreen')}
                    placeholder="Neurological findings..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Vascular Screen</Label>
                  <Textarea
                    {...register('vascularScreen')}
                    placeholder="Vascular findings..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-inter text-sm font-medium">Functional Tasks</Label>
                  <Textarea
                    {...register('functionalTasks')}
                    placeholder="Functional task assessment..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            {/* PLAN Tab */}
            <TabsContent value="plan" className="space-y-6 mt-6">
              {/* Assessment */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Assessment</h3>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Clinical Impression</Label>
                  <Textarea
                    {...register('clinicalImpression')}
                    placeholder="Clinical impression..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Short Term Goals</Label>
                    <Textarea
                      {...register('shortTermGoals')}
                      placeholder="Short term goals..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Long Term Goals</Label>
                    <Textarea
                      {...register('longTermGoals')}
                      placeholder="Long term goals..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Progress</Label>
                    <Textarea
                      {...register('assessmentDetails.progress')}
                      placeholder="Progress notes..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Response to Treatment</Label>
                    <Textarea
                      {...register('assessmentDetails.responseToTreatment')}
                      placeholder="Response to treatment..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Duration</Label>
                    <Textarea
                      {...register('assessmentDetails.duration')}
                      placeholder="Treatment duration..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Treatment Plan */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Treatment Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Treatment Plan</Label>
                    <Textarea
                      {...register('treatmentPlan')}
                      placeholder="Treatment plan details..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Exercises Prescribed</Label>
                    <Textarea
                      {...register('exercisesPrescribed')}
                      placeholder="Exercises prescribed..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Modalities Used</Label>
                    <Textarea
                      {...register('modalitiesUsed')}
                      placeholder="Modalities used..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Education Provided</Label>
                    <Textarea
                      {...register('educationProvided')}
                      placeholder="Education provided..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Referrals</Label>
                    <Textarea
                      {...register('referrals')}
                      placeholder="Referrals made..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Next Session Focus</Label>
                    <Textarea
                      {...register('nextSessionFocus')}
                      placeholder="Focus for next session..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Treatment Areas */}
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Treatment Areas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'neck', label: 'Neck' },
                    { key: 'shoulder', label: 'Shoulder' },
                    { key: 'back', label: 'Back' },
                    { key: 'hip', label: 'Hip' },
                    { key: 'knee', label: 'Knee' },
                    { key: 'ankle', label: 'Ankle' },
                    { key: 'foot', label: 'Foot' },
                    { key: 'other', label: 'Other' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`treatmentAreas.${key}`}
                        checked={treatmentAreas[key as keyof typeof treatmentAreas] as boolean}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(`treatmentAreas.${key}`, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`treatmentAreas.${key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
                {treatmentAreas.other && (
                  <div className="mt-2">
                    <Textarea
                      {...register('treatmentAreas.otherText')}
                      placeholder="Please Specify..."
                      rows={2}
                      className="font-open-sans text-sm"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="font-inter font-semibold">
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
