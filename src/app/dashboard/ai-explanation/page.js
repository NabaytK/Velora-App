"use client"

import ModelExplainer from '@/components/ai-explanation/ModelExplainer';
import FeatureImportance from '@/components/ai-explanation/FeatureImportance';
import PredictionFactors from '@/components/ai-explanation/PredictionFactors';
import SearchBar from '@/components/dashboard/SearchBar';

export default function AIExplanation() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI Explanation</h1>
        <SearchBar />
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">How Our AI Works</h2>
        <ModelExplainer />
        
        <div className="p-4 mt-6 bg-indigo-50 border border-indigo-100 rounded-lg">
          <h3 className="mb-2 text-lg font-medium text-indigo-800">LSTM Neural Networks</h3>
          <p className="text-sm text-indigo-700">
            Our LSTM (Long Short-Term Memory) neural networks are a specialized type of recurrent neural 
            network capable of learning and remembering long-term dependencies in time series data like 
            stock prices. This architecture allows our model to understand patterns that unfold over 
            extended periods, making them ideal for financial forecasting.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Feature Importance</h2>
          <FeatureImportance />
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Prediction Factors</h2>
          <PredictionFactors />
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">Accuracy & Performance</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Root Mean Square Error (RMSE)</div>
            <div className="text-2xl font-bold text-indigo-600">0.0248</div>
            <div className="mt-1 text-xs text-gray-500">
              Measures the average magnitude of prediction errors
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Mean Absolute Error (MAE)</div>
            <div className="text-2xl font-bold text-indigo-600">0.0176</div>
            <div className="mt-1 text-xs text-gray-500">
              Average absolute differences between predictions and actual values
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Prediction Accuracy</div>
            <div className="text-2xl font-bold text-indigo-600">87.4%</div>
            <div className="mt-1 text-xs text-gray-500">
              Percentage of directionally correct predictions
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium">Model Training Process</h3>
          <p className="text-sm text-gray-700">
            Our model is trained on extensive historical data, including 10+ years of stock prices, economic 
            indicators, and market sentiment. We use 80% of data for training and reserve 20% for validation 
            to ensure our model generalizes well to new, unseen data. The model is continuously updated weekly 
            to incorporate the latest market data and patterns.
          </p>
        </div>
      </div>
    </div>
  );
}