export default function PredictionFactors() {
  const factors = [
    { 
      name: 'Company Earnings', 
      description: 'Quarterly financial performance impacts stock valuation',
      impact: 'High'
    },
    { 
      name: 'Market Sentiment', 
      description: 'Investor perception and social media trends',
      impact: 'Medium'
    },
    { 
      name: 'Economic Indicators', 
      description: 'GDP, inflation, and employment rates',
      impact: 'High'
    },
    { 
      name: 'Technical Analysis', 
      description: 'Historical price patterns and trading volumes',
      impact: 'Medium'
    }
  ];

  const impactColors = {
    'High': 'bg-red-100 text-red-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-4">
      {factors.map((factor, index) => (
        <div 
          key={index} 
          className="p-4 bg-white border rounded-lg hover:shadow-sm transition"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800">{factor.name}</h3>
            <span 
              className={`px-2 py-1 text-xs rounded-full ${impactColors[factor.impact]}`}
            >
              {factor.impact} Impact
            </span>
          </div>
          <p className="text-xs text-gray-600">{factor.description}</p>
        </div>
      ))}
    </div>
  );
}
