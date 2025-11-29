/**
 * Mock data for testing the search functionality
 * This matches the structure returned by /api/v1/freelancer/search
 */

export const mockSearchResponse = {
  success: true,
  message: 'Freelancers retrieved successfully',
  data: [
    {
      id: 'freelancer-1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      description:
        'Experienced therapist specializing in anxiety and depression. Over 10 years of experience helping clients overcome mental health challenges.',
      mainJobTitle: {
        id: 'jt-1',
        name: 'Psychologist',
      },
      services: [
        {
          id: 'svc-1',
          name: 'Individual Therapy',
          isActive: true,
        },
        {
          id: 'svc-2',
          name: 'Anxiety Treatment',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.8,
        patientStories: 45,
        mainService: 'Anxiety Therapy',
        name: 'Dr. Sarah Johnson',
      },
      pricing: {
        online: { min: 80, max: 120 },
        office: { min: 100, max: 150 },
        home: { min: 120, max: 180 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'GOLD',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 8,
        totalSlots: 20,
      },
      slots: [],
      city: 'New York',
      locations: [{ name: 'Manhattan Office', type: 'CLINIC' }],
      createdAt: '2020-01-15T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com',
      description:
        'Licensed clinical psychologist with 10 years experience in couples therapy and relationship counseling.',
      mainJobTitle: {
        id: 'jt-1',
        name: 'Psychologist',
      },
      services: [
        {
          id: 'svc-3',
          name: 'Couples Therapy',
          isActive: true,
        },
        {
          id: 'svc-4',
          name: 'Relationship Counseling',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.9,
        patientStories: 67,
        mainService: 'Couples Counseling',
        name: 'Dr. Michael Chen',
      },
      pricing: {
        online: { min: 90, max: 130 },
        office: { min: 110, max: 160 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'GOLD',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 12,
        totalSlots: 25,
      },
      slots: [],
      city: 'Los Angeles',
      locations: [{ name: 'Beverly Hills Clinic', type: 'CLINIC' }],
      createdAt: '2019-06-20T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-3',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      description:
        'Specialized in trauma therapy and EMDR. Bilingual therapist fluent in English and Spanish.',
      mainJobTitle: {
        id: 'jt-2',
        name: 'Therapist',
      },
      services: [
        {
          id: 'svc-5',
          name: 'Trauma Therapy',
          isActive: true,
        },
        {
          id: 'svc-6',
          name: 'EMDR Therapy',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.7,
        patientStories: 32,
        mainService: 'Trauma Recovery',
        name: 'Dr. Emily Rodriguez',
      },
      pricing: {
        online: { min: 75, max: 110 },
        office: { min: 95, max: 140 },
        home: { min: 110, max: 160 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'SILVER',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 5,
        totalSlots: 15,
      },
      slots: [],
      city: 'Chicago',
      locations: [{ name: 'Downtown Office', type: 'CLINIC' }],
      createdAt: '2021-03-10T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-4',
      name: 'Dr. James Wilson',
      email: 'james.wilson@example.com',
      description:
        'Child and adolescent psychologist with expertise in ADHD and behavioral therapy.',
      mainJobTitle: {
        id: 'jt-1',
        name: 'Psychologist',
      },
      services: [
        {
          id: 'svc-7',
          name: 'Child Therapy',
          isActive: true,
        },
        {
          id: 'svc-8',
          name: 'ADHD Treatment',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.6,
        patientStories: 28,
        mainService: 'Child Psychology',
        name: 'Dr. James Wilson',
      },
      pricing: {
        online: { min: 85, max: 125 },
        office: { min: 105, max: 155 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'PENDING',
      planFeatures: {
        planType: 'SILVER',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 15,
        totalSlots: 30,
      },
      slots: [],
      city: 'Houston',
      locations: [{ name: 'Medical Center', type: 'CLINIC' }],
      createdAt: '2020-09-05T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-5',
      name: 'Dr. Lisa Anderson',
      email: 'lisa.anderson@example.com',
      description:
        'Addiction specialist and substance abuse counselor with 15 years of experience.',
      mainJobTitle: {
        id: 'jt-3',
        name: 'Counselor',
      },
      services: [
        {
          id: 'svc-9',
          name: 'Addiction Counseling',
          isActive: true,
        },
        {
          id: 'svc-10',
          name: 'Substance Abuse Therapy',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.9,
        patientStories: 89,
        mainService: 'Addiction Recovery',
        name: 'Dr. Lisa Anderson',
      },
      pricing: {
        online: { min: 70, max: 100 },
        office: { min: 90, max: 130 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'GOLD',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 20,
        totalSlots: 35,
      },
      slots: [],
      city: 'Phoenix',
      locations: [{ name: 'Recovery Center', type: 'CLINIC' }],
      createdAt: '2018-11-12T00:00:00Z',
      favoritedBy: [],
      isFavorite: true,
    },
    {
      id: 'freelancer-6',
      name: 'Dr. Robert Taylor',
      email: 'robert.taylor@example.com',
      description: 'Cognitive behavioral therapist specializing in depression and mood disorders.',
      mainJobTitle: {
        id: 'jt-1',
        name: 'Psychologist',
      },
      services: [
        {
          id: 'svc-11',
          name: 'CBT Therapy',
          isActive: true,
        },
        {
          id: 'svc-12',
          name: 'Depression Treatment',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.5,
        patientStories: 41,
        mainService: 'CBT Therapy',
        name: 'Dr. Robert Taylor',
      },
      pricing: {
        online: { min: 80, max: 115 },
        office: { min: 100, max: 145 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'BRONZE',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 3,
        totalSlots: 10,
      },
      slots: [],
      city: 'Philadelphia',
      locations: [{ name: 'Center City Office', type: 'CLINIC' }],
      createdAt: '2022-01-20T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-7',
      name: 'Dr. Maria Garcia',
      email: 'maria.garcia@example.com',
      description: 'Family therapist with expertise in family dynamics and communication.',
      mainJobTitle: {
        id: 'jt-2',
        name: 'Therapist',
      },
      services: [
        {
          id: 'svc-13',
          name: 'Family Therapy',
          isActive: true,
        },
        {
          id: 'svc-14',
          name: 'Group Therapy',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.8,
        patientStories: 56,
        mainService: 'Family Counseling',
        name: 'Dr. Maria Garcia',
      },
      pricing: {
        online: { min: 90, max: 130 },
        office: { min: 110, max: 160 },
        home: { min: 130, max: 190 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'SILVER',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 10,
        totalSlots: 22,
      },
      slots: [],
      city: 'San Antonio',
      locations: [{ name: 'Family Center', type: 'CLINIC' }],
      createdAt: '2020-07-18T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-8',
      name: 'Dr. David Kim',
      email: 'david.kim@example.com',
      description:
        'Specialist in eating disorders and body image issues. Certified in DBT therapy.',
      mainJobTitle: {
        id: 'jt-1',
        name: 'Psychologist',
      },
      services: [
        {
          id: 'svc-15',
          name: 'Eating Disorder Therapy',
          isActive: true,
        },
        {
          id: 'svc-16',
          name: 'DBT Therapy',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.7,
        patientStories: 38,
        mainService: 'Eating Disorder Treatment',
        name: 'Dr. David Kim',
      },
      pricing: {
        online: { min: 95, max: 135 },
        office: { min: 115, max: 165 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'GOLD',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 7,
        totalSlots: 18,
      },
      slots: [],
      city: 'San Diego',
      locations: [{ name: 'Coastal Therapy Center', type: 'CLINIC' }],
      createdAt: '2019-12-03T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-9',
      name: 'Dr. Jennifer White',
      email: 'jennifer.white@example.com',
      description: 'Grief counselor and specialist in loss and bereavement therapy.',
      mainJobTitle: {
        id: 'jt-2',
        name: 'Therapist',
      },
      services: [
        {
          id: 'svc-17',
          name: 'Grief Counseling',
          isActive: true,
        },
        {
          id: 'svc-18',
          name: 'Bereavement Therapy',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.6,
        patientStories: 24,
        mainService: 'Grief Counseling',
        name: 'Dr. Jennifer White',
      },
      pricing: {
        online: { min: 75, max: 105 },
        office: { min: 95, max: 135 },
      },
      verificationStatus: 'PENDING',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'BRONZE',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 4,
        totalSlots: 12,
      },
      slots: [],
      city: 'Dallas',
      locations: [{ name: 'Healing Center', type: 'CLINIC' }],
      createdAt: '2021-08-25T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-10',
      name: 'Dr. Thomas Brown',
      email: 'thomas.brown@example.com',
      description: 'Sports psychologist working with athletes on performance and mental health.',
      mainJobTitle: {
        id: 'jt-1',
        name: 'Psychologist',
      },
      services: [
        {
          id: 'svc-19',
          name: 'Sports Psychology',
          isActive: true,
        },
        {
          id: 'svc-20',
          name: 'Performance Coaching',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.9,
        patientStories: 72,
        mainService: 'Sports Psychology',
        name: 'Dr. Thomas Brown',
      },
      pricing: {
        online: { min: 100, max: 150 },
        office: { min: 120, max: 180 },
        home: { min: 140, max: 200 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'GOLD',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 18,
        totalSlots: 40,
      },
      slots: [],
      city: 'Miami',
      locations: [{ name: 'Athletic Performance Center', type: 'CLINIC' }],
      createdAt: '2018-04-14T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-11',
      name: 'Dr. Amanda Lee',
      email: 'amanda.lee@example.com',
      description: 'LGBTQ+ affirming therapist specializing in identity and relationship issues.',
      mainJobTitle: {
        id: 'jt-2',
        name: 'Therapist',
      },
      services: [
        {
          id: 'svc-21',
          name: 'LGBTQ+ Therapy',
          isActive: true,
        },
        {
          id: 'svc-22',
          name: 'Identity Counseling',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.8,
        patientStories: 51,
        mainService: 'LGBTQ+ Counseling',
        name: 'Dr. Amanda Lee',
      },
      pricing: {
        online: { min: 85, max: 125 },
        office: { min: 105, max: 155 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'SILVER',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 9,
        totalSlots: 20,
      },
      slots: [],
      city: 'Seattle',
      locations: [{ name: 'Rainbow Therapy Center', type: 'CLINIC' }],
      createdAt: '2020-05-22T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
    {
      id: 'freelancer-12',
      name: 'Dr. Christopher Martinez',
      email: 'christopher.martinez@example.com',
      description:
        'Neuropsychologist specializing in cognitive assessment and brain injury recovery.',
      mainJobTitle: {
        id: 'jt-1',
        name: 'Psychologist',
      },
      services: [
        {
          id: 'svc-23',
          name: 'Neuropsychology',
          isActive: true,
        },
        {
          id: 'svc-24',
          name: 'Cognitive Assessment',
          isActive: true,
        },
      ],
      cardInfo: {
        averageRating: 4.7,
        patientStories: 43,
        mainService: 'Neuropsychology',
        name: 'Dr. Christopher Martinez',
      },
      pricing: {
        online: { min: 110, max: 160 },
        office: { min: 130, max: 190 },
      },
      verificationStatus: 'APPROVED',
      firstAidCertificateStatus: 'APPROVED',
      planFeatures: {
        planType: 'GOLD',
      },
      subscriptionStatus: {
        isTrial: false,
        isExpiredTrial: false,
        canAcceptBookings: true,
      },
      slotSummary: {
        availableSlots: 6,
        totalSlots: 16,
      },
      slots: [],
      city: 'Boston',
      locations: [{ name: 'Neurological Center', type: 'CLINIC' }],
      createdAt: '2019-02-11T00:00:00Z',
      favoritedBy: [],
      isFavorite: false,
    },
  ],
  pagination: {
    page: 1,
    limit: 12,
    total: 47,
    totalPages: 4,
    hasNext: true,
    hasPrev: false,
  },
  meta: {
    timestamp: '2024-01-15T10:30:00Z',
    path: '/api/v1/freelancer/search',
  },
};

// Mock data for page 2 (next 12 freelancers)
export const mockSearchResponsePage2 = {
  ...mockSearchResponse,
  data: [
    // ... 12 more freelancers (13-24)
  ],
  pagination: {
    page: 2,
    limit: 12,
    total: 47,
    totalPages: 4,
    hasNext: true,
    hasPrev: true,
  },
};

// Mock data for last page (remaining 11 freelancers)
export const mockSearchResponsePage4 = {
  ...mockSearchResponse,
  data: [
    // ... 11 more freelancers (37-47)
  ],
  pagination: {
    page: 4,
    limit: 12,
    total: 47,
    totalPages: 4,
    hasNext: false,
    hasPrev: true,
  },
};

// Mock empty search result
export const mockEmptySearchResponse = {
  success: true,
  message: 'No freelancers found matching your criteria',
  data: [],
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  meta: {
    timestamp: '2024-01-15T10:30:00Z',
    path: '/api/v1/freelancer/search',
  },
};
