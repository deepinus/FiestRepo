import { useParams, useNavigate } from 'react-router-dom';
import { useTour } from '../context/TourContext';
import POICard from '../components/POICard';

export default function TourDetailScreen() {
  const { tourId } = useParams();
  const { allTours, startTour, locationData } = useTour();
  const navigate = useNavigate();

  const tour = allTours?.find((t) => t.id === tourId);

  if (!tour) {
    return (
      <div className="screen-center">
        <p className="muted">Tour not found.</p>
        <button className="btn-primary" onClick={() => navigate('/home')}>Back to Tours</button>
      </div>
    );
  }

  function handleStart() {
    startTour(tour);
    navigate(`/active`);
  }

  return (
    <div className="tour-detail-screen" style={{ '--tour-color': tour.color }}>
      <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>

      <div className="tour-detail-hero">
        <span className="tour-detail-theme-badge">{tour.theme}</span>
        <h1 className="tour-detail-title">{tour.name}</h1>
        <p className="tour-detail-desc">{tour.description}</p>
        <div className="tour-detail-meta">
          <div className="meta-chip">⏱ {tour.estimatedDuration}</div>
          <div className="meta-chip">📍 {tour.stops?.length} stops</div>
          <div className="meta-chip">🚶 {tour.totalDistance}</div>
          <div className="meta-chip difficulty-chip">{tour.difficulty}</div>
        </div>
      </div>

      {locationData?.city && (
        <p className="tour-detail-location">📌 {locationData.city}{locationData.country ? `, ${locationData.country}` : ''}</p>
      )}

      <div className="tour-stops-section">
        <h3 className="section-title">Tour Stops</h3>
        <div className="stops-list">
          {tour.stops?.map((stop, idx) => (
            <POICard
              key={stop.id}
              stop={stop}
              isActive={false}
              isCompleted={false}
              onClick={null}
            />
          ))}
        </div>
      </div>

      <div className="tour-detail-footer">
        <p className="audio-hint">🎧 Put your headphones on — the guide will narrate each stop as you explore.</p>
        <button className="btn-primary btn-full btn-large start-tour-btn" onClick={handleStart}>
          Start Tour →
        </button>
      </div>
    </div>
  );
}
