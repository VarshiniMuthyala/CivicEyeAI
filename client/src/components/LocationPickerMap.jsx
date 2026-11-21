import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Custom electric blue pinpoint icon
const pinIcon = L.divIcon({
  className: 'custom-pin-picker',
  html: `
    <div style="position: relative; width: 36px; height: 36px;">
      <div style="
        position: absolute;
        width: 18px;
        height: 18px;
        background: #0066ff;
        border: 3px solid #ffffff;
        border-radius: 50%;
        top: 0;
        left: 9px;
        box-shadow: 0 0 15px #0066ff, 0 4px 10px rgba(0,0,0,0.5);
      "></div>
      <div style="
        position: absolute;
        bottom: 4px;
        left: 17px;
        width: 2px;
        height: 14px;
        background: #0066ff;
        box-shadow: 0 0 8px #0066ff;
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Map recentering component
const MapRecenter = ({ center }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
};

export const LocationPickerMap = ({ latitude, longitude, onLocationSelect }) => {
  const defaultCenter = [
    latitude && !isNaN(latitude) ? parseFloat(latitude) : 17.385044,
    longitude && !isNaN(longitude) ? parseFloat(longitude) : 78.486671
  ];

  const markerPosition = (latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
    ? [parseFloat(latitude), parseFloat(longitude)]
    : null;

  return (
    <div className="relative w-full h-[280px] rounded-xl overflow-hidden border border-slate-800 shadow-inner">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon={pinIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onLocationSelect(position.lat, position.lng);
              }
            }}
          />
        )}
        {markerPosition && <MapRecenter center={markerPosition} />}
      </MapContainer>
      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md text-[11px] text-slate-300 py-1 px-3 rounded-lg border border-slate-700/60 z-[1000] flex justify-between items-center pointer-events-none">
        <span>📍 Click or drag pin to adjust precise incident coordinates</span>
        <span className="font-mono text-cyan-400">
          {latitude ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}` : 'No pin set'}
        </span>
      </div>
    </div>
  );
};

export default LocationPickerMap;
