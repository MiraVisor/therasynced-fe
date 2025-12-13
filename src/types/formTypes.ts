// Form Type Enum
export enum FormType {
  NONE = 'NONE',
  SOAP_NOTE = 'SOAP_NOTE',
  MEDICAL_HISTORY = 'MEDICAL_HISTORY',
  ROM_ASSESSMENT = 'ROM_ASSESSMENT',
}

// Form Type Labels
export const FORM_TYPE_LABELS: Record<FormType, string> = {
  [FormType.NONE]: 'N/A',
  [FormType.SOAP_NOTE]: 'SOAP Note',
  [FormType.MEDICAL_HISTORY]: 'Medical History Form',
  [FormType.ROM_ASSESSMENT]: 'ROM Assessment Form',
};

// SOAP Note Form Data Structure
export interface SOAPNoteFormData {
  patientName: string;
  date: string;
  sessionType: string;
  duration: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// Medical History Form Data Structure
export interface MedicalHistoryFormData {
  patientName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions: string;
  currentMedications: string;
  allergies: string;
  pastSurgeries: string;
  familyHistory: string;
  lifestyleFactors: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: string;
}

// ROM Assessment Form Data Structure
export interface ROMAssessmentFormData {
  // Physical Examination
  physicalExaminationNotes: string;
  skinSoftTissues: {
    swelling: { minor: boolean; important: boolean };
    callus: { minor: boolean; important: boolean };
    scar: { minor: boolean; important: boolean };
    wound: { minor: boolean; important: boolean };
    temperature: { minor: boolean; important: boolean };
    infection: { minor: boolean; important: boolean };
    pain: { minor: boolean; important: boolean };
    abnormalSensation: { minor: boolean; important: boolean };
  };

  // Sensation
  sensation: {
    superficial: { right: string; left: string; specification: string };
    deep: { right: string; left: string; specification: string };
    numbness: { right: string; left: string; specification: string };
    paresthesia: { right: string; left: string; specification: string };
    other: { right: string; left: string; specification: string };
  };

  // Reflexes
  reflexes: {
    btr: { right: string; left: string; comments: string };
    ttr: { right: string; left: string; comments: string };
    ktr: { right: string; left: string; comments: string };
    atr: { right: string; left: string; comments: string };
    babinsky: { right: string; left: string; comments: string };
  };

  // Range of Motion - Lower Limb
  lowerLimbROM: {
    hip: {
      flexion: { left: string; right: string };
      extension: { left: string; right: string };
      abduction: { left: string; right: string };
      adduction: { left: string; right: string };
      medialRotation: { left: string; right: string };
      lateralRotation: { left: string; right: string };
    };
    knee: {
      flexion: { left: string; right: string };
      extension: { left: string; right: string };
    };
    ankleFoot: {
      dorsiFlexion: { left: string; right: string };
      plantarFlexion: { left: string; right: string };
      inversion: { left: string; right: string };
      eversion: { left: string; right: string };
    };
  };

  // Range of Motion - Upper Limb
  upperLimbROM: {
    shoulder: {
      flexion: { left: string; right: string };
      extension: { left: string; right: string };
      abduction: { left: string; right: string };
      adduction: { left: string; right: string };
      medialRotation: { left: string; right: string };
      lateralRotation: { left: string; right: string };
    };
    elbow: {
      flexion: { left: string; right: string };
      extension: { left: string; right: string };
    };
    forearm: {
      pronation: { left: string; right: string };
      supination: { left: string; right: string };
    };
    wrist: {
      flexion: { left: string; right: string };
      extension: { left: string; right: string };
      abduction: { left: string; right: string };
      adduction: { left: string; right: string };
    };
    fingers: {
      thumbOpposition: { left: string; right: string };
      mpFlexion: { left: string; right: string };
      mpExtension: { left: string; right: string };
      ipFlexion: { left: string; right: string };
    };
  };

  // Range of Motion - Neck
  neckROM: {
    flexion: string;
    extension: string;
    lateroFlexionRight: string;
    lateroFlexionLeft: string;
    rotationRight: string;
    rotationLeft: string;
  };

