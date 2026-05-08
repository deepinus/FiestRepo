import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, saveProfile } from '../services/storageService';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getProfile();
    setProfile(saved);
    setLoading(false);
  }, []);

  function createProfile(data) {
    const newProfile = { ...data, createdAt: new Date().toISOString() };
    saveProfile(newProfile);
    setProfile(newProfile);
  }

  function updateProfile(updates) {
    const updated = { ...profile, ...updates };
    saveProfile(updated);
    setProfile(updated);
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, createProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
