export interface Aircraft {
  icao24: string;
  callsign: string;
  country: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
  category: 'commercial' | 'military' | 'unknown';
  squawk?: string;
}

export interface Vessel {
  id: string;
  name: string;
  type: 'cargo' | 'tanker' | 'military' | 'unknown';
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  flag: string;
}

export interface ThreatEvent {
  id: string;
  type: 'kinetic' | 'retaliation' | 'civilian' | 'escalation' | 'infrastructure';
  lat: number;
  lng: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  source: string;
  confidence: number;
}

export interface SatellitePass {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude: number;
  inclination: number;
  period: number;
  type: 'optical' | 'radar' | 'comms' | 'nav';
}

export interface DataLayer {
  id: string;
  label: string;
  active: boolean;
  color: string;
  count: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: number;
  region: string;
}
