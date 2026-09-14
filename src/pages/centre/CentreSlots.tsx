import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  CalendarDays, Clock, Users, Lock, Unlock, TrendingUp,
} from 'lucide-react';

export function CentreSlots() {
  const { slots, centres, toggleSlot } = useApp();
  const centre = centres[0];
  const centreSlots = slots.filter((s) => s.centreId === centre.id);

  return (
    <div>
      <PageHeader
        title="Slot Management"
        subtitle={`${centre.name} • Manage available time slots`}
        icon={<CalendarDays className="w-5 h-5" />}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><CalendarDays className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Total Slots</p><p className="text-xl font-bold text-earth-900">{centreSlots.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center"><Unlock className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Open</p><p className="text-xl font-bold text-earth-900">{centreSlots.filter(s => s.isOpen).length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><Lock className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Closed</p><p className="text-xl font-bold text-earth-900">{centreSlots.filter(s => !s.isOpen).length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Booked</p><p className="text-xl font-bold text-earth-900">{centreSlots.reduce((s, sl) => s + sl.booked, 0)}</p></div>
          </div>
        </Card>
      </div>

      {/* Slots Grid */}
      <Card>
        <CardHeader title="Time Slots" subtitle="Toggle slots open/closed and view congestion predictions" icon={<Clock className="w-5 h-5" />} />
        <div className="p-5 pt-2">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {centreSlots.map((slot) => {
              const remaining = slot.capacity - slot.booked;
              const congestionColor = slot.predictedCongestionPct > 70 ? 'danger' : slot.predictedCongestionPct > 40 ? 'warning' : 'success';
              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-xl border-2 transition-all ${slot.isOpen ? 'border-earth-200 bg-white' : 'border-earth-200 bg-earth-50 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-earth-900">{slot.time}</span>
                    <button
                      onClick={() => toggleSlot(slot.id)}
                      className={`p-1.5 rounded-lg ${slot.isOpen ? 'text-agri-600 hover:bg-agri-50' : 'text-earth-400 hover:bg-earth-100'}`}
                    >
                      {slot.isOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-earth-500">Booked: {slot.booked}/{slot.capacity}</span>
                    <span className={`font-semibold ${remaining > 0 ? 'text-agri-600' : 'text-red-600'}`}>
                      {remaining > 0 ? `${remaining} left` : 'FULL'}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-earth-200 overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${slot.booked / slot.capacity > 0.8 ? 'bg-red-500' : 'bg-agri-500'}`} style={{ width: `${(slot.booked / slot.capacity) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-earth-400" />
                      <span className="text-xs text-earth-500">Congestion:</span>
                    </div>
                    <Badge variant={congestionColor as any}>{slot.predictedCongestionPct}%</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
