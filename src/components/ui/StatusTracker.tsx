import { QUEUE_STAGES } from '@/types';
import type { QueueStage } from '@/types';
import { Check } from 'lucide-react';

interface StatusTrackerProps {
  stages: string[];
  currentStage: string;
  completed?: string[];
}

export function StatusTracker({ stages, currentStage, completed = [] }: StatusTrackerProps) {
  const currentIndex = stages.indexOf(currentStage);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {stages.map((stage, i) => {
        const isCompleted = completed.includes(stage) || i < currentIndex;
        const isCurrent = stage === currentStage;
        const isFuture = i > currentIndex;
        return (
          <div key={stage} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCompleted ? 'bg-agri-600 text-white' :
                  isCurrent ? 'bg-agri-100 text-agri-700 ring-2 ring-agri-500 animate-pulse-soft' :
                  'bg-earth-100 text-earth-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${isCurrent ? 'text-agri-700' : isFuture ? 'text-earth-400' : 'text-earth-600'}`}>
                {stage}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className={`w-6 sm:w-12 h-0.5 mx-1 rounded-full ${isCompleted ? 'bg-agri-500' : 'bg-earth-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function QueueTracker({ currentStage }: { currentStage: QueueStage }) {
  return <StatusTracker stages={QUEUE_STAGES} currentStage={currentStage} />;
}
