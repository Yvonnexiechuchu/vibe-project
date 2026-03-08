"""Data cleaning, loading & comprehensive analysis."""

import re
from collections import defaultdict

import numpy as np
import pandas as pd

# ──────────────────────────────────────────────
# Merchant normalization mappings
# ──────────────────────────────────────────────
MERCHANT_MAP = {
    "HEYTEA-US": "HEYTEA",
    "HEYTEA-US-": "HEYTEA",
    "TAOBAO408": "TAOBAO",
    "SWEATHOUZ RESTON": "SWEATHOUZ",
    "SWEATHOUZ RESTONSWTHZ": "SWEATHOUZ",
    "AMAZON MARK*": "AMAZON",
    "AMAZON MKTPL*": "AMAZON",
    "DD *DOORDASH": "DOORDASH",
    "AplPay H MART HERNDON LLC": "H MART",
    "AplPay WHOLEFDS RTC": "WHOLE FOODS",
    "AplPay GW SUPERMARKET": "GW SUPERMARKET",
    "AplPay TRADER JOE S": "TRADER JOE'S",
    "AplPay METRO WASHINGTON": "METRO WASHINGTON",
    "AplPay SMARTRIP": "SMARTRIP",
    "AplPay HARRIS TEETER": "HARRIS TEETER",
    "AplPay PARKMOBILE": "PARKMOBILE",
    "AplPay MAVERIK": "MAVERIK",
    "AplPay CHOPIN NOODLE": "CHOPIN NOODLE HOUSE",
    "AplPay SMITH'S": "SMITH'S",
    "AplPay RUBY'S INN": "RUBY'S INN",
    "AplPay TST*": "TST",
    "COX COMM SERVICE": "COX COMMUNICATIONS",
    "COLUMBIA GAS OF": "COLUMBIA GAS",
    "FORD MOTOR CR": "FORD MOTOR CREDIT",
    "GEICO AUTO": "GEICO",
    "ROUNDPOINT MTG": "ROUNDPOINT MORTGAGE",
    "HP *INSTANT INK": "HP INSTANT INK",
    "NETFLIX.COM": "NETFLIX",
    "APPLE.COM/BILL": "APPLE",
    "DISNEY PLUS": "DISNEY+",
    "CLASSPASS* MONTHLY": "CLASSPASS",
    "EZPASSVA AUTO REPLENISH": "EZPASS",
    "VISA USA INC PAYROLL": "VISA PAYROLL",
    "Dominion Energy Billpay": "DOMINION ENERGY",
    "COSTCO WHSE": "COSTCO",
    "SP ARRAE": "ARRAE",
    "SP DERMSTREET": "DERMSTREET",
    "SP TYR US": "TYR",
    "SP ZION NATIONAL": "ZION NATIONAL PARK",
    "The Bryson at Wo": "THE BRYSON (HOA)",
    "Zelle Payment To Cristy Clean": "CRISTY CLEAN",
    "Zelle Payment To Ziyu W": "ZELLE TO ZIYU W",
    "WORLD WILDLIFE FND": "WORLD WILDLIFE FUND",
    "WAL-MART SUPERCENTER": "WALMART",
    "PADDLE.NET* N8N": "N8N CLOUD",
    "UBER EATS": "UBER EATS",
    "Uber Trip": "UBER",
    "GRUBHUB*": "GRUBHUB",
    "AMEX Dining Credit": "AMEX DINING CREDIT",
    "SUNOCO": "SUNOCO",
    "TST* BB.Q": "BB.Q CHICKEN",
    "TST* HERNDON - TACO BAMBA": "TACO BAMBA",
    "TST*MALATOWN": "MALATOWN",
    "TST* STANS BURGER": "STAN'S BURGER SHACK",
    "SNACK* CHICHA SAN CHEN": "CHICHA SAN CHEN",
    "GLACIER LK MCDONALD": "GLACIER LAKE MCDONALD",
    "GLACIER MANY GLACIER": "GLACIER MANY GLACIER",
    "RECREATION.GOV": "RECREATION.GOV",
    "HERNDON-120 GARAGE": "HERNDON GARAGE",
    "CLAUDE MOORE REC": "CLAUDE MOORE REC CENTER",
    "WWW.SWEETGREEN.COM": "SWEETGREEN",
    "SWEETGREEN": "SWEETGREEN",
    "STUDEBAKERSUBINC": "STUDEBAKER SUB",
    "Audible*": "AUDIBLE",
    "Audible": "AUDIBLE",
    "BKOFAMERICA MOBILE": "BOA MOBILE DEPOSIT",
    "CL *Chase Travel": "CHASE TRAVEL CREDIT",
    "US TREAS TAX PYMT": "US TREASURY TAX",
    "CROSSFIT-HERNDON": "CROSSFIT HERNDON",
    "SPORTROCK": "SPORTROCK",
    "COLPARK": "COLONIAL PARKING",
    "GENERATIONS MEDICAL": "GENERATIONS MEDICAL AESTHETICS",
    "TED BRITT FORD": "TED BRITT FORD",
    "PRIMO BRANDS": "PRIMO WATER",
    "FANDANGO": "FANDANGO",
    "KERASTASE": "KERASTASE",
    "LOWES": "LOWE'S",
    "Net-A-Porter": "NET-A-PORTER",
    "PAYPAL *HMCEQUESTRI": "HMC EQUESTRIAN",
    "WILLIAMS-SONOMA": "WILLIAMS-SONOMA",
    "REI #84": "REI",
    "HONEST GRILL": "HONEST GRILL",
    "TAIWAN DELI": "TAIWAN DELI",
    "CAVA CHANTILLY": "CAVA",
    "POPEYES": "POPEYES",
    "NALAK THAI": "NALAK THAI",
    "GAIMA RICE BOWL": "GAIMA RICE BOWL",
    "NAI BROTHER": "NAI BROTHER SUANCAI",
    "GOOGLE *GOOGLE ONE": "GOOGLE ONE",
    "TOSOKCHON": "TOSOKCHON",
    "AMERICAN EXPRESS CASH": "AMEX CASH REBATE",
    "Graff Diamonds": "GRAFF DIAMONDS",
}

