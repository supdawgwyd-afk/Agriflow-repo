import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { AIExplainPipeline } from '@/utils/aiSimulation';

interface AIExplainCardProps {
  pipeline: AIExplainPipeline;
  title?: string;
  actionableImpact?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export function AIExplainCard({
  pipeline,
  title = 'How was this AI recommendation calculated?',
  actionableImpact,
  defaultExpanded = false,
  className = '',
}: AIExplainCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`rounded-xl border border-earth-200 bg-earth-50/60 overflow-hidden text-xs ${className}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-earth-100/70 transition-colors text-left font-medium text-earth-700"
      >
        <span className="flex items-center gap-1.5 text-agri-700 font-semibold">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          {title}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-earth-500">
          <span>{expanded ? 'Hide Calculation' : 'Explain Logic'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 py-3.5 border-t border-earth-200/70 bg-white/90 space-y-3 animate-fade-in">
          {/* Inputs */}
          <div>
            <div className="flex items-center gap-1.5 text-earth-500 font-bold uppercase tracking-wider text-[10px] mb-1">
              <span>1. Live Inputs & Ground Truth</span>
            </div>
            <ul className="space-y-1 pl-3 border-l-2 border-agri-200">
              {pipeline.inputs.map((input, idx) => (
                <li key={idx} className="text-earth-700 font-mono text-[11px]">
                  • {input}
                </li>
              ))}
            </ul>
          </div>

          {/* Logic/Model */}
          <div>
            <div className="flex items-center gap-1.5 text-earth-500 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Cpu className="w-3 h-3 text-agri-600" />
              <span>2. Decision Engine / Logic</span>
            </div>
            <p className="text-earth-800 bg-earth-50 px-2.5 py-1.5 rounded border border-earth-200 font-medium">
              {pipeline.model}
            </p>
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center gap-1.5 text-earth-500 font-bold uppercase tracking-wider text-[10px] mb-1">
              <ArrowRight className="w-3 h-3 text-green-600" />
              <span>3. Prediction / Recommendation</span>
            </div>
            <p className="text-agri-900 bg-agri-50/80 px-2.5 py-1.5 rounded border border-agri-200 font-semibold">
              {pipeline.output}
            </p>
          </div>

          {/* Impact if present */}
          {actionableImpact && (
            <div className="pt-2 border-t border-earth-100 flex items-start gap-1.5 text-agri-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Actionable Impact:</strong> {actionableImpact}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
