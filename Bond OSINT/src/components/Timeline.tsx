import { useState, useEffect, useRef } from 'react';

const FILTER_TAGS = [
  { id: 'commercial', label: 'Commercial Flights', color: '#00d4ff', active: true },
  { id: 'military', label: 'Military Flights', color: '#ff4444', active: true },
  { id: 'gps-jam', label: 'GPS Jamming', color: '#ff8800', active: false },
  { id: 'ground-truth', label: 'Ground Truth Cards', color: '#ffdd00', active: false },
  { id: 'satellites', label: 'Imaging Satellites', color: '#44ddff', active: true },
  { id: 'maritime', label: 'Maritime Traffic', color: '#00ff88', active: true },
  { id: 'airspace', label: 'Airspace Closures', color: '#ff00ff', active: false },
  { id: 'vhf', label: 'VHF Intercept', color: '#ff6688', active: false },
  { id: 'internet', label: 'Internet Blackout', color: '#ff4400', active: false },
  { id: 'osint', label: 'OSINT Social Events', color: '#44ff88', active: false },
];

const BOTTOM_TAGS = [
  { id: 'kinetic', label: 'Kinetic', color: '#ff2222' },
  { id: 'retaliation', label: 'Retaliation', color: '#ff6622' },
  { id: 'civilian', label: 'Civilian Impact', color: '#ff8800' },
  { id: 'maritime2', label: 'Maritime', color: '#0088ff' },
  { id: 'infrastructure', label: 'Infrastructure', color: '#8844ff' },
  { id: 'escalation', label: 'Escalation', color: '#ff4488' },
  { id: 'airspace2', label: 'Airspace Closure', color: '#dd44ff' },
];

const SPEED_OPTIONS = ['1m/s', '3m/s', '5m/s', '15m/s', '1h/s'];

// Generate timeline markers
function generateMarkers() {
  const markers = [];
  const types = [
    { type: 'red', w: 3 }, { type: 'orange', w: 2 }, { type: 'cyan', w: 1 },
    { type: 'yellow', w: 1 }, { type: 'pink', w: 2 }
  ];

  for (let i = 0; i < 60; i++) {
    const t = types[Math.floor(Math.random() * types.length)];
    if (Math.random() > 0.6) {
      markers.push({ pos: i / 60, color: t.type, size: t.w });
    }
  }
  return markers;
}

const TIMELINE_MARKERS = generateMarkers();