PAYMENT_METHOD_MAP = {
    "BANK OF AMERICA-0697": "BANKOFAMERICA-0697",
}

# ──────────────────────────────────────────────
# Category corrections
# ──────────────────────────────────────────────
CATEGORY_FIXES = {
    "DOORDASH": "RESTAURANT & QSR",
    "SWEATHOUZ": "ENTERTAINMENT",
    "EZPASS": "TRAVEL",
    "METRO WASHINGTON": "TRAVEL",
    "CLASSPASS": "ENTERTAINMENT",
    "CLAUDE MOORE REC CENTER": "ENTERTAINMENT",
    "CRISTY CLEAN": "RETAIL SERVICES OR GOODS",
}

REPORT_CATEGORY_FIXES = {
    "CRISTY CLEAN": "Housing: Cleaning",
    "SWEATHOUZ": "Fitness",
    "THE BRYSON (HOA)": "Housing: Mortgage/Rent",
}

# Swimming class gets "Fitness" report category
REPORT_CATEGORY_MERCHANT_CONTAINS = {
    "swimming class": "Fitness",
}

# ──────────────────────────────────────────────
# Fixed vs discretionary classification
# ──────────────────────────────────────────────
FIXED_REPORT_CATEGORIES = {
    "Housing: Mortgage/Rent",
    "Housing: Utilities",
    "Housing: Cleaning",
    "Insurance",
    "Transportation: Auto",
    "Subscriptions & Memberships",
    "Taxes & Government Fees",
}

# ──────────────────────────────────────────────
# Data Cleaning Functions
# ──────────────────────────────────────────────

def normalize_merchants(df):
    """Map merchant name variants to canonical names. Also normalizes payment methods."""
    cleaning_log = []
    normalized = df["Merchant Name"].copy()

    for i, name in enumerate(df["Merchant Name"]):
        original = name
        matched = False
        for prefix, canonical in MERCHANT_MAP.items():
            if name.upper().startswith(prefix.upper()) or name.startswith(prefix):
                normalized.iloc[i] = canonical
                if original != canonical:
                    cleaning_log.append(f"Merchant: '{original}' → '{canonical}'")
                matched = True
                break
        if not matched:
            # Keep original but strip extra whitespace
            normalized.iloc[i] = name.strip()

    df["merchant_normalized"] = normalized

    # Normalize payment methods
    pm_log = []
    df["payment_normalized"] = df["Payment Method"].replace(PAYMENT_METHOD_MAP)
    for old, new in PAYMENT_METHOD_MAP.items():
        mask = df["Payment Method"] == old
        if mask.any():
            pm_log.append(f"Payment: '{old}' → '{new}'")

    return df, cleaning_log + pm_log


def fix_categories(df):
    """Correct Category and Report Category independently."""
    cleaning_log = []

    for merchant, correct_cat in CATEGORY_FIXES.items():
        mask = df["merchant_normalized"] == merchant
        wrong = mask & (df["Category"] != correct_cat)
        if wrong.any():
            old_vals = df.loc[wrong, "Category"].unique()
            df.loc[mask, "Category"] = correct_cat
            for ov in old_vals:
                cleaning_log.append(f"Category fix: {merchant} '{ov}' → '{correct_cat}'")

    for merchant, correct_rc in REPORT_CATEGORY_FIXES.items():
        mask = df["merchant_normalized"] == merchant
        wrong = mask & (df["Report Category"] != correct_rc)
        if wrong.any():
            old_vals = df.loc[wrong, "Report Category"].unique()
            df.loc[mask, "Report Category"] = correct_rc
            for ov in old_vals:
                cleaning_log.append(f"Report Category fix: {merchant} '{ov}' → '{correct_rc}'")

    # Contains-based fixes
    for substr, correct_rc in REPORT_CATEGORY_MERCHANT_CONTAINS.items():
        mask = df["Merchant Name"].str.contains(substr, case=False, na=False)
        wrong = mask & (df["Report Category"] != correct_rc)
        if wrong.any():
            old_vals = df.loc[wrong, "Report Category"].unique()
            df.loc[mask, "Report Category"] = correct_rc
            for ov in old_vals:
                cleaning_log.append(f"Report Category fix: '{substr}' '{ov}' → '{correct_rc}'")

    return df, cleaning_log


