import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Aircraft, Vessel, Satellite, ThreatEvent, MapLayer } from '../types';

interface TacticalMapProps {
  aircraft: Aircraft[];
  vessels: Vessel[];
  satellites: Satellite[];
  threats: ThreatEvent[];
  layers: MapLayer[];
  onMapClick: (lat: number, lng: number) => void;
  onAircraftSelect: (a: Aircraft) => void;
  onVesselSelect: (v: Vessel) => void;
  onThreatSelect: (t: ThreatEvent) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
}

// Aircraft SVG icons
function getAircraftIcon(aircraft: Aircraft): L.DivIcon {
  const rotation = aircraft.true_track || 0;
  const isMil = aircraft.isMillitary;
  const color = isMil ? '#ff4444' : '#00d4ff';
  const glowColor = isMil ? '#ff000088' : '#00d4ff44';

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:24px;height:24px;transform:rotate(${rotation}deg)">
        <div style="
          position:absolute;inset:0;
          filter:drop-shadow(0 0 4px ${glowColor});
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 L15 9 L22 9 L17 14 L19 21 L12 17 L5 21 L7 14 L2 9 L9 9 Z" 
                  fill="${color}" fill-opacity="0.9" stroke="${color}" stroke-width="0.5"/>
            <circle cx="12" cy="12" r="2" fill="white" fill-opacity="0.7"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function getVesselIcon(vessel: Vessel): L.DivIcon {
  const isMilitary = vessel.shipType === 35 || vessel.shipType === 1;
  const isTanker = vessel.shipType === 80;
  const color = isMilitary ? '#ff6600' : isTanker ? '#ffdd00' : '#00ff88';
  const rotation = vessel.course;

  return L.divIcon({
    className: '',
    html: `
      <div style="transform:rotate(${rotation}deg);filter:drop-shadow(0 0 3px ${color}88)">
        <svg width="16" height="20" viewBox="0 0 16 20">
          <polygon points="8,0 14,18 8,14 2,18" fill="${color}" fill-opacity="0.85" stroke="${color}" stroke-width="0.5"/>
        </svg>
      </div>
    `,
    iconSize: [16, 20],
    iconAnchor: [8, 10],
  });
}

function getSatelliteIcon(satellite: Satellite): L.DivIcon {
  const colors = {
    imaging: '#00ffff',
    spy: '#ff00ff',
    military: '#ff4400',
    weather: '#44aaff',
    comms: '#44ff88',
  };
  const color = colors[satellite.category];

  return L.divIcon({
    className: '',
    html: `
      <div style="filter:drop-shadow(0 0 6px ${color})">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <rect x="8" y="8" width="4" height="4" fill="${color}" transform="rotate(45 10 10)"/>
          <line x1="0" y1="10" x2="7" y2="10" stroke="${color}" stroke-width="1.5"/>
          <line x1="13" y1="10" x2="20" y2="10" stroke="${color}" stroke-width="1.5"/>
          <line x1="10" y1="0" x2="10" y2="7" stroke="${color}" stroke-width="1.5"/>
          <line x1="10" y1="13" x2="10" y2="20" stroke="${color}" stroke-width="1.5"/>
        </svg>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function getThreatIcon(threat: ThreatEvent): L.DivIcon {
  const colors = { red: '#ff2222', orange: '#ff8800', green: '#00ff66' };
  const color = colors[threat.severity];
  
  const shapes = {
    earthquake: `<polygon points="10,0 12,7 19,7 14,12 16,19 10,15 4,19 6,12 1,7 8,7" fill="${color}" fill-opacity="0.9"/>`,
    conflict: `<polygon points="10,2 18,18 2,18" fill="${color}" fill-opacity="0.8" stroke="${color}" stroke-width="1"/>`,
    cyclone: `<circle cx="10" cy="10" r="7" fill="none" stroke="${color}" stroke-width="2"/><circle cx="10" cy="10" r="3" fill="${color}"/>`,
    flood: `<rect x="2" y="5" width="16" height="10" rx="2" fill="${color}" fill-opacity="0.8"/>`,
    volcano: `<polygon points="10,1 18,19 2,19" fill="${color}" fill-opacity="0.9"/>`,
    airspace_closure: `<rect x="2" y="2" width="16" height="16" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2"/><line x1="2" y1="2" x2="18" y2="18" stroke="${color}" stroke-width="2"/>`,
    cyber: `<rect x="3" y="3" width="14" height="14" rx="1" fill="none" stroke="${color}" stroke-width="2"/><text x="10" y="14" text-anchor="middle" fill="${color}" font-size="10">⚡</text>`,
    military: `<polygon points="10,0 20,20 0,20" fill="${color}" fill-opacity="0.7" stroke="${color}" stroke-width="1.5"/>`,
  };

  return L.divIcon({
    className: '',
    html: `
      <div style="filter:drop-shadow(0 0 8px ${color}aa);animation:pulse 2s infinite">
        <svg width="20" height="20" viewBox="0 0 20 20">
          ${shapes[threat.type] || shapes.conflict}
        </svg>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function TacticalMap({
  aircraft, vessels, satellites, threats, layers,
  onMapClick, onAircraftSelect, onVesselSelect, onThreatSelect,
  mapRef
}: TacticalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const aircraftLayerRef = useRef<L.LayerGroup | null>(null);
  const vesselLayerRef = useRef<L.LayerGroup | null>(null);
  const satelliteLayerRef = useRef<L.LayerGroup | null>(null);
  const threatLayerRef = useRef<L.LayerGroup | null>(null);
  const markerCacheRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [25, 50],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    // Dark satellite-style base layer (Esri World Imagery)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri, DigitalGlobe',
        maxZoom: 19,
        className: 'satellite-tiles',
      }
    ).addTo(map);

    // Dark overlay for tactical look
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
      {
        attribution: '© CARTO',
        subdomains: 'abcd',
        opacity: 0.7,
        maxZoom: 19,
      }
    ).addTo(map);

    // Initialize layer groups
    aircraftLayerRef.current = L.layerGroup().addTo(map);
    vesselLayerRef.current = L.layerGroup().addTo(map);
    satelliteLayerRef.current = L.layerGroup().addTo(map);
    threatLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update aircraft markers
  useEffect(() => {
    if (!aircraftLayerRef.current) return;
    const layer = aircraftLayerRef.current;
    const aircraftLayer = layers.find(l => l.id === 'aircraft');
    
    if (!aircraftLayer?.active) {
      layer.clearLayers();
      return;
    }

    const activeIds = new Set(aircraft.map(a => a.icao24));
    const currentIds = new Set(markerCacheRef.current.keys());

    // Remove stale markers
    currentIds.forEach(id => {
      if (!activeIds.has(id)) {
        const marker = markerCacheRef.current.get(id);
        if (marker) {
          layer.removeLayer(marker);
          markerCacheRef.current.delete(id);
        }
      }
    });

    // Update/add markers
    aircraft.forEach(ac => {
      if (!ac.latitude || !ac.longitude) return;
      
      const existing = markerCacheRef.current.get(ac.icao24);
      if (existing) {
        existing.setLatLng([ac.latitude, ac.longitude]);
        existing.setIcon(getAircraftIcon(ac));
      } else {
        const marker = L.marker([ac.latitude, ac.longitude], {
          icon: getAircraftIcon(ac),
          zIndexOffset: ac.isMillitary ? 1000 : 0,
        });
        
        marker.bindTooltip(`
          <div style="background:#0a1628;border:1px solid #00d4ff44;color:#00d4ff;font-family:'Share Tech Mono',monospace;font-size:10px;padding:4px 8px;border-radius:2px">
            <div style="color:#fff;font-weight:bold">${ac.callsign}</div>
            <div>${ac.origin_country}</div>
            <div>ALT: ${ac.baro_altitude ? Math.round(ac.baro_altitude) + 'm' : 'N/A'}</div>
            <div>SPD: ${ac.velocity ? Math.round(ac.velocity) + 'm/s' : 'N/A'}</div>
            ${ac.squawk ? `<div>SQK: ${ac.squawk}</div>` : ''}
          </div>
        `, { permanent: false, className: 'bond-tooltip' });
        
        marker.on('click', () => onAircraftSelect(ac));
        layer.addLayer(marker);
        markerCacheRef.current.set(ac.icao24, marker);
      }
    });
  }, [aircraft, layers]);

  // Update vessel markers
  useEffect(() => {
    if (!vesselLayerRef.current) return;
    const layer = vesselLayerRef.current;
    const vesselLayer = layers.find(l => l.id === 'maritime');

    if (!vesselLayer?.active) {
      layer.clearLayers();
      return;
    }

    layer.clearLayers();
    vessels.forEach(v => {
      if (!v.latitude || !v.longitude) return;
      const marker = L.marker([v.latitude, v.longitude], { icon: getVesselIcon(v) });
      marker.bindTooltip(`
        <div style="background:#0a1628;border:1px solid #00ff8844;color:#00ff88;font-family:'Share Tech Mono',monospace;font-size:10px;padding:4px 8px;border-radius:2px">
          <div style="color:#fff;font-weight:bold">${v.name}</div>
          <div>MMSI: ${v.mmsi}</div>
          <div>SPD: ${v.speed.toFixed(1)} kts</div>
          <div>FLAG: ${v.flag || 'UNKNOWN'}</div>
        </div>
      `, { permanent: false, className: 'bond-tooltip' });
      marker.on('click', () => onVesselSelect(v));
      layer.addLayer(marker);
    });
  }, [vessels, layers]);

  // Update satellite markers
  useEffect(() => {
    if (!satelliteLayerRef.current) return;
    const layer = satelliteLayerRef.current;
    const satLayer = layers.find(l => l.id === 'satellites');

    if (!satLayer?.active) {
      layer.clearLayers();
      return;
    }

    layer.clearLayers();
    satellites.forEach(sat => {
      const marker = L.marker([sat.lat, sat.lng], { icon: getSatelliteIcon(sat) });
      marker.bindTooltip(`
        <div style="background:#0a1628;border:1px solid #ff00ff44;color:#ff00ff;font-family:'Share Tech Mono',monospace;font-size:10px;padding:4px 8px;border-radius:2px">
          <div style="color:#fff;font-weight:bold">${sat.name}</div>
          <div>NORAD: ${sat.norad}</div>
          <div>CAT: ${sat.category.toUpperCase()}</div>
          <div>ALT: ${sat.alt.toFixed(0)} km</div>
        </div>
      `, { permanent: false, className: 'bond-tooltip' });
      
      layer.addLayer(marker);
    });
  }, [satellites, layers]);

  // Update threat markers
  useEffect(() => {
    if (!threatLayerRef.current) return;
    const layer = threatLayerRef.current;
    const threatLayer = layers.find(l => l.id === 'threats');

    if (!threatLayer?.active) {
      layer.clearLayers();
      return;
    }

    layer.clearLayers();
    threats.forEach(threat => {
      if (!threat.lat || !threat.lng) return;
      
      const marker = L.marker([threat.lat, threat.lng], { icon: getThreatIcon(threat) });
      marker.bindTooltip(`
        <div style="background:#0a1628;border:1px solid #ff222244;color:#ff4444;font-family:'Share Tech Mono',monospace;font-size:10px;padding:4px 8px;border-radius:2px">
          <div style="color:#fff;font-weight:bold">${threat.title}</div>
          <div>${threat.description.substring(0, 60)}...</div>
          <div style="color:#ff8888">${new Date(threat.timestamp).toUTCString().substring(0, 25)}</div>
        </div>
      `, { permanent: false, className: 'bond-tooltip' });
      
      marker.on('click', () => onThreatSelect(threat));

      // Add pulse circle for high severity threats
      if (threat.severity === 'red') {
        const color = '#ff2222';
        L.circle([threat.lat, threat.lng], {
          radius: 50000,
          color,
          fillColor: color,
          fillOpacity: 0.05,
          weight: 1,
          opacity: 0.4,
        }).addTo(layer);
      }

      layer.addLayer(marker);
    });
  }, [threats, layers]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#0a0e1a' }}
    />
  );
}
