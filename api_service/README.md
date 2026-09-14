# AgriFlow AI - Dedicated Python ML Inference Microservice

This microservice runs the real, trained Scikit-Learn Random Forest model for AgriFlow agricultural market activity forecasting:
**`agriflow_random_forest_demand.joblib`**

- **Hugging Face Repository**: [ASUJAL123/agriflow-random-forest](https://huggingface.co/ASUJAL123/agriflow-random-forest)
- **Model File**: `agriflow_random_forest_demand.joblib` (~204.23 MB)
- **Framework & Libraries**:
  - `scikit-learn==1.6.1`
  - `joblib==1.5.3`
  - `fastapi>=0.110.0`
  - `uvicorn>=0.28.0`
- **Training Data**: AGMARKNET-derived Indian Mandi dataset (34,005 observations, 2010–2025) across 10 crops and 32 states
- **Hyperparameters**: 300 Decision Trees (`n_estimators=300`), Max Depth 15 (`max_depth=15`), Random State 42
- **Evaluation**: $R^2 = 0.8763$ (2023–2025 test split), Dedicated 2025 Test $R^2 = 0.915$, $\text{MAE} = 107.32$, $\text{RMSE} = 404.31$
- **Target**: `next_month_market_activity` (Market Activity & Throughput Proxy)

---

## Automatic Hugging Face Model Download

On server startup (`@app.on_event("startup")`):
1. The service checks if `agriflow_random_forest_demand.joblib` already exists locally in `api_service/`.
2. If absent, it automatically streams the ~204.23 MB model from Hugging Face:
   `https://huggingface.co/ASUJAL123/agriflow-random-forest/resolve/main/agriflow_random_forest_demand.joblib`
3. Once downloaded, `joblib.load()` deserializes the model **once** into memory. It is **never** downloaded or reloaded during individual prediction requests.
4. **Fault Tolerance & Deterministic Fallback**: If the download fails (e.g. offline environment) or the model fails to load, the FastAPI service stays online and reports `model_loaded: false` on `GET /health`. `POST /predict` returns HTTP 503, instructing the client to use AgriFlow's built-in deterministic fallback engine. No fake predictions are ever generated.

---

## Quickstart

### 1. Local Run
```bash
cd api_service
pip install -r requirements.txt
python main.py
```
The server will start on port `8000`. On first run, it will automatically download `agriflow_random_forest_demand.joblib` into `api_service/`.

### 2. Deployment on Render.com (Recommended Free Cloud Hosting)
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), create a **New Web Service**.
3. Set:
   - **Root Directory**: `api_service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Render will deploy the service and run `startup_load_model()`, downloading the model from Hugging Face automatically.
5. In your AgriFlow web application, set the environment variable:
   ```env
   VITE_ML_API_URL=https://your-service-name.onrender.com
   ```

### 3. Deployment on Hugging Face Spaces
1. Create a new Space on [Hugging Face](https://huggingface.co/spaces) with SDK: **Docker** or **Gradio / FastAPI**.
2. Upload `main.py` and `requirements.txt`.
3. Set `VITE_ML_API_URL` in AgriFlow to your Space's direct URL.

---

## API Endpoints

- `GET /`: Service information, model load status, and Hugging Face repository metadata.
- `GET /health`: Model health status, indicates `model_loaded: true/false` and `real_ml_active: true/false`.
- `GET /metadata`: Complete 13-feature schema, evaluation metrics, and crop/state integer code mappings.
- `POST /predict`: Real Random Forest inference using the actual loaded model.
- `POST /predict_raw`: Inference using a raw 13-element feature array.
