import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { StatusTracker } from '@/components/ui/StatusTracker';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { QUEUE_STAGES } from '@/types';
import type { QueueStage } from '@/types';
import {
  Package, ChevronRight, IndianRupee, Store,
} from 'lucide-react';

const PROCUREMENT_STAGES = ['Arrived', 'Weighed', 'Quality Check', 'Accepted', 'Procured', 'Payment Initiated', 'Paid'] as const;

export function CentreProcurement() {
  const { queueTokens, centres, updateQueueStage } = useApp();
  const [selectedCentreId, setSelectedCentreId] = useState(centres[0].id);
  const centre = centres.find((c) => c.id === selectedCentreId) || centres[0];
  const activeTokens = queueTokens.filter((t) => t.centreId === centre.id && t.stage !== 'Payment');

  const stageMap: Record<QueueStage, string> = {
    'Registered': 'Arrived',
    'Arrived': 'Arrived',
    'Waiting': 'Weighed',
    'Weighing': 'Weighed',
    'Quality Check': 'Quality Check',
    'Procured': 'Procured',
    'Payment': 'Paid',
  };

  return (
    <div>
      <PageHeader
        title="Procurement"
        subtitle="Procurement workflow and status tracking"
        icon={<Package className="w-5 h-5" />}
      />

      {/* Centre Selector */}
      <Card className="mb-6 p-4">
        <label className="label mb-2">Select Centre</label>
        <div className="flex flex-wrap gap-2">
          {centres.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCentreId(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCentreId === c.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
              }`}
            >
              <Store className="w-3.5 h-3.5 inline mr-1.5" />
              {c.name}
              <span className="ml-2 text-xs opacity-75">{c.capacityPct}%</span>
            </button>
          ))}
        </div>
      </Card>

      {activeTokens.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">No active procurement at {centre.name}. New bookings will appear here automatically.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeTokens.slice(0, 12).map((token) => {
            const currentProcStage = stageMap[token.stage] || 'Arrived';
            return (
              <Card key={token.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3 lg:w-56 flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <span className="font-mono font-bold text-sm">{token.tokenNumber}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-earth-900">{token.farmerName}</p>
                      <p className="text-sm text-earth-500">{token.crop} • {token.quantityKg} kg</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <StatusTracker stages={PROCUREMENT_STAGES as unknown as string[]} currentStage={currentProcStage} />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-earth-500">Value</p>
                      <p className="font-semibold text-earth-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {(token.quantityKg * 30).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-earth-300" />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-earth-100">
                  {QUEUE_STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => updateQueueStage(token.id, stage)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        token.stage === stage
                          ? 'bg-agri-600 text-white'
                          : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
