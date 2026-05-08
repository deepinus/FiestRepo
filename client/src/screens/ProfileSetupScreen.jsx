import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

const AVATARS = ['🧭', '🎒', '📸', '🌍', '✈️', '🗺️'];

export default function ProfileSetupScreen() {
  const { createProfile } = useProfile();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }
    createProfile({ name: trimmed, avatar: selectedAvatar });
    navigate('/home', { replace: true });
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-header">
          <span className="setup-hero-icon">🎧</span>
          <h1 className="setup-title">Welcome to AudioGuide</h1>
          <p className="setup-subtitle">
            Create your traveler profile to unlock personalized audio tours in any city on Earth.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label className="form-label">Choose your avatar</label>
            <div className="avatar-grid">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  className={`avatar-btn ${selectedAvatar === av ? 'avatar-btn--selected' : ''}`}
                  onClick={() => setSelectedAvatar(av)}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Your name</label>
            <input
              id="name"
              type="text"
              className={`form-input ${error ? 'form-input--error' : ''}`}
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              maxLength={40}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
          </div>

          <button type="submit" className="btn-primary btn-full">
            Start Exploring →
          </button>
        </form>

        <p className="setup-note">Your profile is saved locally on your device. No account required.</p>
      </div>
    </div>
  );
}