def identify_refund_pairs(df):
    """Match expense+refund pairs for same merchant with opposite-sign amounts."""
    df["is_refund_pair"] = False
    df["net_amount"] = df["Transaction Amount"]
    cleaning_log = []

    # Group by normalized merchant
    for merchant, group in df.groupby("merchant_normalized"):
        expenses = group[group["Transaction Amount"] < 0]
        credits = group[group["Transaction Amount"] > 0]

        if credits.empty or expenses.empty:
            continue

        for _, credit in credits.iterrows():
            credit_amt = credit["Transaction Amount"]
            credit_date = credit["Transaction Date"]

            # Find matching expense (exact or close amount, within 30 days)
            for idx, expense in expenses.iterrows():
                expense_amt = expense["Transaction Amount"]
                date_diff = abs((credit_date - expense["Transaction Date"]).days)

                if date_diff <= 30 and abs(credit_amt + expense_amt) < abs(expense_amt):
                    # This is a partial or full refund
                    df.loc[credit.name, "is_refund_pair"] = True
                    df.loc[idx, "is_refund_pair"] = True
                    net = expense_amt + credit_amt
                    df.loc[idx, "net_amount"] = net
                    df.loc[credit.name, "net_amount"] = 0
                    cleaning_log.append(
                        f"Refund pair: {merchant} ${expense_amt:.2f} + ${credit_amt:.2f} = net ${net:.2f}"
                    )
                    break

    return df, cleaning_log


def identify_shared_expenses(df):
    """Detect Venmo/Zelle reimbursements linked to expenses."""
    df["is_shared"] = False
    df["personal_cost"] = df["Transaction Amount"]
    cleaning_log = []

    # Known shared expense patterns
    shared_patterns = [
        # (expense merchant keyword, reimbursement merchant keyword, description)
        ("NALAK THAI", "Thai food", "Nalak Thai dinner split"),
        ("ATT PAYMENT", "ATT", "ATT shared plan"),
        ("ATT PAYMENT", "att credit", "ATT credit"),
    ]

    for exp_kw, reimb_kw, desc in shared_patterns:
        exp_mask = df["merchant_normalized"].str.contains(exp_kw, case=False, na=False) | \
                   df["Merchant Name"].str.contains(exp_kw, case=False, na=False)
        expenses = df[exp_mask & (df["Transaction Amount"] < 0)]

        reimb_mask = df["Merchant Name"].str.contains(reimb_kw, case=False, na=False)
        reimbursements = df[reimb_mask & (df["Transaction Amount"] > 0)]

        if expenses.empty or reimbursements.empty:
            continue

        for _, expense in expenses.iterrows():
            exp_date = expense["Transaction Date"]
            total_reimb = 0

            for _, reimb in reimbursements.iterrows():
                date_diff = abs((reimb["Transaction Date"] - exp_date).days)
                if date_diff <= 30:
                    total_reimb += reimb["Transaction Amount"]
                    df.loc[reimb.name, "is_shared"] = True
                    df.loc[reimb.name, "personal_cost"] = 0

            if total_reimb > 0:
                personal = expense["Transaction Amount"] + total_reimb
                df.loc[expense.name, "is_shared"] = True
                df.loc[expense.name, "personal_cost"] = personal
                cleaning_log.append(
                    f"Shared: {desc} ${expense['Transaction Amount']:.2f} + reimbursed ${total_reimb:.2f} = personal ${personal:.2f}"
                )

    # Also flag Kajiken dinner Venmo as shared reimbursement
    kajiken_mask = df["Merchant Name"].str.contains("Kajiken", case=False, na=False)
    if kajiken_mask.any():
        df.loc[kajiken_mask, "is_shared"] = True
        df.loc[kajiken_mask, "personal_cost"] = 0
        for _, row in df[kajiken_mask].iterrows():
            cleaning_log.append(f"Shared: Kajiken dinner reimbursement ${row['Transaction Amount']:.2f}")

    return df, cleaning_log


