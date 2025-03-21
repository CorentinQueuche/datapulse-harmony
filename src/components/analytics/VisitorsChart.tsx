
import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ChevronDown } from 'lucide-react';

// Sample data
const data = [
  { name: 'Jan', visitors: 4000, pageViews: 8400 },
  { name: 'Feb', visitors: 3000, pageViews: 6398 },
  { name: 'Mar', visitors: 2000, pageViews: 5800 },
  { name: 'Apr', visitors: 2780, pageViews: 7908 },
  { name: 'May', visitors: 1890, pageViews: 6800 },
  { name: 'Jun', visitors: 2390, pageViews: 7800 },
  { name: 'Jul', visitors: 3490, pageViews: 9300 },
  { name: 'Aug', visitors: 3200, pageViews: 8700 },
  { name: 'Sep', visitors: 2800, pageViews: 7300 },
  { name: 'Oct', visitors: 2950, pageViews: 7900 },
  { name: 'Nov', visitors: 3300, pageViews: 8900 },
  { name: 'Dec', visitors: 3700, pageViews: 9600 },
];

const periods = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This year', value: 'year' },
  { label: 'All time', value: 'all' },
];

const VisitorsChart: React.FC = () => {
  const [period, setPeriod] = useState('30d');
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

  return (
    <div className="glass-card p-5 h-[400px] animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-analytics-gray-900">Visitor Trends</h3>
        <div className="relative">
          <button 
            onClick={() => setShowPeriodSelector(!showPeriodSelector)}
            className="btn-outline text-sm px-3 py-1.5 flex items-center"
          >
            {periods.find(p => p.value === period)?.label}
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>
          {showPeriodSelector && (
            <div className="absolute right-0 mt-1 w-40 bg-white shadow-lg rounded-md border border-analytics-gray-200 py-1 z-10">
              {periods.map((p) => (
                <button
                  key={p.value}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-analytics-gray-100 transition-colors duration-200"
                  onClick={() => {
                    setPeriod(p.value);
                    setShowPeriodSelector(false);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
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
            itemStyle={{ fontWeight: 500 }}
            labelStyle={{ fontWeight: 600, marginBottom: '8px', color: '#374151' }}
          />
          <Area 
            type="monotone" 
            dataKey="visitors" 
            stroke="#3B82F6" 
            fillOpacity={1}
            fill="url(#colorVisitors)" 
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
          <Area 
            type="monotone" 
            dataKey="pageViews" 
            stroke="#8B5CF6" 
            fillOpacity={1}
            fill="url(#colorPageViews)" 
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VisitorsChart;
