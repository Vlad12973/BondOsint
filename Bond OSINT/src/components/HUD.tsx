import { useState, useEffect } from 'react';

interface HUDProps {
  mouseCoords: { lat: number; lng: number } | null;
  totalAircraft: number;
  totalVessels: number;
  totalThreats: number;
  isLive: boolean;
  lastUpdate: Date | null;
  aircraftLoading: boolean;
}

function latLngToMGRS(lat: number, lng: number): string {
  // Simplified MGRS conversion
  const zoneNumber = Math.floor((lng + 180) / 6) + 1;
  const zoneLetter = 'CDEFGHJKLMNPQRSTUVWX'.charAt(Math.floor((lat + 80) / 8));
  
  // 100km grid square
  const easting = Math.abs(Math.floor((lng % 6) * 100000 / 6)) % 100000;
  const northing = Math.abs(Math.floor((lat % 8) * 100000 / 8)) % 100000;

  const gridSquares = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const e100k = gridSquares.charAt(Math.floor(easting / 10000) % 8);
  const n100k = gridSquares.charAt(Math.floor(northing / 10000) % 20);

  return `${zoneNumber}${zoneLetter} ${e100k}${n100k} ${String(Math.floor(easting % 10000)).padStart(4,'0')} ${String(Math.floor(northing % 10000)).padStart(4,'0')}`;
}

function formatDMS(deg: number, isLat: boolean): string {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d - m / 60) * 3600).toFixed(2);
  const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${d}°${String(m).padStart(2,'0')}'${String(s).padStart(5,'0')}"${dir}`;
}

export default function HUD({ mouseCoords, totalAircraft, totalVessels, totalThreats, isLive, lastUpdate, aircraftLoading }: HUDProps) {
  const [utcTime, setUtcTime] = useState('');
  const [orbitData] = useState({
    orb: Math.floor(47000 + Math.random() * 2000),
    pass: 'DESC',
    passNum: Math.floor(100 + Math.random() * 300),
  });
  const [blinkState, setBlinkState] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 23) + 'Z');
      setBlinkState(b => !b);
    };
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, []);

  const mgrs = mouseCoords ? latLngToMGRS(mouseCoords.lat, mouseCoords.lng) : 'AWAITING CURSOR';
  const latDMS = mouseCoords ? formatDMS(mouseCoords.lat, true) : '--';
  const lngDMS = mouseCoords ? formatDMS(mouseCoords.lng, false) : '--';

  return (
    <>
      {/* TOP LEFT - Classification Banner */}
      <div className="absolute top-0 left-0 z-50 p-3">
        <div className="text-[10px] tracking-[0.3em] font-mono text-red-400 font-bold animate-pulse">
          ⬛ TOP SECRET // SI-TK // NOFORN
        </div>
        <div className="text-[10px] tracking-[0.2em] font-mono text-cyan-500 mt-0.5">
          BOND-OSINT OPS-{orbitData.passNum} // PANOPTIC
        </div>
        <div className="text-[11px] tracking-[0.15em] font-mono text-green-400 font-bold mt-1">
          TACTICAL
        </div>
        <div className="text-[9px] font-mono text-gray-400 mt-1">SUMMARY</div>
        <div className="text-[9px] font-mono text-gray-300 max-w-[180px] leading-tight">
          GLOBAL NEAR-REAL-TIME INTELLIGENCE
        </div>
      </div>

      {/* TOP CENTER - BOND OSINT Brand + Live/Playback */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-spin-slow">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div>
            <div className="text-xl font-black tracking-[0.3em] text-white font-display leading-none">
              BOND<span className="text-cyan-400">OSINT</span>
            </div>
            <div className="text-[8px] tracking-[0.5em] text-gray-400 font-mono text-center">
              NO PLACE LEFT BEHIND
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-1">
          <button className={`px-3 py-0.5 text-[10px] font-mono tracking-widest border rounded-sm transition-all ${
            isLive 
              ? 'bg-green-500/20 border-green-400 text-green-300' 
              : 'bg-transparent border-gray-600 text-gray-500'
          }`}>
            {blinkState && isLive ? '● ' : ''}LIVE
          </button>
          <button className="px-3 py-0.5 text-[10px] font-mono tracking-widest border border-gray-600 text-gray-400 rounded-sm bg-gray-900/50">
            PLAYBACK
          </button>
        </div>
      </div>

      {/* TOP RIGHT - Recording + Orbit Data */}
      <div className="absolute top-3 right-3 z-50 text-right">
        <div className="text-[9px] font-mono text-gray-400 tracking-widest">
          ACTIVE STYLE
        </div>
        <div className="text-sm font-mono text-white tracking-[0.2em] font-bold">
          TACTICAL
        </div>
        <div className="flex items-center gap-1 justify-end mt-2">
          <div className={`w-2 h-2 rounded-full ${blinkState ? 'bg-red-500' : 'bg-red-900'}`} />
          <span className="text-[9px] font-mono text-gray-300">
            REC {utcTime.substring(0, 19)}Z
          </span>
        </div>
        <div className="text-[9px] font-mono text-gray-500 mt-0.5">
          ORB: {orbitData.orb} PASS: {orbitData.pass}-{orbitData.passNum}
        </div>
        
        {/* Status counts */}
        <div className="mt-2 text-right">
          <div className="text-[9px] font-mono text-cyan-400">
            ✈ {aircraftLoading ? 'LOADING...' : `${totalAircraft} AIRCRAFT`}
          </div>
          <div className="text-[9px] font-mono text-green-400">⚓ {totalVessels} VESSELS</div>
          <div className="text-[9px] font-mono text-red-400">⚠ {totalThreats} THREATS</div>
          {lastUpdate && (
            <div className="text-[8px] font-mono text-gray-600 mt-1">
              UPD: {lastUpdate.toISOString().substring(11, 19)}Z
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM LEFT - MGRS Coordinates */}
      <div className="absolute bottom-16 left-3 z-50">
        <div className="text-[9px] font-mono text-gray-500 leading-none">MGRS:</div>
        <div className="text-[12px] font-mono text-cyan-300 font-bold tracking-wider">
          {mgrs}
        </div>
        <div className="text-[10px] font-mono text-gray-400">
          {latDMS}
        </div>
        <div className="text-[10px] font-mono text-gray-400">
          {lngDMS}
        </div>
      </div>

      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.01) 2px, rgba(0,212,255,0.01) 4px)',
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </>
  );
}