export default function Timeline() {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0.15);
  const [speed, setSpeed] = useState('3m/s');
  const [activeTags, setActiveTags] = useState<string[]>(['commercial', 'military', 'satellites', 'maritime']);
  const [activeBottom, setActiveBottom] = useState<string[]>(['kinetic', 'retaliation']);
  const [utcTime, setUtcTime] = useState('');
  const animRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      setUtcTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const animate = (time: number) => {
      if (lastRef.current) {
        const delta = time - lastRef.current;
        setProgress(p => (p + delta * 0.00001) % 1);
      }
      lastRef.current = time;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [playing]);

  const toggleTag = (id: string) => {
    setActiveTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const toggleBottom = (id: string) => {
    setActiveBottom(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-black/85 border-t border-cyan-900/50 backdrop-blur-sm">
      {/* Filter tags row */}
      <div className="flex items-center gap-1.5 px-3 py-1 border-b border-cyan-900/30 overflow-x-auto">
        {FILTER_TAGS.map(tag => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-[8px] font-mono whitespace-nowrap transition-all flex-shrink-0"
            style={{
              borderWidth: 1,
              borderColor: activeTags.includes(tag.id) ? tag.color : '#333',
              color: activeTags.includes(tag.id) ? tag.color : '#555',
              backgroundColor: activeTags.includes(tag.id) ? `${tag.color}15` : 'transparent',
            }}
          >
            <span>{activeTags.includes(tag.id) ? '✕' : '+'}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>

      {/* Timeline scrubber */}
      <div className="px-3 py-1.5 relative">
        <div className="relative h-4 flex items-center">
          {/* Track */}
          <div className="absolute inset-x-0 h-px bg-gray-700/60" />
          
          {/* Markers */}
          {TIMELINE_MARKERS.map((m, i) => (
            <div
              key={i}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${m.pos * 100}%` }}
            >
              <div
                className="rounded-full"
                style={{
                  width: `${m.size + 2}px`,
                  height: `${m.size + 2}px`,
                  backgroundColor:
                    m.color === 'red' ? '#ff3333' :
                    m.color === 'orange' ? '#ff8800' :
                    m.color === 'cyan' ? '#00d4ff' :
                    m.color === 'yellow' ? '#ffdd00' : '#ff44aa',
                  boxShadow: `0 0 4px ${
                    m.color === 'red' ? '#ff3333' :
                    m.color === 'orange' ? '#ff8800' :
                    m.color === 'cyan' ? '#00d4ff' :
                    m.color === 'yellow' ? '#ffdd00' : '#ff44aa'
                  }88`,
                }}
              />
            </div>
          ))}

          {/* Progress indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-cyan-400 bg-cyan-400/30 cursor-pointer"
            style={{ left: `${progress * 100}%`, transform: 'translate(-50%, -50%)' }}
          />

          {/* Clickable track */}
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(progress * 100)}
            onChange={e => setProgress(Number(e.target.value) / 100)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 px-3 pb-2 overflow-x-auto">
        {/* Play/Pause */}
        <button
          onClick={() => setPlaying(p => !p)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center border border-cyan-700/50 rounded-sm text-cyan-400 hover:bg-cyan-900/30 text-xs"
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Speed */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[8px] font-mono text-gray-500">SPEED:</span>
          {SPEED_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 text-[8px] font-mono rounded-sm transition-all ${
                speed === s
                  ? 'bg-cyan-800/40 text-cyan-300 border border-cyan-600/50'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Orbit */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[8px] font-mono text-gray-500">ORBIT:</span>
          <button className="px-1.5 py-0.5 text-[8px] font-mono text-gray-600 border border-gray-800 rounded-sm">OFF</button>
        </div>

        {/* Middle info */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[8px] font-mono text-gray-500">3°/s</span>
        </div>

        {/* City dropdown */}
        <select className="bg-black/50 border border-gray-700/50 text-[8px] font-mono text-gray-400 px-2 py-0.5 rounded-sm flex-shrink-0 outline-none">
          <option>Global</option>
          <option>Tehran</option>
          <option>Dubai</option>
          <option>Kyiv</option>
          <option>Beijing</option>
          <option>Moscow</option>
        </select>

        {/* View modes */}
        {['FLAT', 'SPIRAL IN', 'SPIRAL OUT'].map(mode => (
          <button
            key={mode}
            className={`px-2 py-0.5 text-[8px] font-mono border rounded-sm flex-shrink-0 transition-all ${
              mode === 'FLAT'
                ? 'bg-cyan-800/30 border-cyan-600/50 text-cyan-300'
                : 'border-gray-700/50 text-gray-600 hover:text-gray-400'
            }`}
          >
            {mode}
          </button>
        ))}

        {/* Altitude slider area */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-[8px] font-mono text-gray-500">250km</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-[8px] font-mono text-gray-500">-45°</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-[8px] font-mono text-gray-500">60° FOV</span>
        </div>

        {/* UTC Time */}
        <div className="ml-auto flex-shrink-0 text-[8px] font-mono text-cyan-500">
          {utcTime}
        </div>
      </div>

      {/* Bottom event tags */}
      <div className="flex items-center gap-1.5 px-3 pb-1.5 overflow-x-auto border-t border-cyan-900/20">
        {BOTTOM_TAGS.map(tag => (
          <button
            key={tag.id}
            onClick={() => toggleBottom(tag.id)}
            className="flex items-center gap-1 text-[8px] font-mono whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              color: activeBottom.includes(tag.id) ? tag.color : '#444',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color, opacity: activeBottom.includes(tag.id) ? 1 : 0.3 }} />
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
