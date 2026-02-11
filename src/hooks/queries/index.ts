// Auth hooks
export * from './useAuth';

// Profile hooks
export * from './useProfile';

// Booking hooks
export * from './useBookings';

// Freelancer hooks
export * from './useFreelancers';

// Slot hooks
export * from './useSlots';

// Service hooks
export * from './useServices';

// Job Title hooks - export from useJobTitles (non-admin version)
// Note: useAdmin also exports useJobTitles, but we prefer the non-admin version
export { useJobTitles } from './useJobTitles';

// Service Category hooks - export from useServiceCategories (non-admin version)
// Note: useAdmin also exports useServiceCategories, but we prefer the non-admin version
export { useServiceCategories } from './useServiceCategories';

// Subscription hooks
export * from './useSubscription';

// Complaint hooks
export * from './useComplaints';

// Explore hooks - exclude useFavoriteFreelancers to avoid conflict with useFreelancers
export { useRecentFavoriteFreelancer, useExplorePatientBookings } from './useExplore';

// Rating hooks
export * from './useRatings';

// Verification hooks
export * from './useVerification';

// Certificate hooks
export * from './useCertificate';

// Chat hooks
export * from './useChat';

// Admin hooks - export all, including the admin versions of useJobTitles, useServiceCategories, etc.
export * from './useAdmin';

// Data Rights hooks
export * from './useDataRights';
