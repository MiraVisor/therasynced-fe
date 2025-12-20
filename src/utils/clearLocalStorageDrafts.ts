/**
 * Clear all localStorage items related to drafts
 * Called on logout to ensure GDPR compliance
 */
export function clearLocalStorageDrafts() {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  // Also clear user data if stored
  const draftKeys = keys.filter(
    (key) => key.startsWith('formData_') || key.startsWith('slot_notes_') || key === 'user',
  );

  draftKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Silently clear drafts without logging
  // Drafts are cleared for GDPR compliance
}
