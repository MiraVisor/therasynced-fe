import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getCookie, getDecodedToken, isTokenValid, removeCookie, setCookie } from '@/lib/utils';
import { RoleType, registerUserTypes } from '@/types/types';

import { loginApi, signUpUserApi } from '../api';

const decodedToken = typeof window !== 'undefined' ? getDecodedToken() : null;
const initialState: {
  isAuthenticated: boolean;
  token: string | null;
  role: RoleType | null;
} = {
  isAuthenticated: typeof window !== 'undefined' && isTokenValid(),
  token: typeof window !== 'undefined' ? getCookie('token') : null,
  role: (decodedToken?.role as RoleType) ?? null,
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
    checkAuth: (state) => {
      state.isAuthenticated = isTokenValid();
      if (!state.isAuthenticated) {
        state.token = null;
        state.role = null;
      }
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
          setCookie('token', token, { days: 7 });
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.role = null;
      });
  },
});

export const { logout, setRole, checkAuth } = authSlice.actions;
export default authSlice.reducer;
