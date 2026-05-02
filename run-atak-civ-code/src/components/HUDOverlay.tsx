import { useState, useEffect } from 'react';

interface HUDOverlayProps {
  mouseCoords: { lat: number; lng: number } | null;
  aircraftCount: number;
  threatCount: number;
}

export default function HUDOverlay({ mouseCoords, aircraftCount, threatCount }: HUDOverlayProps) {
  const [fps, setFps] = useState(60);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setFps(58 + Math.floor(Math.random() * 4));
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const lat = mouseCoords?.lat ?? 34.0522;
  const lng = mouseCoords?.lng ?? 50.0;
  const mgrs = coordToMGRS(lat, lng);

  return (
    <>
      {/* Top-left classification */}
      <div className="absolute top-0 left-0 z-[600] pointer-events-none p-2" style={{ fontFamily: 'monospace' }}>
        <div style={{ fontSize: 9, color: '#4a6070', letterSpacing: 1 }}>
          PANOPTIC VIS:{aircraftCount > 50 ? 6 : 3}  SRC:{aircraftCount}  DENS:1.00  {(tick % 10) + 1}.{Math.floor(Math.random() * 9)}ms
        </div>
        <div style={{ fontSize: 8, color: '#ff3366', marginTop: 1, letterSpacing: 2 }}>
          TOP SECRET // SI-TK // NOFORN
        </div>
        <div style={{ fontSize: 8, color: '#4a6070', letterSpacing: 1 }}>KH11-4176 OPS-4179</div>
        <div style={{ fontSize: 10, color: '#ff3366', fontWeight: 700, letterSpacing: 3, marginTop: 1 }}>NORMAL</div>
        <div style={{ fontSize: 8, color: '#4a6070', marginTop: 2, letterSpacing: 1 }}>SUMMARY</div>
        <div style={{ fontSize: 9, color: '#c8d8e8', maxWidth: 260, lineHeight: 1.5 }}>
          NORMAL GLOBAL NEAR PALM JUMEIRAH (DUBAI) 1820KM | {threatCount} EVENTS ACTIVE
        </div>
      </div>

      {/* Bottom-left MGRS */}
      <div className="absolute bottom-0 left-0 z-[600] pointer-events-none p-2 pb-3" style={{ fontFamily: 'monospace' }}>
        <div style={{ fontSize: 10, color: '#00d4ff', fontWeight: 700, letterSpacing: 1 }}>
          [ MGRS: {mgrs} ]
        </div>
        <div style={{ fontSize: 9, color: '#c8d8e8', letterSpacing: 0.5 }}>
          {Math.abs(lat).toFixed(5)}° {lat >= 0 ? 'N' : 'S'}  {Math.abs(lng).toFixed(5)}°{lng >= 0 ? 'E' : 'W'}
        </div>
      </div>

      {/* Top right FPS / perf */}
      <div className="absolute top-0 right-0 z-[600] pointer-events-none p-2" style={{ fontFamily: 'monospace', textAlign: 'right' }}>
        <div style={{ fontSize: 8, color: '#4a6070' }}>FPS <span style={{ color: fps > 55 ? '#00ff88' : '#ffaa00' }}>{fps}</span></div>
      </div>

      {/* Corner brackets */}
      <div className="absolute inset-0 z-[550] pointer-events-none" style={{ padding: 8 }}>
        {/* TL */}
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderTop: '1px solid rgba(0,212,255,0.4)', borderLeft: '1px solid rgba(0,212,255,0.4)' }} />
        {/* TR */}
        <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderTop: '1px solid rgba(0,212,255,0.4)', borderRight: '1px solid rgba(0,212,255,0.4)' }} />
        {/* BL */}
        <div style={{ position: 'absolute', bottom: 8, left: 8, width: 20, height: 20, borderBottom: '1px solid rgba(0,212,255,0.4)', borderLeft: '1px solid rgba(0,212,255,0.4)' }} />
        {/* BR */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 20, height: 20, borderBottom: '1px solid rgba(0,212,255,0.4)', borderRight: '1px solid rgba(0,212,255,0.4)' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 z-[500] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Scanline effect */}
      <div className="absolute inset-0 z-[501] pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 z-[499] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(4,8,16,0.6) 100%)',
      }} />
    </>
  );
}

function coordToMGRS(lat: number, lng: number): string {
  const zone = Math.floor((lng + 180) / 6) + 1;
  const letters = 'CDEFGHJKLMNPQRSTUVWX';
  const letter = letters[Math.max(0, Math.min(letters.length - 1, Math.floor((lat + 80) / 8)))];
  const easting = Math.abs(Math.floor(((lng % 6) + 6) % 6 * 166666));
  const northing = Math.abs(Math.floor(((lat % 8) + 8) % 8 * 111111));
  return `${zone}${letter} ${easting.toString().padStart(5, '0')} ${northing.toString().padStart(5, '0')}`;
}
