import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  predictDemandDetailed,
  computeDetailedPriceRecommendation,
  computeSurplusDetailed,
  cropPrices,
} from '@/utils/aiSimulation';
import { predictDemandML } from '@/services/ml';
import type { CropType, QualityGrade, DemandLevel, SurplusRisk, Crop } from '@/types';
import {
  Wheat, Plus, MapPin, Calendar, IndianRupee, TrendingUp, AlertTriangle,
  Trash2, Pencil, Sprout, ArrowRight, Sparkles, Brain,
} from 'lucide-react';

const cropOptions: CropType[] = ['Tomato', 'Potato', 'Onion', 'Rice', 'Maize', 'Chilli', 'Wheat', 'Cotton', 'Sugarcane', 'Groundnut'];

function computeCropAI(
  name: CropType,
  quality: QualityGrade,
  quantityKg: number,
  produceListings: { crop: CropType; quantityKg: number; status: string }[] = [],
  buyers: { requiredCrop: CropType; requiredQtyKg: number }[] = []
) {
  const safeListings = Array.isArray(produceListings) ? produceListings : [];
  const safeBuyers = Array.isArray(buyers) ? buyers : [];
  const safeQuantity = typeof quantityKg === 'number' && !isNaN(quantityKg) ? quantityKg : 0;
  const safeQuality = (['A', 'B', 'C'].includes(quality) ? quality : 'A') as QualityGrade;

  const totalSupply = safeQuantity + safeListings
    .filter((p) => p && p.crop === name && p.status === 'available')
    .reduce((s, p) => s + (p.quantityKg || 0), 0);
  const totalBuyerDemand = safeBuyers
    .filter((b) => b && b.requiredCrop === name)
    .reduce((s, b) => s + (b.requiredQtyKg || 0), 0);

  // Supervised Machine Learning Demand Model
  const mlForecast = predictDemandML({
    crop: name,
    marketRegion: 'Alandurai Centre',
    modalPrice: cropPrices[name] || 30,
    marketArrivalsKg: totalSupply,
    historicalDemandKg: Math.max(3000, totalBuyerDemand),
  });

  const effectiveDemand = Math.max(totalBuyerDemand, mlForecast.predictedDemandKg);
  const demandForecast = predictDemandDetailed(name, totalSupply, effectiveDemand);
  const priceRec = computeDetailedPriceRecommendation(name, safeQuality, totalSupply, effectiveDemand);
  const surplusAnalysis = computeSurplusDetailed(name, totalSupply, effectiveDemand);

  return {
    demandLevel: demandForecast.level as DemandLevel,
    predictedPriceMin: priceRec.recommendedMin,
    predictedPriceMax: priceRec.recommendedMax,
    surplusRisk: surplusAnalysis.risk as SurplusRisk,
    mlPredictedDemandKg: mlForecast.predictedDemandKg,
    totalSupplyKg: totalSupply,
  };
}

const emptyForm = {
  name: 'Tomato' as CropType,
  quantityKg: 500,
  harvestDate: '2026-09-15',
  location: 'Karunya Nagar',
  quality: 'A' as QualityGrade,
};

