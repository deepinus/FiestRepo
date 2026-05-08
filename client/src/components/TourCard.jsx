export default function TourCard({ tour, onSelect, index }) {
  const icons = ['🗺️', '🏛️', '✨'];
  const icon = icons[index % icons.length];

  return (
    <div
      className="tour-card"
      style={{ '--tour-color': tour.color || '#f59e0b' }}
      onClick={() => onSelect(tour)}
    >
      <div className="tour-card-header">
        <span className="tour-icon">{icon}</span>
        <span className="tour-theme-badge">{tour.theme}</span>
      </div>
      <h3 className="tour-card-title">{tour.name}</h3>
      <p className="tour-card-description">{tour.description}</p>
      <div className="tour-card-meta">
        <span className="meta-item">⏱ {tour.estimatedDuration}</span>
        <span className="meta-item">📍 {tour.stops?.length} stops</span>
        <span className="meta-item">🚶 {tour.totalDistance}</span>
        <span className="meta-difficulty">{tour.difficulty}</span>
      </div>
      <button className="tour-select-btn">Explore This Tour →</button>
    </div>
  );
}
