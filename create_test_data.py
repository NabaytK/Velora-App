import pandas as pd
import numpy as np
import os
import yfinance as yf
from datetime import datetime, timedelta

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

def create_stock_data():
    """Create sample stock data with history"""
    print("Creating test stock data...")
    stocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
    
    # For test data, we'll use historical data from Yahoo Finance for the past year
    all_data = []
    for stock in stocks:
        try:
            data = yf.download(stock, period="1y")
            data['Ticker'] = stock
            data = data.reset_index()  # Move Date from index to column
            data['timestamp'] = data['Date']  # Add timestamp column
            all_data.append(data)
        except Exception as e:
            print(f"Error fetching {stock}: {e}")
    
    if all_data:
        stock_data = pd.concat(all_data)
        stock_data.to_csv('data/stock_data.csv', index=False)
        print(f"Created stock data with {len(stock_data)} rows")
    else:
        print("Failed to create stock data")

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
