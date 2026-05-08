import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { getTourHistory } from '../services/storageService';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function ProfileScreen() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const history = getTourHistory();

  return (
    <div className="profile-screen">
      <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>

      <div className="profile-header-card">
        <div className="profile-avatar-large">{profile?.avatar}</div>
        <h2 className="profile-name">{profile?.name}</h2>
        <p className="profile-since">Explorer since {formatDate(profile?.createdAt)}</p>
        <div className="profile-stats-row">
          <div className="profile-stat">
            <span className="profile-stat-value">{history.length}</span>
            <span className="profile-stat-label">Tours Completed</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">
              {new Set(history.map((h) => h.city)).size}
            </span>
            <span className="profile-stat-label">Cities Explored</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">
              {history.reduce((acc, h) => acc + (h.stopsCount || 0), 0)}
            </span>
            <span className="profile-stat-label">Stops Visited</span>
          </div>
        </div>
      </div>

      <div className="history-section">
        <h3 className="section-title">Tour History</h3>

        {history.length === 0 ? (
          <div className="empty-history">
            <span className="empty-icon">🗺️</span>
            <p>No tours completed yet.</p>
            <button className="btn-primary" onClick={() => navigate('/home')}>
              Start Your First Tour
            </button>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div key={entry.id} className="history-card">
                <div
                  className="history-card-accent"
                  style={{ background: entry.color || '#f59e0b' }}
                />
                <div className="history-card-body">
                  <div className="history-card-top">
                    <span className="history-tour-name">{entry.tourName}</span>
                    <span className="history-date">{formatDate(entry.completedAt)}</span>
                  </div>
                  <div className="history-card-meta">
                    <span>📍 {entry.city}{entry.country ? `, ${entry.country}` : ''}</span>
                    <span>·</span>
                    <span>{entry.stopsCount} stops</span>
                    <span>·</span>
                    <span>{entry.theme}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
