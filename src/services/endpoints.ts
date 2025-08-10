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
  },
};

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
