import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { MapPanel } from '@/components/ui/MapPanel';
import { useApp } from '@/context/AppContext';
import type { ProcurementCentre } from '@/types';
import {
  MapPin, Users, Clock, CalendarDays, Sparkles, Map, List, ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function FarmerProcurementCentres() {
  const { centres } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selected, setSelected] = useState<ProcurementCentre | null>(null);
  const recommended = centres.find((c) => c.id === 'C02');

  const statusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'MODERATE': return 'warning';
      case 'HIGH LOAD': return 'danger';
      case 'OVERLOADED': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div>
      <PageHeader
        title="Procurement Centres"
        subtitle="Find the best centre near you with AI recommendations"
        icon={<MapPin className="w-5 h-5" />}
        action={
          <div className="flex bg-earth-100 rounded-xl p-1">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-white text-earth-900 shadow-sm' : 'text-earth-500'}`}
            >
              <List className="w-4 h-4 inline mr-1" /> List
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'map' ? 'bg-white text-earth-900 shadow-sm' : 'text-earth-500'}`}
            >
              <Map className="w-4 h-4 inline mr-1" /> Map
            </button>
          </div>
        }
      />

      {view === 'map' && (
        <Card className="mb-6 p-4">
          <MapPanel centres={centres} selectedCentre={selected} onSelectCentre={setSelected} height="500px" />
          {selected && (
            <div className="mt-4 p-4 rounded-xl border border-earth-200 bg-earth-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-earth-900">{selected.name}</p>
                  <p className="text-sm text-earth-500">{selected.district} District</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div><p className="text-xs text-earth-500">Capacity</p><p className="font-semibold">{selected.capacityPct}%</p></div>
                <div><p className="text-xs text-earth-500">Queue</p><p className="font-semibold">{selected.queueCount}</p></div>
                <div><p className="text-xs text-earth-500">Est. Wait</p><p className="font-semibold">{selected.estimatedWaitMin} min</p></div>
                <div><p className="text-xs text-earth-500">Slots Open</p><p className="font-semibold">{selected.todaySlotsTotal - selected.todaySlotsBooked}</p></div>
              </div>
              <button onClick={() => navigate('/farmer/book-slot')} className="btn-primary mt-3 w-full sm:w-auto">
                Book Slot <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {centres.map((centre) => {
          const isRecommended = centre.id === recommended?.id;
          return (
            <Card key={centre.id} hover className={`p-5 ${isRecommended ? 'ring-2 ring-agri-500' : ''}`}>
              {isRecommended && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Badge variant="agri"><Sparkles className="w-3 h-3" /> AI Recommended</Badge>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-earth-900">{centre.name}</p>
                    <p className="text-xs text-earth-500">{centre.district} District</p>
                  </div>
                </div>
                <StatusBadge status={centre.status} />
              </div>

              {/* Capacity Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-earth-500">Capacity</span>
                  <span className="font-semibold text-earth-900">{centre.capacityPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-earth-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${centre.capacityPct > 85 ? 'bg-red-500' : centre.capacityPct > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${centre.capacityPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-earth-600">
                  <Users className="w-4 h-4 text-earth-400" />
                  <span>Queue: <strong>{centre.queueCount}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-earth-600">
                  <Clock className="w-4 h-4 text-earth-400" />
                  <span>Wait: <strong>{centre.estimatedWaitMin}m</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-earth-600">
                  <CalendarDays className="w-4 h-4 text-earth-400" />
                  <span>Slots: <strong>{centre.todaySlotsTotal - centre.todaySlotsBooked}</strong> open</span>
                </div>
                <div className="flex items-center gap-1.5 text-earth-600">
                  <TrendingUp className="w-4 h-4 text-earth-400" />
                  <span>Today: <strong>{centre.farmersToday}</strong></span>
                </div>
              </div>

              <button
                onClick={() => navigate('/farmer/book-slot')}
                className={`btn-secondary w-full mt-4 ${isRecommended ? '!bg-agri-600 !text-white !border-agri-600 hover:!bg-agri-700' : ''}`}
              >
                Book Slot <ArrowRight className="w-4 h-4" />
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
