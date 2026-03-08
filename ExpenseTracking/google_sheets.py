"""Google Sheets connection & data fetch with CSV fallback."""

import os
from io import StringIO
from pathlib import Path
from urllib.request import urlopen

import pandas as pd

CSV_PATH = Path(__file__).parent / "Finance Meta Data - Transactions.csv"


def fetch_from_google_sheets(sheet_id=None, credentials_path=None):
    """Fetch data from Google Sheets (public or via Service Account).

    Tries in order:
    1. Public CSV export (if sheet is published/shared publicly)
    2. Service Account API (if credentials.json exists)
    3. Local CSV fallback

    Returns (df, source) where source is 'google_sheets' or 'csv'.
    """
    # Method 1: Public CSV export (no auth needed)
    if sheet_id:
        try:
            url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv"
            response = urlopen(url, timeout=10)
            csv_text = response.read().decode("utf-8")
            df = pd.read_csv(StringIO(csv_text))
            print(f"Fetched {len(df)} rows from Google Sheets (public CSV)")
            return df, "google_sheets"
        except Exception as e:
            print(f"Public Google Sheets fetch failed: {e}")

    # Method 2: Service Account API
    if sheet_id and credentials_path and Path(credentials_path).exists():
        try:
            import gspread
            from google.oauth2.service_account import Credentials

            scopes = [
                "https://www.googleapis.com/auth/spreadsheets.readonly",
                "https://www.googleapis.com/auth/drive.readonly",
            ]
            creds = Credentials.from_service_account_file(credentials_path, scopes=scopes)
            client = gspread.authorize(creds)
            spreadsheet = client.open_by_key(sheet_id)
            worksheet = spreadsheet.sheet1
            data = worksheet.get_all_records()
            df = pd.DataFrame(data)
            return df, "google_sheets"
        except Exception as e:
            print(f"Service Account connection failed: {e}. Falling back to CSV.")

    # Method 3: Local CSV fallback
    df = pd.read_csv(CSV_PATH)
    return df, "csv"
