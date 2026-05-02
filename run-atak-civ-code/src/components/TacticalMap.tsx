import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { TeamMember } from '../hooks/usePLI';

// Custom tactical icon
const createTacticalIcon = (role: string, heading: number) => {
  return L.divIcon({
    className: 'tactical-marker',
    html: `
      <div style="transform: rotate(${heading}deg); position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px;">
          <path d="M12 2L15 8H9L12 2Z" fill="${role === 'TL' ? '#f59e0b' : '#3b82f6'}" stroke="white" stroke-width="1"/>
          <circle cx="12" cy="14" r="5" fill="${role === 'TL' ? '#f59e0b' : '#3b82f6'}" stroke="white" stroke-width="1"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const createPOIIcon = (color: string) => {
  return L.divIcon({
    className: 'poi-marker',
    html: `
      <div style="width: 20px; height: 20px; background: ${color}; border: 2px solid white; border-radius: 2px; transform: rotate(45deg);"></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface TacticalMapProps {
  team: TeamMember[];
  center: [number, number];
  zoom: number;
  markers: any[];
  onMapClick: (lat: number, lng: number) => void;
}

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const TacticalMap: React.FC<TacticalMapProps> = ({ team, center, zoom, markers, onMapClick }) => {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onMapClick={onMapClick} />

        {/* Range Rings for Lead */}
        {team.find(m => m.role === 'TL') && (
          <>
            <Circle 
              center={[team[0].lat, team[0].lng]} 
              radius={500} 
              pathOptions={{ color: '#f59e0b', weight: 1, fillOpacity: 0.05, dashArray: '5, 10' }} 
            />
            <Circle 
              center={[team[0].lat, team[0].lng]} 
              radius={1000} 
              pathOptions={{ color: '#f59e0b', weight: 1, fillOpacity: 0, dashArray: '5, 15' }} 
            />
          </>
        )}

        {team.map((member) => (
          <Marker
            key={member.id}
            position={[member.lat, member.lng]}
            icon={createTacticalIcon(member.role, member.heading)}
          >
            <Popup>
              <div className="bg-[#1a1a1a] text-white p-1">
                <h3 className="font-bold border-b border-gray-600 mb-1">{member.name}</h3>
                <p className="text-[10px] text-gray-400 leading-tight">Role: {member.role}</p>
                <p className="text-[10px] text-gray-400 leading-tight">Pos: {member.lat.toFixed(4)}, {member.lng.toFixed(4)}</p>
                <p className="text-[10px] text-gray-400 leading-tight">Hdg: {Math.round(member.heading)}°</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {markers.map((m, idx) => (
          <Marker 
            key={idx} 
            position={[m.lat, m.lng]}
            icon={createPOIIcon(m.color || '#ef4444')}
          >
             <Popup>
               <div className="p-1">
                 <p className="font-bold text-xs">{m.label || 'Point of Interest'}</p>
                 <p className="text-[10px]">{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</p>
               </div>
             </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TacticalMap;
