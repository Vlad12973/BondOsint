export interface Aircraft {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  category: number;
  squawk: string | null;
  isMillitary?: boolean;
}

export interface Vessel {
  mmsi: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  shipType: number;
  destination?: string;
  flag?: string;
}

export interface Satellite {
  id: number;
  name: string;
  norad: number;
  lat: number;
  lng: number;
  alt: number;
  azimuth?: number;
  elevation?: number;
  ra?: number;
  dec?: number;
  timestamp?: number;
  category: 'imaging' | 'military' | 'weather' | 'comms' | 'spy';
}

export interface ThreatEvent {
  id: string;
  type: 'earthquake' | 'cyclone' | 'flood' | 'volcano' | 'conflict' | 'airspace_closure' | 'cyber' | 'military';
  title: string;
  description: string;
  lat: number;
  lng: number;
  severity: 'red' | 'orange' | 'green';
  timestamp: string;
  country?: string;
  magnitude?: number;
  url?: string;
}

export interface NewsEvent {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  category: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface MapLayer {
  id: string;
  label: string;
  active: boolean;
  color: string;
}

export interface TimelineMarker {
  time: number;
  type: 'kinetic' | 'maritime' | 'air' | 'cyber' | 'intel';
  label: string;
  severity: 'red' | 'orange' | 'yellow';
}

export interface IntelCard {
  id: string;
  type: 'KINETIC' | 'SIGINT' | 'HUMINT' | 'IMINT' | 'OSINT';
  time: string;
  title: string;
  description: string;
  imageUrl?: string;
  coords?: [number, number];
  severity: 'critical' | 'high' | 'medium';
}
