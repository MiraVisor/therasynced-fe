import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import adminJobTitleService, {
  CreateJobTitleDto,
  JobTitleResponse,
  UpdateJobTitleDto,
} from '@/services/adminJobTitleService';

interface JobTitlesState {
  jobTitles: JobTitleResponse[];
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  stats: {
    totalJobTitles: number;
    activeJobTitles: number;
    inactiveJobTitles: number;
    mostPopularJobTitle: {
      id: string;
      name: string;
      freelancerCount: number;
    } | null;
  } | null;
  statsLoading: boolean;
}

const initialState: JobTitlesState = {
  jobTitles: [],
  loading: false,
  initialLoading: true,
  error: null,
  pagination: null,
  stats: null,
  statsLoading: false,
};

export const fetchJobTitles = createAsyncThunk(
  'jobTitles/fetchAll',
  async (
    params: { page?: number; limit?: number; name?: string; isActive?: boolean } | undefined,
    { rejectWithValue },
  ) => {
    try {
      const res = await adminJobTitleService.getAll(params);
      if (res.success) {
        return res;
      } else {
        return rejectWithValue(res.message || 'Failed to load job titles');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load job titles');
    }
  },
);

export const fetchJobTitlesStats = createAsyncThunk(
  'jobTitles/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminJobTitleService.getStatistics();
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to load stats');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load stats');
    }
  },
);

export const createJobTitle = createAsyncThunk(
  'jobTitles/create',
  async (data: CreateJobTitleDto, { rejectWithValue }) => {
    try {
      const res = await adminJobTitleService.create(data);
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to create job title');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to create job title');
    }
  },
);

export const updateJobTitle = createAsyncThunk(
  'jobTitles/update',
  async ({ id, data }: { id: string; data: UpdateJobTitleDto }, { rejectWithValue }) => {
    try {
      const res = await adminJobTitleService.update(id, data);
      if (res.success) {
        return { id, data: res.data };
      } else {
        return rejectWithValue(res.message || 'Failed to update job title');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update job title');
    }
  },
);

export const deleteJobTitle = createAsyncThunk(
  'jobTitles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await adminJobTitleService.delete(id);
      if (res.success) {
        return id;
      } else {
        return rejectWithValue(res.message || 'Failed to delete job title');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete job title');
    }
  },
);

const jobTitlesSlice = createSlice({
  name: 'jobTitles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setInitialLoading: (state, action) => {
      state.initialLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch job titles
      .addCase(fetchJobTitles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobTitles.fulfilled, (state, action) => {
        state.loading = false;
        state.initialLoading = false;
        state.jobTitles = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobTitles.rejected, (state, action) => {
        state.loading = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      })
      // Fetch stats
      .addCase(fetchJobTitlesStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchJobTitlesStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchJobTitlesStats.rejected, (state, action) => {
        state.statsLoading = false;
      })
      // Create job title
      .addCase(createJobTitle.fulfilled, (state, action) => {
        state.jobTitles.unshift(action.payload);
        if (state.pagination) {
          state.pagination.total += 1;
          state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
        }
        if (state.stats) {
          state.stats.totalJobTitles += 1;
          if (action.payload.isActive) {
            state.stats.activeJobTitles += 1;
          } else {
            state.stats.inactiveJobTitles += 1;
          }
        }
      })
      // Update job title
      .addCase(updateJobTitle.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.jobTitles.findIndex((jt) => jt.id === id);
        if (index !== -1) {
          const oldJobTitle = state.jobTitles[index];
          state.jobTitles[index] = { ...oldJobTitle, ...data };

          // Update stats if isActive changed
          if (
            state.stats &&
            data.isActive !== undefined &&
            data.isActive !== oldJobTitle.isActive
          ) {
            if (data.isActive) {
              state.stats.activeJobTitles += 1;
              state.stats.inactiveJobTitles -= 1;
            } else {
              state.stats.activeJobTitles -= 1;
              state.stats.inactiveJobTitles += 1;
            }
          }
        }
      })
      // Delete job title
      .addCase(deleteJobTitle.fulfilled, (state, action) => {
        const id = action.payload;
        state.jobTitles = state.jobTitles.filter((jt) => jt.id !== id);
        if (state.pagination) {
          state.pagination.total -= 1;
          state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
        }
        if (state.stats) {
          const deletedJobTitle = state.jobTitles.find((jt) => jt.id === id);
          if (deletedJobTitle) {
            state.stats.totalJobTitles -= 1;
            if (deletedJobTitle.isActive) {
              state.stats.activeJobTitles -= 1;
            } else {
              state.stats.inactiveJobTitles -= 1;
            }
          }
        }
      });
  },
});

export const { clearError, setInitialLoading } = jobTitlesSlice.actions;

export default jobTitlesSlice.reducer;