export function FarmerCrops() {
  const navigate = useNavigate();
  const { crops, addCrop, updateCrop, removeCrop, currentFarmer, produceListings, buyers } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingCropId, setEditingCropId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const isEditing = editingCropId !== null;
  const safeCrops = Array.isArray(crops) ? crops : [];

  const openAdd = () => {
    setForm({ ...emptyForm, location: currentFarmer.village });
    setEditingCropId(null);
    setShowAdd(true);
  };

  const openEdit = (crop: Crop) => {
    setForm({
      name: crop.name,
      quantityKg: crop.quantityKg,
      harvestDate: crop.harvestDate,
      location: crop.location,
      quality: crop.quality,
    });
    setEditingCropId(crop.id);
    setShowAdd(true);
  };

  const handleSubmit = () => {
    const ai = computeCropAI(form.name, form.quality, form.quantityKg, produceListings, buyers);
    const status = form.harvestDate <= '2026-09-05' ? 'ready' as const : 'growing' as const;

    if (isEditing && editingCropId) {
      updateCrop(editingCropId, {
        name: form.name,
        quantityKg: form.quantityKg,
        harvestDate: form.harvestDate,
        location: form.location,
        quality: form.quality,
        demandLevel: ai.demandLevel,
        predictedPriceMin: ai.predictedPriceMin,
        predictedPriceMax: ai.predictedPriceMax,
        surplusRisk: ai.surplusRisk,
        status,
      });
    } else {
      addCrop({
        farmerId: currentFarmer.id,
        name: form.name,
        quantityKg: form.quantityKg,
        harvestDate: form.harvestDate,
        location: form.location,
        quality: form.quality,
        demandLevel: ai.demandLevel,
        predictedPriceMin: ai.predictedPriceMin,
        predictedPriceMax: ai.predictedPriceMax,
        surplusRisk: ai.surplusRisk,
        status,
      });
    }
    setShowAdd(false);
    setEditingCropId(null);
    setForm({ ...emptyForm });
  };

  const demandColor = (level: DemandLevel) => {
    switch (level) {
      case 'LOW': return 'neutral';
      case 'MODERATE': return 'info';
      case 'HIGH': return 'warning';
      case 'VERY HIGH': return 'danger';
    }
  };

  const surplusColor = (risk: SurplusRisk) => {
    switch (risk) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'danger';
    }
  };

  return (
    <div>
      <PageHeader
        title="My Crops"
        subtitle="Manage your crop inventory with AI-forecasted price ranges and market demand guidance"
        icon={<Wheat className="w-5 h-5" />}
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Crop
          </button>
        }
      />

      {safeCrops.length === 0 ? (
        <Card className="p-12 text-center">
          <Sprout className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">No crops yet. Click "Add Crop" to get started.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {safeCrops.map((crop) => (
            <Card key={crop.id} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-earth-900">{crop.name}</p>
                      <p className="text-xs text-earth-500">Grade {crop.quality}</p>
                    </div>
                  </div>
                  <StatusBadge status={crop.status} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-earth-500 flex items-center gap-1.5"><Wheat className="w-3.5 h-3.5" /> Quantity</span>
                    <span className="font-semibold text-earth-900">{crop.quantityKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-earth-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Harvest</span>
                    <span className="font-semibold text-earth-900">{crop.harvestDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-earth-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</span>
                    <span className="font-semibold text-earth-900">{crop.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-agri-50/60 p-2 rounded-lg border border-agri-100">
                    <span className="text-earth-600 text-xs flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-agri-600" /> AI Target Price</span>
                    <span className="font-bold text-agri-800 text-xs">₹{crop.predictedPriceMin}–₹{crop.predictedPriceMax}/kg</span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-earth-50/80 p-2 rounded-lg border border-earth-200">
                    <span className="text-earth-600 flex items-center gap-1"><Brain className="w-3.5 h-3.5 text-agri-700" /> ML Demand</span>
                    <span className="font-semibold text-earth-900 font-mono">
                      {(crop as any).mlPredictedDemandKg ? `${(crop as any).mlPredictedDemandKg.toLocaleString('en-IN')} kg` : 'Calculating...'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-earth-100">
                  <Badge variant={demandColor(crop.demandLevel) as any}>
                    <TrendingUp className="w-3 h-3" />
                    {crop.demandLevel}
                  </Badge>
                  <Badge variant={surplusColor(crop.surplusRisk) as any}>
                    <AlertTriangle className="w-3 h-3" />
                    {crop.surplusRisk} RISK
                  </Badge>
                  <button
                    onClick={() => openEdit(crop)}
                    className="ml-auto p-1.5 rounded-lg text-earth-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Crop"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeCrop(crop.id)}
                    className="p-1.5 rounded-lg text-earth-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Crop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action connection */}
              <button
                type="button"
                onClick={() => navigate('/farmer/book-slot')}
                className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-earth-100 hover:bg-agri-50 text-earth-800 hover:text-agri-800 font-semibold text-xs transition-colors"
              >
                <span>Book Slot</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Crop Modal */}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditingCropId(null); }} title={isEditing ? 'Edit Crop' : 'Add New Crop'} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Crop Name</label>
            <select
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value as CropType })}
            >
              {cropOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity (kg)</label>
              <input type="number" className="input" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: +e.target.value })} />
            </div>
            <div>
              <label className="label">Harvest Date</label>
              <input type="date" className="input" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input type="text" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Expected Quality</label>
              <select className="input" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value as QualityGrade })}>
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Below Standard)</option>
              </select>
            </div>
          </div>
          <div className="bg-agri-50 rounded-xl p-3 border border-agri-200">
            <p className="text-xs text-agri-700 font-medium mb-1">AI Preview</p>
            {(() => {
              const ai = computeCropAI(form.name, form.quality, form.quantityKg, produceListings, buyers);
              return (
                <p className="text-sm text-earth-600">
                  Demand: <strong>{ai.demandLevel}</strong> · Price: <strong>₹{ai.predictedPriceMin}–₹{ai.predictedPriceMax}/kg</strong> · Surplus Risk: <strong>{ai.surplusRisk}</strong>
                </p>
              );
            })()}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowAdd(false); setEditingCropId(null); }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">{isEditing ? 'Save Changes' : 'Add Crop'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
