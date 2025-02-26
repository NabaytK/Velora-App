import os
import pandas as pd
import numpy as np
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG, 
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('merge_debug.log'),
        logging.StreamHandler()
    ]
)

def robust_date_processing(df, date_column='Date', timestamp_column=None):
    """
    Robust date processing with multiple fallback strategies
    """
    logging.debug(f"Processing dates for DataFrame")
    
    try:
        # First, attempt to parse the specified date column
        df['processed_date'] = pd.to_datetime(df[date_column], errors='coerce')
    except Exception as e:
        logging.warning(f"Failed to parse primary date column: {e}")
        df['processed_date'] = None
    
    # If date parsing failed, try timestamp column
    if timestamp_column and (df['processed_date'] is None or df['processed_date'].isna().all()):
        try:
            df['processed_date'] = pd.to_datetime(df[timestamp_column], errors='coerce')
            logging.debug("Fell back to timestamp column for date parsing")
        except Exception as e:
            logging.error(f"Failed to parse timestamp column: {e}")
    
    # Extract date, handling potential errors
    try:
        df['merge_date'] = df['processed_date'].dt.date
    except Exception as e:
        logging.error(f"Error extracting date: {e}")
        df['merge_date'] = None
    
    # Drop rows with NaT or None in merge_date
    df = df.dropna(subset=['merge_date'])
    
    # Log date processing results
    logging.debug(f"Total rows: {len(df)}")
    logging.debug(f"Valid dates: {df['merge_date'].notna().sum()}")
    
    if df['merge_date'] is not None:
        unique_dates = df['merge_date'].dropna().unique()
        logging.debug(f"Date range: {unique_dates.min()} to {unique_dates.max()}")
        logging.debug(f"Unique dates count: {len(unique_dates)}")
    
    return df

def merge_datasets():
    """
    Flexible dataset merging with robust error handling
    """
    try:
        # Read input files
        stock_data = pd.read_csv('data/stock_data.csv')
        economic_data = pd.read_csv('data/economic_data.csv')
        sentiment_data = pd.read_csv('data/social_sentiment_data.csv')
        
        # Process dates for each dataset
        stock_data = robust_date_processing(stock_data, 'Date', 'timestamp')
        economic_data = robust_date_processing(economic_data, 'timestamp')
        sentiment_data = robust_date_processing(sentiment_data, 'date', 'timestamp')
        
        # Prepare datasets for merging
        stock_columns = ['merge_date', 'Ticker', 'Close', 'High', 'Low', 'Open', 'Volume']
        economic_columns = ['merge_date', 'RealGDP', 'UnemploymentRate', 'NonfarmPayrolls', 
                            'Inflation', 'ConsumerSentiment', 'RetailSales', 
                            'DurableGoods', 'FedFundsRate']
        sentiment_columns = ['merge_date', 'source', 'title', 'sentiment_score', 'sentiment_label']
        
        # Ensure we only use valid columns that exist in the DataFrames
        stock_columns = [col for col in stock_columns if col in stock_data.columns]
        economic_columns = [col for col in economic_columns if col in economic_data.columns]
        sentiment_columns = [col for col in sentiment_columns if col in sentiment_data.columns]
        
        # Select columns
        stock_data = stock_data[stock_columns]
        economic_data = economic_data[economic_columns]
        sentiment_data = sentiment_data[sentiment_columns]
        
        # Merge datasets
        # First, merge stock and economic data
        merged_data = pd.merge(
            stock_data, 
            economic_data, 
            on='merge_date', 
            how='inner'
        )
        
        # Then merge with sentiment data
        merged_data = pd.merge(
            merged_data, 
            sentiment_data, 
            on='merge_date', 
            how='inner'
        )
        
        # Log merge results
        logging.info(f"Merged Data Shape: {merged_data.shape}")
        logging.info(f"Unique Merge Dates: {merged_data['merge_date'].nunique()}")
        
        # Save merged data
        output_dir = 'data'
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, 'merged_data.csv')
        merged_data.to_csv(output_file, index=False)
        
        logging.info(f"✅ Merged data saved to {output_file}")
        logging.info(f"Columns in merged data: {list(merged_data.columns)}")
        
        return merged_data
    
    except Exception as e:
        logging.error(f"Error during data merging: {e}")
        import traceback
        logging.error(traceback.format_exc())
        return None

def main():
    # Merge datasets
    merged_data = merge_datasets()
    
    # Basic analysis of merged data
    if merged_data is not None and not merged_data.empty:
        logging.info("\n📊 Merged Data Summary:")
        logging.info(merged_data.describe().to_string())

if __name__ == "__main__":
    main()