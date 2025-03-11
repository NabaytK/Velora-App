import { useState } from 'react';
import Link from 'next/link';

export default function Portfolio() {
  const [portfolioValue, setPortfolioValue] = useState(42675.89);
  const [dailyChange, setDailyChange] = useState(1856.32);
  const [percentChange, setPercentChange] = useState(4.55);
  
  const [holdings, setHoldings] = useState([
    { name: 'Apple Inc.', symbol: 'AAPL', shares: 50, avgPrice: 165.27, currentPrice: 187.54, value: 9377.00, change: 12.38, recommendation: 'Buy' },
    { name: 'NVIDIA Corp.', symbol: 'NVDA', shares: 15, avgPrice: 750.46, currentPrice: 874.15, value: 13112.25, change: 16.48, recommendation: 'Buy' },
    { name: 'Microsoft Corp.', symbol: 'MSFT', shares: 30, avgPrice: 375.10, currentPrice: 404.87, value: 12146.10, change: 7.94, recommendation: 'Hold' },
    { name: 'Tesla Inc.', symbol: 'TSLA', shares: 20, avgPrice: 180.21, currentPrice: 175.34, value: 3506.80, change: -2.70, recommendation: 'Sell' },
    { name: 'Amazon.com Inc.', symbol: 'AMZN', shares: 25, avgPrice: 175.42, currentPrice: 181.34, value: 4533.50, change: 3.38, recommendation: 'Buy' },
  ]);

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
          <p className="text-2xl font-bold">${portfolioValue.toLocaleString()}</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Daily Change</p>
          <p className={`text-2xl font-bold ${dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dailyChange >= 0 ? '+' : '-'}${Math.abs(dailyChange).toLocaleString()}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Percent Change</p>
          <p className={`text-2xl font-bold ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {percentChange >= 0 ? '+' : '-'}{Math.abs(percentChange).toFixed(2)}%
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
            {holdings.map((stock) => (
              <tr key={stock.symbol} className="cursor-pointer hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/dashboard/predictions?symbol=${stock.symbol}`} className="block">
                    <div className="font-medium text-gray-900">{stock.name}</div>
                    <div className="text-sm text-gray-500">{stock.symbol}</div>
                  </Link>
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
