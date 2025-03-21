
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Sample data
const data = [
  { name: 'Direct', value: 35, color: '#3B82F6' },
  { name: 'Search', value: 25, color: '#8B5CF6' },
  { name: 'Social', value: 20, color: '#10B981' },
  { name: 'Referral', value: 15, color: '#F59E0B' },
  { name: 'Email', value: 5, color: '#EF4444' },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

const TrafficSources: React.FC = () => {
  return (
    <div className="glass-card p-5 h-[400px] animate-fade-in">
      <h3 className="text-lg font-semibold text-analytics-gray-900 mb-6">Traffic Sources</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="40%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E5E7EB',
              padding: '12px'
            }}
            itemStyle={{ fontWeight: 500 }}
            formatter={(value: number) => [`${value}%`, 'Percentage']}
            labelStyle={{ fontWeight: 600, marginBottom: '8px', color: '#374151' }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficSources;
