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
  // Header Information
  patientName: string;
  therapistName: string;
  date: string;
  durationOfTreatment: string;
  primaryAreaOfPain: string;

  // SUBJECTIVE - Page 1
  reasonForVisit: string;
  painReliefGoals: {
    painRelief: boolean;
    relieveTension: boolean;
    relieveStress: boolean;
    relieveAnxiety: boolean;
    improveQualityOfLife: boolean;
    other: boolean;
    otherText?: string;
  };
  intensityOfPain: string; // 1-10
  sensationOfPain: {
    adhesion: boolean;
    sharp: boolean;
    tender: boolean;
    cold: boolean;
    burning: boolean;
    dull: boolean;
    other: boolean;
    otherText?: string;
  };
  associatedSymptoms: {
    rotation: boolean;
    pain: boolean;
    tenderPointHypertonicity: boolean;
    spasm: boolean;
  };
  painLocationNotes: string; // For body diagrams
  timePatternOfPain: 'constant' | 'intermittent' | 'variable' | '';
  whenDidPainStart: string;
  specificIncident: {
    motorVehicleAccident: boolean;
    fall: boolean;
    sleptFunny: boolean;
    workRelated: boolean;
    sportsExercise: boolean;
    other: boolean;
    otherText?: string;
  };
  aggravatingFactors: string;
  alleviatingFactors: string;
  otherHealthcarePractitioners: {
    massageTherapist: boolean;
    physicalTherapist: boolean;
    chiropractor: boolean;
    physician: boolean;
    other: boolean;
    otherText?: string;
  };
  painPreventsParticipation: {
    work: boolean;
    leisureActivities: boolean;
    sportsExercise: boolean;
    sleep: boolean;
  };

  // OBJECTIVE - Page 2
  postureAssessment: {
    spine:
      | 'normal'
      | 'lordosis-mild'
      | 'lordosis-moderate'
      | 'lordosis-severe'
      | 'kyphosis-mild'
      | 'kyphosis-moderate'
      | 'kyphosis-severe'
      | 'scoliosis-mild'
      | 'scoliosis-moderate'
      | 'scoliosis-severe'
      | '';
    pelvis:
      | 'normal'
      | 'lordosis-mild'
      | 'lordosis-moderate'
      | 'lordosis-severe'
      | 'kyphosis-mild'
      | 'kyphosis-moderate'
      | 'kyphosis-severe'
      | 'scoliosis-mild'
      | 'scoliosis-moderate'
      | 'scoliosis-severe'
      | '';
    shoulders:
      | 'normal'
      | 'lordosis-mild'
      | 'lordosis-moderate'
      | 'lordosis-severe'
      | 'kyphosis-mild'
      | 'kyphosis-moderate'
      | 'kyphosis-severe'
      | 'scoliosis-mild'
      | 'scoliosis-moderate'
      | 'scoliosis-severe'
      | '';
  };
  rangeOfMotion: {
    area: string;
    restriction:
      | 'fullRange'
      | 'slightRestriction'
      | 'moderateRestriction'
      | 'severeRestriction'
      | '';
    intensity: string; // 1-10
    notes: string;
  };
  palpation: {
    area: string;
    tension: 'mild' | 'moderate' | 'severe' | '';
    texture: 'pliable' | 'adhesive' | 'fibrotic' | '';
    tenderness: 'mild' | 'moderate' | 'severe' | '';
    temperature: 'normal' | 'increased' | 'decreased' | '';
  };
  treatmentAreas: {
    back: boolean;
    neck: boolean;
    shoulders: boolean;
    face: boolean;
    breast: boolean;
    abdominals: boolean;
    chest: boolean;
    hipArea: boolean;
    other: boolean;
    otherText?: string;
  };

  // ASSESSMENT - Page 3
  assessmentDetails: {
    duration: string;
    tension: 'mild' | 'moderate' | 'severe' | '';
    texture: 'pliable' | 'adhesive' | 'fibrotic' | '';
    tenderness: 'mild' | 'moderate' | 'severe' | '';
    temperature: 'normal' | 'increased' | 'decreased' | '';
  };
  clientResponseToTreatment: string;
  treatmentPlanAndSelfCare: string;
  modality: string;
  modalityDuration: string;
}

