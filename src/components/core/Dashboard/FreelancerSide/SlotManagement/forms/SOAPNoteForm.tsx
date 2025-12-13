'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import { SOAPNoteFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

const soapNoteSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  therapistName: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  durationOfTreatment: z.string().optional(),
  primaryAreaOfPain: z.string().optional(),
  reasonForVisit: z.string().optional(),
  painReliefGoals: z
    .object({
      painRelief: z.boolean().optional(),
      relieveTension: z.boolean().optional(),
      relieveStress: z.boolean().optional(),
      relieveAnxiety: z.boolean().optional(),
      improveQualityOfLife: z.boolean().optional(),
      other: z.boolean().optional(),
      otherText: z.string().optional(),
    })
    .optional(),
  intensityOfPain: z.string().optional(),
  sensationOfPain: z
    .object({
      adhesion: z.boolean().optional(),
      sharp: z.boolean().optional(),
      tender: z.boolean().optional(),
      cold: z.boolean().optional(),
      burning: z.boolean().optional(),
      dull: z.boolean().optional(),
      other: z.boolean().optional(),
      otherText: z.string().optional(),
    })
    .optional(),
  associatedSymptoms: z
    .object({
      rotation: z.boolean().optional(),
      pain: z.boolean().optional(),
      tenderPointHypertonicity: z.boolean().optional(),
      spasm: z.boolean().optional(),
    })
    .optional(),
  painLocationNotes: z.string().optional(),
  timePatternOfPain: z.enum(['constant', 'intermittent', 'variable', '']).optional(),
  whenDidPainStart: z.string().optional(),
  specificIncident: z
    .object({
      motorVehicleAccident: z.boolean().optional(),
      fall: z.boolean().optional(),
      sleptFunny: z.boolean().optional(),
      workRelated: z.boolean().optional(),
      sportsExercise: z.boolean().optional(),
      other: z.boolean().optional(),
      otherText: z.string().optional(),
    })
    .optional(),
  aggravatingFactors: z.string().optional(),
  alleviatingFactors: z.string().optional(),
  otherHealthcarePractitioners: z
    .object({
      massageTherapist: z.boolean().optional(),
      physicalTherapist: z.boolean().optional(),
      chiropractor: z.boolean().optional(),
      physician: z.boolean().optional(),
      other: z.boolean().optional(),
      otherText: z.string().optional(),
    })
    .optional(),
  painPreventsParticipation: z
    .object({
      work: z.boolean().optional(),
      leisureActivities: z.boolean().optional(),
      sportsExercise: z.boolean().optional(),
      sleep: z.boolean().optional(),
    })
    .optional(),
  postureAssessment: z
    .object({
      spine: z
        .enum([
          'normal',
          'lordosis-mild',
          'lordosis-moderate',
          'lordosis-severe',
          'kyphosis-mild',
          'kyphosis-moderate',
          'kyphosis-severe',
          'scoliosis-mild',
          'scoliosis-moderate',
          'scoliosis-severe',
          '',
        ])
        .optional(),
      pelvis: z
        .enum([
          'normal',
          'lordosis-mild',
          'lordosis-moderate',
          'lordosis-severe',
          'kyphosis-mild',
          'kyphosis-moderate',
          'kyphosis-severe',
          'scoliosis-mild',
          'scoliosis-moderate',
          'scoliosis-severe',
          '',
        ])
        .optional(),
      shoulders: z
        .enum([
          'normal',
          'lordosis-mild',
          'lordosis-moderate',
          'lordosis-severe',
          'kyphosis-mild',
          'kyphosis-moderate',
          'kyphosis-severe',
          'scoliosis-mild',
          'scoliosis-moderate',
          'scoliosis-severe',
          '',
        ])
        .optional(),
    })
    .optional(),
  rangeOfMotion: z
    .object({
      area: z.string().optional(),
      restriction: z
        .enum(['fullRange', 'slightRestriction', 'moderateRestriction', 'severeRestriction', ''])
        .optional(),
      intensity: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  palpation: z
    .object({
      area: z.string().optional(),
      tension: z.enum(['mild', 'moderate', 'severe', '']).optional(),
      texture: z.enum(['pliable', 'adhesive', 'fibrotic', '']).optional(),
      tenderness: z.enum(['mild', 'moderate', 'severe', '']).optional(),
      temperature: z.enum(['normal', 'increased', 'decreased', '']).optional(),
    })
    .optional(),
  treatmentAreas: z
    .object({
      back: z.boolean().optional(),
      neck: z.boolean().optional(),
      shoulders: z.boolean().optional(),
      face: z.boolean().optional(),
      breast: z.boolean().optional(),
      abdominals: z.boolean().optional(),
      chest: z.boolean().optional(),
      hipArea: z.boolean().optional(),
      other: z.boolean().optional(),
      otherText: z.string().optional(),
    })
    .optional(),
  assessmentDetails: z
    .object({
      duration: z.string().optional(),
      tension: z.enum(['mild', 'moderate', 'severe', '']).optional(),
      texture: z.enum(['pliable', 'adhesive', 'fibrotic', '']).optional(),
      tenderness: z.enum(['mild', 'moderate', 'severe', '']).optional(),
      temperature: z.enum(['normal', 'increased', 'decreased', '']).optional(),
    })
    .optional(),
  clientResponseToTreatment: z.string().optional(),
  treatmentPlanAndSelfCare: z.string().optional(),
  modality: z.string().optional(),
  modalityDuration: z.string().optional(),
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SOAPNoteFormData>({
    resolver: zodResolver(soapNoteSchema),
    defaultValues: initialData || {
      patientName: slot.booking?.client?.name || '',
      therapistName: '',
      date: defaultDate,
      durationOfTreatment: defaultDuration,
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
        adhesion: false,
        sharp: false,
        tender: false,
        cold: false,
        burning: false,
        dull: false,
        other: false,
        otherText: '',
      },
      associatedSymptoms: {
        rotation: false,
        pain: false,
        tenderPointHypertonicity: false,
        spasm: false,
      },
      painLocationNotes: '',
      timePatternOfPain: '',
      whenDidPainStart: '',
      specificIncident: {
        motorVehicleAccident: false,
        fall: false,
        sleptFunny: false,
        workRelated: false,
        sportsExercise: false,
        other: false,
        otherText: '',
      },
      aggravatingFactors: '',
      alleviatingFactors: '',
      otherHealthcarePractitioners: {
        massageTherapist: false,
        physicalTherapist: false,
        chiropractor: false,
        physician: false,
        other: false,
        otherText: '',
      },
      painPreventsParticipation: {
        work: false,
        leisureActivities: false,
        sportsExercise: false,
        sleep: false,
      },
      postureAssessment: {
        spine: '',
        pelvis: '',
        shoulders: '',
      },
      rangeOfMotion: {
        area: '',
        restriction: '',
        intensity: '',
        notes: '',
      },
      palpation: {
        area: '',
        tension: '',
        texture: '',
        tenderness: '',
        temperature: '',
      },
      treatmentAreas: {
        back: false,
        neck: false,
        shoulders: false,
        face: false,
        breast: false,
        abdominals: false,
        chest: false,
        hipArea: false,
        other: false,
        otherText: '',
      },
      assessmentDetails: {
        duration: '',
        tension: '',
        texture: '',
        tenderness: '',
        temperature: '',
      },
      clientResponseToTreatment: '',
      treatmentPlanAndSelfCare: '',
      modality: '',
      modalityDuration: '',
    },
  });

  const onSubmitForm = (data: SOAPNoteFormData) => {
    onSubmit(data);
  };

  const painReliefGoals = watch('painReliefGoals') || {};
  const sensationOfPain = watch('sensationOfPain') || {};
  const associatedSymptoms = watch('associatedSymptoms') || {};
  const specificIncident = watch('specificIncident') || {};
  const otherHealthcarePractitioners = watch('otherHealthcarePractitioners') || {};
  const painPreventsParticipation = watch('painPreventsParticipation') || {};
  const treatmentAreas = watch('treatmentAreas') || {};

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins text-xl font-semibold text-charcoal">
            SOAP NOTES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-4 border-b">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="font-inter text-sm font-medium">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="patientName"
                {...register('patientName')}
                placeholder="Client Name"
                className="font-inter"
              />
              {errors.patientName && (
                <p className="font-inter text-sm text-red-500">{errors.patientName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="therapistName" className="font-inter text-sm font-medium">
                Therapist Name
              </Label>
              <Input
                id="therapistName"
                {...register('therapistName')}
                placeholder="Therapist Name"
                className="font-inter"
              />
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
              <Label htmlFor="durationOfTreatment" className="font-inter text-sm font-medium">
                Duration Of Treatment
              </Label>
              <Input
                id="durationOfTreatment"
                {...register('durationOfTreatment')}
                placeholder="Duration"
                className="font-inter"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="primaryAreaOfPain" className="font-inter text-sm font-medium">
                Primary area of pain
              </Label>
              <Input
                id="primaryAreaOfPain"
                {...register('primaryAreaOfPain')}
                placeholder="Primary area of pain"
                className="font-inter"
              />
            </div>
          </div>

          <Tabs defaultValue="subjective" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="subjective" className="font-inter text-sm">
                SUBJECTIVE (Page 1)
              </TabsTrigger>
              <TabsTrigger value="objective" className="font-inter text-sm">
                OBJECTIVE (Page 2)
              </TabsTrigger>
              <TabsTrigger value="plan" className="font-inter text-sm">
                PLAN (Page 3)
              </TabsTrigger>
            </TabsList>

            {/* SUBJECTIVE - Page 1 */}
            <TabsContent value="subjective" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="reasonForVisit" className="font-inter text-sm font-medium">
                  SUBJECTIVE Reason for visit:
                </Label>
                <Textarea
                  id="reasonForVisit"
                  {...register('reasonForVisit')}
                  placeholder="Enter reason for visit..."
                  className="min-h-[80px] font-open-sans"
                />
              </div>

              {/* Pain Relief Goals */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">Pain Relief Goals</Label>
                <div className="space-y-2">
                  {[
                    { key: 'painRelief', label: 'Pain relief' },
                    { key: 'relieveTension', label: 'Relieve tension' },
                    { key: 'relieveStress', label: 'Relieve stress (skip rest of section)' },
                    { key: 'relieveAnxiety', label: 'Relieve anxiety (skip rest of section)' },
                    {
                      key: 'improveQualityOfLife',
                      label: 'Improve quality of life (skip rest of section)',
                    },
                    { key: 'other', label: 'Other' },
                  ].map((goal) => (
                    <div key={goal.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`painRelief-${goal.key}`}
                        checked={
                          (painReliefGoals[goal.key as keyof typeof painReliefGoals] as boolean) ||
                          false
                        }
                        onCheckedChange={(checked) =>
                          setValue(`painReliefGoals.${goal.key}` as any, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`painRelief-${goal.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                  {painReliefGoals.other && (
                    <Input
                      {...register('painReliefGoals.otherText')}
                      placeholder="Specify other..."
                      className="ml-6 font-inter"
                    />
                  )}
                </div>
              </div>

              {/* Intensity of Pain */}
              <div className="space-y-2">
                <Label htmlFor="intensityOfPain" className="font-inter text-sm font-medium">
                  Intensity of pain: (1-10)
                </Label>
                <Input
                  id="intensityOfPain"
                  type="number"
                  min="1"
                  max="10"
                  {...register('intensityOfPain')}
                  placeholder="1-10"
                  className="font-inter w-24"
                />
              </div>

              {/* Sensation of Pain */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">Sensation of pain</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { key: 'adhesion', label: 'Adhesion' },
                    { key: 'sharp', label: 'Sharp' },
                    { key: 'tender', label: 'Tender' },
                    { key: 'cold', label: 'Cold' },
                    { key: 'burning', label: 'Burning' },
                    { key: 'dull', label: 'Dull' },
                    { key: 'other', label: 'Other' },
                  ].map((sensation) => (
                    <div key={sensation.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sensation-${sensation.key}`}
                        checked={
                          (sensationOfPain[
                            sensation.key as keyof typeof sensationOfPain
                          ] as boolean) || false
                        }
                        onCheckedChange={(checked) =>
                          setValue(`sensationOfPain.${sensation.key}` as any, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`sensation-${sensation.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {sensation.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {sensationOfPain.other && (
                  <Input
                    {...register('sensationOfPain.otherText')}
                    placeholder="Specify other sensation..."
                    className="font-inter"
                  />
                )}
              </div>

              {/* Associated Symptoms */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">Associated Symptoms</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'rotation', label: 'Rotation' },
                    { key: 'pain', label: 'Pain' },
                    { key: 'tenderPointHypertonicity', label: 'Tender Point Hypertonicity' },
                    { key: 'spasm', label: 'Spasm' },
                  ].map((symptom) => (
                    <div key={symptom.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`symptom-${symptom.key}`}
                        checked={
                          (associatedSymptoms[
                            symptom.key as keyof typeof associatedSymptoms
                          ] as boolean) || false
                        }
                        onCheckedChange={(checked) =>
                          setValue(`associatedSymptoms.${symptom.key}` as any, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`symptom-${symptom.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {symptom.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pain Location Notes (Body Diagrams) */}
              <div className="space-y-2">
                <Label htmlFor="painLocationNotes" className="font-inter text-sm font-medium">
                  Pain Location (Mark on body diagrams: front, back, side views)
                </Label>
                <Textarea
                  id="painLocationNotes"
                  {...register('painLocationNotes')}
                  placeholder="Describe pain locations and mark on body diagrams..."
                  className="min-h-[100px] font-open-sans"
                />
              </div>

              {/* Time Pattern of Pain */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">Time pattern of pain:</Label>
                <RadioGroup
                  value={watch('timePatternOfPain') || ''}
                  onValueChange={(value) => setValue('timePatternOfPain', value as any)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="constant" id="pattern-constant" />
                      <Label
                        htmlFor="pattern-constant"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Constant (pain does not change)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermittent" id="pattern-intermittent" />
                      <Label
                        htmlFor="pattern-intermittent"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Intermittent (intensity doesn&apos;t change but comes & goes)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="variable" id="pattern-variable" />
                      <Label
                        htmlFor="pattern-variable"
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        Variable (intensity changes throughout the day)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* When did pain start */}
              <div className="space-y-2">
                <Label htmlFor="whenDidPainStart" className="font-inter text-sm font-medium">
                  When did the pain start:
                </Label>
                <Input
                  id="whenDidPainStart"
                  {...register('whenDidPainStart')}
                  placeholder="When did the pain start"
                  className="font-inter"
                />
              </div>

              {/* Specific Incident */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">
                  Was there a specific incident that cause this pain?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'motorVehicleAccident', label: 'Motor vehicle accident' },
                    { key: 'fall', label: 'Fall' },
                    { key: 'sleptFunny', label: 'Slept funny' },
                    { key: 'workRelated', label: 'Work-related' },
                    { key: 'sportsExercise', label: 'Sports/exercise' },
                    { key: 'other', label: 'Other' },
                  ].map((incident) => (
                    <div key={incident.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`incident-${incident.key}`}
                        checked={
                          (specificIncident[
                            incident.key as keyof typeof specificIncident
                          ] as boolean) || false
                        }
                        onCheckedChange={(checked) =>
                          setValue(`specificIncident.${incident.key}` as any, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`incident-${incident.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {incident.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {specificIncident.other && (
                  <Input
                    {...register('specificIncident.otherText')}
                    placeholder="Specify other incident..."
                    className="font-inter"
                  />
                )}
              </div>

              {/* Aggravating Factors */}
              <div className="space-y-2">
                <Label htmlFor="aggravatingFactors" className="font-inter text-sm font-medium">
                  Pain/discomfort is brought on or made worse by...
                </Label>
                <Textarea
                  id="aggravatingFactors"
                  {...register('aggravatingFactors')}
                  placeholder="Enter aggravating factors..."
                  className="min-h-[80px] font-open-sans"
                />
              </div>

              {/* Alleviating Factors */}
              <div className="space-y-2">
                <Label htmlFor="alleviatingFactors" className="font-inter text-sm font-medium">
                  Pain/discomfort feels better with...
                </Label>
                <Textarea
                  id="alleviatingFactors"
                  {...register('alleviatingFactors')}
                  placeholder="Enter alleviating factors..."
                  className="min-h-[80px] font-open-sans"
                />
              </div>

              {/* Other Healthcare Practitioners */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">
                  Have you seen other healthcare practitioners about this issue?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'massageTherapist', label: 'Massage therapist' },
                    { key: 'physicalTherapist', label: 'Physical therapist' },
                    { key: 'chiropractor', label: 'Chiropractor' },
                    { key: 'physician', label: 'Physician' },
                    { key: 'other', label: 'Other' },
                  ].map((practitioner) => (
                    <div key={practitioner.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`practitioner-${practitioner.key}`}
                        checked={
                          (otherHealthcarePractitioners[
                            practitioner.key as keyof typeof otherHealthcarePractitioners
                          ] as boolean) || false
                        }
                        onCheckedChange={(checked) =>
                          setValue(
                            `otherHealthcarePractitioners.${practitioner.key}` as any,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`practitioner-${practitioner.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {practitioner.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {otherHealthcarePractitioners.other && (
                  <Input
                    {...register('otherHealthcarePractitioners.otherText')}
                    placeholder="Specify other practitioner..."
                    className="font-inter"
                  />
                )}
              </div>

              {/* Pain Prevents Participation */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">
                  Does this pain prevent you from participating in...
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'work', label: 'Work' },
                    { key: 'leisureActivities', label: 'Leisure activities' },
                    { key: 'sportsExercise', label: 'Sports/exercise' },
                    { key: 'sleep', label: 'Sleep' },
                  ].map((activity) => (
                    <div key={activity.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`prevents-${activity.key}`}
                        checked={
                          (painPreventsParticipation[
                            activity.key as keyof typeof painPreventsParticipation
                          ] as boolean) || false
                        }
                        onCheckedChange={(checked) =>
                          setValue(
                            `painPreventsParticipation.${activity.key}` as any,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`prevents-${activity.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {activity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* OBJECTIVE - Page 2 */}
            <TabsContent value="objective" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">OBJECTIVE</h3>

              {/* Posture Assessment */}
              <div className="space-y-4">
                <Label className="font-inter text-sm font-medium">POSTURE ASSESSMENT</Label>
                {['spine', 'pelvis', 'shoulders'].map((area) => (
                  <div key={area} className="space-y-2">
                    <Label className="font-inter text-sm font-medium capitalize">{area}</Label>
                    <RadioGroup
                      value={(watch(`postureAssessment.${area}` as any) as string) || ''}
                      onValueChange={(value) =>
                        setValue(`postureAssessment.${area}` as any, value as any)
                      }
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="normal" id={`${area}-normal`} />
                          <Label
                            htmlFor={`${area}-normal`}
                            className="font-inter text-xs font-normal cursor-pointer"
                          >
                            Normal
                          </Label>
                        </div>
                        {['lordosis', 'kyphosis', 'scoliosis'].map((condition) =>
                          ['mild', 'moderate', 'severe'].map((severity) => (
                            <div
                              key={`${condition}-${severity}`}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={`${condition}-${severity}`}
                                id={`${area}-${condition}-${severity}`}
                              />
                              <Label
                                htmlFor={`${area}-${condition}-${severity}`}
                                className="font-inter text-xs font-normal cursor-pointer"
                              >
                                {condition.charAt(0).toUpperCase() + condition.slice(1)} [{severity}
                                ]
                              </Label>
                            </div>
                          )),
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Range of Motion */}
              <div className="space-y-4">
                <Label className="font-inter text-sm font-medium">Range of Motion</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="romArea" className="font-inter text-sm font-medium">
                      Area
                    </Label>
                    <Input
                      id="romArea"
                      {...register('rangeOfMotion.area')}
                      placeholder="Area"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Restriction</Label>
                    <RadioGroup
                      value={watch('rangeOfMotion.restriction') || ''}
                      onValueChange={(value) => setValue('rangeOfMotion.restriction', value as any)}
                    >
                      <div className="space-y-2">
                        {[
                          { value: 'fullRange', label: 'Full range' },
                          { value: 'slightRestriction', label: 'Slight restriction' },
                          { value: 'moderateRestriction', label: 'Moderate restriction' },
                          { value: 'severeRestriction', label: 'Severe restriction' },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`rom-${option.value}`} />
                            <Label
                              htmlFor={`rom-${option.value}`}
                              className="font-inter text-sm font-normal cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="romIntensity" className="font-inter text-sm font-medium">
                      Intensity (1-10)
                    </Label>
                    <Input
                      id="romIntensity"
                      type="number"
                      min="1"
                      max="10"
                      {...register('rangeOfMotion.intensity')}
                      placeholder="1-10"
                      className="font-inter w-24"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="romNotes" className="font-inter text-sm font-medium">
                      Notes
                    </Label>
                    <Textarea
                      id="romNotes"
                      {...register('rangeOfMotion.notes')}
                      placeholder="Enter notes..."
                      className="min-h-[80px] font-open-sans"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Palpation */}
              <div className="space-y-4">
                <Label className="font-inter text-sm font-medium">Palpation</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="palpationArea" className="font-inter text-sm font-medium">
                      Area
                    </Label>
                    <Input
                      id="palpationArea"
                      {...register('palpation.area')}
                      placeholder="Area"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Tension</Label>
                    <RadioGroup
                      value={watch('palpation.tension') || ''}
                      onValueChange={(value) => setValue('palpation.tension', value as any)}
                    >
                      <div className="flex gap-4">
                        {['mild', 'moderate', 'severe'].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level} id={`tension-${level}`} />
                            <Label
                              htmlFor={`tension-${level}`}
                              className="font-inter text-xs font-normal cursor-pointer"
                            >
                              {level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Texture</Label>
                    <RadioGroup
                      value={watch('palpation.texture') || ''}
                      onValueChange={(value) => setValue('palpation.texture', value as any)}
                    >
                      <div className="flex gap-4">
                        {['pliable', 'adhesive', 'fibrotic'].map((texture) => (
                          <div key={texture} className="flex items-center space-x-2">
                            <RadioGroupItem value={texture} id={`texture-${texture}`} />
                            <Label
                              htmlFor={`texture-${texture}`}
                              className="font-inter text-xs font-normal cursor-pointer"
                            >
                              {texture}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Tenderness</Label>
                    <RadioGroup
                      value={watch('palpation.tenderness') || ''}
                      onValueChange={(value) => setValue('palpation.tenderness', value as any)}
                    >
                      <div className="flex gap-4">
                        {['mild', 'moderate', 'severe'].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level} id={`tenderness-${level}`} />
                            <Label
                              htmlFor={`tenderness-${level}`}
                              className="font-inter text-xs font-normal cursor-pointer"
                            >
                              {level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Temperature</Label>
                    <RadioGroup
                      value={watch('palpation.temperature') || ''}
                      onValueChange={(value) => setValue('palpation.temperature', value as any)}
                    >
                      <div className="flex gap-4">
                        {['normal', 'increased', 'decreased'].map((temp) => (
                          <div key={temp} className="flex items-center space-x-2">
                            <RadioGroupItem value={temp} id={`temp-${temp}`} />
                            <Label
                              htmlFor={`temp-${temp}`}
                              className="font-inter text-xs font-normal cursor-pointer"
                            >
                              {temp}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Treatment Areas */}
              <div className="space-y-3">
                <Label className="font-inter text-sm font-medium">Treatment Areas</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'back', label: 'Back' },
                    { key: 'neck', label: 'Neck' },
                    { key: 'shoulders', label: 'Shoulders' },
                    { key: 'face', label: 'Face' },
                    { key: 'breast', label: 'Breast' },
                    { key: 'abdominals', label: 'Abdominals' },
                    { key: 'chest', label: 'Chest' },
                    { key: 'hipArea', label: 'Hip area' },
                    { key: 'other', label: 'Other' },
                  ].map((area) => (
                    <div key={area.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`treatmentArea-${area.key}`}
                        checked={
                          (treatmentAreas[area.key as keyof typeof treatmentAreas] as boolean) ||
                          false
                        }
                        onCheckedChange={(checked) =>
                          setValue(`treatmentAreas.${area.key}` as any, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`treatmentArea-${area.key}`}
                        className="font-inter text-sm font-normal cursor-pointer"
                      >
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {treatmentAreas.other && (
                  <Input
                    {...register('treatmentAreas.otherText')}
                    placeholder="Specify other area..."
                    className="font-inter"
                  />
                )}
              </div>

              {/* Modality and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modality" className="font-inter text-sm font-medium">
                    Modality
                  </Label>
                  <Input
                    id="modality"
                    {...register('modality')}
                    placeholder="Modality"
                    className="font-inter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modalityDuration" className="font-inter text-sm font-medium">
                    Duration
                  </Label>
                  <Input
                    id="modalityDuration"
                    {...register('modalityDuration')}
                    placeholder="Duration"
                    className="font-inter"
                  />
                </div>
              </div>
            </TabsContent>

            {/* PLAN - Page 3 */}
            <TabsContent value="plan" className="space-y-6 mt-6">
              <h3 className="font-poppins text-lg font-semibold text-charcoal">PLAN</h3>

              {/* Modality and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planModality" className="font-inter text-sm font-medium">
                    Modality
                  </Label>
                  <Input
                    id="planModality"
                    {...register('modality')}
                    placeholder="Modality"
                    className="font-inter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planModalityDuration" className="font-inter text-sm font-medium">
                    Duration
                  </Label>
                  <Input
                    id="planModalityDuration"
                    {...register('modalityDuration')}
                    placeholder="Duration"
                    className="font-inter"
                  />
                </div>
              </div>

              {/* Assessment Details */}
              <div className="space-y-4">
                <Label className="font-inter text-sm font-medium">ASSESSMENT</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessmentDuration" className="font-inter text-sm font-medium">
                      Duration
                    </Label>
                    <Input
                      id="assessmentDuration"
                      {...register('assessmentDetails.duration')}
                      placeholder="Duration"
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Tension</Label>
                    <RadioGroup
                      value={watch('assessmentDetails.tension') || ''}
                      onValueChange={(value) => setValue('assessmentDetails.tension', value as any)}
                    >
                      <div className="flex gap-4">
                        {['mild', 'moderate', 'severe'].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level} id={`assessTension-${level}`} />
                            <Label
                              htmlFor={`assessTension-${level}`}
                              className="font-inter text-xs font-normal cursor-pointer"
                            >
                              {level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Texture</Label>
                    <RadioGroup
                      value={watch('assessmentDetails.texture') || ''}
                      onValueChange={(value) => setValue('assessmentDetails.texture', value as any)}
                    >
                      <div className="flex gap-4">
                        {['pliable', 'adhesive', 'fibrotic'].map((texture) => (
                          <div key={texture} className="flex items-center space-x-2">
                            <RadioGroupItem value={texture} id={`assessTexture-${texture}`} />
                            <Label
                              htmlFor={`assessTexture-${texture}`}
                              className="font-inter text-xs font-normal cursor-pointer"
                            >
                              {texture}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Tenderness</Label>
                    <RadioGroup
                      value={watch('assessmentDetails.tenderness') || ''}
                      onValueChange={(value) =>
                        setValue('assessmentDetails.tenderness', value as any)
                      }
                    >
                      <div className="flex gap-4">
                        {['mild', 'moderate', 'severe'].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level} id={`assessTenderness-${level}`} />
                            <Label
                              htmlFor={`assessTenderness-${level}`}
                              className="font-inter text-xs font-normal cursor-pointer"
                            >
                              {level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-inter text-sm font-medium">Temperature</Label>
                    <RadioGroup
                      value={watch('assessmentDetails.temperature') || ''}
                      onValueChange={(value) =>
                        setValue('assessmentDetails.temperature', value as any)
                      }
                    >
                      <div className="flex gap-4">
                        {['normal', 'increased', 'decreased'].map((temp) => (
                          <div key={temp} className="flex items-center space-x-2">
                            <RadioGroupItem value={temp} id={`assessTemp-${temp}`} />
                            <Label
                              htmlFor={`assessTemp-${temp}`}
                              className="font-inter text-xs font-normal cursor-pointer"
                            >
                              {temp}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Client Response to Treatment */}
              <div className="space-y-2">
                <Label
                  htmlFor="clientResponseToTreatment"
                  className="font-inter text-sm font-medium"
                >
                  How did the client respond to treatment?
                </Label>
                <Textarea
                  id="clientResponseToTreatment"
                  {...register('clientResponseToTreatment')}
                  placeholder="Enter client response to treatment..."
                  className="min-h-[120px] font-open-sans"
                />
              </div>

              <Separator />

              {/* Treatment Plan and Self-Care Recommendations */}
              <div className="space-y-2">
                <Label
                  htmlFor="treatmentPlanAndSelfCare"
                  className="font-inter text-sm font-medium"
                >
                  Treatment plan and self-care recommendations
                </Label>
                <Textarea
                  id="treatmentPlanAndSelfCare"
                  {...register('treatmentPlanAndSelfCare')}
                  placeholder="Enter treatment plan and self-care recommendations..."
                  className="min-h-[150px] font-open-sans"
                />
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
