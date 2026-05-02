import { useState, useEffect } from 'react';
import { Play, Pause, Activity } from 'lucide-react';

interface TopBarProps {
  isLive: boolean;
  setIsLive: (v: boolean) => void;
  aircraftCount: number;
  vesselCount: number;
  threatCount: number;
  lastUpdated: number;
}

export default function TopBar({ isLive, setIsLive, aircraftCount, vesselCount, threatCount, lastUpdated }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  const [recBlink, setRecBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => { setTime(new Date()); setRecBlink(p => !p); }, 1000);
    return () => clearInterval(t);
  }, []);

  const zulu = time.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
  const ago = lastUpdated ? Math.round((Date.now() - lastUpdated) / 1000) : '—';

  return (
    <div className="h-9 flex items-stretch border-b" style={{ background: '#04080f', borderColor: 'rgba(0,212,255,0.15)' }}>
      {/* Classification Banner */}
      <div className="classify-banner flex items-center px-4" style={{ background: '#ff336611', borderRight: '1px solid #ff336633', color: '#ff3366', minWidth: 200, fontSize: 9 }}>
        TS // SI-TK // NOFORN // ORCON
      </div>

      {/* Logo */}
      <div className="flex items-center px-4 gap-3" style={{ borderRight: '1px solid rgba(0,212,255,0.15)' }}>
        <div className="flex items-center gap-1">
          <div style={{ width: 6, height: 6, background: '#00d4ff', borderRadius: '50%', boxShadow: '0 0 6px #00d4ff' }} />
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: 3, color: '#00d4ff' }}>WORLD</span>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: 3, color: '#fff' }}>VIEW</span>
        </div>
        <span style={{ fontSize: 8, color: '#4a6070', letterSpacing: 2 }}>NO PLACE LEFT BEHIND</span>
      </div>

      {/* Center stats */}
      <div className="flex items-center gap-6 px-6 flex-1">
        <StatChip label="AIRCRAFT" value={aircraftCount} color="#00d4ff" />
        <StatChip label="VESSELS" value={vesselCount} color="#ffaa00" />
        <StatChip label="THREATS" value={threatCount} color="#ff3366" />
        <div style={{ width: 1, height: 20, background: 'rgba(0,212,255,0.15)' }} />
        <div style={{ fontSize: 9, color: '#4a6070' }}>
          FEED UPD: <span style={{ color: '#00ff88' }}>{ago}s AGO</span>
        </div>
      </div>

      {/* LIVE / PLAYBACK */}
      <div className="flex items-center gap-2 px-4" style={{ borderLeft: '1px solid rgba(0,212,255,0.15)' }}>
        <button
          onClick={() => setIsLive(true)}
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-bold"
          style={{
            background: isLive ? '#ff336622' : 'transparent',
            border: `1px solid ${isLive ? '#ff3366' : 'rgba(0,212,255,0.2)'}`,
            color: isLive ? '#ff3366' : '#4a6070',
            letterSpacing: 1,
            fontSize: 9,
          }}
        >
          {isLive && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ff3366', marginRight: 3, opacity: recBlink ? 1 : 0, boxShadow: '0 0 6px #ff3366' }} />}
          LIVE
        </button>
        <button
          onClick={() => setIsLive(false)}
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-bold"
          style={{
            background: !isLive ? '#00d4ff22' : 'transparent',
            border: `1px solid ${!isLive ? '#00d4ff' : 'rgba(0,212,255,0.2)'}`,
            color: !isLive ? '#00d4ff' : '#4a6070',
            letterSpacing: 1,
            fontSize: 9,
          }}
        >
          {isLive ? <Play size={9} /> : <Pause size={9} />} PLAYBACK
        </button>
      </div>

      {/* REC + Time */}
      <div className="flex items-center gap-3 px-4" style={{ borderLeft: '1px solid rgba(0,212,255,0.15)', minWidth: 240 }}>
        <div style={{ fontSize: 9, color: '#4a6070' }}>
          ORB: <span style={{ color: '#fff' }}>47857</span> PASS: <span style={{ color: '#fff' }}>DESC-273</span>
        </div>
        <div className="flex items-center gap-1" style={{ fontSize: 10, color: '#00d4ff', fontWeight: 700 }}>
          <Activity size={10} className="text-green-400" />
          <span style={{ color: '#4a6070', fontSize: 9 }}>REC </span>
          <span style={{ fontSize: 9 }}>{zulu}</span>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 5px ${color}` }} />
      <span style={{ fontSize: 9, color: '#4a6070', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: 1 }}>{value}</span>
    </div>
  );
}
