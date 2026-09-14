import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  Package, Plus, IndianRupee, MapPin, Heart, Wheat, TrendingUp,
  Trash2, Pencil,
} from 'lucide-react';
import type { CropType, ProduceListing, QualityGrade } from '@/types';

const cropOptions: CropType[] = ['Tomato', 'Potato', 'Onion', 'Rice', 'Maize', 'Chilli', 'Wheat', 'Cotton', 'Sugarcane', 'Groundnut'];

const emptyForm = {
  crop: 'Tomato' as CropType,
  quantityKg: 500,
  pricePerKg: 30,
  quality: 'A' as QualityGrade,
  location: 'Karunya Nagar',
  availableInDays: 0,
};

export function FarmerProduce() {
  const { produceListings, currentFarmer, addProduce, updateProduce, removeProduce } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<ProduceListing | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const myProduce = produceListings.filter((p) => p.farmerId === currentFarmer.id);
  const isEditing = editingId !== null;

  const openAdd = () => {
    setForm({ ...emptyForm, location: currentFarmer.village });
    setEditingId(null);
    setShowAdd(true);
  };

  const openEdit = (item: ProduceListing) => {
    setForm({
      crop: item.crop,
      quantityKg: item.quantityKg,
      pricePerKg: item.pricePerKg,
      quality: item.quality,
      location: item.location,
      availableInDays: item.availableInDays,
    });
    setEditingId(item.id);
    setSelected(null);
    setShowAdd(true);
  };

  const handleSubmit = () => {
    if (isEditing && editingId) {
      updateProduce(editingId, {
        crop: form.crop,
        quantityKg: form.quantityKg,
        pricePerKg: form.pricePerKg,
        quality: form.quality,
        location: form.location,
        availableInDays: form.availableInDays,
      });
    } else {
      addProduce({
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        crop: form.crop,
        quantityKg: form.quantityKg,
        pricePerKg: form.pricePerKg,
        quality: form.quality,
        location: form.location,
        distanceKm: 0,
        availableInDays: form.availableInDays,
        buyerInterest: Math.round(30 + (form.quantityKg / 20)),
        status: 'available',
      });
    }
    setShowAdd(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  return (
    <div>
      <PageHeader
        title="My Produce"
        subtitle="Manage your available produce listings — changes appear in the buyer marketplace instantly"
        icon={<Package className="w-5 h-5" />}
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Produce</button>}
      />

      {myProduce.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">No produce listings yet. Click "Add Produce" to create one.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {myProduce.map((item) => (
            <Card key={item.id} hover className="p-5" onClick={() => setSelected(item)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center">
                    <Wheat className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-earth-900">{item.crop}</p>
                    <p className="text-xs text-earth-500">Grade {item.quality}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-earth-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Quantity</span>
                  <span className="font-semibold text-earth-900">{item.quantityKg} kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-earth-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Price</span>
                  <span className="font-semibold text-earth-900">₹{item.pricePerKg}/kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-earth-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</span>
                  <span className="font-semibold text-earth-900">{item.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-earth-500 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Buyer Interest</span>
                  <span className="font-semibold text-earth-900">{item.buyerInterest}%</span>
                </div>
              </div>

              {item.availableInDays > 0 && (
                <div className="mt-3 pt-3 border-t border-earth-100">
                  <Badge variant="info">Available in {item.availableInDays} days</Badge>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-earth-100">
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                  className="p-1.5 rounded-lg text-earth-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeProduce(item.id); }}
                  className="p-1.5 rounded-lg text-earth-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Produce Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditingId(null); }} title={isEditing ? 'Edit Produce Listing' : 'Add Produce Listing'} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Crop</label>
            <select className="input" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value as CropType })}>
              {cropOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity (kg)</label>
              <input type="number" className="input" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: +e.target.value })} />
            </div>
            <div>
              <label className="label">Price (₹/kg)</label>
              <input type="number" className="input" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: +e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quality Grade</label>
              <select className="input" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value as QualityGrade })}>
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Below Standard)</option>
              </select>
            </div>
            <div>
              <label className="label">Available In (days)</label>
              <input type="number" className="input" value={form.availableInDays} onChange={(e) => setForm({ ...form, availableInDays: +e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input type="text" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">{isEditing ? 'Save Changes' : 'Add Listing'}</button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!selected && !showAdd} onClose={() => setSelected(null)} title={selected?.crop || ''} subtitle="Produce Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Quantity</p><p className="font-semibold text-earth-900">{selected.quantityKg} kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Price</p><p className="font-semibold text-earth-900">₹{selected.pricePerKg}/kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Quality</p><p className="font-semibold text-earth-900">Grade {selected.quality}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Location</p><p className="font-semibold text-earth-900">{selected.location}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Distance</p><p className="font-semibold text-earth-900">{selected.distanceKm} km</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Buyer Interest</p><p className="font-semibold text-earth-900">{selected.buyerInterest}%</p></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-agri-50 border border-agri-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-agri-600" />
                <span className="text-sm font-medium text-agri-800">Total Value</span>
              </div>
              <span className="text-lg font-bold text-agri-700">₹{(selected.quantityKg * selected.pricePerKg).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(selected)} className="btn-secondary flex-1"><Pencil className="w-4 h-4" /> Edit</button>
              <button onClick={() => { removeProduce(selected.id); setSelected(null); }} className="btn-secondary flex-1 text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
