import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import { bppService } from '@/services/beckn/bppService';
import { AGRIFLOW_BPP_PROVIDER } from '@/services/beckn/becknMockData';
import { BECKN_FLOW_STEPS } from '@/services/beckn/becknTypes';
import type {
  BecknTimelineEntry,
  BecknItem,
  BecknOrder,
  BppTransactionRecord,
  BecknAction,
} from '@/services/beckn/becknTypes';

import {
  Network, Search, MousePointerClick, Play, CheckCircle2, Circle,
  Truck, Package, MapPin, ArrowRight,
  ArrowDown, Server, Layers, Sparkles, Code2, XCircle,
  Activity, Zap, Eye, Shield, IndianRupee,
  Wallet, TrendingUp,
} from 'lucide-react';

export function AdminBeckn() {
  const { produceListings, orders, deliveries, farmers, buyers, payments, placeOrder, updateOrderStatus, updateDeliveryStatus, bppTransactions, addBppTransaction, showToast } = useApp();
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [timeline, setTimeline] = useState<BecknTimelineEntry[]>([]);
  const [activeProtocol, setActiveProtocol] = useState<BecknTimelineEntry | null>(null);
  const [inspectorTxn, setInspectorTxn] = useState<BppTransactionRecord | null>(null);

  const catalog = useMemo(
    () => bppService.buildCatalog(produceListings, farmers, orders, deliveries),
    [produceListings, farmers, orders, deliveries],
  );

  const activeOrders = useMemo(() => orders.filter((o) => o.status !== 'Completed').length, [orders]);
  const activeFulfillments = useMemo(() => deliveries.filter((d) => d.status !== 'Delivered').length, [deliveries]);
  const confirmedTxns = useMemo(() => bppTransactions.length, [bppTransactions]);
  const completedTxns = useMemo(
    () => bppTransactions.filter((t) => t.becknStatus === 'completed').length,
    [bppTransactions],
  );
  const inFulfillmentTxns = useMemo(
    () => bppTransactions.filter((t) => ['confirmed', 'collection-scheduled'].includes(t.becknStatus)).length,
    [bppTransactions],
  );
  const inTransitTxns = useMemo(
    () => bppTransactions.filter((t) => t.becknStatus === 'in-transit').length,
    [bppTransactions],
  );
  const deliveredTxns = useMemo(
    () => bppTransactions.filter((t) => t.becknStatus === 'delivered').length,
    [bppTransactions],
  );
  const totalTxnValue = useMemo(
    () => bppTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
    [bppTransactions],
  );

  // Get payment info for BPP transactions
  const getPaymentForTxn = (txn: BppTransactionRecord) => {
    const order = orders.find((o) => o.id === txn.agriflowOrderId);
    if (!order) return null;
    return {
      amount: order.totalAmount,
      status: order.status === 'Completed' ? 'completed' : 'pending',
      farmerPayment: payments.find((p) => p.farmerId === txn.farmerId && p.crop === txn.crop),
    };
  };

  const runDemo = useCallback(async () => {
    setDemoRunning(true);
    setTimeline([]);
    setDemoStep(-1);
    setActiveProtocol(null);

    const tomatoProduce = produceListings.find((p) => p.crop === 'Tomato' && p.status === 'available');
    if (!tomatoProduce) {
      showToast('No available tomato listings found for demo. Add produce first.', 'warning');
      setDemoRunning(false);
      return;
    }

    const buyer = buyers.find((b) => b.name === 'ABC Foods') || buyers[0];
    const steps: BecknTimelineEntry[] = [];
    const pendingOrders = new Map<string, BecknOrder>();

    // SEARCH
    setDemoStep(0);
    await sleep(400);
    const searchReq = { action: 'search' as const, crop: 'Tomato' as const, quantityKg: 500, location: 'All' };
    const searchResult = bppService.search(searchReq, produceListings, farmers);
    const searchEntry = bppService.timelineEntry('search', 'Search', `Buyer ${buyer.name} searches for 500 kg Tomato via BPP discovery`, searchReq as Record<string, unknown>, { provider: searchResult.response.provider, itemsFound: searchResult.response.itemsFound } as Record<string, unknown>);
    steps.push(searchEntry);
    setTimeline([...steps]);
    setActiveProtocol(searchEntry);

    // SELECT
    setDemoStep(1);
    await sleep(400);
    const qty = Math.min(500, tomatoProduce.quantityKg);
    const selectReq = { action: 'select' as const, itemId: tomatoProduce.id, quantityKg: qty };
    const selectResult = bppService.select(selectReq, produceListings, farmers, buyers);
    const selectEntry = bppService.timelineEntry('select', 'Select', `Buyer selects ${tomatoProduce.crop} (${qty} kg) from ${tomatoProduce.farmerName}`, selectReq as Record<string, unknown>, { item: selectResult.item.description, aiMatchScore: selectResult.aiMatchScore } as Record<string, unknown>);
    steps.push(selectEntry);
    setTimeline([...steps]);
    setActiveProtocol(selectEntry);

    // INIT
    setDemoStep(2);
    await sleep(400);
    const initReq = { action: 'init' as const, itemId: tomatoProduce.id, quantityKg: qty, buyerId: buyer.id, buyerName: buyer.name };
    const initResult = bppService.init(initReq, produceListings, farmers);
    pendingOrders.set(initResult.transactionId, initResult.order);
    const initEntry = bppService.timelineEntry('init', 'Init', `Transaction initialized: ${initResult.transactionId}`, initReq as Record<string, unknown>, { transactionId: initResult.transactionId, orderStatus: initResult.order.status } as Record<string, unknown>);
    steps.push(initEntry);
    setTimeline([...steps]);
    setActiveProtocol(initEntry);

    // CONFIRM — use existing placeOrder
    setDemoStep(3);
    await sleep(400);
    const placedOrder = placeOrder({
      buyerId: buyer.id,
      buyerName: buyer.name,
      farmerId: tomatoProduce.farmerId,
      farmerName: tomatoProduce.farmerName,
      crop: tomatoProduce.crop,
      quantityKg: qty,
      pricePerKg: tomatoProduce.pricePerKg,
      totalAmount: qty * tomatoProduce.pricePerKg,
      deliveryDate: '2026-09-07',
    });

    const confirmReq = { action: 'confirm' as const, transactionId: initResult.transactionId, agriflowOrderId: placedOrder.id };
    const confirmResult = bppService.confirm(confirmReq, pendingOrders, placedOrder);

    const confirmEntry = bppService.timelineEntry(
      'confirm',
      'Confirm',
      `Order confirmed and placed in AgriFlow via placeOrder(). Canonical Order ${placedOrder.orderNumber} linked.`,
      confirmReq as Record<string, unknown>,
      { becknOrderId: confirmResult.order.id, agriflowOrderId: confirmResult.agriflowOrderId, agriflowOrderNumber: placedOrder.orderNumber, status: 'confirmed' } as Record<string, unknown>
    );
    steps.push(confirmEntry);
    setTimeline([...steps]);
    setActiveProtocol(confirmEntry);

    // STATUS
    setDemoStep(4);
    await sleep(400);
    const statusReq = { action: 'status' as const, transactionId: initResult.transactionId };
    const statusResult = bppService.status(initResult.transactionId, [placedOrder], deliveries, undefined, payments);
    const statusEntry = bppService.timelineEntry(
      'status',
      'Status',
      `Order status queried from AgriFlow: ${placedOrder.status} mapped to Beckn ${statusResult.status}`,
      statusReq as Record<string, unknown>,
      { becknStatus: statusResult.status, agriflowStatus: placedOrder.status, agriflowOrderId: placedOrder.id } as Record<string, unknown>
    );
    steps.push(statusEntry);
    setTimeline([...steps]);
    setActiveProtocol(statusEntry);

    // TRACK
    setDemoStep(5);
    await sleep(400);
    const trackReq = { action: 'track' as const, transactionId: initResult.transactionId };
    const trackResult = bppService.track(initResult.transactionId, [placedOrder], deliveries);
    const trackEntry = bppService.timelineEntry(
      'track',
      'Track',
      `Fulfillment tracking: ${trackResult.fulfillment.status} (ETA: ${trackResult.fulfillment.eta}) linked to delivery route`,
      trackReq as Record<string, unknown>,
      { fulfillmentId: trackResult.fulfillment.id, fulfillmentStatus: trackResult.fulfillment.status, eta: trackResult.fulfillment.eta, destination: buyer.name } as Record<string, unknown>
    );
    steps.push(trackEntry);
    setTimeline([...steps]);
    setActiveProtocol(trackEntry);

    // Register transaction record in shared state
    const record: BppTransactionRecord = bppService.buildTransactionRecord(
      initResult.transactionId,
      confirmResult.order,
      placedOrder.id,
      placedOrder.orderNumber,
      buyer.id,
      buyer.name,
      'pickup-scheduled',
      steps,
      {
        deliveryId: deliveries.find((d) => d.orderId === placedOrder.id)?.id,
        paymentId: payments.find((p) => p.farmerId === placedOrder.farmerId)?.id,
      }
    );
    addBppTransaction(record);

    setDemoStep(6);
    setDemoRunning(false);
    showToast('BPP demo complete — order placed & transaction recorded', 'success');
  }, [produceListings, farmers, buyers, deliveries, payments, placeOrder, addBppTransaction, showToast]);

  const stepIcon = (action: BecknAction): React.ReactNode => {
    switch (action) {
      case 'search': return <Search className="w-4 h-4" />;
      case 'select': return <MousePointerClick className="w-4 h-4" />;
      case 'init': return <Play className="w-4 h-4" />;
      case 'confirm': return <CheckCircle2 className="w-4 h-4" />;
      case 'status': return <Activity className="w-4 h-4" />;
      case 'track': return <Truck className="w-4 h-4" />;
      case 'cancel': return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <PageHeader
        title="Beckn BPP Interoperability"
        subtitle="AgriFlow AI — Beckn-compatible BPP layer (Demo / Sandbox)"
        icon={<Network className="w-5 h-5" />}
      />

      {/* Sandbox Warning */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <strong>Beckn BPP Demo / Sandbox</strong> — Prototype interoperability layer. No live Beckn network connection. Protocol exchanges are simulated for demonstration.
        </p>
      </div>

      {/* Dynamic Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Server className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-earth-500">BPP Status</p>
              <p className="text-lg font-bold text-green-600">CONNECTED</p>
              <p className="text-[10px] text-earth-400">Sandbox</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center"><Package className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-earth-500">Catalog Items</p>
              <p className="text-xl font-bold text-earth-900">{catalog.itemCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Activity className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-earth-500">Active Txns</p>
              <p className="text-xl font-bold text-earth-900">{activeOrders}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-earth-500">Confirmed</p>
              <p className="text-xl font-bold text-earth-900">{confirmedTxns}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><Truck className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-earth-500">In Transit</p>
              <p className="text-xl font-bold text-earth-900">{inTransitTxns}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-earth-500">Completed</p>
              <p className="text-xl font-bold text-earth-900">{completedTxns}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
            <div>
              <p className="text-sm text-earth-500">Total Value</p>
              <p className="text-lg font-bold text-earth-900">₹{totalTxnValue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Provider Profile */}
      <Card className="mb-6 p-5">
        <CardHeader title="BPP Provider Profile" subtitle="AgriFlow AI — Beckn Provider" icon={<Server className="w-5 h-5" />} />
        <div className="p-5 pt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileField label="Provider" value={AGRIFLOW_BPP_PROVIDER.name} />
          <ProfileField label="Provider ID" value={AGRIFLOW_BPP_PROVIDER.id} mono />
          <ProfileField label="Provider Type" value={AGRIFLOW_BPP_PROVIDER.type} />
          <ProfileField label="Domain" value={AGRIFLOW_BPP_PROVIDER.domain} />
          <ProfileField label="Environment" value="Sandbox / Demo" />
          <div>
            <p className="text-xs text-earth-500 mb-1">Status</p>
            <Badge variant="success">CONNECTED — SIMULATED</Badge>
          </div>
        </div>
      </Card>

      {/* Architecture Flow */}
      <Card className="mb-6 p-5">
        <CardHeader title="Architecture: How the Layers Work Together" subtitle="AgriFlow AI is the intelligence layer. BPP is the interoperability layer. Market participants connect through BPP." icon={<Layers className="w-5 h-5" />} />
        <div className="p-5 pt-3">
          <div className="flex flex-col items-center gap-3">
            {[
              { label: 'AGRIFLOW AI — Demand • Price • Matching • Clustering • Queue • Route', icon: <Sparkles className="w-4 h-4" />, color: 'bg-green-50 text-green-700 border-green-200' },
              { label: 'BPP INTEROPERABILITY — Search • Select • Init • Confirm • Status • Track', icon: <Network className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'MARKET PARTICIPANTS — Farmers • Buyers • Centres • Logistics • Payments', icon: <Truck className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
            ].map((layer, i, arr) => (
              <div key={i} className="w-full max-w-2xl">
                <div className={`flex items-center gap-3 rounded-xl border-2 ${layer.color} px-5 py-3`}>
                  {layer.icon}
                  <span className="text-sm font-medium">{layer.label}</span>
                </div>
                {i < arr.length - 1 && <div className="flex items-center justify-center py-1"><ArrowDown className="w-4 h-4 text-earth-300" /></div>}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* AgriFlow AI vs Beckn */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <AIInsightCard title="AgriFlow AI Intelligence" badge="Internal AI Layer" variant="success" reasoning="AI intelligence remains inside the AgriFlow platform. The BPP layer exposes results, not the AI itself." icon={<Sparkles className="w-5 h-5" />}>
          <div className="space-y-2">
            {['Demand Forecasting', 'Price Recommendation', 'Farmer Clustering', 'Queue Prediction', 'Centre Recommendation', 'Buyer Matching', 'Surplus Detection', 'Logistics Optimization'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-earth-700"><Sparkles className="w-3.5 h-3.5 text-agri-600" /> {item}</div>
            ))}
          </div>
        </AIInsightCard>
        <AIInsightCard title="Beckn Interoperability" badge="BPP Layer" variant="warning" reasoning="The BPP layer is an interoperability layer — it exposes AgriFlow's offerings through a Beckn-compatible architecture for network discovery." icon={<Network className="w-5 h-5" />}>
          <div className="space-y-2">
            {['Catalog Discovery', 'Search', 'Selection', 'Order Initialization', 'Order Confirmation', 'Status', 'Fulfillment', 'Transaction Interoperability'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-earth-700"><Network className="w-3.5 h-3.5 text-blue-600" /> {item}</div>
            ))}
          </div>
        </AIInsightCard>
      </div>

      {/* Beckn Flow Steps */}
      <Card className="mb-6 p-5">
        <CardHeader title="Beckn Protocol Request Flow" subtitle="Simulated lifecycle: Discovery → Search → Select → Init → Confirm → Status → Track" icon={<Code2 className="w-5 h-5" />} />
        <div className="p-5 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {BECKN_FLOW_STEPS.map((step, i) => (
              <div key={step.action} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 ${
                  demoStep === i ? 'border-agri-500 bg-agri-50 text-agri-700 shadow-card'
                  : demoStep > i ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-earth-200 bg-earth-50 text-earth-500'}`}>
                  {stepIcon(step.action)}
                  <div>
                    <p className="text-sm font-semibold">{step.label}</p>
                    <p className="text-[10px] opacity-75">{step.description}</p>
                  </div>
                </div>
                {i < BECKN_FLOW_STEPS.length - 1 && <ArrowRight className="w-4 h-4 text-earth-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Live Demo */}
      <Card className="mb-6 p-5">
        <CardHeader title="Live BPP Transaction Demo" subtitle="Run a simulated Beckn transaction using live marketplace data — ABC Foods searches for tomatoes, selects, initializes, confirms via existing placeOrder(), and tracks fulfillment." icon={<Zap className="w-5 h-5" />} />
        <div className="p-5 pt-3">
          <button onClick={runDemo} disabled={demoRunning} className="btn-primary mb-4">
            {demoRunning ? 'Running Demo...' : 'Run BPP Transaction Demo'} <Play className="w-4 h-4" />
          </button>

          {demoRunning && (
            <div className="mb-4 w-full bg-earth-100 rounded-full h-2 overflow-hidden">
              <div className="bg-agri-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((demoStep + 1) / 7) * 100}%` }} />
            </div>
          )}

          {timeline.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-earth-700">Transaction Timeline</p>
              {timeline.map((entry, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                  activeProtocol?.timestamp === entry.timestamp ? 'border-agri-400 bg-agri-50' : 'border-earth-200 bg-white hover:bg-earth-50'}`}
                  onClick={() => setActiveProtocol(entry)}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${demoStep > i ? 'bg-green-100 text-green-600' : 'bg-agri-100 text-agri-600'}`}>
                    {stepIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-earth-900">{entry.label}</p>
                      <Badge variant={demoStep > i ? 'success' : 'agri'}>{entry.action.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-earth-500 mt-0.5">{entry.description}</p>
                    <p className="text-[10px] text-earth-400 mt-0.5">{entry.timestamp}</p>
                  </div>
                  <Eye className="w-4 h-4 text-earth-400 flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Protocol Exchange Viewer */}
      {activeProtocol && (
        <Card className="mb-6 p-5">
          <CardHeader title="Simulated Beckn Protocol Exchange" subtitle={`${activeProtocol.label} — ${activeProtocol.action.toUpperCase()} request & response`} icon={<Code2 className="w-5 h-5" />} />
          <div className="p-5 pt-3">
            <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-xs text-amber-800">Simulated Beckn Protocol Exchange — Prototype payload for demonstration. Not a production network payload.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-earth-500 mb-2 flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> REQUEST</p>
                <pre className="bg-earth-900 text-earth-100 rounded-xl p-4 text-xs overflow-x-auto max-h-80 font-mono leading-relaxed">{JSON.stringify(activeProtocol.request, null, 2)}</pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-earth-500 mb-2 flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> RESPONSE</p>
                <pre className="bg-earth-900 text-earth-100 rounded-xl p-4 text-xs overflow-x-auto max-h-80 font-mono leading-relaxed">{JSON.stringify(activeProtocol.response, null, 2)}</pre>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* BPP Transactions Table */}
      <Card className="mb-6">
        <CardHeader title="BPP Transactions" subtitle={`${bppTransactions.length} transaction${bppTransactions.length === 1 ? '' : 's'} recorded — click to inspect`} icon={<Activity className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          {bppTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-10 h-10 mx-auto text-earth-300 mb-3" />
              <p className="text-earth-500">No BPP transactions yet. Run the demo or use the Buyer BPP Discovery page to create one.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Transaction ID</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Buyer</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Item</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Qty</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Fulfillment</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {bppTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-earth-100 last:border-0 hover:bg-agri-50 cursor-pointer" onClick={() => setInspectorTxn(txn)}>
                    <td className="px-4 py-3 text-xs font-mono text-earth-600">{txn.transactionId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-earth-900">{txn.buyerName}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{txn.crop}</td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">{txn.quantityKg} kg</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-earth-900">₹{txn.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><Badge variant={txn.becknStatus === 'completed' ? 'success' : txn.becknStatus === 'confirmed' ? 'info' : 'neutral'}>{txn.becknStatus}</Badge></td>
                    <td className="px-4 py-3 text-sm text-earth-600">{txn.fulfillmentStatus}</td>
                    <td className="px-4 py-3 text-xs text-earth-500">{txn.createdAt.slice(0, 19).replace('T', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Fulfillments Section */}
      <Card className="mb-6">
        <CardHeader title="Fulfillments" subtitle="BPP fulfillment status mapped from AgriFlow deliveries" icon={<Truck className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          {bppTransactions.length === 0 ? (
            <div className="p-8 text-center text-earth-500">No fulfillments to display.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Fulfillment ID</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Farmer</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Buyer</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Qty</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bppTransactions.map((txn) => {
                  const order = orders.find((o) => o.id === txn.agriflowOrderId);
                  const delivery = deliveries.find((d) => d.orderId === txn.agriflowOrderId);
                  return (
                    <tr key={txn.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50 cursor-pointer" onClick={() => setInspectorTxn(txn)}>
                      <td className="px-4 py-3 text-xs font-mono text-earth-600">ful-{txn.agriflowOrderId}</td>
                      <td className="px-4 py-3 text-xs font-mono text-earth-600">{order?.orderNumber || txn.agriflowOrderId}</td>
                      <td className="px-4 py-3 text-sm text-earth-700">{txn.farmerName}</td>
                      <td className="px-4 py-3 text-sm text-earth-700">{txn.buyerName}</td>
                      <td className="px-4 py-3 text-sm text-right text-earth-700">{txn.quantityKg} kg</td>
                      <td className="px-4 py-3">
                        <Badge variant={txn.fulfillmentStatus === 'completed' ? 'success' : txn.fulfillmentStatus === 'in-transit' ? 'info' : 'neutral'}>
                          {txn.fulfillmentStatus}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Payments Section */}
      <Card className="mb-6">
        <CardHeader title="Payments" subtitle="BPP transaction payment status — linked to AgriFlow payment system" icon={<Wallet className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          {bppTransactions.length === 0 ? (
            <div className="p-8 text-center text-earth-500">No payment records to display.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Transaction ID</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Buyer</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Farmer</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Payment Status</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Farmer Payment</th>
                </tr>
              </thead>
              <tbody>
                {bppTransactions.map((txn) => {
                  const payInfo = getPaymentForTxn(txn);
                  return (
                    <tr key={txn.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50 cursor-pointer" onClick={() => setInspectorTxn(txn)}>
                      <td className="px-4 py-3 text-xs font-mono text-earth-600">{txn.transactionId}</td>
                      <td className="px-4 py-3 text-sm text-earth-700">{txn.buyerName}</td>
                      <td className="px-4 py-3 text-sm text-earth-700">{txn.farmerName}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-earth-900">₹{txn.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <Badge variant={payInfo?.status === 'completed' ? 'success' : 'neutral'}>
                          {payInfo?.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-earth-600">
                        {payInfo?.farmerPayment ? (
                          <span className="flex items-center gap-1.5">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {payInfo.farmerPayment.status}
                          </span>
                        ) : (
                          <span className="text-earth-400">Not yet initiated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Transaction Inspector Modal */}
      <Modal open={!!inspectorTxn} onClose={() => setInspectorTxn(null)} title="Transaction Inspector" subtitle="Simulated Beckn Protocol Exchange" size="lg">
        {inspectorTxn && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-xs text-amber-800">Simulated Beckn Protocol Exchange — Prototype payloads for demonstration. Not production network exchanges.</p>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Transaction ID</p><p className="text-sm font-mono font-semibold text-earth-900">{inspectorTxn.transactionId}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">AgriFlow Order</p><p className="text-sm font-mono font-semibold text-green-700">{inspectorTxn.agriflowOrderId}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Fulfillment ID</p><p className="text-sm font-mono font-semibold text-earth-900">ful-{inspectorTxn.agriflowOrderId}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Buyer</p><p className="text-sm font-semibold text-earth-900">{inspectorTxn.buyerName}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Farmer</p><p className="text-sm font-semibold text-earth-900">{inspectorTxn.farmerName}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Produce</p><p className="text-sm font-semibold text-earth-900">{inspectorTxn.crop}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Quantity</p><p className="text-sm font-semibold text-earth-900">{inspectorTxn.quantityKg} kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Total Amount</p><p className="text-sm font-semibold text-earth-900">₹{inspectorTxn.totalAmount.toLocaleString('en-IN')}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">BPP Status</p><p className="text-sm font-semibold text-blue-700">{inspectorTxn.becknStatus}</p></div>
            </div>

            {/* Full Lifecycle Flow */}
            <div>
              <p className="text-xs font-semibold text-earth-500 mb-2">Complete Transaction Lifecycle</p>
              <div className="flex items-center gap-1 flex-wrap">
                {['SEARCH', 'SELECT', 'INIT', 'CONFIRM', 'ORDER', 'FULFILLMENT', 'STATUS', 'TRACK', 'PAYMENT', 'COMPLETED'].map((step, i, arr) => {
                  const hasStep = inspectorTxn.timeline.some((t) => t.action.toLowerCase() === step.toLowerCase());
                  const isCompleted = inspectorTxn.becknStatus === 'completed';
                  const isOrder = step === 'ORDER';
                  const isFulfillment = step === 'FULFILLMENT';
                  const isPayment = step === 'PAYMENT';
                  const isCompletedStep = step === 'COMPLETED';
                  const active = hasStep || (isOrder && inspectorTxn.agriflowOrderId) || (isFulfillment && inspectorTxn.fulfillmentStatus) || (isPayment && getPaymentForTxn(inspectorTxn)?.status === 'completed') || (isCompletedStep && isCompleted);
                  return (
                    <div key={step} className="flex items-center gap-1">
                      <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold ${active ? 'bg-blue-600 text-white' : 'bg-earth-100 text-earth-400'}`}>
                        {active ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                        {step}
                      </div>
                      {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-earth-300" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline with JSON */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-earth-500">Simulated Beckn Protocol Exchange</p>
              {inspectorTxn.timeline.map((entry, i) => (
                <div key={i} className="rounded-xl border border-earth-200 overflow-hidden">
                  <div className="flex items-center gap-2 bg-earth-50 px-3 py-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">{stepIcon(entry.action)}</div>
                    <p className="text-sm font-semibold text-earth-900">{entry.label}</p>
                    <Badge variant="info" className="ml-auto">{entry.action.toUpperCase()}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 p-3">
                    <div>
                      <p className="text-[10px] font-semibold text-earth-400 mb-1">REQUEST</p>
                      <pre className="bg-earth-900 text-earth-100 rounded-lg p-2 text-[10px] overflow-x-auto max-h-40 font-mono">{JSON.stringify(entry.request, null, 2)}</pre>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-earth-400 mb-1">RESPONSE</p>
                      <pre className="bg-earth-900 text-earth-100 rounded-lg p-2 text-[10px] overflow-x-auto max-h-40 font-mono">{JSON.stringify(entry.response, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setInspectorTxn(null)} className="btn-secondary w-full">Close Inspector</button>
          </div>
        )}
      </Modal>

      {/* BPP Catalog */}
      <Card className="mb-6">
        <CardHeader title="BPP Catalog (Live)" subtitle={`${catalog.itemCount} items exposed from AgriFlow marketplace`} icon={<Package className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          {catalog.items.length === 0 ? (
            <div className="p-12 text-center text-earth-500">No available produce in the marketplace. Items will appear here when farmers list produce.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Item ID</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Crop</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Qty (kg)</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Price/kg</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Provider</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Location</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Availability</th>
                </tr>
              </thead>
              <tbody>
                {catalog.items.slice(0, 15).map((item: BecknItem) => (
                  <tr key={item.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50">
                    <td className="px-4 py-3 text-xs font-mono text-earth-600">{item.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-earth-900">{item.crop}</td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">{item.quantityKg}</td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">₹{item.pricePerKg}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{item.providerName}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{item.location.address}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.availability} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Privacy Note */}
      <Card className="p-4 bg-earth-50 border-earth-200">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-earth-500 flex-shrink-0" />
          <p className="text-xs text-earth-500">The BPP layer exposes only marketplace-relevant information (crop, quantity, price, quality, location, availability). Private farmer contact details and internal administrative data are not exposed through the BPP catalog.</p>
        </div>
      </Card>
    </div>
  );
}

function ProfileField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-earth-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold text-earth-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
