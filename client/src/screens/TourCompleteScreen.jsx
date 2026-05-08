import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useTour } from '../context/TourContext';
import { saveTourToHistory } from '../services/storageService';

export default function TourCompleteScreen() {
  const { profile } = useProfile();
  const { activeTour, locationData } = useTour();
  const navigate = useNavigate();
  const savedRef = useRef(false);

  useEffect(() => {
    if (!activeTour || savedRef.current) return;
    savedRef.current = true;
    saveTourToHistory({
      tourId: activeTour.id,
      tourName: activeTour.name,
      theme: activeTour.theme,
      city: locationData?.city || 'Unknown',
      country: locationData?.country || '',
      completedAt: new Date().toISOString(),
      stopsCount: activeTour.stops.length,
      duration: activeTour.estimatedDuration,
      color: activeTour.color,
    });
  }, [activeTour, locationData]);

  return (
    <div className="complete-screen">
      <div className="complete-content">
        <div className="complete-animation">
          <span className="complete-icon">🎉</span>
          <div className="complete-ring" style={{ borderColor: activeTour?.color || '#f59e0b' }} />
        </div>

        <h1 className="complete-title">Tour Complete!</h1>
        <p className="complete-name">{activeTour?.name}</p>

        <div className="complete-stats">
          <div className="stat-card">
            <span className="stat-value">{activeTour?.stops?.length}</span>
            <span className="stat-label">Stops visited</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{activeTour?.estimatedDuration}</span>
            <span className="stat-label">Duration</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{activeTour?.totalDistance}</span>
            <span className="stat-label">Walked</span>
          </div>
        </div>

        <div className="complete-saved-note">
          ✅ This tour has been saved to your profile history
        </div>

        <p className="complete-congrats">
          Amazing exploring, {profile?.name}! You've discovered {locationData?.city || 'a wonderful city'} like a local.
        </p>

        <div className="complete-actions">
          <button className="btn-primary btn-full" onClick={() => navigate('/home')}>
            Explore More Tours
          </button>
          <button className="btn-secondary btn-full" onClick={() => navigate('/profile')}>
            View My History
          </button>
        </div>
      </div>
    </div>
  );
}
