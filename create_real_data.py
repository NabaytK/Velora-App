import pandas as pd
import numpy as np
import os
import yfinance as yf
import time
from datetime import datetime, timedelta

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

def create_stock_data():
    """Create sample stock data with real data from Yahoo Finance"""
    print("Fetching real stock data from Yahoo Finance...")
    
    # List of stock tickers
    stocks = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "PG",
        "MA", "HD", "CVX", "MRK", "ABBV", "LLY", "BAC", "PFE", "AVGO", "KO",
        "PEP", "TMO", "COST", "DIS", "CSCO", "ADBE", "WFC", "VZ", "ACN", "ABT",
        "CRM", "DHR", "INTC", "NFLX", "CMCSA", "TXN", "NEE", "QCOM", "HON", "AMGN",
        "IBM", "LOW", "INTU", "PM", "ORCL", "MCD", "NKE", "UNH", "SBUX", "PYPL"
    ]
    
    all_data = []
    success_count = 0
    
    # Try fetching data for each stock with retries and delays
    for stock in stocks:
        retries = 3
        success = False
        
        while retries > 0 and not success:
            try:
                print(f"Fetching data for {stock} (attempts left: {retries})...")
                # Download data for individual ticker with error handling
                ticker = yf.Ticker(stock)
                data = ticker.history(period="1y")
                
                if not data.empty:
                    data['Ticker'] = stock
                    data = data.reset_index()  # Move Date from index to column
                    data['timestamp'] = data['Date']  # Add timestamp column
                    all_data.append(data)
                    success = True
                    success_count += 1
                    print(f"✓ Successfully fetched data for {stock} ({len(data)} rows)")
                else:
                    print(f"× No data returned for {stock}")
                    
            except Exception as e:
                print(f"× Error fetching {stock}: {e}")
                retries -= 1
                time.sleep(2)  # Add delay between retries
        
        # Add a short delay between stocks to avoid rate limiting
        time.sleep(1)
    
    if all_data:
        stock_data = pd.concat(all_data)
        stock_data.to_csv('data/stock_data.csv', index=False)
        print(f"✓ Created stock data file with {len(stock_data)} rows from {success_count} stocks")
    else:
        print("× Failed to create stock data - falling back to synthetic data")
        create_synthetic_stock_data(stocks)

def create_synthetic_stock_data(stocks):
    """Fallback function to create synthetic stock data"""
    print("Creating synthetic stock data as fallback...")
    
    # Generate dates for the past year
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    dates = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') 
             for i in range((end_date - start_date).days)]
    
    all_data = []
    
    for stock in stocks:
        # Base price for this stock (random between $10 and $500)
        base_price = np.random.uniform(10, 500)
        
        # Generate prices
        close_prices = [base_price * (1 + np.random.normal(0, 0.02)) for _ in range(len(dates))]
        for i in range(1, len(close_prices)):
            # Add some trend to make it look more realistic
            close_prices[i] = close_prices[i-1] * (1 + np.random.normal(0.0002, 0.015))
        
        # Calculate other price metrics based on close
        high_prices = [price * (1 + np.random.uniform(0, 0.02)) for price in close_prices]
        low_prices = [price * (1 - np.random.uniform(0, 0.02)) for price in close_prices]
        open_prices = [low + (high - low) * np.random.uniform(0, 1) 
                      for low, high in zip(low_prices, high_prices)]
        
        # Generate volumes (in millions)
        volumes = [np.random.randint(1000000, 20000000) for _ in range(len(dates))]
        
        # Create DataFrame
        stock_data = pd.DataFrame({
            'Date': dates,
            'Open': open_prices,
            'High': high_prices,
            'Low': low_prices,
            'Close': close_prices,
            'Volume': volumes,
            'Ticker': stock,
            'timestamp': dates
        })
        
        all_data.append(stock_data)
    
    # Combine all stock data
    combined_data = pd.concat(all_data)
    combined_data.to_csv('data/stock_data.csv', index=False)
    print(f"Created synthetic stock data with {len(combined_data)} rows")

def create_economic_data():
    """Create sample economic data"""
    print("Creating test economic data...")
    # Generate dates for the past year
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(365, 0, -1)]
    
    # Create economic data with realistic-looking values
    data = {
        'timestamp': dates,
        'RealGDP': np.linspace(21500, 22500, len(dates)) + np.random.normal(0, 50, len(dates)),
        'UnemploymentRate': np.linspace(5.5, 4.8, len(dates)) + np.random.normal(0, 0.1, len(dates)),
        'NonfarmPayrolls': np.linspace(150000, 170000, len(dates)) + np.random.normal(0, 2000, len(dates)),
        'Inflation': np.linspace(2.1, 2.8, len(dates)) + np.random.normal(0, 0.1, len(dates)),
        'ConsumerSentiment': np.linspace(75, 85, len(dates)) + np.random.normal(0, 2, len(dates)),
        'RetailSales': np.linspace(350000, 380000, len(dates)) + np.random.normal(0, 2000, len(dates)),
        'DurableGoods': np.linspace(180000, 195000, len(dates)) + np.random.normal(0, 1000, len(dates)),
        'FedFundsRate': np.linspace(2.5, 3.0, len(dates)) + np.random.normal(0, 0.05, len(dates))
    }
    
    economic_data = pd.DataFrame(data)
    economic_data.to_csv('data/economic_data.csv', index=False)
    print(f"Created economic data with {len(economic_data)} rows")

def create_sentiment_data():
    """Create sample sentiment data"""
    print("Creating test sentiment data...")
    # Generate dates for the past year
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(365, 0, -1)]
    
    # Sample sources and titles
    sources = ['Twitter', 'Reddit', 'Bloomberg', 'CNBC', 'Yahoo Finance']
    sample_titles = [
        "Investors bullish on tech stocks",
        "Market sentiment turns positive after Fed announcement",
        "Analysts predict strong quarterly earnings",
        "Economic recovery continues despite challenges",
        "Consumer spending remains robust in Q2"
    ]
    
    # Create sentiment data
    data = {
        'date': dates,
        'timestamp': dates,
        'source': [sources[i % len(sources)] for i in range(len(dates))],
        'title': [sample_titles[i % len(sample_titles)] for i in range(len(dates))],
        'sentiment_score': np.random.uniform(0.2, 0.9, len(dates)),
        'sentiment_label': ['positive' if s > 0.5 else 'negative' for s in np.random.uniform(0, 1, len(dates))]
    }
    
    sentiment_data = pd.DataFrame(data)
    sentiment_data.to_csv('data/social_sentiment_data.csv', index=False)
    print(f"Created sentiment data with {len(sentiment_data)} rows")

if __name__ == "__main__":
    create_stock_data()
    create_economic_data()
    create_sentiment_data()
    print("All test data created successfully")
