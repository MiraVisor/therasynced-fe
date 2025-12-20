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

  return Object.keys(localStorage).some((key) => key.startsWith('slot_notes_'));
}