// Medical History Form Data Structure
export interface MedicalHistoryFormData {
  // Personal Details
  personalDetails: {
    name: string;
    dateOfBirth: string;
    date: string; // Form completion date
    sex: 'male' | 'female' | 'other' | '';
    parentGuardianName?: string;
    phoneHome: string;
    phoneMobile: string;
    address: string;
    email: string;
    primaryLanguage: string;
    otherLanguages?: string;
    aboriginal?: boolean;
    torresStraitIslander?: boolean;
    refugee?: boolean;
    nonEnglishSpeaking?: boolean;
  };

  // Reason for Concern
  reasonForConcern: string;

  // Medical History
  medicalHistory: {
    gpDetails: {
      name: string;
      phone: string;
      address: string;
    };
    pastMedicalHistory: string;
    medicalConditions: {
      thyroidProblems: boolean;
      rheumatoidConditions: boolean;
      asthmaRespiratory: boolean;
      steroidUseOsteoporosis: boolean;
      heartConditions: boolean;
      epilepsy: boolean;
      diabetes: boolean;
      other: boolean;
      otherText?: string;
      details?: string; // Details if YES to any
    };
    otherSymptoms: {
      unexplainedWeightLoss: boolean;
      constantUnremittingPain: boolean;
      historyOfCancer: boolean;
      thoracicPainNoCause: boolean;
      pinsNeedlesSaddle: boolean;
      difficultySpeaking: boolean;
      doubleVision: boolean;
      ageOver55OrUnder20: boolean;
      widespreadPinsNeedles: boolean;
      historyOfTrauma: boolean;
      recentBladderBowelChanges: boolean;
      difficultySwallowing: boolean;
      unexplainedFainting: boolean;
      dizziness: boolean;
    };
    allergies: string;
    medications: string;
  };

  // Behaviour of Symptoms
  behaviourOfSymptoms: {
    whenDidItStart: string;
    onset: 'slow' | 'sudden' | '';
    symptomsChanged: string;
    otherSymptomsElsewhere: string;
    painIntensity: {
      atRest: string; // 0-10
      atBest: string; // 0-10
      atWorst: string; // 0-10
    };
    symptomsThroughoutDay: {
      am: string;
      throughoutDay: string;
      nightTime: string;
    };
    degreeRestrictsMovement: string;
    movementsIncreaseSymptoms: string;
    movementsEaseSymptoms: string;
    symptomsIncreaseDetails: string; // How quickly come on and how long to ease
    investigations: string;
    previousInjuries: string;
  };

  // Pain Characteristics
  painCharacteristics: {
    deep: boolean;
    superficial: boolean;
    intermittent: boolean;
    constant: boolean;
    sharp: boolean;
    shooting: boolean;
    burning: boolean;
    stinging: boolean;
    throbbing: boolean;
    diffuse: boolean;
  };

  // Sensory Symptoms
  sensorySymptoms: {
    pinsNeedles: boolean;
    numbness: boolean;
    tingling: boolean;
  };

  // Joint Symptoms
  jointSymptoms: {
    clicking: boolean;
    locking: boolean;
    popping: boolean;
    grinding: boolean;
    givingWay: boolean;
    details?: string; // If YES to any
  };

  // Primary Concern
  primaryConcern: string;

  // Social History
  socialHistory: {
    livingSituation: string;
    stairs: string;
    assistanceHouseholdTasks: string;
    occupation: string;
    notWorkingDueToSymptoms: string;
    currentlyNeedWalkingAid: string;
    previouslyNeedWalkingAid: string;
    currentExercise: string;
    previousExercise: string;
    hobbiesInterests: string;
  };

  // Goals
  goals: {
    whatWantToAchieve: string;
    whatExpectFromSession: string;
    howLongToAchieve: string;
  };

  // Signatures
  signatures: {
    patientSignature: string;
    patientDate: string;
    therapistSignature: string;
    therapistDate: string;
  };
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