def flag_outliers(df):
    """Flag transactions >3x the category median as outliers."""
    df["is_outlier"] = False
    expenses = df[df["Transaction Amount"] < 0].copy()

    for cat, group in expenses.groupby("Category"):
        median = group["Transaction Amount"].abs().median()
        if median > 0:
            outlier_mask = group["Transaction Amount"].abs() > 3 * median
            outlier_indices = group[outlier_mask].index
            df.loc[outlier_indices, "is_outlier"] = True

    # Also explicitly flag known outliers
    known_outliers = ["GRAFF DIAMONDS", "ZELLE TO ZIYU W"]
    for name in known_outliers:
        mask = df["merchant_normalized"] == name
        df.loc[mask, "is_outlier"] = True

    return df


def generate_cleaning_summary(df, cleaning_log):
    """Produce a structured summary of all data cleaning actions."""
    merchant_norms = [l for l in cleaning_log if l.startswith("Merchant:")]
    payment_norms = [l for l in cleaning_log if l.startswith("Payment:")]
    cat_fixes = [l for l in cleaning_log if l.startswith("Category fix:")]
    rc_fixes = [l for l in cleaning_log if l.startswith("Report Category fix:")]
    refund_pairs = [l for l in cleaning_log if l.startswith("Refund pair:")]
    shared = [l for l in cleaning_log if l.startswith("Shared:")]
    outliers = df[df["is_outlier"]]

    summary = {
        "merchant_normalizations": merchant_norms,
        "payment_normalizations": payment_norms,
        "category_corrections": cat_fixes,
        "report_category_corrections": rc_fixes,
        "refund_pairs": refund_pairs,
        "shared_expenses": shared,
        "outliers_flagged": len(outliers),
        "outlier_details": [
            f"{row['merchant_normalized']}: ${row['Transaction Amount']:,.2f} on {row['Transaction Date'].strftime('%Y-%m-%d')}"
            for _, row in outliers.iterrows()
        ],
        "total_actions": len(cleaning_log) + len(outliers),
    }
    return summary


# ──────────────────────────────────────────────
# Main Load & Clean
# ──────────────────────────────────────────────

def load_and_clean(df_raw):
    """Parse dates, run all cleaning functions, add computed columns."""
    df = df_raw.copy()
    df["Transaction Date"] = pd.to_datetime(df["Transaction Date"])
    df["Transaction Amount"] = pd.to_numeric(df["Transaction Amount"], errors="coerce")

    cleaning_log = []

    df, log1 = normalize_merchants(df)
    cleaning_log.extend(log1)

    df, log2 = fix_categories(df)
    cleaning_log.extend(log2)

    df, log3 = identify_refund_pairs(df)
    cleaning_log.extend(log3)

    df, log4 = identify_shared_expenses(df)
    cleaning_log.extend(log4)

    df = flag_outliers(df)

    # Add computed columns
    df["abs_amount"] = df["Transaction Amount"].abs()
    df["week"] = df["Transaction Date"].dt.to_period("W").apply(lambda r: r.start_time)
    df["month"] = df["Transaction Date"].dt.to_period("M").apply(lambda r: r.start_time)
    df["quarter"] = df["Transaction Date"].dt.to_period("Q").apply(lambda r: r.start_time)
    df["day_of_week"] = df["Transaction Date"].dt.day_name()
    df["is_weekend"] = df["Transaction Date"].dt.dayofweek >= 5

    summary = generate_cleaning_summary(df, cleaning_log)

    return df, summary, cleaning_log


# ──────────────────────────────────────────────
# Analysis Functions
# ──────────────────────────────────────────────

def total_income_and_spend(df):
    """Total income vs total expenses, with net. Both raw and adjusted."""
    income = df[df["Transaction Amount"] > 0]["Transaction Amount"].sum()
    expenses = df[df["Transaction Amount"] < 0]["Transaction Amount"].sum()
    net = income + expenses

    # Adjusted: use personal_cost for shared, net_amount for refund pairs
    adj_expenses = df[df["Transaction Amount"] < 0]["personal_cost"].sum()
    # For refund pairs where net_amount is set, use that instead
    refund_mask = df["is_refund_pair"] & (df["Transaction Amount"] < 0)
    if refund_mask.any():
        adj_expenses = adj_expenses - df.loc[refund_mask, "personal_cost"].sum() + df.loc[refund_mask, "net_amount"].sum()

    adj_net = income + adj_expenses

    return {
        "total_income": income,
        "total_expenses": expenses,
        "net": net,
        "adjusted_expenses": adj_expenses,
        "adjusted_net": adj_net,
        "transaction_count": len(df),
        "date_range_start": df["Transaction Date"].min().strftime("%Y-%m-%d"),
        "date_range_end": df["Transaction Date"].max().strftime("%Y-%m-%d"),
    }


def income_sources(df):
    """Breakdown of ALL income sources."""
    income = df[df["Transaction Amount"] > 0].copy()
    result = income.groupby("merchant_normalized").agg(
        total=("Transaction Amount", "sum"),
        count=("Transaction Amount", "count"),
    ).sort_values("total", ascending=False).reset_index()
    result.columns = ["Source", "Total", "Count"]
    return result


