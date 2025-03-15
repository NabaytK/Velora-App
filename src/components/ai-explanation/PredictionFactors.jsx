'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PredictionChart({ symbol = 'AAPL' }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample prediction data (replace with actual data fetching)
  useEffect(() => {
    const generateSampleData = () => {
      const basePrice = Math.random() * 100 + 100; // Random base price
      const data = [];
      
      // Historical data
      for (let i = -30; i < 0; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        data.push({
          date: date.toISOString().split('T')[0],
          price: basePrice + Math.sin(i/5) * 10,
          type: 'historical'
        });
      }

      // Predicted data
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        data.push({
          date: date.toISOString().split('T')[0],
          price: basePrice + Math.sin(i/3) * 15,
          type: 'prediction'
        });
      }

      setChartData(data);
      setLoading(false);
    };

    generateSampleData();
  }, [symbol]);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading chart</div>;

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
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            name="Historical Price"
            filter={d => d.type === 'historical'}
          />
          
          <Line 
            type="monotone" 
            dataKey="price"
            stroke="#82ca9d"
            strokeDasharray="5 5"
            dot={false}
            name="Predicted Price"
            filter={d => d.type === 'prediction'}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}