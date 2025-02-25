import pandas as pd

# Load data
stock_data = pd.read_csv('data/stock_data.csv')
economic_data = pd.read_csv('data/economic_data.csv')
sentiment_data = pd.read_csv('data/social_sentiment_data.csv')

# Merge datasets on common date (assuming there's a 'date' column in all datasets)
merged_data = stock_data.merge(economic_data, left_on='timestamp', right_on='date', how='inner')
merged_data = merged_data.merge(sentiment_data, left_on='timestamp', right_on='date', how='inner')

# Show the first few rows of the merged data to confirm it worked
print(merged_data.head())

# Optionally, save the merged data to a new CSV file
merged_data.to_csv('data/merged_data.csv', index=False)

print("✅ Merged data saved to data/merged_data.csv")
