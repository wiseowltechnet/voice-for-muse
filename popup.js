/* Settings popup for Voice for Muse */
const DEFAULTS = { autoSpeak: true, autoSend: false, voiceURI: '', rate: 1.0, pitch: 1.0 };

function loadVoices(select, currentURI) {
  const voices = speechSynthesis.getVoices();
  select.innerHTML = '';
  const auto = document.createElement('option');
  auto.value = '';
  auto.textContent = 'Auto (best English)';
  select.appendChild(auto);
  voices.forEach(v => {
    const o = document.createElement('option');
    o.value = v.voiceURI;
    o.textContent = `${v.name} (${v.lang})`;
    select.appendChild(o);
  });
  select.value = currentURI || '';
}

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  chrome.storage.sync.get(DEFAULTS, (s) => {
    $('autoSpeak').checked = s.autoSpeak;
    $('autoSend').checked = s.autoSend;
    $('rate').value = s.rate;
    $('pitch').value = s.pitch;
    const fill = () => loadVoices($('voice'), s.voiceURI);
    fill();
    if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = fill;
  });

  const save = () => chrome.storage.sync.set({
    autoSpeak: $('autoSpeak').checked,
    autoSend: $('autoSend').checked,
    voiceURI: $('voice').value,
    rate: parseFloat($('rate').value),
    pitch: parseFloat($('pitch').value),
  });
  ['autoSpeak', 'autoSend', 'voice', 'rate', 'pitch'].forEach(id => {
    $(id).addEventListener('change', save);
  });

  $('testBtn').addEventListener('click', () => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("Hello! This is a voice test. Everything is working.");
    const uri = $('voice').value;
    const v = speechSynthesis.getVoices().find(v => v.voiceURI === uri);
    if (v) u.voice = v;
    u.rate = parseFloat($('rate').value);
    u.pitch = parseFloat($('pitch').value);
    speechSynthesis.speak(u);
  });
});
