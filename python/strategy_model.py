from __future__ import annotations

from dataclasses import dataclass
from typing import List, Literal, Dict

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


Action = Literal["BUY", "SELL", "HOLD"]


# Features expected from your market/indicator pipeline
FEATURE_COLUMNS = [
    "rsi",
    "macd",
    "macd_signal",
    "macd_hist",
    "ema12",
    "ema26",
    "sma20",
    "sma50",
    "bb_upper",
    "bb_middle",
    "bb_lower",
    "price_change_24h",
    "price_change_pct_24h",
    "volume",
]

LABEL_COLUMN = "label"  # values must be one of: BUY / SELL / HOLD


@dataclass
class StrategySample:
    """Single training example for the strategy model."""

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
    label: Action


class StrategyModel:
    """ML-based strategy model: predicts BUY/SELL/HOLD from indicators."""

    def __init__(self) -> None:
        # Pipeline: Standardize features -> RandomForest classifier
        self.pipeline: Pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                (
                    "clf",
                    RandomForestClassifier(
                        n_estimators=200,
                        max_depth=6,
                        random_state=42,
                        class_weight="balanced",
                    ),
                ),
            ]
        )

        self._label_to_idx: Dict[Action, int] = {"SELL": 0, "HOLD": 1, "BUY": 2}
        self._idx_to_label: Dict[int, Action] = {
            idx: label for label, idx in self._label_to_idx.items()
        }
        self._is_fitted: bool = False

    # -------------------- Training --------------------
    def fit_from_dataframe(self, df: pd.DataFrame) -> None:
        """Fit the model using a DataFrame with features + label column.

        Required columns: FEATURE_COLUMNS + LABEL_COLUMN.
        """

        missing = [
            c
            for c in (*FEATURE_COLUMNS, LABEL_COLUMN)
            if c not in df.columns
        ]
        if missing:
            raise ValueError(f"Missing columns in training data: {missing}")

        X = df[FEATURE_COLUMNS].values
        y = df[LABEL_COLUMN].map(self._label_to_idx).values

        if np.any(pd.isna(X)):
            raise ValueError("Training data contains NaN values in features.")
        if np.any(pd.isna(y)):
            raise ValueError("Training data contains invalid labels.")

        self.pipeline.fit(X, y)
        self._is_fitted = True

    # -------------------- Inference --------------------
    def _ensure_fitted(self) -> None:
        if not self._is_fitted:
            raise RuntimeError("StrategyModel is not fitted. Call fit_from_dataframe() first.")

    def predict_actions(self, df_features: pd.DataFrame) -> List[Action]:
        """Predict BUY/SELL/HOLD for each row in df_features.

        df_features must contain FEATURE_COLUMNS.
        """

        self._ensure_fitted()

        missing = [c for c in FEATURE_COLUMNS if c not in df_features.columns]
        if missing:
            raise ValueError(f"Missing feature columns for prediction: {missing}")

        X = df_features[FEATURE_COLUMNS].values
        y_pred_int = self.pipeline.predict(X)
        return [self._idx_to_label[int(i)] for i in y_pred_int]

    def predict_with_confidence(self, df_features: pd.DataFrame) -> List[Dict[str, object]]:
        """Predict actions with confidence scores (0-100%)."""

        self._ensure_fitted()

        X = df_features[FEATURE_COLUMNS].values
        proba = self.pipeline.predict_proba(X)
        y_pred_int = proba.argmax(axis=1)

        results: List[Dict[str, object]] = []
        for i, cls_idx in enumerate(y_pred_int):
            action: Action = self._idx_to_label[int(cls_idx)]
            confidence = float(proba[i, int(cls_idx)] * 100.0)
            results.append({"action": action, "confidence": round(confidence, 2)})
        return results


if __name__ == "__main__":
    # Minimal example using random data. Replace with real historical data.
    import pandas as pd

    rng = np.random.default_rng(42)
    n_samples = 100

    df_train = pd.DataFrame(
        {
            "rsi": rng.uniform(10, 90, n_samples),
            "macd": rng.normal(0, 1, n_samples),
            "macd_signal": rng.normal(0, 1, n_samples),
            "macd_hist": rng.normal(0, 1, n_samples),
            "ema12": rng.uniform(10, 100, n_samples),
            "ema26": rng.uniform(10, 100, n_samples),
            "sma20": rng.uniform(10, 100, n_samples),
            "sma50": rng.uniform(10, 100, n_samples),
            "bb_upper": rng.uniform(20, 120, n_samples),
            "bb_middle": rng.uniform(20, 120, n_samples),
            "bb_lower": rng.uniform(20, 120, n_samples),
            "price_change_24h": rng.normal(0, 5, n_samples),
            "price_change_pct_24h": rng.normal(0, 10, n_samples),
            "volume": rng.uniform(1e5, 1e7, n_samples),
        }
    )

    # Dummy labels: map RSI < 30 -> BUY, RSI > 70 -> SELL, otherwise HOLD
    def label_from_rsi(v: float) -> Action:
        if v < 30:
            return "BUY"
        if v > 70:
            return "SELL"
        return "HOLD"

    df_train[LABEL_COLUMN] = df_train["rsi"].apply(label_from_rsi)

    model = StrategyModel()
    model.fit_from_dataframe(df_train)

    # Fake "live" data: use a few rows from training features
    df_live = df_train[FEATURE_COLUMNS].iloc[:5].copy()
    results = model.predict_with_confidence(df_live)

    for idx, res in enumerate(results):
        print(f"Sample {idx}: action={res['action']}, confidence={res['confidence']}%")
