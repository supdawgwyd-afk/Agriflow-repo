"""
AgriFlow Real Random Forest Inference Service
Dedicated FastAPI service for executing 'agriflow_random_forest_demand.joblib'
Trained on AGMARKNET Indian Mandi Dataset (34,005 observations, 2010-2025)
Target: next_month_market_activity (Market Activity / Demand Proxy)

Model Repository: https://huggingface.co/ASUJAL123/agriflow-random-forest
Model File: agriflow_random_forest_demand.joblib (~204.23 MB)
scikit-learn==1.6.1, joblib==1.5.3
"""

import os
import sys
import math
import logging
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("agriflow-ml-service")

# Resolve base directory relative to this file (api_service/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Hugging Face Repository Information
HF_REPO_ID = os.getenv("HF_REPO_ID", "ASUJAL123/agriflow-random-forest-deployment")
MODEL_FILENAME = os.getenv("MODEL_FILENAME", "agriflow_random_forest_demand.joblib")
HF_DIRECT_URL = f"https://huggingface.co/{HF_REPO_ID}/resolve/main/{MODEL_FILENAME}"

# Resolve model path strictly relative to api_service/ directory
env_model_path = os.getenv("MODEL_PATH")
if env_model_path:
    if os.path.isabs(env_model_path):
        MODEL_FILE_PATH = env_model_path
    else:
        MODEL_FILE_PATH = os.path.join(BASE_DIR, env_model_path)
else:
    MODEL_FILE_PATH = os.path.join(BASE_DIR, MODEL_FILENAME)

# Global model instance and loading state
model = None
model_load_error: Optional[str] = None
model_source: str = "unloaded"

# Model metadata from AGMARKNET training
METADATA = {
    "model": "Random Forest Regressor",
    "n_estimators": 75,
    "max_depth": 15,
    "random_state": 42,
    "target": "next_month_market_activity",
    "target_description": "Next observed period market activity proxy (mandi arrivals volume / throughput)",
    "data_source": "AGMARKNET-derived Indian agricultural mandi market data",
    "dataset_rows": 34005,
    "training_rows": 28341,
    "evaluation_rows": 5413,
    "evaluation_period": "2023-2025",
    "mae": 107.31926826908347,
    "rmse": 404.3116211014795,
    "r2": 0.8763052654245094,
    "huggingface_repo": HF_REPO_ID,
    "model_filename": MODEL_FILENAME,
    "scikit_learn_version": "1.6.1",
    "joblib_version": "1.5.3",
    "features": [
        "crop_code",
        "state_code",
        "year",
        "month",
        "market_observations",
        "avg_min_price",
        "avg_max_price",
        "avg_modal_price",
        "market_count",
        "month_sin",
        "month_cos",
        "price_change_pct",
        "previous_market_activity"
    ],
    "crop_mapping": {
        "Chilli": 0, "Cotton": 1, "Groundnut": 2, "Maize": 3, "Onion": 4,
        "Potato": 5, "Rice": 6, "Sugarcane": 7, "Tomato": 8, "Wheat": 9
    },
    "state_mapping": {
        "Andaman and Nicobar": 0, "Andhra Pradesh": 1, "Arunachal Pradesh": 2, "Assam": 3,
        "Bihar": 4, "Chandigarh": 5, "Chattisgarh": 6, "Goa": 7, "Gujarat": 8,
        "Haryana": 9, "Himachal Pradesh": 10, "Jammu and Kashmir": 11, "Jharkhand": 12,
        "Karnataka": 13, "Kerala": 14, "Madhya Pradesh": 15, "Maharashtra": 16,
        "Manipur": 17, "Meghalaya": 18, "Mizoram": 19, "NCT of Delhi": 20,
        "Nagaland": 21, "Odisha": 22, "Pondicherry": 23, "Punjab": 24, "Rajasthan": 25,
        "Tamil Nadu": 26, "Telangana": 27, "Tripura": 28, "Uttar Pradesh": 29,
        "Uttrakhand": 30, "West Bengal": 31
    }
}

