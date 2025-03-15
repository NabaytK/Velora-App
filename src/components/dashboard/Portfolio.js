"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Top 50 Symbols
const top50Symbols = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "PG",
  "MA", "HD", "CVX", "MRK", "ABBV", "LLY", "BAC", "PFE", "AVGO", "KO",
  "PEP", "TMO", "COST", "DIS", "CSCO", "ADBE", "WFC", "VZ", "ACN", "ABT",
  "CRM", "DHR", "INTC", "NFLX", "CMCSA", "TXN", "NEE", "QCOM", "HON", "AMGN",
  "IBM", "LOW", "INTU", "PM", "ORCL", "MCD"
];

// Company name mapping
const companyNames = {
  "AAPL": "Apple Inc.",
  "MSFT": "Microsoft Corp.",
  "GOOGL": "Alphabet Inc.",
  "AMZN": "Amazon.com Inc.",
  "TSLA": "Tesla Inc.",
  "NVDA": "NVIDIA Corp.",
  "META": "Meta Platforms Inc.",
  "JPM": "JPMorgan Chase & Co.",
  "V": "Visa Inc.",
  "PG": "Procter & Gamble Co.",
  // Add remaining company names
};

export default function Portfolio() {
  const [portfolioData, setPortfolioData] = useState({
    total_value: 0,
    daily_change: 0,
    percent_change: 0,
    holdings: []
  });

  const generateRandomHoldings = () => {
    return top50Symbols.map(symbol => {
      const shares = Math.floor(Math.random() * 100) + 10; // 10-110 shares
      const avgPrice = Math.random() * 500 + 50; // $50-$550
      const currentPrice = avgPrice * (1 + (Math.random() * 0.2 - 0.1)); // ±10% variation
      const value = shares * currentPrice;
      const change = ((currentPrice - avgPrice) / avgPrice) * 100;

      return {
        name: companyNames[symbol] || symbol,
        symbol: symbol,
        shares: shares,
        avgPrice: avgPrice,
        currentPrice: currentPrice,
        value: value,
        change: change,
        recommendation: 
          change > 5 ? 'Buy' : 
          change < -5 ? 'Sell' : 
          'Hold'
      };
    });
  };

  useEffect(() => {
    const holdings = generateRandomHoldings();
    
    const totalValue = holdings.reduce((sum, stock) => sum + stock.value, 0);
    const dailyChange = holdings.reduce((sum, stock) => sum + (stock.currentPrice - stock.avgPrice), 0);
    const percentChange = (dailyChange / totalValue) * 100;

    setPortfolioData({
      total_value: totalValue,
      daily_change: dailyChange,
      percent_change: percentChange,
      holdings: holdings
    });
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        <Link href="/dashboard/trade" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Trade
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Portfolio Value</p>
          <p className="text-2xl font-bold">${portfolioData.total_value.toLocaleString()}</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Daily Change</p>
          <p className={`text-2xl font-bold ${portfolioData.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolioData.daily_change >= 0 ? '+' : ''}${Math.abs(portfolioData.daily_change).toLocaleString()}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Percent Change</p>
          <p className={`text-2xl font-bold ${portfolioData.percent_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolioData.percent_change >= 0 ? '+' : ''}{Math.abs(portfolioData.percent_change).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                Shares
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                Avg. Price
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                Current Price
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                % Change
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                AI Rec.
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {portfolioData.holdings.map((stock) => (
              <tr key={stock.symbol} className="cursor-pointer hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{stock.name}</div>
                  <div className="text-sm text-gray-500">{stock.symbol}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="text-sm text-gray-900">{stock.shares}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="text-sm text-gray-900">${stock.avgPrice.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="text-sm text-gray-900">${stock.currentPrice.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">${stock.value.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      stock.change >= 0
                        ? 'text-green-800 bg-green-100'
                        : 'text-red-800 bg-red-100'
                    }`}
                  >
                    {stock.change >= 0 ? '+' : ''}
                    {stock.change.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full ${
                      stock.recommendation === 'Buy'
                        ? 'text-green-800 bg-green-100'
                        : stock.recommendation === 'Sell'
                        ? 'text-red-800 bg-red-100'
                        : 'text-yellow-800 bg-yellow-100'
                    }`}
                  >
                    {stock.recommendation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
