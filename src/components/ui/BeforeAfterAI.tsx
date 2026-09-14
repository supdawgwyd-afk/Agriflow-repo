import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { XCircle, CheckCircle2, ArrowRight, Scale, Sparkles } from 'lucide-react';

interface BeforeAfterAIProps {
  className?: string;
  condensed?: boolean;
}

const comparisonRows = [
  {
    category: 'Crop & Planting Decisions',
    before: 'Farmer decides in isolation with zero buyer demand visibility, leading to cyclical glut.',
    after: 'Real-time demand forecasting and 7-day rolling horizons guide planting and harvest timing.',
  },
  {
    category: 'Procurement Centre Selection',
    before: 'Farmers converge on the nearest mandi blindly, causing severe bottlenecks and traffic.',
    after: 'Dynamic centre load balancing redirects farmers to low-congestion centres (e.g. Centre B).',
  },
  {
    category: 'Arrival & Mandi Waiting',
    before: 'Unpredictable 3–6 hour physical queue lines in hot weather without real-time tracking.',
    after: 'Smart slot token booking with live queue positioning and accurate estimated wait times.',
  },
  {
    category: 'Buyer Discovery & Price Realization',
    before: 'Dependent on local middlemen; Grade A produce is mixed and discounted under distress.',
    after: 'AI buyer cluster matching pairs produce with institutional buyers for fair premium realization.',
  },
  {
    category: 'Transportation & Logistics',
    before: 'Individual farmers hire separate tractors/small trucks at exorbitant unpooled rates.',
    after: 'Clustered pickup routing groups neighboring farmers along the same route to cut transit distance.',
  },
  {
    category: 'Surplus & Post-Harvest Waste',
    before: 'Perishable surplus rots on farm edges or is dumped at distress prices during gluts.',
    after: 'Surplus prediction engine automatically triggers redirection to cold storage or bulk buyers.',
  },
];

export function BeforeAfterAI({ className = '', condensed = false }: BeforeAfterAIProps) {
  return (
    <Card className={`overflow-hidden border border-earth-200 ${className}`}>
      <CardHeader
        title="Impact Assessment: Traditional Mandi vs AgriFlow AI"
        subtitle="How the AI intelligence layer transforms agricultural procurement for SIH 2026"
        icon={<Scale className="w-5 h-5 text-agri-600" />}
        badge={
          <Badge variant="agri">
            <Sparkles className="w-3 h-3" /> System Evaluation
          </Badge>
        }
      />

      <div className="p-5 pt-2">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Before */}
          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 rounded-md bg-red-100 text-red-700">
                <XCircle className="w-4 h-4" />
              </span>
              <h4 className="font-bold text-red-900 text-sm">
                Before: Fragmented Traditional Supply Chain
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-red-950">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Farmer decides based on limited, rumor-driven information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Uncertain procurement timing and uncoordinated mandi arrivals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Long, unpredictable queues and idle truck waiting times</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Fragmented buyer access and high middleman commissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Manual, expensive single-load logistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>High surplus risk resulting in post-harvest distress dumping</span>
              </li>
            </ul>
          </div>

          {/* After */}
          <div className="p-4 rounded-xl bg-green-50/60 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 rounded-md bg-green-100 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <h4 className="font-bold text-green-900 text-sm">
                After: AgriFlow AI Synchronized Intelligence
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-green-950">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Demand-informed harvest planning and price guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Smart centre recommendation based on live capacity and queues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Predicted waiting time and token progression updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>AI buyer matching with quality-grade transparency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Clustered logistics reducing transit miles across villages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Surplus detection and automated redirection to institutional buyers</span>
              </li>
            </ul>
          </div>
        </div>

        {!condensed && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-earth-200 text-earth-500 uppercase tracking-wider">
                  <th className="text-left py-2 px-3 font-semibold w-1/4">Operational Phase</th>
                  <th className="text-left py-2 px-3 font-semibold w-3/8 text-red-800">Legacy Approach</th>
                  <th className="text-left py-2 px-3 font-semibold w-3/8 text-green-800">AgriFlow AI Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-earth-50/60">
                    <td className="py-2.5 px-3 font-semibold text-earth-900">{row.category}</td>
                    <td className="py-2.5 px-3 text-red-700 bg-red-50/20">{row.before}</td>
                    <td className="py-2.5 px-3 text-green-800 bg-green-50/20 font-medium">{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
