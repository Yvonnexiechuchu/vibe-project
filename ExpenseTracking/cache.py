"""Caching layer for intermediate results."""

import json
import os
from pathlib import Path

import pandas as pd

CACHE_DIR = Path(__file__).parent / "cache"


def _ensure_cache_dir():
    CACHE_DIR.mkdir(exist_ok=True)


def get_cache_state():
    """Read last_sync.json to get last processed timestamp and row count."""
    sync_file = CACHE_DIR / "last_sync.json"
    if not sync_file.exists():
        return None
    with open(sync_file, "r") as f:
        return json.load(f)


def is_cache_valid(new_row_count, new_latest_date):
    """Compare against cached state. If no new rows, reuse cached results."""
    state = get_cache_state()
    if state is None:
        return False
    return (
        state.get("row_count") == new_row_count
        and state.get("latest_date") == str(new_latest_date)
    )


def save_cache(cleaned_df, analysis_results):
    """Save cleaned DataFrame as parquet and analysis results as JSON."""
    _ensure_cache_dir()
    cleaned_df.to_csv(CACHE_DIR / "cleaned_transactions.csv", index=False)

    with open(CACHE_DIR / "analysis_results.json", "w") as f:
        json.dump(analysis_results, f, default=str, ensure_ascii=False)

    sync_state = {
        "row_count": len(cleaned_df),
        "latest_date": str(cleaned_df["Transaction Date"].max()),
    }
    with open(CACHE_DIR / "last_sync.json", "w") as f:
        json.dump(sync_state, f)


def load_cache():
    """Load cached cleaned DataFrame and analysis results."""
    cleaned_df = pd.read_csv(CACHE_DIR / "cleaned_transactions.csv", parse_dates=["Transaction Date"])

    with open(CACHE_DIR / "analysis_results.json", "r") as f:
        analysis_results = json.load(f)

    return cleaned_df, analysis_results
