export default function POICard({ stop, isActive, isCompleted, onClick }) {
  return (
    <div
      className={`poi-card ${isActive ? 'poi-card--active' : ''} ${isCompleted ? 'poi-card--completed' : ''}`}
      onClick={onClick}
    >
      <div className="poi-card-number">
        {isCompleted ? '✓' : stop.order}
      </div>
      <div className="poi-card-content">
        <h4 className="poi-card-name">{stop.name}</h4>
        <p className="poi-card-desc">{stop.description}</p>
      </div>
      {isActive && <div className="poi-card-active-dot" />}
    </div>
  );
}
