import { useState, useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { bppService } from '@/services/beckn/bppService';
import { AGRIFLOW_BPP_PROVIDER } from '@/services/beckn/becknMockData';
import type { BecknItem, BecknTimelineEntry, BppTransactionRecord } from '@/services/beckn/becknTypes';
import type { CropType } from '@/types';
import {
  Network, Search, MapPin, IndianRupee, Package, Wheat,
  ArrowRight, CheckCircle2, Play, Sparkles,
  AlertCircle, Shield, Truck,
} from 'lucide-react';

type DemoPhase = 'search' | 'select' | 'init' | 'confirm' | 'done';

const cropOptions: (CropType | 'All')[] = ['All', 'Tomato', 'Potato', 'Onion', 'Rice', 'Maize', 'Chilli', 'Wheat', 'Cotton', 'Sugarcane', 'Groundnut'];
const qualityOptions: ('A' | 'B' | 'C' | 'All')[] = ['All', 'A', 'B', 'C'];

export function BuyerBPPDiscovery() {
  const { produceListings, farmers, buyers, orders, placeOrder, addBppTransaction, showToast } = useApp();
  const buyer = buyers[0];

  const [crop, setCrop] = useState<CropType | 'All'>('All');
  const [quantityKg, setQuantityKg] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [maxDistance, setMaxDistance] = useState<number | ''>('');
  const [quality, setQuality] = useState<'A' | 'B' | 'C' | 'All'>('All');
  const [searched, setSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<BecknItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<BecknItem | null>(null);
  const [phase, setPhase] = useState<DemoPhase>('search');
  const [initTxnId, setInitTxnId] = useState('');
  const [error, setError] = useState('');
  const [timeline, setTimeline] = useState<BecknTimelineEntry[]>([]);

  const catalog = useMemo(
    () => bppService.buildCatalog(produceListings, farmers, [], []),
    [produceListings, farmers],
  );

  const handleSearch = () => {
    setError('');
    const req = {
      action: 'search' as const,
      crop,
      quantityKg: quantityKg || undefined,
      location: location || undefined,
      maxPricePerKg: maxPrice || undefined,
      maxDistanceKm: maxDistance || undefined,
      quality,
    };
    const result = bppService.search(req, produceListings, farmers);
    setSearchResults(result.items);
    setSearched(true);
    setTimeline([
      bppService.timelineEntry('search', 'Search', `Buyer searched for ${crop === 'All' ? 'all crops' : crop} via BPP discovery`, req as Record<string, unknown>, { provider: result.response.provider, itemsFound: result.response.itemsFound } as Record<string, unknown>),
    ]);
    showToast(`${result.response.itemsFound} results discovered through AgriFlow BPP`, 'success');
  };

  const handleSelect = (item: BecknItem) => {
    setError('');
    const produce = produceListings.find((p) => p.id === item.id);
    if (!produce || produce.status !== 'available') {
      setError('This item is no longer available. Please select another listing.');
      return;
    }
    const selectReq = { action: 'select' as const, itemId: item.id, quantityKg: item.quantityKg };
    const selectResult = bppService.select(selectReq, produceListings, farmers, buyers);
    setSelectedItem(item);
    setPhase('select');
    setTimeline((prev) => [
      ...prev,
      bppService.timelineEntry('select', 'Select', `Buyer selected ${item.crop} from ${item.providerName}`, selectReq as Record<string, unknown>, { item: selectResult.item.description, aiMatchScore: selectResult.aiMatchScore } as Record<string, unknown>),
    ]);
  };

  const handleInit = () => {
    if (!selectedItem) return;
    setError('');
    const produce = produceListings.find((p) => p.id === selectedItem.id);
    if (!produce || produce.status !== 'available') {
      setError('This produce is no longer available. Cannot proceed.');
      return;
    }
    const initReq = {
      action: 'init' as const,
      itemId: selectedItem.id,
      quantityKg: selectedItem.quantityKg,
      buyerId: buyer.id,
      buyerName: buyer.name,
    };
    const initResult = bppService.init(initReq, produceListings, farmers);
    setInitTxnId(initResult.transactionId);
    setPhase('init');
    setTimeline((prev) => [
      ...prev,
      bppService.timelineEntry('init', 'Init', `Transaction initialized: ${initResult.transactionId}`, initReq as Record<string, unknown>, { transactionId: initResult.transactionId, orderStatus: initResult.order.status } as Record<string, unknown>),
    ]);
    showToast('BPP transaction initialized', 'info');
  };

  const handleConfirm = () => {
    if (!selectedItem || !initTxnId) return;
    setError('');
    const produce = produceListings.find((p) => p.id === selectedItem.id);
    if (!produce || produce.status !== 'available') {
      setError('This produce has been reserved by another buyer. Transaction cancelled.');
      setPhase('search');
      setSelectedItem(null);
      return;
    }

    const pendingOrders = new Map();
    const initReq = {
      action: 'init' as const,
      itemId: selectedItem.id,
      quantityKg: selectedItem.quantityKg,
      buyerId: buyer.id,
      buyerName: buyer.name,
    };
    const initResult = bppService.init(initReq, produceListings, farmers);
    pendingOrders.set(initResult.transactionId, initResult.order);

    const confirmReq = { action: 'confirm' as const, transactionId: initResult.transactionId };
    const confirmResult = bppService.confirm(confirmReq, pendingOrders);

    placeOrder({
      buyerId: buyer.id,
      buyerName: buyer.name,
      farmerId: produce.farmerId,
      farmerName: produce.farmerName,
      crop: produce.crop,
      quantityKg: selectedItem.quantityKg,
      pricePerKg: produce.pricePerKg,
      totalAmount: selectedItem.quantityKg * produce.pricePerKg,
      deliveryDate: '2026-09-07',
    });

    // Find the newly placed order to link the BPP transaction to the real AgriFlow order
    const newOrder = orders[0];
    const agriflowOrderId = newOrder?.id || confirmResult.agriflowOrderId;
    const orderNumber = newOrder?.orderNumber || 'ORD-2026-BPP';

    const confirmEntry = bppService.timelineEntry('confirm', 'Confirm', `Order confirmed and placed in AgriFlow via placeOrder() — ${orderNumber}`, confirmReq as Record<string, unknown>, { becknOrderId: confirmResult.order.id, agriflowOrderId, orderNumber, status: 'confirmed' } as Record<string, unknown>);
    const statusEntry = bppService.timelineEntry('status', 'Status', 'Order status queried — mapped to Beckn status', { action: 'status', transactionId: initResult.transactionId } as Record<string, unknown>, { becknStatus: 'confirmed', agriflowStatus: 'Placed' } as Record<string, unknown>);
    const trackEntry = bppService.timelineEntry('track', 'Track', 'Fulfillment tracking enabled', { action: 'track', transactionId: initResult.transactionId } as Record<string, unknown>, { fulfillmentStatus: 'pickup-scheduled', eta: initResult.order.fulfillment.eta } as Record<string, unknown>);

    const newTimeline = [...timeline, confirmEntry, statusEntry, trackEntry];
    setTimeline(newTimeline);

    const record: BppTransactionRecord = bppService.buildTransactionRecord(
      initResult.transactionId,
      confirmResult.order,
      agriflowOrderId,
      orderNumber,
      buyer.id,
      buyer.name,
      'pickup-scheduled',
      newTimeline,
    );
    addBppTransaction(record);

    setPhase('done');
    showToast('BPP transaction confirmed — order placed in AgriFlow!', 'success');
  };

  const reset = () => {
    setPhase('search');
    setSelectedItem(null);
    setInitTxnId('');
    setError('');
    setTimeline([]);
    setSearched(false);
    setSearchResults([]);
  };

  return (
    <div>
      <PageHeader
        title="Discover through BPP"
        subtitle="Beckn-compatible discovery of AgriFlow marketplace offerings (Demo / Sandbox)"
        icon={<Network className="w-5 h-5" />}
      />

      {/* Sandbox Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
        <Network className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          <strong>Beckn BPP Discovery (Sandbox)</strong> — Searches the real AgriFlow marketplace through a simulated Beckn protocol layer. Orders are placed via the existing AgriFlow system.
        </p>
      </div>

      {/* Provider Info Bar */}
      <Card className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-white border-blue-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><Network className="w-4 h-4" /></div>
            <div>
              <p className="text-sm font-semibold text-earth-900">{AGRIFLOW_BPP_PROVIDER.name} BPP</p>
              <p className="text-[10px] text-earth-500 font-mono">{AGRIFLOW_BPP_PROVIDER.id}</p>
            </div>
          </div>
          <Badge variant="success">CONNECTED — SIMULATED</Badge>
          <Badge variant="info">{catalog.itemCount} items in catalog</Badge>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-earth-500">
            <Shield className="w-3.5 h-3.5" /> Marketplace data only — no private farmer details exposed
          </div>
        </div>
      </Card>

      {/* Search Panel */}
      {phase === 'search' && (
        <Card className="mb-6 p-5">
          <CardHeader
            title="BPP Search"
            subtitle="Search for agricultural produce through the Beckn discovery layer"
            icon={<Search className="w-5 h-5" />}
          />
          <div className="p-5 pt-3 space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-earth-500 mb-1.5 block">Crop</label>
                <select className="input" value={crop} onChange={(e) => setCrop(e.target.value as CropType | 'All')}>
                  {cropOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-earth-500 mb-1.5 block">Min Quantity (kg)</label>
                <input type="number" className="input" placeholder="e.g. 500" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div>
                <label className="text-xs font-semibold text-earth-500 mb-1.5 block">Location</label>
                <input type="text" className="input" placeholder="e.g. Coimbatore" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-earth-500 mb-1.5 block">Max Price/kg (₹)</label>
                <input type="number" className="input" placeholder="e.g. 40" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div>
                <label className="text-xs font-semibold text-earth-500 mb-1.5 block">Max Distance (km)</label>
                <input type="number" className="input" placeholder="e.g. 20" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div>
                <label className="text-xs font-semibold text-earth-500 mb-1.5 block">Quality Grade</label>
                <select className="input" value={quality} onChange={(e) => setQuality(e.target.value as 'A' | 'B' | 'C' | 'All')}>
                  {qualityOptions.map((q) => <option key={q} value={q}>Grade {q}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleSearch} className="btn-primary">
              <Search className="w-4 h-4" /> Search via BPP
            </button>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searched && phase === 'search' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm font-semibold text-earth-700">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} discovered through AgriFlow BPP
            </p>
          </div>
          {searchResults.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-10 h-10 mx-auto text-earth-300 mb-3" />
              <p className="text-earth-500">No matching produce found. Try adjusting your search criteria.</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((item) => (
                <Card key={item.id} hover className="p-5" onClick={() => handleSelect(item)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Wheat className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-earth-900">{item.crop}</p>
                        <p className="text-xs text-earth-500">{item.quality}</p>
                      </div>
                    </div>
                    <Badge variant="info">BPP</Badge>
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
                      <span className="font-semibold text-earth-900">{item.location.address}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-earth-500 flex items-center gap-1.5"><Wheat className="w-3.5 h-3.5" /> Provider</span>
                      <span className="font-medium text-earth-700 truncate ml-2">{item.providerName}</span>
                    </div>
                    {item.aiMatchScore !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-earth-500 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Match</span>
                        <span className="font-semibold text-agri-600">{item.aiMatchScore}%</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-earth-100">
                    <button className="btn-secondary w-full text-sm">
                      Select <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Select / Init / Confirm Modal */}
      {selectedItem && phase !== 'search' && phase !== 'done' && (
        <Modal open={!!selectedItem} onClose={reset} title={`${selectedItem.crop} — BPP Transaction`} subtitle="Beckn Protocol Exchange" size="lg">
          <div className="space-y-4">
            {/* Phase indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['search', 'select', 'init', 'confirm'] as DemoPhase[]).map((p, i) => {
                const currentIdx = (['search', 'select', 'init', 'confirm'] as DemoPhase[]).indexOf(phase);
                return (
                  <div key={p} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                      i <= currentIdx ? 'bg-blue-600 text-white' : 'bg-earth-100 text-earth-400'
                    }`}>
                      {p === 'search' && <Search className="w-3 h-3" />}
                      {p === 'select' && <Package className="w-3 h-3" />}
                      {p === 'init' && <Play className="w-3 h-3" />}
                      {p === 'confirm' && <CheckCircle2 className="w-3 h-3" />}
                      {p.toUpperCase()}
                    </div>
                    {i < 3 && <ArrowRight className="w-3 h-3 text-earth-300" />}
                  </div>
                );
              })}
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Item ID</p><p className="text-sm font-mono font-semibold text-earth-900">{selectedItem.id}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Provider</p><p className="text-sm font-semibold text-earth-900">{selectedItem.providerName}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Quantity</p><p className="text-sm font-semibold text-earth-900">{selectedItem.quantityKg} kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Price</p><p className="text-sm font-semibold text-earth-900">₹{selectedItem.pricePerKg}/kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Quality</p><p className="text-sm font-semibold text-earth-900">{selectedItem.quality}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Location</p><p className="text-sm font-semibold text-earth-900">{selectedItem.location.address}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Availability</p><StatusBadge status={selectedItem.availability} /></div>
              {selectedItem.aiMatchScore !== undefined && (
                <div className="bg-agri-50 rounded-xl p-3"><p className="text-xs text-agri-600">AI Match Score</p><p className="text-sm font-bold text-agri-700">{selectedItem.aiMatchScore}%</p></div>
              )}
            </div>

            {/* Init info */}
            {phase === 'init' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-800">Transaction Initialized</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-earth-500">Transaction ID:</span> <span className="font-mono font-semibold text-earth-900">{initTxnId}</span></div>
                  <div><span className="text-earth-500">Provider:</span> <span className="font-semibold text-earth-900">{AGRIFLOW_BPP_PROVIDER.name}</span></div>
                  <div><span className="text-earth-500">Buyer:</span> <span className="font-semibold text-earth-900">{buyer.name}</span></div>
                  <div><span className="text-earth-500">Total:</span> <span className="font-semibold text-earth-900">₹{(selectedItem.quantityKg * selectedItem.pricePerKg).toLocaleString('en-IN')}</span></div>
                  <div><span className="text-earth-500">Fulfillment:</span> <span className="font-semibold text-earth-900 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery via AgriFlow</span></div>
                  <div><span className="text-earth-500">Payment:</span> <span className="font-semibold text-earth-900">Pending</span></div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-earth-500">Simulated Beckn Protocol Exchange</p>
                {timeline.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 bg-earth-50 rounded-lg p-2.5">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      {entry.action === 'search' ? <Search className="w-3 h-3" /> : entry.action === 'select' ? <Package className="w-3 h-3" /> : entry.action === 'init' ? <Play className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-earth-900">{entry.label}</p>
                      <p className="text-[10px] text-earth-500">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={reset} className="btn-secondary flex-1">Cancel</button>
              {phase === 'select' && (
                <button onClick={handleInit} className="btn-primary flex-1">
                  Initialize Transaction <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {phase === 'init' && (
                <button onClick={handleConfirm} className="btn-primary flex-1">
                  Confirm & Place Order <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Done state */}
      {phase === 'done' && selectedItem && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-bold text-earth-900">BPP Transaction Confirmed</p>
              <p className="text-sm text-earth-500">Order placed in AgriFlow via existing placeOrder() workflow</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Transaction ID</p><p className="text-sm font-mono font-semibold text-earth-900">{initTxnId}</p></div>
            <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Item</p><p className="text-sm font-semibold text-earth-900">{selectedItem.crop} — {selectedItem.quantityKg} kg</p></div>
            <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Total Amount</p><p className="text-sm font-semibold text-earth-900">₹{(selectedItem.quantityKg * selectedItem.pricePerKg).toLocaleString('en-IN')}</p></div>
            <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Provider</p><p className="text-sm font-semibold text-earth-900">{selectedItem.providerName}</p></div>
            <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Buyer</p><p className="text-sm font-semibold text-earth-900">{buyer.name}</p></div>
            <div className="bg-green-50 rounded-xl p-3"><p className="text-xs text-green-600">AgriFlow Order</p><p className="text-sm font-semibold text-green-700">Created & Linked</p></div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-800">Fulfillment created — check Buyer Orders and Deliveries for tracking.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="btn-secondary">New BPP Search</button>
          </div>
        </Card>
      )}
    </div>
  );
}
