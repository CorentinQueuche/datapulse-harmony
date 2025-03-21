
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Sample data
const data = [
  { name: 'Home', visits: 4000, conversion: 2400 },
  { name: 'Products', visits: 3000, conversion: 1398 },
  { name: 'Pricing', visits: 2000, conversion: 980 },
  { name: 'Blog', visits: 2780, conversion: 908 },
  { name: 'About', visits: 1890, conversion: 300 },
  { name: 'Contact', visits: 2390, conversion: 800 },
];

const PerformanceMetrics: React.FC = () => {
  return (
    <div className="glass-card p-5 h-[400px] animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-analytics-gray-900">Page Performance</h3>
        <div className="flex space-x-3 items-center">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-analytics-blue mr-2"></div>
            <span className="text-xs text-analytics-gray-600">Visits</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-analytics-violet mr-2"></div>
            <span className="text-xs text-analytics-gray-600">Conversions</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 20,
          }}
          barGap={8}
          barSize={16}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            width={30}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E5E7EB',
              padding: '12px'
            }}
            cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }}
            itemStyle={{ fontWeight: 500 }}
            labelStyle={{ fontWeight: 600, marginBottom: '8px', color: '#374151' }}
          />
          <Bar 
            dataKey="visits" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="conversion" 
            fill="#8B5CF6" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceMetrics;
