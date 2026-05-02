import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  visible: boolean;
  progress: number;
}

const BOOT_MESSAGES = [
  'INITIALIZING BOND OSINT TACTICAL PLATFORM...',
  'CONNECTING TO OPENSKY NETWORK ADS-B FEED...',
  'LOADING SATELLITE EPHEMERIS DATABASE...',
  'INITIALIZING AIS MARITIME TRACKING MODULE...',
  'FETCHING SEISMIC EVENT DATA FROM USGS...',
  'LOADING CONFLICT ZONE INTELLIGENCE...',
  'ESTABLISHING SIGINT FEED CONNECTIONS...',
  'CALIBRATING MGRS COORDINATE SYSTEM...',
  'LOADING TACTICAL MAP TILES...',
  'SYSTEM ONLINE - PANOPTIC MODE ACTIVE',
];

export default function LoadingOverlay({ visible, progress }: LoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [chars, setChars] = useState('');
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const msgInterval = setInterval(() => {
      setMessageIndex(i => Math.min(i + 1, BOOT_MESSAGES.length - 1));
    }, 400);

    return () => clearInterval(msgInterval);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const charInterval = setInterval(() => {
      setChars(c => c + String.fromCharCode(33 + Math.floor(Math.random() * 90)));
      if (chars.length > 20) setChars('');
    }, 50);
    return () => clearInterval(charInterval);
  }, [visible, chars]);

  useEffect(() => {
    if (displayProgress < progress) {
      const timer = setTimeout(() => setDisplayProgress(p => Math.min(p + 2, progress)), 30);
      return () => clearTimeout(timer);
    }
  }, [displayProgress, progress]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050810] flex flex-col items-center justify-center">
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.02) 2px, rgba(0,212,255,0.02) 4px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg w-full px-8">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-4xl font-black tracking-[0.4em] mb-1" style={{ fontFamily: 'Orbitron, monospace', color: '#00d4ff' }}>
            BOND<span style={{ color: '#ffffff' }}>OSINT</span>
          </div>
          <div className="text-[10px] tracking-[0.6em] text-gray-500 font-mono">
            TACTICAL INTELLIGENCE PLATFORM
          </div>
          <div className="text-[9px] tracking-[0.3em] text-red-400 font-mono mt-1 animate-pulse">
            ⬛ TOP SECRET // SI-TK // NOFORN
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1 bg-cyan-950 mb-4 rounded-none overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-cyan-400 transition-all duration-100"
            style={{
              width: `${displayProgress}%`,
              boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff44',
            }}
          />
        </div>

        {/* Boot messages */}
        <div className="bg-black/50 border border-cyan-900/30 p-4 rounded-sm text-left max-h-48 overflow-hidden">
          {BOOT_MESSAGES.slice(0, messageIndex + 1).map((msg, i) => (
            <div
              key={i}
              className="text-[9px] font-mono mb-1"
              style={{
                color: i === messageIndex ? '#00d4ff' : '#1a4a5a',
              }}
            >
              {i < messageIndex ? '✓ ' : '> '}{msg}
              {i === messageIndex && <span className="animate-pulse">_</span>}
            </div>
          ))}
        </div>

        <div className="mt-4 text-[9px] font-mono text-gray-600">
          CONNECTING TO LIVE DATA FEEDS... {displayProgress}%
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-800/40" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-800/40" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-800/40" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-800/40" />
    </div>
  );
}
