import { useState } from 'react';
import { ChevronRight, Layers, Video, Globe2 } from 'lucide-react';
import { Alert } from '../types';

interface LeftPanelProps {
  threats: any[];
  alerts: Alert[];
  layers: { [key: string]: boolean };
  setLayers: (l: { [key: string]: boolean }) => void;
  mouseCoords: { lat: number; lng: number } | null;
}

const LAYER_DEFS = [
  { id: 'commercial', label: 'Commercial Flights', color: '#00d4ff', icon: '✈' },
  { id: 'military', label: 'Military Flights', color: '#ff6b35', icon: '⚡' },
  { id: 'maritime', label: 'Maritime Traffic', color: '#ffaa00', icon: '⚓' },
  { id: 'threats', label: 'Ground Truth Cards', color: '#ff3366', icon: '⊛' },
  { id: 'satellites', label: 'Imaging Satellites', color: '#00ff88', icon: '◈' },
];

export default function LeftPanel({ alerts, layers, setLayers, mouseCoords }: LeftPanelProps) {
  const [openSections, setOpenSections] = useState({ cctv: true, data: true, scenes: false });

  const toggle = (section: 'cctv' | 'data' | 'scenes') =>
    setOpenSections(p => ({ ...p, [section]: !p[section] }));

  const toggleLayer = (id: string) =>
    setLayers({ ...layers, [id]: !layers[id] });

  return (
    <div className="w-56 flex flex-col gap-1 p-2 overflow-y-auto" style={{ background: 'rgba(4,8,16,0.97)' }}>
      {/* Coords block */}
      <div className="p-2 mb-1" style={{ border: '1px solid rgba(0,212,255,0.12)', background: 'rgba(0,212,255,0.03)' }}>
        <div style={{ fontSize: 9, color: '#4a6070', marginBottom: 2, letterSpacing: 1 }}>CURSOR POSITION</div>
        {mouseCoords ? (
          <>
            <div style={{ fontSize: 10, color: '#00d4ff', fontWeight: 700 }}>
              {mouseCoords.lat.toFixed(4)}°N  {mouseCoords.lng.toFixed(4)}°E
            </div>
            <div style={{ fontSize: 9, color: '#4a6070', marginTop: 2 }}>
              MGRS: {coordToMGRS(mouseCoords.lat, mouseCoords.lng)}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 9, color: '#4a6070' }}>Hover map to track...</div>
        )}
      </div>

      {/* CCTV MESH */}
      <CollapsibleSection
        label="CCTV MESH"
        icon={<Video size={10} />}
        open={openSections.cctv}
        onToggle={() => toggle('cctv')}
        count={3}
      >
        <div className="flex flex-col gap-1 pt-1">
          {['NODE-ALPHA-01', 'NODE-BETA-07', 'NODE-GAMMA-14'].map((n, i) => (
            <div key={n} className="data-row" style={{ fontSize: 9 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: i < 2 ? '#00ff88' : '#ff3366' }} />
              <span style={{ color: '#c8d8e8' }}>{n}</span>
              <span style={{ marginLeft: 'auto', color: '#4a6070' }}>{['HD', '4K', 'IR'][i]}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* DATA LAYERS */}
      <CollapsibleSection
        label="DATA LAYERS"
        icon={<Layers size={10} />}
        open={openSections.data}
        onToggle={() => toggle('data')}
      >
        <div className="flex flex-col gap-1 pt-1">
          {LAYER_DEFS.map(l => (
            <button
              key={l.id}
              onClick={() => toggleLayer(l.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-sm w-full text-left transition-all"
              style={{
                background: layers[l.id] ? `${l.color}11` : 'transparent',
                border: `1px solid ${layers[l.id] ? `${l.color}44` : 'rgba(0,212,255,0.08)'}`,
              }}
            >
              <span style={{ color: layers[l.id] ? l.color : '#4a6070', fontSize: 11 }}>{l.icon}</span>
              <span style={{ fontSize: 9, color: layers[l.id] ? '#c8d8e8' : '#4a6070', letterSpacing: 0.5, flex: 1 }}>{l.label}</span>
              <div style={{
                width: 22, height: 11, borderRadius: 6,
                background: layers[l.id] ? l.color : 'rgba(0,212,255,0.1)',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: layers[l.id] ? 11 : 2,
                  width: 7, height: 7, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </div>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* LIVE ALERTS */}
      <CollapsibleSection
        label="LIVE ALERTS"
        icon={<Globe2 size={10} />}
        open={openSections.scenes}
        onToggle={() => toggle('scenes')}
        count={alerts.length}
        countColor="#ff3366"
      >
        <div className="flex flex-col gap-1 pt-1">
          {alerts.slice(0, 6).map(a => (
            <div
              key={a.id}
              className="fade-in"
              style={{
                padding: '5px 8px',
                border: `1px solid ${a.type === 'critical' ? '#ff336633' : a.type === 'warning' ? '#ff6b3533' : 'rgba(0,212,255,0.15)'}`,
                background: a.type === 'critical' ? '#ff336608' : 'transparent',
                borderRadius: 2,
              }}
            >
              <div style={{ fontSize: 8, color: a.type === 'critical' ? '#ff3366' : a.type === 'warning' ? '#ff6b35' : '#00d4ff', marginBottom: 2, letterSpacing: 1, fontWeight: 700 }}>
                [{a.region}] {a.type.toUpperCase()}
              </div>
              <div style={{ fontSize: 9, color: '#8899aa', lineHeight: 1.4 }}>{a.message}</div>
              <div style={{ fontSize: 8, color: '#4a6070', marginTop: 2 }}>
                {new Date(a.timestamp).toISOString().slice(11, 19)}Z
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div style={{ fontSize: 9, color: '#4a6070', padding: '6px 8px' }}>Monitoring...</div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({
  label, icon, open, onToggle, children, count, countColor
}: {
  label: string; icon: React.ReactNode; open: boolean;
  onToggle: () => void; children: React.ReactNode;
  count?: number; countColor?: string;
}) {
  return (
    <div style={{ border: '1px solid rgba(0,212,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:brightness-125 transition-all"
        style={{ background: 'rgba(0,212,255,0.05)', borderBottom: open ? '1px solid rgba(0,212,255,0.1)' : 'none' }}
      >
        <span style={{ color: '#00d4ff' }}>{icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#c8d8e8', flex: 1, textAlign: 'left' }}>{label}</span>
        {count !== undefined && (
          <span style={{ fontSize: 9, color: countColor || '#00d4ff', fontWeight: 700 }}>{count}</span>
        )}
        <ChevronRight
          size={10}
          style={{ color: '#4a6070', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>
      {open && (
        <div style={{ padding: '0 6px 6px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function coordToMGRS(lat: number, lng: number): string {
  const zone = Math.floor((lng + 180) / 6) + 1;
  const letter = 'CDEFGHJKLMNPQRSTUVWX'[Math.floor((lat + 80) / 8)];
  const x = Math.abs(Math.floor((lng % 6) * 10000));
  const y = Math.abs(Math.floor((lat % 8) * 10000));
  return `${zone}${letter} ${x.toString().padStart(4, '0')} ${y.toString().padStart(4, '0')}`;
}
