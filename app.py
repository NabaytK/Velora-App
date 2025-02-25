from fastapi import FastAPI, HTTPException
import yfinance as yf
import numpy as np
import tensorflow as tf
from pydantic import BaseModel
from transformers import pipeline
from sklearn.preprocessing import MinMaxScaler
import pandas as pd

# ================== Load Trained LSTM Model ==================
model = tf.keras.models.load_model("data/stock_lstm_model.h5")

# ================== AI Chatbot (GPT-powered) ==================
explanation_pipeline = pipeline("text-generation", model="EleutherAI/gpt-neo-1.3B")

# Initialize FastAPI
app = FastAPI()

# Request Body Format
class StockRequest(BaseModel):
    ticker: str

# ================== Fetch Stock Data ==================
def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    hist = stock.history(period="20y")
    return hist["Close"].values[-60:]  # Get last 60 days of closing prices

# ================== Predict Stock Price ==================
def predict_stock_price(ticker):
    try:
        data = fetch_stock_data(ticker)
        
        # Normalize Data
        scaler = MinMaxScaler(feature_range=(0, 1))
        data = scaler.fit_transform(np.array(data).reshape(-1, 1))

        # Reshape for LSTM
        data = np.reshape(data, (1, 60, 1))

        predicted_price = model.predict(data)[0][0]
        return scaler.inverse_transform([[predicted_price]])[0][0]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {e}")

# ================== AI Chatbot Function ==================
def generate_explanation(ticker):
    return explanation_pipeline(f"Explain stock {ticker} in finance", max_length=100)[0]["generated_text"]

# ================== API Routes ==================
from transformers import pipeline

# Load GPT-Neo model using PyTorch
explanation_pipeline = pipeline("text-generation", model="EleutherAI/gpt-neo-1.3B")

# 🎯 **Stock Prediction API**
import matplotlib.pyplot as plt

@app.post("/predict/")
def predict_stock_price(request: StockRequest):
    data = fetch_stock_data(request.ticker)
    data = scaler.transform(data[-60:])
    data = data.reshape((1, 60, 1))

    predicted_price = model.predict(data)
    predicted_price = scaler.inverse_transform(predicted_price)

    # Visualize the prediction vs actual (simple plot example)
    plt.plot(data, color='blue', label='Previous Data')  # Example of using data for plotting
    plt.axhline(y=predicted_price, color='red', label='Predicted Price')
    plt.legend()
    plt.show()

    return {"ticker": request.ticker, "predicted_price": predicted_price[0][0]}


# ================== Run FastAPI ==================
print("✅ Backend Ready! Run with `uvicorn app:app --reload`")
