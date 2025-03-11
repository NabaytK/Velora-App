import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MarketSummary() {
  const [indexes, setIndexes] = useState([
    { name: 'S&P 500', symbol: 'SPX', price: 4,982.75, change: 0.58 },
    { name: 'NASDAQ', symbol: 'COMP', price: 17,043.81, change: 1.25 },
    { name: 'Dow Jones', symbol: 'DJI', price: 37,863.80, change: -0.12 },
  ]);

  const [trending, setTrending] = useState([
    { name: 'Apple Inc.', symbol: 'AAPL', price: 187.54, change: 1.85 },
    { name: 'NVIDIA Corp.', symbol: 'NVDA', price: 874.15, change: 2.74 },
    { name: 'Microsoft Corp.', symbol: 'MSFT', price: 404.87, change: 1.33 },
    { name: 'Tesla Inc.', symbol: 'TSLA', price: 175.34, change: -0.87 },
  ]);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, this would fetch live data from an API
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Market Summary</h2>
        <span className="text-sm text-gray-500">Last updated: Today 9:45 AM</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-medium">Major Indexes</h3>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Index
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    % Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {indexes.map((index) => (
                  <tr key={index.symbol}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{index.name}</div>
                      <div className="text-sm text-gray-500">{index.symbol}</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{index.price.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 text-xs font-semibold leading-5 ${
                          index.change >= 0
                            ? 'text-green-800 bg-green-100'
                            : 'text-red-800 bg-red-100'
                        } rounded-full`}
                      >
                        {index.change >= 0 ? '+' : ''}
                        {index.change.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-medium">Trending Stocks</h3>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    % Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trending.map((stock) => (
                  <tr key={stock.symbol} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/dashboard/predictions?symbol=${stock.symbol}`} className="block">
                        <div className="font-medium text-gray-900">{stock.name}</div>
                        <div className="text-sm text-gray-500">{stock.symbol}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${stock.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 text-xs font-semibold leading-5 ${
                          stock.change >= 0
                            ? 'text-green-800 bg-green-100'
                            : 'text-red-800 bg-red-100'
                        } rounded-full`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
