import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { QUEUE_STAGES } from '@/types';
import type { QueueStage } from '@/types';
import { computeCongestionScore } from '@/utils/aiSimulation';
import {
  ListOrdered, Clock, Users, ChevronDown, AlertTriangle, ArrowRight,
} from 'lucide-react';

export function CentreQueue() {
  const { queueTokens, centres, updateQueueStage, executeRedirect } = useApp();
  const [selectedCentreId, setSelectedCentreId] = useState(centres[0].id);
  const centre = centres.find((c) => c.id === selectedCentreId) || centres[0];
  const centreTokens = queueTokens.filter((t) => t.centreId === centre.id);
  const congestion = computeCongestionScore(centre);
  const altCentre = centres.find((c) => c.id !== centre.id && c.capacityPct < 70);

  return (
    <div>
      <PageHeader
        title="Live Queue"
        subtitle="Real-time queue management across all centres"
        icon={<ListOrdered className="w-5 h-5" />}
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
              {c.name}
              <span className="ml-2 text-xs opacity-75">{c.queueCount} in queue</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">In Queue</p><p className="text-xl font-bold text-earth-900">{centreTokens.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Avg Wait</p><p className="text-xl font-bold text-earth-900">{centre.estimatedWaitMin}m</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center"><ListOrdered className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Processing</p><p className="text-xl font-bold text-earth-900">{centreTokens.filter(t => t.stage === 'Weighing' || t.stage === 'Quality Check').length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Capacity</p><p className="text-xl font-bold text-earth-900">{centre.capacityPct}%</p></div>
          </div>
        </Card>
      </div>

      {/* AI Congestion Warning */}
      {congestion.shouldRedirect && altCentre && (
        <div className="mb-6">
          <AIInsightCard
            title="AI Congestion Warning"
            badge="AI Simulation"
            variant="warning"
            reasoning={`${centre.name} is at ${centre.capacityPct}% capacity (congestion level: ${congestion.level}). Redirecting incoming farmers to ${altCentre.name} will reduce wait times significantly.`}
          >
            <div className="flex items-center gap-3 bg-agri-50 border border-agri-200 rounded-xl p-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-agri-800">Recommended Action</p>
                <p className="text-sm text-earth-700 mt-1">Redirect new arrivals to <strong>{altCentre.name}</strong> ({altCentre.capacityPct}% capacity, {altCentre.queueCount} in queue)</p>
              </div>
              <button
                onClick={() => executeRedirect(centre.id, altCentre.id)}
                className="btn-primary text-sm"
              >
                Execute Redirect <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </AIInsightCard>
        </div>
      )}

      {/* Queue Table */}
      <Card>
        <CardHeader title={`${centre.name} Queue`} subtitle="Update farmer status in real-time" icon={<ListOrdered className="w-5 h-5" />} />
        {centreTokens.length === 0 ? (
          <div className="p-12 text-center">
            <ListOrdered className="w-12 h-12 mx-auto text-earth-300 mb-3" />
            <p className="text-earth-500">No farmers in queue. New bookings will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Token</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Farmer</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Crop</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Qty</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Slot</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Stage</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Wait</th>
                  <th className="text-center text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Priority</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Update</th>
                </tr>
              </thead>
              <tbody>
                {centreTokens.map((token) => (
                  <tr key={token.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50">
                    <td className="px-4 py-3"><span className="font-mono font-semibold text-earth-900">{token.tokenNumber}</span></td>
                    <td className="px-4 py-3 text-sm text-earth-700">{token.farmerName}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{token.crop}</td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">{token.quantityKg} kg</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{token.slotTime}</td>
                    <td className="px-4 py-3"><StatusBadge status={token.stage} /></td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">{token.estimatedWaitMin}m</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={token.priority === 'Urgent' ? 'danger' : token.priority === 'High' ? 'warning' : 'neutral'}>
                        {token.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={token.stage}
                          onChange={(e) => updateQueueStage(token.id, e.target.value as QueueStage)}
                          className="text-xs border border-earth-300 rounded-lg px-2 py-1.5 pr-7 bg-white text-earth-700 focus:outline-none focus:ring-2 focus:ring-agri-500/30 appearance-none cursor-pointer"
                        >
                          {QUEUE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-earth-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
