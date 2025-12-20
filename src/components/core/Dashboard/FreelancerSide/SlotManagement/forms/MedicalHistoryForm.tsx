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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MedicalHistoryFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

// Simplified Zod schema for Medical History form
const medicalHistorySchema = z.object({
  personalDetails: z.object({
    name: z.string().min(1, 'Name is required'),
    dateOfBirth: z.string().optional(),
    date: z.string().optional(),
    sex: z.enum(['male', 'female', 'other', '']).optional(),
    parentGuardianName: z.string().optional(),
    phoneHome: z.string().optional(),
    phoneMobile: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    primaryLanguage: z.string().optional(),
    otherLanguages: z.string().optional(),
    aboriginal: z.boolean().optional(),
    torresStraitIslander: z.boolean().optional(),
    refugee: z.boolean().optional(),
    nonEnglishSpeaking: z.boolean().optional(),
  }),
  reasonForConcern: z.string().optional(),
  medicalHistory: z.object({
    gpDetails: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    }),
    pastMedicalHistory: z.string().optional(),
    medicalConditions: z.object({
      thyroidProblems: z.boolean(),
      rheumatoidConditions: z.boolean(),
      asthmaRespiratory: z.boolean(),
      steroidUseOsteoporosis: z.boolean(),
      heartConditions: z.boolean(),
      epilepsy: z.boolean(),
      diabetes: z.boolean(),
      other: z.boolean(),
      otherText: z.string().optional(),
      details: z.string().optional(),
    }),
    otherSymptoms: z.object({
      unexplainedWeightLoss: z.boolean(),
      constantUnremittingPain: z.boolean(),
      historyOfCancer: z.boolean(),
      thoracicPainNoCause: z.boolean(),
      pinsNeedlesSaddle: z.boolean(),
      difficultySpeaking: z.boolean(),
      doubleVision: z.boolean(),
      ageOver55OrUnder20: z.boolean(),
      widespreadPinsNeedles: z.boolean(),
      historyOfTrauma: z.boolean(),
      recentBladderBowelChanges: z.boolean(),
      difficultySwallowing: z.boolean(),
      unexplainedFainting: z.boolean(),
      dizziness: z.boolean(),
    }),
    allergies: z.string().optional(),
    medications: z.string().optional(),
  }),
  behaviourOfSymptoms: z.object({
    whenDidItStart: z.string().optional(),
    onset: z.enum(['slow', 'sudden', '']).optional(),
    symptomsChanged: z.string().optional(),
    otherSymptomsElsewhere: z.string().optional(),
    painIntensity: z.object({
      atRest: z.string().optional(),
      atBest: z.string().optional(),
      atWorst: z.string().optional(),
    }),
    symptomsThroughoutDay: z.object({
      am: z.string().optional(),
      throughoutDay: z.string().optional(),
      nightTime: z.string().optional(),
    }),
    degreeRestrictsMovement: z.string().optional(),
    movementsIncreaseSymptoms: z.string().optional(),
    movementsEaseSymptoms: z.string().optional(),
    symptomsIncreaseDetails: z.string().optional(),
    investigations: z.string().optional(),
    previousInjuries: z.string().optional(),
  }),
  painCharacteristics: z.object({
    deep: z.boolean(),
    superficial: z.boolean(),
    intermittent: z.boolean(),
    constant: z.boolean(),
    sharp: z.boolean(),
    shooting: z.boolean(),
    burning: z.boolean(),
    stinging: z.boolean(),
    throbbing: z.boolean(),
    diffuse: z.boolean(),
  }),
  sensorySymptoms: z.object({
    pinsNeedles: z.boolean(),
    numbness: z.boolean(),
    tingling: z.boolean(),
  }),
  jointSymptoms: z.object({
    clicking: z.boolean(),
    locking: z.boolean(),
    popping: z.boolean(),
    grinding: z.boolean(),
    givingWay: z.boolean(),
    details: z.string().optional(),
  }),
  primaryConcern: z.string().optional(),
  socialHistory: z.object({
    livingSituation: z.string().optional(),
    stairs: z.string().optional(),
    assistanceHouseholdTasks: z.string().optional(),
    occupation: z.string().optional(),
    notWorkingDueToSymptoms: z.string().optional(),
    currentlyNeedWalkingAid: z.string().optional(),
    previouslyNeedWalkingAid: z.string().optional(),
    currentExercise: z.string().optional(),
    previousExercise: z.string().optional(),
    hobbiesInterests: z.string().optional(),
  }),
  goals: z.object({
    whatWantToAchieve: z.string().optional(),
    whatExpectFromSession: z.string().optional(),
    howLongToAchieve: z.string().optional(),
  }),
  signatures: z.object({
    patientSignature: z.string().optional(),
    patientDate: z.string().optional(),
    therapistSignature: z.string().optional(),
    therapistDate: z.string().optional(),
  }),
});

