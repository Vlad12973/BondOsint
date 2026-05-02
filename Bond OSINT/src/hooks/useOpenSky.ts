import { useState, useEffect, useCallback, useRef } from 'react';
import { Aircraft } from '../types';

// Parse OpenSky state vector array into typed object
function parseState(s: any[]): Aircraft | null {
  if (!s || s.length < 17) return null;
  if (s[5] === null || s[6] === null) return null;

  const callsign = (s[1] || '').trim();
  const category = s[16] || 0;

  // Military squawk codes (7700=emergency, 7600=radio fail, 7500=hijack)
  const squawk = s[14] || null;
  const isMillitary =
    category === 6 ||
    ['SHB', 'RCH', 'CTM', 'USAF', 'NATO', 'NATO'].some(p => callsign.startsWith(p)) ||
    squawk === '7700' || squawk === '7500';

  return {
    icao24: s[0],
    callsign: callsign || `UNKN-${s[0]?.toUpperCase()}`,
    origin_country: s[2],
    longitude: s[5],
    latitude: s[6],
    baro_altitude: s[7],
    on_ground: s[8],
    velocity: s[9],
    true_track: s[10],
    vertical_rate: s[11],
    category,
    squawk,
    isMillitary,
  };
}

// Bounding boxes for tactical regions of interest
const TACTICAL_BBOX = {
  'Global': { lamin: -90, lomin: -180, lamax: 90, lomax: 180 },
  'Middle East': { lamin: 12, lomin: 32, lamax: 42, lomax: 65 },
  'Europe': { lamin: 35, lomin: -10, lamax: 72, lomax: 45 },
  'Asia Pacific': { lamin: -10, lomin: 95, lamax: 45, lomax: 145 },
  'North America': { lamin: 15, lomin: -130, lamax: 55, lomax: -60 },
};

export function useOpenSky(region: keyof typeof TACTICAL_BBOX = 'Global') {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAircraft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bbox = TACTICAL_BBOX[region];
      const params = new URLSearchParams({
        lamin: bbox.lamin.toString(),
        lomin: bbox.lomin.toString(),
        lamax: bbox.lamax.toString(),
        lomax: bbox.lomax.toString(),
      });

      const response = await fetch(
        `https://opensky-network.org/api/states/all?${params}`,
        { signal: AbortSignal.timeout(15000) }
      );

      if (!response.ok) {
        throw new Error(`OpenSky API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.states) {
        const parsed = data.states
          .map(parseState)
          .filter((a: Aircraft | null): a is Aircraft => a !== null && !a.on_ground);

        setTotalCount(parsed.length);

        // For performance limit display to 800 most interesting aircraft
        const sorted = parsed.sort((a: Aircraft, b: Aircraft) => {
          const aScore = (a.isMillitary ? 100 : 0) + (a.baro_altitude || 0) / 1000;
          const bScore = (b.isMillitary ? 100 : 0) + (b.baro_altitude || 0) / 1000;
          return bScore - aScore;
        });

        setAircraft(sorted.slice(0, 800));
        setLastUpdate(new Date());
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch aircraft data');
        console.warn('OpenSky fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchAircraft();
    // OpenSky updates every 10 seconds, poll every 15s to be respectful
    intervalRef.current = setInterval(fetchAircraft, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAircraft]);

  return { aircraft, loading, error, lastUpdate, totalCount, refetch: fetchAircraft };
}
