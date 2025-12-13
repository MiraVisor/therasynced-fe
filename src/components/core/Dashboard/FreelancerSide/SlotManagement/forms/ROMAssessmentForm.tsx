'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Save } from 'lucide-react';
import React, { useEffect } from 'react';
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
import { ROMAssessmentFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

// Simplified Zod schema - all fields optional for POC
const romAssessmentSchema = z.object({
  physicalExaminationNotes: z.string().optional(),
  skinSoftTissues: z.object({
    swelling: z.object({ minor: z.boolean(), important: z.boolean() }),
    callus: z.object({ minor: z.boolean(), important: z.boolean() }),
    scar: z.object({ minor: z.boolean(), important: z.boolean() }),
    wound: z.object({ minor: z.boolean(), important: z.boolean() }),
    temperature: z.object({ minor: z.boolean(), important: z.boolean() }),
    infection: z.object({ minor: z.boolean(), important: z.boolean() }),
    pain: z.object({ minor: z.boolean(), important: z.boolean() }),
    abnormalSensation: z.object({ minor: z.boolean(), important: z.boolean() }),
  }),
  sensation: z.object({
    superficial: z.object({ right: z.string(), left: z.string(), specification: z.string() }),
    deep: z.object({ right: z.string(), left: z.string(), specification: z.string() }),
    numbness: z.object({ right: z.string(), left: z.string(), specification: z.string() }),
    paresthesia: z.object({ right: z.string(), left: z.string(), specification: z.string() }),
    other: z.object({ right: z.string(), left: z.string(), specification: z.string() }),
  }),
  reflexes: z.object({
    btr: z.object({ right: z.string(), left: z.string(), comments: z.string() }),
    ttr: z.object({ right: z.string(), left: z.string(), comments: z.string() }),
    ktr: z.object({ right: z.string(), left: z.string(), comments: z.string() }),
    atr: z.object({ right: z.string(), left: z.string(), comments: z.string() }),
    babinsky: z.object({ right: z.string(), left: z.string(), comments: z.string() }),
  }),
  lowerLimbROM: z.any(),
  upperLimbROM: z.any(),
  neckROM: z.any(),
  trunkROM: z.any(),
  lowerLimbMuscleTest: z.any(),
  upperLimbMuscleTest: z.any(),
  functionalEvaluation: z.any(),
  activityLimitations: z.any(),
  conclusion: z.any(),
});

interface ROMAssessmentFormProps {
  initialData?: ROMAssessmentFormData;
  onSubmit: (data: ROMAssessmentFormData) => void;
  slot: Slot;
}

// Helper to create default ROM structure for lower limbs
const createROMStructure = (assessmentDate: string, followUpDate: string) => ({
  assessmentDate,
  followUpDate,
  hip: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    abduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    adduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    medialRotation: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
    lateralRotation: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
  },
  knee: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  ankleFoot: {
    dorsiFlexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    plantarFlexion: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
    inversion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    eversion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
});

// Helper to create default ROM structure for upper limbs
const createUpperLimbROMStructure = (assessmentDate: string, followUpDate: string) => ({
  assessmentDate,
  followUpDate,
  shoulder: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    abduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    adduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    medialRotation: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
    lateralRotation: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
  },
  elbow: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  forearm: {
    pronation: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    supination: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  wrist: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    radialDeviation: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
    ulnarDeviation: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
  },
  fingers: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    abduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
});

