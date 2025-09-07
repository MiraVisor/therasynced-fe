import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import { createService, deleteService, getServices, updateService } from '@/redux/api/serviceApi';
import { CreateServiceDto, Service } from '@/types/types';

// Async thunks
export const fetchServices = createAsyncThunk(
  'service/fetchServices',
  async (params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await getServices(params);
    return response;
  },
);

export const createServiceAsync = createAsyncThunk(
  'service/createService',
  async (data: CreateServiceDto) => {
    const response = await createService(data);
    return response;
  },
);

export const updateServiceAsync = createAsyncThunk(
  'service/updateService',
  async ({ id, data }: { id: string; data: Partial<CreateServiceDto> }) => {
    const response = await updateService(id, data);
    return response;
  },
);

export const deleteServiceAsync = createAsyncThunk('service/deleteService', async (id: string) => {
  const response = await deleteService(id);
  return { id, response };
});

// State interface
interface ServiceState {
  services: Service[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  selectedService: Service | null;
}

// Initial state
const initialState: ServiceState = {
  services: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  selectedService: null,
};

// Service slice
const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload.data || [];
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch services';
        toast.error('Failed to load services');
      });

    // Create service
    builder
      .addCase(createServiceAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createServiceAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        state.services.push(action.payload.data);
        toast.success('Service created successfully!');
      })
      .addCase(createServiceAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || 'Failed to create service';
        toast.error('Failed to create service');
      });

    // Update service
    builder
      .addCase(updateServiceAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateServiceAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.services.findIndex((service) => service.id === action.payload.data.id);
        if (index !== -1) {
          state.services[index] = action.payload.data;
        }
        toast.success('Service updated successfully!');
      })
      .addCase(updateServiceAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update service';
        toast.error('Failed to update service');
      });

    // Delete service
    builder
      .addCase(deleteServiceAsync.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteServiceAsync.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.services = state.services.filter((service) => service.id !== action.payload.id);
        toast.success('Service deleted successfully!');
      })
      .addCase(deleteServiceAsync.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || 'Failed to delete service';
        toast.error('Failed to delete service');
      });
  },
});

export const { setSelectedService, clearError, clearSelectedService } = serviceSlice.actions;
export default serviceSlice.reducer;
