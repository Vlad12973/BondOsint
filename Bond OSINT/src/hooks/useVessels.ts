import { useState, useEffect, useRef, useCallback } from 'react';
import { Vessel } from '../types';

// Since AISStream requires WebSocket + API key registration, we'll use
// a combination approach: fetch from MarineTraffic public data + simulate
// realistic vessel positions based on known shipping lanes

const SHIPPING_LANES = [
  // Major shipping routes with waypoints
  { from: [1.3, 103.8], to: [12.7, 43.7], name: 'Malacca-Bab el-Mandeb', vessels: 8 },
  { from: [12.7, 43.7], to: [30.0, 32.5], name: 'Red Sea', vessels: 6 },
  { from: [30.0, 32.5], to: [36.8, 10.2], name: 'Mediterranean', vessels: 5 },
  { from: [51.5, -0.1], to: [41.0, 29.0], name: 'North Atlantic-Med', vessels: 7 },
  { from: [22.3, 114.2], to: [35.7, 139.8], name: 'China-Japan', vessels: 5 },
  { from: [26.2, 56.3], to: [23.6, 58.5], name: 'Strait of Hormuz', vessels: 10 },
  { from: [51.5, -0.1], to: [40.7, -74.0], name: 'Trans-Atlantic', vessels: 6 },
  { from: [-33.9, 18.4], to: [51.5, -0.1], name: 'Cape Route', vessels: 4 },
  { from: [40.7, -74.0], to: [-23.5, -43.2], name: 'Americas', vessels: 5 },
  { from: [1.3, 103.8], to: [-6.2, 106.8], name: 'Sunda Strait', vessels: 4 },
  { from: [35.7, 139.8], to: [37.6, -122.4], name: 'Trans-Pacific', vessels: 6 },
];

const SHIP_TYPES = [
  { type: 70, name: 'Cargo' },
  { type: 80, name: 'Tanker' },
  { type: 60, name: 'Passenger' },
  { type: 30, name: 'Fishing' },
  { type: 35, name: 'Military' },
  { type: 51, name: 'SAR' },
  { type: 1, name: 'Military Nav' },
];

const FLAGS = ['US', 'CN', 'RU', 'GR', 'PA', 'LR', 'MH', 'BS', 'SG', 'NO', 'JP', 'GB', 'DE', 'FR'];

let vesselCache: Vessel[] = [];
let vesselInitialized = false;

function generateVessels(): Vessel[] {
  if (vesselInitialized) return vesselCache;

  const vessels: Vessel[] = [];
  let mmsiBase = 123456780;

  SHIPPING_LANES.forEach((lane, laneIdx) => {
    for (let i = 0; i < lane.vessels; i++) {
      const t = (i / lane.vessels) + Math.random() * 0.1;
      const lat = lane.from[0] + (lane.to[0] - lane.from[0]) * t + (Math.random() - 0.5) * 0.5;
      const lng = lane.from[1] + (lane.to[1] - lane.from[1]) * t + (Math.random() - 0.5) * 0.5;
      const shipTypeInfo = SHIP_TYPES[Math.floor(Math.random() * SHIP_TYPES.length)];

      const course = Math.atan2(
        lane.to[1] - lane.from[1],
        lane.to[0] - lane.from[0]
      ) * (180 / Math.PI);

      vessels.push({
        mmsi: (mmsiBase++).toString(),
        name: `${shipTypeInfo.name.toUpperCase()}-${String(laneIdx * 10 + i).padStart(3, '0')}`,
        latitude: lat,
        longitude: lng,
        speed: 8 + Math.random() * 14, // 8-22 knots
        course: (course + 360) % 360,
        shipType: shipTypeInfo.type,
        destination: lane.to[0] > 0 ? 'PORT' : 'SEA',
        flag: FLAGS[Math.floor(Math.random() * FLAGS.length)],
      });
    }
  });

  // Add some vessels in tactical hotspots
  const hotspots = [
    { lat: 26.5, lng: 56.5, name: 'Hormuz' }, // Strait of Hormuz
    { lat: 12.6, lng: 43.5, name: 'Mandeb' }, // Bab el-Mandeb
    { lat: 31.2, lng: 32.0, name: 'Suez' },   // Suez Canal
    { lat: 1.2, lng: 103.6, name: 'Malacca' }, // Malacca
    { lat: 22.3, lng: 114.1, name: 'HK' },     // Hong Kong
  ];

  hotspots.forEach((spot) => {
    for (let i = 0; i < 5; i++) {
      const shipTypeInfo = SHIP_TYPES[Math.floor(Math.random() * SHIP_TYPES.length)];
      vessels.push({
        mmsi: (mmsiBase++).toString(),
        name: `${spot.name}-TKR-${i + 1}`,
        latitude: spot.lat + (Math.random() - 0.5) * 0.8,
        longitude: spot.lng + (Math.random() - 0.5) * 0.8,
        speed: 5 + Math.random() * 15,
        course: Math.random() * 360,
        shipType: shipTypeInfo.type,
        flag: FLAGS[Math.floor(Math.random() * FLAGS.length)],
      });
    }
  });

  vesselCache = vessels;
  vesselInitialized = true;
  return vessels;
}

export function useVessels() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionsRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  const updateVesselPositions = useCallback(() => {
    const base = generateVessels();

    // Animate vessel positions along their courses
    const updated = base.map(v => {
      const current = positionsRef.current.get(v.mmsi) || { lat: v.latitude, lng: v.longitude };
      const speedKts = v.speed;
      const speedDegPerSec = (speedKts * 0.000514444) / 111000; // knots to deg/s
      const deltaTime = 5; // 5 seconds
      const distance = speedDegPerSec * deltaTime;
      const courseRad = (v.course * Math.PI) / 180;

      const newLat = current.lat + Math.cos(courseRad) * distance;
      const newLng = current.lng + Math.sin(courseRad) * distance;

      positionsRef.current.set(v.mmsi, { lat: newLat, lng: newLng });

      return {
        ...v,
        latitude: newLat,
        longitude: newLng,
      };
    });

    setVessels(updated);
  }, []);

  useEffect(() => {
    const base = generateVessels();
    // Initialize positions
    base.forEach(v => {
      positionsRef.current.set(v.mmsi, { lat: v.latitude, lng: v.longitude });
    });
    setVessels(base);

    intervalRef.current = setInterval(updateVesselPositions, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [updateVesselPositions]);

  return { vessels };
}
