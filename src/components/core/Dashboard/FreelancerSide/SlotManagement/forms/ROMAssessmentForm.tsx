'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ROMAssessmentFormData } from '@/types/formTypes';
import { Slot } from '@/types/types';

// Simplified schema for POC - can be expanded later
const romAssessmentSchema = z.object({
  physicalExaminationNotes: z.string().optional(),
  skinSoftTissues: z
    .object({
      swelling: z.object({ minor: z.boolean(), important: z.boolean() }).optional(),
      callus: z.object({ minor: z.boolean(), important: z.boolean() }).optional(),
      scar: z.object({ minor: z.boolean(), important: z.boolean() }).optional(),
      wound: z.object({ minor: z.boolean(), important: z.boolean() }).optional(),
      temperature: z.object({ minor: z.boolean(), important: z.boolean() }).optional(),
      infection: z.object({ minor: z.boolean(), important: z.boolean() }).optional(),
      pain: z.object({ minor: z.boolean(), important: z.boolean() }).optional(),
      abnormalSensation: z.object({ minor: z.boolean(), important: z.boolean() }).optional(),
    })
    .optional(),
  // Simplified - can add more fields as needed
  lowerLimbROM: z.any().optional(),
  upperLimbROM: z.any().optional(),
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
      hip: {
        flexion: { left: '', right: '' },
        extension: { left: '', right: '' },
        abduction: { left: '', right: '' },
        adduction: { left: '', right: '' },
        medialRotation: { left: '', right: '' },
        lateralRotation: { left: '', right: '' },
      },
      knee: {
        flexion: { left: '', right: '' },
        extension: { left: '', right: '' },
      },
      ankleFoot: {
        dorsiFlexion: { left: '', right: '' },
        plantarFlexion: { left: '', right: '' },
        inversion: { left: '', right: '' },
        eversion: { left: '', right: '' },
      },
    },
    upperLimbROM: {
      shoulder: {
        flexion: { left: '', right: '' },
        extension: { left: '', right: '' },
        abduction: { left: '', right: '' },
        adduction: { left: '', right: '' },
        medialRotation: { left: '', right: '' },
        lateralRotation: { left: '', right: '' },
      },
      elbow: {
        flexion: { left: '', right: '' },
        extension: { left: '', right: '' },
      },
      forearm: {
        pronation: { left: '', right: '' },
        supination: { left: '', right: '' },
      },
      wrist: {
        flexion: { left: '', right: '' },
        extension: { left: '', right: '' },
        abduction: { left: '', right: '' },
        adduction: { left: '', right: '' },
      },
      fingers: {
        thumbOpposition: { left: '', right: '' },
        mpFlexion: { left: '', right: '' },
        mpExtension: { left: '', right: '' },
        ipFlexion: { left: '', right: '' },
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
    },
    conclusion: {
      environmentalFactors: '',
      personalConditions: '',
      livingConditions: '',
      medSocialStructures: '',
      currentTreatment: '',
      remarks: '',
      bodyStructureImpairments: '',
      assTraumaDiseases: '',
      romStatus: '',
      muscleStatus: '',
      skinSoftTissuesPain: '',
      cardioVascularStatus: '',
      activityLimitations: '',
      generalMobility: '',
      transfers: '',
      balance: '',
      upperLimbFunctions: '',
      dailyLifeActivities: '',
      referral: '',
      referredTo: '',
      referralReason: [],
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

  const handleCheckboxChange = (path: string, checked: boolean) => {
    setValue(path as any, checked, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins text-xl font-semibold text-charcoal">
            ROM Assessment Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Physical Examination */}
          <div className="space-y-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">
              Physical Examination
            </h3>
            <div className="space-y-2">
              <Label htmlFor="physicalExaminationNotes" className="font-inter text-sm font-medium">
                Mark on the body-chart deformities or joint anomalies, back deformities or
                anomalies, edema, shoulder subluxation etc.
              </Label>
              <Textarea
                id="physicalExaminationNotes"
                {...register('physicalExaminationNotes')}
                placeholder="Enter physical examination notes..."
                className="min-h-[100px] font-open-sans"
              />
            </div>

            {/* Skin & Soft Tissues */}
            <div className="space-y-3">
              <Label className="font-inter text-sm font-medium">Skin & Soft Tissues Problems</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div key={item} className="space-y-2">
                    <Label className="font-inter text-sm font-medium capitalize">
                      {item.replace(/([A-Z])/g, ' $1')}
                    </Label>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${item}-minor`}
                          checked={
                            skinSoftTissues?.[item as keyof typeof skinSoftTissues]?.minor || false
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              `skinSoftTissues.${item}.minor`,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`${item}-minor`}
                          className="font-inter text-xs font-normal cursor-pointer"
                        >
                          Minor
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${item}-important`}
                          checked={
                            skinSoftTissues?.[item as keyof typeof skinSoftTissues]?.important ||
                            false
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              `skinSoftTissues.${item}.important`,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`${item}-important`}
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
          </div>

          <Separator />

          {/* Range of Motion - Lower Limb */}
          <div className="space-y-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">
              Range of Motion - Lower Limb
            </h3>
            <div className="space-y-4">
              {/* Hip */}
              <div className="space-y-2">
                <Label className="font-inter font-medium">Hip</Label>
                <div className="grid grid-cols-3 gap-2 font-inter text-sm">
                  <div>Movement</div>
                  <div>Left</div>
                  <div>Right</div>
                </div>
                {[
                  'flexion',
                  'extension',
                  'abduction',
                  'adduction',
                  'medialRotation',
                  'lateralRotation',
                ].map((movement) => (
                  <div key={movement} className="grid grid-cols-3 gap-2">
                    <Label className="font-inter text-sm capitalize">
                      {movement.replace(/([A-Z])/g, ' $1')}
                    </Label>
                    <Input
                      {...register(`lowerLimbROM.hip.${movement}.left`)}
                      placeholder="L"
                      className="text-sm font-inter"
                    />
                    <Input
                      {...register(`lowerLimbROM.hip.${movement}.right`)}
                      placeholder="R"
                      className="text-sm font-inter"
                    />
                  </div>
                ))}
              </div>

              {/* Knee */}
              <div className="space-y-2">
                <Label className="font-inter font-medium">Knee</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Label className="font-inter text-sm">Flexion</Label>
                  <Input
                    {...register('lowerLimbROM.knee.flexion.left')}
                    placeholder="L"
                    className="font-inter"
                  />
                  <Input
                    {...register('lowerLimbROM.knee.flexion.right')}
                    placeholder="R"
                    className="font-inter"
                  />
                  <Label className="font-inter text-sm">Extension</Label>
                  <Input
                    {...register('lowerLimbROM.knee.extension.left')}
                    placeholder="L"
                    className="font-inter"
                  />
                  <Input
                    {...register('lowerLimbROM.knee.extension.right')}
                    placeholder="R"
                    className="font-inter"
                  />
                </div>
              </div>

              {/* Ankle-Foot */}
              <div className="space-y-2">
                <Label className="font-inter font-medium">Ankle-Foot</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['dorsiFlexion', 'plantarFlexion', 'inversion', 'eversion'].map((movement) => (
                    <div key={movement} className="contents">
                      <Label className="font-inter text-sm capitalize">
                        {movement.replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <Input
                        {...register(`lowerLimbROM.ankleFoot.${movement}.left`)}
                        placeholder="L"
                        className="font-inter"
                      />
                      <Input
                        {...register(`lowerLimbROM.ankleFoot.${movement}.right`)}
                        placeholder="R"
                        className="font-inter"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Range of Motion - Upper Limb */}
          <div className="space-y-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">
              Range of Motion - Upper Limb
            </h3>
            <div className="space-y-4">
              {/* Shoulder */}
              <div className="space-y-2">
                <Label className="font-inter font-medium">Shoulder</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'flexion',
                    'extension',
                    'abduction',
                    'adduction',
                    'medialRotation',
                    'lateralRotation',
                  ].map((movement) => (
                    <div key={movement} className="contents">
                      <Label className="font-inter text-sm capitalize">
                        {movement.replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <Input
                        {...register(`upperLimbROM.shoulder.${movement}.left`)}
                        placeholder="L"
                        className="font-inter"
                      />
                      <Input
                        {...register(`upperLimbROM.shoulder.${movement}.right`)}
                        placeholder="R"
                        className="font-inter"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Elbow */}
              <div className="space-y-2">
                <Label className="font-inter font-medium">Elbow</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Label className="font-inter text-sm">Flexion</Label>
                  <Input
                    {...register('upperLimbROM.elbow.flexion.left')}
                    placeholder="L"
                    className="font-inter"
                  />
                  <Input
                    {...register('upperLimbROM.elbow.flexion.right')}
                    placeholder="R"
                    className="font-inter"
                  />
                  <Label className="font-inter text-sm">Extension</Label>
                  <Input
                    {...register('upperLimbROM.elbow.extension.left')}
                    placeholder="L"
                    className="font-inter"
                  />
                  <Input
                    {...register('upperLimbROM.elbow.extension.right')}
                    placeholder="R"
                    className="font-inter"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Functional Evaluation */}
          <div className="space-y-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">
              Functional Evaluation
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="balanceSitting" className="font-inter text-sm font-medium">
                  Balance - Sitting
                </Label>
                <Input
                  id="balanceSitting"
                  {...register('functionalEvaluation.balance.sitting')}
                  placeholder="Normal, Good, Poor, Not possible"
                  className="font-inter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceStanding" className="font-inter text-sm font-medium">
                  Balance - Standing
                </Label>
                <Input
                  id="balanceStanding"
                  {...register('functionalEvaluation.balance.standing')}
                  placeholder="Normal, Good, Poor, Not possible"
                  className="font-inter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gaitFrontal" className="font-inter text-sm font-medium">
                  Gait Analysis - Frontal Plane Observations
                </Label>
                <Textarea
                  id="gaitFrontal"
                  {...register('functionalEvaluation.gaitAnalysis.frontalPlane')}
                  placeholder="Enter observations..."
                  className="min-h-[80px] font-open-sans"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gaitSagittal" className="font-inter text-sm font-medium">
                  Gait Analysis - Sagittal Plane Observations
                </Label>
                <Textarea
                  id="gaitSagittal"
                  {...register('functionalEvaluation.gaitAnalysis.sagittalPlane')}
                  placeholder="Enter observations..."
                  className="min-h-[80px] font-open-sans"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Limitations */}
          <div className="space-y-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">
              Activity Limitations & Participation Restrictions
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobilityWalking" className="font-inter text-sm font-medium">
                  Mobility - Walking
                </Label>
                <Input
                  id="mobilityWalking"
                  {...register('activityLimitations.mobility.walking')}
                  placeholder="Independent, Assisted, Impossible"
                  className="font-inter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfersSitStand" className="font-inter text-sm font-medium">
                  Transfers - Sit to Stand
                </Label>
                <Input
                  id="transfersSitStand"
                  {...register('activityLimitations.transfers.sitToStand')}
                  placeholder="Independent, Assisted, Impossible"
                  className="font-inter"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Conclusion */}
          <div className="space-y-4">
            <h3 className="font-poppins text-lg font-semibold text-charcoal">Conclusion</h3>
            <div className="space-y-2">
              <Label htmlFor="conclusionRemarks" className="font-inter text-sm font-medium">
                Remarks
              </Label>
              <Textarea
                id="conclusionRemarks"
                {...register('conclusion.remarks')}
                placeholder="Enter conclusion remarks..."
                className="min-h-[120px] font-open-sans"
              />
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
