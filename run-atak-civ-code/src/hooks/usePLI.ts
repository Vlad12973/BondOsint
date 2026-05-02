import { useState, useEffect } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  lat: number;
  lng: number;
  role: 'TL' | 'MED' | 'RTO' | 'OP';
  status: 'active' | 'inactive' | 'emergency';
  lastUpdate: number;
  heading: number;
}

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Alpha-1 (Lead)', lat: 34.0522, lng: -118.2437, role: 'TL', status: 'active', lastUpdate: Date.now(), heading: 45 },
  { id: '2', name: 'Alpha-2 (Medic)', lat: 34.0530, lng: -118.2445, role: 'MED', status: 'active', lastUpdate: Date.now(), heading: 120 },
  { id: '3', name: 'Alpha-3 (RTO)', lat: 34.0515, lng: -118.2420, role: 'RTO', status: 'active', lastUpdate: Date.now(), heading: 280 },
  { id: '4', name: 'Bravo-1', lat: 34.0540, lng: -118.2460, role: 'OP', status: 'active', lastUpdate: Date.now(), heading: 10 },
];

export const usePLI = () => {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);

  useEffect(() => {
    const interval = setInterval(() => {
      setTeam((prev) =>
        prev.map((member) => {
          // Subtle movement
          const dLat = (Math.random() - 0.5) * 0.0001;
          const dLng = (Math.random() - 0.5) * 0.0001;
          const newHeading = (member.heading + (Math.random() - 0.5) * 20 + 360) % 360;
          
          return {
            ...member,
            lat: member.lat + dLat,
            lng: member.lng + dLng,
            heading: newHeading,
            lastUpdate: Date.now(),
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return team;
};
