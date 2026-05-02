import { useState, useEffect, useRef } from 'react';
import { ThreatEvent } from '../types';

interface IntelFeedProps {
  threats: ThreatEvent[];
  onThreatSelect: (t: ThreatEvent) => void;
}

const LIVE_INTEL: Array<{
  type: 'KINETIC' | 'SIGINT' | 'HUMINT' | 'IMINT' | 'OSINT' | 'CYBER';
  title: string;
  time: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  coords?: string;
}> = [
  { type: 'KINETIC', title: 'DEFENSE MINISTRY / AEOI', time: '07:26 UTC', severity: 'critical', coords: '35.7N 51.4E' },
  { type: 'KINETIC', title: 'QOM IMPACT REPORTS', time: '07:35 UTC', severity: 'critical', coords: '34.6N 50.9E' },
  { type: 'KINETIC', title: 'KERMANSHAH WAVE DETECTED', time: '07:38 UTC', severity: 'critical', coords: '34.3N 47.0E' },
  { type: 'KINETIC', title: 'BUSHEHR STRIKE REPORTS', time: '07:42 UTC', severity: 'critical', coords: '28.9N 50.8E' },
  { type: 'SIGINT', title: 'VHF INTERCEPT - ENCRYPTED BURST', time: '07:15 UTC', severity: 'high' },
  { type: 'IMINT', title: 'SATELLITE PASS WINDOW - WORLDVIEW-3', time: '07:50 UTC', severity: 'medium' },
  { type: 'OSINT', title: 'TEHRAN INTERNET DEGRADATION CONFIRMED', time: '07:55 UTC', severity: 'high', coords: '35.7N 51.4E' },
  { type: 'CYBER', title: 'BGP ROUTE HIJACK DETECTED - IRAN NETWORKS', time: '08:02 UTC', severity: 'high' },
  { type: 'HUMINT', title: 'SOURCE REPORTS ELEVATED MILITARY ACTIVITY', time: '08:10 UTC', severity: 'medium' },
  { type: 'SIGINT', title: 'DPRK MILITARY FREQUENCY SPIKE', time: '08:15 UTC', severity: 'high', coords: '40.0N 127.5E' },
  { type: 'IMINT', title: 'PLA NAVAL GROUP COMPOSITION UPDATED', time: '08:20 UTC', severity: 'high', coords: '24.0N 121.0E' },
  { type: 'OSINT', title: 'HEAVY SHELLING REPORTED EASTERN UKRAINE', time: '08:25 UTC', severity: 'critical', coords: '48.5N 37.5E' },
];

export default function IntelFeed({ threats, onThreatSelect }: IntelFeedProps) {
  const [visible, setVisible] = useState(true);
  const [currentItems, setCurrentItems] = useState<typeof LIVE_INTEL>([]);
  const [, setNewItemIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  // Simulate live feed - add new items over time
  useEffect(() => {
    setCurrentItems(LIVE_INTEL.slice(0, 4));

    const interval = setInterval(() => {
      setNewItemIndex(i => {
        const next = (i + 1) % LIVE_INTEL.length;
        setCurrentItems(prev => {
          const updated = [LIVE_INTEL[next], ...prev].slice(0, 12);
          return updated;
        });
        return next;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const typeColors: Record<string, string> = {
    KINETIC: '#ff3333',
    SIGINT: '#ff8800',
    HUMINT: '#ffdd00',
    IMINT: '#00d4ff',
    OSINT: '#00ff88',
    CYBER: '#ff44ff',
  };

  return (
    <div className="absolute left-[200px] top-24 z-30 w-64">
      {/* Intel feed panel */}
      <div className="bg-black/80 border border-cyan-900/50 rounded-sm backdrop-blur-sm">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan-900/30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-mono text-gray-400 tracking-widest">INTEL FEED // LIVE</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-[9px] font-mono text-gray-600 hover:text-gray-400"
          >
            ✕
          </button>
        </div>

        <div ref={feedRef} className="max-h-72 overflow-y-auto">
          {currentItems.map((item, i) => (
            <div
              key={`${item.title}-${i}`}
              className={`px-3 py-2 border-b border-cyan-900/20 cursor-pointer hover:bg-cyan-900/10 transition-all ${
                i === 0 ? 'bg-red-900/10' : ''
              }`}
              onClick={() => {
                // Find matching threat
                const threat = threats.find(t =>
                  t.title.toLowerCase().includes(item.type.toLowerCase()) ||
                  Math.random() > 0.5 // Select random threat for demo
                );
                if (threat) onThreatSelect(threat);
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[7px] font-mono px-1 py-0.5 rounded-sm font-bold tracking-wider"
                  style={{
                    color: typeColors[item.type],
                    backgroundColor: `${typeColors[item.type]}20`,
                    borderLeft: `2px solid ${typeColors[item.type]}`,
                  }}
                >
                  {item.type}
                </span>
                <span className="text-[8px] font-mono text-gray-600">{item.time}</span>
                {i === 0 && <span className="text-[7px] font-mono text-red-400 animate-pulse ml-auto">NEW</span>}
              </div>
              <div className="text-[9px] font-mono text-gray-200">{item.title}</div>
              {item.coords && (
                <div className="text-[8px] font-mono text-cyan-700 mt-0.5">{item.coords}</div>
              )}
            </div>
          ))}
        </div>

        {/* Earthquake feed from USGS */}
        {threats.filter(t => t.type === 'earthquake').slice(0, 3).map(eq => (
          <div
            key={eq.id}
            className="px-3 py-1.5 border-b border-orange-900/20 cursor-pointer hover:bg-orange-900/10 transition-all"
            onClick={() => onThreatSelect(eq)}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[7px] font-mono px-1 py-0.5 rounded-sm font-bold tracking-wider text-orange-400 bg-orange-900/20 border-l-2 border-orange-400">
                SEISMIC
              </span>
              <span className="text-[8px] font-mono text-gray-600">
                {new Date(eq.timestamp).toISOString().substring(11, 16)} UTC
              </span>
            </div>
            <div className="text-[9px] font-mono text-gray-200">{eq.title} - {eq.description.substring(0, 35)}...</div>
          </div>
        ))}
      </div>
    </div>
  );
}