  // Range of Motion - Lower Limb (with Assessment and Follow up dates)
  lowerLimbROM: {
    assessmentDate: string;
    followUpDate: string;
    hip: {
      flexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extension: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      abduction: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      adduction: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      medialRotation: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      lateralRotation: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    knee: {
      flexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extension: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    ankleFoot: {
      dorsiFlexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      plantarFlexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      inversion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      eversion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
  };

  // Range of Motion - Upper Limb (with Assessment and Follow up dates)
  upperLimbROM: {
    assessmentDate: string;
    followUpDate: string;
    shoulder: {
      flexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extension: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      abduction: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      adduction: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      medialRotation: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      lateralRotation: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    elbow: {
      flexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extension: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    forearm: {
      pronation: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      supination: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    wrist: {
      flexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extension: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      abduction: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      adduction: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    fingers: {
      thumbOpposition: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      mpFlexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      mpExtension: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      ipFlexion: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
  };

  // Range of Motion - Neck (in cm)
  neckROM: {
    flexion: string; // cm
    extension: string; // cm
    lateroFlexionRight: string; // cm
    lateroFlexionLeft: string; // cm
    rotationRight: string; // cm
    rotationLeft: string; // cm
  };

  // Range of Motion - Trunk (in cm, with OK/imp. for rotations)
  trunkROM: {
    globalFlexion: string; // cm
    thoracicFlexion: string; // cm (Ott Test)
    lumbarFlexion: string; // cm (Schober test)
    globalExtension: string; // cm
    lateroFlexionRight: string; // cm
    lateroFlexionLeft: string; // cm
    rotationRight: string; // OK or imp.
    rotationLeft: string; // OK or imp.
  };

  // Muscle Test - Lower Limb (Oxford Scale 0-5, with Assessment and Follow up dates)
  lowerLimbMuscleTest: {
    assessmentDate: string;
    followUpDate: string;
    hip: {
      flexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extensors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      abductors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      adductors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      lateralRot: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      medialRot: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    knee: {
      flexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extensors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    ankle: {
      dorsiFlexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      plantarFlexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      invertors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      evertors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    foot: {
      flexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extensors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    trunk: {
      flexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extensor: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      rightBending: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      leftBending: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      rightRotation: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      leftRotation: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
  };

  // Muscle Test - Upper Limb (Oxford Scale 0-5, with Assessment and Follow up dates)
  upperLimbMuscleTest: {
    assessmentDate: string;
    followUpDate: string;
    shoulder: {
      flexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extensors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      abductors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      adductors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      lateralRot: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      medialRot: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      elevators: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      depressors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      antepulsors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      retropulsors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    elbow: {
      flexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extensors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    forearm: {
      supinators: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      pronators: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    wrist: {
      flexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extensors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
    fingers: {
      flexors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      extensors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      abductors: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
      opposition: {
        leftAssessment: string;
        rightAssessment: string;
        leftFollowUp: string;
        rightFollowUp: string;
      };
    };
  };

  // Functional Evaluation
  functionalEvaluation: {
    balance: {
      sitting: 'normal' | 'good' | 'poor' | 'notPossible' | '';
      standing: 'normal' | 'good' | 'poor' | 'notPossible' | '';
    };
    coordination: {
      upperLimbs: {
        left: 'good' | 'poor' | 'notPossible' | '';
        right: 'good' | 'poor' | 'notPossible' | '';
      };
      lowerLimbs: {
        left: 'good' | 'poor' | 'notPossible' | '';
        right: 'good' | 'poor' | 'notPossible' | '';
      };
      comments: string;
    };
    gaitAnalysis: {
      frontalPlane: string; // Observations
      sagittalPlane: string; // Observations
      safety: 'normal' | 'good' | 'poor' | '';
      cadence: 'normal' | 'good' | 'poor' | '';
      speed: 'normal' | 'good' | 'poor' | '';
      fatigue: 'normal' | 'good' | 'poor' | '';
      safetyComments: string;
      cadenceComments: string;
      speedComments: string;
      fatigueComments: string;
      otherRemarks: string;
    };
  };

  // Activity Limitations & Participation Restrictions
  activityLimitations: {
    mobility: {
      crawling: 'independent' | 'assisted' | 'impossible' | '';
      crouchingGait: 'independent' | 'assisted' | 'impossible' | '';
      walking: 'independent' | 'assisted' | 'impossible' | '';
      squatting: 'independent' | 'assisted' | 'impossible' | '';
      stairs: 'independent' | 'assisted' | 'impossible' | '';
      running: 'independent' | 'assisted' | 'impossible' | '';
    };
    transfers: {
      lieToSit: 'independent' | 'assisted' | 'impossible' | '';
      sitToStand: 'independent' | 'assisted' | 'impossible' | '';
      standToFloor: 'independent' | 'assisted' | 'impossible' | '';
      sitToSit: 'independent' | 'assisted' | 'impossible' | '';
    };
    balance: {
      sitting: 'independent' | 'assisted' | 'impossible' | '';
      standing: 'independent' | 'assisted' | 'impossible' | '';
      onOneLeg: 'independent' | 'assisted' | 'impossible' | '';
    };
    upperLimbFunctions: {
      grasp: {
        right: 'independent' | 'assisted' | 'impossible' | '';
        left: 'independent' | 'assisted' | 'impossible' | '';
      };
      release: {
        right: 'independent' | 'assisted' | 'impossible' | '';
        left: 'independent' | 'assisted' | 'impossible' | '';
      };
      fineManipulation: {
        right: 'independent' | 'assisted' | 'impossible' | '';
        left: 'independent' | 'assisted' | 'impossible' | '';
      };
      holding: {
        right: 'independent' | 'assisted' | 'impossible' | '';
        left: 'independent' | 'assisted' | 'impossible' | '';
      };
    };
    dailyLifeActivities: {
      dressingUpper: 'independent' | 'assisted' | 'impossible' | '';
      dressingLower: 'independent' | 'assisted' | 'impossible' | '';
      toileting: 'independent' | 'assisted' | 'impossible' | '';
      bathing: 'independent' | 'assisted' | 'impossible' | '';
      washing: 'independent' | 'assisted' | 'impossible' | '';
      eating: 'independent' | 'assisted' | 'impossible' | '';
      drinking: 'independent' | 'assisted' | 'impossible' | '';
    };
    assistedDevices: {
      withoutDevices: boolean;
      oneCrutch: { used: boolean; quality: 'good' | 'bad' | '' };
      pairOfCrutches: { used: boolean; quality: 'good' | 'bad' | '' };
      walkingFrame: { used: boolean; quality: 'good' | 'bad' | '' };
      wheelchair: { used: boolean; quality: 'good' | 'bad' | '' };
      orthosisRight: {
        used: boolean;
        quality: 'good' | 'bad' | '';
        type: 'FO' | 'AFO' | 'KAFO' | 'HKAFO' | 'shoeRaise' | '';
      };
      orthosisLeft: {
        used: boolean;
        quality: 'good' | 'bad' | '';
        type: 'FO' | 'AFO' | 'KAFO' | 'HKAFO' | 'shoeRaise' | '';
      };
    };
  };

  // Conclusion
  conclusion: {
    environmentalFactors: {
      personalConditions: string;
      livingConditions: string;
      medSocialStructures: string;
      currentTreatment: string;
      remarks: string;
    };
    bodyStructureImpairments: {
      assTraumaDiseases: string;
      romStatus: string;
      muscleStatus: string;
      skinSoftTissuesPain: string;
      cardioVascularStatus: string;
    };
    activityLimitationsParticipation: {
      generalMobility: string;
      transfers: string;
      balance: string;
      upperLimbFunctions: string;
      dailyLifeActivities: string;
    };
    referral: {
      referredTo: string;
      referralReasons: {
        medicalCare: boolean;
        medication: boolean;
        orthopaedicConsultation: boolean;
        orthopaedicSurgery: boolean;
        nursingCare: boolean;
        removeCast: boolean;
        stumpRevision: boolean;
        tenotomy: boolean;
        other: boolean;
        otherText?: string;
      };
    };
  };
}

// Union type for all form data
export type FormData = SOAPNoteFormData | MedicalHistoryFormData | ROMAssessmentFormData;
