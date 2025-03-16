import os
import logging
import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('merge.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def merge_datasets():
    """
    Merge stock, economic, and sentiment datasets
    """
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Check if source files exist
    required_files = [
        'data/stock_data.csv', 
        'data/economic_data.csv', 
        'data/social_sentiment_data.csv'
    ]
    
    for file in required_files:
        if not os.path.exists(file):
            logger.error(f"Required file not found: {file}")
            return False
    
    try:
        # Read datasets
        stock_data = pd.read_csv('data/stock_data.csv')
        economic_data = pd.read_csv('data/economic_data.csv')
        sentiment_data = pd.read_csv('data/social_sentiment_data.csv')
        
        # Ensure datetime columns are consistent
        stock_data['Date'] = pd.to_datetime(stock_data['Date'])
        economic_data['timestamp'] = pd.to_datetime(economic_data['timestamp'])
        sentiment_data['date'] = pd.to_datetime(sentiment_data['date'])
        
        # Rename columns for consistency
        stock_data['timestamp'] = stock_data['Date']
        
        # Merge datasets
        # First, merge stock and economic data on timestamp
        merged_data = pd.merge(
            stock_data, 
            economic_data, 
            on='timestamp', 
            how='inner'
        )
        
        # Then merge with sentiment data
        merged_data = pd.merge(
            merged_data, 
            sentiment_data, 
            left_on='timestamp', 
            right_on='date', 
            how='inner'
        )
        
        # Drop duplicate columns
        merged_data = merged_data.loc[:, ~merged_data.columns.duplicated()]
        
        # Reset index
        merged_data.reset_index(drop=True, inplace=True)
        
        # Save merged data
        merged_data.to_csv('data/merged_data.csv', index=False)
        
        logger.info(f"Merged data shape: {merged_data.shape}")
        logger.info(f"Columns in merged data: {list(merged_data.columns)}")
        
        return True
    
    except Exception as e:
        logger.error(f"Error merging datasets: {e}")
        return False

def main():
    success = merge_datasets()
    
    if success:
        logger.info("🎉 Data merging complete!")
    else:
        logger.error("❌ Data merging failed.")

if __name__ == "__main__":
    main()