interface MedicalHistoryFormProps {
  initialData?: MedicalHistoryFormData;
  onSubmit: (data: MedicalHistoryFormData) => void;
  slot: Slot;
}

const defaultValues: MedicalHistoryFormData = {
  personalDetails: {
    name: '',
    dateOfBirth: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    sex: '',
    parentGuardianName: '',
    phoneHome: '',
    phoneMobile: '',
    address: '',
    email: '',
    primaryLanguage: '',
    otherLanguages: '',
    aboriginal: false,
    torresStraitIslander: false,
    refugee: false,
    nonEnglishSpeaking: false,
  },
  reasonForConcern: '',
  medicalHistory: {
    gpDetails: {
      name: '',
      phone: '',
      address: '',
    },
    pastMedicalHistory: '',
    medicalConditions: {
      thyroidProblems: false,
      rheumatoidConditions: false,
      asthmaRespiratory: false,
      steroidUseOsteoporosis: false,
      heartConditions: false,
      epilepsy: false,
      diabetes: false,
      other: false,
      otherText: '',
      details: '',
    },
    otherSymptoms: {
      unexplainedWeightLoss: false,
      constantUnremittingPain: false,
      historyOfCancer: false,
      thoracicPainNoCause: false,
      pinsNeedlesSaddle: false,
      difficultySpeaking: false,
      doubleVision: false,
      ageOver55OrUnder20: false,
      widespreadPinsNeedles: false,
      historyOfTrauma: false,
      recentBladderBowelChanges: false,
      difficultySwallowing: false,
      unexplainedFainting: false,
      dizziness: false,
    },
    allergies: '',
    medications: '',
  },
  behaviourOfSymptoms: {
    whenDidItStart: '',
    onset: '',
    symptomsChanged: '',
    otherSymptomsElsewhere: '',
    painIntensity: {
      atRest: '',
      atBest: '',
      atWorst: '',
    },
    symptomsThroughoutDay: {
      am: '',
      throughoutDay: '',
      nightTime: '',
    },
    degreeRestrictsMovement: '',
    movementsIncreaseSymptoms: '',
    movementsEaseSymptoms: '',
    symptomsIncreaseDetails: '',
    investigations: '',
    previousInjuries: '',
  },
  painCharacteristics: {
    deep: false,
    superficial: false,
    intermittent: false,
    constant: false,
    sharp: false,
    shooting: false,
    burning: false,
    stinging: false,
    throbbing: false,
    diffuse: false,
  },
  sensorySymptoms: {
    pinsNeedles: false,
    numbness: false,
    tingling: false,
  },
  jointSymptoms: {
    clicking: false,
    locking: false,
    popping: false,
    grinding: false,
    givingWay: false,
    details: '',
  },
  primaryConcern: '',
  socialHistory: {
    livingSituation: '',
    stairs: '',
    assistanceHouseholdTasks: '',
    occupation: '',
    notWorkingDueToSymptoms: '',
    currentlyNeedWalkingAid: '',
    previouslyNeedWalkingAid: '',
    currentExercise: '',
    previousExercise: '',
    hobbiesInterests: '',
  },
  goals: {
    whatWantToAchieve: '',
    whatExpectFromSession: '',
    howLongToAchieve: '',
  },
  signatures: {
    patientSignature: '',
    patientDate: '',
    therapistSignature: '',
    therapistDate: '',
  },
};

