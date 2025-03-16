import os
import sys
import logging
import numpy as np
import pandas as pd

# Configurable logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('training.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Attempt to import machine learning libraries with graceful fallback
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense
    from tensorflow.keras.optimizers import Adam
    TENSORFLOW_AVAILABLE = True
except ImportError:
    logger.warning("TensorFlow not available. Falling back to basic prediction methods.")
    TENSORFLOW_AVAILABLE = False

try:
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error
    SKLEARN_AVAILABLE = True
except ImportError:
    logger.warning("Scikit-learn not available. Some advanced preprocessing will be limited.")
    SKLEARN_AVAILABLE = False

class StockPredictor:
    def __init__(self, ticker, look_back=60, prediction_days=1):
        """
        Stock Prediction Model with fallback mechanisms
        
        Parameters:
        - ticker: Stock ticker symbol
        - look_back: Number of previous days to use for prediction
        - prediction_days: Number of days to predict ahead
        """
        self.ticker = ticker
        self.look_back = look_back
        self.prediction_days = prediction_days
        
        # Create output directories
        for dir in ['predictions', 'models', 'charts']:
            os.makedirs(dir, exist_ok=True)
    
    def preprocess_data(self, data):
        """
        Prepare data for prediction with fallback processing
        """
        logger.info(f"Preprocessing data for {self.ticker}")
        
        # Filter data for specific ticker
        ticker_data = data[data['Ticker'] == self.ticker]
        
        if ticker_data.empty:
            logger.warning(f"No data found for ticker {self.ticker}")
            return None, None, None, None, None, None
        
        # Select relevant features
        possible_features = ['Close', 'High', 'Low', 'Open', 'Volume']
        features = [f for f in possible_features if f in ticker_data.columns]
        
        if not features:
            logger.warning(f"No usable features found for {self.ticker}")
            return None, None, None, None, None, None
        
        ticker_data = ticker_data[features].copy()
        
        # Handle missing values
        ticker_data = ticker_data.fillna(method='ffill').fillna(method='bfill')
        
        if ticker_data.isna().any().any():
            logger.warning(f"Still have NaN values after filling for {self.ticker}")
            ticker_data = ticker_data.dropna()
        
        # Check data availability
        if len(ticker_data) < self.look_back + self.prediction_days:
            logger.warning(f"Not enough data for {self.ticker}: {len(ticker_data)} rows")
            return None, None, None, None, None, None
        
        # Normalize features
        if SKLEARN_AVAILABLE:
            scalers = {}
            data_scaled = np.zeros_like(ticker_data.values, dtype=float)
            
            for i, col in enumerate(features):
                scalers[col] = MinMaxScaler(feature_range=(0, 1))
                data_scaled[:, i] = scalers[col].fit_transform(ticker_data[[col]]).flatten()
        else:
            # Basic normalization without scikit-learn
            data_scaled = (ticker_data.values - ticker_data.values.min()) / (ticker_data.values.max() - ticker_data.values.min())
            scalers = None
        
        # Prepare sequences for prediction
        close_idx = features.index('Close') if 'Close' in features else 0
        
        X, y = [], []
        for i in range(len(data_scaled) - self.look_back - self.prediction_days + 1):
            X.append(data_scaled[i:i+self.look_back])
            y.append(data_scaled[i+self.look_back, close_idx])
        
        # Convert to numpy arrays
        X, y = np.array(X), np.array(y)
        
        # Basic train-test split if scikit-learn is available
        if SKLEARN_AVAILABLE:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
        else:
            # Simple split without scikit-learn
            split = int(0.8 * len(X))
            X_train, X_test = X[:split], X[split:]
            y_train, y_test = y[:split], y[split:]
        
        return X_train, X_test, y_train, y_test, scalers, features
    
    def train_model(self, data):
        """
        Train model with fallback mechanisms
        """
        # Preprocess data
        preprocessing_result = self.preprocess_data(data)
        
        if preprocessing_result[0] is None:
            logger.error(f"Preprocessing failed for {self.ticker}")
            return False
        
        X_train, X_test, y_train, y_test, scalers, features = preprocessing_result
        
        # Check TensorFlow availability
        if not TENSORFLOW_AVAILABLE:
            logger.warning("Falling back to simple linear regression")
            return self.train_simple_model(X_train, y_train, X_test, y_test)
        
        # Build and train TensorFlow model
        try:
            logger.info(f"Training TensorFlow model for {self.ticker}")
            
            # Define model
            model = tf.keras.Sequential([
                tf.keras.layers.LSTM(50, input_shape=(X_train.shape[1], X_train.shape[2])),
                tf.keras.layers.Dense(25, activation='relu'),
                tf.keras.layers.Dense(1)
            ])
            
            model.compile(
                optimizer=Adam(learning_rate=0.001),
                loss='mean_squared_error',
                metrics=['mae']
            )
            
            # Train model
            history = model.fit(
                X_train, y_train,
                epochs=50,
                validation_split=0.2,
                verbose=0
            )
            
            # Evaluate model
            predictions = model.predict(X_test)
            mse = mean_squared_error(y_test, predictions)
            rmse = np.sqrt(mse)
            
            logger.info(f"{self.ticker} - RMSE: {rmse:.4f}")
            
            # Save model
            model_path = f'models/{self.ticker}_model.keras'
            model.save(model_path)
            
            # Save metrics
            with open(f'models/{self.ticker}_metrics.txt', 'w') as f:
                f.write(f"RMSE: {rmse}\n")
            
            return True
        
        except Exception as e:
            logger.error(f"TensorFlow model training failed for {self.ticker}: {e}")
            return self.train_simple_model(X_train, y_train, X_test, y_test)
    
    def train_simple_model(self, X_train, y_train, X_test, y_test):
        """
        Fallback simple linear regression model
        """
        logger.warning(f"Training simple model for {self.ticker}")
        
        try:
            from sklearn.linear_model import LinearRegression
            
            # Reshape input for linear regression
            X_train_flat = X_train.reshape(X_train.shape[0], -1)
            X_test_flat = X_test.reshape(X_test.shape[0], -1)
            
            # Train linear regression
            model = LinearRegression()
            model.fit(X_train_flat, y_train)
            
            # Predict and calculate error
            predictions = model.predict(X_test_flat)
            mse = mean_squared_error(y_test, predictions)
            rmse = np.sqrt(mse)
            
            logger.info(f"{self.ticker} - Simple Model RMSE: {rmse:.4f}")
            
            # Save simple model
            import joblib
            joblib.dump(model, f'models/{self.ticker}_simple_model.pkl')
            
            # Save metrics
            with open(f'models/{self.ticker}_simple_metrics.txt', 'w') as f:
                f.write(f"Simple Model RMSE: {rmse}\n")
            
            return True
        
        except Exception as e:
            logger.error(f"Simple model training failed for {self.ticker}: {e}")
            return False

def main():
    # Ensure necessary directories exist
    for dir in ['data', 'models', 'predictions', 'charts']:
        os.makedirs(dir, exist_ok=True)
    
    # Path to merged data
    merged_data_path = 'data/merged_data.csv'
    
    # Check if merged data exists
    if not os.path.exists(merged_data_path):
        logger.error(f"Merged data file not found: {merged_data_path}")
        logger.info("Please run data preparation scripts first.")
        return
    
    # Load data
    try:
        data = pd.read_csv(merged_data_path)
        logger.info(f"Loaded data with {len(data)} rows")
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        return
    
    # Get unique tickers
    tickers = data['Ticker'].unique()
    logger.info(f"Found {len(tickers)} unique tickers")
    
    # Train models for each ticker
    success_count = 0
    for ticker in tickers:
        logger.info(f"Processing {ticker}...")
        predictor = StockPredictor(ticker)
        
        if predictor.train_model(data):
            success_count += 1
    
    logger.info(f"Successfully trained {success_count} out of {len(tickers)} models")

if __name__ == "__main__":
    main()