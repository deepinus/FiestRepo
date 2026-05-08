import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '../context/TourContext';
import MapView from '../components/MapView';
import AudioPlayer from '../components/AudioPlayer';
import POICard from '../components/POICard';
import { watchPosition, clearWatch, calculateDistance } from '../services/locationService';
import { stop as stopTTS } from '../services/ttsService';

const PROXIMITY_THRESHOLD = 80; // metres — auto-trigger audio

export default function ActiveTourScreen() {
  const { activeTour, currentStop, currentStopIndex, isLastStop, nextStop, prevStop, goToStop, endTour } = useTour();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [showStopList, setShowStopList] = useState(false);
  const [distanceToNext, setDistanceToNext] = useState(null);
  const watchRef = useRef(null);

  useEffect(() => {
    if (!activeTour) {
      navigate('/home', { replace: true });
      return;
    }
    watchRef.current = watchPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(loc);
      if (currentStop) {
        const dist = calculateDistance(loc.lat, loc.lng, currentStop.lat, currentStop.lng);
        setDistanceToNext(Math.round(dist));
      }
    });
    return () => {
      clearWatch(watchRef.current);
      stopTTS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTour]);

  useEffect(() => {
    if (!currentStop || !userLocation) return;
    const dist = calculateDistance(userLocation.lat, userLocation.lng, currentStop.lat, currentStop.lng);
    setDistanceToNext(Math.round(dist));
  }, [currentStop, userLocation]);

  function handleFinishTour() {
    stopTTS();
    endTour();
    navigate('/complete');
  }

  function handleExitTour() {
    stopTTS();
    endTour();
    navigate('/home');
  }

  if (!activeTour || !currentStop) return null;

  return (
    <div className="active-tour-screen">
      {/* Top Bar */}
      <div className="active-tour-topbar">
        <button className="exit-btn" onClick={handleExitTour}>✕</button>
        <div className="active-tour-info">
          <span className="active-tour-name">{activeTour.name}</span>
          <span className="active-tour-progress">
            Stop {currentStopIndex + 1} of {activeTour.stops.length}
          </span>
        </div>
        <button className="stops-toggle-btn" onClick={() => setShowStopList((v) => !v)}>
          {showStopList ? '🗺️' : '📋'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${((currentStopIndex + 1) / activeTour.stops.length) * 100}%`,
            background: activeTour.color,
          }}
        />
      </div>

      {/* Map (hidden when stop list is shown) */}
      {!showStopList && (
        <div className="active-map-wrapper">
          <MapView
            stops={activeTour.stops}
            activeStopIndex={currentStopIndex}
            userLocation={userLocation}
            tourColor={activeTour.color}
          />
          {distanceToNext != null && (
            <div className="distance-badge">
              {distanceToNext < 1000
                ? `${distanceToNext}m away`
                : `${(distanceToNext / 1000).toFixed(1)}km away`}
            </div>
          )}
        </div>
      )}

      {/* Stop list drawer */}
      {showStopList && (
        <div className="stop-list-drawer">
          <h3 className="stop-list-title">Tour Stops</h3>
          {activeTour.stops.map((s, idx) => (
            <POICard
              key={s.id}
              stop={s}
              isActive={idx === currentStopIndex}
              isCompleted={idx < currentStopIndex}
              onClick={() => { goToStop(idx); setShowStopList(false); }}
            />
          ))}
        </div>
      )}

      {/* Current POI info */}
      <div className="active-poi-panel">
        <div className="active-poi-header">
          <div className="active-stop-badge" style={{ background: activeTour.color }}>
            {currentStop.order}
          </div>
          <div>
            <h2 className="active-poi-name">{currentStop.name}</h2>
            <p className="active-poi-desc">{currentStop.description}</p>
          </div>
        </div>

        {/* Audio player */}
        <AudioPlayer
          stop={currentStop}
          tourColor={activeTour.color}
          onSectionEnd={null}
        />

        {/* Navigation controls */}
        <div className="nav-controls">
          <button
            className="nav-btn nav-btn--prev"
            onClick={prevStop}
            disabled={currentStopIndex === 0}
          >
            ← Previous
          </button>

          {isLastStop ? (
            <button className="nav-btn nav-btn--finish" onClick={handleFinishTour}>
              Finish Tour 🎉
            </button>
          ) : (
            <button
              className="nav-btn nav-btn--next"
              style={{ background: activeTour.color }}
              onClick={nextStop}
            >
              Next Stop →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
