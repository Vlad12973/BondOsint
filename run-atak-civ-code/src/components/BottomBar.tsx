import { useState, useEffect } from 'react';
import { Pause, Play, ChevronLeft, ChevronRight, FastForward } from 'lucide-react';

interface BottomBarProps {
  layers: { [key: string]: boolean };
  setLayers: (l: { [key: string]: boolean }) => void;
}

const FILTER_PILLS = [
  { id: 'commercial', label: 'Commercial Flights', color: '#00d4ff', icon: '✈' },
  { id: 'military', label: 'Military Flights', color: '#ff6b35', icon: '⚡' },
  { id: 'jamming', label: 'GPS Jamming', color: '#ff3366', icon: '⊗', standalone: true },
  { id: 'threats', label: 'Ground Truth Cards', color: '#ff3366', icon: '⊛' },
  { id: 'satellites', label: 'Imaging Satellites', color: '#00ff88', icon: '◈' },
  { id: 'maritime', label: 'Maritime Traffic', color: '#ffaa00', icon: '⚓' },
  { id: 'airspace', label: 'Airspace Closures', color: '#ff3366', icon: '⬟', standalone: true },
  { id: 'vhf', label: 'VHF Intercept', color: '#c77dff', icon: '◎', standalone: true },
];

const LEGEND_ITEMS = [
  { label: 'Kinetic', color: '#ff3366' },
  { label: 'Retaliation', color: '#ff6b35' },
  { label: 'Civilian Impact', color: '#ffaa00' },
  { label: 'Maritime', color: '#00d4ff' },
  { label: 'Infrastructure', color: '#8899aa' },
  { label: 'Escalation', color: '#c77dff' },
  { label: 'Airspace Closure', color: '#ff3366' },
];

const SPEEDS = ['1m/s', '3m/s', '5m/s', '15m/s', '1h/s'];

export default function BottomBar({ layers, setLayers }: BottomBarProps) {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(18);
  // dragPos reserved for timeline scrubbing

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setProgress(p => {
        const next = p + 0.02 * (speed + 1);
        return next > 100 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [playing, speed]);

  const toggleLayer = (id: string) => {
    setLayers({ ...layers, [id]: !layers[id] });
  };

  // Generate timeline dots
  const dots: { pos: number; color: string }[] = [
    { pos: 8, color: '#ff3366' }, { pos: 14, color: '#ff6b35' },
    { pos: 22, color: '#ff3366' }, { pos: 31, color: '#ffaa00' },
    { pos: 38, color: '#ff3366' }, { pos: 45, color: '#c77dff' },
    { pos: 52, color: '#ffaa00' }, { pos: 58, color: '#ff6b35' },
    { pos: 65, color: '#ff3366' }, { pos: 71, color: '#00d4ff' },
    { pos: 78, color: '#ff3366' }, { pos: 85, color: '#ffaa00' },
    { pos: 92, color: '#00ff88' },
  ];

  return (
    <div style={{ background: 'rgba(4,8,16,0.98)', borderTop: '1px solid rgba(0,212,255,0.12)' }}>
      {/* Filter Pills Row */}
      <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        {FILTER_PILLS.map(p => (
          <button
            key={p.id}
            onClick={() => !p.standalone && toggleLayer(p.id)}
            className="filter-pill flex-shrink-0"
            style={{
              color: (layers[p.id] !== false || p.standalone) ? p.color : '#4a6070',
              borderColor: (layers[p.id] !== false || p.standalone) ? `${p.color}55` : 'rgba(0,212,255,0.1)',
              background: (layers[p.id] !== false || p.standalone) ? `${p.color}11` : 'transparent',
            }}
          >
            <span style={{ fontSize: 10 }}>{p.icon}</span>
            {p.label}
          </button>
        ))}

        <div style={{ width: 1, height: 16, background: 'rgba(0,212,255,0.15)', margin: '0 4px', flexShrink: 0 }} />

        {LEGEND_ITEMS.map(item => (
          <div key={item.label} className="flex items-center gap-1 flex-shrink-0 px-1">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 8, color: '#4a6070', letterSpacing: 0.5 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline Row */}
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPlaying(p => !p)}
            className="p-1 rounded"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button className="p-1 rounded" style={{ background: 'transparent', color: '#4a6070' }}>
            <ChevronLeft size={12} />
          </button>
          <button className="p-1 rounded" style={{ background: 'transparent', color: '#4a6070' }}>
            <ChevronRight size={12} />
          </button>
          <button className="p-1 rounded" style={{ background: 'transparent', color: '#4a6070' }}>
            <FastForward size={12} />
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex gap-1">
          {SPEEDS.map((s, i) => (
            <button
              key={s}
              onClick={() => setSpeed(i)}
              style={{
                padding: '1px 6px',
                borderRadius: 2,
                fontSize: 9,
                fontWeight: speed === i ? 700 : 400,
                background: speed === i ? 'rgba(0,212,255,0.15)' : 'transparent',
                border: `1px solid ${speed === i ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.1)'}`,
                color: speed === i ? '#00d4ff' : '#4a6070',
                letterSpacing: 0.5,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Timeline track */}
        <div className="flex-1 relative" style={{ height: 20, display: 'flex', alignItems: 'center' }}>
          {/* Track */}
          <div style={{ position: 'relative', height: 3, background: 'rgba(0,212,255,0.08)', borderRadius: 2, flex: 1 }}>
            {/* Progress */}
            <div style={{ position: 'absolute', left: 0, width: `${progress}%`, height: '100%', background: 'rgba(0,212,255,0.5)', borderRadius: 2 }} />
            
            {/* Event dots */}
            {dots.map((d, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${d.pos}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 6, height: 6,
                borderRadius: '50%',
                background: d.color,
                boxShadow: `0 0 4px ${d.color}`,
                zIndex: 2,
              }} />
            ))}

            {/* Playhead */}
            <div style={{
              position: 'absolute',
              left: `${progress}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 10, height: 10,
              borderRadius: '50%',
              background: '#00d4ff',
              boxShadow: '0 0 8px #00d4ff',
              zIndex: 3,
              cursor: 'pointer',
            }} />
          </div>
        </div>

        {/* Time labels */}
        <div className="flex gap-4" style={{ fontSize: 9, color: '#4a6070', flexShrink: 0 }}>
          {['00:00Z', '06:00Z', '12:00Z', '18:00Z', '24:00Z'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
