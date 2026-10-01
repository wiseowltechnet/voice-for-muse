/* Voice for Muse — consent screen logic (DRAFT, not wired in yet).
 * DATA_PRACTICES_VERSION must match the check in content.js once wired.
 */
const DATA_PRACTICES_VERSION = 1;
document.getElementById('agree').addEventListener('click', async () => {
  await chrome.storage.local.set({ vfmConsentVersion: DATA_PRACTICES_VERSION, vfmConsentAt: Date.now() });
  window.close();
});
document.getElementById('later').addEventListener('click', () => window.close());
