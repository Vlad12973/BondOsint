import { useMapEvents } from 'react-leaflet';

interface MapMouseTrackerProps {
  onMove: (lat: number, lng: number) => void;
}

export default function MapMouseTracker({ onMove }: MapMouseTrackerProps) {
  useMapEvents({
    mousemove: (e) => {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