export const MedicalHistoryForm = ({ initialData, onSubmit, slot }: MedicalHistoryFormProps) => {
  const clientId = slot.booking?.client?.id; // Get client ID

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MedicalHistoryFormData>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: initialData || defaultValues,
  });

  // Pre-fill patient name and email from booking if available
  useEffect(() => {
    if (slot.booking?.client) {
      if (!initialData?.personalDetails.name) {
        setValue('personalDetails.name', slot.booking.client.name);
      }
      if (!initialData?.personalDetails.email) {
        setValue('personalDetails.email', slot.booking.client.email);
      }
    }
    if (slot.startTime && !initialData?.personalDetails.date) {
      setValue('personalDetails.date', format(new Date(slot.startTime), 'yyyy-MM-dd'));
    }
  }, [slot, initialData, setValue]);

  const personalDetails = watch('personalDetails');
  const medicalConditions = watch('medicalHistory.medicalConditions');
  const otherSymptoms = watch('medicalHistory.otherSymptoms');
  const painCharacteristics = watch('painCharacteristics');
  const sensorySymptoms = watch('sensorySymptoms');
  const jointSymptoms = watch('jointSymptoms');

  const handleCheckboxChange = (path: string, checked: boolean) => {
    setValue(path as any, checked, { shouldValidate: true });
  };

  const onFormSubmit = (data: MedicalHistoryFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-poppins font-semibold text-charcoal">
            Medical History Form
          </CardTitle>
          <CardDescription className="font-inter">
            Comprehensive medical history and symptom assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="font-inter h-12 gap-2 p-1">
              <TabsTrigger value="personal" className="px-6 py-2.5 text-base font-semibold">
                Personal
              </TabsTrigger>
              <TabsTrigger value="medical" className="px-6 py-2.5 text-base font-semibold">
                Medical
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="px-6 py-2.5 text-base font-semibold">
                Symptoms
              </TabsTrigger>
              <TabsTrigger value="social" className="px-6 py-2.5 text-base font-semibold">
                Social
              </TabsTrigger>
              <TabsTrigger value="goals" className="px-6 py-2.5 text-base font-semibold">
                Goals
              </TabsTrigger>
            </TabsList>

            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Name <span className="text-error">*</span>
                    </Label>
                    <Input
                      {...register('personalDetails.name')}
                      className="font-inter"
                      placeholder="Full name"
                    />
                    {errors.personalDetails?.name && (
                      <p className="text-xs text-error font-inter">
                        {errors.personalDetails.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Date of Birth</Label>
                    <Input
                      type="date"
                      {...register('personalDetails.dateOfBirth')}
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Form Completion Date</Label>
                    <Input
                      type="date"
                      {...register('personalDetails.date')}
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Sex</Label>
                    <Select
                      value={personalDetails.sex}
                      onValueChange={(value) =>
                        setValue('personalDetails.sex', value as any, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="font-inter">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male" className="font-inter">
                          Male
                        </SelectItem>
                        <SelectItem value="female" className="font-inter">
                          Female
                        </SelectItem>
                        <SelectItem value="other" className="font-inter">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Home Phone</Label>
                    <Input
                      {...register('personalDetails.phoneHome')}
                      className="font-inter"
                      placeholder="Home phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Mobile Phone</Label>
                    <Input
                      {...register('personalDetails.phoneMobile')}
                      className="font-inter"
                      placeholder="Mobile phone number"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-inter text-sm font-medium">Address</Label>
                    <Textarea
                      {...register('personalDetails.address')}
                      placeholder="Full address"
                      rows={2}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      {...register('personalDetails.email')}
                      className="font-inter"
                      placeholder="Email address"
                    />
                    {errors.personalDetails?.email && (
                      <p className="text-xs text-error font-inter">
                        {errors.personalDetails.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Primary Language</Label>
                    <Input
                      {...register('personalDetails.primaryLanguage')}
                      className="font-inter"
                      placeholder="Primary language"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Other Languages</Label>
                    <Input
                      {...register('personalDetails.otherLanguages')}
                      className="font-inter"
                      placeholder="Other languages spoken"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Parent/Guardian Name</Label>
                    <Input
                      {...register('personalDetails.parentGuardianName')}
                      className="font-inter"
                      placeholder="If applicable"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="font-inter text-sm font-medium">Demographics</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: 'aboriginal', label: 'Aboriginal' },
                      { key: 'torresStraitIslander', label: 'Torres Strait Islander' },
                      { key: 'refugee', label: 'Refugee' },
                      { key: 'nonEnglishSpeaking', label: 'Non-English Speaking' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`personalDetails.${key}`}
                          checked={personalDetails[key as keyof typeof personalDetails] as boolean}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(`personalDetails.${key}`, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`personalDetails.${key}`}
                          className="font-inter text-sm font-normal cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Reason for Concern</Label>
                  <Textarea
                    {...register('reasonForConcern')}
                    placeholder="Primary reason for seeking treatment..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="medical" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  General Practitioner Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">GP Name</Label>
                    <Input
                      {...register('medicalHistory.gpDetails.name')}
                      className="font-inter"
                      placeholder="GP name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">GP Phone</Label>
                    <Input
                      {...register('medicalHistory.gpDetails.phone')}
                      className="font-inter"
                      placeholder="GP phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">GP Address</Label>
                    <Input
                      {...register('medicalHistory.gpDetails.address')}
                      className="font-inter"
                      placeholder="GP address"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Medical Conditions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'thyroidProblems', label: 'Thyroid Problems' },
                    { key: 'rheumatoidConditions', label: 'Rheumatoid Conditions' },
                    { key: 'asthmaRespiratory', label: 'Asthma/Respiratory' },
                    { key: 'steroidUseOsteoporosis', label: 'Steroid Use/Osteoporosis' },
                    { key: 'heartConditions', label: 'Heart Conditions' },
                    { key: 'epilepsy', label: 'Epilepsy' },
                    { key: 'diabetes', label: 'Diabetes' },
                    { key: 'other', label: 'Other' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`medicalConditions.${key}`}
                        checked={
                          medicalConditions[key as keyof typeof medicalConditions] as boolean
                        }
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            `medicalHistory.medicalConditions.${key}`,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`medicalConditions.${key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
                {medicalConditions.other && (
                  <div className="space-y-2">
                    <Textarea
                      {...register('medicalHistory.medicalConditions.otherText')}
                      placeholder="Please Specify Other Conditions..."
                      rows={2}
                      className="font-open-sans text-sm"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Condition Details</Label>
                  <Textarea
                    {...register('medicalHistory.medicalConditions.details')}
                    placeholder="Additional details about medical conditions..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Other Symptoms</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'unexplainedWeightLoss', label: 'Unexplained Weight Loss' },
                    { key: 'constantUnremittingPain', label: 'Constant Unremitting Pain' },
                    { key: 'historyOfCancer', label: 'History of Cancer' },
                    { key: 'thoracicPainNoCause', label: 'Thoracic Pain (No Cause)' },
                    { key: 'pinsNeedlesSaddle', label: 'Pins & Needles (Saddle)' },
                    { key: 'difficultySpeaking', label: 'Difficulty Speaking' },
                    { key: 'doubleVision', label: 'Double Vision' },
                    { key: 'ageOver55OrUnder20', label: 'Age Over 55 or Under 20' },
                    { key: 'widespreadPinsNeedles', label: 'Widespread Pins & Needles' },
                    { key: 'historyOfTrauma', label: 'History of Trauma' },
                    { key: 'recentBladderBowelChanges', label: 'Recent Bladder/Bowel Changes' },
                    { key: 'difficultySwallowing', label: 'Difficulty Swallowing' },
                    { key: 'unexplainedFainting', label: 'Unexplained Fainting' },
                    { key: 'dizziness', label: 'Dizziness' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`otherSymptoms.${key}`}
                        checked={otherSymptoms[key as keyof typeof otherSymptoms] as boolean}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            `medicalHistory.otherSymptoms.${key}`,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`otherSymptoms.${key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Past Medical History</Label>
                  <Textarea
                    {...register('medicalHistory.pastMedicalHistory')}
                    placeholder="Past medical history..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Medications</Label>
                  <Textarea
                    {...register('medicalHistory.medications')}
                    placeholder="Current medications..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-inter text-sm font-medium">Allergies</Label>
                  <Textarea
                    {...register('medicalHistory.allergies')}
                    placeholder="Known allergies..."
                    rows={3}
                    className="font-open-sans text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Symptoms Tab */}
            <TabsContent value="symptoms" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Behaviour of Symptoms
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">When Did It Start?</Label>
                    <Input
                      {...register('behaviourOfSymptoms.whenDidItStart')}
                      className="font-inter"
                      placeholder="E.g., 2 Weeks Ago"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Onset</Label>
                    <Select
                      value={watch('behaviourOfSymptoms.onset')}
                      onValueChange={(value) =>
                        setValue('behaviourOfSymptoms.onset', value as any, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="font-inter">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow" className="font-inter">
                          Slow
                        </SelectItem>
                        <SelectItem value="sudden" className="font-inter">
                          Sudden
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-inter text-sm font-medium">
                      How Have Symptoms Changed?
                    </Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.symptomsChanged')}
                      placeholder="Describe how symptoms have changed..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-inter text-sm font-medium">
                      Other Symptoms Elsewhere
                    </Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.otherSymptomsElsewhere')}
                      placeholder="Other symptoms in other areas..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-poppins font-semibold text-charcoal">
                    Pain Intensity (0-10)
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-inter text-sm font-medium">At Rest</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        {...register('behaviourOfSymptoms.painIntensity.atRest')}
                        className="font-inter"
                        placeholder="0-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-inter text-sm font-medium">At Best</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        {...register('behaviourOfSymptoms.painIntensity.atBest')}
                        className="font-inter"
                        placeholder="0-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-inter text-sm font-medium">At Worst</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        {...register('behaviourOfSymptoms.painIntensity.atWorst')}
                        className="font-inter"
                        placeholder="0-10"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-poppins font-semibold text-charcoal">
                    Symptoms Throughout Day
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-inter text-sm font-medium">AM</Label>
                      <Textarea
                        {...register('behaviourOfSymptoms.symptomsThroughoutDay.am')}
                        placeholder="Morning symptoms..."
                        rows={3}
                        className="font-open-sans text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-inter text-sm font-medium">Throughout Day</Label>
                      <Textarea
                        {...register('behaviourOfSymptoms.symptomsThroughoutDay.throughoutDay')}
                        placeholder="Daytime symptoms..."
                        rows={3}
                        className="font-open-sans text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-inter text-sm font-medium">Night Time</Label>
                      <Textarea
                        {...register('behaviourOfSymptoms.symptomsThroughoutDay.nightTime')}
                        placeholder="Nighttime symptoms..."
                        rows={3}
                        className="font-open-sans text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Degree Restricts Movement
                    </Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.degreeRestrictsMovement')}
                      placeholder="How much does it restrict movement?"
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Movements That Increase Symptoms
                    </Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.movementsIncreaseSymptoms')}
                      placeholder="Movements that make it worse..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Movements That Ease Symptoms
                    </Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.movementsEaseSymptoms')}
                      placeholder="Movements that help..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Symptoms Increase Details
                    </Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.symptomsIncreaseDetails')}
                      placeholder="Additional details..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Investigations</Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.investigations')}
                      placeholder="Previous investigations..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Previous Injuries</Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.previousInjuries')}
                      placeholder="Previous injuries..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-poppins font-semibold text-charcoal">
                    Pain Characteristics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { key: 'deep', label: 'Deep' },
                      { key: 'superficial', label: 'Superficial' },
                      { key: 'intermittent', label: 'Intermittent' },
                      { key: 'constant', label: 'Constant' },
                      { key: 'sharp', label: 'Sharp' },
                      { key: 'shooting', label: 'Shooting' },
                      { key: 'burning', label: 'Burning' },
                      { key: 'stinging', label: 'Stinging' },
                      { key: 'throbbing', label: 'Throbbing' },
                      { key: 'diffuse', label: 'Diffuse' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`painCharacteristics.${key}`}
                          checked={
                            painCharacteristics[key as keyof typeof painCharacteristics] as boolean
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(`painCharacteristics.${key}`, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`painCharacteristics.${key}`}
                          className="font-inter text-sm font-normal cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-poppins font-semibold text-charcoal">
                    Sensory Symptoms
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'pinsNeedles', label: 'Pins & Needles' },
                      { key: 'numbness', label: 'Numbness' },
                      { key: 'tingling', label: 'Tingling' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sensorySymptoms.${key}`}
                          checked={sensorySymptoms[key as keyof typeof sensorySymptoms] as boolean}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(`sensorySymptoms.${key}`, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`sensorySymptoms.${key}`}
                          className="font-inter text-sm font-normal cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-poppins font-semibold text-charcoal">
                    Joint Symptoms
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { key: 'clicking', label: 'Clicking' },
                      { key: 'locking', label: 'Locking' },
                      { key: 'popping', label: 'Popping' },
                      { key: 'grinding', label: 'Grinding' },
                      { key: 'givingWay', label: 'Giving Way' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`jointSymptoms.${key}`}
                          checked={jointSymptoms[key as keyof typeof jointSymptoms] as boolean}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(`jointSymptoms.${key}`, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`jointSymptoms.${key}`}
                          className="font-inter text-sm font-normal cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Joint Symptoms Details</Label>
                    <Textarea
                      {...register('jointSymptoms.details')}
                      placeholder="Additional details about joint symptoms..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Primary Concern</Label>
                  <Textarea
                    {...register('primaryConcern')}
                    placeholder="Patient's primary concern..."
                    rows={4}
                    className="font-open-sans text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Social History Tab */}
            <TabsContent value="social" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Social History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Living Situation</Label>
                    <Textarea
                      {...register('socialHistory.livingSituation')}
                      placeholder="Living situation..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Stairs</Label>
                    <Textarea
                      {...register('socialHistory.stairs')}
                      placeholder="Stairs in home..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Assistance with Household Tasks
                    </Label>
                    <Textarea
                      {...register('socialHistory.assistanceHouseholdTasks')}
                      placeholder="Assistance needed..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Occupation</Label>
                    <Textarea
                      {...register('socialHistory.occupation')}
                      placeholder="Current occupation..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Not Working Due to Symptoms
                    </Label>
                    <Textarea
                      {...register('socialHistory.notWorkingDueToSymptoms')}
                      placeholder="If not working, reason..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Currently Need Walking Aid
                    </Label>
                    <Textarea
                      {...register('socialHistory.currentlyNeedWalkingAid')}
                      placeholder="Current walking aids..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Previously Need Walking Aid
                    </Label>
                    <Textarea
                      {...register('socialHistory.previouslyNeedWalkingAid')}
                      placeholder="Previous walking aids..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Current Exercise</Label>
                    <Textarea
                      {...register('socialHistory.currentExercise')}
                      placeholder="Current exercise routine..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Previous Exercise</Label>
                    <Textarea
                      {...register('socialHistory.previousExercise')}
                      placeholder="Previous exercise routine..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-inter text-sm font-medium">Hobbies & Interests</Label>
                    <Textarea
                      {...register('socialHistory.hobbiesInterests')}
                      placeholder="Hobbies and interests..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Patient Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      What Do You Want to Achieve?
                    </Label>
                    <Textarea
                      {...register('goals.whatWantToAchieve')}
                      placeholder="Patient's goals..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      What Do You Expect From This Session?
                    </Label>
                    <Textarea
                      {...register('goals.whatExpectFromSession')}
                      placeholder="Session expectations..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      How Long to Achieve Goals?
                    </Label>
                    <Textarea
                      {...register('goals.howLongToAchieve')}
                      placeholder="Timeline expectations..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Signatures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Patient Signature</Label>
                    <Input
                      {...register('signatures.patientSignature')}
                      className="font-inter"
                      placeholder="Patient signature"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Patient Date</Label>
                    <Input
                      type="date"
                      {...register('signatures.patientDate')}
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Therapist Signature</Label>
                    <Input
                      {...register('signatures.therapistSignature')}
                      className="font-inter"
                      placeholder="Therapist signature"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Therapist Date</Label>
                    <Input
                      type="date"
                      {...register('signatures.therapistDate')}
                      className="font-inter"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !clientId}
          className="font-inter font-semibold"
        >
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
