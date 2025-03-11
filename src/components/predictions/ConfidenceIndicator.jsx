export default function ConfidenceIndicator({ value }) {
  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${
            value >= 80 ? 'bg-green-500' : 
            value >= 60 ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 mt-1">
        Confidence: {value}%
      </div>
    </div>
  );
}
