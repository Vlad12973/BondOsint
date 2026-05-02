import { useState, useEffect, useRef } from 'react';
import { Vessel, ThreatEvent, SatellitePass, Alert } from '../types';

// ─── Synthetic Maritime Traffic ──────────────────────────────────────────────
function generateVessels(): Vessel[] {
  const names = [
    'MSC GENEVA', 'EVER GIVEN', 'OOCL HONG KONG', 'CMA CGM MARCO POLO',
    'MAERSK ELBA', 'COSCO SHIPPING UNIVERSE', 'ATLANTIC STAR', 'GULF NAVIGATOR',
    'SEA EAGLE', 'PERSIAN TRADER', 'HORMUZ CARRIER', 'RED SEA EXPRESS',
    'USS THEODORE ROOSEVELT', 'USS DWIGHT D EISENHOWER', 'RFS ADMIRAL GORSHKOV',
    'INS VIKRAMADITYA', 'FS CHARLES DE GAULLE', 'HMS QUEEN ELIZABETH',
  ];
  const flags = ['PA', 'LR', 'BS', 'SG', 'MT', 'US', 'GB', 'FR', 'RU', 'IN', 'CN', 'AE'];
  const types: Vessel['type'][] = ['cargo', 'tanker', 'military', 'cargo', 'cargo', 'tanker'];

  return names.map((name, i) => ({
    id: `vessel-${i}`,
    name,
    type: i > 13 ? 'military' : types[i % types.length],
    lat: 15 + Math.random() * 35,
    lng: 32 + Math.random() * 45,
    heading: Math.random() * 360,
    speed: 5 + Math.random() * 25,
    flag: flags[i % flags.length],
  }));
}

// ─── OSINT Threat Events ──────────────────────────────────────────────────────
function generateThreatEvents(): ThreatEvent[] {
  return [
    {
      id: 'e1', type: 'kinetic', lat: 31.7, lng: 35.2,
      title: 'Munitions Strike Detected', description: 'Multiple impact craters observed via SAR. Confidence: HIGH',
      severity: 'critical', timestamp: Date.now() - 3600000, source: 'SAR-IMAGERY', confidence: 87,
    },
    {
      id: 'e2', type: 'retaliation', lat: 33.3, lng: 44.4,
      title: 'Counter-Battery Fire', description: 'Artillery exchange detected near grid 38S MB 3412',
      severity: 'high', timestamp: Date.now() - 7200000, source: 'SIGINT', confidence: 72,
    },
    {
      id: 'e3', type: 'infrastructure', lat: 24.7, lng: 46.7,
      title: 'Facility Activity Spike', description: 'Unusual vehicle concentration at known facility',
      severity: 'medium', timestamp: Date.now() - 1800000, source: 'HUMINT', confidence: 64,
    },
    {
      id: 'e4', type: 'civilian', lat: 36.2, lng: 37.1,
      title: 'Population Movement', description: 'Mass displacement detected NW corridor. Est. 12,000 persons',
      severity: 'high', timestamp: Date.now() - 900000, source: 'OSINT-SOCIAL', confidence: 91,
    },
    {
      id: 'e5', type: 'escalation', lat: 26.3, lng: 50.6,
      title: 'Naval Exercise Detected', description: 'Multi-vessel formation observed. Possible live-fire exercise',
      severity: 'medium', timestamp: Date.now() - 5400000, source: 'SAR-VESSEL', confidence: 78,
    },
    {
      id: 'e6', type: 'kinetic', lat: 15.3, lng: 44.2,
      title: 'Airstrike Signature', description: 'Thermal bloom + acoustic sensors triggered. BDA pending',
      severity: 'critical', timestamp: Date.now() - 600000, source: 'MASINT', confidence: 95,
    },
    {
      id: 'e7', type: 'infrastructure', lat: 29.3, lng: 47.9,
      title: 'Electronic Warfare Active', description: 'GPS disruption reported over 300km² area',
      severity: 'high', timestamp: Date.now() - 2700000, source: 'ELINT', confidence: 83,
    },
    {
      id: 'e8', type: 'retaliation', lat: 38.1, lng: 46.3,
      title: 'Missile Launch Detected', description: 'Ballistic trajectory confirmed. Impact estimate T+8min',
      severity: 'critical', timestamp: Date.now() - 300000, source: 'DSP-SATELLITE', confidence: 99,
    },
  ];
}

