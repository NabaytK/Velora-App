"use client";
import { useState } from 'react';

export default function NewsSection() {
  const [news, setNews] = useState([
    {
      title: "Tech Stocks Surge on AI Breakthrough",
      source: "Financial Times",
      time: "2 hours ago",
      sentiment: "positive"
    },
    {
      title: "Federal Reserve Hints at Interest Rate Changes",
      source: "Wall Street Journal",
      time: "4 hours ago",
      sentiment: "neutral"
    },
    {
      title: "Emerging Markets Show Resilience in Global Economy",
      source: "Bloomberg",
      time: "6 hours ago",
      sentiment: "positive"
    }
  ]);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Market News</h2>
        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
          View All
        </a>
      </div>
      
      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition">
            <div className="flex justify-between items-center mb-2">
              <span className={`
                px-2 py-1 text-xs rounded-full 
                ${item.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
                  item.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'}
              `}>
                {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
              </span>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
