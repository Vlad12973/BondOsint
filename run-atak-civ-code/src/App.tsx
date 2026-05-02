import { useState, useCallback } from 'react';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import BottomBar from './components/BottomBar';
import WorldMap from './components/WorldMap';
import HUDOverlay from './components/HUDOverlay';
import { useAircraft } from './hooks/useAircraft';
import { useOSINTData } from './hooks/useOSINTData';
import { Aircraft } from './types';

const DEFAULT_LAYERS: { [key: string]: boolean } = {
  commercial: true,
  military: true,
  maritime: true,
  threats: true,
  satellites: true,
};

export default function App() {
  const [isLive, setIsLive] = useState(true);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [density, setDensity] = useState(35);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { aircraft, loading: acLoading, lastUpdated } = useAircraft(isLive);
  const { vessels, threats, satellites, alerts } = useOSINTData();

  // Throttle density - filter aircraft by density %
  const visibleAircraft = aircraft.slice(0, Math.max(10, Math.floor(aircraft.length * density / 100)));

  const handleMouseMove = useCallback((lat: number, lng: number) => {
    setMouseCoords({ lat, lng });
  }, []);

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', width: '100vw',
        overflow: 'hidden', background: '#04080f',
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      {/* TOP BAR */}
      <TopBar
        isLive={isLive}
        setIsLive={setIsLive}
        aircraftCount={visibleAircraft.length}
        vesselCount={vessels.length}
        threatCount={threats.length}
        lastUpdated={lastUpdated}
      />

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* LEFT PANEL */}
        <LeftPanel
          threats={threats}
          alerts={alerts}
          layers={layers}
          setLayers={setLayers}
          mouseCoords={mouseCoords}
        />

        {/* MAP CENTER */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Map */}
          <WorldMap
            aircraft={visibleAircraft}
            vessels={vessels}
            threats={threats}
            satellites={satellites}
            layers={layers}
            selectedAircraft={selectedAircraft}
            onSelectAircraft={setSelectedAircraft}
            onMouseMove={handleMouseMove}
          />

          {/* HUD Overlay on top of map */}
          <HUDOverlay
            mouseCoords={mouseCoords}
            aircraftCount={visibleAircraft.length}
            threatCount={threats.length}
          />

          {/* Loading indicator */}
          {acLoading && (
            <div style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(4,8,16,0.9)', border: '1px solid rgba(0,212,255,0.3)',
              padding: '4px 12px', borderRadius: 2, fontSize: 9,
              color: '#00d4ff', letterSpacing: 2, zIndex: 700,
            }}>
              ⟳ FETCHING LIVE ADS-B FEED...
            </div>
          )}

          {/* Crosshair */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none', zIndex: 600,
          }}>
            <div style={{ position: 'relative', width: 20, height: 20 }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,212,255,0.4)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(0,212,255,0.4)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, borderRadius: '50%', background: '#00d4ff' }} />
            </div>
          </div>

          {/* Selected aircraft dismiss */}
          {selectedAircraft && (
            <button
              onClick={() => setSelectedAircraft(null)}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 700,
                background: 'rgba(4,8,16,0.9)', border: '1px solid rgba(0,212,255,0.3)',
                color: '#4a6070', fontSize: 9, padding: '3px 8px', borderRadius: 2,
                letterSpacing: 1, cursor: 'pointer',
              }}
            >
              ✕ CLEAR TRACK
            </button>
          )}
        </div>

        {/* RIGHT PANEL */}
        <RightPanel
          selectedAircraft={selectedAircraft}
          threats={threats}
          layers={layers}
          density={density}
          setDensity={setDensity}
        />
      </div>

      {/* BOTTOM BAR */}
      <BottomBar layers={layers} setLayers={setLayers} />
    </div>
  );
}
