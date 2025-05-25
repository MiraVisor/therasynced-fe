import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { loginApi, signUpUserApi } from "../api";
import { registerUserTypes } from "@/types/types";

const initialState: {
  isAuthenticated: boolean;
  token: string | null;
} = {
  isAuthenticated:
    typeof window !== "undefined" && localStorage.getItem("token")
      ? true
      : false,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await loginApi(credentials);

      return data;
    } catch (err: unknown) {
      return rejectWithValue(err || "Something went wrong");
    }
  }
);
export const signUpUser = createAsyncThunk(
  "auth/registerUser",
  async (credentials: registerUserTypes, { rejectWithValue }) => {
    try {
      const data = await signUpUserApi(credentials);

      return data;
    } catch (err: any) {
      return rejectWithValue(err || "Something went wrong");
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, () => {})
      .addCase(loginUser.fulfilled, (state, action) => {
        const token = action.payload.data.access_token;
        state.token = token;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
