import { bookingFormDraftService, slotNoteService } from '@/services/draftStorage.service';

/**
 * One-time migration script to move localStorage drafts to backend
 * Run this once after deploying the new backend
 */
export async function migrateLocalStorageDrafts() {
  const migrated: string[] = [];
  const errors: Array<{ key: string; error: Error }> = [];

  if (typeof window === 'undefined') {
    return { migrated, errors };
  }

  // Migrate booking form drafts
  const formDataKeys = Object.keys(localStorage).filter((key) => key.startsWith('formData_'));

  for (const key of formDataKeys) {
    try {
      const bookingId = key.replace('formData_', '');
      const storedData = localStorage.getItem(key);

      if (!storedData) continue;

      const formData = JSON.parse(storedData) as Record<string, unknown>;

      if (formData && Object.keys(formData).length > 0) {
        // Handle both formats
        const draftFormData = (formData.formData as Record<string, unknown>) ?? formData;
        const formType = formData.formType as string | undefined;
        const savedAt = formData.savedAt as string | undefined;

        await bookingFormDraftService.saveDraft(bookingId, {
          formData: draftFormData,
          formType,
          metadata: {
            migrated: true,
            migratedAt: new Date().toISOString(),
            originalSavedAt: savedAt,
          },
        });
        migrated.push(key);
        // Remove after successful migration
        localStorage.removeItem(key);
      }
    } catch (error) {
      errors.push({ key, error: error as Error });
    }
  }

  // Migrate slot notes
  const noteKeys = Object.keys(localStorage).filter((key) => key.startsWith('slot_notes_'));

  for (const key of noteKeys) {
    try {
      const slotId = key.replace('slot_notes_', '');
      const content = localStorage.getItem(key) ?? '';

      if (content.length > 0) {
        await slotNoteService.saveNote(slotId, { content });
        migrated.push(key);
        // Remove after successful migration
        localStorage.removeItem(key);
      }
    } catch (error) {
      errors.push({ key, error: error as Error });
    }
  }

  // Migration completed - errors are returned in the response
  // Logging is handled by the caller if needed

  return { migrated, errors };
}

/**
 * Check if localStorage has drafts that need migration
 */
export function hasLocalStorageDrafts(): boolean {
  if (typeof window === 'undefined') return false;

  return Object.keys(localStorage).some(
    (key) => key.startsWith('formData_') || key.startsWith('slot_notes_'),
  );
}
