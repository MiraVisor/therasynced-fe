export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    resetPassword: (token: string) => `/auth/reset-password/${token}`,
    verifyEmailLink: '/auth/verify-email-link',
  },
  freelancer: {
    all: '/freelancer/all',
    favorite: '/freelancer/favorite',
    favoriteAll: '/freelancer/favorite/all',
    recentFavorite: '/freelancer/favorite/recent',
  },
  slot: {
    create: '/slot/create',
    update: '/slot/update',
    delete: '/slot/delete',
    get: '/slot/get',
    list: '/slot/list',
    reserve: '/slot/reserve',
    bookedSlots: '/slot/booked-slots',
    checkExpired: '/slot/check-expired-reservations',
  },
  booking: {
    create: '/booking/create',
    cancel: '/booking/cancel',
    reschedule: '/booking/reschedule',
    // Patient endpoints
    patientAll: '/booking/patient/all',
    patientHistory: '/booking/patient/history',
    // Freelancer endpoints
    freelancerFuture: '/booking/freelancer/future',
    freelancerHistory: '/booking/freelancer/history',
    freelancerToday: '/booking/freelancer/today',
    freelancerByDate: '/booking/freelancer/appointments-by-date',
    // Admin endpoints
    adminHistory: '/booking/history/admin',
  },
  service: {
    list: '/service',
    create: '/service/create',
    update: '/service/update',
    delete: '/service/delete',
  },
  location: {
    list: '/location',
    create: '/location/create',
    update: '/location/update',
    delete: '/location/delete',
  },
} as const;

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