// ─── Satellites ───────────────────────────────────────────────────────────────
function generateSatellites(): SatellitePass[] {
  return [
    { id: 's1', name: 'GAOFEN-12-05', lat: 42.1, lng: 58.3, altitude: 500, inclination: 97, period: 95, type: 'radar' },
    { id: 's2', name: 'GAOFEN-12-04', lat: 48.3, lng: 72.1, altitude: 500, inclination: 97, period: 95, type: 'optical' },
    { id: 's3', name: 'GAOFEN-9-01', lat: 38.7, lng: 44.2, altitude: 628, inclination: 97.9, period: 97, type: 'optical' },
    { id: 's4', name: 'BARS-M-5', lat: 52.3, lng: 65.8, altitude: 300, inclination: 81.4, period: 90, type: 'radar' },
    { id: 's5', name: 'BARS-M-2', lat: 35.2, lng: 51.4, altitude: 300, inclination: 81.4, period: 90, type: 'radar' },
    { id: 's6', name: 'KH11-4176', lat: 44.6, lng: 40.1, altitude: 400, inclination: 97.9, period: 92, type: 'optical' },
    { id: 's7', name: 'WORLDVIEW-3', lat: 29.1, lng: 55.7, altitude: 617, inclination: 97.9, period: 97, type: 'optical' },
    { id: 's8', name: 'SENTINEL-1A', lat: 33.8, lng: 62.2, altitude: 693, inclination: 98.2, period: 99, type: 'radar' },
  ];
}

// ─── Live Alerts ─────────────────────────────────────────────────────────────
const ALERT_POOL: Omit<Alert, 'id' | 'timestamp'>[] = [
  { type: 'critical', message: 'SIGINT: Encrypted burst detected — IRAN SECTOR', region: 'IRN' },
  { type: 'critical', message: 'GPS JAMMING ACTIVE — 200NM RADIUS BEIRUT', region: 'LBN' },
  { type: 'warning', message: 'SQUAWK 7700 — UAE7731 descending rapidly', region: 'UAE' },
  { type: 'warning', message: 'Unregistered vessel ID GULF OF OMAN', region: 'OMN' },
  { type: 'info', message: 'SATPASS: KH11-4176 OPS-4179 — ETA 04:17Z', region: 'SYR' },
  { type: 'critical', message: 'FAST MOVER: Mach 1.8 track — UNIDENTIFIED', region: 'IRQ' },
  { type: 'warning', message: 'AIS SPOOFING DETECTED — STRAIT OF HORMUZ', region: 'IRN' },
  { type: 'info', message: 'RELAY: HUMINT SOURCE CONFIRMED LOCATION', region: 'YEM' },
  { type: 'critical', message: 'AIRSPACE CLOSURE: FL000-FL660 ACTIVE TFR', region: 'ISR' },
  { type: 'warning', message: 'VHF INTERCEPT: Unknown freq 243.0 MHz', region: 'SAU' },
];

export function useOSINTData() {
  const [vessels, setVessels] = useState<Vessel[]>(() => generateVessels());
  const [threats, setThreats] = useState<ThreatEvent[]>(() => generateThreatEvents());
  const [satellites, setSatellites] = useState<SatellitePass[]>(() => generateSatellites());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const alertIdx = useRef(0);

  // Move vessels slowly
  useEffect(() => {
    const iv = setInterval(() => {
      setVessels(prev => prev.map(v => ({
        ...v,
        lat: v.lat + Math.sin(v.heading * Math.PI / 180) * 0.01,
        lng: v.lng + Math.cos(v.heading * Math.PI / 180) * 0.01,
        heading: (v.heading + (Math.random() - 0.5) * 3 + 360) % 360,
      })));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // Move satellites
  useEffect(() => {
    const iv = setInterval(() => {
      setSatellites(prev => prev.map(s => ({
        ...s,
        lat: ((s.lat - 0.15 + 90) % 180) - 90,
        lng: ((s.lng + 0.2) % 360) - 180,
      })));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Random threat pulses
  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() < 0.3) {
        const newThreat: ThreatEvent = {
          id: `e-${Date.now()}`,
          type: (['kinetic', 'escalation', 'infrastructure', 'civilian', 'retaliation'] as ThreatEvent['type'][])[Math.floor(Math.random() * 5)],
          lat: 15 + Math.random() * 35,
          lng: 30 + Math.random() * 40,
          title: 'New Event Detected',
          description: 'Processing incoming SIGINT/IMINT feed...',
          severity: (['low', 'medium', 'high', 'critical'] as ThreatEvent['severity'][])[Math.floor(Math.random() * 4)],
          timestamp: Date.now(),
          source: ['SIGINT', 'OSINT', 'HUMINT', 'IMINT', 'MASINT'][Math.floor(Math.random() * 5)],
          confidence: 40 + Math.floor(Math.random() * 60),
        };
        setThreats(prev => [newThreat, ...prev.slice(0, 19)]);
      }
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  // Rolling alerts
  useEffect(() => {
    const iv = setInterval(() => {
      const template = ALERT_POOL[alertIdx.current % ALERT_POOL.length];
      const alert: Alert = {
        ...template,
        id: `alert-${Date.now()}`,
        timestamp: Date.now(),
      };
      setAlerts(prev => [alert, ...prev.slice(0, 9)]);
      alertIdx.current++;
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  return { vessels, threats, satellites, alerts };
}
