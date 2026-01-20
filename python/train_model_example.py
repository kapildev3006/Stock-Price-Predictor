import numpy as np
import pandas as pd
import joblib

from strategy_model import StrategyModel, FEATURE_COLUMNS, LABEL_COLUMN


def main() -> None:
    rng = np.random.default_rng(42)
    n_samples = 500

    df = pd.DataFrame(
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

    def label_from_rsi(v: float) -> str:
        if v < 30:
            return "BUY"
        if v > 70:
            return "SELL"
        return "HOLD"

    df[LABEL_COLUMN] = df["rsi"].apply(label_from_rsi)

    model = StrategyModel()
    model.fit_from_dataframe(df)

    # Save into the python/ folder so strategy_api can find it next to itself
    joblib.dump(model, "python/strategy_model.joblib")
    print("Saved model to python/strategy_model.joblib")


if __name__ == "__main__":
    main()