def all_categories(df):
    """Spending totals for ALL categories and report subcategories."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()

    by_category = expenses.groupby("Category").agg(
        total=("Transaction Amount", "sum"),
        count=("Transaction Amount", "count"),
    ).sort_values("total").reset_index()
    by_category["total"] = by_category["total"].abs()
    by_category.columns = ["Category", "Total", "Count"]

    by_report = expenses.groupby("Report Category").agg(
        total=("Transaction Amount", "sum"),
        count=("Transaction Amount", "count"),
    ).sort_values("total").reset_index()
    by_report["total"] = by_report["total"].abs()
    by_report.columns = ["Report Category", "Total", "Count"]

    return {"by_category": by_category, "by_report_category": by_report}


def all_merchants(df):
    """Spending totals for ALL merchants (using normalized names)."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()
    result = expenses.groupby("merchant_normalized").agg(
        total=("Transaction Amount", "sum"),
        count=("Transaction Amount", "count"),
    ).sort_values("total").reset_index()
    result["total"] = result["total"].abs()
    result.columns = ["Merchant", "Total", "Count"]
    return result


def time_breakdown(df, period="month"):
    """Per-period totals with category breakdown."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()
    col = period  # 'week', 'month', or 'quarter'

    overall = expenses.groupby(col)["Transaction Amount"].sum().abs().reset_index()
    overall.columns = ["Period", "Total"]
    overall["Period"] = overall["Period"].astype(str)

    by_cat = expenses.groupby([col, "Report Category"])["Transaction Amount"].sum().abs().reset_index()
    by_cat.columns = ["Period", "Category", "Total"]
    by_cat["Period"] = by_cat["Period"].astype(str)

    return {"overall": overall, "by_category": by_cat}


def recurring_expenses(df):
    """Recurring merchants appearing in 2+ months."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()
    expenses["month_str"] = expenses["month"].astype(str)

    merchant_months = expenses.groupby("merchant_normalized").agg(
        months=("month_str", "nunique"),
        total=("Transaction Amount", "sum"),
        count=("Transaction Amount", "count"),
        avg=("Transaction Amount", "mean"),
    ).reset_index()

    recurring = merchant_months[merchant_months["months"] >= 2].copy()
    recurring["total"] = recurring["total"].abs()
    recurring["avg"] = recurring["avg"].abs()
    recurring.columns = ["Merchant", "Months", "Total", "Count", "Monthly Avg"]
    recurring = recurring.sort_values("Total", ascending=False)
    return recurring


def spending_trends(df, period="month"):
    """Period-over-period $ and % change."""
    tb = time_breakdown(df, period)
    overall = tb["overall"].copy()

    if len(overall) > 1:
        overall["Change ($)"] = overall["Total"].diff()
        overall["Change (%)"] = overall["Total"].pct_change() * 100
    else:
        overall["Change ($)"] = 0
        overall["Change (%)"] = 0

    return overall


def new_spending(df):
    """Merchants/categories first appearing in the latest month."""
    if df.empty:
        return pd.DataFrame()

    latest_month = df["month"].max()
    earlier = df[df["month"] < latest_month]
    latest = df[df["month"] == latest_month]

    new_merchants = set(latest["merchant_normalized"]) - set(earlier["merchant_normalized"])
    new_df = latest[latest["merchant_normalized"].isin(new_merchants) & (latest["Transaction Amount"] < 0)]

    return new_df[["merchant_normalized", "Transaction Amount", "Transaction Date", "Report Category"]].sort_values(
        "Transaction Amount"
    )


def payment_method_breakdown(df):
    """Spending per payment method (normalized)."""
    expenses = df[df["Transaction Amount"] < 0].copy()
    result = expenses.groupby("payment_normalized")["Transaction Amount"].sum().abs().reset_index()
    result.columns = ["Payment Method", "Total"]
    result = result.sort_values("Total", ascending=False)
    return result


# ──────────────────────────────────────────────
# Behavioral & Hidden-Clue Analysis
# ──────────────────────────────────────────────

def weekday_vs_weekend(df):
    """Compare spending patterns: weekday vs weekend by category."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()

    result = expenses.groupby(["is_weekend", "Report Category"])["Transaction Amount"].agg(
        ["sum", "count"]
    ).reset_index()
    result["sum"] = result["sum"].abs()
    result["is_weekend"] = result["is_weekend"].map({True: "Weekend", False: "Weekday"})
    result.columns = ["Day Type", "Category", "Total", "Count"]
    return result


def spending_velocity(df):
    """Track average daily spend rate per week."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()
    daily = expenses.groupby("Transaction Date")["Transaction Amount"].sum().abs().reset_index()
    daily.columns = ["Date", "Daily Spend"]
    daily["Week"] = pd.to_datetime(daily["Date"]).dt.to_period("W").apply(lambda r: r.start_time)
    weekly_avg = daily.groupby("Week")["Daily Spend"].mean().reset_index()
    weekly_avg.columns = ["Week", "Avg Daily Spend"]
    weekly_avg["Week"] = weekly_avg["Week"].astype(str)
    return weekly_avg


