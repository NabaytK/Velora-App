import pandas as pd
import numpy as np
import os
import yfinance as yf
import sqlite3
import time
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('data/stock_fetch.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Ensure data directory exists
os.makedirs('data', exist_ok=True)
os.makedirs('models', exist_ok=True)

# SQLite Database file
DB_FILE = "data/stock_data.db"

# List of 50 stock tickers
stocks = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "PG",
    "MA", "HD", "CVX", "MRK", "ABBV", "LLY", "BAC", "PFE", "AVGO", "KO",
    "PEP", "TMO", "COST", "DIS", "CSCO", "ADBE", "WFC", "VZ", "ACN", "ABT",
    "CRM", "DHR", "INTC", "NFLX", "CMCSA", "TXN", "NEE", "QCOM", "HON", "AMGN",
    "IBM", "LOW", "INTU", "PM", "ORCL", "MCD", "NKE", "UNH", "SBUX", "PYPL"
]

# Define the period (10 years)
start_date = (datetime.now() - timedelta(days=365 * 10)).strftime('%Y-%m-%d')
end_date = datetime.now().strftime('%Y-%m-%d')

def fetch_with_retry(ticker, max_retries=3, delay=2):
    """Fetch stock data with retries."""
    for attempt in range(max_retries):
        try:
            logger.info(f"Fetching {ticker} (attempt {attempt+1}/{max_retries})...")
            data = yf.download(ticker, start=start_date, end=end_date, progress=False)
            
            if not data.empty:
                logger.info(f"✓ Successfully fetched {len(data)} rows for {ticker}")
                return data
            else:
                logger.warning(f"× No data returned for {ticker}")
        except Exception as e:
            logger.error(f"× Error fetching {ticker}: {e}")
        
        if attempt < max_retries - 1:
            logger.info(f"Retrying in {delay} seconds...")
            time.sleep(delay)
    
    return None

def create_synthetic_data_for_ticker(ticker):
    """Create synthetic data for a ticker when real data can't be fetched."""
    logger.info(f"Generating synthetic data for {ticker}...")
    
    # Generate dates for the past 10 years
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365 * 10)
    dates = pd.date_range(start=start_date, end=end_date, freq='B')  # Business days
    
    # Base price and volatility parameters that differ by ticker
    ticker_hash = sum(ord(c) for c in ticker)
    np.random.seed(ticker_hash)  # Make the generation deterministic for each ticker
    
    base_price = np.random.uniform(50, 500)
    volatility = np.random.uniform(0.01, 0.03)
    drift = np.random.uniform(0.0001, 0.0005)  # Slight upward drift
    
    # Generate log-normal price series
    n_steps = len(dates)
    returns = np.random.normal(drift, volatility, n_steps)
    log_returns = np.cumsum(returns)
    prices = base_price * np.exp(log_returns)
    
    # Generate other price metrics
    close_prices = prices
    high_prices = prices * np.exp(np.random.normal(0.001, 0.005, n_steps))
    low_prices = prices * np.exp(np.random.normal(-0.001, 0.005, n_steps))
    open_prices = low_prices + (high_prices - low_prices) * np.random.uniform(0, 1, n_steps)
    
    # Generate volumes with some randomness but seasonal patterns
    base_volume = np.random.randint(500000, 5000000)
    trend = np.linspace(0.8, 1.2, n_steps)  # Long term volume trend
    seasonal = 1 + 0.1 * np.sin(np.linspace(0, 20*np.pi, n_steps))  # Seasonal pattern
    noise = np.random.lognormal(0, 0.5, n_steps)  # Random noise
    volumes = base_volume * trend * seasonal * noise
    
    # Create DataFrame
    synthetic_data = pd.DataFrame({
        'Open': open_prices,
        'High': high_prices,
        'Low': low_prices,
        'Close': close_prices,
        'Volume': volumes.astype(int),
        'Adj Close': close_prices  # Matching Yahoo Finance format
    }, index=dates)
    
    logger.info(f"Generated synthetic data with {len(synthetic_data)} rows for {ticker}")
    return synthetic_data

