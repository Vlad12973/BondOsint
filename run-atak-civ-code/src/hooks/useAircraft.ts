import { useState, useEffect, useCallback } from 'react';
import { Aircraft } from '../types';

// Middle East / Europe bounding box for interesting data
const BBOX = { lamin: 15, lomin: 25, lamax: 55, lomax: 75 };

function parseState(s: any[]): Aircraft | null {
  if (!s || s[5] === null || s[6] === null) return null;
  const callsign = (s[1] || '').trim();
  const country = (s[2] || 'Unknown');
  const squawk = s[14] || '';
  
  // Classify by squawk / callsign heuristics
  let category: Aircraft['category'] = 'commercial';
  if (!callsign || callsign === '') category = 'unknown';
  if (['RCH', 'REACH', 'EVAC', 'DUKE', 'PACK', 'COZY', 'JAKE', 'ANVIL', 'TOPGUN'].some(p => callsign.startsWith(p))) {
    category = 'military';
  }

  return {
    icao24: s[0],
    callsign: callsign || s[0].toUpperCase(),
    country,
    lat: s[6],
    lng: s[5],
    altitude: s[7] || 0,
    velocity: s[9] || 0,
    heading: s[10] || 0,
    verticalRate: s[11] || 0,
    onGround: s[8] || false,
    category,
    squawk,
  };
}

export function useAircraft(active: boolean) {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetch = useCallback(async () => {
    if (!active) return;
    setLoading(true);
    setError(null);
    try {
      const url = `https://opensky-network.org/api/states/all?lamin=${BBOX.lamin}&lomin=${BBOX.lomin}&lamax=${BBOX.lamax}&lomax=${BBOX.lomax}`;
      const res = await window.fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const parsed = (data.states || [])
        .map(parseState)
        .filter(Boolean) as Aircraft[];
      setAircraft(parsed.slice(0, 300)); // cap for performance
      setLastUpdated(Date.now());
    } catch (e: any) {
      setError(e.message);
      // On error, generate synthetic data so the UI isn't empty
      setAircraft(generateSyntheticAircraft());
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { aircraft, loading, error, lastUpdated, refetch: fetch };
}

// Synthetic aircraft for fallback / CORS issues
function generateSyntheticAircraft(): Aircraft[] {
  const airlines = ['UAE', 'ETD', 'THY', 'QTR', 'ELY', 'IRA', 'SVA', 'GFA', 'RJA', 'PIA'];
  const milCallsigns = ['REACH', 'DUKE', 'ANVIL', 'COZY', 'JAKE'];
  const countries = ['United Arab Emirates', 'Turkey', 'Qatar', 'Saudi Arabia', 'Iran', 'Israel', 'Egypt', 'Pakistan', 'India'];
  
  return Array.from({ length: 120 }, (_, i) => {
    const isMil = i % 15 === 0;
    const airline = airlines[i % airlines.length];
    const flightNum = 100 + (i * 7) % 900;
    const callsign = isMil ? `${milCallsigns[i % milCallsigns.length]}${flightNum}` : `${airline}${flightNum}`;
    return {
      icao24: `${Math.random().toString(16).slice(2, 8)}`,
      callsign,
      country: countries[i % countries.length],
      lat: 20 + Math.random() * 30,
      lng: 30 + Math.random() * 40,
      altitude: 5000 + Math.random() * 35000,
      velocity: 200 + Math.random() * 500,
      heading: Math.random() * 360,
      verticalRate: (Math.random() - 0.5) * 20,
      onGround: false,
      category: isMil ? 'military' : 'commercial',
      squawk: `${Math.floor(1000 + Math.random() * 6999)}`,
    };
  });
}
