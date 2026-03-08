"""Export analysis results as JSON files for the Next.js dashboard."""

import json
import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv

from analysis import (
    all_categories,
    all_merchants,
    category_correlation,
    fixed_vs_discretionary,
    generate_full_context,
    impulse_detection,
    income_sources,
    latte_factor,
    lifestyle_inflation,
    load_and_clean,
    new_spending,
    payment_method_breakdown,
    recurring_expenses,
    spending_persona,
    spending_trends,
    spending_velocity,
    subscription_creep,
    time_breakdown,
    total_income_and_spend,
    travel_clustering,
    weekday_vs_weekend,
)
from google_sheets import fetch_from_google_sheets

load_dotenv()

OUTPUT_DIR = Path(__file__).parent / "public" / "data"


def df_to_records(df):
    """Convert DataFrame to list of dicts, handling Timestamps."""
    records = df.copy()
    for col in records.columns:
        if pd.api.types.is_datetime64_any_dtype(records[col]):
            records[col] = records[col].dt.strftime("%Y-%m-%d")
    return records.to_dict(orient="records")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Fetch raw data
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    creds_path = Path(__file__).parent / "credentials.json"
    df_raw, source = fetch_from_google_sheets(sheet_id, str(creds_path))
    print(f"Data source: {source} ({len(df_raw)} rows)")

    # Clean & enrich
    df, cleaning_summary, _ = load_and_clean(df_raw)
    print(f"Cleaned: {len(df)} transactions")

    # 1. Summary / KPIs
    summary = total_income_and_spend(df)
    summary["data_source"] = source
    summary["persona"] = spending_persona(df)
    write_json("summary.json", summary)

    # 2. Transactions (all cleaned, most recent first)
    txn_cols = [
        "Transaction Date", "merchant_normalized", "Transaction Amount",
        "Category", "Report Category", "payment_normalized",
        "is_outlier", "is_refund_pair", "is_shared", "personal_cost", "net_amount",
    ]
    txn_df = df[txn_cols].copy()
    txn_df = txn_df.sort_values("Transaction Date", ascending=False)
    write_json("transactions.json", df_to_records(txn_df))

    # 3. Categories
    cats = all_categories(df)
    write_json("categories.json", {
        "by_category": df_to_records(cats["by_category"]),
        "by_report_category": df_to_records(cats["by_report_category"]),
    })

    # 4. Merchants
    merch = all_merchants(df)
    write_json("merchants.json", df_to_records(merch))

    # 5. Trends (monthly spending + period-over-period change)
    trends = spending_trends(df, "month")
    tb = time_breakdown(df, "month")
    write_json("trends.json", {
        "overall": df_to_records(trends),
        "by_category": df_to_records(tb["by_category"]),
    })

    # 6. Recurring expenses
    rec = recurring_expenses(df)
    write_json("recurring.json", df_to_records(rec))

    # 7. Income sources
    inc = income_sources(df)
    write_json("income.json", df_to_records(inc))

    # 8. Shared expenses
    shared = df[df["is_shared"]].copy()
    shared_cols = [
        "Transaction Date", "merchant_normalized", "Merchant Name",
        "Transaction Amount", "personal_cost",
    ]
    write_json("shared.json", df_to_records(shared[shared_cols].sort_values("Transaction Date")))

    # 9. New spending (latest month)
    ns = new_spending(df)
    write_json("new_spending.json", df_to_records(ns) if not ns.empty else [])

    # 10. Payment methods
    pm = payment_method_breakdown(df)
    write_json("payment_methods.json", df_to_records(pm))

    # 11. Outliers
    outliers = df[df["is_outlier"]].copy()
    outlier_cols = [
        "Transaction Date", "merchant_normalized", "Transaction Amount",
        "Category", "Report Category",
    ]
    write_json("outliers.json", df_to_records(outliers[outlier_cols].sort_values("Transaction Amount")))

    # 12. Cleaning summary
    write_json("cleaning.json", cleaning_summary)

    # 13. Behavioral analysis
    fvd = fixed_vs_discretionary(df)
    behavioral = {
        "weekday_vs_weekend": df_to_records(weekday_vs_weekend(df)),
        "spending_velocity": df_to_records(spending_velocity(df)),
        "impulse_days": df_to_records(impulse_detection(df)),
        "latte_factor": df_to_records(latte_factor(df)),
        "subscription_creep": df_to_records(subscription_creep(df)),
        "lifestyle_inflation": df_to_records(lifestyle_inflation(df)),
        "fixed_vs_discretionary": {
            "summary": df_to_records(fvd["summary"]),
            "detail": df_to_records(fvd["detail"]),
        },
        "category_correlation": category_correlation(df),
        "travel_trips": travel_clustering(df),
    }
    write_json("behavioral.json", behavioral)

    # 14. Full text context for Claude Q&A
    context = generate_full_context(df)
    (OUTPUT_DIR / "context.txt").write_text(context, encoding="utf-8")
    print(f"Wrote context.txt ({len(context)} chars)")

    print(f"\nAll data exported to {OUTPUT_DIR}/")


def sanitize_for_json(obj):
    """Replace NaN/Infinity with None for valid JSON."""
    import math
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_for_json(v) for v in obj]
    return obj


def write_json(filename, data):
    path = OUTPUT_DIR / filename
    clean = sanitize_for_json(data)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(clean, f, ensure_ascii=False, default=str, indent=2)
    print(f"Wrote {filename}")


if __name__ == "__main__":
    main()
