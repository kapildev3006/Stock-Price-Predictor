from __future__ import annotations

from pathlib import Path
from typing import List, Literal, Optional

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

from strategy_model import StrategyModel, FEATURE_COLUMNS

Action = Literal["BUY", "SELL", "HOLD"]


class FeatureRow(BaseModel):
    rsi: float
    macd: float
    macd_signal: float
    macd_hist: float
    ema12: float
    ema26: float
    sma20: float
    sma50: float
    bb_upper: float
    bb_middle: float
    bb_lower: float
    price_change_24h: float
    price_change_pct_24h: float
    volume: float


class PredictRequest(BaseModel):
    rows: List[FeatureRow]


class PredictResult(BaseModel):
    action: Action
    confidence: float


class PredictResponse(BaseModel):
    success: bool
    results: List[PredictResult]
    error: Optional[str] = None


app = FastAPI(title="Strategy AI Model API", version="0.1.0")

_MODEL: Optional[StrategyModel] = None


def load_model() -> StrategyModel:
    """Load the trained model from disk once and cache it."""
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    model_path = Path(__file__).with_name("strategy_model.joblib")
    if model_path.exists():
        _MODEL = joblib.load(model_path)
    else:
        # Fallback: untrained model instance (will still fail at inference)
        _MODEL = StrategyModel()
    return _MODEL


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    model = load_model()
    model_path = Path(__file__).with_name("strategy_model.joblib")

    if not model_path.exists():
        return PredictResponse(
            success=False,
            results=[],
            error="Model file 'strategy_model.joblib' not found. Train and save the model first.",
        )

    try:
        df = pd.DataFrame([row.dict() for row in request.rows])
        results_raw = model.predict_with_confidence(df)
    except Exception as exc:  # noqa: BLE001
        return PredictResponse(
            success=False,
            results=[],
            error=f"Model inference failed: {exc}",
        )

    results = [
        PredictResult(action=r["action"], confidence=r["confidence"])
        for r in results_raw
    ]

    return PredictResponse(success=True, results=results)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("strategy_api:app", host="127.0.0.1", port=8000, reload=True)
