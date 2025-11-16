export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    resetPassword: (token: string) => `/auth/reset-password/${token}`,
    verifyEmailLink: '/auth/verify-email-link',
    googleSignIn: '/auth/google-signin',
    sendVerificationEmail: '/auth/send-verification-email',
  },
  profile: {
    get: '/profile',
    update: '/profile',
    changePassword: '/profile/change-password',
    changeEmail: '/profile/change-email',
    delete: '/profile',
  },
  // User management
  // user: {
  //   profile: '/profile',
  //   password: '/user/password',
  // },
  // Slot management
  slots: {
    create: '/slot/create',
    list: '/slot/list',
    mySlots: '/slot/my-slots', // For freelancer's own slots
    bookedSlots: '/slot/booked-slots',
    available: (freelancerId: string) => `/slot/available/${freelancerId}`,
    update: (id: string) => `/slot/${id}`,
    delete: (id: string) => `/slot/${id}`,
    freelancer: (id: string) => `/slot/freelancer/${id}/available`,
  },
  // Service management
  services: {
    create: '/service/create',
    list: '/service',
    update: (id: string) => `/service/${id}`,
    delete: (id: string) => `/service/${id}`,
  },
  // Location management
  locations: {
    create: '/location/create',
    list: '/location',
    update: (id: string) => `/location/${id}`,
    delete: (id: string) => `/location/${id}`,
  },
  // Booking management
  bookings: {
    create: '/booking/create',
    reschedule: '/booking/reschedule',
    cancel: '/booking/cancel',
    updateNotes: (id: string) => `/booking/${id}/notes`,
    history: {
      admin: '/booking/history/admin',
      freelancer: '/booking/history/freelancer',
    },
    patientAll: '/booking/patient/all',
    patientHistory: '/booking/patient/history',
    freelancerFuture: '/booking/freelancer/future',
    freelancerHistory: '/booking/freelancer/history',
    freelancerToday: '/booking/freelancer/today',
    freelancerByDate: '/booking/freelancer/appointments-by-date',
    adminHistory: '/booking/history/admin',
  },
  freelancer: {
    all: '/freelancer/all',
    favorite: '/freelancer/favorite',
    favoriteAll: '/freelancer/favorite/all',
    recentFavorite: '/freelancer/favorite/recent',
    files: '/freelancer/files', // Get all uploaded files
  },
  // Dashboard endpoints
  dashboard: {
    freelancerOverview: '/dashboard/freelancer/overview',
  },
  // Chat/messaging endpoints
  chat: {
    contacts: '/chat/contacts',
    send: '/chat/send',
    messages: '/chat/messages',
    markRead: (messageId: string) => `/chat/messages/${messageId}/read`,
  },
  // Service categories endpoints
  serviceCategories: {
    getAll: '/service-categories',
    getByJobTitle: (jobTitle: string) => `/service-categories/${jobTitle}`,
  },
  // Job titles endpoints
  jobTitles: {
    getAll: '/service/job-titles',
  },
  // Certificate management endpoints
  certificate: {
    upload: '/freelancer/first-aid-certificate/upload',
    status: '/freelancer/first-aid-certificate/status',
  },
  // Verification document endpoints
  verification: {
    uploadDocument: '/freelancer/verification/upload-document',
    getDocuments: '/freelancer/verification/documents',
    deleteDocument: (docId: string) => `/freelancer/verification/document/${docId}`,
    status: '/freelancer/verification/status',
    requestVerification: '/freelancer/verification/request',
  },
  // Image upload endpoints
  image: {
    uploadSingle: '/image/upload/single',
    uploadVerificationDocument: '/image/upload/verification-document',
    uploadFirstAidCertificate: '/image/upload/first-aid-certificate',
    deleteSingle: (publicId: string) => `/image/delete/single/${publicId}`,
  },
  // Loyalty system endpoints
  loyalty: {
    profile: '/loyalty/profile',
    rewards: '/loyalty/rewards',
    redeem: '/loyalty/redeem',
    redemptions: '/loyalty/redemptions',
  },
  // Complaint system endpoints
  complaint: {
    create: '/complaint/create',
    myComplaints: '/complaint/my-complaints',
    againstMe: '/complaint/against-me',
    detail: (complaintId: string) => `/complaint/${complaintId}`,
  },
  // Service categories - public endpoints
  public: {
    jobTitles: '/service/job-titles',
    categories: '/service/categories',
    allCategories: '/categories/all',
    categoriesByJobTitle: (jobTitle: string) => `/service/categories/${jobTitle}`,
  },
  // Subscription endpoints
  subscription: {
    plans: '/subscription/plans',
    mySubscription: '/subscription/my-subscription',
    subscribe: '/subscription/subscribe',
    update: '/subscription/update',
    cancel: '/subscription/cancel',
    resume: '/subscription/resume',
    billingPortal: '/subscription/billing-portal',
    checkout: '/subscription/checkout',
  },
  // Admin endpoints
  admin: {
    // Job titles management
    jobTitles: {
      create: '/admin/job-titles',
      getAll: '/admin/job-titles',
      getActive: '/admin/job-titles/active',
      getById: (id: string) => `/admin/job-titles/${id}`,
      update: (id: string) => `/admin/job-titles/${id}`,
      delete: (id: string) => `/admin/job-titles/${id}`,
    },
    // Service categories management
    serviceCategories: {
      create: '/admin/service-categories',
      getAll: '/admin/service-categories',
      getGrouped: '/admin/service-categories/grouped',
      getByJobTitle: (jobTitleId: string) => `/admin/service-categories/job-title/${jobTitleId}`,
      getById: (id: string) => `/admin/service-categories/${id}`,
      update: (id: string) => `/admin/service-categories/${id}`,
      delete: (id: string) => `/admin/service-categories/${id}`,
    },
    // Verification management
    verification: {
      getPending: '/verification/admin/pending',
      getAll: '/verification/admin/all',
      getApproved: '/verification/admin/approved',
      getRejected: '/verification/admin/rejected',
      statistics: '/verification/admin/statistics',
      getDetails: (freelancerId: string) => `/freelancer/admin/verification/${freelancerId}`,
      approve: (freelancerId: string) => `/freelancer/admin/verification/${freelancerId}/approve`,
      reject: (freelancerId: string) => `/freelancer/admin/verification/${freelancerId}/reject`,
      getByStatus: (status: string) => `/freelancer/admin/verifications/all?status=${status}`,
      approveCertificate: (freelancerId: string) =>
        `/freelancer/admin/first-aid-certificate/${freelancerId}/approve`,
      rejectCertificate: (freelancerId: string) =>
        `/freelancer/admin/first-aid-certificate/${freelancerId}/reject`,
    },
    // Complaint management
    complaint: {
      getAll: '/complaint/admin/all',
      getPending: '/complaint/admin/pending',
      getUnderReview: '/complaint/admin/under-review',
      getResolved: '/complaint/admin/resolved',
      getDismissed: '/complaint/admin/dismissed',
      statistics: '/complaint/admin/statistics',
      getDetails: (complaintId: string) => `/complaint/admin/${complaintId}`,
      updateStatus: (complaintId: string) => `/complaint/admin/${complaintId}/status`,
      takeAction: (complaintId: string) => `/complaint/admin/${complaintId}/action`,
    },
    // Subscription management
    subscription: {
      getAll: '/admin/subscriptions',
      getStats: '/admin/subscriptions/stats',
      getUserSubscription: (userId: string) => `/admin/subscriptions/user/${userId}`,
      overrideAccess: (userId: string) => `/admin/subscriptions/user/${userId}/override`,
    },
    // Overview management
    overview: {
      get: '/admin/overview',
    },
    // Bookings management
    bookings: {
      getStats: '/admin/bookings/stats',
      getAll: '/admin/bookings',
    },
    // Finance management
    finance: {
      getRevenue: '/admin/finance/revenue',
      getSubscriptions: '/admin/finance/subscriptions',
    },
  },
};

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
