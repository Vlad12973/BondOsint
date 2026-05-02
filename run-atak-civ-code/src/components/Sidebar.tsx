import React from 'react';
import { 
  Map as MapIcon, 
  Users, 
  Layers, 
  Settings, 
  Navigation, 
  MessageSquare,
  Shield,
  Activity,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
  const tools = [
    { id: 'map', icon: MapIcon, label: 'Map' },
    { id: 'team', icon: Users, label: 'Team' },
    { id: 'nav', icon: Navigation, label: 'Nav' },
    { id: 'comms', icon: MessageSquare, label: 'Chat' },
    { id: 'layers', icon: Layers, label: 'Layers' },
    { id: 'cas', icon: Zap, label: 'CAS' },
    { id: 'med', icon: Activity, label: 'MED' },
    { id: 'settings', icon: Settings, label: 'Config' },
  ];

  return (
    <div className="w-16 h-full tactical-glass flex flex-col items-center py-4 gap-4 z-[1000] border-r border-white/10">
      <div className="mb-4">
        <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center text-black font-bold text-xl">
          A
        </div>
      </div>
      
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={`atak-btn group relative ${activeTool === tool.id ? 'atak-btn-active' : 'text-gray-400'}`}
          title={tool.label}
        >
          <tool.icon size={24} />
          <span className="absolute left-16 bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
            {tool.label}
          </span>
        </button>
      ))}

      <div className="mt-auto flex flex-col gap-4">
        <button className="atak-btn text-red-500 hover:bg-red-500/10">
          <Shield size={24} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
