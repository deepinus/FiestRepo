import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useTour } from '../context/TourContext';
import { getCurrentPosition, reverseGeocode } from '../services/locationService';
import { generateTours } from '../services/tourGenerationService';
import { clearCachedTours } from '../services/storageService';
import TourCard from '../components/TourCard';
import LoadingSpinner from '../components/LoadingSpinner';

const STEPS = {
  LOCATION: 'location',
  GENERATING: 'generating',
  READY: 'ready',
  ERROR: 'error',
};

export default function HomeScreen() {
  const { profile } = useProfile();
  const { setLocationData, setAllTours } = useTour();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.LOCATION);
  const [city, setCity] = useState(null);
  const [tours, setTours] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [showManual, setShowManual] = useState(false);

  async function fetchLocation() {
    setStep(STEPS.LOCATION);
    setErrorMsg('');
    try {
      const pos = await getCurrentPosition();
      const { latitude: lat, longitude: lng } = pos.coords;
      const geo = await reverseGeocode(lat, lng);
      const location = { ...geo, lat, lng };
      setCity(location);
      setLocationData(location);
      await loadTours(location.city, location.country);
    } catch (err) {
      setErrorMsg(err.message || 'Could not get your location.');
      setStep(STEPS.ERROR);
      setShowManual(true);
    }
  }

  async function loadTours(cityName, country) {
    setStep(STEPS.GENERATING);
    try {
      const data = await generateTours(cityName, country || '');
      setTours(data.tours || []);
      setAllTours(data.tours || []);
      setStep(STEPS.READY);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate tours.');
      setStep(STEPS.ERROR);
    }
  }

  async function handleManualCity(e) {
    e.preventDefault();
    const name = manualCity.trim();
    if (!name) return;
    const fakeLocation = { city: name, country: '', lat: 0, lng: 0 };
    setCity(fakeLocation);
    setLocationData(fakeLocation);
    setShowManual(false);
    await loadTours(name, '');
  }

  async function handleRefresh() {
    if (city?.city) clearCachedTours(city.city);
    await fetchLocation();
  }

  function handleSelectTour(tour) {
    navigate(`/tour/${tour.id}`);
  }

  useEffect(() => {
    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="home-header-left">
          <span className="home-avatar">{profile?.avatar}</span>
          <div>
            <p className="home-greeting">Hello, {profile?.name} 👋</p>
            {city && (
              <p className="home-city">
                📍 {city.city}{city.country ? `, ${city.country}` : ''}
              </p>
            )}
          </div>
        </div>
        <div className="home-header-right">
          <button className="icon-btn" onClick={() => navigate('/profile')} title="Profile">👤</button>
          {step === STEPS.READY && (
            <button className="icon-btn" onClick={handleRefresh} title="Refresh tours">🔄</button>
          )}
        </div>
      </header>

      <main className="home-main">
        {step === STEPS.LOCATION && (
          <LoadingSpinner message="Detecting your location..." />
        )}

        {step === STEPS.GENERATING && (
          <div className="generating-view">
            <LoadingSpinner message={`Crafting tours for ${city?.city}...`} />
            <p className="generating-hint">
              AI is generating personalised tours just for you.<br />This takes about 15–20 seconds.
            </p>
          </div>
        )}

        {step === STEPS.ERROR && (
          <div className="error-view">
            <span className="error-icon">📡</span>
            <p className="error-msg">{errorMsg}</p>
            <button className="btn-primary" onClick={fetchLocation}>Try Again</button>
            {showManual && (
              <form className="manual-city-form" onSubmit={handleManualCity}>
                <p className="manual-city-label">Or enter a city manually:</p>
                <div className="manual-city-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Nairobi"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                  />
                  <button type="submit" className="btn-primary">Go</button>
                </div>
              </form>
            )}
          </div>
        )}

        {step === STEPS.READY && (
          <>
            <div className="tours-header">
              <h2 className="tours-title">Choose Your Tour</h2>
              <p className="tours-subtitle">3 unique experiences waiting for you in {city?.city}</p>
            </div>
            <div className="tours-list">
              {tours.map((tour, idx) => (
                <TourCard key={tour.id} tour={tour} index={idx} onSelect={handleSelectTour} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
