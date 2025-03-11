import MarketSummary from '@/components/dashboard/MarketSummary';
import Portfolio from '@/components/dashboard/Portfolio';
import NewsSection from '@/components/dashboard/NewsSection';
import SearchBar from '@/components/dashboard/SearchBar';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <SearchBar />
      </div>
      
      <MarketSummary />
      <Portfolio />
      <NewsSection />
    </div>
  );
}
