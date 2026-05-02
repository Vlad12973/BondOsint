import { useState } from 'react';
import { Aircraft, Vessel, ThreatEvent } from '../types';

interface RightPanelProps {
  selectedAircraft: Aircraft | null;
  selectedVessel: Vessel | null;
  selectedThreat: ThreatEvent | null;
  onClose: () => void;
}

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  color?: string;
  displayValue?: string;
}

function SliderControl({ label, value, onChange, min = 0, max = 100, color = '#00d4ff', displayValue }: SliderControlProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-mono text-gray-400 tracking-wider uppercase">{label}</span>
        <span className="text-[9px] font-mono text-cyan-300">{displayValue || `${value}%`}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-0.5 appearance-none rounded-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${(value / max) * 100}%, #1a2a3a ${(value / max) * 100}%, #1a2a3a 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function AircraftDetail({ aircraft, onClose }: { aircraft: Aircraft; onClose: () => void }) {
  const altFt = aircraft.baro_altitude ? (aircraft.baro_altitude * 3.28084).toFixed(0) : 'N/A';
  const speedKts = aircraft.velocity ? (aircraft.velocity * 1.94384).toFixed(0) : 'N/A';
  const vsRating = aircraft.vertical_rate
    ? aircraft.vertical_rate > 0 ? '▲ CLIMBING' : aircraft.vertical_rate < -1 ? '▼ DESCENDING' : '→ LEVEL'
    : 'UNKNOWN';

  return (
    <div className="border border-cyan-700/40 rounded-sm p-3 bg-cyan-950/20">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-xs font-mono text-white font-bold">{aircraft.callsign}</div>
          <div className="text-[9px] font-mono text-cyan-400">ICAO: {aircraft.icao24.toUpperCase()}</div>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-red-400 text-[10px]">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {[
          { label: 'COUNTRY', value: aircraft.origin_country },
          { label: 'ALTITUDE', value: `${altFt} ft` },
          { label: 'SPEED', value: `${speedKts} kts` },
          { label: 'HEADING', value: `${aircraft.true_track?.toFixed(0) || 'N/A'}°` },
          { label: 'V/RATE', value: vsRating },
          { label: 'SQUAWK', value: aircraft.squawk || 'N/A' },
          { label: 'CATEGORY', value: `CAT-${aircraft.category}` },
          { label: 'STATUS', value: aircraft.isMillitary ? '🔴 MILITARY' : '🔵 CIVIL' },
        ].map(item => (
          <div key={item.label} className="bg-black/20 rounded px-2 py-1">
            <div className="text-[8px] font-mono text-gray-500">{item.label}</div>
            <div className="text-[9px] font-mono text-gray-200">{item.value}</div>
          </div>
        ))}
      </div>
      {aircraft.squawk === '7700' && (
        <div className="mt-2 px-2 py-1 bg-red-900/40 border border-red-500/50 rounded-sm text-[9px] font-mono text-red-300 animate-pulse">
          ⚠ EMERGENCY SQUAWK 7700 DETECTED
        </div>
      )}
      {aircraft.squawk === '7600' && (
        <div className="mt-2 px-2 py-1 bg-orange-900/40 border border-orange-500/50 rounded-sm text-[9px] font-mono text-orange-300 animate-pulse">
          ⚠ RADIO FAILURE SQUAWK 7600
        </div>
      )}
      {aircraft.squawk === '7500' && (
        <div className="mt-2 px-2 py-1 bg-red-900/40 border border-red-500/50 rounded-sm text-[9px] font-mono text-red-200 animate-pulse">
          ⚠ HIJACK CODE SQUAWK 7500 - ALERT
        </div>
      )}
    </div>
  );
}

