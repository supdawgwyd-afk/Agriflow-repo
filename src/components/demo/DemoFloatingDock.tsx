import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ChevronRight, ChevronLeft, Minimize2, Maximize2, ExternalLink } from 'lucide-react';

export function DemoFloatingDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // If already on the demo page, don't show the floating dock
  if (location.pathname === '/sih-demo') {
    return null;
  }

  if (collapsed) {
    return (
      <aside
        aria-label="Demo Mode Control"
        className="fixed bottom-4 right-4 z-50 animate-fade-in"
      >
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-agri-700 hover:bg-agri-800 text-white shadow-lg border border-agri-500/50 text-xs font-semibold transition-all hover:scale-105"
          id="sih-demo-dock-collapsed"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>SIH Demo Guide</span>
          <Maximize2 className="w-3 h-3 text-agri-200" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Demo Mode Control"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-full sm:w-auto animate-slide-up"
    >
      <div className="rounded-2xl border border-agri-200 bg-white/95 backdrop-blur-md shadow-xl p-3.5 text-earth-900">
        <div className="flex items-center justify-between gap-3 border-b border-earth-100 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-agri-100 text-agri-700">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-earth-900 font-display">SIH 2026 Judge Mode</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/sih-demo')}
              className="p-1 rounded-md hover:bg-earth-100 text-agri-700 text-[11px] font-semibold flex items-center gap-1"
              title="Open full interactive demo hub"
            >
              <span>Full Hub</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-md hover:bg-earth-100 text-earth-400 hover:text-earth-600"
              title="Minimize guide"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="text-xs text-earth-600 mb-2.5 leading-tight">
          Exploring live portal views. Jump into the 12-stage guided scenario at any time.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/sih-demo')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-semibold shadow-xs transition-colors"
            id="launch-sih-demo-dock-btn"
          >
            <span>Launch 5-Min Judge Walkthrough</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
