export default function FeatureImportance() {
  const features = [
    { name: 'Closing Price', importance: 35 },
    { name: 'Trading Volume', importance: 25 },
    { name: 'Economic Indicators', importance: 20 },
    { name: 'Market Sentiment', importance: 15 },
    { name: 'Technical Indicators', importance: 5 }
  ];

  return (
    <div className="space-y-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">{feature.name}</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${feature.importance}%` }}
              ></div>
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-600">
            {feature.importance}%
          </div>
        </div>
      ))}
    </div>
  );
}
