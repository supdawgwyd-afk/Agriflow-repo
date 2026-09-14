/**
 * AgriFlow Python ML Inference Service Client
 * 
 * Provides an HTTP client to query the dedicated Python FastAPI inference service
 * running the actual 'agriflow_random_forest_demand.joblib' scikit-learn model.
 * 
 * Includes graceful fallback: if the remote Python service is unreachable or unconfigured,
 * AgriFlow continues running seamlessly without UI crashes or fake claims.
 */

import metadataJson from './agriflow_model_metadata.json';

export interface AgmarknetModelMetadata {
  model: string;
  n_estimators: number;
  max_depth: number;
  random_state: number;
  target: string;
  target_description: string;
  data_source: string;
  dataset_rows: number;
  training_rows: number;
  evaluation_rows: number;
  evaluation_period: string;
  mae: number;
  rmse: number;
  r2: number;
  features: string[];
  crop_mapping: Record<string, number>;
  state_mapping: Record<string, number>;
}

export const REAL_MODEL_METADATA: AgmarknetModelMetadata = metadataJson as AgmarknetModelMetadata;

export interface MLPredictionInput {
  crop: string;
  state?: string;
  year?: number;
  month?: number;
  market_observations?: number;
  avg_min_price?: number;
  avg_max_price?: number;
  avg_modal_price?: number;
  market_count?: number;
  price_change_pct?: number;
  previous_market_activity?: number;
}

export interface MLPredictionResponse {
  status: 'success' | 'service_unavailable' | 'error';
  predicted_next_month_market_activity?: number;
  model?: string;
  target?: string;
  isRealExecution: boolean;
  message?: string;
}

/**
 * Retrieves the configured Python Inference API URL.
 * Defaults to import.meta.env.VITE_ML_API_URL if configured.
 */
export function getPythonApiUrl(): string | null {
  const url = import.meta.env.VITE_ML_API_URL;
  if (url && typeof url === 'string' && url.trim().length > 0) {
    return url.replace(/\/+$/, '');
  }
  return null;
}

/**
 * Checks if the remote Python Random Forest microservice is online and has loaded the .joblib file.
 */
export async function checkPythonModelHealth(): Promise<{ online: boolean; modelLoaded: boolean; details?: any }> {
  const baseUrl = getPythonApiUrl();
  if (!baseUrl) {
    return { online: false, modelLoaded: false, details: 'VITE_ML_API_URL not configured' };
  }

  try {
    const res = await fetch(`${baseUrl}/health`, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      return { online: true, modelLoaded: false, details: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { online: true, modelLoaded: Boolean(data.model_loaded), details: data };
  } catch (err: any) {
    return { online: false, modelLoaded: false, details: err?.message || 'Network error' };
  }
}

/**
 * Executes a prediction against the remote Python Random Forest service.
 * If the service is unconfigured or fails, returns a structured response indicating
 * that the remote .joblib model could not be called directly.
 */
export async function queryPythonRandomForest(input: MLPredictionInput): Promise<MLPredictionResponse> {
  const baseUrl = getPythonApiUrl();
  if (!baseUrl) {
    return {
      status: 'service_unavailable',
      isRealExecution: false,
      message: 'Python ML service URL (VITE_ML_API_URL) is not configured. Place agriflow_random_forest_demand.joblib in the api_service and deploy to Render/Cloud Run.',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        crop: input.crop,
        state: input.state || 'Tamil Nadu',
        year: input.year || 2026,
        month: input.month || 9,
        market_observations: input.market_observations ?? 12,
        avg_min_price: input.avg_min_price ?? 25,
        avg_max_price: input.avg_max_price ?? 35,
        avg_modal_price: input.avg_modal_price ?? 30,
        market_count: input.market_count ?? 4,
        price_change_pct: input.price_change_pct ?? 0,
        previous_market_activity: input.previous_market_activity ?? 150,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        status: 'error',
        isRealExecution: false,
        message: errData.detail || `Prediction error: HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      status: 'success',
      isRealExecution: true,
      predicted_next_month_market_activity: data.predicted_next_month_market_activity,
      model: data.model,
      target: data.target,
    };
  } catch (err: any) {
    return {
      status: 'service_unavailable',
      isRealExecution: false,
      message: `Failed to connect to Python inference API: ${err?.message || 'Network error'}`,
    };
  }
}