def fetch_stock_data():
    """Fetch real stock data from Yahoo Finance or generate synthetic data if needed."""
    logger.info("Starting stock data collection process...")
    all_data = []
    success_count = 0
    synthetic_count = 0
    
    for ticker in stocks:
        # Try to fetch real data
        data = fetch_with_retry(ticker)
        
        if data is not None and not data.empty:
            data['Ticker'] = ticker
            data = data.reset_index()  # Move Date from index to column
            all_data.append(data)
            success_count += 1
        else:
            # Fall back to synthetic data
            logger.warning(f"Falling back to synthetic data for {ticker}")
            synthetic_data = create_synthetic_data_for_ticker(ticker)
            synthetic_data['Ticker'] = ticker
            synthetic_data = synthetic_data.reset_index()
            synthetic_data.rename(columns={'index': 'Date'}, inplace=True)
            all_data.append(synthetic_data)
            synthetic_count += 1
        
        # Add a delay between stock fetches to avoid rate limiting
        time.sleep(1)
    
    if all_data:
        stock_data = pd.concat(all_data)
        # Ensure 'timestamp' column exists for compatibility with the app
        if 'Date' in stock_data.columns and 'timestamp' not in stock_data.columns:
            stock_data['timestamp'] = stock_data['Date']
        
        logger.info(f"Data collection complete: {success_count} real, {synthetic_count} synthetic")
        return stock_data
    else:
        logger.error("No data collected!")
        return None

def save_data(stock_data):
    """Save the data to CSV and SQLite database."""
    if stock_data is None or stock_data.empty:
        logger.error("No data to save!")
        return False
    
    try:
        # Save to CSV
        csv_path = 'data/stock_data.csv'
        stock_data.to_csv(csv_path, index=False)
        logger.info(f"Saved {len(stock_data)} rows to CSV: {csv_path}")
        
        # Save to SQLite
        conn = sqlite3.connect(DB_FILE)
        stock_data.to_sql('stocks', conn, if_exists='replace', index=False)
        
        # Create indexes for faster queries
        cursor = conn.cursor()
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_ticker ON stocks (Ticker)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_date ON stocks (Date)")
        conn.commit()
        conn.close()
        
        logger.info(f"Saved data to SQLite database: {DB_FILE}")
        return True
    except Exception as e:
        logger.error(f"Error saving data: {e}")
        return False

def create_stock_data():
    """Main function to collect and save stock data."""
    logger.info("===== STOCK DATA COLLECTION =====")
    try:
        # Fetch the data
        stock_data = fetch_stock_data()
        
        # Save to files
        if stock_data is not None and not stock_data.empty:
            save_data(stock_data)
            logger.info(f"🎯 Successfully processed {len(stock_data)} rows for {len(stocks)} stocks")
            return True
        else:
            logger.error("No data to save!")
            return False
    except Exception as e:
        logger.error(f"Unexpected error during data collection: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def create_economic_data():
    """Create economic data with realistic patterns."""
    logger.info("Creating economic data...")
    # Generate dates for the past 10 years
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365 * 10)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    dates_str = [d.strftime('%Y-%m-%d') for d in dates]
    
    # Create realistic economic data
    # GDP growth over 10 years with seasonal patterns and long-term growth
    gdp_base = 18000  # Starting GDP value
    gdp_trend = np.linspace(1, 1.3, len(dates))  # Long-term growth
    gdp_seasonal = 1 + 0.02 * np.sin(np.linspace(0, 10*np.pi, len(dates)))  # Seasonal
    gdp_noise = np.random.normal(1, 0.005, len(dates))  # Random variations
    real_gdp = gdp_base * gdp_trend * gdp_seasonal * gdp_noise
    
    # Unemployment rate with business cycles and gradual improvement
    unemp_cycles = 8 + 2 * np.sin(np.linspace(0, 3*np.pi, len(dates)))
    unemp_trend = np.linspace(1, 0.7, len(dates))  # Long-term improvement
    unemp_noise = np.random.normal(0, 0.1, len(dates))
    unemployment = unemp_cycles * unemp_trend + unemp_noise
    unemployment = np.clip(unemployment, 3, 10)  # Keep in realistic range
    
    # Create economic data
    data = {
        'timestamp': dates_str,
        'RealGDP': real_gdp,
        'UnemploymentRate': unemployment,
        'NonfarmPayrolls': 130000 + 30000 * np.sin(np.linspace(0, 6*np.pi, len(dates))) + np.random.normal(0, 3000, len(dates)),
        'Inflation': 2 + 1.5 * np.sin(np.linspace(0, 4*np.pi, len(dates))) + np.random.normal(0, 0.2, len(dates)),
        'ConsumerSentiment': 75 + 15 * np.sin(np.linspace(0, 7*np.pi, len(dates))) + np.random.normal(0, 3, len(dates)),
        'RetailSales': 350000 + 50000 * np.sin(np.linspace(0, 8*np.pi, len(dates))) + np.random.normal(0, 5000, len(dates)),
        'DurableGoods': 150000 + 40000 * np.sin(np.linspace(0, 5*np.pi, len(dates))) + np.random.normal(0, 2000, len(dates)),
        'FedFundsRate': 2 + 1 * np.sin(np.linspace(0, 2*np.pi, len(dates))) + np.random.normal(0, 0.05, len(dates))
    }
    
    economic_data = pd.DataFrame(data)
    economic_data.to_csv('data/economic_data.csv', index=False)
    logger.info(f"Created economic data with {len(economic_data)} rows")
    return True

