import { useState } from 'react';
import { MapLayer } from '../types';

interface LeftPanelProps {
  layers: MapLayer[];
  onLayerToggle: (id: string) => void;
  activeFilters: string[];
  onFilterToggle: (f: string) => void;
}

const SCENES = [
  { id: 'middle-east', label: 'MIDDLE EAST', lat: 28, lng: 50, zoom: 5 },
  { id: 'ukraine', label: 'UKRAINE WAR', lat: 49, lng: 31, zoom: 6 },
  { id: 'taiwan', label: 'TAIWAN STRAIT', lat: 24, lng: 121, zoom: 6 },
  { id: 'hormuz', label: 'STRAIT OF HORMUZ', lat: 26.5, lng: 56, zoom: 7 },
  { id: 'south-china', label: 'SOUTH CHINA SEA', lat: 15, lng: 113, zoom: 5 },
  { id: 'africa', label: 'SAHEL REGION', lat: 14, lng: 2, zoom: 5 },
  { id: 'korea', label: 'KOREAN PENINSULA', lat: 37, lng: 127, zoom: 6 },
  { id: 'global', label: 'GLOBAL VIEW', lat: 25, lng: 50, zoom: 3 },
];

const DATA_FILTERS = [
  { id: 'commercial', label: 'Commercial Flights', color: '#00d4ff' },
  { id: 'military', label: 'Military Flights', color: '#ff4444' },
  { id: 'gps-jam', label: 'GPS Jamming', color: '#ff8800' },
  { id: 'maritime', label: 'Maritime Traffic', color: '#00ff88' },
  { id: 'airspace', label: 'Airspace Closures', color: '#ff00ff' },
  { id: 'satellites', label: 'Imaging Satellites', color: '#44ddff' },
  { id: 'earthquakes', label: 'Seismic Events', color: '#ff6600' },
  { id: 'conflicts', label: 'Conflict Zones', color: '#ff2222' },
];

interface PanelSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function PanelSection({ title, children, defaultOpen = false }: PanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-cyan-900/40 rounded-sm mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono tracking-widest text-gray-400 hover:text-cyan-300 hover:bg-cyan-900/10 transition-all"
      >
        <span>{title}</span>
        <span className="text-cyan-500">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="border-t border-cyan-900/30 p-2">
          {children}
        </div>
      )}
    </div>
  );
}

export default function LeftPanel({ layers, onLayerToggle, activeFilters, onFilterToggle }: LeftPanelProps) {
  const [selectedScene, setSelectedScene] = useState('');

  return (
    <div className="absolute left-2 top-24 z-40 w-48 space-y-1">
      {/* Layer Controls */}
      <PanelSection title="DATA LAYERS" defaultOpen={true}>
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => onLayerToggle(layer.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 mb-1 rounded-sm text-[10px] font-mono transition-all ${
              layer.active
                ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-700/50'
                : 'bg-transparent text-gray-600 border border-gray-800/50'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: layer.active ? layer.color : '#333' }}
            />
            <span className="tracking-wider">{layer.label}</span>
          </button>
        ))}
      </PanelSection>

      {/* Scenes */}
      <PanelSection title="SCENES">
        <div className="space-y-1">
          {SCENES.map(scene => (
            <button
              key={scene.id}
              onClick={() => setSelectedScene(scene.id)}
              className={`w-full text-left px-2 py-1 text-[9px] font-mono tracking-wider rounded-sm transition-all ${
                selectedScene === scene.id
                  ? 'bg-cyan-800/40 text-cyan-200 border-l-2 border-cyan-400'
                  : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-900/10'
              }`}
            >
              {scene.label}
            </button>
          ))}
        </div>
      </PanelSection>

      {/* Filter Tags */}
      <PanelSection title="ACTIVE FILTERS">
        <div className="flex flex-wrap gap-1">
          {DATA_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => onFilterToggle(f.id)}
              className="px-1.5 py-0.5 text-[8px] font-mono rounded-sm border transition-all"
              style={{
                borderColor: activeFilters.includes(f.id) ? f.color : '#333',
                color: activeFilters.includes(f.id) ? f.color : '#555',
                backgroundColor: activeFilters.includes(f.id) ? `${f.color}15` : 'transparent',
              }}
            >
              {activeFilters.includes(f.id) ? '✓' : '○'} {f.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </PanelSection>

      {/* City MESH */}
      <PanelSection title="CITY MESH">
        <div className="space-y-1">
          {[
            { city: 'DUBAI', status: 'NOMINAL', lat: 25.2, lng: 55.3 },
            { city: 'TEHRAN', status: 'ELEVATED', lat: 35.7, lng: 51.4 },
            { city: 'KYIV', status: 'CRITICAL', lat: 50.4, lng: 30.5 },
            { city: 'BEIJING', status: 'NOMINAL', lat: 39.9, lng: 116.4 },
            { city: 'MOSCOW', status: 'ELEVATED', lat: 55.7, lng: 37.6 },
          ].map(item => (
            <div key={item.city} className="flex items-center justify-between px-1 py-0.5">
              <span className="text-[9px] font-mono text-gray-400">{item.city}</span>
              <span className={`text-[8px] font-mono ${
                item.status === 'CRITICAL' ? 'text-red-400' :
                item.status === 'ELEVATED' ? 'text-orange-400' : 'text-green-400'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </PanelSection>
    </div>
  );
}
