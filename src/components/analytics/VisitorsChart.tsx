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
import { ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VisitorsChartProps {
  sourceId: string;
  startDate: string;
  endDate: string;
  period: string;
  reportId?: string;
}

// Sample data
const sampleData = [
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
  { label: '7 derniers jours', value: '7d' },
  { label: '30 derniers jours', value: '30d' },
  { label: '90 derniers jours', value: '90d' },
  { label: 'Cette année', value: 'year' },
  { label: 'Tout', value: 'all' },
];

const VisitorsChart: React.FC<VisitorsChartProps> = ({ sourceId, startDate, endDate, period, reportId }) => {
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  
  const { data, isLoading, error } = useAnalyticsData({
    sourceId,
    startDate,
    endDate,
    reportId,
    metrics: ['activeUsers', 'newUsers'],
    dimensions: ['date'],
  });

  // Transformer les données pour le graphique
  const transformData = () => {
    if (!data || !data.rows || !sourceId) return sampleData;
    
    return data.rows.map((row) => {
      const date = row.dimensionValues[0].value;
      const visitors = parseInt(row.metricValues[0].value);
      const pageViews = parseInt(row.metricValues[1]?.value || '0');
      
      return {
        name: format(parseISO(date), 'dd MMM', { locale: fr }),
        visitors,
        pageViews,
        fullDate: date, // pour le tooltip
      };
    });
  };

  const chartData = transformData();

  return (
    <div className="glass-card p-5 h-[400px] animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-analytics-gray-900">Tendances des visiteurs</h3>
        <div className="relative">
          <button 
            onClick={() => setShowPeriodSelector(!showPeriodSelector)}
            className="btn-outline text-sm px-3 py-1.5 flex items-center"
          >
            {periods.find(p => p.value === period)?.label || '30 derniers jours'}
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
      
      {isLoading && sourceId ? (
        <div className="h-[calc(100%-50px)] flex justify-center items-center">
          <RefreshCw className="animate-spin h-8 w-8 text-analytics-gray-400" />
        </div>
      ) : error ? (
        <div className="h-[calc(100%-50px)] flex flex-col justify-center items-center text-center p-6">
          <AlertCircle className="h-10 w-10 text-analytics-error mb-3" />
          <p className="text-analytics-gray-700">Une erreur est survenue lors du chargement des données.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart
            data={chartData}
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
              formatter={(value: number) => [value.toLocaleString(), '']}
              labelFormatter={(label, item) => {
                const dataItem = item[0]?.payload;
                if (dataItem?.fullDate) {
                  return format(parseISO(dataItem.fullDate), 'dd MMMM yyyy', { locale: fr });
                }
                return label;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="visitors" 
              name="Visiteurs"
              stroke="#3B82F6" 
              fillOpacity={1}
              fill="url(#colorVisitors)" 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Area 
              type="monotone" 
              dataKey="pageViews" 
              name="Pages vues"
              stroke="#8B5CF6" 
              fillOpacity={1}
              fill="url(#colorPageViews)" 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default VisitorsChart;
