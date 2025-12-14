import { bookingFormDraftService } from '@/services/draftStorage.service';
import { slotNoteService } from '@/services/draftStorage.service';

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

      const formData = JSON.parse(storedData);

      if (formData && Object.keys(formData).length > 0) {
        await bookingFormDraftService.saveDraft(bookingId, {
          formData: formData.formData || formData, // Handle both formats
          formType: formData.formType,
          metadata: {
            migrated: true,
            migratedAt: new Date().toISOString(),
            originalSavedAt: formData.savedAt,
          },
        });
        migrated.push(key);
        localStorage.removeItem(key); // Remove after successful migration
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
      const content = localStorage.getItem(key) || '';

      if (content.length > 0) {
        await slotNoteService.saveNote(slotId, { content });
        migrated.push(key);
        localStorage.removeItem(key); // Remove after successful migration
      }
    } catch (error) {
      errors.push({ key, error: error as Error });
    }
  }

  console.log(`Migrated ${migrated.length} items`);
  if (errors.length > 0) {
    console.error('Migration errors:', errors);
  }

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
