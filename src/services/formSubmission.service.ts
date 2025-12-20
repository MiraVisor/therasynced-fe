import {
  FormSubmission,
  FormSubmissionListResponse,
  FormSubmissionResponse,
  SubmitFormRequest,
  UpdateFormSubmissionRequest,
} from '@/types/formSubmission';

import api from './api';

/**
 * Form Submission API Service
 * Handles all API calls related to form submissions (final submissions, not drafts)
 */
export const formSubmissionService = {
  /**
   * Submit a form (final submission)
   * POST /api/v1/booking/{bookingId}/form
   */
  async submitForm(bookingId: string, request: SubmitFormRequest): Promise<FormSubmissionResponse> {
    try {
      const response = await api.post<FormSubmissionResponse>(`/api/v1/booking/${bookingId}/form`, {
        ...request,
        submittedAt: request.submittedAt || new Date().toISOString(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit form:', error);
      throw error;
    }
  },

  /**
   * Get all form submissions for a booking
   * GET /api/v1/booking/{bookingId}/forms
   */
  async getFormSubmissions(bookingId: string): Promise<FormSubmissionListResponse> {
    try {
      const response = await api.get<FormSubmissionListResponse>(
        `/api/v1/booking/${bookingId}/forms`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Return empty array if no submissions found
        return { data: [] };
      }
      console.error('Failed to get form submissions:', error);
      throw error;
    }
  },

  /**
   * Get a single form submission by ID
   * GET /api/v1/booking/{bookingId}/form/{formId}
   */
  async getFormSubmission(bookingId: string, formId: string): Promise<FormSubmissionResponse> {
    try {
      const response = await api.get<FormSubmissionResponse>(
        `/api/v1/booking/${bookingId}/form/${formId}`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to get form submission:', error);
      throw error;
    }
  },

  /**
   * Update an existing form submission
   * PATCH /api/v1/booking/{bookingId}/form/{formId}
   */
  async updateFormSubmission(
    bookingId: string,
    formId: string,
    request: UpdateFormSubmissionRequest,
  ): Promise<FormSubmissionResponse> {
    try {
      const response = await api.patch<FormSubmissionResponse>(
        `/api/v1/booking/${bookingId}/form/${formId}`,
        request,
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to update form submission:', error);
      throw error;
    }
  },

  /**
   * Delete a form submission
   * DELETE /api/v1/booking/{bookingId}/form/{formId}
   */
  async deleteFormSubmission(bookingId: string, formId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/booking/${bookingId}/form/${formId}`);
    } catch (error: any) {
      console.error('Failed to delete form submission:', error);
      throw error;
    }
  },
};
