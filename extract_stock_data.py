import yfinance as yf
import pandas as pd
from typing import List

def fetch_stock_data(stocks: List[str], period: str) -> pd.DataFrame:
    """Fetch historical stock data with technical indicators."""
    all_data = pd.DataFrame()
    
    for stock in stocks:
        try:
            print(f"Fetching {stock}...")
            data = yf.download(stock, period=period, progress=False)
            
            # Compute indicators
            data['SMA_30'] = data['Close'].rolling(30).mean()
            data['EMA_30'] = data['Close'].ewm(span=30, adjust=False).mean()
            data['RSI'] = compute_rsi(data['Close'])
            
            data['Stock'] = stock
            all_data = pd.concat([all_data, data])
        except Exception as e:
            print(f"⚠️ Error fetching {stock}: {e}")
    
    return all_data.reset_index()  # Include dates as a column

def compute_rsi(series: pd.Series, window: int = 14) -> pd.Series:
    """Calculate RSI with error handling."""
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(window).mean()
    loss = (-delta.clip(upper=0)).rolling(window).mean()
    rs = gain / loss.replace(0, 1e-10)  # Avoid division by zero
    return 100 - (100 / (1 + rs))

if __name__ == "__main__":
    stocks = ["AAPL", "GOOGL", "AMZN", "MSFT", "TSLA"]
    data = fetch_stock_data(stocks, "10y")
    
    # Save once
    data.to_csv("stock_data.csv", index=False)
    print(f"✅ Saved {len(data)} records to stock_data.csv")
