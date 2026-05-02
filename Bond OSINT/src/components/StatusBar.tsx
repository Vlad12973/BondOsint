import { useState, useEffect } from 'react';

interface StatusBarProps {
  aircraftCount: number;
  vesselCount: number;
  threatCount: number;
  aircraftLoading: boolean;
  error: string | null;
}

const INTEL_TICKERS = [
  'COMMERCIAL FLIGHT: THY174 ISTANBUL-DUBAI TRACKING ACTIVE',
  'MARITIME: SUPERTANKER REPORTED IN STRAIT OF HORMUZ NORTHBOUND',
  'SIGINT: GPS JAMMING DETECTED OVER EASTERN MEDITERRANEAN',
  'EARTHQUAKE: M4.2 DETECTED WESTERN IRAN - NO TSUNAMI RISK',
  'AIRSPACE: UKRAINE FIR RESTRICTED NOTAM ACTIVE - REROUTING IN EFFECT',
  'MARITIME: SUSPICIOUS VESSEL TRACKING IN RED SEA CORRIDOR',
  'SATELLITE: WORLDVIEW-3 PASSING OVER TAIWAN STRAIT - 30MIN WINDOW',
  'CONFLICT: ACTIVE MILITARY OPERATIONS REPORTED EASTERN UKRAINE',
  'CYBER: ANOMALOUS TRAFFIC PATTERNS DETECTED IRAN NETWORKS',
  'MILITARY: PLA NAVAL EXERCISE TAIWAN STRAIT - CARRIER GROUP ACTIVE',
  'SEISMIC: M5.1 EARTHQUAKE TURKEY-IRAN BORDER REGION',
  'SIGINT: ENCRYPTED COMMS SPIKE DETECTED DPRK MILITARY FREQUENCIES',
  'AIS GAP: VESSEL TRANSPONDER DARK PERSIAN GULF SECTOR',
];

export default function StatusBar({ aircraftCount, vesselCount, threatCount, aircraftLoading, error }: StatusBarProps) {
  const [tickerIndex, setTickerIndex] = useState(0);


  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(i => (i + 1) % INTEL_TICKERS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 z-50 h-5 bg-black/90 border-b border-cyan-900/50 flex items-center overflow-hidden">
      {/* Status indicators */}
      <div className="flex items-center gap-3 px-3 flex-shrink-0 border-r border-cyan-900/30">
        <span className="text-[8px] font-mono text-gray-500">
          PANOPTIC
        </span>
        <span className="text-[8px] font-mono text-gray-600">
          VIS:{aircraftLoading ? '...' : '9'}
        </span>
        <span className="text-[8px] font-mono text-gray-600">
          SRC:{Math.floor(Math.random() * 20 + 30)}
        </span>
        <span className="text-[8px] font-mono text-gray-600">
          DENS:{vesselCount > 0 ? '1.00' : '0.00'}
        </span>
        <span className="text-[8px] font-mono text-gray-600">
          {(Math.random() * 2 + 3).toFixed(1)}ms
        </span>
      </div>

      {/* Scrolling intel ticker */}
      <div className="flex-1 overflow-hidden relative mx-3">
        <div
          key={tickerIndex}
          className="text-[9px] font-mono text-cyan-400 whitespace-nowrap animate-slide-in"
        >
          <span className="text-red-400 mr-2">⚡ INTEL:</span>
          {INTEL_TICKERS[tickerIndex]}
        </div>
      </div>

      {/* Right status */}
      <div className="flex items-center gap-3 px-3 flex-shrink-0 border-l border-cyan-900/30">
        {error && (
          <span className="text-[8px] font-mono text-orange-400">⚠ {error.substring(0, 30)}</span>
        )}
        <span className="text-[8px] font-mono text-cyan-500">✈ {aircraftCount}</span>
        <span className="text-[8px] font-mono text-green-500">⚓ {vesselCount}</span>
        <span className="text-[8px] font-mono text-red-500">⚠ {threatCount}</span>
      </div>
    </div>
  );
}
