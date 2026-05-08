let activeUtterance = null;
let onEndCallback = null;

export function speak(text, { rate = 0.88, pitch = 1.05, volume = 1, onEnd } = {}) {
  if (!window.speechSynthesis) return;
  stop();

  activeUtterance = new SpeechSynthesisUtterance(text);
  activeUtterance.rate = rate;
  activeUtterance.pitch = pitch;
  activeUtterance.volume = volume;
  onEndCallback = onEnd || null;

  activeUtterance.onend = () => {
    activeUtterance = null;
    onEndCallback?.();
  };

  activeUtterance.onerror = () => {
    activeUtterance = null;
  };

  // Pick an English voice when available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.localService)
  );
  if (preferred) activeUtterance.voice = preferred;

  window.speechSynthesis.speak(activeUtterance);
}

export function pause() {
  window.speechSynthesis?.pause();
}

export function resume() {
  window.speechSynthesis?.resume();
}

export function stop() {
  window.speechSynthesis?.cancel();
  activeUtterance = null;
}

export function isSpeaking() {
  return window.speechSynthesis?.speaking ?? false;
}

export function isPaused() {
  return window.speechSynthesis?.paused ?? false;
}

export function buildNarration(stop, section) {
  if (!stop?.audio) return '';
  const sectionText = stop.audio[section] || '';
  const labels = {
    intro: '',
    history: 'A bit of history. ',
    facts: 'Here are some fascinating facts. ',
    tips: 'A few tips before you move on. ',
  };
  return (labels[section] || '') + sectionText;
}

export function buildFullNarration(stop) {
  if (!stop?.audio) return '';
  return [
    stop.audio.intro,
    'A bit of history. ' + stop.audio.history,
    'Here are some fascinating facts. ' + stop.audio.facts,
    'A few tips before you move on. ' + stop.audio.tips,
  ]
    .filter(Boolean)
    .join(' ');
}
