import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

export default function SplashScreen() {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      navigate(profile ? '/home' : '/setup', { replace: true });
    }, 2200);
    return () => clearTimeout(timer);
  }, [loading, profile, navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-icon">🎧</div>
        <h1 className="splash-title">AudioGuide</h1>
        <p className="splash-tagline">Your personal city audio tour</p>
        <div className="splash-dots">
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </div>
      </div>
      <p className="splash-footer">Powered by AI · Any city, anywhere</p>
    </div>
  );
}