// Helper to create default muscle test structure for lower limbs
const createLowerLimbMuscleTestStructure = (assessmentDate: string, followUpDate: string) => ({
  assessmentDate,
  followUpDate,
  hip: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    abduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    adduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  knee: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  ankle: {
    dorsiFlexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    plantarFlexion: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
    inversion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    eversion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  foot: {
    toeFlexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    toeExtension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  trunk: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    lateralFlexion: {
      leftAssessment: '',
      rightAssessment: '',
      leftFollowUp: '',
      rightFollowUp: '',
    },
    rotation: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
});

// Helper to create default muscle test structure for upper limbs
const createUpperLimbMuscleTestStructure = (assessmentDate: string, followUpDate: string) => ({
  assessmentDate,
  followUpDate,
  shoulder: {
    elevators: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    depressors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    antepulsors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    retropulsors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  elbow: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  forearm: {
    pronation: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    supination: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  wrist: {
    flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
  fingers: {
    abductors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
    opposition: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
  },
});

const defaultValues: ROMAssessmentFormData = {
  physicalExaminationNotes: '',
  skinSoftTissues: {
    swelling: { minor: false, important: false },
    callus: { minor: false, important: false },
    scar: { minor: false, important: false },
    wound: { minor: false, important: false },
    temperature: { minor: false, important: false },
    infection: { minor: false, important: false },
    pain: { minor: false, important: false },
    abnormalSensation: { minor: false, important: false },
  },
  sensation: {
    superficial: { right: '', left: '', specification: '' },
    deep: { right: '', left: '', specification: '' },
    numbness: { right: '', left: '', specification: '' },
    paresthesia: { right: '', left: '', specification: '' },
    other: { right: '', left: '', specification: '' },
  },
  reflexes: {
    btr: { right: '', left: '', comments: '' },
    ttr: { right: '', left: '', comments: '' },
    ktr: { right: '', left: '', comments: '' },
    atr: { right: '', left: '', comments: '' },
    babinsky: { right: '', left: '', comments: '' },
  },
  lowerLimbROM: createROMStructure(format(new Date(), 'yyyy-MM-dd'), ''),
  upperLimbROM: createUpperLimbROMStructure(format(new Date(), 'yyyy-MM-dd'), ''),
  neckROM: {
    flexion: '',
    extension: '',
    lateroFlexionRight: '',
    lateroFlexionLeft: '',
    rotationRight: '',
    rotationLeft: '',
  },
  trunkROM: {
    globalFlexion: '',
    thoracicFlexion: '',
    lumbarFlexion: '',
    globalExtension: '',
    lateroFlexionRight: '',
    lateroFlexionLeft: '',
    rotationRight: '',
    rotationLeft: '',
  },
  lowerLimbMuscleTest: createLowerLimbMuscleTestStructure(format(new Date(), 'yyyy-MM-dd'), ''),
  upperLimbMuscleTest: createUpperLimbMuscleTestStructure(format(new Date(), 'yyyy-MM-dd'), ''),
  functionalEvaluation: {
    balance: { sitting: '', standing: '' },
    coordination: {
      upperLimbs: { left: '', right: '' },
      lowerLimbs: { left: '', right: '' },
      comments: '',
    },
    gaitAnalysis: {
      frontalPlane: '',
      sagittalPlane: '',
      safety: '',
      cadence: '',
      speed: '',
      fatigue: '',
      safetyComments: '',
      cadenceComments: '',
      speedComments: '',
      fatigueComments: '',
      otherRemarks: '',
    },
  },
  activityLimitations: {
    mobility: {
      crawling: '',
      crouchingGait: '',
      walking: '',
      squatting: '',
      stairs: '',
      running: '',
    },
    transfers: {
      lieToSit: '',
      sitToStand: '',
      standToFloor: '',
      sitToSit: '',
    },
    balance: {
      sitting: '',
      standing: '',
      onOneLeg: '',
    },
    upperLimbFunctions: {
      grasp: { right: '', left: '' },
      release: { right: '', left: '' },
      fineManipulation: { right: '', left: '' },
      holding: { right: '', left: '' },
    },
    dailyLifeActivities: {
      dressingUpper: '',
      dressingLower: '',
      toileting: '',
      bathing: '',
      washing: '',
      eating: '',
      drinking: '',
    },
    assistedDevices: {
      withoutDevices: false,
      oneCrutch: { used: false, quality: '' },
      pairOfCrutches: { used: false, quality: '' },
      walkingFrame: { used: false, quality: '' },
      wheelchair: { used: false, quality: '' },
      orthosisRight: { used: false, quality: '', type: '' },
      orthosisLeft: { used: false, quality: '', type: '' },
    },
  },
  conclusion: {
    environmentalFactors: {
      personalConditions: '',
      livingConditions: '',
      medSocialStructures: '',
      currentTreatment: '',
      remarks: '',
    },
    bodyStructureImpairments: {
      assTraumaDiseases: '',
      romStatus: '',
      muscleStatus: '',
      skinSoftTissuesPain: '',
      cardioVascularStatus: '',
    },
    activityLimitationsParticipation: {
      generalMobility: '',
      transfers: '',
      balance: '',
      upperLimbFunctions: '',
      dailyLifeActivities: '',
    },
    referral: {
      referredTo: '',
      referralReasons: {
        medicalCare: false,
        medication: false,
        orthopaedicConsultation: false,
        orthopaedicSurgery: false,
        nursingCare: false,
        removeCast: false,
        stumpRevision: false,
        tenotomy: false,
        other: false,
        otherText: '',
      },
    },
  },
};

export const ROMAssessmentForm = ({ initialData, onSubmit, slot }: ROMAssessmentFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ROMAssessmentFormData>({
    resolver: zodResolver(romAssessmentSchema),
    defaultValues: initialData || defaultValues,
  });

  const skinSoftTissues = watch('skinSoftTissues');
  const functionalEvaluation = watch('functionalEvaluation');

  const handleCheckboxChange = (path: string, checked: boolean) => {
    setValue(path as any, checked, { shouldValidate: true });
  };

  const onFormSubmit = (data: ROMAssessmentFormData) => {
    onSubmit(data);
  };

  // Helper component for ROM input fields
  const ROMInputField = ({
    label,
    path,
    side,
    type = 'assessment',
  }: {
    label: string;
    path: string;
    side: 'left' | 'right';
    type?: 'assessment' | 'followUp';
  }) => {
    const fieldName = type === 'assessment' ? `${side}Assessment` : `${side}FollowUp`;
    return (
      <div className="space-y-1">
        <Label className="font-inter text-xs font-medium">{label}</Label>
        <Input
          {...register(`${path}.${fieldName}` as any)}
          className="font-inter h-9 text-xs"
          placeholder="Degrees"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-poppins font-semibold text-charcoal">
            ROM Assessment Form
          </CardTitle>
          <CardDescription className="font-inter">
            Comprehensive range of motion and functional assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="physical" className="w-full">
            <TabsList className="font-inter h-12 gap-2 p-1">
              <TabsTrigger value="physical" className="px-6 py-2.5 text-base font-semibold">
                Physical Exam
              </TabsTrigger>
              <TabsTrigger value="rom" className="px-6 py-2.5 text-base font-semibold">
                Range of Motion
              </TabsTrigger>
              <TabsTrigger value="muscle" className="px-6 py-2.5 text-base font-semibold">
                Muscle Test
              </TabsTrigger>
              <TabsTrigger value="functional" className="px-6 py-2.5 text-base font-semibold">
                Functional
              </TabsTrigger>
              <TabsTrigger value="conclusion" className="px-6 py-2.5 text-base font-semibold">
                Conclusion
              </TabsTrigger>
            </TabsList>

            {/* Physical Examination Tab */}
            <TabsContent value="physical" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Physical Examination Notes
                </h3>
                <Textarea
                  {...register('physicalExaminationNotes')}
                  placeholder="Physical examination findings..."
                  rows={6}
                  className="font-open-sans text-sm"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Skin & Soft Tissues
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'swelling', label: 'Swelling' },
                    { key: 'callus', label: 'Callus' },
                    { key: 'scar', label: 'Scar' },
                    { key: 'wound', label: 'Wound' },
                    { key: 'temperature', label: 'Temperature' },
                    { key: 'infection', label: 'Infection' },
                    { key: 'pain', label: 'Pain' },
                    { key: 'abnormalSensation', label: 'Abnormal Sensation' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label className="font-inter text-sm font-medium">{label}</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`skinSoftTissues.${key}.minor`}
                            checked={skinSoftTissues[key as keyof typeof skinSoftTissues].minor}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                `skinSoftTissues.${key}.minor`,
                                checked as boolean,
                              )
                            }
                          />
                          <Label
                            htmlFor={`skinSoftTissues.${key}.minor`}
                            className="font-inter text-xs font-normal cursor-pointer"
                          >
                            Minor
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`skinSoftTissues.${key}.important`}
                            checked={skinSoftTissues[key as keyof typeof skinSoftTissues].important}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                `skinSoftTissues.${key}.important`,
                                checked as boolean,
                              )
                            }
                          />
                          <Label
                            htmlFor={`skinSoftTissues.${key}.important`}
                            className="font-inter text-xs font-normal cursor-pointer"
                          >
                            Important
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Sensation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'superficial', label: 'Superficial' },
                    { key: 'deep', label: 'Deep' },
                    { key: 'numbness', label: 'Numbness' },
                    { key: 'paresthesia', label: 'Paresthesia' },
                    { key: 'other', label: 'Other' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label className="font-inter text-sm font-medium">{label}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          {...register(`sensation.${key}.right` as any)}
                          className="font-inter"
                          placeholder="Right"
                        />
                        <Input
                          {...register(`sensation.${key}.left` as any)}
                          className="font-inter"
                          placeholder="Left"
                        />
                      </div>
                      <Input
                        {...register(`sensation.${key}.specification` as any)}
                        className="font-inter"
                        placeholder="Specification"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Reflexes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'btr', label: 'BTR (Biceps Tendon Reflex)' },
                    { key: 'ttr', label: 'TTR (Triceps Tendon Reflex)' },
                    { key: 'ktr', label: 'KTR (Knee Tendon Reflex)' },
                    { key: 'atr', label: 'ATR (Achilles Tendon Reflex)' },
                    { key: 'babinsky', label: 'Babinsky' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label className="font-inter text-sm font-medium">{label}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          {...register(`reflexes.${key}.right` as any)}
                          className="font-inter"
                          placeholder="Right"
                        />
                        <Input
                          {...register(`reflexes.${key}.left` as any)}
                          className="font-inter"
                          placeholder="Left"
                        />
                      </div>
                      <Textarea
                        {...register(`reflexes.${key}.comments` as any)}
                        placeholder="Comments"
                        rows={2}
                        className="font-open-sans text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Range of Motion Tab */}
            <TabsContent value="rom" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-poppins font-semibold text-charcoal">
                    Lower Limb ROM
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-inter text-sm font-medium">Assessment Date</Label>
                      <Input
                        type="date"
                        {...register('lowerLimbROM.assessmentDate' as any)}
                        className="font-inter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-inter text-sm font-medium">Follow-up Date</Label>
                      <Input
                        type="date"
                        {...register('lowerLimbROM.followUpDate' as any)}
                        className="font-inter"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-poppins font-semibold text-charcoal">Hip</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div></div>
                      <div className="font-inter text-sm font-semibold">Left Assessment</div>
                      <div className="font-inter text-sm font-semibold">Right Assessment</div>
                      <div className="font-inter text-sm font-semibold">Follow-up</div>
                      {[
                        { key: 'flexion', label: 'Flexion' },
                        { key: 'extension', label: 'Extension' },
                        { key: 'abduction', label: 'Abduction' },
                        { key: 'adduction', label: 'Adduction' },
                        { key: 'medialRotation', label: 'Medial Rotation' },
                        { key: 'lateralRotation', label: 'Lateral Rotation' },
                      ].map(({ key, label }) => (
                        <React.Fragment key={key}>
                          <Label className="font-inter text-sm font-medium">{label}</Label>
                          <Input
                            {...register(`lowerLimbROM.hip.${key}.leftAssessment` as any)}
                            className="font-inter h-8 text-xs"
                            placeholder="L"
                          />
                          <Input
                            {...register(`lowerLimbROM.hip.${key}.rightAssessment` as any)}
                            className="font-inter h-8 text-xs"
                            placeholder="R"
                          />
                          <Input
                            {...register(`lowerLimbROM.hip.${key}.leftFollowUp` as any)}
                            className="font-inter h-8 text-xs"
                            placeholder="FU"
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-poppins font-semibold text-charcoal">
                    Neck ROM (cm)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'flexion', label: 'Flexion' },
                      { key: 'extension', label: 'Extension' },
                      { key: 'lateroFlexionRight', label: 'Lateral Flexion Right' },
                      { key: 'lateroFlexionLeft', label: 'Lateral Flexion Left' },
                      { key: 'rotationRight', label: 'Rotation Right' },
                      { key: 'rotationLeft', label: 'Rotation Left' },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <Label className="font-inter text-sm font-medium">{label}</Label>
                        <Input
                          {...register(`neckROM.${key}` as any)}
                          className="font-inter"
                          placeholder="cm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-poppins font-semibold text-charcoal">Trunk ROM</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'globalFlexion', label: 'Global Flexion (cm)' },
                      { key: 'thoracicFlexion', label: 'Thoracic Flexion (cm)' },
                      { key: 'lumbarFlexion', label: 'Lumbar Flexion (cm)' },
                      { key: 'globalExtension', label: 'Global Extension (cm)' },
                      { key: 'lateroFlexionRight', label: 'Lateral Flexion Right (cm)' },
                      { key: 'lateroFlexionLeft', label: 'Lateral Flexion Left (cm)' },
                      { key: 'rotationRight', label: 'Rotation Right' },
                      { key: 'rotationLeft', label: 'Rotation Left' },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <Label className="font-inter text-sm font-medium">{label}</Label>
                        <Input
                          {...register(`trunkROM.${key}` as any)}
                          className="font-inter"
                          placeholder={key.includes('rotation') ? 'OK/imp.' : 'cm'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Muscle Test Tab */}
            <TabsContent value="muscle" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">
                  Lower Limb Muscle Test (Oxford Scale 0-5)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Assessment Date</Label>
                    <Input
                      type="date"
                      {...register('lowerLimbMuscleTest.assessmentDate' as any)}
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Follow-up Date</Label>
                    <Input
                      type="date"
                      {...register('lowerLimbMuscleTest.followUpDate' as any)}
                      className="font-inter"
                    />
                  </div>
                </div>
                <p className="text-xs font-inter text-muted-foreground">
                  Enter muscle strength values (0-5) for each movement
                </p>
              </div>
            </TabsContent>

            {/* Functional Evaluation Tab */}
            <TabsContent value="functional" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Balance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Sitting</Label>
                    <Select
                      value={functionalEvaluation?.balance?.sitting || ''}
                      onValueChange={(value) =>
                        setValue('functionalEvaluation.balance.sitting' as any, value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="font-inter">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal" className="font-inter">
                          Normal
                        </SelectItem>
                        <SelectItem value="good" className="font-inter">
                          Good
                        </SelectItem>
                        <SelectItem value="poor" className="font-inter">
                          Poor
                        </SelectItem>
                        <SelectItem value="notPossible" className="font-inter">
                          Not Possible
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Standing</Label>
                    <Select
                      value={functionalEvaluation?.balance?.standing || ''}
                      onValueChange={(value) =>
                        setValue('functionalEvaluation.balance.standing' as any, value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="font-inter">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal" className="font-inter">
                          Normal
                        </SelectItem>
                        <SelectItem value="good" className="font-inter">
                          Good
                        </SelectItem>
                        <SelectItem value="poor" className="font-inter">
                          Poor
                        </SelectItem>
                        <SelectItem value="notPossible" className="font-inter">
                          Not Possible
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Gait Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Frontal Plane Observations
                    </Label>
                    <Textarea
                      {...register('functionalEvaluation.gaitAnalysis.frontalPlane' as any)}
                      placeholder="Frontal plane observations..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Sagittal Plane Observations
                    </Label>
                    <Textarea
                      {...register('functionalEvaluation.gaitAnalysis.sagittalPlane' as any)}
                      placeholder="Sagittal plane observations..."
                      rows={3}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Conclusion Tab */}
            <TabsContent value="conclusion" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Conclusion</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Body Structure Impairments
                    </Label>
                    <Textarea
                      {...register('conclusion.bodyStructureImpairments.romStatus' as any)}
                      placeholder="ROM status..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Activity Limitations</Label>
                    <Textarea
                      {...register(
                        'conclusion.activityLimitationsParticipation.generalMobility' as any,
                      )}
                      placeholder="General mobility..."
                      rows={4}
                      className="font-open-sans text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-poppins font-semibold text-charcoal">Referral</h3>
                <div className="space-y-2">
                  <Label className="font-inter text-sm font-medium">Referred To</Label>
                  <Input
                    {...register('conclusion.referral.referredTo' as any)}
                    className="font-inter"
                    placeholder="Specialist or service"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-inter text-sm font-medium">Referral Reasons</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'medicalCare', label: 'Medical Care' },
                      { key: 'medication', label: 'Medication' },
                      { key: 'orthopaedicConsultation', label: 'Orthopaedic Consultation' },
                      { key: 'orthopaedicSurgery', label: 'Orthopaedic Surgery' },
                      { key: 'nursingCare', label: 'Nursing Care' },
                      { key: 'other', label: 'Other' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`referralReasons.${key}`}
                          checked={
                            watch(`conclusion.referral.referralReasons.${key}` as any) || false
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              `conclusion.referral.referralReasons.${key}`,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`referralReasons.${key}`}
                          className="font-inter text-sm font-normal cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
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
