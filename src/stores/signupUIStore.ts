import { create } from 'zustand';

interface SignupUIState {
  // UI state
  showPassword: boolean;
  showConfirmPassword: boolean;
  authMethod: 'email' | 'oauth' | null;
  isGoogleLoading: boolean;
  isRequestingLocation: boolean;
  locationPermissionGranted: boolean;

  // Actions
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setAuthMethod: (method: 'email' | 'oauth' | null) => void;
  setIsGoogleLoading: (loading: boolean) => void;
  setIsRequestingLocation: (requesting: boolean) => void;
  setLocationPermissionGranted: (granted: boolean) => void;

  // Reset
  resetSignupUI: () => void;
}

const initialState = {
  showPassword: false,
  showConfirmPassword: false,
  authMethod: null,
  isGoogleLoading: false,
  isRequestingLocation: false,
  locationPermissionGranted: false,
};

export const useSignupUIStore = create<SignupUIState>((set) => ({
  ...initialState,

  setShowPassword: (show) => set({ showPassword: show }),

  setShowConfirmPassword: (show) => set({ showConfirmPassword: show }),

  setAuthMethod: (method) => set({ authMethod: method }),

  setIsGoogleLoading: (loading) => set({ isGoogleLoading: loading }),

  setIsRequestingLocation: (requesting) => set({ isRequestingLocation: requesting }),

  setLocationPermissionGranted: (granted) => set({ locationPermissionGranted: granted }),

  resetSignupUI: () => set(initialState),
}));
