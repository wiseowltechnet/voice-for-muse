/* Voice for Muse — content script
 * Push-to-talk voice input + spoken replies on the Muse web app.
 * Uses the Web Speech API (no backend, no keys).
 */
(() => {
  'use strict';

  const DEFAULTS = { autoSpeak: true, autoSend: false, voiceURI: '', rate: 1.0, pitch: 1.0 };
  let settings = { ...DEFAULTS };
  let recognizing = false;
  let recognition = null;
  let lastSpokenHash = '';
  let lastAssistantText = '';

  chrome.storage.sync.get(DEFAULTS, (s) => { settings = { ...DEFAULTS, ...s }; });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const [k, v] of Object.entries(changes)) settings[k] = v.newValue;
  });

  /* ---------- UI: floating mic button + status pill ---------- */
  const btn = document.createElement('button');
  btn.id = 'ehv-mic';
  btn.title = "Talk to Muse (Alt+M)";
  btn.innerHTML = '<span class="ehv-mic-icon">🎙</span>';
  btn.addEventListener('click', toggleMic);
  document.documentElement.appendChild(btn);

  const pill = document.createElement('div');
  pill.id = 'ehv-pill';
  pill.hidden = true;
  document.documentElement.appendChild(pill);

  const replay = document.createElement('button');
  replay.id = 'ehv-replay';
  replay.title = 'Speak last reply again';
  replay.textContent = '🔊';
  replay.addEventListener('click', () => { if (lastAssistantText) speak(lastAssistantText); });
  document.documentElement.appendChild(replay);

  function showPill(text, ms) {
    pill.textContent = text;
    pill.hidden = false;
    if (ms) setTimeout(() => { pill.hidden = true; }, ms);
  }

  /* ---------- speech recognition ---------- */
  function toggleMic() {
    if (recognizing) { stopMic(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showPill('Voice input not supported in this browser', 3000); return; }
    speechSynthesis.cancel(); // barge-in: hush Muse while you talk
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalText = '';
    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      showPill('🎙 ' + (finalText + interim).trim() || '🎙 listening…');
      if (finalText) { insertText(finalText.trim()); finalText = ''; }
    };
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') showPill('Microphone blocked — allow it in the address bar', 4000);
      else if (e.error !== 'aborted') showPill('Mic error: ' + e.error, 2500);
      stopMic();
    };
    recognition.onend = () => stopMic();
    recognition.start();
    recognizing = true;
    btn.classList.add('listening');
    showPill('🎙 listening…');
  }

  function stopMic() {
    recognizing = false;
    btn.classList.remove('listening');
    pill.hidden = true;
    try { recognition && recognition.stop(); } catch (_) {}
    recognition = null;
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'ehv-toggle-mic') toggleMic();
  });

  /* ---------- put transcript into the chat input ---------- */
  const INPUT_SELECTORS = [
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
    'textarea[placeholder]',
    'textarea'
  ];
  function findInput() {
    for (const sel of INPUT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) return el;
    }
    return null;
  }
  function insertText(text) {
    const el = findInput();
    if (!el) { showPill('Could not find the chat input', 2500); return; }
    el.focus();
    if (el.isContentEditable) {
      el.textContent = (el.textContent || '') + (el.textContent ? ' ' : '') + text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    } else {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      const cur = el.value || '';
      setter.call(el, cur + (cur ? ' ' : '') + text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (settings.autoSend) setTimeout(sendMessage, 400);
    else showPill('✓ in the chat box — hit send when ready', 2000);
  }
  function sendMessage() {
    const el = findInput();
    if (!el) return;
    const sendBtn = document.querySelector(
      'button[aria-label*="Send" i], button[data-testid*="send" i], form button[type="submit"]'
    );
    if (sendBtn) { sendBtn.click(); return; }
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
  }

  /* ---------- speak Muse's replies ---------- */
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return String(h);
  }
  const ASSISTANT_SELECTORS = [
    '[data-message-author="assistant"]', '[data-message-role="assistant"]',
    '[data-role="assistant"]', '.assistant-message', '[class*="assistant" i]'
  ];
  function assistantNodes() {
    for (const sel of ASSISTANT_SELECTORS) {
      try {
        const nodes = [...document.querySelectorAll(sel)].filter(n => n.offsetParent !== null);
        if (nodes.length) return nodes;
      } catch (_) {}
    }
    return [];
  }
  function cleanText(node) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll('#ehv-mic,#ehv-pill,#ehv-replay,button,script,style').forEach(n => n.remove());
    return clone.innerText.replace(/\s+/g, ' ').trim();
  }
  function checkForNewReply() {
    if (!settings.autoSpeak) return;
    const nodes = assistantNodes();
    if (!nodes.length) return;
    const text = cleanText(nodes[nodes.length - 1]);
    if (text.length < 4 || text === lastAssistantText) return;
    const h = hash(text);
    if (h === lastSpokenHash) { lastAssistantText = text; return; }
    lastAssistantText = text;
    lastSpokenHash = h;
    speak(text);
  }
  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    if (settings.voiceURI) {
      const v = voices.find(v => v.voiceURI === settings.voiceURI);
      if (v) return v;
    }
    return voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en') && v.localService)
        || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'))
        || voices[0] || null;
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 1200));
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = settings.rate || 1.0;
    u.pitch = settings.pitch || 1.0;
    speechSynthesis.speak(u);
  }
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};

  let debounce = null;
  new MutationObserver(() => {
    clearTimeout(debounce);
    debounce = setTimeout(checkForNewReply, 900);
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  // hush Muse when the user starts typing/sending
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && speechSynthesis.speaking) speechSynthesis.cancel();
  }, true);
})();