def create_sentiment_data():
    """Create sentiment data with realistic patterns."""
    logger.info("Creating sentiment data...")
    # Generate dates for the past 10 years
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365 * 10)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    dates_str = [d.strftime('%Y-%m-%d') for d in dates]
    
    # Sample sources and titles
    sources = ['Twitter', 'Reddit', 'Bloomberg', 'CNBC', 'Yahoo Finance', 'Wall Street Journal', 
               'MarketWatch', 'Seeking Alpha', 'Financial Times', 'Barron\'s']
    
    sample_titles = [
        "Investors bullish on tech stocks amid earnings season",
        "Market sentiment turns positive after Fed announcement",
        "Analysts predict strong quarterly earnings for tech sector",
        "Economic recovery continues despite inflation challenges",
        "Consumer spending remains robust in second quarter",
        "Central bank signals cautious approach to rate changes",
        "Retail investors show increasing interest in market dips",
        "Supply chain issues affecting multiple industries",
        "Markets respond positively to economic data release",
        "Volatility expected as geopolitical tensions increase",
        "Energy sector performance tied to global demand recovery",
        "Healthcare stocks showing resilience in uncertain market",
        "Investors weighing macro trends against company fundamentals",
        "Tech sector leads gains as innovation drives valuations",
        "Market analysts divided on inflation impact forecasts"
    ]
    
    # Create sentiment scores with market cycles
    sentiment_base = np.sin(np.linspace(0, 5*np.pi, len(dates))) * 0.3 + 0.6  # Oscillate between 0.3 and 0.9
    sentiment_noise = np.random.normal(0, 0.15, len(dates))
    sentiment_scores = sentiment_base + sentiment_noise
    sentiment_scores = np.clip(sentiment_scores, 0.1, 0.99)  # Keep in range
    
    # Create sentiment data
    data = {
        'date': dates_str,
        'timestamp': dates_str,
        'source': [sources[i % len(sources)] for i in range(len(dates))],
        'title': [sample_titles[i % len(sample_titles)] for i in range(len(dates))],
        'sentiment_score': sentiment_scores,
        'sentiment_label': ['positive' if s > 0.5 else 'negative' for s in sentiment_scores]
    }
    
    sentiment_data = pd.DataFrame(data)
    sentiment_data.to_csv('data/social_sentiment_data.csv', index=False)
    logger.info(f"Created sentiment data with {len(sentiment_data)} rows")
    return True

if __name__ == "__main__":
    create_stock_data()
    create_economic_data()
    create_sentiment_data()
    logger.info("🎉 Data collection and generation complete!")