def download_model_from_huggingface() -> bool:
    """
    Downloads agriflow_random_forest_demand.joblib from Hugging Face if not already present.
    Uses streaming download to minimize RAM usage during download of ~204 MB file.
    """
    if os.path.exists(MODEL_FILE_PATH) and os.path.getsize(MODEL_FILE_PATH) > 1024 * 1024:
        logger.info(f"Model file already exists locally at: {MODEL_FILE_PATH} ({os.path.getsize(MODEL_FILE_PATH) / (1024*1024):.2f} MB)")
        return True

    logger.info(f"Downloading real Random Forest model (~204 MB) from Hugging Face: {HF_DIRECT_URL}")
    os.makedirs(os.path.dirname(MODEL_FILE_PATH), exist_ok=True)
    temp_file_path = f"{MODEL_FILE_PATH}.tmp"

    # Strategy 1: Try huggingface_hub if available
    try:
        from huggingface_hub import hf_hub_download
        logger.info(f"Using huggingface_hub to download {MODEL_FILENAME} from {HF_REPO_ID}...")
        downloaded_path = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=MODEL_FILENAME,
            local_dir=BASE_DIR,
            local_dir_use_symlinks=False
        )
        if os.path.exists(downloaded_path) and os.path.getsize(downloaded_path) > 1024 * 1024:
            logger.info(f"Successfully downloaded model via huggingface_hub to {downloaded_path}")
            return True
    except Exception as hf_err:
        logger.warning(f"huggingface_hub download attempt did not succeed ({hf_err}), falling back to direct HTTP stream...")

    # Strategy 2: Direct HTTP streaming download with requests or urllib
    try:
        import requests
        with requests.get(HF_DIRECT_URL, stream=True, timeout=180) as response:
            response.raise_for_status()
            total_bytes = int(response.headers.get('content-length', 0))
            downloaded_bytes = 0
            with open(temp_file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=1024 * 1024):  # 1MB chunks
                    if chunk:
                        f.write(chunk)
                        downloaded_bytes += len(chunk)
                        if total_bytes > 0 and downloaded_bytes % (20 * 1024 * 1024) < 1024 * 1024:
                            logger.info(f"Downloaded {downloaded_bytes / (1024*1024):.1f} MB / {total_bytes / (1024*1024):.1f} MB ({downloaded_bytes/total_bytes*100:.1f}%)")

        # Atomic rename once download is verified complete
        os.replace(temp_file_path, MODEL_FILE_PATH)
        logger.info(f"Successfully downloaded and saved model to {MODEL_FILE_PATH}")
        return True
    except Exception as req_err:
        logger.warning(f"Requests stream download failed: {req_err}. Trying urllib fallback...")

    try:
        import urllib.request
        def report_hook(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0 and downloaded % (20 * 1024 * 1024) < block_size:
                logger.info(f"Urllib download: {downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB")

        urllib.request.urlretrieve(HF_DIRECT_URL, temp_file_path, reporthook=report_hook)
        os.replace(temp_file_path, MODEL_FILE_PATH)
        logger.info(f"Successfully downloaded model via urllib to {MODEL_FILE_PATH}")
        return True
    except Exception as url_err:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except OSError:
                pass
        raise RuntimeError(f"All download methods failed. HF URL: {HF_DIRECT_URL}. Details: {url_err}")

app = FastAPI(
    title="AgriFlow ML Model Inference API",
    description="Real Scikit-Learn Random Forest execution service for AGMARKNET agricultural market predictions",
    version="1.1.0"
)

# Enable CORS for AgriFlow web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_load_model():
    """
    Downloads (if needed) and loads the real trained Random Forest model into memory once at startup.
    If downloading or loading fails, catches the error and keeps the service running,
    reporting status via /health so the client knows to use deterministic fallback.
    """
    global model, model_load_error, model_source
    logger.info("Initializing AgriFlow ML Model Service startup...")

    # Step 1: Ensure model exists locally or download from Hugging Face
    try:
        download_model_from_huggingface()
    except Exception as e:
        model_load_error = f"Model download error from Hugging Face ({HF_REPO_ID}): {str(e)}"
        logger.error(model_load_error)
        model = None
        return

    # Step 2: Load model into memory with joblib only once
    if os.path.exists(MODEL_FILE_PATH):
        try:
            logger.info(f"Loading Random Forest model from {MODEL_FILE_PATH} using joblib...")
            loaded_model = joblib.load(MODEL_FILE_PATH)
            model = loaded_model
            model_load_error = None
            model_source = f"Hugging Face: {HF_REPO_ID} ({MODEL_FILENAME})"
            logger.info(f"SUCCESS: Real Random Forest model loaded into memory. Type: {type(model).__name__}")
        except Exception as e:
            model = None
            model_load_error = f"Failed to deserialize model with joblib: {str(e)}"
            logger.error(f"ERROR: {model_load_error}")
    else:
        model = None
        model_load_error = f"Model file not found at resolved path: {MODEL_FILE_PATH}"
        logger.warning(model_load_error)

class PredictionRequest(BaseModel):
    crop: str = Field(..., example="Tomato")
    state: str = Field(default="Tamil Nadu", example="Tamil Nadu")
    year: int = Field(default=2026, example=2026)
    month: int = Field(default=9, ge=1, le=12, example=9)
    market_observations: Optional[float] = Field(default=12.0)
    avg_min_price: Optional[float] = Field(default=25.0)
    avg_max_price: Optional[float] = Field(default=35.0)
    avg_modal_price: Optional[float] = Field(default=30.0)
    market_count: Optional[float] = Field(default=4.0)
    price_change_pct: Optional[float] = Field(default=0.0)
    previous_market_activity: Optional[float] = Field(default=150.0)

class RawFeaturesRequest(BaseModel):
    features: List[float] = Field(..., description="Array of 13 exact features matching metadata schema")

@app.get("/")
def root():
    return {
        "service": "AgriFlow ML Inference API",
        "status": "ready" if model is not None else "degraded",
        "real_ml_active": model is not None,
        "model_loaded": model is not None,
        "model_file": MODEL_FILENAME,
        "model_path": MODEL_FILE_PATH,
        "model_source": model_source,
        "huggingface_repo": HF_REPO_ID,
        "error": model_load_error,
        "metadata": METADATA
    }

@app.get("/health")
def health():
    """
    Health check endpoint. Clearly reports whether the REAL Random Forest model is loaded.
    """
    return {
        "status": "healthy" if model is not None else "degraded",
        "model_loaded": model is not None,
        "real_ml_active": model is not None,
        "model_type": METADATA["model"] if model is not None else None,
        "huggingface_repo": HF_REPO_ID,
        "model_filename": MODEL_FILENAME,
        "model_path": MODEL_FILE_PATH,
        "model_source": model_source if model is not None else "unavailable",
        "estimators": METADATA["n_estimators"] if model is not None else None,
        "test_r2": METADATA["r2"] if model is not None else None,
        "error": model_load_error,
        "fallback_mode": model is None
    }

@app.get("/metadata")
def get_metadata():
    """
    Returns complete model metadata, AGMARKNET training metrics, and feature mappings.
    """
    return METADATA

@app.post("/predict")
def predict(req: PredictionRequest):
    """
    Executes inference using the REAL Random Forest model if loaded.
    If the real model is not loaded, returns 503 so client preserves deterministic fallback.
    Never returns fake or mock predictions.
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Real Random Forest model is currently unavailable on inference server. "
                f"Reason: {model_load_error or 'Model not loaded'}. "
                f"Please use AgriFlow deterministic fallback engine."
            )
        )

    # 1. Map crop name to crop_code
    if req.crop not in METADATA["crop_mapping"]:
        valid_crops = list(METADATA["crop_mapping"].keys())
        raise HTTPException(status_code=400, detail=f"Crop '{req.crop}' not recognized. Allowed crops: {valid_crops}")
    crop_code = METADATA["crop_mapping"][req.crop]

    # 2. Map state name to state_code
    if req.state not in METADATA["state_mapping"]:
        valid_states = list(METADATA["state_mapping"].keys())
        raise HTTPException(status_code=400, detail=f"State '{req.state}' not recognized. Allowed states: {valid_states}")
    state_code = METADATA["state_mapping"][req.state]

    # 3. Calculate month harmonics
    angle = (2 * math.pi * (req.month - 1)) / 12.0
    month_sin = math.sin(angle)
    month_cos = math.cos(angle)

    # Assemble 13-feature vector in exact positional order expected by trained model
    feature_vector = [
        float(crop_code),
        float(state_code),
        float(req.year),
        float(req.month),
        float(req.market_observations or 10.0),
        float(req.avg_min_price or 25.0),
        float(req.avg_max_price or 35.0),
        float(req.avg_modal_price or 30.0),
        float(req.market_count or 3.0),
        float(month_sin),
        float(month_cos),
        float(req.price_change_pct or 0.0),
        float(req.previous_market_activity or 100.0)
    ]

    try:
        X = np.array([feature_vector])
        predicted_activity = float(model.predict(X)[0])

        return {
            "status": "success",
            "is_real_model": True,
            "model": "Random Forest Regressor (75 estimators)",
            "model_source": model_source,
            "target": METADATA["target"],
            "target_description": METADATA["target_description"],
            "predicted_next_month_market_activity": round(predicted_activity, 2),
            "input_summary": {
                "crop": req.crop,
                "crop_code": crop_code,
                "state": req.state,
                "state_code": state_code,
                "year": req.year,
                "month": req.month,
                "modal_price": req.avg_modal_price
            },
            "feature_vector": feature_vector,
            "evaluation_metrics": {
                "r2": METADATA["r2"],
                "mae": METADATA["mae"],
                "rmse": METADATA["rmse"]
            }
        }
    except Exception as e:
        logger.error(f"Prediction calculation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Inference execution failed: {str(e)}")

@app.post("/predict_raw")
def predict_raw(req: RawFeaturesRequest):
    """
    Direct inference using pre-encoded 13-feature array.
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=f"Real Random Forest model is unavailable. Reason: {model_load_error or 'Model not loaded'}"
        )
    if len(req.features) != 13:
        raise HTTPException(status_code=400, detail=f"Expected exactly 13 features, got {len(req.features)}.")

    try:
        X = np.array([req.features])
        predicted_activity = float(model.predict(X)[0])
        return {
            "status": "success",
            "is_real_model": True,
            "predicted_next_month_market_activity": round(predicted_activity, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference execution failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
