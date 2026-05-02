import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import MapMouseTracker from './MapMouseTracker';
import L from 'leaflet';
import { Aircraft, Vessel, ThreatEvent, SatellitePass } from '../types';

// ─── Icon Factories ────────────────────────────────────────────────────────────
function aircraftIcon(heading: number, category: string) {
  const color = category === 'military' ? '#ff6b35' : '#00d4ff';
  const size = category === 'military' ? 14 : 10;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      transform:rotate(${heading}deg);
      display:flex;align-items:center;justify-content:center;
    ">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" xmlns="http://www.w3.org/2000/svg"
        style="filter:drop-shadow(0 0 3px ${color})">
        <path d="M12 2L8 12H5L8 14L7 22L12 19L17 22L16 14L19 12H16Z"/>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function vesselIcon(type: string) {
  const color = type === 'military' ? '#ff3366' : type === 'tanker' ? '#ffaa00' : '#00d4ff';
  return L.divIcon({
    className: '',
    html: `<div style="width:10px;height:10px;display:flex;align-items:center;justify-content:center;">
      <svg viewBox="0 0 24 24" width="10" height="10" fill="${color}" xmlns="http://www.w3.org/2000/svg"
        style="filter:drop-shadow(0 0 3px ${color})">
        <path d="M20 21H4L2 14L12 11L22 14Z"/>
        <rect x="10" y="6" width="4" height="5"/>
      </svg>
    </div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

function threatIcon(type: string, severity: string) {
  const colors: Record<string, string> = {
    critical: '#ff3366', high: '#ff6b35', medium: '#ffaa00', low: '#00d4ff',
  };
  const shapes: Record<string, string> = {
    kinetic: 'M12 2L2 22H22Z',
    retaliation: 'M12 2L22 12L12 22L2 12Z',
    civilian: 'M12 2A10 10 0 1 0 12 22A10 10 0 0 0 12 2Z',
    infrastructure: 'M2 2H22V22H2Z',
    escalation: 'M12 2L15 9H22L16 14L18 22L12 17L6 22L8 14L2 9H9Z',
  };
  const c = colors[severity] || '#ffaa00';
  const path = shapes[type] || shapes.kinetic;
  const pulse = severity === 'critical' ? `
    <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:${c}33;animation:pulse-ring 1.5s ease-out infinite;top:-4px;left:-4px;"></div>
  ` : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:16px;height:16px;">
      ${pulse}
      <svg viewBox="0 0 24 24" width="16" height="16" fill="${c}" xmlns="http://www.w3.org/2000/svg"
        style="filter:drop-shadow(0 0 4px ${c})">
        <path d="${path}"/>
      </svg>
    </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function satelliteIcon(type: string) {
  const c = type === 'radar' ? '#ff6b35' : '#00ff88';
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;display:flex;align-items:center;justify-content:center;">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="${c}" stroke-width="2"
        xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 4px ${c})">
        <circle cx="12" cy="12" r="3"/>
        <line x1="3" y1="3" x2="9" y2="9"/>
        <line x1="15" y1="9" x2="21" y2="3"/>
        <line x1="15" y1="15" x2="21" y2="21"/>
        <line x1="3" y1="21" x2="9" y2="15"/>
        <line x1="12" y1="2" x2="12" y2="9"/>
        <line x1="22" y1="12" x2="15" y2="12"/>
      </svg>
    </div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

// ─── Satellite Ground Track ─────────────────────────────────────────────────
function SatTrack({ sat }: { sat: SatellitePass }) {
  const points: [number, number][] = [];
  for (let i = -5; i <= 5; i++) {
    points.push([
      Math.max(-85, Math.min(85, sat.lat - i * 2.5)),
      sat.lng - i * 3,
    ]);
  }
  const c = sat.type === 'radar' ? '#ff6b35' : '#00ff88';
  return (
    <Polyline
      positions={points}
      pathOptions={{ color: c, weight: 1, opacity: 0.4, dashArray: '4 6' }}
    />
  );
}

// ─── Map Resizer ────────────────────────────────────────────────────────────
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// ─── Popup Components ────────────────────────────────────────────────────────
function AircraftPopup({ ac }: { ac: Aircraft }) {
  return (
    <div style={{ background: '#040810', color: '#00d4ff', border: '1px solid #00d4ff33', padding: '10px', minWidth: '200px', fontFamily: 'monospace', fontSize: '11px' }}>
      <div style={{ borderBottom: '1px solid #00d4ff33', paddingBottom: '6px', marginBottom: '6px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: 2 }}>{ac.callsign}</span>
        <span style={{ float: 'right', background: ac.category === 'military' ? '#ff6b3533' : '#00d4ff22', color: ac.category === 'military' ? '#ff6b35' : '#00d4ff', padding: '1px 6px', fontSize: '9px', borderRadius: '2px' }}>
          {ac.category.toUpperCase()}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#8899aa' }}>
        <span>ICAO24</span><span style={{ color: '#fff' }}>{ac.icao24.toUpperCase()}</span>
        <span>COUNTRY</span><span style={{ color: '#fff' }}>{ac.country}</span>
        <span>ALT</span><span style={{ color: '#fff' }}>{Math.round(ac.altitude).toLocaleString()}m</span>
        <span>SPEED</span><span style={{ color: '#fff' }}>{Math.round(ac.velocity)} kts</span>
        <span>HEADING</span><span style={{ color: '#fff' }}>{Math.round(ac.heading)}°</span>
        <span>V/S</span><span style={{ color: ac.verticalRate > 0 ? '#00ff88' : '#ff3366' }}>{ac.verticalRate > 0 ? '▲' : '▼'} {Math.abs(Math.round(ac.verticalRate))} m/s</span>
        {ac.squawk && <><span>SQUAWK</span><span style={{ color: ac.squawk === '7700' || ac.squawk === '7600' ? '#ff3366' : '#fff' }}>{ac.squawk}</span></>}
      </div>
    </div>
  );
}

function ThreatPopup({ ev }: { ev: ThreatEvent }) {
  const sc = { critical: '#ff3366', high: '#ff6b35', medium: '#ffaa00', low: '#00d4ff' };
  const c = sc[ev.severity];
  return (
    <div style={{ background: '#040810', color: '#c8d8e8', border: `1px solid ${c}44`, padding: '10px', minWidth: '220px', fontFamily: 'monospace', fontSize: '11px' }}>
      <div style={{ color: c, fontWeight: 700, marginBottom: 6, fontSize: 12, letterSpacing: 1 }}>{ev.title}</div>
      <div style={{ color: '#8899aa', marginBottom: 8, fontSize: 10, lineHeight: 1.5 }}>{ev.description}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '10px' }}>
        <span style={{ color: '#8899aa' }}>TYPE</span><span style={{ color: '#fff' }}>{ev.type.toUpperCase()}</span>
        <span style={{ color: '#8899aa' }}>SOURCE</span><span style={{ color: '#fff' }}>{ev.source}</span>
        <span style={{ color: '#8899aa' }}>SEVERITY</span><span style={{ color: c }}>{ev.severity.toUpperCase()}</span>
        <span style={{ color: '#8899aa' }}>CONF</span><span style={{ color: '#00ff88' }}>{ev.confidence}%</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 9, color: '#4a6070' }}>
        {new Date(ev.timestamp).toISOString().replace('T', ' ').slice(0, 19)} Z
      </div>
    </div>
  );
}

// ─── Main Map ────────────────────────────────────────────────────────────────
interface WorldMapProps {
  aircraft: Aircraft[];
  vessels: Vessel[];
  threats: ThreatEvent[];
  satellites: SatellitePass[];
  layers: { [id: string]: boolean };
  selectedAircraft: Aircraft | null;
  onSelectAircraft: (ac: Aircraft | null) => void;
  onMouseMove: (lat: number, lng: number) => void;
}

export default function WorldMap({
  aircraft, vessels, threats, satellites, layers,
  selectedAircraft, onSelectAircraft, onMouseMove,
}: WorldMapProps) {
  return (
    <MapContainer
      center={[30, 50]}
      zoom={5}
      className="w-full h-full"
      zoomControl={false}
      maxBounds={[[-90, -180], [90, 180]]}
      minZoom={3}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=""
        opacity={1}
      />
      <MapResizer />
      <MapMouseTracker onMove={onMouseMove} />

      {/* Satellite Ground Tracks */}
      {layers.satellites && satellites.map(s => (
        <SatTrack key={s.id} sat={s} />
      ))}

      {/* Satellite Markers */}
      {layers.satellites && satellites.map(s => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={satelliteIcon(s.type)}>
          <Popup>
            <div style={{ background: '#040810', color: '#00ff88', padding: '8px', fontFamily: 'monospace', fontSize: '11px', minWidth: '160px' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
              <div style={{ color: '#8899aa' }}>TYPE: <span style={{ color: '#fff' }}>{s.type.toUpperCase()}</span></div>
              <div style={{ color: '#8899aa' }}>ALT: <span style={{ color: '#fff' }}>{s.altitude} km</span></div>
              <div style={{ color: '#8899aa' }}>INCL: <span style={{ color: '#fff' }}>{s.inclination}°</span></div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Threat Events */}
      {layers.threats && threats.map(ev => (
        <Marker key={ev.id} position={[ev.lat, ev.lng]} icon={threatIcon(ev.type, ev.severity)}>
          <Popup><ThreatPopup ev={ev} /></Popup>
        </Marker>
      ))}

      {/* Maritime Vessels */}
      {layers.maritime && vessels.map(v => (
        <Marker key={v.id} position={[v.lat, v.lng]} icon={vesselIcon(v.type)}>
          <Popup>
            <div style={{ background: '#040810', color: '#00d4ff', padding: '10px', fontFamily: 'monospace', fontSize: '11px', minWidth: '180px' }}>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12 }}>{v.name}</div>
              <div style={{ color: '#8899aa', marginBottom: 4 }}>FLAG: {v.flag} | TYPE: {v.type.toUpperCase()}</div>
              <div style={{ color: '#8899aa' }}>HDG: {Math.round(v.heading)}° | SPD: {Math.round(v.speed)} kts</div>
              <div style={{ color: '#4a6070', fontSize: 9, marginTop: 4 }}>{v.lat.toFixed(4)}°N {v.lng.toFixed(4)}°E</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Aircraft */}
      {layers.commercial && aircraft.filter(a => a.category === 'commercial').map(ac => (
        <Marker
          key={ac.icao24}
          position={[ac.lat, ac.lng]}
          icon={aircraftIcon(ac.heading, ac.category)}
          eventHandlers={{ click: () => onSelectAircraft(ac) }}
        >
          <Popup><AircraftPopup ac={ac} /></Popup>
        </Marker>
      ))}

      {layers.military && aircraft.filter(a => a.category === 'military').map(ac => (
        <Marker
          key={ac.icao24}
          position={[ac.lat, ac.lng]}
          icon={aircraftIcon(ac.heading, ac.category)}
          eventHandlers={{ click: () => onSelectAircraft(ac) }}
        >
          <Popup><AircraftPopup ac={ac} /></Popup>
        </Marker>
      ))}

      {/* Selected aircraft range ring */}
      {selectedAircraft && (
        <>
          <Circle
            center={[selectedAircraft.lat, selectedAircraft.lng]}
            radius={50000}
            pathOptions={{ color: '#00d4ff', weight: 1, fillOpacity: 0.05, dashArray: '5 10' }}
          />
          <Circle
            center={[selectedAircraft.lat, selectedAircraft.lng]}
            radius={100000}
            pathOptions={{ color: '#00d4ff', weight: 0.5, fillOpacity: 0, dashArray: '2 8' }}
          />
        </>
      )}
    </MapContainer>
  );
}
