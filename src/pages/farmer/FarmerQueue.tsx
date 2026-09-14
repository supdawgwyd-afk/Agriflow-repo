import { Card, CardHeader } from '@/components/ui/Card';
import { QueueTracker } from '@/components/ui/StatusTracker';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { AIPipelineVisualizer } from '@/components/ui/AIPipelineVisualizer';
import { AIExplainCard } from '@/components/ui/AIExplainCard';
import { useApp } from '@/context/AppContext';
import { computeQueuePrediction } from '@/utils/aiSimulation';
import {
  ListOrdered, Clock, Users, Activity, MapPin, Ticket, Sparkles, CheckCircle2,
} from 'lucide-react';

export function FarmerQueue() {
  const { bookings, queueTokens, centres, currentFarmer } = useApp();

  // Find the current farmer's most recent booking
  const myBookings = bookings.filter((b) => b.farmerId === currentFarmer.id);
  const currentBooking = myBookings[myBookings.length - 1];
  const myToken = queueTokens.find((t) => t.tokenNumber === currentBooking?.tokenNumber)
    || queueTokens.find((t) => t.farmerId === currentFarmer.id)
    || null;

  const centre = centres.find((c) => c.id === (myToken?.centreId || currentBooking?.centreId));

  if (!myToken) {
    return (
      <div className="space-y-6">
        <PageHeader title="Live Queue & Token Status" subtitle="AI throughput-driven wait tracking for your delivery slot" icon={<ListOrdered className="w-5 h-5 text-agri-600" />} />
        <AIPipelineVisualizer activeStepId="queue" />
        <Card className="p-12 text-center">
          <ListOrdered className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500 font-medium">No active queue token found for {currentFarmer.name}.</p>
          <p className="text-xs text-earth-400 mt-1">Book a smart slot in the Farmer portal to generate an AI-sequenced token.</p>
        </Card>
      </div>
    );
  }

  // Calculate position from live queue data
  const centreTokens = queueTokens.filter((t) =>
    t.centreId === myToken.centreId &&
    t.stage !== 'Procured' && t.stage !== 'Payment'
  );
  const tokensAhead = Math.max(0, centreTokens.indexOf(myToken));

  // Use the strengthened deterministic AI queue prediction
  const queuePred = computeQueuePrediction(
    centre?.id || 'centre-1',
    tokensAhead + 1,
    currentBooking?.crop || 'Tomato',
    currentBooking?.quantityKg || 500
  );

  // Find the token currently being processed
  const currentProcessingToken = centreTokens[0];
  const currentTokenNumber = currentProcessingToken?.tokenNumber || 'AGRI-001';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live AI Queue Tracker"
        subtitle="Dynamic throughput pacing & queue scheduling engine"
        icon={<ListOrdered className="w-5 h-5 text-agri-600" />}
      />

      {/* Visualizer Step */}
      <AIPipelineVisualizer activeStepId="queue" />

      {/* Token Card */}
      <Card className="p-6 bg-gradient-to-br from-agri-700 via-agri-800 to-earth-900 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:border-r sm:border-white/20 sm:pr-8">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Ticket className="w-5 h-5 text-agri-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-agri-200">Active Token</span>
            </div>
            <p className="text-5xl font-black font-mono tracking-wider text-white">{myToken.tokenNumber}</p>
            <span className="inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-agri-600/60 font-semibold border border-agri-400/40">
              Stage: {myToken.stage}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left w-full">
            <div className="bg-white/10 rounded-lg p-2.5">
              <p className="text-[11px] uppercase tracking-wide text-agri-200 mb-0.5">Procurement Centre</p>
              <p className="font-bold text-white text-sm truncate">{centre?.name || 'Siruvani Centre'}</p>
              <p className="text-[10px] text-agri-300">{centre?.location || 'Siruvani Main Rd'}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5">
              <p className="text-[11px] uppercase tracking-wide text-agri-200 mb-0.5">At Weighbridge</p>
              <p className="font-bold text-white text-sm font-mono">{currentTokenNumber}</p>
              <p className="text-[10px] text-agri-300">Currently unleading</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5">
              <p className="text-[11px] uppercase tracking-wide text-agri-200 mb-0.5">Queue Position</p>
              <p className="font-bold text-white text-sm">{tokensAhead === 0 ? 'You are Next!' : `${tokensAhead} trucks ahead`}</p>
              <p className="text-[10px] text-agri-300">Token slot #{tokensAhead + 1}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5">
              <p className="text-[11px] uppercase tracking-wide text-agri-200 mb-0.5">AI Est. Wait</p>
              <p className="font-bold text-white text-sm font-mono text-agri-100">~{queuePred.estimatedWaitMinutes} mins</p>
              <p className="text-[10px] text-agri-300">{queuePred.predictedCompletionWindow}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Queue AI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-earth-500 font-medium">Vehicles Ahead</p>
              <p className="text-xl font-bold text-earth-900 font-mono">{tokensAhead}</p>
              <p className="text-[11px] text-earth-400">Position in lane</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-earth-500 font-medium">Predicted Wait</p>
              <p className="text-xl font-bold text-amber-700 font-mono">{queuePred.estimatedWaitMinutes} min</p>
              <p className="text-[11px] text-earth-400">Dynamic model</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-agri-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-earth-500 font-medium">Processing Rate</p>
              <p className="text-xl font-bold text-agri-700 font-mono">{queuePred.processingRatePerHour} / hr</p>
              <p className="text-[11px] text-earth-400">Weighbridge speed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-earth-500 font-medium">Intake Window</p>
              <p className="text-sm font-bold text-purple-900 font-mono">{queuePred.predictedCompletionWindow}</p>
              <p className="text-[11px] text-purple-600 font-semibold">{queuePred.recommendation}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Explainability Pipeline for Queue */}
      <AIExplainCard
        pipeline={queuePred.pipeline}
        title="AI Queue Prediction Model"
        actionableImpact="Dynamic queue pacing reduces idle truck idling emissions by 40%."
      />

      {/* Queue Timeline */}
      <Card className="p-6">
        <CardHeader
          title="Procurement Intake Journey"
          subtitle="Real-time physical and digital progression through the procurement centre"
          icon={<Activity className="w-5 h-5 text-agri-600" />}
        />
        <div className="p-5 pt-2">
          <QueueTracker currentStage={myToken.stage} />
        </div>

        <div className="mt-6 p-4 rounded-xl bg-agri-50/80 border border-agri-200">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-agri-600" />
            <p className="text-xs font-bold uppercase tracking-wider text-agri-900">AI Dispatch Notification</p>
          </div>
          <p className="text-sm text-earth-700">
            Token <strong>{myToken.tokenNumber}</strong> is sequenced for <strong>{centre?.name}</strong>.
            {tokensAhead > 0 ? ` There are ${tokensAhead} lots ahead of you. ` : ' Your turn has arrived. '}
            AI throughput forecast indicates intake will complete during <strong>{queuePred.predictedCompletionWindow}</strong> at an intake velocity of <strong>{queuePred.processingRatePerHour} loads/hour</strong>.
          </p>
        </div>
      </Card>
    </div>
  );
}

