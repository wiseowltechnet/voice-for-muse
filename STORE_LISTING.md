# Chrome Web Store listing — Voice for Muse v1.0.0

Draft copy + checklist for publishing. Nothing here is submitted anywhere.

## Store copy (paste into the listing)

**Name:** Voice for Muse

**Short description (132 chars max):**
Talk to Muse hands-free — push-to-talk voice input and spoken replies, right in your browser.

**Detailed description:**
Voice for Muse gives your Muse chat a voice, right in the browser.

- **Push-to-talk:** click the mic button (or press Alt+M) and speak — your words land in the chat input
- **Spoken replies:** Muse's responses are read aloud automatically
- **Interrupt anytime:** click the mic while it's speaking to cut in
- **Toolbar popup:** pick a voice, adjust rate and pitch, toggle auto-speak and auto-send, test your setup

No accounts, no servers, no API keys — it uses your browser's built-in speech recognition and speech synthesis. Everything stays on your device.

**Category:** Productivity
**Language:** English

## Privacy section (required fields)

**Single purpose:**
Adds push-to-talk voice input and text-to-speech replies to the Muse web chat.

**Data usage disclosure:**
This extension does not collect or transmit any user data. The `storage`
permission is used only to save your settings (voice choice, rate, pitch,
toggles) locally in the browser. Speech recognition and synthesis are handled
entirely by your browser's built-in Web Speech APIs. No analytics, no tracking,
no external servers.

**Privacy policy URL:** host `PRIVACY.md` (below) on GitHub Pages or wiseowltech.net and paste the URL.

## PRIVACY.md (host this, link it as the privacy policy URL)

# Privacy Policy — Voice for Muse

Voice for Muse does not collect, store, or transmit any personal data.

- Voice input is processed by your browser's built-in speech recognition.
- Replies are spoken using your browser's built-in speech synthesis.
- The only data kept is your settings (voice, rate, pitch, toggles), stored
  locally via the browser storage API on your own device.
- No analytics, no tracking, no external servers, no accounts.

## Publishing checklist

Done already:
- [x] Extension zip built: `~/workspace/your_files/voice-for-muse.zip`
- [x] 128px store icon: `icons/icon128.png`
- [x] Manifest V3, minimal permissions (`storage` + host access to the chat pages only)

Drew (only you can do these):
- [ ] Register a Chrome Web Store developer account — one-time **$5** fee at
      https://chrome.google.com/webstore/devconsole (sign in with your Google account)
- [ ] Create the GitHub repo under your wiseowltech.net GitHub account and push
      `~/workspace/edison-voice-extension/` (this also gives you a home for PRIVACY.md)
- [ ] Take 1–5 screenshots (1280x800 or 640x400): the mic button on the chat,
      the toolbar popup with settings, a spoken reply in progress
- [x] 440x280 promo tile built: `store-assets/promo-tile-440x280.png` (copy in `~/workspace/your_files/` too) — tweak the wording/style if you like
- [ ] In the Developer Dashboard: New item → upload the zip → paste the copy above →
      upload icon/tile/screenshots → privacy tab → submit for review
- [ ] Review typically takes 1–7 days; you'll get an email when it's live

Review-risk note: the extension requests host access to agent.meta.ai/muse.ai and
uses content scripts — both are core to its single purpose (voice UI inside the
chat page). The justification above covers it; least-privilege is already in place.
