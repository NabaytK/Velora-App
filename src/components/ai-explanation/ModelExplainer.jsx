"use client"

export default function ModelExplainer() {
  return (
    <div className="space-y-4 text-sm text-gray-700">
      <p>
        Our AI prediction model uses Long Short-Term Memory (LSTM) neural networks, 
        a sophisticated deep learning architecture designed to capture complex 
        temporal dependencies in stock price data.
      </p>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Key Components:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Recurrent Neural Network architecture</li>
          <li>60-day historical price and volume data input</li>
          <li>Multi-feature analysis including technical indicators</li>
          <li>Machine learning techniques for pattern recognition</li>
        </ul>
      </div>
      <p>
        The model is trained on extensive historical data, incorporating 
        price movements, trading volumes, and economic indicators to 
        generate probabilistic predictions.
      </p>
    </div>
  );
}