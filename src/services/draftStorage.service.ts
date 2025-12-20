import api from './api';

export interface SlotNoteData {
  content: string;
}

/**
 * Slot Note API
 */
export const slotNoteService = {
  /**
   * Save or update slot note
   */
  async saveNote(slotId: string, data: SlotNoteData): Promise<void> {
    try {
      await api.post(`/slot/${slotId}/note`, data);
    } catch (error: unknown) {
      console.error('Failed to save slot note:', error);
      throw error;
    }
  },

  /**
   * Get slot note
   */
  async getNote(slotId: string): Promise<SlotNoteData | null> {
    try {
      const response = await api.get(`/slot/${slotId}/note`);
      return response.data.data || null; // Returns null if no note exists
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 404) {
          return null;
        }
      }
      console.error('Failed to get slot note:', error);
      throw error;
    }
  },

  /**
   * Update slot note
   */
  async updateNote(slotId: string, data: SlotNoteData): Promise<void> {
    try {
      await api.patch(`/slot/${slotId}/note`, data);
    } catch (error: unknown) {
      console.error('Failed to update slot note:', error);
      throw error;
    }
  },

  /**
   * Delete slot note
   */
  async deleteNote(slotId: string): Promise<void> {
    try {
      await api.delete(`/slot/${slotId}/note`);
    } catch (error: unknown) {
      console.error('Failed to delete slot note:', error);
      throw error;
    }
  },
};
