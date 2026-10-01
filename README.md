# Voice for Muse

Talk to Muse with your voice: push-to-talk input and spoken replies, right in the browser.

A Chrome (Manifest V3) extension that adds voice interaction to the Muse web chat
(`muse.ai`, `agent.meta.ai`).

- **Push-to-talk** — click the mic button or press `Alt+M` and speak; your words land in the chat input
- **Spoken replies** — Muse's responses are read aloud automatically
- **Interrupt anytime** — click the mic while it's speaking to cut in
- **Toolbar popup** — pick a voice, adjust rate and pitch, toggle auto-speak and auto-send, test your setup

No accounts, no servers, no API keys. It uses your browser's built-in speech
recognition and speech synthesis — everything stays on your device.

## Install (developer mode)

1. Open `chrome://extensions` in Chrome (or Edge/Brave)
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and select this folder
4. Open [muse.ai](https://muse.ai) — you'll see a mic button in the chat; press `Alt+M` to talk

## Build a store-ready zip

No build step — the source *is* the extension. Zip the contents (not the folder):

```sh
zip -r voice-for-muse.zip . -x "*.git*" "store-assets/*" "STORE_LISTING.md"
```

## Store assets

- `icons/icon128.png` — store icon (16/48px variants alongside)
- `store-assets/promo-tile-440x280.png` — promo tile
- `STORE_LISTING.md` — listing copy, privacy section, and publishing checklist

## Privacy

This extension does not collect or transmit any user data. See
[PRIVACY.md](PRIVACY.md). The `storage` permission only saves your settings
locally. Speech is handled entirely by your browser's Web Speech APIs.

## License

MIT — see [LICENSE](LICENSE).
