import type { BecknProvider } from './becknTypes';

export const AGRIFLOW_BPP_PROVIDER: BecknProvider = {
  id: 'AGRIFLOW-BPP-DEMO',
  name: 'AgriFlow AI',
  type: 'Agricultural Supply & Procurement',
  domain: 'Agriculture / Commerce',
  environment: 'sandbox',
  status: 'connected',
  description:
    'AgriFlow AI BPP — Prototype Beckn-compatible interoperability layer exposing agricultural inventory, procurement, and fulfillment for network-level discovery.',
};

export const BPP_CONTEXT_DEFAULTS = {
  domain: 'agriculture',
  country: 'IND',
  city: '*',
  coreVersion: '1.0.0',
  bppId: 'AGRIFLOW-BPP-DEMO',
  bppUri: 'https://bpp.agriflow.ai/demo',
  environment: 'sandbox' as const,
};
