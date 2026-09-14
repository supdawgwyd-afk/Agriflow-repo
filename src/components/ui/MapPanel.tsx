import type { ProcurementCentre } from '@/types';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface MapPanelProps {
  centres: ProcurementCentre[];
  selectedCentre?: ProcurementCentre | null;
  onSelectCentre?: (centre: ProcurementCentre) => void;
  height?: string;
}

export function MapPanel({ centres, selectedCentre, onSelectCentre, height = '500px' }: MapPanelProps) {
  const statusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'bg-green-500', ring: 'ring-green-300', text: 'text-green-600', dot: 'bg-green-500' };
      case 'MODERATE': return { bg: 'bg-amber-500', ring: 'ring-amber-300', text: 'text-amber-600', dot: 'bg-amber-500' };
      case 'HIGH LOAD': return { bg: 'bg-orange-500', ring: 'ring-orange-300', text: 'text-orange-600', dot: 'bg-orange-500' };
      case 'OVERLOADED': return { bg: 'bg-red-500', ring: 'ring-red-300', text: 'text-red-600', dot: 'bg-red-500' };
      default: return { bg: 'bg-earth-400', ring: 'ring-earth-300', text: 'text-earth-500', dot: 'bg-earth-400' };
    }
  };

  return (
    <div className={`relative w-full rounded-2xl border border-earth-200 overflow-hidden map-grid bg-earth-50`} style={{ height }}>
      {/* Map background with terrain-like styling */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-earth-50 to-blue-50/30" />

      {/* Decorative roads/paths */}
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
        <path d="M 0 200 Q 200 150 400 250 T 800 200" stroke="#d6d3d1" strokeWidth="2" fill="none" />
        <path d="M 100 0 Q 150 200 300 300 T 500 500" stroke="#d6d3d1" strokeWidth="2" fill="none" />
        <path d="M 0 350 L 200 320 L 400 380 L 700 340" stroke="#d6d3d1" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Centre markers */}
      {centres.map((centre) => {
        const colors = statusColor(centre.status);
        const isSelected = selectedCentre?.id === centre.id;
        return (
          <button
            key={centre.id}
            onClick={() => onSelectCentre?.(centre)}
            className="absolute group"
            style={{ left: `${centre.x}%`, top: `${centre.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}>
              {centre.status === 'OVERLOADED' || centre.status === 'HIGH LOAD' ? (
                <AlertCircle className={`absolute w-8 h-8 ${colors.text} animate-pulse-soft`} />
              ) : (
                <CheckCircle className={`absolute w-8 h-8 ${colors.text} opacity-60`} />
              )}
              <div className={`w-4 h-4 rounded-full ${colors.bg} ring-4 ${colors.ring} shadow-lg`} />
            </div>
            {/* Tooltip */}
            <div className={`absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity pointer-events-none`}>
              <div className="bg-white rounded-lg shadow-elevated border border-earth-200 px-3 py-2 whitespace-nowrap text-xs">
                <p className="font-semibold text-earth-900">{centre.name}</p>
                <p className="text-earth-500">Capacity: {centre.capacityPct}% • Queue: {centre.queueCount}</p>
                <p className={`font-medium ${colors.text}`}>{centre.status}</p>
              </div>
            </div>
          </button>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl border border-earth-200 p-3 shadow-card">
        <p className="text-xs font-semibold text-earth-700 mb-2">Centre Status</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-earth-600">Available</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-earth-600">Moderate</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-earth-600">High Load</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-earth-600">Overloaded</span>
          </div>
        </div>
      </div>

      {/* Scale indicator */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl border border-earth-200 px-3 py-2 shadow-card">
        <div className="flex items-center gap-2 text-xs text-earth-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>Karunya Nagar, Siruvani & Coimbatore Region</span>
        </div>
      </div>
    </div>
  );
}