def impulse_detection(df):
    """Flag days with 3+ discretionary purchases."""
    discretionary_cats = {
        "Dining Out", "Coffee & Tea", "Discretionary Shopping",
        "Entertainment & Activities", "Personal Care",
    }
    disc = df[
        (df["Transaction Amount"] < 0)
        & (df["Report Category"].isin(discretionary_cats))
        & (~df["is_outlier"])
    ].copy()

    daily_counts = disc.groupby("Transaction Date").agg(
        count=("Transaction Amount", "count"),
        total=("Transaction Amount", "sum"),
        merchants=("merchant_normalized", lambda x: ", ".join(x.unique())),
    ).reset_index()
    daily_counts["total"] = daily_counts["total"].abs()

    impulse_days = daily_counts[daily_counts["count"] >= 3]
    return impulse_days


def latte_factor(df):
    """Aggregate small recurring expenses (<$20) that compound."""
    small = df[
        (df["Transaction Amount"] < 0)
        & (df["abs_amount"] < 20)
        & (~df["is_outlier"])
    ].copy()

    by_merchant = small.groupby("merchant_normalized").agg(
        total=("Transaction Amount", "sum"),
        count=("Transaction Amount", "count"),
        months=("month", "nunique"),
    ).reset_index()
    by_merchant["total"] = by_merchant["total"].abs()
    by_merchant["monthly_avg"] = by_merchant["total"] / by_merchant["months"]
    by_merchant["annualized"] = by_merchant["monthly_avg"] * 12
    by_merchant = by_merchant.sort_values("total", ascending=False)
    by_merchant.columns = ["Merchant", "Total", "Count", "Months", "Monthly Avg", "Annualized"]

    return by_merchant


def subscription_creep(df):
    """Track total subscription cost per month."""
    subs = df[
        (df["Report Category"] == "Subscriptions & Memberships")
        & (df["Transaction Amount"] < 0)
    ].copy()

    monthly = subs.groupby("month")["Transaction Amount"].sum().abs().reset_index()
    monthly.columns = ["Month", "Subscription Total"]
    monthly["Month"] = monthly["Month"].astype(str)
    return monthly


def lifestyle_inflation(df):
    """Compare average transaction size per category across months."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()

    result = expenses.groupby(["month", "Report Category"])["Transaction Amount"].mean().abs().reset_index()
    result.columns = ["Month", "Category", "Avg Transaction"]
    result["Month"] = result["Month"].astype(str)
    return result


def fixed_vs_discretionary(df):
    """Classify expenses as fixed vs discretionary."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()

    expenses["expense_type"] = expenses["Report Category"].apply(
        lambda x: "Fixed" if x in FIXED_REPORT_CATEGORIES else "Discretionary"
    )

    summary = expenses.groupby("expense_type")["Transaction Amount"].sum().abs().reset_index()
    summary.columns = ["Type", "Total"]
    total = summary["Total"].sum()
    summary["Percentage"] = (summary["Total"] / total * 100).round(1) if total > 0 else 0

    detail = expenses.groupby(["expense_type", "Report Category"])["Transaction Amount"].sum().abs().reset_index()
    detail.columns = ["Type", "Category", "Total"]
    detail = detail.sort_values(["Type", "Total"], ascending=[True, False])

    return {"summary": summary, "detail": detail}


