import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Compass, Clock } from 'lucide-react';

const StatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-10 w-full tactical-glass flex items-center justify-between px-4 z-[1000] border-b border-white/10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-amber-500 font-mono text-xs">
          <Compass size={14} />
          <span>34.0522°N 118.2437°W</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 font-mono text-xs">
          <span>ALT: 284m</span>
          <span className="text-gray-600">|</span>
          <span>SPD: 0.0 km/h</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
        <span className="text-xs font-bold text-amber-500 tracking-widest uppercase">Mission: Operation Ghost</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2 text-gray-400">
          <Wifi size={14} className="text-green-500" />
          <Signal size={14} className="text-green-500" />
          <Battery size={14} className="text-amber-500" />
        </div>
        <div className="flex items-center gap-2 text-gray-300 font-mono text-xs">
          <Clock size={14} />
          <span>{time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} Z</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
