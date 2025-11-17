import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import adminServiceCategoryService, {
  CreateServiceCategoryDto,
  ServiceCategoryResponse,
  UpdateServiceCategoryDto,
} from '@/services/adminServiceCategoryService';

interface ServiceCategoriesState {
  serviceCategories: ServiceCategoryResponse[];
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
    totalServiceCategories: number;
    activeServiceCategories: number;
    inactiveServiceCategories: number;
    jobTitleWithMostCategories: {
      jobTitleId: string;
      jobTitleName: string;
      categoryCount: number;
    } | null;
  } | null;
  statsLoading: boolean;
}

const initialState: ServiceCategoriesState = {
  serviceCategories: [],
  loading: false,
  initialLoading: true,
  error: null,
  pagination: null,
  stats: null,
  statsLoading: false,
};

export const fetchServiceCategories = createAsyncThunk(
  'serviceCategories/fetchAll',
  async (
    params: { page?: number; limit?: number; name?: string; isActive?: boolean } | undefined,
    { rejectWithValue },
  ) => {
    try {
      const res = await adminServiceCategoryService.getAll(params);
      if (res.success) {
        return res;
      } else {
        return rejectWithValue(res.message || 'Failed to load service categories');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load service categories');
    }
  },
);

export const fetchServiceCategoriesStats = createAsyncThunk(
  'serviceCategories/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminServiceCategoryService.getStats();
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

export const createServiceCategory = createAsyncThunk(
  'serviceCategories/create',
  async (data: CreateServiceCategoryDto, { rejectWithValue }) => {
    try {
      const res = await adminServiceCategoryService.create(data);
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to create service category');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to create service category');
    }
  },
);

export const updateServiceCategory = createAsyncThunk(
  'serviceCategories/update',
  async ({ id, data }: { id: string; data: UpdateServiceCategoryDto }, { rejectWithValue }) => {
    try {
      const res = await adminServiceCategoryService.update(id, data);
      if (res.success) {
        return { id, data: res.data };
      } else {
        return rejectWithValue(res.message || 'Failed to update service category');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update service category');
    }
  },
);

export const deleteServiceCategory = createAsyncThunk(
  'serviceCategories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await adminServiceCategoryService.delete(id);
      if (res.success) {
        return id;
      } else {
        return rejectWithValue(res.message || 'Failed to delete service category');
      }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete service category');
    }
  },
);

const serviceCategoriesSlice = createSlice({
  name: 'serviceCategories',
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
      // Fetch service categories
      .addCase(fetchServiceCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.initialLoading = false;
        state.serviceCategories = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchServiceCategories.rejected, (state, action) => {
        state.loading = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      })
      // Fetch stats
      .addCase(fetchServiceCategoriesStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchServiceCategoriesStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchServiceCategoriesStats.rejected, (state, action) => {
        state.statsLoading = false;
      })
      // Create service category
      .addCase(createServiceCategory.fulfilled, (state, action) => {
        state.serviceCategories.unshift(action.payload);
        if (state.pagination) {
          state.pagination.total += 1;
          state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
        }
        if (state.stats) {
          state.stats.totalServiceCategories += 1;
          if (action.payload.isActive) {
            state.stats.activeServiceCategories += 1;
          } else {
            state.stats.inactiveServiceCategories += 1;
          }
        }
      })
      // Update service category
      .addCase(updateServiceCategory.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.serviceCategories.findIndex((sc) => sc.id === id);
        if (index !== -1) {
          const oldCategory = state.serviceCategories[index];
          state.serviceCategories[index] = { ...oldCategory, ...data };

          // Update stats if isActive changed
          if (
            state.stats &&
            data.isActive !== undefined &&
            data.isActive !== oldCategory.isActive
          ) {
            if (data.isActive) {
              state.stats.activeServiceCategories += 1;
              state.stats.inactiveServiceCategories -= 1;
            } else {
              state.stats.activeServiceCategories -= 1;
              state.stats.inactiveServiceCategories += 1;
            }
          }
        }
      })
      // Delete service category
      .addCase(deleteServiceCategory.fulfilled, (state, action) => {
        const id = action.payload;
        state.serviceCategories = state.serviceCategories.filter((sc) => sc.id !== id);
        if (state.pagination) {
          state.pagination.total -= 1;
          state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
        }
        if (state.stats) {
          const deletedCategory = state.serviceCategories.find((sc) => sc.id === id);
          if (deletedCategory) {
            state.stats.totalServiceCategories -= 1;
            if (deletedCategory.isActive) {
              state.stats.activeServiceCategories -= 1;
            } else {
              state.stats.inactiveServiceCategories -= 1;
            }
          }
        }
      });
  },
});

export const { clearError, setInitialLoading } = serviceCategoriesSlice.actions;

export default serviceCategoriesSlice.reducer;
