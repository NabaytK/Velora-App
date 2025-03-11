import ModelExplainer from '@/components/ai-explanation/ModelExplainer';
import FeatureImportance from '@/components/ai-explanation/FeatureImportance';
import PredictionFactors from '@/components/ai-explanation/PredictionFactors';

export default function AIExplanation() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">AI Explanation</h1>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">How Our AI Works</h2>
        <ModelExplainer />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Feature Importance</h2>
          <FeatureImportance />
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Prediction Factors</h2>
          <PredictionFactors />
        </div>
      </div>
    </div>
  );
}
