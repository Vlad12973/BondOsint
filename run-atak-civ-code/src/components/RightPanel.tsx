import { useState } from 'react';
import { Eye, Maximize2, Grid } from 'lucide-react';
import { Aircraft, ThreatEvent } from '../types';

interface RightPanelProps {
  selectedAircraft: Aircraft | null;
  threats: ThreatEvent[];
  density: number;
  setDensity: (v: number) => void;
  layers: { [key: string]: boolean };
}

export default function RightPanel({ selectedAircraft, threats, density, setDensity }: RightPanelProps) {
  const [bloom, setBloom] = useState(false);
  const [sharpen, setSharpen] = useState(49);
  const [hud, setHud] = useState(true);
  const [layout, setLayout] = useState('Tactical');
  const [panoptic, setPanoptic] = useState(true);

  const criticalThreats = threats.filter(t => t.severity === 'critical');
  const highThreats = threats.filter(t => t.severity === 'high');

  return (
    <div className="w-52 flex flex-col gap-1 p-2 overflow-y-auto" style={{ background: 'rgba(4,8,16,0.97)' }}>
      {/* Active Style */}
      <div className="mb-1" style={{ fontSize: 9, color: '#4a6070', letterSpacing: 2, textAlign: 'right' }}>
        ACTIVE STYLE
        <div style={{ fontSize: 13, color: '#c8d8e8', fontWeight: 700, letterSpacing: 2 }}>NORMAL</div>
      </div>

      {/* Scene selector */}
      <div style={{ border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2 }}>
        <div className="panel-header" style={{ fontSize: 8 }}>SCENE</div>
        <div className="p-2">
          {['NORMAL', 'NIGHT', 'DESERT', 'ARCTIC'].map(s => (
            <button key={s}
              className="flex items-center gap-2 w-full px-2 py-1 rounded-sm mb-1 text-left"
              style={{
                background: layout === s ? 'rgba(0,212,255,0.1)' : 'transparent',
                border: `1px solid ${layout === s ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                fontSize: 9, color: layout === s ? '#00d4ff' : '#4a6070',
                letterSpacing: 1
              }}
              onClick={() => setLayout(s)}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: layout === s ? '#00d4ff' : '#4a6070' }} />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Controls */}
      <div style={{ border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2 }}>
        <div className="panel-header" style={{ fontSize: 8 }}>VISUAL CONTROLS</div>
        <div className="p-2 flex flex-col gap-2">
          <ToggleRow label="BLOOM" value={bloom} onChange={setBloom} icon={<Eye size={9} />} color="#00d4ff" />
          
          <div>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 9, color: '#00d4ff', letterSpacing: 1 }}>SHARPEN</span>
              <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{sharpen}%</span>
            </div>
            <input type="range" min={0} max={100} value={sharpen}
              onChange={e => setSharpen(+e.target.value)}
              style={{ width: '100%', accentColor: '#00d4ff', height: 3 }}
            />
          </div>

          <ToggleRow label="HUD" value={hud} onChange={setHud} icon={<Grid size={9} />} color="#00d4ff" />
        </div>
      </div>

      {/* Layout */}
      <div style={{ border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2 }}>
        <div className="panel-header" style={{ fontSize: 8 }}>LAYOUT</div>
        <div className="p-2">
          <select
            value={layout}
            onChange={e => setLayout(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 9, padding: '3px 6px', borderRadius: 2 }}
          >
            {['Tactical', 'Minimal', 'Full ISR', 'Fleet View'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Panoptic */}
      <div style={{
        border: `1px solid ${panoptic ? 'rgba(0,255,136,0.3)' : 'rgba(0,212,255,0.12)'}`,
        borderRadius: 2, overflow: 'hidden'
      }}>
        <button
          onClick={() => setPanoptic(p => !p)}
          className="w-full flex items-center gap-2 px-2 py-2"
          style={{ background: panoptic ? 'rgba(0,255,136,0.1)' : 'rgba(0,212,255,0.04)' }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: panoptic ? '#00ff88' : '#4a6070', boxShadow: panoptic ? '0 0 6px #00ff88' : 'none' }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: panoptic ? '#00ff88' : '#4a6070' }}>PANOPTIC</span>
        </button>
        {panoptic && (
          <div className="p-2 flex flex-col gap-2">
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: 9, color: '#00ff88', letterSpacing: 1 }}>DENSITY</span>
                <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{density}%</span>
              </div>
              <input type="range" min={10} max={100} value={density}
                onChange={e => setDensity(+e.target.value)}
                style={{ width: '100%', accentColor: '#00ff88', height: 3 }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Flashes', color: '#ff6b35' },
                { label: 'Satellites', color: '#00ff88', checked: true },
                { label: 'Maritime', color: '#ffaa00', checked: false },
              ].map(c => (
                <label key={c.label} className="flex items-center gap-1 cursor-pointer">
                  <div style={{ width: 8, height: 8, border: `1px solid ${c.color}`, background: c.checked ? c.color : 'transparent', borderRadius: 1 }} />
                  <span style={{ fontSize: 8, color: '#8899aa' }}>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Threat Summary */}
      <div style={{ border: '1px solid rgba(255,51,102,0.2)', borderRadius: 2 }}>
        <div className="panel-header" style={{ fontSize: 8, borderColor: 'rgba(255,51,102,0.2)', color: '#ff3366' }}>
          THREAT SUMMARY
        </div>
        <div className="p-2 flex flex-col gap-1">
          <ThreatRow label="CRITICAL" count={criticalThreats.length} color="#ff3366" />
          <ThreatRow label="HIGH" count={highThreats.length} color="#ff6b35" />
          <ThreatRow label="MEDIUM" count={threats.filter(t => t.severity === 'medium').length} color="#ffaa00" />
          <ThreatRow label="LOW" count={threats.filter(t => t.severity === 'low').length} color="#00d4ff" />
        </div>
      </div>

      {/* Selected Aircraft */}
      {selectedAircraft && (
        <div className="fade-in" style={{ border: '1px solid rgba(0,212,255,0.3)', borderRadius: 2 }}>
          <div className="panel-header" style={{ fontSize: 8 }}>TRACK DETAIL</div>
          <div className="p-2" style={{ fontSize: 9 }}>
            <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{selectedAircraft.callsign}</div>
            {[
              ['ORIGIN', selectedAircraft.country],
              ['TYPE', selectedAircraft.category.toUpperCase()],
              ['ALT', `${Math.round(selectedAircraft.altitude).toLocaleString()}m`],
              ['SPEED', `${Math.round(selectedAircraft.velocity)} kts`],
              ['HEADING', `${Math.round(selectedAircraft.heading)}°`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between mb-1">
                <span style={{ color: '#4a6070' }}>{k}</span>
                <span style={{ color: '#c8d8e8' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clean UI button */}
      <button
        className="w-full py-1.5 rounded-sm mt-1 flex items-center justify-center gap-2"
        style={{ border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.04)', fontSize: 9, color: '#4a6070', letterSpacing: 2 }}
      >
        <Maximize2 size={9} /> CLEAN UI
      </button>
    </div>
  );
}

function ToggleRow({ label, value, onChange, icon, color }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
  icon: React.ReactNode; color: string;
}) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 w-full">
      <span style={{ color: value ? color : '#4a6070' }}>{icon}</span>
      <span style={{ fontSize: 9, letterSpacing: 1, color: value ? color : '#4a6070', flex: 1, textAlign: 'left' }}>{label}</span>
      <div style={{
        width: 28, height: 13, borderRadius: 7,
        background: value ? color : 'rgba(0,212,255,0.1)',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 2.5, left: value ? 15 : 2.5,
          width: 8, height: 8, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
        }} />
      </div>
    </button>
  );
}

function ThreatRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 5, height: 5, background: color, borderRadius: '50%', boxShadow: `0 0 4px ${color}` }} />
      <span style={{ fontSize: 9, color: '#4a6070', flex: 1, letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 700 }}>{count}</span>
      <div style={{ height: 4, width: 40, background: 'rgba(0,212,255,0.08)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${Math.min(100, count * 15)}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}
