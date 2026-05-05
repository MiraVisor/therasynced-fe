import { JobTitleEnum } from '@/types/types';

// Service categories for each job title
export const SERVICE_CATEGORIES = {
  [JobTitleEnum.PHYSIOTHERAPY]: [
    'Sports massage',
    'Injury assessment & diagnosis',
    'Sports injury rehabilitation',
    'Post-operative rehabilitation',
    'Back & neck pain management',
    'Chronic pain management',
    'Neurological rehabilitation',
    'Pre- and post-natal physiotherapy',
    'Postural correction & ergonomics advice',
    'Home visit physiotherapy',
    'Dry needling / acupuncture (if qualified)',
  ],
  [JobTitleEnum.ATHLETIC_THERAPY]: [
    'Sports injury assessment',
    'Athletic performance enhancement',
    'Concussion management',
    'Return to sport protocols',
    'Movement analysis & correction',
    'Strength & conditioning integration',
    'Injury prevention programs',
    'Sports-specific rehabilitation',
    'Equipment fitting & modification',
    'Emergency care on field',
  ],
  [JobTitleEnum.MASSAGE_THERAPY]: [
    'Swedish massage',
    'Deep tissue massage',
    'Sports massage',
    'Trigger point therapy',
    'Myofascial release',
    'Prenatal massage',
    'Hot stone massage',
    'Aromatherapy massage',
    'Reflexology',
    'Lymphatic drainage',
    'Therapeutic massage',
  ],
  [JobTitleEnum.STRENGTH_AND_CONDITIONING_COACHING]: [
    'Group fitness classes',
    'Strength training programs',
    'Conditioning & cardio',
    'Functional movement training',
    'Sport-specific conditioning',
    'Injury prevention training',
    'Post-rehabilitation training',
    'Performance testing & assessment',
    'Equipment training',
  ],
  [JobTitleEnum.PERSONAL_TRAINING]: [
    'Personal training',
    '1:1 coaching sessions',
    'Tailored fitness programmes',
    'Weight loss coaching',
    'Strength & toning',
    'Beginner-friendly training',
    'Mobility & flexibility',
    'Nutrition guidance',
    'Home or gym sessions',
  ],
} as const;

// Helper function to get categories for a specific job title
export const getCategoriesForJobTitle = (jobTitle: JobTitleEnum): string[] => {
  return [...(SERVICE_CATEGORIES[jobTitle] || [])];
};

// Get all available categories
export const getAllCategories = (): string[] => {
  return Object.values(SERVICE_CATEGORIES)
    .flat()
    .map((cat) => String(cat));
};

// Get job title from category (reverse lookup)
export const getJobTitleFromCategory = (category: string): JobTitleEnum | null => {
  for (const [jobTitle, categories] of Object.entries(SERVICE_CATEGORIES)) {
    if ((categories as readonly string[]).includes(category)) {
      return jobTitle as JobTitleEnum;
    }
  }
  return null;
};

// Job title display information
export const JOB_TITLE_INFO = {
  [JobTitleEnum.PHYSIOTHERAPY]: {
    displayName: 'Physiotherapy',
    description: 'Physical therapy and rehabilitation services',
    icon: '🏥',
    color: 'blue',
  },
  [JobTitleEnum.ATHLETIC_THERAPY]: {
    displayName: 'Athletic Therapy',
    description: 'Sports injury treatment and athletic performance',
    icon: '🏃‍♂️',
    color: 'green',
  },
  [JobTitleEnum.MASSAGE_THERAPY]: {
    displayName: 'Massage Therapy',
    description: 'Therapeutic massage and bodywork services',
    icon: '💆‍♀️',
    color: 'purple',
  },
  [JobTitleEnum.STRENGTH_AND_CONDITIONING_COACHING]: {
    displayName: 'Strength & Conditioning',
    description: 'Sports performance and conditioning coaching',
    icon: '💪',
    color: 'orange',
  },
  [JobTitleEnum.PERSONAL_TRAINING]: {
    displayName: 'Personal Training',
    description: '1:1 fitness coaching tailored to your goals',
    icon: '🏋️',
    color: 'red',
  },
} as const;

// Export all job titles as an array for easy iteration
export const ALL_JOB_TITLES = Object.values(JobTitleEnum);
