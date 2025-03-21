import AIStockChatbot from "@/components/chatbot/AIStockChatbot";
import MarketSummary from '@/components/dashboard/MarketSummary';
import Portfolio from '@/components/dashboard/Portfolio';
import NewsSection from '@/components/dashboard/NewsSection';
import SearchBar from '@/components/dashboard/SearchBar';
import PredictionChart from '@/components/predictions/PredictionChart';
import ChatInterface from '@/components/ai-chatbot/ChatInterface';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <SearchBar />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Stock Prediction</h2>
            <PredictionChart />
          </div>
          
          <Portfolio />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">AI Trading Assistant</h2>
            <ChatInterface />
          </div>
          
          <NewsSection />
        </div>
      </div>
      
      {/* AI Stock Chatbot fixed position at bottom right */}
      <AIStockChatbot ticker="AAPL" />
    </div>
  );
}