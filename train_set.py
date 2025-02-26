import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Preprocessing and Machine Learning libraries
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error

# Deep Learning libraries
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

class VeloraStockPredictor:
    def __init__(self, ticker, look_back=60, prediction_days=3):
        """
        Velora Stock Prediction Model
        
        Parameters:
        - ticker: Stock ticker symbol
        - look_back: Number of previous days to use for prediction
        - prediction_days: Number of days to predict ahead
        """
        self.ticker = ticker
        self.look_back = look_back
        self.prediction_days = prediction_days
        
        # Create output directories
        os.makedirs('predictions', exist_ok=True)
        os.makedirs('models', exist_ok=True)
        os.makedirs('charts', exist_ok=True)
    
    def preprocess_data(self, data):
        """
        Prepare data for LSTM prediction
        """
        # Select relevant features
        features = ['Close', 'High', 'Low', 'Open', 'Volume']
        
        # Filter data for specific ticker
        ticker_data = data[data['Ticker'] == self.ticker][features].copy()
        
        # Handle missing values
        imputer = SimpleImputer(strategy='median')
        data_imputed = pd.DataFrame(
            imputer.fit_transform(ticker_data), 
            columns=features
        )
        
        # Normalize features
        scalers = {}
        data_scaled = np.zeros_like(data_imputed.values, dtype=float)
        
        for i, col in enumerate(features):
            scalers[col] = MinMaxScaler(feature_range=(0, 1))
            data_scaled[:, i] = scalers[col].fit_transform(data_imputed[[col]]).flatten()
        
        # Prepare sequences
        X, y = [], []
        for i in range(len(data_scaled) - self.look_back - self.prediction_days + 1):
            # Input sequence: look_back days of features
            X.append(data_scaled[i:i+self.look_back])
            
            # Target: next 3 days high and low prices
            target = data_scaled[i+self.look_back:i+self.look_back+self.prediction_days, 1:3]
            y.append(target.flatten())
        
        # Convert to numpy arrays
        X, y = np.array(X), np.array(y)
        
        # Split into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        return X_train, X_test, y_train, y_test, scalers, features
    
    def build_lstm_model(self, input_shape):
        """
        Create LSTM Neural Network
        """
        model = Sequential([
            # First LSTM layer
            LSTM(units=50, return_sequences=True, 
                 input_shape=input_shape, 
                 activation='relu'),
            Dropout(0.2),
            
            # Second LSTM layer
            LSTM(units=50, return_sequences=False, 
                 activation='relu'),
            Dropout(0.2),
            
            # Dense layers
            Dense(25, activation='relu'),
            
            # Output layer for 3-day high and low prices
            Dense(self.prediction_days * 2, activation='linear')
        ])
        
        # Compile the model
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mean_squared_error',
            metrics=['mae']
        )
        
        return model
    
    def generate_predictions(self, data):
        """
        Generate stock price predictions and recommendations
        """
        # Preprocess data
        X_train, X_test, y_train, y_test, scalers, features = self.preprocess_data(data)
        
        # Build and train model
        model = self.build_lstm_model((X_train.shape[1], X_train.shape[2]))
        
        # Callbacks
        early_stop = EarlyStopping(
            monitor='val_loss', 
            patience=10, 
            restore_best_weights=True
        )
        
        model_checkpoint = ModelCheckpoint(
            f'models/{self.ticker}_best_model.keras', 
            save_best_only=True
        )
        
        # Train the model
        history = model.fit(
            X_train, y_train,
            epochs=50,
            batch_size=32,
            validation_split=0.2,
            callbacks=[early_stop, model_checkpoint],
            verbose=1
        )
        
        # Predict
        predictions = model.predict(X_test)
        
        # Reshape predictions
        predictions = predictions.reshape(y_test.shape)
        
        # Inverse transform predictions
        actual_predictions = np.zeros_like(predictions)
        high_scaler = scalers['High']
        low_scaler = scalers['Low']
        close_scaler = scalers['Close']
        
        # Get the last input sequence for current price reference
        last_input_sequence = X_test[-1, -1, :]
        
        # Reconstruct current price using Close price scaler
        current_price = close_scaler.inverse_transform([[last_input_sequence[3]]])[0][0]
        
        # Inverse transform predictions
        for i in range(self.prediction_days):
            # Inverse transform high and low prices
            high_pred = predictions[0, i*2]
            low_pred = predictions[0, i*2 + 1]
            
            # Inverse transform
            actual_high = high_scaler.inverse_transform([[high_pred]])[0][0]
            actual_low = low_scaler.inverse_transform([[low_pred]])[0][0]
            
            actual_predictions[0, i*2] = actual_high
            actual_predictions[0, i*2 + 1] = actual_low
        
        # Generate recommendations
        recommendations = []
        prediction_details = []
        
        for i in range(self.prediction_days):
            pred_high = actual_predictions[0, i*2]
            pred_low = actual_predictions[0, i*2 + 1]
            
            # Recommendation logic
            buy_threshold = current_price * 1.05
            sell_threshold = current_price * 0.95
            
            if pred_high > buy_threshold:
                recommendation = 'Buy'
            elif pred_low < sell_threshold:
                recommendation = 'Sell'
            else:
                recommendation = 'Hold'
            
            recommendations.append(recommendation)
            prediction_details.append({
                'Day': i+1,
                'Predicted High': pred_high,
                'Predicted Low': pred_low,
                'Recommendation': recommendation
            })
        
        # Calculate accuracy metrics
        mape = mean_absolute_percentage_error(y_test, predictions)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))
        accuracy = (1 - mape) * 100
        
        # Visualization
        plt.figure(figsize=(15, 10))
        
        # Prepare historical and predicted prices
        historical_prices = data[data['Ticker'] == self.ticker]['Close'].tail(self.look_back)
        
        plt.plot(range(len(historical_prices)), historical_prices, label='Historical Prices', color='blue')
        
        # Plot predicted prices
        pred_x = range(len(historical_prices), len(historical_prices) + self.prediction_days)
        pred_prices = [
            actual_predictions[0, i*2] if recommendations[i] == 'Buy' 
            else actual_predictions[0, i*2 + 1] if recommendations[i] == 'Sell' 
            else (actual_predictions[0, i*2] + actual_predictions[0, i*2 + 1]) / 2 
            for i in range(self.prediction_days)
        ]
        
        # Color-code predictions
        colors = {'Buy': 'green', 'Sell': 'red', 'Hold': 'blue'}
        plt.scatter(pred_x, pred_prices, 
                    color=[colors[rec] for rec in recommendations], 
                    label='Predictions')
        
        plt.title(f'{self.ticker} - Stock Price Prediction')
        plt.xlabel('Days')
        plt.ylabel('Price')
        plt.legend()
        plt.tight_layout()
        
        # Save chart
        plt.savefig(f'charts/{self.ticker}_prediction_chart.png')
        plt.close()
        
        # Prepare results
        results = {
            'ticker': self.ticker,
            'current_price': current_price,
            'predictions': prediction_details,
            'accuracy': accuracy,
            'rmse': rmse
        }
        
        # Save results to CSV
        results_df = pd.DataFrame(prediction_details)
        results_df.to_csv(f'predictions/{self.ticker}_predictions.csv', index=False)
        
        return results
    
    def display_results(self, results):
        """
        Display prediction results
        """
        print(f"\n--- {results['ticker']} Stock Prediction ---")
        print(f"Current Price: ${results['current_price']:.2f}")
        print("\nPredictions:")
        for pred in results['predictions']:
            print(f"Day {pred['Day']}:")
            print(f"  Predicted High: ${pred['Predicted High']:.2f}")
            print(f"  Predicted Low: ${pred['Predicted Low']:.2f}")
            print(f"  Recommendation: {pred['Recommendation']}")
        print(f"\nModel Accuracy: {results['accuracy']:.2f}%")
        print(f"RMSE: {results['rmse']:.4f}")
        print(f"\nPrediction Chart: charts/{results['ticker']}_prediction_chart.png")
        print(f"Detailed Predictions: predictions/{results['ticker']}_predictions.csv")

def main():
    # Path to merged data
    data_path = 'data/merged_data.csv'
    
    # Load full dataset
    full_data = pd.read_csv(data_path)
    
    # Get unique tickers
    tickers = full_data['Ticker'].unique()
    
    # Store results
    all_results = {}
    
    # Process each ticker
    for ticker in tickers:
        # Create predictor for each ticker
        predictor = VeloraStockPredictor(ticker)
        
        # Generate predictions
        results = predictor.generate_predictions(full_data)
        
        # Display results
        predictor.display_results(results)
        
        # Store results
        all_results[ticker] = results
    
    # Save overall summary
    summary_df = pd.DataFrame.from_dict(all_results, orient='index')
    summary_df.to_csv('predictions/overall_predictions_summary.csv')

if __name__ == "__main__":
    main()