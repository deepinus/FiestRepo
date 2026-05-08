import { useState, useEffect, useRef } from 'react';
import { speak, pause, resume, stop, isSpeaking, isPaused, buildFullNarration } from '../services/ttsService';

const SECTIONS = ['intro', 'history', 'facts', 'tips'];
const SECTION_LABELS = { intro: 'Introduction', history: 'History', facts: 'Fun Facts', tips: 'Tips' };
const SECTION_ICONS = { intro: '👋', history: '🏛', facts: '💡', tips: '📌' };

export default function AudioPlayer({ stop: currentStop, onSectionEnd, tourColor = '#f59e0b' }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const stopRef = useRef(currentStop);

  useEffect(() => {
    stopRef.current = currentStop;
  }, [currentStop]);

  // Reset when stop changes
  useEffect(() => {
    stop();
    setPlaying(false);
    setPaused(false);
    setActiveSection(0);
  }, [currentStop?.id]);

  // Cleanup on unmount
  useEffect(() => () => stop(), []);

  function speakSection(sectionIndex) {
    if (!currentStop?.audio) return;
    const section = SECTIONS[sectionIndex];
    const text = currentStop.audio[section];
    if (!text) return;

    const prefixes = {
      history: 'A bit of history. ',
      facts: 'Here are some fascinating facts. ',
      tips: 'A few tips before you move on. ',
    };
    const fullText = (prefixes[section] || '') + text;

    setPlaying(true);
    setPaused(false);
    setActiveSection(sectionIndex);

    speak(fullText, {
      onEnd: () => {
        const next = sectionIndex + 1;
        if (next < SECTIONS.length) {
          speakSection(next);
        } else {
          setPlaying(false);
          setPaused(false);
          onSectionEnd?.();
        }
      },
    });
  }

  function handlePlay() {
    if (paused) {
      resume();
      setPlaying(true);
      setPaused(false);
    } else {
      speakSection(activeSection);
    }
  }

  function handlePause() {
    pause();
    setPlaying(false);
    setPaused(true);
  }

  function handleStop() {
    stop();
    setPlaying(false);
    setPaused(false);
    setActiveSection(0);
  }

  function handleSectionClick(idx) {
    stop();
    speakSection(idx);
  }

  function handlePlayAll() {
    stop();
    speakSection(0);
  }

  return (
    <div className="audio-player" style={{ '--tour-color': tourColor }}>
      <div className="audio-player-header">
        <span className="audio-now-playing">
          {playing ? `▶ ${SECTION_LABELS[SECTIONS[activeSection]]}` : paused ? `⏸ Paused` : '🎧 Audio Guide'}
        </span>
        <button className="audio-play-all-btn" onClick={handlePlayAll}>
          Play All
        </button>
      </div>

      <div className="audio-sections">
        {SECTIONS.map((s, idx) => (
          <button
            key={s}
            className={`audio-section-btn ${activeSection === idx && (playing || paused) ? 'audio-section-btn--active' : ''}`}
            onClick={() => handleSectionClick(idx)}
          >
            <span className="audio-section-icon">{SECTION_ICONS[s]}</span>
            <span className="audio-section-label">{SECTION_LABELS[s]}</span>
            {activeSection === idx && playing && <span className="audio-wave">≋</span>}
          </button>
        ))}
      </div>

      <div className="audio-controls">
        <button
          className="audio-ctrl-btn audio-ctrl-btn--stop"
          onClick={handleStop}
          disabled={!playing && !paused}
          title="Stop"
        >
          ■
        </button>
        <button
          className="audio-ctrl-btn audio-ctrl-btn--main"
          onClick={playing ? handlePause : handlePlay}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button
          className="audio-ctrl-btn audio-ctrl-btn--skip"
          onClick={() => {
            const next = Math.min(activeSection + 1, SECTIONS.length - 1);
            if (next !== activeSection) { stop(); speakSection(next); }
          }}
          disabled={activeSection >= SECTIONS.length - 1}
          title="Next section"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
