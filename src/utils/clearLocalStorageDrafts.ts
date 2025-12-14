/**
 * Clear all localStorage items related to drafts
 * Called on logout to ensure GDPR compliance
 */
export function clearLocalStorageDrafts() {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  const draftKeys = keys.filter(
    (key) => key.startsWith('formData_') || key.startsWith('slot_notes_') || key === 'user', // Also clear user data if stored
  );

  draftKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  if (draftKeys.length > 0) {
    console.log(`Cleared ${draftKeys.length} draft-related localStorage items`);
  }
}
