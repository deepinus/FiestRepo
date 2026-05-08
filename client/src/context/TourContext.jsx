import { createContext, useContext, useState } from 'react';

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const [activeTour, setActiveTour] = useState(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [locationData, setLocationData] = useState(null); // { city, country, lat, lng }
  const [allTours, setAllTours] = useState(null);

  function startTour(tour) {
    setActiveTour(tour);
    setCurrentStopIndex(0);
  }

  function nextStop() {
    if (!activeTour) return;
    setCurrentStopIndex((i) => Math.min(i + 1, activeTour.stops.length - 1));
  }

  function prevStop() {
    setCurrentStopIndex((i) => Math.max(i - 1, 0));
  }

  function goToStop(index) {
    if (!activeTour) return;
    setCurrentStopIndex(Math.max(0, Math.min(index, activeTour.stops.length - 1)));
  }

  function endTour() {
    setActiveTour(null);
    setCurrentStopIndex(0);
  }

  const currentStop = activeTour?.stops[currentStopIndex] ?? null;
  const isLastStop = activeTour ? currentStopIndex === activeTour.stops.length - 1 : false;
  const progress = activeTour ? (currentStopIndex + 1) / activeTour.stops.length : 0;

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStopIndex,
        currentStop,
        isLastStop,
        progress,
        locationData,
        allTours,
        setLocationData,
        setAllTours,
        startTour,
        nextStop,
        prevStop,
        goToStop,
        endTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
