import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PredictionChart() {
  const [chartData, setChartData] = useState([
    { date: '2025-01-01', historical: 180, predicted: null },
    { date: '2025-01-02', historical: 182, predicted: null },
    { date: '2025-01-03', historical: 181, predicted: null },
    { date: '2025-01-04', historical: 183, predicted: null },
    { date: '2025-01-05', historical: 185, predicted: 187 },
    { date: '2025-01-06', historical: null, predicted: 188 },
    { date: '2025-01-07', historical: null, predicted: 190 },
  ]);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="historical" 
            stroke="#8884d8" 
            strokeWidth={2} 
            dot={{ stroke: '#8884d8', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#82ca9d" 
            strokeDasharray="5 5" 
            dot={{ stroke: '#82ca9d', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
