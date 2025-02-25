import pandas as pd

# Load the datasets
stock_df = pd.read_csv("data/stock_data.csv")
econ_df = pd.read_csv("data/economic_data.csv")
sentiment_df = pd.read_csv("data/sentiment_data.csv")

# Show basic info
print("Stock Data Info:")
print(stock_df.info())

print("\nEconomic Data Info:")
print(econ_df.info())

print("\nSentiment Data Info:")
print(sentiment_df.info())

# Show first few rows
print("\nStock Data Sample:")
print(stock_df.head())

print("\nEconomic Data Sample:")
print(econ_df.head())

print("\nSentiment Data Sample:")
print(sentiment_df.head())
