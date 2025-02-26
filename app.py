from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import yfinance as yf
import numpy as np
import tensorflow as tf
from pydantic import BaseModel
from transformers import pipeline
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import os

# ================== Load Trained LSTM Models ==================
model_path = "models"
if not os.path.exists(model_path):
    raise FileNotFoundError("❌ Model directory not found!")

models = {}

# Load all company models dynamically
for file in os.listdir(model_path):
    if file.endswith(".keras"):  # Adjust if using .h5 files
        ticker = file.split("_best_model")[0]  # Extract ticker symbol
        models[ticker] = tf.keras.models.load_model(os.path.join(model_path, file))

print(f"✅ Loaded {len(models)} models.")

# ================== AI Chatbot (GPT-powered) ==================
try:
    explanation_pipeline = pipeline("text-generation", model="EleutherAI/gpt-neo-1.3B")
except Exception as e:
    print(f"Warning: Could not load GPT model: {e}")
    explanation_pipeline = None

# Initialize FastAPI
app = FastAPI()

# Serve static files (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_homepage():
    return FileResponse("index.html")

# Request Body Format
class StockRequest(BaseModel):
    ticker: str

# ================== Fetch Stock Data ==================
def fetch_stock_data(ticker):
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="20y")
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for ticker {ticker}")
        return hist["Close"].values[-60:]  # Get last 60 days of closing prices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for {ticker}: {str(e)}")

# ================== Predict Stock Price ==================
def predict_stock_price(ticker):
    if ticker not in models:
        raise HTTPException(status_code=404, detail=f"Model for {ticker} not found.")
    
    try:
        data = fetch_stock_data(ticker)
        
        # Ensure we have enough data
        if len(data) < 60:
            raise HTTPException(status_code=400, detail=f"Insufficient data for {ticker}, need at least 60 days")
        
        # Normalize Data
        scaler = MinMaxScaler(feature_range=(0, 1))
        data = scaler.fit_transform(np.array(data).reshape(-1, 1))
        
        # Reshape for LSTM
        data = np.reshape(data, (1, 60, 1))
        
        predicted_price = models[ticker].predict(data, verbose=0)[0][0]
        return float(scaler.inverse_transform([[predicted_price]])[0][0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error for {ticker}: {str(e)}")

# ================== AI Chatbot Function ==================
def generate_explanation(ticker):
    if explanation_pipeline is None:
        return f"Explanation service for {ticker} is currently unavailable."
    try:
        return explanation_pipeline(f"Explain stock {ticker} in finance", max_length=100)[0]["generated_text"]
    except Exception as e:
        return f"Could not generate explanation for {ticker}: {str(e)}"

# 🎯 **Stock Prediction API**
@app.post("/predict/")
def predict_stock(request: StockRequest):
    ticker = request.ticker.upper()  # Ensure uppercase tickers
    predicted_price = predict_stock_price(ticker)
    explanation = generate_explanation(ticker)
    return {
        "ticker": ticker, 
        "predicted_price": predicted_price,
        "explanation": explanation
    }

# ================== Run FastAPI ==================
if __name__ == "__main__":
    print("✅ Backend Ready! Run with `uvicorn app:app --reload`")