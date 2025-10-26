import { createSlice } from '@reduxjs/toolkit';

import { Complaint } from '@/types/types';

import * as complaintApi from '../api/complaintApi';

interface ComplaintState {
  myComplaints: Complaint[];
  complaintsAgainstMe: Complaint[];
  selectedComplaint: Complaint | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: ComplaintState = {
  myComplaints: [],
  complaintsAgainstMe: [],
  selectedComplaint: null,
  isLoading: false,
  isCreating: false,
  error: null,
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearComplaints: (state) => {
      state.myComplaints = [];
      state.complaintsAgainstMe = [];
      state.selectedComplaint = null;
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create complaint
    builder
      .addCase(complaintApi.createComplaint.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(complaintApi.createComplaint.fulfilled, (state, action) => {
        state.isCreating = false;
        state.myComplaints.push(action.payload);
      })
      .addCase(complaintApi.createComplaint.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Get my complaints
    builder
      .addCase(complaintApi.getMyComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(complaintApi.getMyComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myComplaints = action.payload;
      })
      .addCase(complaintApi.getMyComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get complaints against me
    builder
      .addCase(complaintApi.getComplaintsAgainstMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(complaintApi.getComplaintsAgainstMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.complaintsAgainstMe = action.payload;
      })
      .addCase(complaintApi.getComplaintsAgainstMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get complaint details
    builder
      .addCase(complaintApi.getComplaintDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(complaintApi.getComplaintDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedComplaint = action.payload;
      })
      .addCase(complaintApi.getComplaintDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearComplaints, setSelectedComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
