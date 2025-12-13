'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MedicalHistoryFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

const medicalHistorySchema = z.object({
  personalDetails: z.any().optional(),
  reasonForConcern: z.string().optional(),
  medicalHistory: z.any().optional(),
  behaviourOfSymptoms: z.any().optional(),
  painCharacteristics: z.any().optional(),
  sensorySymptoms: z.any().optional(),
  jointSymptoms: z.any().optional(),
  primaryConcern: z.string().optional(),
  socialHistory: z.any().optional(),
  goals: z.any().optional(),
  signatures: z.any().optional(),
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
  const defaultDate = format(new Date(), 'yyyy-MM-dd');

  const defaultValues: Partial<MedicalHistoryFormData> = {
    personalDetails: {
      name: slot.booking?.client?.name || '',
      dateOfBirth: '',
      date: defaultDate,
      sex: '',
      parentGuardianName: '',
      phoneHome: '',
      phoneMobile: '',
      address: '',
      email: slot.booking?.client?.email || '',
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

  const onSubmitForm = (data: MedicalHistoryFormData) => {
    onSubmit(data);
  };

  const medicalConditions =
    watch('medicalHistory.medicalConditions') || defaultValues.medicalHistory?.medicalConditions;
  const otherSymptoms =
    watch('medicalHistory.otherSymptoms') || defaultValues.medicalHistory?.otherSymptoms;
  const painCharacteristics = watch('painCharacteristics') || defaultValues.painCharacteristics;
  const sensorySymptoms = watch('sensorySymptoms') || defaultValues.sensorySymptoms;
  const jointSymptoms = watch('jointSymptoms') || defaultValues.jointSymptoms;
  const personalDetails = watch('personalDetails') || defaultValues.personalDetails;

  const handleCheckboxChange = (path: string, checked: boolean) => {
    setValue(path as any, checked, { shouldValidate: true });
  };

  const renderPainScale = (label: string, fieldName: string) => {
    return (
      <div className="space-y-2">
        <Label className="font-inter text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <div key={num} className="flex items-center space-x-1">
              <RadioGroup
                value={watch(fieldName as any) || ''}
                onValueChange={(value) => setValue(fieldName as any, value)}
              >
                <RadioGroupItem value={num.toString()} id={`${fieldName}-${num}`} />
              </RadioGroup>
              <Label htmlFor={`${fieldName}-${num}`} className="font-inter text-xs cursor-pointer">
                {num}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins text-xl font-semibold text-charcoal">
            Medical History Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="personal" className="font-inter text-xs">
                Personal
              </TabsTrigger>
              <TabsTrigger value="medical" className="font-inter text-xs">
                Medical
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="font-inter text-xs">
                Symptoms
              </TabsTrigger>
              <TabsTrigger value="social" className="font-inter text-xs">
                Social
              </TabsTrigger>
              <TabsTrigger value="goals" className="font-inter text-xs">
                Goals
              </TabsTrigger>
            </TabsList>

            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">PERSONAL DETAILS</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-inter text-sm font-medium">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register('personalDetails.name')}
                      placeholder="Enter patient name"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="font-inter text-sm font-medium">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('personalDetails.dateOfBirth')}
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="font-inter text-sm font-medium">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      {...register('personalDetails.date')}
                      className="font-inter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Sex</Label>
                    <RadioGroup
                      value={watch('personalDetails.sex') || ''}
                      onValueChange={(value) => setValue('personalDetails.sex', value as any)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="sex-male" />
                        <Label
                          htmlFor="sex-male"
                          className="font-inter text-sm font-normal cursor-pointer"
                        >
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="sex-female" />
                        <Label
                          htmlFor="sex-female"
                          className="font-inter text-sm font-normal cursor-pointer"
                        >
                          Female
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="sex-other" />
                        <Label
                          htmlFor="sex-other"
                          className="font-inter text-sm font-normal cursor-pointer"
                        >
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentGuardianName" className="font-inter text-sm font-medium">
                      Parent/Guardian Name (if applicable)
                    </Label>
                    <Input
                      id="parentGuardianName"
                      {...register('personalDetails.parentGuardianName')}
                      placeholder="Enter parent/guardian name"
                      className="font-inter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneHome" className="font-inter text-sm font-medium">
                      Phone Number (home)
                    </Label>
                    <Input
                      id="phoneHome"
                      type="tel"
                      {...register('personalDetails.phoneHome')}
                      placeholder="Home phone number"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneMobile" className="font-inter text-sm font-medium">
                      Phone Number (mobile)
                    </Label>
                    <Input
                      id="phoneMobile"
                      type="tel"
                      {...register('personalDetails.phoneMobile')}
                      placeholder="Mobile phone number"
                      className="font-inter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="font-inter text-sm font-medium">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      {...register('personalDetails.address')}
                      placeholder="Enter full address"
                      className="min-h-[80px] font-open-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-inter text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('personalDetails.email')}
                      placeholder="email@example.com"
                      className="font-inter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryLanguage" className="font-inter text-sm font-medium">
                      Primary Language Spoken
                    </Label>
                    <Input
                      id="primaryLanguage"
                      {...register('personalDetails.primaryLanguage')}
                      placeholder="e.g., English"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherLanguages" className="font-inter text-sm font-medium">
                      Other Languages Spoken
                    </Label>
                    <Input
                      id="otherLanguages"
                      {...register('personalDetails.otherLanguages')}
                      placeholder="Enter other languages"
                      className="font-inter"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-inter text-sm font-medium">
                    Please Tick if you identify as any of the following:
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="aboriginal"
                        checked={personalDetails?.aboriginal || false}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange('personalDetails.aboriginal', checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="aboriginal"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Aboriginal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="torresStraitIslander"
                        checked={personalDetails?.torresStraitIslander || false}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            'personalDetails.torresStraitIslander',
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor="torresStraitIslander"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Torres Strait Islander
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="refugee"
                        checked={personalDetails?.refugee || false}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange('personalDetails.refugee', checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="refugee"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Refugee
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nonEnglishSpeaking"
                        checked={personalDetails?.nonEnglishSpeaking || false}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            'personalDetails.nonEnglishSpeaking',
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor="nonEnglishSpeaking"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Non-English-speaking background
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">REASON FOR CONCERN</h4>
                <div className="space-y-2">
                  <Textarea
                    {...register('reasonForConcern')}
                    placeholder="Please describe your reason for concern..."
                    className="min-h-[120px] font-open-sans"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="medical" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">MEDICAL HISTORY</h3>

              {/* GP Details */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">GP Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gpName" className="font-inter text-sm font-medium">
                      Name of GP
                    </Label>
                    <Input
                      id="gpName"
                      {...register('medicalHistory.gpDetails.name')}
                      placeholder="Enter GP name"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpPhone" className="font-inter text-sm font-medium">
                      Phone
                    </Label>
                    <Input
                      id="gpPhone"
                      type="tel"
                      {...register('medicalHistory.gpDetails.phone')}
                      placeholder="GP phone number"
                      className="font-inter"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpAddress" className="font-inter text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="gpAddress"
                    {...register('medicalHistory.gpDetails.address')}
                    placeholder="Enter GP address"
                    className="min-h-[80px] font-open-sans"
                  />
                </div>
              </div>

              <Separator />

              {/* Past Medical History */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Past Medical History</h4>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">
                    Please list any past medical history details:
                  </Label>
                  <Textarea
                    {...register('medicalHistory.pastMedicalHistory')}
                    placeholder="Enter past medical history..."
                    className="min-h-[100px] font-open-sans"
                  />
                </div>
              </div>

              <Separator />

              {/* Medical Conditions */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Medical Conditions</h4>
                <Label className="font-inter text-sm font-medium">
                  Do you suffer from any of the following medical conditions?
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {[
                      { key: 'thyroidProblems', label: 'Thyroid problems' },
                      { key: 'rheumatoidConditions', label: 'Rheumatoid conditions' },
                      { key: 'asthmaRespiratory', label: 'Asthma/Respiratory conditions' },
                      {
                        key: 'steroidUseOsteoporosis',
                        label: 'Steroid use/Osteoporosis medication',
                      },
                    ].map((condition) => (
                      <div key={condition.key} className="flex items-center justify-between">
                        <Label className="font-inter text-sm font-normal">{condition.label}</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroup
                              value={
                                medicalConditions?.[condition.key as keyof typeof medicalConditions]
                                  ? 'yes'
                                  : medicalConditions?.[
                                        condition.key as keyof typeof medicalConditions
                                      ] === false
                                    ? 'no'
                                    : ''
                              }
                              onValueChange={(value) => {
                                handleCheckboxChange(
                                  `medicalHistory.medicalConditions.${condition.key}`,
                                  value === 'yes',
                                );
                              }}
                            >
                              <div className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="yes" id={`${condition.key}-yes`} />
                                  <Label
                                    htmlFor={`${condition.key}-yes`}
                                    className="font-inter text-xs"
                                  >
                                    YES
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="no" id={`${condition.key}-no`} />
                                  <Label
                                    htmlFor={`${condition.key}-no`}
                                    className="font-inter text-xs"
                                  >
                                    NO
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'heartConditions', label: 'Heart conditions' },
                      { key: 'epilepsy', label: 'Epilepsy' },
                      { key: 'diabetes', label: 'Diabetes' },
                      { key: 'other', label: 'Other' },
                    ].map((condition) => (
                      <div key={condition.key} className="flex items-center justify-between">
                        <Label className="font-inter text-sm font-normal">{condition.label}</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroup
                              value={
                                medicalConditions?.[condition.key as keyof typeof medicalConditions]
                                  ? 'yes'
                                  : medicalConditions?.[
                                        condition.key as keyof typeof medicalConditions
                                      ] === false
                                    ? 'no'
                                    : ''
                              }
                              onValueChange={(value) => {
                                handleCheckboxChange(
                                  `medicalHistory.medicalConditions.${condition.key}`,
                                  value === 'yes',
                                );
                              }}
                            >
                              <div className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="yes" id={`${condition.key}-yes`} />
                                  <Label
                                    htmlFor={`${condition.key}-yes`}
                                    className="font-inter text-xs"
                                  >
                                    YES
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="no" id={`${condition.key}-no`} />
                                  <Label
                                    htmlFor={`${condition.key}-no`}
                                    className="font-inter text-xs"
                                  >
                                    NO
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    ))}
                    {medicalConditions?.other && (
                      <Input
                        {...register('medicalHistory.medicalConditions.otherText')}
                        placeholder="Specify other condition"
                        className="font-inter mt-2"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label className="font-inter text-sm font-medium">
                    If you answered YES to any of the above, please provide details:
                  </Label>
                  <Textarea
                    {...register('medicalHistory.medicalConditions.details')}
                    placeholder="Enter details..."
                    className="min-h-[100px] font-open-sans"
                  />
                </div>
              </div>

              <Separator />

              {/* Other Symptoms */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Other Symptoms</h4>
                <Label className="font-inter text-sm font-medium">
                  Do you have any of the following?
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {[
                      { key: 'unexplainedWeightLoss', label: 'Unexplained weight loss' },
                      { key: 'constantUnremittingPain', label: 'Constant, unremitting pain' },
                      { key: 'historyOfCancer', label: 'History of cancer' },
                      { key: 'thoracicPainNoCause', label: 'Thoracic pain with any obvious cause' },
                      {
                        key: 'pinsNeedlesSaddle',
                        label: 'Pins & needles or numbness in the saddle region',
                      },
                      { key: 'difficultySpeaking', label: 'Difficulty speaking' },
                      { key: 'doubleVision', label: 'Double vision' },
                    ].map((symptom) => (
                      <div key={symptom.key} className="flex items-center justify-between">
                        <Label className="font-inter text-sm font-normal">{symptom.label}</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroup
                              value={
                                otherSymptoms?.[symptom.key as keyof typeof otherSymptoms]
                                  ? 'yes'
                                  : 'no'
                              }
                              onValueChange={(value) => {
                                handleCheckboxChange(
                                  `medicalHistory.otherSymptoms.${symptom.key}`,
                                  value === 'yes',
                                );
                              }}
                            >
                              <div className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="yes" id={`${symptom.key}-yes`} />
                                  <Label
                                    htmlFor={`${symptom.key}-yes`}
                                    className="font-inter text-xs"
                                  >
                                    YES
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="no" id={`${symptom.key}-no`} />
                                  <Label
                                    htmlFor={`${symptom.key}-no`}
                                    className="font-inter text-xs"
                                  >
                                    NO
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'ageOver55OrUnder20', label: 'Age > 55 or <20 years old' },
                      {
                        key: 'widespreadPinsNeedles',
                        label: 'Widespread pins & needles/numbness/tingling',
                      },
                      { key: 'historyOfTrauma', label: 'History of trauma' },
                      { key: 'recentBladderBowelChanges', label: 'Recent bladder/bowel changes' },
                      { key: 'difficultySwallowing', label: 'Difficulty swallowing' },
                      { key: 'unexplainedFainting', label: 'Unexplained fainting episodes' },
                      { key: 'dizziness', label: 'Dizziness' },
                    ].map((symptom) => (
                      <div key={symptom.key} className="flex items-center justify-between">
                        <Label className="font-inter text-sm font-normal">{symptom.label}</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroup
                              value={
                                otherSymptoms?.[symptom.key as keyof typeof otherSymptoms]
                                  ? 'yes'
                                  : 'no'
                              }
                              onValueChange={(value) => {
                                handleCheckboxChange(
                                  `medicalHistory.otherSymptoms.${symptom.key}`,
                                  value === 'yes',
                                );
                              }}
                            >
                              <div className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="yes" id={`${symptom.key}-yes`} />
                                  <Label
                                    htmlFor={`${symptom.key}-yes`}
                                    className="font-inter text-xs"
                                  >
                                    YES
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="no" id={`${symptom.key}-no`} />
                                  <Label
                                    htmlFor={`${symptom.key}-no`}
                                    className="font-inter text-xs"
                                  >
                                    NO
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Allergies and Medications */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="font-inter text-sm font-medium">
                    Please list any allergies you have:
                  </Label>
                  <Textarea
                    id="allergies"
                    {...register('medicalHistory.allergies')}
                    placeholder="Enter allergies..."
                    className="min-h-[100px] font-open-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications" className="font-inter text-sm font-medium">
                    Please list your current medications:
                  </Label>
                  <Textarea
                    id="medications"
                    {...register('medicalHistory.medications')}
                    placeholder="Enter current medications..."
                    className="min-h-[100px] font-open-sans"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Symptoms Tab */}
            <TabsContent value="symptoms" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">
                BEHAVIOUR OF SYMPTOMS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whenDidItStart" className="font-inter text-sm font-medium">
                    When did your primary concern start/was there a known cause?
                  </Label>
                  <Textarea
                    id="whenDidItStart"
                    {...register('behaviourOfSymptoms.whenDidItStart')}
                    placeholder="Enter details..."
                    className="min-h-[80px] font-open-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">
                    Was the onset slow or sudden?
                  </Label>
                  <RadioGroup
                    value={watch('behaviourOfSymptoms.onset') || ''}
                    onValueChange={(value) => setValue('behaviourOfSymptoms.onset', value as any)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slow" id="onset-slow" />
                      <Label
                        htmlFor="onset-slow"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Slow
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sudden" id="onset-sudden" />
                      <Label
                        htmlFor="onset-sudden"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Sudden
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symptomsChanged" className="font-inter text-sm font-medium">
                    Have your symptoms changed since they first occurred?
                  </Label>
                  <Textarea
                    id="symptomsChanged"
                    {...register('behaviourOfSymptoms.symptomsChanged')}
                    placeholder="Enter details..."
                    className="min-h-[80px] font-open-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="otherSymptomsElsewhere"
                    className="font-inter text-sm font-medium"
                  >
                    Do you have other symptoms elsewhere in the body?
                  </Label>
                  <Textarea
                    id="otherSymptomsElsewhere"
                    {...register('behaviourOfSymptoms.otherSymptomsElsewhere')}
                    placeholder="Enter details..."
                    className="min-h-[80px] font-open-sans"
                  />
                </div>
              </div>

              <Separator />

              {/* Pain Intensity Scales */}
              <div className="space-y-4">
                <Label className="font-inter text-sm font-medium">
                  On a scale of 0 (no pain at all) to 10 (worst pain imaginable), what is the
                  intensity of your concern?
                </Label>
                {renderPainScale('At rest:', 'behaviourOfSymptoms.painIntensity.atRest')}
                {renderPainScale('At best:', 'behaviourOfSymptoms.painIntensity.atBest')}
                {renderPainScale('At worst:', 'behaviourOfSymptoms.painIntensity.atWorst')}
              </div>

              <Separator />

              {/* Symptoms Throughout Day */}
              <div className="space-y-4">
                <Label className="font-inter text-sm font-medium">
                  With regards to this concern, how do your symptoms change throughout the day?
                </Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">A.M. (First waking)</Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.symptomsThroughoutDay.am')}
                      placeholder="Enter symptoms in the morning..."
                      className="min-h-[60px] font-open-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Throughout the day</Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.symptomsThroughoutDay.throughoutDay')}
                      placeholder="Enter symptoms throughout the day..."
                      className="min-h-[60px] font-open-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Night time (end of the day, sleeping)
                    </Label>
                    <Textarea
                      {...register('behaviourOfSymptoms.symptomsThroughoutDay.nightTime')}
                      placeholder="Enter symptoms at night..."
                      className="min-h-[60px] font-open-sans"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="degreeRestrictsMovement"
                    className="font-inter text-sm font-medium"
                  >
                    What is the degree your symptoms restrict movement and function?
                  </Label>
                  <Textarea
                    id="degreeRestrictsMovement"
                    {...register('behaviourOfSymptoms.degreeRestrictsMovement')}
                    placeholder="Enter details..."
                    className="min-h-[80px] font-open-sans"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="movementsIncreaseSymptoms"
                      className="font-inter text-sm font-medium"
                    >
                      What movements and activities increase your symptoms?
                    </Label>
                    <Textarea
                      id="movementsIncreaseSymptoms"
                      {...register('behaviourOfSymptoms.movementsIncreaseSymptoms')}
                      placeholder="Enter details..."
                      className="min-h-[80px] font-open-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="movementsEaseSymptoms"
                      className="font-inter text-sm font-medium"
                    >
                      What movements and activities ease your symptoms?
                    </Label>
                    <Textarea
                      id="movementsEaseSymptoms"
                      {...register('behaviourOfSymptoms.movementsEaseSymptoms')}
                      placeholder="Enter details..."
                      className="min-h-[80px] font-open-sans"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="symptomsIncreaseDetails"
                    className="font-inter text-sm font-medium"
                  >
                    When your symptoms are increased, how quickly do they come on and how long do
                    they take to ease? (e.g., it takes 20 minutes of walking on flat ground for my
                    symptoms to increase to a 5/10 pain, and then it takes approximately 4 hours for
                    the symptoms to ease/settle.)
                  </Label>
                  <Textarea
                    id="symptomsIncreaseDetails"
                    {...register('behaviourOfSymptoms.symptomsIncreaseDetails')}
                    placeholder="Enter details with example..."
                    className="min-h-[100px] font-open-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investigations" className="font-inter text-sm font-medium">
                    Have you had any investigations performed relating to your concern? (e.g.
                    x-rays, MRI, blood test) If so - where? Can you provide copies of the reports or
                    images?
                  </Label>
                  <Textarea
                    id="investigations"
                    {...register('behaviourOfSymptoms.investigations')}
                    placeholder="Enter details..."
                    className="min-h-[80px] font-open-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousInjuries" className="font-inter text-sm font-medium">
                    Have you previously injured this area of concern? If so - please provide the
                    details of any treatment received.
                  </Label>
                  <Textarea
                    id="previousInjuries"
                    {...register('behaviourOfSymptoms.previousInjuries')}
                    placeholder="Enter details..."
                    className="min-h-[80px] font-open-sans"
                  />
                </div>
              </div>

              <Separator />

              {/* Pain Characteristics */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Pain Characteristics</h4>
                <Label className="font-inter text-sm font-medium">
                  Please tick the appropriate response below
                </Label>
                <Label className="font-inter text-sm font-medium">Is your pain...</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  ].map((char) => (
                    <div key={char.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pain-${char.key}`}
                        checked={
                          (painCharacteristics?.[
                            char.key as keyof typeof painCharacteristics
                          ] as boolean) || false
                        }
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            `painCharacteristics.${char.key}`,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`pain-${char.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {char.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Sensory Symptoms */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Sensory Symptoms</h4>
                <Label className="font-inter text-sm font-medium">Do you have any:</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'pinsNeedles', label: 'Pins & Needles' },
                    { key: 'numbness', label: 'Numbness' },
                    { key: 'tingling', label: 'Tingling' },
                  ].map((symptom) => (
                    <div key={symptom.key} className="flex items-center justify-between">
                      <Label className="font-inter text-sm font-normal">{symptom.label}</Label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroup
                            value={
                              sensorySymptoms?.[symptom.key as keyof typeof sensorySymptoms]
                                ? 'yes'
                                : 'no'
                            }
                            onValueChange={(value) => {
                              handleCheckboxChange(
                                `sensorySymptoms.${symptom.key}`,
                                value === 'yes',
                              );
                            }}
                          >
                            <div className="flex space-x-2">
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="yes" id={`${symptom.key}-yes`} />
                                <Label
                                  htmlFor={`${symptom.key}-yes`}
                                  className="font-inter text-xs"
                                >
                                  YES
                                </Label>
                              </div>
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="no" id={`${symptom.key}-no`} />
                                <Label htmlFor={`${symptom.key}-no`} className="font-inter text-xs">
                                  NO
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Joint Symptoms */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Joint Symptoms</h4>
                <Label className="font-inter text-sm font-medium">
                  Have you ever experienced any of the following:
                </Label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'clicking', label: 'Clicking' },
                    { key: 'locking', label: 'Locking' },
                    { key: 'popping', label: 'Popping' },
                    { key: 'grinding', label: 'Grinding' },
                    { key: 'givingWay', label: 'Giving way/Feeling unstable' },
                  ].map((symptom) => (
                    <div key={symptom.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`joint-${symptom.key}`}
                        checked={
                          (jointSymptoms?.[symptom.key as keyof typeof jointSymptoms] as boolean) ||
                          false
                        }
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(`jointSymptoms.${symptom.key}`, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`joint-${symptom.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {symptom.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {(jointSymptoms?.clicking ||
                  jointSymptoms?.locking ||
                  jointSymptoms?.popping ||
                  jointSymptoms?.grinding ||
                  jointSymptoms?.givingWay) && (
                  <div className="space-y-2 mt-4">
                    <Label className="font-inter text-sm font-medium">
                      If YES – please provide details:
                    </Label>
                    <Textarea
                      {...register('jointSymptoms.details')}
                      placeholder="Enter details..."
                      className="min-h-[80px] font-open-sans"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Primary Concern */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Primary Concern</h4>
                <div className="space-y-2">
                  <Label htmlFor="primaryConcern" className="font-inter text-sm font-medium">
                    Please describe your primary concern(s):
                  </Label>
                  <Textarea
                    id="primaryConcern"
                    {...register('primaryConcern')}
                    placeholder="Enter primary concern..."
                    className="min-h-[100px] font-open-sans"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Social History Tab */}
            <TabsContent value="social" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">SOCIAL HISTORY</h3>

              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium w-1/2">
                          Question
                        </th>
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium w-1/2">
                          Response
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          key: 'livingSituation',
                          label: 'Please describe your living situation',
                          type: 'textarea',
                        },
                        {
                          key: 'stairs',
                          label: 'Does where you live have stairs? If so, how many?',
                          type: 'input',
                        },
                        {
                          key: 'assistanceHouseholdTasks',
                          label: 'Do you currently need assistance to complete household tasks?',
                          type: 'textarea',
                        },
                        {
                          key: 'occupation',
                          label: 'What is your occupation?',
                          type: 'input',
                        },
                        {
                          key: 'notWorkingDueToSymptoms',
                          label: 'If you are not working – is this due to your current symptoms?',
                          type: 'textarea',
                        },
                        {
                          key: 'currentlyNeedWalkingAid',
                          label: 'Do you currently require a walking aid?',
                          type: 'textarea',
                        },
                        {
                          key: 'previouslyNeedWalkingAid',
                          label: 'Prior to the onset of your symptoms, did you need a walking aid?',
                          type: 'textarea',
                        },
                        {
                          key: 'currentExercise',
                          label: 'How much exercise are you currently doing?',
                          type: 'textarea',
                        },
                        {
                          key: 'previousExercise',
                          label: 'How much exercise were you doing previously?',
                          type: 'textarea',
                        },
                        {
                          key: 'hobbiesInterests',
                          label: 'What are your hobbies/interests?',
                          type: 'textarea',
                        },
                      ].map((item) => (
                        <tr key={item.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm">
                            {item.label}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {item.type === 'textarea' ? (
                              <Textarea
                                {...register(`socialHistory.${item.key}` as any)}
                                className="min-h-[60px] font-open-sans text-sm"
                                placeholder="Enter response..."
                              />
                            ) : (
                              <Input
                                {...register(`socialHistory.${item.key}` as any)}
                                className="font-inter"
                                placeholder="Enter response..."
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">GOALS</h3>

              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium w-1/2">
                          Question
                        </th>
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium w-1/2">
                          Response
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          key: 'whatWantToAchieve',
                          label: 'What do you want to achieve through Physiotherapy?',
                        },
                        {
                          key: 'whatExpectFromSession',
                          label: 'What do you expect from your Physiotherapy session?',
                        },
                        {
                          key: 'howLongToAchieve',
                          label: 'How long do you expect it will take to achieve your goals?',
                        },
                      ].map((item) => (
                        <tr key={item.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm">
                            {item.label}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Textarea
                              {...register(`goals.${item.key}` as any)}
                              className="min-h-[80px] font-open-sans text-sm"
                              placeholder="Enter response..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Signatures */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Signatures</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientSignature" className="font-inter text-sm font-medium">
                      Patient Signature
                    </Label>
                    <Input
                      id="patientSignature"
                      {...register('signatures.patientSignature')}
                      placeholder="Patient signature"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientDate" className="font-inter text-sm font-medium">
                      Date
                    </Label>
                    <Input
                      id="patientDate"
                      type="date"
                      {...register('signatures.patientDate')}
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="therapistSignature" className="font-inter text-sm font-medium">
                      Therapist Signature
                    </Label>
                    <Input
                      id="therapistSignature"
                      {...register('signatures.therapistSignature')}
                      placeholder="Therapist signature"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="therapistDate" className="font-inter text-sm font-medium">
                      Date
                    </Label>
                    <Input
                      id="therapistDate"
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

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} className="font-inter font-semibold">
          {isSubmitting ? 'Saving...' : 'Save Form'}
        </Button>
      </div>
    </form>
  );
};
