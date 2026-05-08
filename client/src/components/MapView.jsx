import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeStopIcon(number, color, isActive) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${isActive ? color : '#334155'};
      color:${isActive ? '#000' : '#94a3b8'};
      border:2px solid ${color};
      border-radius:50%;
      width:${isActive ? 36 : 28}px;
      height:${isActive ? 36 : 28}px;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:${isActive ? 14 : 11}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
      transition:all .2s;
    ">${number}</div>`,
    iconSize: [isActive ? 36 : 28, isActive ? 36 : 28],
    iconAnchor: [isActive ? 18 : 14, isActive ? 18 : 14],
  });
}

function makeUserIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#38bdf8;border:3px solid #fff;
      border-radius:50%;width:16px;height:16px;
      box-shadow:0 0 0 4px rgba(56,189,248,0.3);
    "/>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function FlyToStop({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 16, { duration: 1.2 });
  }, [center, map]);
  return null;
}

export default function MapView({ stops, activeStopIndex, userLocation, tourColor = '#f59e0b' }) {
  if (!stops?.length) return null;

  const activeStop = stops[activeStopIndex];
  const center = activeStop ? [activeStop.lat, activeStop.lng] : [stops[0].lat, stops[0].lng];
  const routePoints = stops.map((s) => [s.lat, s.lng]);

  return (
    <MapContainer
      center={center}
      zoom={15}
      className="map-container"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
      />

      {/* Route polyline */}
      <Polyline
        positions={routePoints}
        pathOptions={{ color: tourColor, weight: 3, opacity: 0.7, dashArray: '6 6' }}
      />

      {/* Stop markers */}
      {stops.map((s, idx) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={makeStopIcon(s.order, tourColor, idx === activeStopIndex)}
        >
          <Popup>
            <strong>{s.name}</strong>
            <br />
            <small>{s.description}</small>
          </Popup>
        </Marker>
      ))}

      {/* User location dot */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={makeUserIcon()}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      <FlyToStop center={center} />
    </MapContainer>
  );
}