def category_correlation(df):
    """Detect if dining out and grocery spending are inversely correlated."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()

    monthly_cats = expenses.pivot_table(
        index="month", columns="Report Category",
        values="Transaction Amount", aggfunc="sum"
    ).abs()

    correlations = {}
    if "Dining Out" in monthly_cats.columns and "Groceries" in monthly_cats.columns:
        corr = monthly_cats["Dining Out"].corr(monthly_cats["Groceries"])
        correlations["Dining Out vs Groceries"] = round(corr, 3) if not pd.isna(corr) else None

    return correlations


def travel_clustering(df):
    """Detect travel periods and cluster travel-related spending."""
    travel_keywords = [
        "LAS VEGAS", "UTAH", "BRYCE", "ZION", "HURRICANE",
        "GLACIER", "HANKSVILLE", "MALATOWN",
    ]

    travel_cats = {"Travel: Lodging", "Travel: Other", "Transportation: Other"}

    travel_mask = (
        df["Merchant Name"].str.upper().apply(
            lambda x: any(kw in str(x).upper() for kw in travel_keywords)
        )
        | df["Report Category"].isin(travel_cats)
    ) & (df["Transaction Amount"] < 0)

    travel_df = df[travel_mask].copy()
    if travel_df.empty:
        return []

    # Cluster by date proximity (within 3 days = same trip)
    travel_df = travel_df.sort_values("Transaction Date")
    trips = []
    current_trip = []

    for _, row in travel_df.iterrows():
        if not current_trip:
            current_trip = [row]
        else:
            last_date = current_trip[-1]["Transaction Date"]
            if (row["Transaction Date"] - last_date).days <= 3:
                current_trip.append(row)
            else:
                trips.append(current_trip)
                current_trip = [row]
    if current_trip:
        trips.append(current_trip)

    trip_summaries = []
    for trip in trips:
        trip_df = pd.DataFrame(trip)
        total = trip_df["Transaction Amount"].sum()
        merchants = trip_df["merchant_normalized"].unique().tolist()
        start = trip_df["Transaction Date"].min().strftime("%Y-%m-%d")
        end = trip_df["Transaction Date"].max().strftime("%Y-%m-%d")

        # Try to name the trip by location keywords
        all_merchants = " ".join(trip_df["Merchant Name"].tolist()).upper()
        location = "Unknown"
        for kw in travel_keywords:
            if kw in all_merchants:
                location = kw.title()
                break

        trip_summaries.append({
            "location": location,
            "dates": f"{start} to {end}" if start != end else start,
            "total_cost": abs(total),
            "transaction_count": len(trip_df),
            "merchants": merchants,
        })

    return trip_summaries


def spending_persona(df):
    """Generate a one-line persona label based on spending patterns."""
    expenses = df[(df["Transaction Amount"] < 0) & (~df["is_outlier"])].copy()
    cat_totals = expenses.groupby("Report Category")["Transaction Amount"].sum().abs().sort_values(ascending=False)

    top_cats = cat_totals.head(5).index.tolist()

    persona_map = {
        "Fitness": "健身达人",
        "Dining Out": "美食探索者",
        "Groceries": "居家烹饪爱好者",
        "Discretionary Shopping": "购物狂人",
        "Coffee & Tea": "咖啡/奶茶星人",
        "Travel: Lodging": "旅行爱好者",
        "Travel: Other": "旅行爱好者",
        "Transportation: Other": "城市漫游者",
        "Subscriptions & Memberships": "数字生活家",
        "Entertainment & Activities": "娱乐达人",
        "Personal Care": "精致生活家",
        "Housing: Mortgage/Rent": "房产投资者",
    }

    labels = []
    for cat in top_cats[:3]:
        if cat in persona_map:
            labels.append(persona_map[cat])

    if not labels:
        labels = ["理性消费者"]

    return " x ".join(labels)


# ──────────────────────────────────────────────
# Full Context for Claude Agent
# ──────────────────────────────────────────────

def generate_full_context(df):
    """Combine ALL analysis into comprehensive text report for the Claude agent."""
    lines = []

    # KPIs
    kpis = total_income_and_spend(df)
    lines.append("=== INCOME & EXPENSES SUMMARY ===")
    lines.append(f"Date range: {kpis['date_range_start']} to {kpis['date_range_end']}")
    lines.append(f"Transaction count: {kpis['transaction_count']}")
    lines.append(f"Total income: ${kpis['total_income']:,.2f}")
    lines.append(f"Total expenses: ${kpis['total_expenses']:,.2f}")
    lines.append(f"Net: ${kpis['net']:,.2f}")
    lines.append(f"Adjusted expenses (after splits/refunds): ${kpis['adjusted_expenses']:,.2f}")
    lines.append(f"Adjusted net: ${kpis['adjusted_net']:,.2f}")

    # Income sources
    lines.append("\n=== INCOME SOURCES ===")
    inc = income_sources(df)
    for _, row in inc.iterrows():
        lines.append(f"  {row['Source']}: ${row['Total']:,.2f} ({row['Count']} transactions)")

    # Categories
    cats = all_categories(df)
    lines.append("\n=== SPENDING BY CATEGORY ===")
    for _, row in cats["by_category"].iterrows():
        lines.append(f"  {row['Category']}: ${row['Total']:,.2f} ({row['Count']} txns)")

    lines.append("\n=== SPENDING BY REPORT CATEGORY ===")
    for _, row in cats["by_report_category"].iterrows():
        lines.append(f"  {row['Report Category']}: ${row['Total']:,.2f} ({row['Count']} txns)")

    # Top merchants
    merch = all_merchants(df)
    lines.append("\n=== TOP MERCHANTS (by spend) ===")
    for _, row in merch.head(20).iterrows():
        lines.append(f"  {row['Merchant']}: ${row['Total']:,.2f} ({row['Count']} txns)")

    # Recurring
    rec = recurring_expenses(df)
    lines.append("\n=== RECURRING EXPENSES (2+ months) ===")
    for _, row in rec.iterrows():
        lines.append(f"  {row['Merchant']}: ${row['Total']:,.2f} total, ${row['Monthly Avg']:,.2f}/mo avg, {row['Months']} months")

    # Trends
    trends = spending_trends(df, "month")
    lines.append("\n=== MONTHLY SPENDING TRENDS ===")
    for _, row in trends.iterrows():
        change_str = ""
        if pd.notna(row.get("Change ($)")) and row.get("Change ($)") != 0:
            change_str = f" (change: ${row['Change ($)']:+,.2f}, {row['Change (%)']:+.1f}%)"
        lines.append(f"  {row['Period']}: ${row['Total']:,.2f}{change_str}")

    # Fixed vs discretionary
    fvd = fixed_vs_discretionary(df)
    lines.append("\n=== FIXED vs DISCRETIONARY ===")
    for _, row in fvd["summary"].iterrows():
        lines.append(f"  {row['Type']}: ${row['Total']:,.2f} ({row['Percentage']}%)")

    # Weekday vs weekend
    wvw = weekday_vs_weekend(df)
    lines.append("\n=== WEEKDAY vs WEEKEND SPENDING ===")
    for day_type in ["Weekday", "Weekend"]:
        subset = wvw[wvw["Day Type"] == day_type].sort_values("Total", ascending=False)
        lines.append(f"  {day_type}:")
        for _, row in subset.head(5).iterrows():
            lines.append(f"    {row['Category']}: ${row['Total']:,.2f} ({row['Count']} txns)")

    # Latte factor
    lf = latte_factor(df)
    lines.append("\n=== LATTE FACTOR (small recurring <$20) ===")
    total_latte = lf["Total"].sum()
    lines.append(f"  Total: ${total_latte:,.2f}")
    for _, row in lf.head(10).iterrows():
        lines.append(f"  {row['Merchant']}: ${row['Total']:,.2f} ({row['Count']} txns, ~${row['Annualized']:,.0f}/yr)")

    # Subscription creep
    sc = subscription_creep(df)
    lines.append("\n=== SUBSCRIPTION COSTS BY MONTH ===")
    for _, row in sc.iterrows():
        lines.append(f"  {row['Month']}: ${row['Subscription Total']:,.2f}")

    # Travel
    trips = travel_clustering(df)
    if trips:
        lines.append("\n=== TRAVEL SPENDING ===")
        for trip in trips:
            lines.append(f"  {trip['location']} ({trip['dates']}): ${trip['total_cost']:,.2f} ({trip['transaction_count']} txns)")
            lines.append(f"    Merchants: {', '.join(trip['merchants'])}")

    # Correlations
    corr = category_correlation(df)
    if corr:
        lines.append("\n=== CATEGORY CORRELATIONS ===")
        for pair, val in corr.items():
            direction = "positive" if val and val > 0 else "negative (substitution)"
            lines.append(f"  {pair}: {val} ({direction})")

    # Impulse
    impulse = impulse_detection(df)
    if not impulse.empty:
        lines.append("\n=== IMPULSE SPENDING DAYS (3+ discretionary purchases) ===")
        for _, row in impulse.iterrows():
            lines.append(f"  {row['Transaction Date'].strftime('%Y-%m-%d')}: {row['count']} purchases, ${row['total']:,.2f} ({row['merchants']})")

    # Spending velocity
    sv = spending_velocity(df)
    lines.append("\n=== SPENDING VELOCITY (avg daily spend per week) ===")
    for _, row in sv.iterrows():
        lines.append(f"  {row['Week']}: ${row['Avg Daily Spend']:,.2f}/day")

    # Persona
    persona = spending_persona(df)
    lines.append(f"\n=== SPENDING PERSONA ===\n  {persona}")

    # Shared expenses detail
    shared = df[df["is_shared"]].copy()
    if not shared.empty:
        lines.append("\n=== SHARED EXPENSES DETAIL ===")
        for _, row in shared.iterrows():
            lines.append(
                f"  {row['Transaction Date'].strftime('%Y-%m-%d')} {row['merchant_normalized']}: "
                f"${row['Transaction Amount']:,.2f} → personal cost: ${row['personal_cost']:,.2f}"
            )

    # Outliers
    outliers = df[df["is_outlier"]]
    if not outliers.empty:
        lines.append("\n=== OUTLIER TRANSACTIONS ===")
        for _, row in outliers.iterrows():
            lines.append(
                f"  {row['Transaction Date'].strftime('%Y-%m-%d')} {row['merchant_normalized']}: ${row['Transaction Amount']:,.2f}"
            )

    # Payment methods
    pm = payment_method_breakdown(df)
    lines.append("\n=== PAYMENT METHOD BREAKDOWN ===")
    for _, row in pm.iterrows():
        lines.append(f"  {row['Payment Method']}: ${row['Total']:,.2f}")

    return "\n".join(lines)
