import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getProfile } from '@/redux/api/profileApi';
import { JobTitle } from '@/types/types';

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  gender: string;
  dob: string;
  city: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  role?: string;
  mainJobTitle?: JobTitle;
  mainJobTitleId?: string;
  clinicAddress?: string;
  allowPreBookingMessages?: boolean;
  description?: string; // Bio/Description for freelancers
}

interface ProfileState {
  data: UserProfile | null;
  loading: boolean;
  backgroundRefreshing: boolean;
  initialLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  backgroundRefreshing: false,
  initialLoading: false,
  error: null,
  lastFetched: null,
};

// Thunk for fetching profile data
export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (options: { silent?: boolean; jobTitles?: JobTitle[] } = {}, { rejectWithValue }) => {
    try {
      const response = await getProfile();

      if (!response || !response.success || !response.data || !response.data.user) {
        throw new Error('Invalid profile data received from server');
      }

      const userData = response.data.user;

      if (!userData || !userData.id) {
        throw new Error('Profile data is incomplete');
      }

      // Handle DOB without timezone conversion
      let formattedDob = '';
      if (userData.dob) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(userData.dob)) {
          formattedDob = userData.dob;
        } else {
          try {
            const date = new Date(userData.dob);
            if (!isNaN(date.getTime())) {
              const isoString = date.toISOString();
              formattedDob = isoString.split('T')[0];
            }
          } catch (error) {
            // Ignore date parsing errors
          }
        }
      }

      const profileData: UserProfile = {
        id: userData.id,
        name: userData.name || '',
        email: userData.email || '',
        profilePicture: userData.profilePicture,
        gender: userData.gender || '',
        dob: formattedDob,
        city: userData.city || '',
        isEmailVerified: userData.isEmailVerified || false,
        isActive: true,
        role: userData.role || '',
        mainJobTitleId: userData.mainJobTitle?.id,
        mainJobTitle: userData.mainJobTitle,
        clinicAddress: userData.clinicAddress || '',
        allowPreBookingMessages: userData.allowPreBookingMessages,
        description: userData.description || '',
      };

      return { data: profileData, silent: options.silent };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
      return rejectWithValue(errorMessage);
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfileData: (state) => {
      state.data = null;
      state.loading = false;
      state.backgroundRefreshing = false;
      state.initialLoading = false;
      state.error = null;
      state.lastFetched = null;
    },
    updateProfileData: (state, action) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    updateMainJobTitle: (state, action) => {
      if (state.data) {
        state.data.mainJobTitle = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (silent && state.data) {
          state.backgroundRefreshing = true;
        } else {
          state.loading = true;
          if (!state.data) {
            state.initialLoading = true;
          }
        }
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.data = action.payload.data;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.backgroundRefreshing = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearProfileData, updateProfileData, updateMainJobTitle } =
  profileSlice.actions;

export default profileSlice.reducer;
