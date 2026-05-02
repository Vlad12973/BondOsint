import { useState, useEffect, useRef } from 'react';
import { Satellite } from '../types';

const SATELLITE_CATALOG = [
  { name: 'WORLDVIEW-3', norad: 40115, category: 'imaging' as const },
  { name: 'WORLDVIEW-2', norad: 35946, category: 'imaging' as const },
  { name: 'GEOEYE-1', norad: 33331, category: 'imaging' as const },
  { name: 'PLEIADES-NEO-3', norad: 49613, category: 'imaging' as const },
  { name: 'PLEIADES-NEO-4', norad: 52941, category: 'imaging' as const },
  { name: 'SPOT-6', norad: 38755, category: 'imaging' as const },
  { name: 'SPOT-7', norad: 40053, category: 'imaging' as const },
  { name: 'SENTINEL-1A', norad: 39634, category: 'imaging' as const },
  { name: 'SENTINEL-2A', norad: 40697, category: 'imaging' as const },
  { name: 'SKYSAT-C4', norad: 43797, category: 'imaging' as const },
  { name: 'USA-224 (TOPAZ)', norad: 37388, category: 'spy' as const },
  { name: 'USA-161', norad: 26934, category: 'spy' as const },
  { name: 'KH-11 (USA-186)', norad: 28888, category: 'spy' as const },
  { name: 'BARS-M-1', norad: 40358, category: 'military' as const },
  { name: 'BARS-M-2', norad: 41034, category: 'military' as const },
  { name: 'COSMOS-2543', norad: 44914, category: 'military' as const },
  { name: 'COSMOS-2551', norad: 49044, category: 'military' as const },
  { name: 'YAOGAN-30A', norad: 42984, category: 'military' as const },
  { name: 'YAOGAN-30B', norad: 42985, category: 'military' as const },
  { name: 'YAOGAN-30C', norad: 42986, category: 'military' as const },
  { name: 'NOAA-18', norad: 28654, category: 'weather' as const },
  { name: 'NOAA-19', norad: 33591, category: 'weather' as const },
  { name: 'METOP-B', norad: 38771, category: 'weather' as const },
  { name: 'ISS (ZARYA)', norad: 25544, category: 'comms' as const },
  { name: 'GARFEN-11-01', norad: 45026, category: 'military' as const },
  { name: 'MV-LEGION-3', norad: 52256, category: 'military' as const },
];

function computeOrbitPosition(norad: number, t: Date): { lat: number; lng: number; alt: number } {
  const seed = norad % 10000;
  const inclination = 40 + (seed % 52);
  const period = 88 + (seed % 35);
  const raan = (seed * 137.508) % 360;
  const initAnomaly = (seed * 73.1) % 360;

  const minutesSinceJ2000 = (t.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / 60000;
  const meanMotion = 360 / period;
  const trueAnomaly = (minutesSinceJ2000 * meanMotion + initAnomaly) % 360;

  const tRad = (trueAnomaly * Math.PI) / 180;
  const raanRad = (raan * Math.PI) / 180;
  const inclRad = (inclination * Math.PI) / 180;

  const xOrbit = Math.cos(tRad);
  const yOrbit = Math.sin(tRad);

  const x = xOrbit * Math.cos(raanRad) - yOrbit * Math.cos(inclRad) * Math.sin(raanRad);
  const y = xOrbit * Math.sin(raanRad) + yOrbit * Math.cos(inclRad) * Math.cos(raanRad);
  const z = yOrbit * Math.sin(inclRad);

  const gmst = ((minutesSinceJ2000 * (360 / 1436.07)) % 360) * (Math.PI / 180);

  const xECEF = x * Math.cos(gmst) + y * Math.sin(gmst);
  const yECEF = -x * Math.sin(gmst) + y * Math.cos(gmst);

  const lat = (Math.asin(Math.max(-1, Math.min(1, z))) * 180) / Math.PI;
  const lng = (Math.atan2(yECEF, xECEF) * 180) / Math.PI;
  const alt = 400 + (seed % 400);

  return { lat, lng, alt };
}

export function useSatellites() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updatePositions = () => {
    const now = new Date();
    const updated = SATELLITE_CATALOG.map((sat, i) => {
      const pos = computeOrbitPosition(sat.norad, now);
      return {
        id: i,
        name: sat.name,
        norad: sat.norad,
        lat: pos.lat,
        lng: pos.lng,
        alt: pos.alt,
        category: sat.category,
        timestamp: now.getTime(),
      };
    });
    setSatellites(updated);
  };

  useEffect(() => {
    updatePositions();
    intervalRef.current = setInterval(updatePositions, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { satellites };
}
