import { useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import TacticalMap from './components/TacticalMap';
import HUD from './components/HUD';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Timeline from './components/Timeline';
import StatusBar from './components/StatusBar';
import { useOpenSky } from './hooks/useOpenSky';
import { useSatellites } from './hooks/useSatellites';
import { useVessels } from './hooks/useVessels';
import { useThreatData } from './hooks/useThreatData';
import { Aircraft, Vessel, ThreatEvent, MapLayer } from './types';
import './app.css';

const INITIAL_LAYERS: MapLayer[] = [
  { id: 'aircraft', label: 'AIRCRAFT', active: true, color: '#00d4ff' },
  { id: 'maritime', label: 'MARITIME', active: true, color: '#00ff88' },
  { id: 'satellites', label: 'SATELLITES', active: true, color: '#ff00ff' },
  { id: 'threats', label: 'THREATS', active: true, color: '#ff4444' },
];

export default function App() {
  const mapRef = useRef<L.Map | null>(null);
  const [layers, setLayers] = useState<MapLayer[]>(INITIAL_LAYERS);
  const [activeFilters, setActiveFilters] = useState<string[]>(['commercial', 'military', 'satellites', 'maritime']);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);

  // Real data hooks
  const { aircraft, loading: aircraftLoading, error: aircraftError, lastUpdate, totalCount } = useOpenSky('Global');
  const { satellites } = useSatellites();
  const { vessels } = useVessels();
  const { threats } = useThreatData();

  const handleLayerToggle = useCallback((id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  }, []);

  const handleFilterToggle = useCallback((f: string) => {
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMouseCoords({ lat, lng });
    // Deselect entities when clicking empty area
    setSelectedAircraft(null);
    setSelectedVessel(null);
    setSelectedThreat(null);
  }, []);

  const handleAircraftSelect = useCallback((a: Aircraft) => {
    setSelectedAircraft(a);
    setSelectedVessel(null);
    setSelectedThreat(null);
  }, []);

  const handleVesselSelect = useCallback((v: Vessel) => {
    setSelectedVessel(v);
    setSelectedAircraft(null);
    setSelectedThreat(null);
  }, []);

  const handleThreatSelect = useCallback((t: ThreatEvent) => {
    setSelectedThreat(t);
    setSelectedAircraft(null);
    setSelectedVessel(null);
    // Fly to threat
    if (mapRef.current) {
      mapRef.current.flyTo([t.lat, t.lng], 6, { duration: 1.5 });
    }
  }, []);

  const handleClose = useCallback(() => {
    setSelectedAircraft(null);
    setSelectedVessel(null);
    setSelectedThreat(null);
  }, []);

  return (
    <div className="bond-osint w-screen h-screen overflow-hidden bg-[#050810] relative select-none">
      {/* Top status bar */}
      <StatusBar
        aircraftCount={totalCount}
        vesselCount={vessels.length}
        threatCount={threats.length}
        aircraftLoading={aircraftLoading}
        error={aircraftError}
      />

      {/* Map - full viewport */}
      <div className="absolute inset-0 top-5 bottom-[104px]">
        <TacticalMap
          aircraft={aircraft}
          vessels={vessels}
          satellites={satellites}
          threats={threats}
          layers={layers}
          onMapClick={handleMapClick}
          onAircraftSelect={handleAircraftSelect}
          onVesselSelect={handleVesselSelect}
          onThreatSelect={handleThreatSelect}
          mapRef={mapRef}
        />
      </div>

      {/* HUD overlays on map */}
      <div className="absolute inset-0 top-5 bottom-[104px] pointer-events-none z-20">
        <div className="pointer-events-auto">
          <HUD
            mouseCoords={mouseCoords}
            totalAircraft={totalCount}
            totalVessels={vessels.length}
            totalThreats={threats.length}
            isLive={true}
            lastUpdate={lastUpdate}
            aircraftLoading={aircraftLoading}
          />
        </div>
      </div>

      {/* Left panel */}
      <div className="absolute left-0 top-5 bottom-[104px] z-30 pointer-events-auto">
        <LeftPanel
          layers={layers}
          onLayerToggle={handleLayerToggle}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
        />
      </div>

      {/* Right panel */}
      <div className="absolute right-0 top-5 bottom-[104px] z-30 pointer-events-auto overflow-y-auto">
        <RightPanel
          selectedAircraft={selectedAircraft}
          selectedVessel={selectedVessel}
          selectedThreat={selectedThreat}
          onClose={handleClose}
        />
      </div>

      {/* Timeline at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        <Timeline />
      </div>
    </div>
  );
}
