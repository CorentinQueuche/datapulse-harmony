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
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

interface PerformanceMetricsProps {
  sourceId: string;
  startDate: string;
  endDate: string;
  reportId?: string;
}

// Sample data
const sampleData = [
  { name: 'Accueil', visits: 4000, conversion: 2400 },
  { name: 'Produits', visits: 3000, conversion: 1398 },
  { name: 'Tarifs', visits: 2000, conversion: 980 },
  { name: 'Blog', visits: 2780, conversion: 908 },
  { name: 'À propos', visits: 1890, conversion: 300 },
  { name: 'Contact', visits: 2390, conversion: 800 },
];

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ sourceId, startDate, endDate, reportId }) => {
  const { data, isLoading, error } = useAnalyticsData({
    sourceId,
    startDate,
    endDate,
    reportId,
    metrics: ['pageviews', 'avgPageLoadTime', 'bounceRate'],
    dimensions: ['pagePath'],
  });

  // Transformer les données pour le graphique
  const transformData = () => {
    if (!data || !data.rows || !sourceId) return sampleData;
    
    // Dans un cas réel, nous utiliserions les données de l'API
    // Ici, nous utilisons des données simulées
    return sampleData;
  };

  const chartData = transformData();

  return (
    <div className="glass-card p-5 h-[400px] animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-analytics-gray-900">Performance des pages</h3>
        <div className="flex space-x-3 items-center">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-analytics-blue mr-2"></div>
            <span className="text-xs text-analytics-gray-600">Visites</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-analytics-violet mr-2"></div>
            <span className="text-xs text-analytics-gray-600">Conversions</span>
          </div>
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
          <BarChart
            data={chartData}
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
              formatter={(value: number) => [value.toLocaleString(), '']}
            />
            <Bar 
              dataKey="visits" 
              name="Visites"
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="conversion" 
              name="Conversions"
              fill="#8B5CF6" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PerformanceMetrics;
