import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { ExternalLink, Filter } from 'lucide-react';

const createSeverityIcon = (severity) => {
  let color = '#38bdf8';
  let glow = 'rgba(56, 189, 248, 0.5)';

  switch (severity?.toLowerCase()) {
    case 'critical':
      color = '#ef4444';
      glow = 'rgba(239, 68, 68, 0.8)';
      break;
    case 'high':
      color = '#f97316';
      glow = 'rgba(249, 115, 22, 0.7)';
      break;
    case 'medium':
      color = '#eab308';
      glow = 'rgba(234, 179, 8, 0.6)';
      break;
    case 'low':
      color = '#10b981';
      glow = 'rgba(16, 185, 129, 0.6)';
      break;
  }

  return L.divIcon({
    className: 'custom-severity-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 0 14px ${glow}, 0 2px 6px rgba(0,0,0,0.6);
        "></div>
        <div style="
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ffffff;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

export const CivicMap = ({ complaints = [], height = '500px' }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  // Filter complaints
  const filtered = complaints.filter(c => {
    if (selectedCategory !== 'All' && c.issue_type !== selectedCategory) return false;
    if (selectedSeverity !== 'All' && c.severity !== selectedSeverity) return false;
    return true;
  });

  // Default center
  const defaultCenter = complaints.length > 0
    ? [complaints[0].latitude, complaints[0].longitude]
    : [17.385044, 78.486671];

  return (
    <div className="card overflow-hidden relative flex flex-col" style={{ height }}>
      {/* Map Filter Bar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-[1000]">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Filter size={14} className="text-cyan-400" />
          <span>Interactive Civic Map ({filtered.length} issues)</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">🔴 Critical Only</option>
            <option value="High">🟠 High Priority</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Potholes and damaged roads">Potholes & Roads</option>
            <option value="Garbage accumulation">Garbage Waste</option>
            <option value="Water leakage">Water Leakage</option>
            <option value="Drainage overflow">Drainage</option>
            <option value="Broken streetlights">Streetlights</option>
            <option value="Public infrastructure damage">Public Works</option>
            <option value="Pollution">Pollution</option>
          </select>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filtered.map((item) => (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={createSeverityIcon(item.severity)}
            >
              <Popup>
                <div className="p-1 min-w-[220px] max-w-[280px]">
                  {item.image_url && (
                    <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-slate-800">
                      <img
                        src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                        alt={item.issue_type}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">{item.id}</span>
                    <SeverityBadge severity={item.severity} size="small" />
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1 mb-1">{item.issue_type}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between border-t border-slate-700/60 pt-2 mt-2">
                    <StatusBadge status={item.status} size="small" />
                    <Link
                      to={`/track?id=${item.id}`}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                    >
                      Track <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CivicMap;
