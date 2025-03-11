import { useState } from 'react';

export default function TimeframeSelector() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  
  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', 'All'];

  return (
    <div className="flex space-x-2">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => setSelectedTimeframe(timeframe)}
          className={`
            px-3 py-1 text-xs rounded-full transition-all
            ${selectedTimeframe === timeframe 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
}
