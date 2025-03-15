import CandlestickChart from '@/app/dashboard/graphs/CandlestickChart';
import SentimentAnalysis from '@/app/dashboard/graphs/SentimentAnalysis';
import CorrelationGraph from '@/app/dashboard/graphs/CorrelationGraph';
import SearchBar from '@/components/dashboard/SearchBar';

export default function Graphs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Graphs & Analysis</h1>
        <SearchBar />
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">AAPL Price Chart</h2>
        <CandlestickChart />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Sentiment Analysis</h2>
          <SentimentAnalysis />
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Market Correlation</h2>
          <CorrelationGraph />
        </div>
      </div>
    </div>
  );
}