function VesselDetail({ vessel, onClose }: { vessel: Vessel; onClose: () => void }) {
  const shipTypeLabel: Record<number, string> = {
    70: 'CARGO', 80: 'TANKER', 60: 'PASSENGER', 30: 'FISHING',
    35: 'MILITARY', 51: 'SAR', 1: 'NAVAL VESSEL',
  };
  return (
    <div className="border border-green-700/40 rounded-sm p-3 bg-green-950/20">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-xs font-mono text-white font-bold">{vessel.name}</div>
          <div className="text-[9px] font-mono text-green-400">MMSI: {vessel.mmsi}</div>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-red-400 text-[10px]">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {[
          { label: 'TYPE', value: shipTypeLabel[vessel.shipType] || 'UNKNOWN' },
          { label: 'SPEED', value: `${vessel.speed.toFixed(1)} kts` },
          { label: 'COURSE', value: `${vessel.course.toFixed(0)}°` },
          { label: 'FLAG', value: vessel.flag || 'UNKNOWN' },
          { label: 'DEST', value: vessel.destination || 'N/A' },
          { label: 'LAT', value: vessel.latitude.toFixed(4) },
        ].map(item => (
          <div key={item.label} className="bg-black/20 rounded px-2 py-1">
            <div className="text-[8px] font-mono text-gray-500">{item.label}</div>
            <div className="text-[9px] font-mono text-gray-200">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreatDetail({ threat, onClose }: { threat: ThreatEvent; onClose: () => void }) {
  const colors = { red: 'red', orange: 'orange', green: 'green' };
  const c = colors[threat.severity];

  return (
    <div className={`border border-${c}-700/40 rounded-sm p-3 bg-${c}-950/20`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className={`text-xs font-mono text-${c}-300 font-bold`}>{threat.title}</div>
          <div className={`text-[9px] font-mono text-${c}-600`}>{threat.type.toUpperCase()}</div>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-red-400 text-[10px]">✕</button>
      </div>
      <p className="text-[9px] font-mono text-gray-300 mb-2 leading-relaxed">{threat.description}</p>
      <div className="grid grid-cols-2 gap-1">
        {[
          { label: 'SEVERITY', value: threat.severity.toUpperCase() },
          { label: 'COUNTRY', value: threat.country || 'N/A' },
          { label: 'LAT', value: threat.lat.toFixed(4) },
          { label: 'LNG', value: threat.lng.toFixed(4) },
          ...(threat.magnitude ? [{ label: 'MAG', value: `M${threat.magnitude.toFixed(1)}` }] : []),
        ].map(item => (
          <div key={item.label} className="bg-black/20 rounded px-2 py-1">
            <div className="text-[8px] font-mono text-gray-500">{item.label}</div>
            <div className={`text-[9px] font-mono text-${c}-200`}>{item.value}</div>
          </div>
        ))}
      </div>
      {threat.url && (
        <a
          href={threat.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-[8px] font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-800/40 rounded-sm py-1"
        >
          OPEN SOURCE LINK →
        </a>
      )}
    </div>
  );
}

export default function RightPanel({ selectedAircraft, selectedVessel, selectedThreat, onClose }: RightPanelProps) {
  const [bloom, setBloom] = useState(200);
  const [sharpen, setSharpen] = useState(72);
  const [opacity, setOpacity] = useState(35);
  const [panopticActive, setPanopticActive] = useState(true);

  return (
    <div className="absolute right-2 top-20 z-40 w-52 space-y-2">
      {/* Selected Entity Detail */}
      {selectedAircraft && <AircraftDetail aircraft={selectedAircraft} onClose={onClose} />}
      {selectedVessel && <VesselDetail vessel={selectedVessel} onClose={onClose} />}
      {selectedThreat && <ThreatDetail threat={selectedThreat} onClose={onClose} />}

      {/* HAZE Control */}
      <div className="border border-cyan-900/40 rounded-sm p-2 bg-black/60 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-mono text-gray-500 tracking-widest">HAZE</span>
          <button className="text-[9px] font-mono text-cyan-500 border border-cyan-800/40 px-1.5 py-0.5 rounded-sm">▶</button>
        </div>
        
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 border border-cyan-700/30 rounded-sm bg-cyan-950/20">
          <span className="text-[8px]">✦</span>
          <span className="text-[9px] font-mono text-cyan-300 flex-1">BLOOM</span>
        </div>
        <SliderControl label="" value={bloom} onChange={setBloom} max={400} displayValue={`${bloom}%`} color="#00d4ff" />
        
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 border border-cyan-700/30 rounded-sm bg-cyan-950/20">
          <span className="text-[8px]">◎</span>
          <span className="text-[9px] font-mono text-cyan-300 flex-1">SHARPEN</span>
        </div>
        <SliderControl label="" value={sharpen} onChange={setSharpen} displayValue={`${sharpen}%`} color="#00d4ff" />

        {/* HUD Control */}
        <div className="border-t border-cyan-900/30 pt-2 mt-2">
          <div className="flex items-center gap-2 mb-2 px-2 py-1.5 border border-cyan-700/30 rounded-sm bg-cyan-950/20">
            <span className="text-[9px] font-mono text-cyan-300">HUD</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono text-gray-500">LAYOUT</span>
            <span className="text-[9px] font-mono text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded-sm">
              Tactical ▾
            </span>
          </div>
        </div>

        {/* PANOPTIC */}
        <button
          onClick={() => setPanopticActive(p => !p)}
          className={`w-full py-1.5 text-[9px] font-mono tracking-[0.2em] font-bold rounded-sm border transition-all ${
            panopticActive
              ? 'bg-green-600/30 border-green-500/60 text-green-300'
              : 'bg-gray-800/30 border-gray-700/60 text-gray-500'
          }`}
        >
          {panopticActive ? '● ' : '○ '}PANOPTIC
        </button>

        <div className="mt-2">
          <SliderControl label="OPACITY" value={opacity} onChange={setOpacity} displayValue={`${opacity}%`} color="#00ff88" />
        </div>

        <div className="flex gap-3 mt-1">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" className="w-2 h-2 accent-cyan-500" />
            <span className="text-[8px] font-mono text-gray-500">Flights</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-2 h-2 accent-cyan-500" />
            <span className="text-[8px] font-mono text-gray-500">Satellites</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" className="w-2 h-2 accent-cyan-500" />
            <span className="text-[8px] font-mono text-gray-500">Maritime</span>
          </label>
        </div>

        <button className="w-full mt-2 py-1 text-[9px] font-mono text-gray-500 hover:text-gray-300 border border-gray-800/50 rounded-sm hover:border-gray-600 transition-all">
          CLEAR UI
        </button>
      </div>

      {/* Live Feed */}
      <div className="border border-cyan-900/40 rounded-sm p-2 bg-black/60 backdrop-blur-sm">
        <div className="text-[9px] font-mono text-gray-500 tracking-widest mb-2">SIGINT FEED</div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {[
            { time: '07:42Z', type: 'KINETIC', msg: 'BUSHEHR STRIKE REPORTS', sev: 'red' },
            { time: '07:38Z', type: 'KINETIC', msg: 'KERMANSHAH WAVE', sev: 'red' },
            { time: '07:35Z', type: 'KINETIC', msg: 'QOM IMPACT REPORTS', sev: 'orange' },
            { time: '07:26Z', type: 'KINETIC', msg: 'DEFENSE MINISTRY / AEOI', sev: 'orange' },
            { time: '07:22Z', type: 'KINETIC', msg: 'NIAVARAN COMPOUND', sev: 'red' },
            { time: '07:18Z', type: 'SIGINT', msg: 'VHF INTERCEPT - ENCRYPTED', sev: 'yellow' },
            { time: '07:10Z', type: 'HUMINT', msg: 'SOURCE REPORTS MOVEMENT', sev: 'green' },
          ].map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className={`text-[7px] font-mono px-1 py-0.5 rounded-sm flex-shrink-0 ${
                item.sev === 'red' ? 'bg-red-900/40 text-red-300' :
                item.sev === 'orange' ? 'bg-orange-900/40 text-orange-300' :
                item.sev === 'yellow' ? 'bg-yellow-900/40 text-yellow-300' :
                'bg-green-900/40 text-green-300'
              }`}>{item.type}</span>
              <div>
                <div className="text-[8px] font-mono text-gray-500">{item.time} UTC</div>
                <div className="text-[9px] font-mono text-gray-300">{item.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