  // Range of Motion - Trunk
  trunkROM: {
    globalFlexion: string;
    thoracicFlexion: string;
    lumbarFlexion: string;
    globalExtension: string;
    lateroFlexionRight: string;
    lateroFlexionLeft: string;
    rotationRight: string;
    rotationLeft: string;
  };

  // Muscle Test - Lower Limb
  lowerLimbMuscleTest: {
    hip: {
      flexors: { left: string; right: string };
      extensors: { left: string; right: string };
      abductors: { left: string; right: string };
      adductors: { left: string; right: string };
      lateralRot: { left: string; right: string };
      medialRot: { left: string; right: string };
    };
    knee: {
      flexors: { left: string; right: string };
      extensors: { left: string; right: string };
    };
    ankle: {
      dorsiFlexors: { left: string; right: string };
      plantarFlexors: { left: string; right: string };
      invertors: { left: string; right: string };
      evertors: { left: string; right: string };
    };
  };

  // Muscle Test - Upper Limb
  upperLimbMuscleTest: {
    shoulder: {
      flexors: { left: string; right: string };
      extensors: { left: string; right: string };
      abductors: { left: string; right: string };
      adductors: { left: string; right: string };
      lateralRot: { left: string; right: string };
      medialRot: { left: string; right: string };
    };
    elbow: {
      flexors: { left: string; right: string };
      extensors: { left: string; right: string };
    };
    forearm: {
      pronators: { left: string; right: string };
      supinators: { left: string; right: string };
    };
    wrist: {
      flexors: { left: string; right: string };
      extensors: { left: string; right: string };
      abductors: { left: string; right: string };
      adductors: { left: string; right: string };
    };
    fingers: {
      flexors: { left: string; right: string };
      extensors: { left: string; right: string };
    };
  };

  // Functional Evaluation
  functionalEvaluation: {
    balance: {
      sitting: string;
      standing: string;
    };
    coordination: {
      upperLimbs: { left: string; right: string };
      lowerLimbs: { left: string; right: string };
      comments: string;
    };
    gaitAnalysis: {
      frontalPlane: string;
      sagittalPlane: string;
      safety: string;
      cadence: string;
      speed: string;
      fatigue: string;
      otherRemarks: string;
    };
  };

  // Activity Limitations & Participation Restrictions
  activityLimitations: {
    mobility: {
      crawling: string;
      crouchingGait: string;
      walking: string;
      squatting: string;
      stairs: string;
      running: string;
    };
    transfers: {
      lieToSit: string;
      sitToStand: string;
      standToFloor: string;
      sitToSit: string;
    };
    balance: {
      sitting: string;
      standing: string;
      onOneLeg: string;
    };
    upperLimbFunctions: {
      grasp: { right: string; left: string };
      release: { right: string; left: string };
      fineManipulation: { right: string; left: string };
      holding: { right: string; left: string };
    };
    dailyLifeActivities: {
      dressingUpper: string;
      dressingLower: string;
      toileting: string;
      bathing: string;
      washing: string;
      eating: string;
      drinking: string;
    };
    assistedDevices: {
      withoutDevices: boolean;
      oneCrutch: { used: boolean; quality: string };
      pairOfCrutches: { used: boolean; quality: string };
      walkingFrame: { used: boolean; quality: string };
      wheelchair: { used: boolean; quality: string };
      orthosisRight: { used: boolean; quality: string; type: string };
      orthosisLeft: { used: boolean; quality: string; type: string };
    };
  };

  // Conclusion
  conclusion: {
    environmentalFactors: string;
    personalConditions: string;
    livingConditions: string;
    medSocialStructures: string;
    currentTreatment: string;
    remarks: string;
    bodyStructureImpairments: string;
    assTraumaDiseases: string;
    romStatus: string;
    muscleStatus: string;
    skinSoftTissuesPain: string;
    cardioVascularStatus: string;
    activityLimitations: string;
    generalMobility: string;
    transfers: string;
    balance: string;
    upperLimbFunctions: string;
    dailyLifeActivities: string;
    referral: string;
    referredTo: string;
    referralReason: string[];
  };
}

// Union type for all form data
export type FormData = SOAPNoteFormData | MedicalHistoryFormData | ROMAssessmentFormData;
