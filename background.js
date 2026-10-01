// Forwards the Alt+M keyboard command to the active tab's content script.
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'toggle-mic' && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'ehv-toggle-mic' }).catch(() => {});
  }
});
