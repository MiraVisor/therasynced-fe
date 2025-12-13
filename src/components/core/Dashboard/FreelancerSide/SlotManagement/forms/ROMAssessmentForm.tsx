'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { ROMAssessmentFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

// Simplified schema for POC - can be expanded later
const romAssessmentSchema = z.object({
  physicalExaminationNotes: z.string().optional(),
  skinSoftTissues: z.any().optional(),
  sensation: z.any().optional(),
  reflexes: z.any().optional(),
  lowerLimbROM: z.any().optional(),
  upperLimbROM: z.any().optional(),
  neckROM: z.any().optional(),
  trunkROM: z.any().optional(),
  lowerLimbMuscleTest: z.any().optional(),
  upperLimbMuscleTest: z.any().optional(),
  functionalEvaluation: z.any().optional(),
  activityLimitations: z.any().optional(),
  conclusion: z.any().optional(),
});

interface ROMAssessmentFormProps {
  initialData?: Record<string, any> | null;
  onSubmit: (data: ROMAssessmentFormData) => void;
  slot: Slot;
}

export const ROMAssessmentForm: React.FC<ROMAssessmentFormProps> = ({
  initialData,
  onSubmit,
  slot,
}) => {
  const defaultValues: Partial<ROMAssessmentFormData> = {
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
    lowerLimbROM: {
      assessmentDate: '',
      followUpDate: '',
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
        dorsiFlexion: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        plantarFlexion: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        inversion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        eversion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
    },
    upperLimbROM: {
      assessmentDate: '',
      followUpDate: '',
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
        supination: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
      },
      wrist: {
        flexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extension: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        abduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        adduction: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
      fingers: {
        thumbOpposition: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        mpFlexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        mpExtension: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        ipFlexion: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
    },
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
    lowerLimbMuscleTest: {
      assessmentDate: '',
      followUpDate: '',
      hip: {
        flexors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extensors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        abductors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        adductors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        lateralRot: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        medialRot: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
      knee: {
        flexors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extensors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
      ankle: {
        dorsiFlexors: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        plantarFlexors: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        invertors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        evertors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
      foot: {
        flexors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extensors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
      trunk: {
        flexors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extensor: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        rightBending: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        leftBending: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        rightRotation: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        leftRotation: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
      },
    },
    upperLimbMuscleTest: {
      assessmentDate: '',
      followUpDate: '',
      shoulder: {
        flexors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extensors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        abductors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        adductors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        lateralRot: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        medialRot: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        elevators: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        depressors: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        antepulsors: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        retropulsors: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
      },
      elbow: {
        flexors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extensors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
      forearm: {
        supinators: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
        pronators: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
      wrist: {
        flexors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extensors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
      },
      fingers: {
        flexors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        extensors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        abductors: { leftAssessment: '', rightAssessment: '', leftFollowUp: '', rightFollowUp: '' },
        opposition: {
          leftAssessment: '',
          rightAssessment: '',
          leftFollowUp: '',
          rightFollowUp: '',
        },
      },
    },
    functionalEvaluation: {
      balance: {
        sitting: '',
        standing: '',
      },
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

  const onSubmitForm = (data: ROMAssessmentFormData) => {
    onSubmit(data);
  };

  const skinSoftTissues = watch('skinSoftTissues') || defaultValues.skinSoftTissues;
  const sensation = watch('sensation') || defaultValues.sensation;
  const reflexes = watch('reflexes') || defaultValues.reflexes;
  const activityLimitations = watch('activityLimitations') || defaultValues.activityLimitations;
  const assistedDevices =
    activityLimitations?.assistedDevices || defaultValues.activityLimitations?.assistedDevices;
  const referralReasons =
    watch('conclusion.referral.referralReasons') ||
    defaultValues.conclusion?.referral?.referralReasons;

  const handleCheckboxChange = (path: string, checked: boolean) => {
    setValue(path as any, checked, { shouldValidate: true });
  };

  const renderROMTable = (
    section: string,
    movements: Array<{ key: string; label: string; normalValue?: string; fullPath: string }>,
    assessmentDatePath: string,
    followUpDatePath: string,
  ) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-poppins font-semibold text-charcoal">{section}</h4>
          <div className="flex gap-4 text-xs font-inter text-muted-foreground">
            <div className="flex gap-2">
              <span>Assessment Date:</span>
              <Input
                type="date"
                {...register(assessmentDatePath as any)}
                className="h-7 w-32 text-xs font-inter"
              />
            </div>
            <div className="flex gap-2">
              <span>Follow Up Date:</span>
              <Input
                type="date"
                {...register(followUpDatePath as any)}
                className="h-7 w-32 text-xs font-inter"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                  Movement
                </th>
                <th
                  className="border border-gray-300 p-2 text-center font-inter font-medium"
                  colSpan={2}
                >
                  DATE Assessment
                </th>
                <th
                  className="border border-gray-300 p-2 text-center font-inter font-medium"
                  colSpan={2}
                >
                  DATE Follow up
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2 text-center font-inter text-xs">L</th>
                <th className="border border-gray-300 p-2 text-center font-inter text-xs">R</th>
                <th className="border border-gray-300 p-2 text-center font-inter text-xs">L</th>
                <th className="border border-gray-300 p-2 text-center font-inter text-xs">R</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.key}>
                  <td className="border border-gray-300 p-2 font-inter text-sm">
                    {movement.label}
                    {movement.normalValue && (
                      <span className="text-muted-foreground ml-2">({movement.normalValue})</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-1">
                    <Input
                      {...register(`${movement.fullPath}.leftAssessment` as any)}
                      className="h-8 text-xs font-inter text-center"
                      placeholder="L"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <Input
                      {...register(`${movement.fullPath}.rightAssessment` as any)}
                      className="h-8 text-xs font-inter text-center"
                      placeholder="R"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <Input
                      {...register(`${movement.fullPath}.leftFollowUp` as any)}
                      className="h-8 text-xs font-inter text-center"
                      placeholder="L"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <Input
                      {...register(`${movement.fullPath}.rightFollowUp` as any)}
                      className="h-8 text-xs font-inter text-center"
                      placeholder="R"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMuscleTestTable = (
    section: string,
    movements: Array<{ key: string; label: string; fullPath: string }>,
    assessmentDatePath: string,
    followUpDatePath: string,
  ) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-poppins font-semibold text-charcoal">{section}</h4>
          <div className="flex gap-4 text-xs font-inter text-muted-foreground">
            <div className="flex gap-2">
              <span>Assessment Date:</span>
              <Input
                type="date"
                {...register(assessmentDatePath as any)}
                className="h-7 w-32 text-xs font-inter"
              />
            </div>
            <div className="flex gap-2">
              <span>Follow Up Date:</span>
              <Input
                type="date"
                {...register(followUpDatePath as any)}
                className="h-7 w-32 text-xs font-inter"
              />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg mb-3">
          <p className="font-inter text-xs font-medium text-blue-900">
            QUOTATION FOR MUSCLE TESTING according to Manual Muscle Testing Oxford Scale:
          </p>
          <ul className="font-inter text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
            <li>0 - No contraction present</li>
            <li>1 - Contraction visible without movement</li>
            <li>2 - Movement possible without gravity or incomplete against gravity</li>
            <li>3 - Movement possible against gravity into the fullest available range</li>
            <li>4 - Movement possible against gravity and an added moderate resistance</li>
            <li>5 - Muscle functions normally</li>
          </ul>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                  Muscle Group
                </th>
                <th
                  className="border border-gray-300 p-2 text-center font-inter font-medium"
                  colSpan={2}
                >
                  DATE Assessment
                </th>
                <th
                  className="border border-gray-300 p-2 text-center font-inter font-medium"
                  colSpan={2}
                >
                  DATE Follow up
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2 text-center font-inter text-xs">L</th>
                <th className="border border-gray-300 p-2 text-center font-inter text-xs">R</th>
                <th className="border border-gray-300 p-2 text-center font-inter text-xs">L</th>
                <th className="border border-gray-300 p-2 text-center font-inter text-xs">R</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.key}>
                  <td className="border border-gray-300 p-2 font-inter text-sm">
                    {movement.label}
                  </td>
                  <td className="border border-gray-300 p-1">
                    <Input
                      {...register(`${movement.fullPath}.leftAssessment` as any)}
                      type="number"
                      min="0"
                      max="5"
                      className="h-8 text-xs font-inter text-center"
                      placeholder="0-5"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <Input
                      {...register(`${movement.fullPath}.rightAssessment` as any)}
                      type="number"
                      min="0"
                      max="5"
                      className="h-8 text-xs font-inter text-center"
                      placeholder="0-5"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <Input
                      {...register(`${movement.fullPath}.leftFollowUp` as any)}
                      type="number"
                      min="0"
                      max="5"
                      className="h-8 text-xs font-inter text-center"
                      placeholder="0-5"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <Input
                      {...register(`${movement.fullPath}.rightFollowUp` as any)}
                      type="number"
                      min="0"
                      max="5"
                      className="h-8 text-xs font-inter text-center"
                      placeholder="0-5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins text-xl font-semibold text-charcoal">
            ROM Assessment Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="physical" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="physical" className="font-inter text-xs">
                Physical Exam
              </TabsTrigger>
              <TabsTrigger value="rom" className="font-inter text-xs">
                Range of Motion
              </TabsTrigger>
              <TabsTrigger value="muscle" className="font-inter text-xs">
                Muscle Test
              </TabsTrigger>
              <TabsTrigger value="functional" className="font-inter text-xs">
                Functional
              </TabsTrigger>
              <TabsTrigger value="conclusion" className="font-inter text-xs">
                Conclusion
              </TabsTrigger>
            </TabsList>

            {/* Physical Examination Tab */}
            <TabsContent value="physical" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">
                Physical Examination
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="physicalExaminationNotes"
                  className="font-inter text-sm font-medium"
                >
                  Mark on the body-chart deformities or joint anomalies, back deformities or
                  anomalies, edema, shoulder subluxation etc.
                </Label>
                <Textarea
                  id="physicalExaminationNotes"
                  {...register('physicalExaminationNotes')}
                  placeholder="Enter physical examination notes and mark body diagrams..."
                  className="min-h-[120px] font-open-sans"
                />
              </div>

              <Separator />

              {/* Skin & Soft Tissues */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">
                  Skin & Soft Tissues Problems
                </Label>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                          DISORDERS
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Minor
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Important
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        'swelling',
                        'callus',
                        'scar',
                        'wound',
                        'temperature',
                        'infection',
                        'pain',
                        'abnormalSensation',
                      ].map((item) => (
                        <tr key={item}>
                          <td className="border border-gray-300 p-2 font-inter text-sm capitalize">
                            {item.replace(/([A-Z])/g, ' $1')}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Checkbox
                              id={`${item}-minor`}
                              checked={
                                (skinSoftTissues?.[item as keyof typeof skinSoftTissues]
                                  ?.minor as boolean) || false
                              }
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  `skinSoftTissues.${item}.minor`,
                                  checked as boolean,
                                )
                              }
                            />
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Checkbox
                              id={`${item}-important`}
                              checked={
                                (skinSoftTissues?.[item as keyof typeof skinSoftTissues]
                                  ?.important as boolean) || false
                              }
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  `skinSoftTissues.${item}.important`,
                                  checked as boolean,
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Sensation */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">Sensation</Label>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                          Sensitivity
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          R
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          L
                        </th>
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                          (Specification)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {['superficial', 'deep', 'numbness', 'paresthesia', 'other'].map((sens) => (
                        <tr key={sens}>
                          <td className="border border-gray-300 p-2 font-inter text-sm capitalize">
                            {sens.replace(/([A-Z])/g, ' $1')}
                          </td>
                          <td className="border border-gray-300 p-1">
                            <Input
                              {...register(`sensation.${sens}.right` as any)}
                              className="h-8 text-xs font-inter text-center"
                              placeholder="R"
                            />
                          </td>
                          <td className="border border-gray-300 p-1">
                            <Input
                              {...register(`sensation.${sens}.left` as any)}
                              className="h-8 text-xs font-inter text-center"
                              placeholder="L"
                            />
                          </td>
                          <td className="border border-gray-300 p-1">
                            <Input
                              {...register(`sensation.${sens}.specification` as any)}
                              className="h-8 text-xs font-inter"
                              placeholder="Specification"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Reflexes */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">Reflexes</Label>
                <p className="font-inter text-xs text-muted-foreground">
                  + Hyper reflex; - Hypo reflex
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium"></th>
                        <th
                          className="border border-gray-300 p-2 text-center font-inter font-medium"
                          colSpan={3}
                        >
                          R
                        </th>
                        <th
                          className="border border-gray-300 p-2 text-center font-inter font-medium"
                          colSpan={3}
                        >
                          L
                        </th>
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                          Comments
                        </th>
                      </tr>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2"></th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          +
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          -
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          normal
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          +
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          -
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          normal
                        </th>
                        <th className="border border-gray-300 p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {['btr', 'ttr', 'ktr', 'atr', 'babinsky'].map((reflex) => (
                        <tr key={reflex}>
                          <td className="border border-gray-300 p-2 font-inter text-sm uppercase">
                            {reflex}
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            <RadioGroup
                              value={watch(`reflexes.${reflex}.right` as any) || ''}
                              onValueChange={(value) =>
                                setValue(`reflexes.${reflex}.right` as any, value)
                              }
                            >
                              <RadioGroupItem value="+" id={`${reflex}-r-plus`} />
                            </RadioGroup>
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            <RadioGroup
                              value={watch(`reflexes.${reflex}.right` as any) || ''}
                              onValueChange={(value) =>
                                setValue(`reflexes.${reflex}.right` as any, value)
                              }
                            >
                              <RadioGroupItem value="-" id={`${reflex}-r-minus`} />
                            </RadioGroup>
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            <RadioGroup
                              value={watch(`reflexes.${reflex}.right` as any) || ''}
                              onValueChange={(value) =>
                                setValue(`reflexes.${reflex}.right` as any, value)
                              }
                            >
                              <RadioGroupItem value="normal" id={`${reflex}-r-normal`} />
                            </RadioGroup>
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            <RadioGroup
                              value={watch(`reflexes.${reflex}.left` as any) || ''}
                              onValueChange={(value) =>
                                setValue(`reflexes.${reflex}.left` as any, value)
                              }
                            >
                              <RadioGroupItem value="+" id={`${reflex}-l-plus`} />
                            </RadioGroup>
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            <RadioGroup
                              value={watch(`reflexes.${reflex}.left` as any) || ''}
                              onValueChange={(value) =>
                                setValue(`reflexes.${reflex}.left` as any, value)
                              }
                            >
                              <RadioGroupItem value="-" id={`${reflex}-l-minus`} />
                            </RadioGroup>
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            <RadioGroup
                              value={watch(`reflexes.${reflex}.left` as any) || ''}
                              onValueChange={(value) =>
                                setValue(`reflexes.${reflex}.left` as any, value)
                              }
                            >
                              <RadioGroupItem value="normal" id={`${reflex}-l-normal`} />
                            </RadioGroup>
                          </td>
                          <td className="border border-gray-300 p-1">
                            <Input
                              {...register(`reflexes.${reflex}.comments` as any)}
                              className="h-8 text-xs font-inter"
                              placeholder="Comments"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Range of Motion Tab */}
            <TabsContent value="rom" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">Range Of Motion</h3>
              <p className="font-inter text-xs text-muted-foreground mb-4">
                - Passive ROM should be recorded during first assessment and before discharging the
                patients
              </p>

              {/* Lower Limb ROM */}
              <div className="space-y-6">
                {renderROMTable(
                  'LOWER LIMB - HIP',
                  [
                    {
                      key: 'flexion',
                      label: 'Flexion',
                      normalValue: '120',
                      fullPath: 'lowerLimbROM.hip.flexion',
                    },
                    {
                      key: 'extension',
                      label: 'Extension',
                      normalValue: '30',
                      fullPath: 'lowerLimbROM.hip.extension',
                    },
                    {
                      key: 'abduction',
                      label: 'Abduction',
                      normalValue: '45',
                      fullPath: 'lowerLimbROM.hip.abduction',
                    },
                    {
                      key: 'adduction',
                      label: 'Adduction',
                      normalValue: '30',
                      fullPath: 'lowerLimbROM.hip.adduction',
                    },
                    {
                      key: 'medialRotation',
                      label: 'Medial Rotation',
                      normalValue: '30',
                      fullPath: 'lowerLimbROM.hip.medialRotation',
                    },
                    {
                      key: 'lateralRotation',
                      label: 'Lateral Rotation',
                      normalValue: '60',
                      fullPath: 'lowerLimbROM.hip.lateralRotation',
                    },
                  ],
                  'lowerLimbROM.assessmentDate',
                  'lowerLimbROM.followUpDate',
                )}
                {renderROMTable(
                  'LOWER LIMB - KNEE',
                  [
                    {
                      key: 'flexion',
                      label: 'Flexion',
                      normalValue: '135',
                      fullPath: 'lowerLimbROM.knee.flexion',
                    },
                    {
                      key: 'extension',
                      label: 'Extension',
                      normalValue: '0',
                      fullPath: 'lowerLimbROM.knee.extension',
                    },
                  ],
                  'lowerLimbROM.assessmentDate',
                  'lowerLimbROM.followUpDate',
                )}
                {renderROMTable(
                  'LOWER LIMB - ANKLE-FOOT',
                  [
                    {
                      key: 'dorsiFlexion',
                      label: 'Dorsi Flexion',
                      normalValue: '30',
                      fullPath: 'lowerLimbROM.ankleFoot.dorsiFlexion',
                    },
                    {
                      key: 'plantarFlexion',
                      label: 'Plantar Flexion',
                      normalValue: '45',
                      fullPath: 'lowerLimbROM.ankleFoot.plantarFlexion',
                    },
                    {
                      key: 'inversion',
                      label: 'Inversion',
                      normalValue: '35',
                      fullPath: 'lowerLimbROM.ankleFoot.inversion',
                    },
                    {
                      key: 'eversion',
                      label: 'Eversion',
                      normalValue: '15',
                      fullPath: 'lowerLimbROM.ankleFoot.eversion',
                    },
                  ],
                  'lowerLimbROM.assessmentDate',
                  'lowerLimbROM.followUpDate',
                )}
              </div>

              <Separator />

              {/* Neck ROM */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">NECK</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'flexion', label: 'Flexion (cm)' },
                    { key: 'extension', label: 'Extension (cm)' },
                    { key: 'lateroFlexionRight', label: 'Latero-Flexion R (cm)' },
                    { key: 'lateroFlexionLeft', label: 'Latero-Flexion L (cm)' },
                    { key: 'rotationRight', label: 'Rotation R (cm)' },
                    { key: 'rotationLeft', label: 'Rotation L (cm)' },
                  ].map((movement) => (
                    <div key={movement.key} className="space-y-2">
                      <Label className="font-inter text-sm font-medium">{movement.label}</Label>
                      <Input
                        {...register(`neckROM.${movement.key}` as any)}
                        placeholder="cm"
                        className="font-inter"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Trunk ROM */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">TRUNK</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'globalFlexion', label: 'Global Flexion (cm)' },
                    { key: 'thoracicFlexion', label: 'Thoracic Flexion (Ott Test) (cm)' },
                    { key: 'lumbarFlexion', label: 'Lumbar Flexion (Schober test) (cm)' },
                    { key: 'globalExtension', label: 'Global Extension (cm)' },
                    { key: 'lateroFlexionRight', label: 'Latero-Flexion R (cm)' },
                    { key: 'lateroFlexionLeft', label: 'Latero-Flexion L (cm)' },
                    { key: 'rotationRight', label: 'Rotation R (write OK or imp.)' },
                    { key: 'rotationLeft', label: 'Rotation L (write OK or imp.)' },
                  ].map((movement) => (
                    <div key={movement.key} className="space-y-2">
                      <Label className="font-inter text-sm font-medium">{movement.label}</Label>
                      <Input
                        {...register(`trunkROM.${movement.key}` as any)}
                        placeholder={movement.key.includes('rotation') ? 'OK or imp.' : 'cm'}
                        className="font-inter"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Upper Limb ROM */}
              <div className="space-y-6">
                {renderROMTable(
                  'UPPER LIMB - SHOULDER',
                  [
                    {
                      key: 'flexion',
                      label: 'Flexion',
                      normalValue: '180',
                      fullPath: 'upperLimbROM.shoulder.flexion',
                    },
                    {
                      key: 'extension',
                      label: 'Extension',
                      normalValue: '60',
                      fullPath: 'upperLimbROM.shoulder.extension',
                    },
                    {
                      key: 'abduction',
                      label: 'Abduction',
                      normalValue: '180',
                      fullPath: 'upperLimbROM.shoulder.abduction',
                    },
                    {
                      key: 'adduction',
                      label: 'Adduction',
                      normalValue: '30',
                      fullPath: 'upperLimbROM.shoulder.adduction',
                    },
                    {
                      key: 'medialRotation',
                      label: 'Medial Rotation',
                      normalValue: '95',
                      fullPath: 'upperLimbROM.shoulder.medialRotation',
                    },
                    {
                      key: 'lateralRotation',
                      label: 'Lateral Rotation',
                      normalValue: '80',
                      fullPath: 'upperLimbROM.shoulder.lateralRotation',
                    },
                  ],
                  'upperLimbROM.assessmentDate',
                  'upperLimbROM.followUpDate',
                )}
                {renderROMTable(
                  'UPPER LIMB - ELBOW',
                  [
                    {
                      key: 'flexion',
                      label: 'Flexion',
                      normalValue: '150',
                      fullPath: 'upperLimbROM.elbow.flexion',
                    },
                    {
                      key: 'extension',
                      label: 'Extension',
                      normalValue: '0',
                      fullPath: 'upperLimbROM.elbow.extension',
                    },
                  ],
                  'upperLimbROM.assessmentDate',
                  'upperLimbROM.followUpDate',
                )}
                {renderROMTable(
                  'UPPER LIMB - FOREARM',
                  [
                    {
                      key: 'pronation',
                      label: 'Pronation',
                      normalValue: '80',
                      fullPath: 'upperLimbROM.forearm.pronation',
                    },
                    {
                      key: 'supination',
                      label: 'Supination',
                      normalValue: '80',
                      fullPath: 'upperLimbROM.forearm.supination',
                    },
                  ],
                  'upperLimbROM.assessmentDate',
                  'upperLimbROM.followUpDate',
                )}
                {renderROMTable(
                  'UPPER LIMB - WRIST',
                  [
                    {
                      key: 'flexion',
                      label: 'Flexion',
                      normalValue: '80',
                      fullPath: 'upperLimbROM.wrist.flexion',
                    },
                    {
                      key: 'extension',
                      label: 'Extension',
                      normalValue: '80',
                      fullPath: 'upperLimbROM.wrist.extension',
                    },
                    {
                      key: 'abduction',
                      label: 'Abduction',
                      normalValue: '20',
                      fullPath: 'upperLimbROM.wrist.abduction',
                    },
                    {
                      key: 'adduction',
                      label: 'Adduction',
                      normalValue: '35',
                      fullPath: 'upperLimbROM.wrist.adduction',
                    },
                  ],
                  'upperLimbROM.assessmentDate',
                  'upperLimbROM.followUpDate',
                )}
                {renderROMTable(
                  'UPPER LIMB - FINGERS',
                  [
                    {
                      key: 'thumbOpposition',
                      label: 'Thumb opposition',
                      fullPath: 'upperLimbROM.fingers.thumbOpposition',
                    },
                    {
                      key: 'mpFlexion',
                      label: 'MP Flexion',
                      normalValue: '90',
                      fullPath: 'upperLimbROM.fingers.mpFlexion',
                    },
                    {
                      key: 'mpExtension',
                      label: 'MP Extension',
                      normalValue: '40',
                      fullPath: 'upperLimbROM.fingers.mpExtension',
                    },
                    {
                      key: 'ipFlexion',
                      label: 'IP Flexion',
                      normalValue: '120',
                      fullPath: 'upperLimbROM.fingers.ipFlexion',
                    },
                  ],
                  'upperLimbROM.assessmentDate',
                  'upperLimbROM.followUpDate',
                )}
              </div>
            </TabsContent>

            {/* Muscle Test Tab */}
            <TabsContent value="muscle" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">Muscle Test</h3>
              <p className="font-inter text-xs text-muted-foreground mb-4">
                - Muscle test should be recorded during first assessment and before discharging the
                patient
              </p>

              {/* Lower Limb Muscle Test */}
              <div className="space-y-6">
                {renderMuscleTestTable(
                  'LOWER LIMB - HIP',
                  [
                    {
                      key: 'flexors',
                      label: 'Flexors',
                      fullPath: 'lowerLimbMuscleTest.hip.flexors',
                    },
                    {
                      key: 'extensors',
                      label: 'Extensors',
                      fullPath: 'lowerLimbMuscleTest.hip.extensors',
                    },
                    {
                      key: 'abductors',
                      label: 'Abductors',
                      fullPath: 'lowerLimbMuscleTest.hip.abductors',
                    },
                    {
                      key: 'adductors',
                      label: 'Adductors',
                      fullPath: 'lowerLimbMuscleTest.hip.adductors',
                    },
                    {
                      key: 'lateralRot',
                      label: 'Lateral Rot.',
                      fullPath: 'lowerLimbMuscleTest.hip.lateralRot',
                    },
                    {
                      key: 'medialRot',
                      label: 'Medial Rot.',
                      fullPath: 'lowerLimbMuscleTest.hip.medialRot',
                    },
                  ],
                  'lowerLimbMuscleTest.assessmentDate',
                  'lowerLimbMuscleTest.followUpDate',
                )}
                {renderMuscleTestTable(
                  'LOWER LIMB - KNEE',
                  [
                    {
                      key: 'flexors',
                      label: 'Flexors',
                      fullPath: 'lowerLimbMuscleTest.knee.flexors',
                    },
                    {
                      key: 'extensors',
                      label: 'Extensors',
                      fullPath: 'lowerLimbMuscleTest.knee.extensors',
                    },
                  ],
                  'lowerLimbMuscleTest.assessmentDate',
                  'lowerLimbMuscleTest.followUpDate',
                )}
                {renderMuscleTestTable(
                  'LOWER LIMB - ANKLE',
                  [
                    {
                      key: 'dorsiFlexors',
                      label: 'Dorsi Flexors',
                      fullPath: 'lowerLimbMuscleTest.ankle.dorsiFlexors',
                    },
                    {
                      key: 'plantarFlexors',
                      label: 'Plantar Flexors',
                      fullPath: 'lowerLimbMuscleTest.ankle.plantarFlexors',
                    },
                    {
                      key: 'invertors',
                      label: 'Invertors',
                      fullPath: 'lowerLimbMuscleTest.ankle.invertors',
                    },
                    {
                      key: 'evertors',
                      label: 'Evertors',
                      fullPath: 'lowerLimbMuscleTest.ankle.evertors',
                    },
                  ],
                  'lowerLimbMuscleTest.assessmentDate',
                  'lowerLimbMuscleTest.followUpDate',
                )}
                {renderMuscleTestTable(
                  'LOWER LIMB - FOOT',
                  [
                    {
                      key: 'flexors',
                      label: 'Flexors',
                      fullPath: 'lowerLimbMuscleTest.foot.flexors',
                    },
                    {
                      key: 'extensors',
                      label: 'Extensors',
                      fullPath: 'lowerLimbMuscleTest.foot.extensors',
                    },
                  ],
                  'lowerLimbMuscleTest.assessmentDate',
                  'lowerLimbMuscleTest.followUpDate',
                )}
                {renderMuscleTestTable(
                  'LOWER LIMB - TRUNK',
                  [
                    {
                      key: 'flexors',
                      label: 'Flexors',
                      fullPath: 'lowerLimbMuscleTest.trunk.flexors',
                    },
                    {
                      key: 'extensor',
                      label: 'Extensor',
                      fullPath: 'lowerLimbMuscleTest.trunk.extensor',
                    },
                    {
                      key: 'rightBending',
                      label: 'R. Bending',
                      fullPath: 'lowerLimbMuscleTest.trunk.rightBending',
                    },
                    {
                      key: 'leftBending',
                      label: 'L. Bending',
                      fullPath: 'lowerLimbMuscleTest.trunk.leftBending',
                    },
                    {
                      key: 'rightRotation',
                      label: 'R. Rotation',
                      fullPath: 'lowerLimbMuscleTest.trunk.rightRotation',
                    },
                    {
                      key: 'leftRotation',
                      label: 'L. Rotation',
                      fullPath: 'lowerLimbMuscleTest.trunk.leftRotation',
                    },
                  ],
                  'lowerLimbMuscleTest.assessmentDate',
                  'lowerLimbMuscleTest.followUpDate',
                )}
              </div>

              <Separator />

              {/* Upper Limb Muscle Test */}
              <div className="space-y-6">
                {renderMuscleTestTable(
                  'UPPER LIMB - SHOULDER',
                  [
                    {
                      key: 'flexors',
                      label: 'Flexors',
                      fullPath: 'upperLimbMuscleTest.shoulder.flexors',
                    },
                    {
                      key: 'extensors',
                      label: 'Extensors',
                      fullPath: 'upperLimbMuscleTest.shoulder.extensors',
                    },
                    {
                      key: 'abductors',
                      label: 'Abductors',
                      fullPath: 'upperLimbMuscleTest.shoulder.abductors',
                    },
                    {
                      key: 'adductors',
                      label: 'Adductors',
                      fullPath: 'upperLimbMuscleTest.shoulder.adductors',
                    },
                    {
                      key: 'lateralRot',
                      label: 'Lateral Rot.',
                      fullPath: 'upperLimbMuscleTest.shoulder.lateralRot',
                    },
                    {
                      key: 'medialRot',
                      label: 'Medial Rot.',
                      fullPath: 'upperLimbMuscleTest.shoulder.medialRot',
                    },
                    {
                      key: 'elevators',
                      label: 'Elevators',
                      fullPath: 'upperLimbMuscleTest.shoulder.elevators',
                    },
                    {
                      key: 'depressors',
                      label: 'Depressors',
                      fullPath: 'upperLimbMuscleTest.shoulder.depressors',
                    },
                    {
                      key: 'antepulsors',
                      label: 'Antepulsors',
                      fullPath: 'upperLimbMuscleTest.shoulder.antepulsors',
                    },
                    {
                      key: 'retropulsors',
                      label: 'Retropulsors',
                      fullPath: 'upperLimbMuscleTest.shoulder.retropulsors',
                    },
                  ],
                  'upperLimbMuscleTest.assessmentDate',
                  'upperLimbMuscleTest.followUpDate',
                )}
                {renderMuscleTestTable(
                  'UPPER LIMB - ELBOW',
                  [
                    {
                      key: 'flexors',
                      label: 'Flexors',
                      fullPath: 'upperLimbMuscleTest.elbow.flexors',
                    },
                    {
                      key: 'extensors',
                      label: 'Extensors',
                      fullPath: 'upperLimbMuscleTest.elbow.extensors',
                    },
                  ],
                  'upperLimbMuscleTest.assessmentDate',
                  'upperLimbMuscleTest.followUpDate',
                )}
                {renderMuscleTestTable(
                  'UPPER LIMB - FOREARM',
                  [
                    {
                      key: 'supinators',
                      label: 'Supinators',
                      fullPath: 'upperLimbMuscleTest.forearm.supinators',
                    },
                    {
                      key: 'pronators',
                      label: 'Pronators',
                      fullPath: 'upperLimbMuscleTest.forearm.pronators',
                    },
                  ],
                  'upperLimbMuscleTest.assessmentDate',
                  'upperLimbMuscleTest.followUpDate',
                )}
                {renderMuscleTestTable(
                  'UPPER LIMB - WRIST',
                  [
                    {
                      key: 'flexors',
                      label: 'Flexors',
                      fullPath: 'upperLimbMuscleTest.wrist.flexors',
                    },
                    {
                      key: 'extensors',
                      label: 'Extensors',
                      fullPath: 'upperLimbMuscleTest.wrist.extensors',
                    },
                  ],
                  'upperLimbMuscleTest.assessmentDate',
                  'upperLimbMuscleTest.followUpDate',
                )}
                {renderMuscleTestTable(
                  'UPPER LIMB - FINGERS',
                  [
                    {
                      key: 'flexors',
                      label: 'Flexors',
                      fullPath: 'upperLimbMuscleTest.fingers.flexors',
                    },
                    {
                      key: 'extensors',
                      label: 'Extensors',
                      fullPath: 'upperLimbMuscleTest.fingers.extensors',
                    },
                    {
                      key: 'abductors',
                      label: 'Abductors',
                      fullPath: 'upperLimbMuscleTest.fingers.abductors',
                    },
                    {
                      key: 'opposition',
                      label: 'Opposition',
                      fullPath: 'upperLimbMuscleTest.fingers.opposition',
                    },
                  ],
                  'upperLimbMuscleTest.assessmentDate',
                  'upperLimbMuscleTest.followUpDate',
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mt-4">
                <Label className="font-inter text-xs font-medium text-blue-900">
                  Write B1 in case of hypotone (flaccidity)
                </Label>
                <Textarea
                  {...register('conclusion.bodyStructureImpairments.muscleStatus' as any)}
                  placeholder="Enter notes about hypotone/flaccidity..."
                  className="mt-2 min-h-[60px] font-open-sans text-sm"
                />
              </div>
            </TabsContent>

            {/* Functional Evaluation Tab */}
            <TabsContent value="functional" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">
                Functional Evaluation
              </h3>

              {/* Balance Disorders */}
              <div className="space-y-4">
                <Label className="font-inter text-sm font-medium">Balance disorders</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Sitting</Label>
                    <RadioGroup
                      value={watch('functionalEvaluation.balance.sitting') || ''}
                      onValueChange={(value) =>
                        setValue('functionalEvaluation.balance.sitting', value as any)
                      }
                    >
                      <div className="space-y-2">
                        {['normal', 'good', 'poor', 'notPossible'].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`balance-sitting-${option}`} />
                            <Label
                              htmlFor={`balance-sitting-${option}`}
                              className="font-inter text-sm font-normal cursor-pointer capitalize"
                            >
                              {option === 'notPossible' ? 'Not possible' : option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Standing</Label>
                    <RadioGroup
                      value={watch('functionalEvaluation.balance.standing') || ''}
                      onValueChange={(value) =>
                        setValue('functionalEvaluation.balance.standing', value as any)
                      }
                    >
                      <div className="space-y-2">
                        {['normal', 'good', 'poor', 'notPossible'].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`balance-standing-${option}`} />
                            <Label
                              htmlFor={`balance-standing-${option}`}
                              className="font-inter text-sm font-normal cursor-pointer capitalize"
                            >
                              {option === 'notPossible' ? 'Not possible' : option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Coordination */}
              <div className="space-y-4">
                <Label className="font-inter text-sm font-medium">Coordination</Label>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                          UPPER LIMBS
                        </th>
                        <th
                          className="border border-gray-300 p-2 text-center font-inter font-medium"
                          colSpan={2}
                        >
                          Good
                        </th>
                        <th
                          className="border border-gray-300 p-2 text-center font-inter font-medium"
                          colSpan={2}
                        >
                          Poor
                        </th>
                        <th
                          className="border border-gray-300 p-2 text-center font-inter font-medium"
                          colSpan={2}
                        >
                          Not possible
                        </th>
                      </tr>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2"></th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          L
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          R
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          L
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          R
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          L
                        </th>
                        <th className="border border-gray-300 p-1 text-center font-inter text-xs">
                          R
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2 font-inter text-sm">
                          UPPER LIMBS
                        </td>
                        {['good', 'poor', 'notPossible'].map((quality) =>
                          ['left', 'right'].map((side) => (
                            <td
                              key={`upper-${quality}-${side}`}
                              className="border border-gray-300 p-1 text-center"
                            >
                              <RadioGroup
                                value={
                                  watch(
                                    `functionalEvaluation.coordination.upperLimbs.${side}` as any,
                                  ) || ''
                                }
                                onValueChange={(value) =>
                                  setValue(
                                    `functionalEvaluation.coordination.upperLimbs.${side}` as any,
                                    value,
                                  )
                                }
                              >
                                <RadioGroupItem value={quality} id={`upper-${quality}-${side}`} />
                              </RadioGroup>
                            </td>
                          )),
                        )}
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-inter text-sm">
                          LOWER LIMBS
                        </td>
                        {['good', 'poor', 'notPossible'].map((quality) =>
                          ['left', 'right'].map((side) => (
                            <td
                              key={`lower-${quality}-${side}`}
                              className="border border-gray-300 p-1 text-center"
                            >
                              <RadioGroup
                                value={
                                  watch(
                                    `functionalEvaluation.coordination.lowerLimbs.${side}` as any,
                                  ) || ''
                                }
                                onValueChange={(value) =>
                                  setValue(
                                    `functionalEvaluation.coordination.lowerLimbs.${side}` as any,
                                    value,
                                  )
                                }
                              >
                                <RadioGroupItem value={quality} id={`lower-${quality}-${side}`} />
                              </RadioGroup>
                            </td>
                          )),
                        )}
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-inter text-sm" colSpan={7}>
                          <Label className="font-inter text-sm font-medium">Comments:</Label>
                          <Textarea
                            {...register('functionalEvaluation.coordination.comments' as any)}
                            className="mt-2 min-h-[60px] font-open-sans text-sm"
                            placeholder="Enter coordination comments..."
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Gait Analysis */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">Gait Analysis</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">FRONTAL PLANE</Label>
                    <Label className="font-inter text-xs text-muted-foreground">
                      Observations:
                    </Label>
                    <Textarea
                      {...register('functionalEvaluation.gaitAnalysis.frontalPlane' as any)}
                      placeholder="Enter frontal plane observations..."
                      className="min-h-[100px] font-open-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">SAGITTAL PLANE</Label>
                    <Label className="font-inter text-xs text-muted-foreground">
                      Observations:
                    </Label>
                    <Textarea
                      {...register('functionalEvaluation.gaitAnalysis.sagittalPlane' as any)}
                      placeholder="Enter sagittal plane observations..."
                      className="min-h-[100px] font-open-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">
                      Functional Quality of the gait
                    </Label>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-2 text-left font-inter font-medium"></th>
                            <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                              Normal
                            </th>
                            <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                              Good
                            </th>
                            <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                              Poor
                            </th>
                            <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                              Comments:
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'safety', label: '1. SAFETY' },
                            { key: 'cadence', label: '2. CADENCE' },
                            { key: 'speed', label: '3. SPEED' },
                            { key: 'fatigue', label: '4. FATIGUE' },
                          ].map((item) => (
                            <tr key={item.key}>
                              <td className="border border-gray-300 p-2 font-inter text-sm">
                                {item.label}
                              </td>
                              {['normal', 'good', 'poor'].map((quality) => (
                                <td
                                  key={quality}
                                  className="border border-gray-300 p-1 text-center"
                                >
                                  <RadioGroup
                                    value={
                                      watch(
                                        `functionalEvaluation.gaitAnalysis.${item.key}` as any,
                                      ) || ''
                                    }
                                    onValueChange={(value) =>
                                      setValue(
                                        `functionalEvaluation.gaitAnalysis.${item.key}` as any,
                                        value,
                                      )
                                    }
                                  >
                                    <RadioGroupItem
                                      value={quality}
                                      id={`gait-${item.key}-${quality}`}
                                    />
                                  </RadioGroup>
                                </td>
                              ))}
                              <td className="border border-gray-300 p-1">
                                <Input
                                  {...register(
                                    `functionalEvaluation.gaitAnalysis.${item.key}Comments` as any,
                                  )}
                                  className="h-8 text-xs font-inter"
                                  placeholder="Comments"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Other Remarks:</Label>
                    <Textarea
                      {...register('functionalEvaluation.gaitAnalysis.otherRemarks' as any)}
                      placeholder="Enter other remarks..."
                      className="min-h-[80px] font-open-sans"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Activity Limitations & Participation Restrictions */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">
                  Activity Limitations & Participation Restrictions
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium">
                          ACTIVITIES / PARTICIPATIONS
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Independent
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Assisted
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Impossible
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* MOBILITY */}
                      <tr>
                        <td
                          className="border border-gray-300 p-2 font-inter font-semibold bg-gray-50"
                          colSpan={4}
                        >
                          MOBILITY
                        </td>
                      </tr>
                      {[
                        { key: 'crawling', label: 'Crawling' },
                        { key: 'crouchingGait', label: 'Crouching gait' },
                        { key: 'walking', label: 'Walking' },
                        { key: 'squatting', label: 'Squatting' },
                        { key: 'stairs', label: 'Stairs' },
                        { key: 'running', label: 'Running' },
                      ].map((activity) => (
                        <tr key={activity.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm pl-6">
                            {activity.label}
                          </td>
                          {['independent', 'assisted', 'impossible'].map((level) => (
                            <td key={level} className="border border-gray-300 p-1 text-center">
                              <RadioGroup
                                value={
                                  watch(`activityLimitations.mobility.${activity.key}` as any) || ''
                                }
                                onValueChange={(value) =>
                                  setValue(
                                    `activityLimitations.mobility.${activity.key}` as any,
                                    value,
                                  )
                                }
                              >
                                <RadioGroupItem
                                  value={level}
                                  id={`mobility-${activity.key}-${level}`}
                                />
                              </RadioGroup>
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* TRANSFERS */}
                      <tr>
                        <td
                          className="border border-gray-300 p-2 font-inter font-semibold bg-gray-50"
                          colSpan={4}
                        >
                          TRANSFERS
                        </td>
                      </tr>
                      {[
                        { key: 'lieToSit', label: 'Lie to Sit (& opposite)' },
                        { key: 'sitToStand', label: 'Sit to Stand (& opposite)' },
                        { key: 'standToFloor', label: 'Stand to Floor (& opposite)' },
                        { key: 'sitToSit', label: 'Sit to sit' },
                      ].map((activity) => (
                        <tr key={activity.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm pl-6">
                            {activity.label}
                          </td>
                          {['independent', 'assisted', 'impossible'].map((level) => (
                            <td key={level} className="border border-gray-300 p-1 text-center">
                              <RadioGroup
                                value={
                                  watch(`activityLimitations.transfers.${activity.key}` as any) ||
                                  ''
                                }
                                onValueChange={(value) =>
                                  setValue(
                                    `activityLimitations.transfers.${activity.key}` as any,
                                    value,
                                  )
                                }
                              >
                                <RadioGroupItem
                                  value={level}
                                  id={`transfers-${activity.key}-${level}`}
                                />
                              </RadioGroup>
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* BALANCE */}
                      <tr>
                        <td
                          className="border border-gray-300 p-2 font-inter font-semibold bg-gray-50"
                          colSpan={4}
                        >
                          BALANCE
                        </td>
                      </tr>
                      {[
                        { key: 'sitting', label: 'Sitting' },
                        { key: 'standing', label: 'Standing' },
                        { key: 'onOneLeg', label: 'On one leg' },
                      ].map((activity) => (
                        <tr key={activity.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm pl-6">
                            {activity.label}
                          </td>
                          {['independent', 'assisted', 'impossible'].map((level) => (
                            <td key={level} className="border border-gray-300 p-1 text-center">
                              <RadioGroup
                                value={
                                  watch(`activityLimitations.balance.${activity.key}` as any) || ''
                                }
                                onValueChange={(value) =>
                                  setValue(
                                    `activityLimitations.balance.${activity.key}` as any,
                                    value,
                                  )
                                }
                              >
                                <RadioGroupItem
                                  value={level}
                                  id={`balance-${activity.key}-${level}`}
                                />
                              </RadioGroup>
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* UPPER LIMB FUNCTIONS */}
                      <tr>
                        <td
                          className="border border-gray-300 p-2 font-inter font-semibold bg-gray-50"
                          colSpan={4}
                        >
                          UPPER LIMB FUNCTIONS
                        </td>
                      </tr>
                      {[
                        { key: 'grasp', label: 'Grasp' },
                        { key: 'release', label: 'Release' },
                        { key: 'fineManipulation', label: 'Fine Manipulation' },
                        { key: 'holding', label: 'Holding' },
                      ].map((function_) => (
                        <React.Fragment key={function_.key}>
                          <tr>
                            <td className="border border-gray-300 p-2 font-inter text-sm pl-6">
                              {function_.label} - R
                            </td>
                            {['independent', 'assisted', 'impossible'].map((level) => (
                              <td key={level} className="border border-gray-300 p-1 text-center">
                                <RadioGroup
                                  value={
                                    watch(
                                      `activityLimitations.upperLimbFunctions.${function_.key}.right` as any,
                                    ) || ''
                                  }
                                  onValueChange={(value) =>
                                    setValue(
                                      `activityLimitations.upperLimbFunctions.${function_.key}.right` as any,
                                      value,
                                    )
                                  }
                                >
                                  <RadioGroupItem
                                    value={level}
                                    id={`upper-${function_.key}-r-${level}`}
                                  />
                                </RadioGroup>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="border border-gray-300 p-2 font-inter text-sm pl-6">
                              {function_.label} - L
                            </td>
                            {['independent', 'assisted', 'impossible'].map((level) => (
                              <td key={level} className="border border-gray-300 p-1 text-center">
                                <RadioGroup
                                  value={
                                    watch(
                                      `activityLimitations.upperLimbFunctions.${function_.key}.left` as any,
                                    ) || ''
                                  }
                                  onValueChange={(value) =>
                                    setValue(
                                      `activityLimitations.upperLimbFunctions.${function_.key}.left` as any,
                                      value,
                                    )
                                  }
                                >
                                  <RadioGroupItem
                                    value={level}
                                    id={`upper-${function_.key}-l-${level}`}
                                  />
                                </RadioGroup>
                              </td>
                            ))}
                          </tr>
                        </React.Fragment>
                      ))}

                      {/* DAILY LIFE ACTIVITIES */}
                      <tr>
                        <td
                          className="border border-gray-300 p-2 font-inter font-semibold bg-gray-50"
                          colSpan={4}
                        >
                          DAILY LIFE ACTIVITIES
                        </td>
                      </tr>
                      {[
                        { key: 'dressingUpper', label: 'Dressing - Upper body' },
                        { key: 'dressingLower', label: 'Dressing - Lower body' },
                        { key: 'toileting', label: 'Toileting' },
                        { key: 'bathing', label: 'Bathing' },
                        { key: 'washing', label: 'Washing oneself' },
                        { key: 'eating', label: 'Eating' },
                        { key: 'drinking', label: 'Drinking' },
                      ].map((activity) => (
                        <tr key={activity.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm pl-6">
                            {activity.label}
                          </td>
                          {['independent', 'assisted', 'impossible'].map((level) => (
                            <td key={level} className="border border-gray-300 p-1 text-center">
                              <RadioGroup
                                value={
                                  watch(
                                    `activityLimitations.dailyLifeActivities.${activity.key}` as any,
                                  ) || ''
                                }
                                onValueChange={(value) =>
                                  setValue(
                                    `activityLimitations.dailyLifeActivities.${activity.key}` as any,
                                    value,
                                  )
                                }
                              >
                                <RadioGroupItem value={level} id={`dla-${activity.key}-${level}`} />
                              </RadioGroup>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Assisted Devices */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">ASSISTED DEVICES</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium"></th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Used
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Good
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Bad
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          FO
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          AFO
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          KAFO
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          HKAFO
                        </th>
                        <th className="border border-gray-300 p-2 text-center font-inter font-medium">
                          Shoe raise
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          key: 'withoutDevices',
                          label: 'Without assisted devices',
                          hasQuality: false,
                          hasType: false,
                        },
                        { key: 'oneCrutch', label: 'One crutch', hasQuality: true, hasType: false },
                        {
                          key: 'pairOfCrutches',
                          label: 'Pair of crutches',
                          hasQuality: true,
                          hasType: false,
                        },
                        {
                          key: 'walkingFrame',
                          label: 'Walking frame',
                          hasQuality: true,
                          hasType: false,
                        },
                        {
                          key: 'wheelchair',
                          label: 'Wheelchair',
                          hasQuality: true,
                          hasType: false,
                        },
                        {
                          key: 'orthosisRight',
                          label: 'Orthoses right side',
                          hasQuality: true,
                          hasType: true,
                        },
                        {
                          key: 'orthosisLeft',
                          label: 'Orthosis left side',
                          hasQuality: true,
                          hasType: true,
                        },
                      ].map((device) => (
                        <tr key={device.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm">
                            {device.label}
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            <Checkbox
                              id={`device-${device.key}`}
                              checked={
                                (
                                  assistedDevices?.[
                                    device.key as keyof typeof assistedDevices
                                  ] as any
                                )?.used ||
                                (device.key === 'withoutDevices' &&
                                  assistedDevices?.withoutDevices) ||
                                false
                              }
                              onCheckedChange={(checked) => {
                                if (device.key === 'withoutDevices') {
                                  handleCheckboxChange(
                                    'activityLimitations.assistedDevices.withoutDevices',
                                    checked as boolean,
                                  );
                                } else {
                                  setValue(
                                    `activityLimitations.assistedDevices.${device.key}.used` as any,
                                    checked as boolean,
                                  );
                                }
                              }}
                            />
                          </td>
                          {device.hasQuality && (
                            <>
                              <td className="border border-gray-300 p-1 text-center">
                                <RadioGroup
                                  value={
                                    watch(
                                      `activityLimitations.assistedDevices.${device.key}.quality` as any,
                                    ) || ''
                                  }
                                  onValueChange={(value) =>
                                    setValue(
                                      `activityLimitations.assistedDevices.${device.key}.quality` as any,
                                      value,
                                    )
                                  }
                                >
                                  <RadioGroupItem value="good" id={`${device.key}-good`} />
                                </RadioGroup>
                              </td>
                              <td className="border border-gray-300 p-1 text-center">
                                <RadioGroup
                                  value={
                                    watch(
                                      `activityLimitations.assistedDevices.${device.key}.quality` as any,
                                    ) || ''
                                  }
                                  onValueChange={(value) =>
                                    setValue(
                                      `activityLimitations.assistedDevices.${device.key}.quality` as any,
                                      value,
                                    )
                                  }
                                >
                                  <RadioGroupItem value="bad" id={`${device.key}-bad`} />
                                </RadioGroup>
                              </td>
                            </>
                          )}
                          {!device.hasQuality && (
                            <td className="border border-gray-300 p-1" colSpan={2}></td>
                          )}
                          {device.hasType && (
                            <>
                              {['FO', 'AFO', 'KAFO', 'HKAFO', 'shoeRaise'].map((type) => (
                                <td key={type} className="border border-gray-300 p-1 text-center">
                                  <RadioGroup
                                    value={
                                      watch(
                                        `activityLimitations.assistedDevices.${device.key}.type` as any,
                                      ) || ''
                                    }
                                    onValueChange={(value) =>
                                      setValue(
                                        `activityLimitations.assistedDevices.${device.key}.type` as any,
                                        value,
                                      )
                                    }
                                  >
                                    <RadioGroupItem value={type} id={`${device.key}-${type}`} />
                                  </RadioGroup>
                                </td>
                              ))}
                            </>
                          )}
                          {!device.hasType && (
                            <td className="border border-gray-300 p-1" colSpan={5}></td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Conclusion Tab */}
            <TabsContent value="conclusion" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">
                CONCLUSION OF PATIENT ASSESSMENT & MAIN FINDINGS
              </h3>

              {/* Environmental & Personal Factors */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">
                  ENVIRONMENTAL & PERSONAL FACTORS
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium w-1/3">
                          ENVIRONMENTAL & PERSONAL FACTORS
                        </th>
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'personalConditions', label: 'Personal conditions' },
                        { key: 'livingConditions', label: 'Living conditions' },
                        { key: 'medSocialStructures', label: 'Med & Social structures' },
                        { key: 'currentTreatment', label: 'Current treatment' },
                        { key: 'remarks', label: 'Remarks' },
                      ].map((item) => (
                        <tr key={item.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm">
                            {item.label}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Textarea
                              {...register(`conclusion.environmentalFactors.${item.key}` as any)}
                              className="min-h-[60px] font-open-sans text-sm"
                              placeholder={`Enter ${item.label.toLowerCase()}...`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Body Structure & Function Impairments */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">
                  BODY STRUCTURE & FUNCTION IMPAIRMENTS
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium w-1/3">
                          BODY STRUCTURE & FUNCTION IMPAIRMENTS
                        </th>
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'assTraumaDiseases', label: 'Ass. trauma & diseases' },
                        { key: 'romStatus', label: 'R.O.M status' },
                        { key: 'muscleStatus', label: 'Muscle status' },
                        { key: 'skinSoftTissuesPain', label: 'Skin & soft tissues/Pain' },
                        { key: 'cardioVascularStatus', label: 'Cardio vascular status' },
                      ].map((item) => (
                        <tr key={item.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm">
                            {item.label}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Textarea
                              {...register(
                                `conclusion.bodyStructureImpairments.${item.key}` as any,
                              )}
                              className="min-h-[60px] font-open-sans text-sm"
                              placeholder={`Enter ${item.label.toLowerCase()}...`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Activity Limitations & Participation Restriction */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">
                  ACTIVITY LIMITATIONS & PARTICIPATION RESTRICTION
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium w-1/3">
                          ACTIVITY LIMITATIONS & PARTICIPATION RESTRICTION
                        </th>
                        <th className="border border-gray-300 p-2 text-left font-inter font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'generalMobility', label: 'General Mobility (gait)' },
                        { key: 'transfers', label: 'Transfers' },
                        { key: 'balance', label: 'Balance' },
                        { key: 'upperLimbFunctions', label: 'Upper limb functions' },
                        { key: 'dailyLifeActivities', label: 'Daily life activities' },
                      ].map((item) => (
                        <tr key={item.key}>
                          <td className="border border-gray-300 p-2 font-inter text-sm">
                            {item.label}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Textarea
                              {...register(
                                `conclusion.activityLimitationsParticipation.${item.key}` as any,
                              )}
                              className="min-h-[60px] font-open-sans text-sm"
                              placeholder={`Enter ${item.label.toLowerCase()}...`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Referral */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-charcoal">REFERRAL</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="referredTo" className="font-inter text-sm font-medium">
                      Referred to
                    </Label>
                    <Input
                      id="referredTo"
                      {...register('conclusion.referral.referredTo' as any)}
                      placeholder="Enter referral recipient..."
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-inter text-sm font-medium">For</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'medicalCare', label: 'Medical care' },
                        { key: 'medication', label: 'Medication' },
                        { key: 'orthopaedicConsultation', label: 'Orthopaedic consultation' },
                        { key: 'orthopaedicSurgery', label: 'Orthopaedic surgery' },
                        { key: 'nursingCare', label: 'Nursing care' },
                        { key: 'removeCast', label: 'Remove cast' },
                        { key: 'stumpRevision', label: 'Stump revision' },
                        { key: 'tenotomy', label: 'Tenotomy' },
                        { key: 'other', label: 'Other (specify)' },
                      ].map((reason) => (
                        <div key={reason.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`referral-${reason.key}`}
                            checked={
                              (referralReasons?.[
                                reason.key as keyof typeof referralReasons
                              ] as boolean) || false
                            }
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                `conclusion.referral.referralReasons.${reason.key}`,
                                checked as boolean,
                              )
                            }
                          />
                          <Label
                            htmlFor={`referral-${reason.key}`}
                            className="font-inter text-sm font-normal cursor-pointer"
                          >
                            {reason.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {referralReasons?.other && (
                      <Input
                        {...register('conclusion.referral.referralReasons.otherText' as any)}
                        placeholder="Specify other referral reason..."
                        className="font-inter"
                      />
                    )}
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
