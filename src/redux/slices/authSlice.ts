import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getCookie, removeCookie, setCookie } from '@/lib/utils';
import { RoleType, registerUserTypes } from '@/types/types';

import { loginApi, signUpUserApi } from '../api';

const initialState: {
  isAuthenticated: boolean;
  token: string | null;
  role: RoleType | null;
} = {
  isAuthenticated: typeof window !== 'undefined' && !!getCookie('token'),
  token: typeof window !== 'undefined' ? getCookie('token') : null,
  role: null, // Role will be fetched from server on each request
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      return response?.data;
    } catch (err: unknown) {
      return rejectWithValue(err || 'Something went wrong');
    }
  },
);

export const signUpUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: registerUserTypes, { rejectWithValue }) => {
    try {
      const data = await signUpUserApi(credentials);
      return data;
    } catch (err: any) {
      return rejectWithValue(err || 'Something went wrong');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.role = null;
      if (typeof window !== 'undefined') {
        removeCookie('token');
      }
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, () => {})
      .addCase(loginUser.fulfilled, (state, action) => {
        const token = action.payload.data.token;
        const role = action.payload.data.user.role;

        state.token = token;
        state.role = role;
        state.isAuthenticated = true;

        if (typeof window !== 'undefined') {
          setCookie('token', token);
        }
      })

      .addCase(loginUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.role = null;
      });
  },
});

export const { logout, setRole } = authSlice.actions;
export default authSlice.reducer;
