import os
import datetime
import time
import requests
import numpy as np
import pandas as pd
import yfinance as yf
from fredapi import Fred
from transformers import pipeline

# ================== API KEYS ==================
FRED_API_KEY = "3697e10e875c41511c666dae613fdc96"  # ✅ Replace with your valid FRED API Key
NEWS_API_KEY = "pub_69938d82a406c9353ccbc2d45c8df6168354f"  # Replace with your actual API key


# ================== Define Stock List ==================
top_50_symbols = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "PG",
    "MA", "HD", "CVX", "MRK", "ABBV", "LLY", "BAC", "PFE", "AVGO", "KO",
    "PEP", "TMO", "COST", "DIS", "CSCO", "ADBE", "WFC", "VZ", "ACN", "ABT",
    "CRM", "DHR", "INTC", "NFLX", "CMCSA", "TXN", "NEE", "QCOM", "HON", "AMGN",
    "IBM", "LOW", "INTU", "PM", "ORCL", "MCD"
]

global_start_date = "2010-01-01"

# ================== Economic Indicators ==================
fred_series = {
    "GDPC1": "RealGDP",
    "UNRATE": "UnemploymentRate",
    "PAYEMS": "NonfarmPayrolls",
    "CPIAUCSL": "Inflation",
    "UMCSENT": "ConsumerSentiment",
    "RSAFS": "RetailSales",
    "DGORDER": "DurableGoods",
    "FEDFUNDS": "FedFundsRate",
}

# ================== Sentiment Analysis Model ==================
# Changed to general sentiment model instead of financial-specific
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"  # General sentiment model
)

# ================== Helper Functions ==================
def ensure_folders():
    """ Ensure required data directories exist """
    os.makedirs("data/stocks", exist_ok=True)
    os.makedirs("data", exist_ok=True)

def save_to_csv(df, filename):
    """ Save DataFrame to CSV, ensuring timestamp column """
    if df is None or df.empty:
        print(f"⚠️ No data to save for {filename}.")
        return

    ensure_folders()
    path = os.path.join("data", filename)
    write_header = not os.path.exists(path)

    if "timestamp" not in df.columns:
        df["timestamp"] = datetime.datetime.now()

    df.to_csv(path, mode='a' if not write_header else 'w', header=write_header, index=False)
    print(f"✅ Saved {len(df)} records to {path}")

# ================== Fetch Stock Data Individually ==================
def fetch_stock_data(symbol, start_date, end_date=None):
    """ Fetches stock data for a single symbol from Yahoo Finance """
    print(f"🔍 Fetching stock data for {symbol}...")
    
    if end_date is None:
        end_date = datetime.datetime.now().strftime('%Y-%m-%d')

    for attempt in range(3):  # Retry up to 3 times
        try:
            data = yf.download(symbol, start=start_date, end=end_date, progress=False, auto_adjust=True)

            # If no data, retry
            if data.empty or "Close" not in data.columns:
                print(f"⚠️ No valid data for {symbol}, retrying in 3s...")
                time.sleep(3)
                continue  # Retry fetching

            # Keep only the required columns
            data["Ticker"] = symbol
            data.reset_index(inplace=True)

            # Save individual stock data
            save_to_csv(data, f"stocks/{symbol}.csv")

            print(f"✅ Successfully fetched {symbol}")
            return data

        except Exception as e:
            print(f"⚠️ Error fetching {symbol}: {e}")
            time.sleep(3)

    print(f"❌ Skipping {symbol} due to repeated failures.")
    return None

# ================== Fetch Economic Data (FRED) ==================
def fetch_economic_data_fred(start_date="2010-01-01"):
    """ Fetch multiple economic indicators from FRED """
    print("📊 Fetching economic data from FRED...")
    fred = Fred(api_key=FRED_API_KEY)
    econ_dfs = []

    for series_id, col_name in fred_series.items():
        try:
            raw_data = fred.get_series(series_id, observation_start=start_date)
            temp_df = pd.DataFrame(raw_data, columns=[col_name])
            temp_df = temp_df.resample('ME').last().ffill()  # Use 'ME' instead of 'M'

        except Exception as e:
            print(f"⚠️ Failed to fetch {col_name} from FRED ({series_id}): {e}")
            continue
        
        econ_dfs.append(temp_df)

    return pd.concat(econ_dfs, axis=1) if econ_dfs else pd.DataFrame()


# ================== Fetch News Sentiment (NewsData.io) ==================
def fetch_sentiment():
    """ Fetch social news sentiment from NewsData.io """
    print("📊 Fetching social news sentiment from NewsData.io...")

    # ✅ Using existing API Key
    NEWS_API_KEY = "pub_69938d82a406c9353ccbc2d45c8df6168354f"

    # ✅ Updated query to focus on social topics instead of finance
    url = f"https://newsdata.io/api/1/news?apikey={NEWS_API_KEY}&q=social OR trending OR viral&language=en"

    try:
        response = requests.get(url)
        
        # ✅ Check for a successful response
        if response.status_code != 200:
            print(f"⚠️ API request failed: {response.text}")
            return pd.DataFrame()

        # ✅ Parse the response JSON
        articles = response.json().get('results', [])
        results = []

        # ✅ Process up to 100 articles
        for article in articles[:100]:  
            title = article.get('title', '')
            description = article.get('description', '')
            content = f"{title} {description}"

            # ✅ Ensure text is long enough for sentiment analysis
            if len(content) < 50:
                continue

            truncated_text = content[:512]  # Limit text size for sentiment analysis
            try:
                sent_res = sentiment_analyzer(truncated_text)[0]  # Apply sentiment analysis
            except:
                continue

            results.append({
                "date": pd.to_datetime(article.get('pubDate')),
                "source": article.get('source_id', 'Unknown'),
                "title": title,
                "sentiment_score": sent_res['score'],
                "sentiment_label": sent_res['label'],
            })

        # ✅ Save the data if results exist
        if results:
            df = pd.DataFrame(results)
            save_to_csv(df, "social_sentiment_data.csv")  # Changed filename to reflect social focus
            print(f"✅ Saved {len(df)} records to data/social_sentiment_data.csv")
            return df
        else:
            print("⚠️ No social news data available.")
            return pd.DataFrame()

    except Exception as e:
        print(f"⚠️ Error fetching social news sentiment: {e}")
        return pd.DataFrame()

# ================== Main Execution ==================
def main():
    ensure_folders()

    # Fetch Stock Data Individually
    for symbol in top_50_symbols:
        stock_df = fetch_stock_data(symbol, start_date=global_start_date)
    
    # Merge all stock data into one CSV
    print("📊 Merging all stock data into stock_data.csv...")
    stock_files = [f"data/stocks/{symbol}.csv" for symbol in top_50_symbols if os.path.exists(f"data/stocks/{symbol}.csv")]
    if stock_files:
        merged_df = pd.concat([pd.read_csv(f) for f in stock_files], ignore_index=True)
        save_to_csv(merged_df, "stock_data.csv")
    else:
        print("⚠️ No stock data available for merging.")

    # Fetch Economic Data
    econ_df = fetch_economic_data_fred(start_date=global_start_date)
    save_to_csv(econ_df, "economic_data.csv")

    # Fetch Sentiment Data
    sentiment_df = fetch_sentiment()
    save_to_csv(sentiment_df, "social_sentiment_data.csv")  # Updated filename

    print("✅ All data collection complete!")

if __name__ == "__main__":
    main()
