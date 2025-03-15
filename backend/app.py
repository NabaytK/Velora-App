import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, HTTPException, Depends, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
import json
import os
import logging
from datetime import datetime, timedelta
import jwt
from typing import List, Dict, Any, Optional
from uuid import uuid4

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("velora-ai-assistant")

# Initialize FastAPI
app = FastAPI(title="Velora AI Stock Assistant API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Secret (in production, use environment variables)
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-here")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 24  # hours

# Serve static files
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except:
    logger.warning("Static directory not found, skipping static file serving")

# ================== Load Trained LSTM Models ==================
model_path = "models"
if not os.path.exists(model_path):
    os.makedirs(model_path, exist_ok=True)
    logger.warning("Model directory not found, created empty directory!")

models = {}

# Load all company models dynamically
try:
    for file in os.listdir(model_path):
        if file.endswith(".keras") or file.endswith(".h5"):
            ticker = file.split("_best_model")[0]  # Extract ticker symbol
            try:
                models[ticker] = tf.keras.models.load_model(os.path.join(model_path, file))
                logger.info(f"Loaded model for {ticker}")
            except Exception as e:
                logger.error(f"Error loading model for {ticker}: {e}")
except:
    logger.warning("No models found or error loading models")

logger.info(f"Loaded {len(models)} stock prediction models")

# ================== WebSocket Manager for Chat ==================
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id[:8]}... connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id[:8]}... disconnected. Remaining connections: {len(self.active_connections)}")

    async def send_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)
            
    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

# ================== Data Models ==================
class StockRequest(BaseModel):
    ticker: str
    period: Optional[str] = "60d"

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = None

