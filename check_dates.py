import pandas as pd

# Load your data
stock_data = pd.read_csv('data/stock_data.csv')
economic_data = pd.read_csv('data/economic_data.csv')
sentiment_data = pd.read_csv('data/social_sentiment_data.csv')

# Check unique timestamps
print(stock_data['timestamp'].unique())
print(economic_data['timestamp'].unique())
print(sentiment_data['timestamp'].unique())

# Check the intersection of all unique dates
common_dates = set(stock_data['timestamp']).intersection(set(economic_data['timestamp'])).intersection(set(sentiment_data['timestamp']))
print("Common Dates:", common_dates)
