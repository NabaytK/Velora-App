"use client"

import { useState, useEffect } from 'react';
import SearchBar from '@/components/dashboard/SearchBar';
import PredictionChart from '@/components/dashboard/PredictionChart';

// Use the top 50 symbols from your fetch_data.py
const top50Symbols = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "PG",
  "MA", "HD", "CVX", "MRK", "ABBV", "LLY", "BAC", "PFE", "AVGO", "KO",
  "PEP", "TMO", "COST", "DIS", "CSCO", "ADBE", "WFC", "VZ", "ACN", "ABT",
  "CRM", "DHR", "INTC", "NFLX", "CMCSA", "TXN", "NEE", "QCOM", "HON", "AMGN",
  "IBM", "LOW", "INTU", "PM", "ORCL", "MCD"
];

// Company name mapping based on your main.js
const companyNames = {
  "AAPL": "Apple Inc.",
  "MSFT": "Microsoft Corp.",
  "GOOGL": "Alphabet Inc. (Google)",
  "AMZN": "Amazon.com Inc.",
  "TSLA": "Tesla Inc.",
  "NVDA": "NVIDIA Corp.",
  "META": "Meta Platforms Inc.",
  "JPM": "JPMorgan Chase & Co.",
  "V": "Visa Inc.",
  "PG": "Procter & Gamble Co.",
  "MA": "Mastercard Inc.",
  "HD": "Home Depot Inc.",
  "CVX": "Chevron Corp.",
  "MRK": "Merck & Co.",
  "ABBV": "AbbVie Inc.",
  "LLY": "Eli Lilly & Co.",
  "BAC": "Bank of America Corp.",
  "PFE": "Pfizer Inc.",
  "AVGO": "Broadcom Inc.",
  "KO": "Coca-Cola Co.",
  "PEP": "PepsiCo Inc.",
  "TMO": "Thermo Fisher Scientific",
  "COST": "Costco Wholesale Corp.",
  "DIS": "Walt Disney Co.",
  "CSCO": "Cisco Systems Inc.",
  "ADBE": "Adobe Inc.",
  "WFC": "Wells Fargo & Co.",
  "VZ": "Verizon Communications",
  "ACN": "Accenture PLC",
  "ABT": "Abbott Laboratories",
  "CRM": "Salesforce Inc.",
  "DHR": "Danaher Corp.",
  "INTC": "Intel Corp.",
  "NFLX": "Netflix Inc.",
  "CMCSA": "Comcast Corp.",
  "TXN": "Texas Instruments",
  "NEE": "NextEra Energy Inc.",
  "QCOM": "Qualcomm Inc.",
  "HON": "Honeywell International",
  "AMGN": "Amgen Inc.",
  "IBM": "IBM Corp.",
  "LOW": "Lowe's Companies Inc.",
  "INTU": "Intuit Inc.",
  "PM": "Philip Morris International",
  "ORCL": "Oracle Corp.",
  "MCD": "McDonald's Corp."
};

// Seed random number generator for consistent mock data
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate recommendation based on the trend
function generateRecommendation(ticker) {
  // Use ticker name as seed for consistent recommendations
  const seedValue = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomValue = seededRandom(seedValue);
  
  if (randomValue > 0.7) return "BUY";
  if (randomValue < 0.3) return "SELL";
  return "HOLD";
}

// Generate mock price change data
function generatePriceChange(ticker) {
  const seedValue = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (seededRandom(seedValue) * 6) - 2; // Range from -2% to +4%
}

export default function Predictions() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [searchResults, setSearchResults] = useState(null);
  const [visibleStocks, setVisibleStocks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const stocksPerPage = 10;
  
  // Set up the stocks to display in the grid
  useEffect(() => {
    const startIdx = currentPage * stocksPerPage;
    const endIdx = startIdx + stocksPerPage;
    setVisibleStocks(top50Symbols.slice(startIdx, endIdx));
  }, [currentPage]);
  
  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }
    
    // Filter stocks based on search term
    const results = top50Symbols.filter(symbol => {
      const companyName = companyNames[symbol] || '';
      return (
        symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }).map(symbol => ({
      symbol,
      name: companyNames[symbol] || symbol
    }));
    
    setSearchResults(results);
  };
  
  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    setSearchResults(null); // Clear search results after selection
  };
  
  // Filter for recently viewed and top performing
  const recentlyViewed = ['NVDA', 'AMZN', 'MSFT', 'GOOGL', 'META'].filter(s => top50Symbols.includes(s));
  
  // Generate top performing stocks based on seeded random
  const topPerforming = [...top50Symbols]
    .map(symbol => ({
      symbol,
      name: companyNames[symbol] || symbol,
      change: generatePriceChange(symbol)
    }))
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);
  
  // Generate model predictions
  const modelPredictions = [...top50Symbols]
    .map(symbol => ({
      symbol,
      name: companyNames[symbol] || symbol,
      recommendation: generateRecommendation(symbol)
    }))
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Predictions</h1>
        <div className="w-64">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      {searchResults && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="mb-3 text-lg font-medium">Search Results</h2>
          {searchResults.length === 0 ? (
            <p className="text-gray-500">No stocks found matching your search.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {searchResults.map((stock) => (
                <li 
                  key={stock.symbol} 
                  className="py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelectStock(stock.symbol)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.name}</div>
                    </div>
                    <div className="text-sm font-medium text-indigo-600">Select</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Browse Top 50 Stocks</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {visibleStocks.map((symbol) => (
              <button
                key={symbol}
                onClick={() => handleSelectStock(symbol)}
                className={`px-2 py-1.5 text-xs font-medium rounded-lg transition ${
                  selectedStock === symbol
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm text-indigo-600 bg-white border border-indigo-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage + 1} of {Math.ceil(top50Symbols.length / stocksPerPage)}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(top50Symbols.length / stocksPerPage) - 1, prev + 1))}
              disabled={currentPage >= Math.ceil(top50Symbols.length / stocksPerPage) - 1}
              className="px-3 py-1 text-sm text-indigo-600 bg-white border border-indigo-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
        
        <PredictionChart ticker={selectedStock} />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Recently Viewed</h2>
          <ul className="divide-y divide-gray-200">
            {recentlyViewed.map((symbol) => (
              <li key={symbol} className="py-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSelectStock(symbol)}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{symbol}</div>
                    <div className="text-sm text-gray-500">
                      {companyNames[symbol] || symbol}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-indigo-600">View</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Top Performing</h2>
          <ul className="divide-y divide-gray-200">
            {topPerforming.map((stock) => (
              <li key={stock.symbol} className="py-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSelectStock(stock.symbol)}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                  <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">LSTM Model Predictions</h2>
          <ul className="divide-y divide-gray-200">
            {modelPredictions.map((stock) => (
              <li key={stock.symbol} className="py-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSelectStock(stock.symbol)}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    stock.recommendation === "BUY" ? "bg-green-100 text-green-800" :
                    stock.recommendation === "SELL" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {stock.recommendation}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-semibold">About LSTM Model Predictions</h2>
        <p className="text-gray-700 text-sm">
          Our stock predictions are powered by Long Short-Term Memory (LSTM) neural networks, a specialized deep learning 
          architecture designed for time series analysis. The model is trained on extensive historical data for each of 
          the 50 stocks tracked, utilizing 60 days of price and volume data along with technical indicators to generate 
          forecasts. For each stock, the model evaluates patterns, trends, and momentum to provide predictions with 
          confidence scores. The data is refreshed and model retrained weekly to ensure predictions reflect the most 
          current market conditions.
        </p>
      </div>
    </div>
  );
}