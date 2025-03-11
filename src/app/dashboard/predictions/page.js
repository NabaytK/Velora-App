import PredictionChart from '@/components/predictions/PredictionChart';
import TimeframeSelector from '@/components/predictions/TimeframeSelector';
import ConfidenceIndicator from '@/components/predictions/ConfidenceIndicator';
import SearchBar from '@/components/dashboard/SearchBar';
import { useState } from 'react';

export default function Predictions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Predictions</h1>
        <SearchBar />
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">AAPL Prediction</h2>
          <TimeframeSelector />
        </div>
        
        <PredictionChart />
        
        <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="mb-2 text-lg font-medium">Short-term (1 Week)</h3>
            <p className="text-2xl font-bold text-green-600">$195.67</p>
            <p className="text-sm text-gray-500">+4.2% from current price</p>
            <ConfidenceIndicator value={92} />
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="mb-2 text-lg font-medium">Medium-term (1 Month)</h3>
            <p className="text-2xl font-bold text-green-600">$203.89</p>
            <p className="text-sm text-gray-500">+8.5% from current price</p>
            <ConfidenceIndicator value={84} />
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="mb-2 text-lg font-medium">Long-term (3 Months)</h3>
            <p className="text-2xl font-bold text-green-600">$218.45</p>
            <p className="text-sm text-gray-500">+16.3% from current price</p>
            <ConfidenceIndicator value={76} />
          </div>
        </div>
        
        <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="mb-2 text-lg font-medium text-blue-800">AI Insight</h3>
          <p className="text-blue-700">
            Our AI model predicts a positive trend for AAPL based on strong earnings reports, 
            increased institutional buying, and positive sentiment in recent news coverage. 
            The stock is showing technical strength with support at the 50-day moving average.
          </p>
        </div>
      </div>
    </div>
  );
}