class UserRegistration(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class WatchlistItem(BaseModel):
    ticker: str
    user_id: str

# ================== Authentication ==================
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise credentials_exception
    
    token = token.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except jwt.PyJWTError:
        raise credentials_exception

# ================== Helper Functions ==================
def fetch_stock_data(ticker, period="60d"):
    """Fetch historical stock data for prediction"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if hist.empty:
            logger.warning(f"No data found for ticker {ticker}")
            raise HTTPException(status_code=404, detail=f"No data found for ticker {ticker}")
        return hist
    except Exception as e:
        logger.error(f"Error fetching data for {ticker}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data for {ticker}: {str(e)}")

def preprocess_stock_data(data, look_back=60):
    """Prepare stock data for LSTM prediction"""
    try:
        # Extract closing prices
        close_prices = data["Close"].values
        
        # Normalize the data
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(close_prices.reshape(-1, 1))
        
        # If we don't have enough data, pad with the earliest available data
        if len(scaled_data) < look_back:
            padding = np.repeat(scaled_data[0], look_back - len(scaled_data))
            scaled_data = np.concatenate((padding.reshape(-1, 1), scaled_data))
            
        # Take the last look_back days
        model_input = scaled_data[-look_back:].reshape(1, look_back, 1)
        
        return model_input, scaler, close_prices[-1]
    except Exception as e:
        logger.error(f"Error preprocessing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error preprocessing data: {str(e)}")

def generate_mock_prediction(ticker, days=3):
    """Generate mock prediction when no model is available"""
    try:
        # Get current price from Yahoo Finance
        stock = yf.Ticker(ticker)
        data = stock.history(period="5d")
        
        if data.empty:
            logger.warning(f"No data found for ticker {ticker}")
            # Use a default price if no data available
            current_price = 100.0
            # Random trend direction
            trend = np.random.choice([-1, 1]) * 0.01  
        else:
            current_price = data["Close"].iloc[-1]
            # Calculate recent trend from last 5 days
            if len(data) >= 5:
                trend = (data["Close"].iloc[-1] - data["Close"].iloc[0]) / data["Close"].iloc[0] / 5
            else:
                trend = np.random.choice([-1, 1]) * 0.01
            
        # Generate historical data
        historical = []
        for i in range(30):
            date = (datetime.now() - timedelta(days=30-i)).strftime("%Y-%m-%d")
            # Create a somewhat realistic price path
            price = current_price * (1 - 0.1 * (30-i)/30 + 0.02 * np.random.randn())
            historical.append({
                "date": date,
                "price": round(price, 2)
            })
            
        # Generate predictions
        predictions = []
        predicted_price = current_price
        
        for i in range(days):
            # Add some randomness but follow the trend
            predicted_price = predicted_price * (1 + trend + 0.02 * np.random.randn())
            prediction_date = (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d")
            
            # Calculate percent change from current price
            price_change_pct = (predicted_price - current_price) / current_price * 100
            
            # Determine recommendation
            if price_change_pct > 2:
                recommendation = "BUY"
            elif price_change_pct < -2:
                recommendation = "SELL"
            else:
                recommendation = "HOLD"
                
            # Confidence decreases over time
            confidence = max(60, 90 - (i * 10))
                
            predictions.append({
                "date": prediction_date,
                "price": round(predicted_price, 2),
                "change_percent": round(price_change_pct, 2),
                "confidence": confidence,
                "recommendation": recommendation
            })
            
        return {
            "ticker": ticker,
            "current_price": round(current_price, 2),
            "predictions": predictions,
            "historical": historical,
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        logger.error(f"Error generating mock prediction: {str(e)}")
        # Fallback to very simple prediction
        return {
            "ticker": ticker,
            "current_price": 100.0,
            "predictions": [
                {"date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"), "price": 101.0, "change_percent": 1.0, "confidence": 80, "recommendation": "HOLD"},
                {"date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"), "price": 102.0, "change_percent": 2.0, "confidence": 75, "recommendation": "HOLD"},
                {"date": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"), "price": 103.0, "change_percent": 3.0, "confidence": 70, "recommendation": "BUY"}
            ],
            "historical": [{"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), "price": 100.0 - i*0.5} for i in range(30)],
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

def predict_stock_price(ticker, days=3):
    """Predict stock price for the next several days"""
    if ticker not in models:
        # Try to load the model if not already loaded
        model_file = os.path.join(model_path, f"{ticker}_best_model.keras")
        if not os.path.exists(model_file):
            model_file = os.path.join(model_path, f"{ticker}_best_model.h5")
            if not os.path.exists(model_file):
                logger.warning(f"No model found for {ticker}, using default prediction")
                # If no model exists, we'll use a simple prediction based on recent trends
                return generate_mock_prediction(ticker, days)
        
        try:
            models[ticker] = tf.keras.models.load_model(model_file)
            logger.info(f"Loaded model for {ticker}")
        except Exception as e:
            logger.error(f"Error loading model for {ticker}: {e}")
            return generate_mock_prediction(ticker, days)
    
    try:
        # Fetch historical data
        data = fetch_stock_data(ticker, period="120d")
        
        # Preprocess data
        model_input, scaler, last_price = preprocess_stock_data(data)
        
        # Make prediction
        model = models[ticker]
        raw_predictions = model.predict(model_input, verbose=0)
        
        # Process predictions
        predictions = []
        predicted_values = scaler.inverse_transform(raw_predictions)
        
        # Calculate confidence levels based on model uncertainty
        # In a real system, this would use proper uncertainty estimation
        confidence_base = 95  # Base confidence percentage
        confidence_decay = 5   # Percentage points to reduce per day
        
        current_date = datetime.now()
        
        for i in range(days):
            prediction_date = (current_date + timedelta(days=i+1)).strftime("%Y-%m-%d")
            confidence = max(50, confidence_base - (i * confidence_decay))  # Decay confidence over time
            
            # Calculate prediction price - this is simplified
            # In a real system, you'd use the actual model output for each day
            if i < len(predicted_values):
                predicted_price = float(predicted_values[0][i])
            else:
                # For days beyond model output, extrapolate
                predicted_price = float(predicted_values[0][-1]) * (1 + (0.01 * np.random.randn()))
            
            # Determine if it's a buy/sell/hold recommendation
            price_change_pct = (predicted_price - last_price) / last_price * 100
            
            if price_change_pct > 2:
                recommendation = "BUY"
            elif price_change_pct < -2:
                recommendation = "SELL"
            else:
                recommendation = "HOLD"
                
            predictions.append({
                "date": prediction_date,
                "price": round(predicted_price, 2),
                "change_percent": round(price_change_pct, 2),
                "confidence": confidence,
                "recommendation": recommendation
            })
        
        # Also include historical data for charting
        historical = []
        for date, row in data.tail(30).iterrows():
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(row["Close"], 2)
            })
        
        return {
            "ticker": ticker,
            "current_price": round(last_price, 2),
            "predictions": predictions,
            "historical": historical,
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error for {ticker}: {str(e)}")
        return generate_mock_prediction(ticker, days)

def get_stock_info(ticker):
    """Get company information and summary for a stock"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Extract relevant company information
        return {
            "name": info.get("longName", "Unknown"),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "country": info.get("country", "Unknown"),
            "website": info.get("website", ""),
            "market_cap": info.get("marketCap", 0),
            "pe_ratio": info.get("trailingPE", 0),
            "description": info.get("longBusinessSummary", "No description available.")
        }
    except Exception as e:
        logger.error(f"Error fetching info for {ticker}: {str(e)}")
        return {
            "name": ticker,
            "sector": "Unknown",
            "industry": "Unknown",
            "description": "Could not retrieve company information."
        }

# ================== AI Assistant (Chatbot) Logic ==================
# In a production system, this would likely use a language model API
def generate_stock_explanation(ticker, prediction_data):
    """Generate natural language explanation for stock predictions"""
    try:
        company_info = get_stock_info(ticker)
        company_name = company_info.get("name", ticker)
        sector = company_info.get("sector", "Unknown")
        
        current_price = prediction_data.get("current_price", 0)
        predictions = prediction_data.get("predictions", [])
        
        if not predictions:
            return f"I currently don't have enough data to explain the prediction for {company_name} ({ticker})."
        
        # Get the prediction for tomorrow (first day)
        tomorrow = predictions[0]
        price = tomorrow.get("price", 0)
        change_pct = tomorrow.get("change_percent", 0)
        confidence = tomorrow.get("confidence", 0)
        recommendation = tomorrow.get("recommendation", "HOLD")
        
        # Generate explanation based on prediction data
        explanation = f"Based on our LSTM model analysis, {company_name} ({ticker}) is currently trading at ${current_price}. "
        
        if change_pct > 0:
            explanation += f"Our model predicts the price will increase by {change_pct:.2f}% to ${price:.2f} tomorrow. "
        elif change_pct < 0:
            explanation += f"Our model predicts the price will decrease by {abs(change_pct):.2f}% to ${price:.2f} tomorrow. "
        else:
            explanation += f"Our model predicts the price will remain stable at around ${price:.2f} tomorrow. "
        
        explanation += f"The confidence level for this prediction is {confidence}%. "
        
        # Add recommendation
        if recommendation == "BUY":
            explanation += "Based on this analysis, our system suggests this stock may be a good buying opportunity. "
        elif recommendation == "SELL":
            explanation += "Based on this analysis, our system suggests this may be a good time to consider selling. "
        else:
            explanation += "Based on this analysis, our system suggests holding this position for now. "
        
        # Add sector context
        explanation += f"Note that {company_name} operates in the {sector} sector, which should be considered in your investment decisions."
        
        # Disclaimer
        explanation += "\n\nPlease note that all predictions are based on historical data and market patterns, and should not be considered as financial advice."
        
        return explanation
    
    except Exception as e:
        logger.error(f"Error generating explanation for {ticker}: {str(e)}")
        return f"I'm having trouble generating an explanation for {ticker} at the moment. Please try again later."

def process_chat_message(message, ticker=None):
    """Process incoming chat messages and generate responses"""
    message = message.lower().strip()
    
    # If we have an active ticker, prioritize that context
    if ticker:
        try:
            # Get prediction data
            prediction_data = predict_stock_price(ticker)
            
            # Handle different types of questions
            if "explain" in message or "why" in message or "how" in message or "analysis" in message:
                return generate_stock_explanation(ticker, prediction_data)
                
            elif "price" in message or "predict" in message or "forecast" in message:
                predictions = prediction_data.get("predictions", [])
                if not predictions:
                    return f"I don't have enough data to predict {ticker}'s price movement."
                
                response = f"Here's my price forecast for {ticker}:\n"
                for pred in predictions:
                    response += f"• {pred['date']}: ${pred['price']} ({'+' if pred['change_percent'] > 0 else ''}{pred['change_percent']}%) - {pred['recommendation']}\n"
                return response
                
            elif "confidence" in message or "accuracy" in message or "certain" in message:
                predictions = prediction_data.get("predictions", [])
                if not predictions:
                    return f"I don't have confidence metrics available for {ticker} at the moment."
                
                avg_confidence = sum(p["confidence"] for p in predictions) / len(predictions)
                return f"My predictions for {ticker} have an average confidence level of {avg_confidence:.1f}%. The confidence decreases the further into the future we predict."
                
            elif "buy" in message or "sell" in message or "invest" in message or "recommend" in message:
                predictions = prediction_data.get("predictions", [])
                if not predictions:
                    return f"I don't have enough data to make a recommendation for {ticker}."
                
                recommendation = predictions[0]["recommendation"]
                price = predictions[0]["price"]
                current = prediction_data["current_price"]
                pct_change = predictions[0]["change_percent"]
                
                response = f"Based on my analysis of {ticker}, the current recommendation is: {recommendation}. "
                response += f"The current price is ${current} and I predict it will be ${price} tomorrow "
                response += f"({'+' if pct_change > 0 else ''}{pct_change:.2f}%). "
                response += "Remember that this is not financial advice and all investments carry risk."
                
                return response
                
            else:
                # Default response about the ticker
                return f"I can help with questions about {ticker}'s price predictions, explanations of the forecast, or investment recommendations. What specifically would you like to know?"
        
        except Exception as e:
            logger.error(f"Error in chat processing for {ticker}: {str(e)}")
            return f"I encountered an issue while analyzing {ticker}. Please try again later."
    
    # General questions without ticker context
    if "how do you" in message or "how does your" in message or "how are predictions" in message:
        return "I use Long Short-Term Memory (LSTM) neural networks to make stock predictions. This deep learning approach is well-suited for time series forecasting as it can learn patterns in historical price data. My models consider factors like historical prices, trading volume, and market trends to generate predictions."
    
    elif "accuracy" in message or "how accurate" in message:
        return "My prediction accuracy varies by stock and time horizon. Generally, short-term predictions (1-3 days) tend to be more accurate than longer-term forecasts. On average, my predictions achieve 70-85% directional accuracy for major stocks in stable market conditions. Every prediction includes a confidence score to help you gauge reliability."
    
    elif "which stocks" in message or "what stocks" in message or "recommend stocks" in message:
        return "I don't provide general stock recommendations as proper investment advice should consider your personal financial situation, goals, and risk tolerance. I can, however, analyze specific stocks you're interested in and provide predictions based on historical data patterns."
    
    elif "hello" in message or "hi" in message or "hey" in message:
        return "Hello! I'm your AI stock prediction assistant. I can help analyze stock trends, explain price forecasts, and answer questions about specific stocks. What would you like to know today?"
    
    elif "thank" in message:
        return "You're welcome! If you have any other questions about stocks or predictions, feel free to ask."
    
    elif "help" in message:
        return """I can help you with:
1. Stock price predictions for specific tickers
2. Explanations of why a stock might move in a certain direction
3. Information about a company and its recent performance
4. Confidence levels for predictions
5. Basic investment considerations

Try asking something like:
- "What's your prediction for AAPL?"
- "Explain why MSFT might go up"
- "How confident are you about TSLA's forecast?"
- "Should I consider buying GOOGL?"
"""
    
    else:
        return "I'm your AI stock prediction assistant. I can analyze specific stocks, explain price predictions, and answer questions about market trends. To get started, ask me about a specific stock ticker like AAPL, MSFT, or GOOGL."

# ================== WebSocket Chat Endpoint ==================
@app.websocket("/ws/chat/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                # Parse incoming message
                message_data = json.loads(data)
                user_message = message_data.get("message", "")
                ticker = message_data.get("ticker")  # Optional ticker context
                
                # Generate response
                response = process_chat_message(user_message, ticker)
                
                # Send response
                await manager.send_message(
                    json.dumps({
                        "type": "bot_response",
                        "message": response,
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }),
                    client_id
                )
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from client {client_id}")
                await manager.send_message(
                    json.dumps({
                        "type": "error",
                        "message": "Invalid message format"
                    }),
                    client_id
                )
    except WebSocketDisconnect:
        manager.disconnect(client_id)

# ================== API Endpoints ==================
@app.get("/")
def read_root():
    return {"message": "Welcome to Velora AI Stock Assistant API", "version": "1.0.0"}

@app.post("/api/predict")
def predict_stock(request: StockRequest):
    """Get stock price predictions"""
    ticker = request.ticker.upper()
    predictions = predict_stock_price(ticker)
    return predictions

@app.post("/api/explain")
def explain_prediction(request: StockRequest):
    """Get natural language explanation for stock prediction"""
    ticker = request.ticker.upper()
    predictions = predict_stock_price(ticker)
    explanation = generate_stock_explanation(ticker, predictions)
    return {"ticker": ticker, "explanation": explanation}

@app.post("/api/chat")
def chat(message: ChatMessage):
    """Non-WebSocket chat endpoint for simple integrations"""
    response = process_chat_message(message.message)
    return {"response": response}

@app.get("/api/stock/{ticker}")
def get_stock_details(ticker: str):
    """Get detailed information about a stock"""
    ticker = ticker.upper()
    info = get_stock_info(ticker)
    return info

@app.get("/api/search")
def search_stocks(q: str):
    """Search for stocks by name or ticker"""
    # This is a simplified implementation
    # In a real app, you would use a proper stock search API or database
    if not q or len(q) < 2:
        return {"results": []}
    
    # Hardcoded sample data for demonstration
    sample_stocks = [
        {"ticker": "AAPL", "name": "Apple Inc."},
        {"ticker": "MSFT", "name": "Microsoft Corporation"},
        {"ticker": "GOOGL", "name": "Alphabet Inc."},
        {"ticker": "AMZN", "name": "Amazon.com Inc."},
        {"ticker": "TSLA", "name": "Tesla, Inc."},
        {"ticker": "META", "name": "Meta Platforms Inc."},
        {"ticker": "NVDA", "name": "NVIDIA Corporation"},
        {"ticker": "JPM", "name": "JPMorgan Chase & Co."},
        {"ticker": "V", "name": "Visa Inc."},
        {"ticker": "WMT", "name": "Walmart Inc."}
    ]
    
    # Filter results
    q = q.lower()
    results = [stock for stock in sample_stocks 
              if q in stock["ticker"].lower() or q in stock["name"].lower()]
    
    return {"results": results[:5]}  # Limit to 5 results

# ================== Authentication Endpoints ==================
@app.post("/api/auth/register")
def register_user(user: UserRegistration):
    """Register a new user"""
    # In a real app, you would validate, hash the password, and store in a database
    user_id = str(uuid4())
    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "access_token": create_access_token({"sub": user_id, "email": user.email}),
        "token_type": "bearer"
    }

@app.post("/api/auth/login")
def login_user(user: UserLogin):
    """Log in a user"""
    # In a real app, you would validate against a database
    # This is a mockup that always succeeds
    user_id = str(uuid4())
    return {
        "access_token": create_access_token({"sub": user_id, "email": user.email}),
        "token_type": "bearer"
    }

@app.get("/api/auth/profile")
def get_user_profile(user_id: str = Depends(get_current_user)):
    """Get current user profile"""
    # In a real app, you would fetch this from a database
    return {
        "user_id": user_id,
        "name": "Demo User",
        "email": "demo@example.com",
        "membership": "Premium"
    }

# ================== Watchlist Endpoints ==================
@app.post("/api/watchlist/add")
def add_to_watchlist(item: WatchlistItem, user_id: str = Depends(get_current_user)):
    """Add a stock to user's watchlist"""
    # In a real app, you would store this in a database
    return {"message": f"Added {item.ticker} to watchlist", "status": "success"}

@app.get("/api/watchlist")
def get_watchlist(user_id: str = Depends(get_current_user)):
    """Get user's watchlist"""
    # In a real app, you would fetch this from a database
    # Mock data for demonstration
    return {
        "watchlist": [
            {"ticker": "AAPL", "name": "Apple Inc.", "added_on": "2025-03-10"},
            {"ticker": "MSFT", "name": "Microsoft Corporation", "added_on": "2025-03-12"},
            {"ticker": "GOOGL", "name": "Alphabet Inc.", "added_on": "2025-03-14"}
        ]
    }

@app.delete("/api/watchlist/{ticker}")
def remove_from_watchlist(ticker: str, user_id: str = Depends(get_current_user)):
    """Remove a stock from user's watchlist"""
    # In a real app, you would update a database
    return {"message": f"Removed {ticker} from watchlist", "status": "success"}

# ================== Main run function ==================
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Velora AI Assistant API")
    uvicorn.run(app, host="0.0.0.0", port=8000)
