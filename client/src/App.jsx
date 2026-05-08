import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { TourProvider } from './context/TourContext';
import SplashScreen from './screens/SplashScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import HomeScreen from './screens/HomeScreen';
import TourDetailScreen from './screens/TourDetailScreen';
import ActiveTourScreen from './screens/ActiveTourScreen';
import TourCompleteScreen from './screens/TourCompleteScreen';
import ProfileScreen from './screens/ProfileScreen';

function ProfileGate({ children }) {
  const { profile, loading } = useProfile();
  if (loading) return null;
  if (!profile) return <Navigate to="/setup" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/setup" element={<ProfileSetupScreen />} />
      <Route path="/home" element={<ProfileGate><HomeScreen /></ProfileGate>} />
      <Route path="/tour/:tourId" element={<ProfileGate><TourDetailScreen /></ProfileGate>} />
      <Route path="/active" element={<ProfileGate><ActiveTourScreen /></ProfileGate>} />
      <Route path="/complete" element={<ProfileGate><TourCompleteScreen /></ProfileGate>} />
      <Route path="/profile" element={<ProfileGate><ProfileScreen /></ProfileGate>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <TourProvider>
          <AppRoutes />
        </TourProvider>
      </ProfileProvider>
    </BrowserRouter>
  );
}
