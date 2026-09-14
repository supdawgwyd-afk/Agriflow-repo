import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { MapPanel } from '@/components/ui/MapPanel';
import { useApp } from '@/context/AppContext';
import type { ProcurementCentre } from '@/types';
import { Globe, MapPin, Users, Clock, Package, IndianRupee } from 'lucide-react';

export function AdminMap() {
  const { centres } = useApp();
  const [selected, setSelected] = useState<ProcurementCentre | null>(centres[0]);

  return (
    <div>
      <PageHeader
        title="Regional Map"
        subtitle="Procurement centre locations and real-time status"
        icon={<Globe className="w-5 h-5" />}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
          <MapPanel centres={centres} selectedCentre={selected} onSelectCentre={setSelected} height="600px" />
        </Card>

        {/* Centre Details */}
        <div className="space-y-4">
          {selected && (
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-earth-900">{selected.name}</p>
                  <p className="text-xs text-earth-500">{selected.district} District</p>
                </div>
                <div className="ml-auto"><StatusBadge status={selected.status} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-earth-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Users className="w-3.5 h-3.5 text-earth-400" /><span className="text-xs text-earth-500">Farmers Today</span></div>
                  <p className="font-semibold text-earth-900">{selected.farmersToday}</p>
                </div>
                <div className="bg-earth-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5 text-earth-400" /><span className="text-xs text-earth-500">Avg Wait</span></div>
                  <p className="font-semibold text-earth-900">{selected.estimatedWaitMin} min</p>
                </div>
                <div className="bg-earth-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Package className="w-3.5 h-3.5 text-earth-400" /><span className="text-xs text-earth-500">Processed</span></div>
                  <p className="font-semibold text-earth-900">{(selected.processedTodayKg / 1000).toFixed(1)}t</p>
                </div>
                <div className="bg-earth-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1"><IndianRupee className="w-3.5 h-3.5 text-earth-400" /><span className="text-xs text-earth-500">Pending Pay</span></div>
                  <p className="font-semibold text-earth-900">{selected.pendingPaymentsCount}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-earth-500">Capacity</span>
                  <span className="font-semibold text-earth-900">{selected.capacityPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-earth-200 overflow-hidden">
                  <div className={`h-full rounded-full ${selected.capacityPct > 85 ? 'bg-red-500' : selected.capacityPct > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${selected.capacityPct}%` }} />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-earth-500">Slots Booked</span>
                  <span className="font-semibold text-earth-900">{selected.todaySlotsBooked}/{selected.todaySlotsTotal}</span>
                </div>
                <div className="h-2 rounded-full bg-earth-200 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(selected.todaySlotsBooked / selected.todaySlotsTotal) * 100}%` }} />
                </div>
              </div>
            </Card>
          )}

          <Card className="p-4">
            <p className="text-sm font-medium text-earth-700 mb-3">All Centres</p>
            <div className="space-y-2">
              {centres.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selected?.id === c.id ? 'border-agri-500 bg-agri-50' : 'border-earth-100 hover:bg-earth-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-earth-900">{c.name}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-earth-500 mt-1">Queue: {c.queueCount} • Wait: {c.estimatedWaitMin}m • {c.capacityPct}% capacity</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
