import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AIExplainCard } from '@/components/ui/AIExplainCard';
import { useApp } from '@/context/AppContext';
import {
  computeProcurementCentreRecommendation,
  computeQueuePrediction,
} from '@/utils/aiSimulation';
import type { CropType, Crop } from '@/types';
import {
  CalendarClock, Sparkles, Wheat, MapPin, Calendar, CheckCircle,
  ArrowRight, ArrowLeft, Clock, IndianRupee, Lightbulb, ShieldCheck,
} from 'lucide-react';

const timeSlots = [
  { time: '9:00 AM – 9:30 AM', congestion: 35, available: true },
  { time: '10:00 AM – 10:30 AM', congestion: 82, available: false },
  { time: '11:00 AM – 11:30 AM', congestion: 61, available: true },
  { time: '12:00 PM – 12:30 PM', congestion: 37, available: true },
  { time: '1:00 PM – 1:30 PM', congestion: 24, available: true },
  { time: '2:00 PM – 2:30 PM', congestion: 18, available: true },
  { time: '3:00 PM – 3:30 PM', congestion: 28, available: true },
  { time: '4:00 PM – 4:30 PM', congestion: 12, available: true },
];

export function FarmerBookSlot() {
  const { crops, centres, currentFarmer, bookSlot } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState<string | null>(null);

  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(crops[0] || null);
  const [quantity, setQuantity] = useState(800);
  const [selectedCentreId, setSelectedCentreId] = useState('C02');
  const [selectedDate, setSelectedDate] = useState('2026-09-03');
  const [selectedSlot, setSelectedSlot] = useState('2:00 PM – 2:30 PM');

  // AI Recommendation for Procurement Centre
  const centreRec = useMemo(() => {
    return computeProcurementCentreRecommendation(
      currentFarmer?.village || 'Karunya Nagar',
      centres.map((c) => ({
        id: c.id,
        name: c.name,
        location: c.location || c.name.split('—')[1]?.trim() || c.district,
        capacityPct: c.capacityPct,
        queueCount: c.queueCount,
        estimatedWaitMin: c.estimatedWaitMin,
      }))
    );
  }, [currentFarmer, centres]);

  const selectedCentre = centres.find((c) => c.id === selectedCentreId) || centres[0];
  const recommendedSlot = timeSlots.reduce((min, s) => (s.congestion < min.congestion && s.available ? s : min), timeSlots[0]);

  // Queue prediction for the selected centre
  const queuePred = useMemo(() => {
    return computeQueuePrediction(selectedCentreId, selectedCentre?.queueCount || 5, 8);
  }, [selectedCentreId, selectedCentre]);

  const handleConfirm = () => {
    const tokenNum = `${selectedCentreId[1]}${String(Math.floor(Math.random() * 900) + 47).padStart(3, '0')}`;
    const booking = bookSlot({
      tokenNumber: tokenNum,
      centreId: selectedCentreId,
      centreName: selectedCentre.name,
      farmerId: currentFarmer.id,
      farmerName: currentFarmer.name,
      crop: selectedCrop!.name,
      quantityKg: quantity,
      date: selectedDate,
      slotTime: selectedSlot,
      estimatedWaitMin: queuePred.estimatedWaitMinutes,
      aiReasoning: centreRec.rationale,
    });
    setConfirmedToken(booking.tokenNumber);
    setShowConfirm(false);
    setStep(1);
  };

  const steps = ['Crop', 'Quantity', 'Centre', 'Date & Slot', 'Confirm'];

  return (
    <div>
      <PageHeader
        title="Book Smart Slot"
        subtitle="AI load-balanced procurement slot booking with queue wait estimation"
        icon={<CalendarClock className="w-5 h-5 text-agri-600" />}
      />

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              step === i + 1 ? 'bg-agri-600 text-white' :
              step > i + 1 ? 'bg-agri-50 text-agri-700' : 'bg-earth-100 text-earth-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                step === i + 1 ? 'bg-white/20' : step > i + 1 ? 'bg-agri-600 text-white' : 'bg-earth-200'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </span>
              {s}
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-earth-300 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {confirmedToken && (
        <Card className="mb-6 p-6 border-2 border-agri-500 bg-gradient-to-br from-agri-50/50 to-white animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-agri-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="text-xl font-bold text-earth-900 font-display">Smart Slot Confirmed!</h3>
                <Badge variant="agri"><Sparkles className="w-3 h-3" /> AI Optimized</Badge>
              </div>
              <p className="text-earth-600 mt-1 text-sm">
                Your queue token has been generated. Real-time token updates are active in your queue dashboard.
              </p>
              <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start bg-white p-3 rounded-xl border border-earth-200">
                <div><p className="text-xs text-earth-500">Token ID</p><p className="text-lg font-bold text-agri-700 font-mono">{confirmedToken}</p></div>
                <div><p className="text-xs text-earth-500">Centre</p><p className="font-semibold text-sm text-earth-900">{selectedCentre?.name}</p></div>
                <div><p className="text-xs text-earth-500">Slot</p><p className="font-semibold text-sm text-earth-900">{selectedSlot}</p></div>
                <div><p className="text-xs text-earth-500">Est. Wait</p><p className="font-semibold text-sm text-earth-900">{queuePred.estimatedWaitMinutes} min</p></div>
                <div><p className="text-xs text-earth-500">Completion Window</p><p className="font-semibold text-sm text-agri-700">{queuePred.predictedCompletionWindow}</p></div>
              </div>
            </div>
            <button onClick={() => navigate('/farmer/queue')} className="btn-primary flex-shrink-0">
              Track Queue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Step Content */}
      <Card className="p-6">
        {step === 1 && (
          <div>
            <h3 className="font-semibold text-earth-900 mb-1">Step 1: Select Crop</h3>
            <p className="text-xs text-earth-500 mb-4">Choose which harvested crop you are delivering to the procurement centre</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => { setSelectedCrop(crop); setStep(2); }}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedCrop?.id === crop.id ? 'border-agri-500 bg-agri-50' : 'border-earth-200 hover:border-earth-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Wheat className="w-5 h-5 text-agri-600" />
                    <span className="font-semibold text-earth-900">{crop.name}</span>
                  </div>
                  <p className="text-sm text-earth-500">{crop.quantityKg} kg • Grade {crop.quality}</p>
                  <p className="text-xs text-earth-400 mt-1">Harvest: {crop.harvestDate}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-semibold text-earth-900 mb-1">Step 2: Delivery Quantity</h3>
            <p className="text-xs text-earth-500 mb-4">Specify the weight in kilograms for slot weighing and intake booking</p>
            <div className="max-w-md">
              <label className="label">Quantity (kg)</label>
              <input type="number" className="input" value={quantity} onChange={(e) => setQuantity(+e.target.value)} />
              <div className="flex gap-2 mt-3">
                {[200, 400, 600, 800].map((q) => (
                  <button key={q} onClick={() => setQuantity(q)} className="px-3 py-1.5 rounded-lg text-sm border border-earth-200 hover:bg-earth-50">
                    {q} kg
                  </button>
                ))}
              </div>
              <p className="text-sm text-earth-500 mt-4">
                Estimated value at target price: <strong className="text-earth-900 font-mono">₹{(quantity * ((selectedCrop?.predictedPriceMin || 30) + (selectedCrop?.predictedPriceMax || 36)) / 2).toLocaleString('en-IN')}</strong>
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setStep(3)} className="btn-primary">Continue <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-earth-900">Step 3: Select Procurement Centre</h3>
                <p className="text-xs text-earth-500">
                  AI dynamically ranks centres based on distance from {currentFarmer?.village || 'Karunya Nagar'}, live capacity, and queue wait times
                </p>
              </div>
              <Badge variant="agri"><Sparkles className="w-3 h-3" /> Dynamic Load Balancing</Badge>
            </div>

            {/* AI Recommendation Banner */}
            <div className="mb-4 p-4 rounded-xl bg-agri-50 border border-agri-200 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-agri-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-earth-900 text-sm">
                      AI Recommendation: {centres.find(c => c.id === centreRec.recommendedCentreId)?.name}
                    </h4>
                    <p className="text-xs text-agri-900 font-medium mt-0.5">
                      {centreRec.rationale}
                    </p>
                  </div>
                </div>
                <Badge variant="success">BEST CHOICE</Badge>
              </div>

              <AIExplainCard
                pipeline={centreRec.pipeline}
                title="Explain Centre Selection Logic"
              />
            </div>

            {/* Centre Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {centreRec.rankedCentres.map((ranked) => {
                const isRecommended = ranked.id === centreRec.recommendedCentreId;
                const isSelected = selectedCentreId === ranked.id;

                return (
                  <button
                    key={ranked.id}
                    type="button"
                    onClick={() => setSelectedCentreId(ranked.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all relative ${
                      isSelected
                        ? 'border-agri-500 bg-agri-50/50 shadow-sm'
                        : 'border-earth-200 hover:border-earth-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-bold text-earth-900 text-sm block">{ranked.name}</span>
                        <span className="text-xs text-earth-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-earth-400" />
                          {ranked.location} • {ranked.distanceKm} km away
                        </span>
                      </div>
                      {isRecommended ? (
                        <Badge variant="agri"><Sparkles className="w-3 h-3" /> Recommended</Badge>
                      ) : (
                        <span className="text-xs text-earth-400 font-medium">Alternative</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 my-1 text-xs border-y border-earth-100 bg-earth-50/60 rounded px-2">
                      <div>
                        <span className="text-earth-400 block text-[10px]">Capacity</span>
                        <span className={`font-semibold ${ranked.currentCapacityPct > 70 ? 'text-red-600' : 'text-green-600'}`}>
                          {ranked.currentCapacityPct}%
                        </span>
                      </div>
                      <div>
                        <span className="text-earth-400 block text-[10px]">Queue</span>
                        <span className="font-semibold text-earth-800">{ranked.queueCount} trucks</span>
                      </div>
                      <div>
                        <span className="text-earth-400 block text-[10px]">Est. Wait</span>
                        <span className="font-semibold text-earth-800">{ranked.estimatedWaitMin} min</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-earth-600 mt-2 font-medium">
                      {ranked.tradeOff}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setStep(4)} className="btn-primary">
                Confirm {selectedCentre?.name} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-semibold text-earth-900 mb-1">Step 4: Select Date & Time Slot</h3>
            <p className="text-xs text-earth-500 mb-4">
              AI predicts arrivals and congestion for {selectedCentre?.name} to minimize turnaround delay
            </p>
            <div className="mb-4">
              <label className="label">Date</label>
              <input type="date" className="input max-w-xs" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>

            {/* AI Recommendation Slot */}
            <AIInsightCard
              title="AI Recommended Slot: 2:00 PM – 2:30 PM"
              badge="Lowest Congestion Window"
              reasoning={`Historical intake patterns at ${selectedCentre?.name} show processing speed is highest post-noon, reducing truck idle time to under 15 minutes.`}
            >
              <div className="flex items-center gap-3 bg-white/70 rounded-xl p-3 border border-agri-200">
                <Clock className="w-5 h-5 text-agri-600" />
                <div className="flex-1">
                  <p className="font-semibold text-earth-900">{recommendedSlot.time}</p>
                  <p className="text-xs text-earth-500">Predicted congestion: {recommendedSlot.congestion}% • Estimated wait: {queuePred.estimatedWaitMinutes} mins</p>
                </div>
                <Badge variant="success">OPTIMAL</Badge>
              </div>
            </AIInsightCard>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`p-3 rounded-xl border-2 text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedSlot === slot.time ? 'border-agri-500 bg-agri-50' : 'border-earth-200 hover:border-earth-300'
                  }`}
                >
                  <p className="font-medium text-sm text-earth-900">{slot.time}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-12 h-1.5 rounded-full bg-earth-200 overflow-hidden">
                      <div className={`h-full rounded-full ${slot.congestion > 70 ? 'bg-red-500' : slot.congestion > 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${slot.congestion}%` }} />
                    </div>
                    <span className="text-[10px] text-earth-500">{slot.congestion}%</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setShowConfirm(true)} className="btn-primary">
                <CheckCircle className="w-4 h-4" /> Review & Confirm Booking
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Slot Booking" size="md">
        <div className="space-y-4">
          <div className="bg-earth-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-earth-500">Crop</span><span className="font-semibold text-earth-900">{selectedCrop?.name} (Grade {selectedCrop?.quality})</span></div>
            <div className="flex justify-between"><span className="text-earth-500">Quantity</span><span className="font-semibold text-earth-900">{quantity} kg</span></div>
            <div className="flex justify-between"><span className="text-earth-500">Centre</span><span className="font-semibold text-earth-900">{selectedCentre?.name}</span></div>
            <div className="flex justify-between"><span className="text-earth-500">Date</span><span className="font-semibold text-earth-900">{selectedDate}</span></div>
            <div className="flex justify-between"><span className="text-earth-500">Slot</span><span className="font-semibold text-earth-900">{selectedSlot}</span></div>
            <div className="flex justify-between border-t border-earth-200 pt-2"><span className="text-earth-500">Estimated Wait</span><span className="font-bold text-agri-700">{queuePred.estimatedWaitMinutes} min</span></div>
            <div className="flex justify-between"><span className="text-earth-500">Intake Window</span><span className="font-semibold text-earth-800">{queuePred.predictedCompletionWindow}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleConfirm} className="btn-primary flex-1">Confirm & Generate Token</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
