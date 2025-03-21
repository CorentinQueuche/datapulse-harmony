import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, RefreshCw, LineChart } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import VisitorsChart from '@/components/analytics/VisitorsChart';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
import TrafficSources from '@/components/analytics/TrafficSources';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import NotificationsPanel from '@/components/analytics/NotificationsPanel';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { AnalyticsReport } from '@/types/supabase-extensions';

const DateRangeSelector = ({ selectedPeriod, onChange }: { selectedPeriod: string; onChange: (period: string) => void }) => (
  <div className="flex items-center">
    <label htmlFor="period" className="mr-2 text-sm text-gray-700">Période:</label>
    <select
      id="period"
      className="px-4 py-2 bg-white border rounded-md shadow-sm text-sm"
      value={selectedPeriod}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="7d">7 jours</option>
      <option value="30d">30 jours</option>
      <option value="90d">90 jours</option>
    </select>
  </div>
);

const periodOptions = [
  { label: '7 jours', value: '7d' },
  { label: '30 jours', value: '30d' },
  { label: '90 jours', value: '90d' },
];

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('report');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isSourcesDropdownOpen, setIsSourcesDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const endDate = new Date();
  let startDate = subDays(endDate, 30);

  if (selectedPeriod === '7d') {
    startDate = subDays(endDate, 7);
  } else if (selectedPeriod === '90d') {
    startDate = subDays(endDate, 90);
  }

  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['analyticsSources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['analyticsReport', reportId],
    queryFn: async () => {
      if (!reportId) return null;
      
      const { data, error } = await supabase
        .rpc('get_analytics_report_with_source', { report_id: reportId });
      
      if (error) throw new Error(error.message);
      return data as unknown as AnalyticsReport & { analytics_sources: { name: string } | null };
    },
    enabled: !!reportId
  });

  useEffect(() => {
    if (report) {
      setSelectedSourceId(report.source_id);
    }
  }, [report]);

  const handleSourceChange = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setIsSourcesDropdownOpen(false);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const { data: analyticsData, isLoading: dataLoading, error: dataError } = useAnalyticsData({
    sourceId: selectedSourceId,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    reportId: reportId || undefined
  });

  const isLoading = sourcesLoading || dataLoading || (reportId && reportLoading);

  const renderSourcesDropdown = () => (
    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
      {sources?.map((source) => (
        <button
          key={source.id}
          onClick={() => handleSourceChange(source.id)}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedSourceId === source.id ? 'bg-gray-100' : ''}`}
        >
          {source.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-analytics-gray-50">
      <Sidebar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={report ? report.name : "Tableau de bord"} 
          subtitle={report 
            ? `Source: ${report.analytics_sources?.name || 'Inconnue'} | Période: ${format(new Date(report.start_date), 'dd/MM/yyyy')} - ${format(new Date(report.end_date), 'dd/MM/yyyy')}`
            : "Vue d'ensemble de vos performances"
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {!report && (
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsSourcesDropdownOpen(!isSourcesDropdownOpen)}
                  className="flex items-center px-4 py-2 bg-white border rounded-md shadow-sm text-sm"
                >
                  <span>Source: {sources?.find(s => s.id === selectedSourceId)?.name || 'Choisir une source'}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                
                {isSourcesDropdownOpen && renderSourcesDropdown()}
              </div>
              
              <DateRangeSelector 
                selectedPeriod={selectedPeriod}
                onChange={handlePeriodChange}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-analytics-gray-400" />
            </div>
          ) : dataError ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              Une erreur est survenue lors du chargement des données d'analytics.
            </div>
          ) : !selectedSourceId && !report ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-analytics-blue/10 flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-analytics-blue" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune source sélectionnée
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Veuillez sélectionner une source d'analytics pour afficher les données.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <AnalyticsSummary 
                  sourceId={selectedSourceId || ''} 
                  startDate={report ? report.start_date : startDate.toISOString().split('T')[0]} 
                  endDate={report ? report.end_date : endDate.toISOString().split('T')[0]}
                  reportId={reportId || undefined}
                />
                
                <div className="lg:col-span-1">
                  <NotificationsPanel />
                </div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <VisitorsChart 
                  sourceId={selectedSourceId || ''} 
                  startDate={report ? report.start_date : startDate.toISOString().split('T')[0]} 
                  endDate={report ? report.end_date : endDate.toISOString().split('T')[0]} 
                  period={selectedPeriod}
                  reportId={reportId || undefined}
                />

                <PerformanceMetrics 
                  sourceId={selectedSourceId || ''} 
                  startDate={report ? report.start_date : startDate.toISOString().split('T')[0]} 
                  endDate={report ? report.end_date : endDate.toISOString().split('T')[0]}
                  reportId={reportId || undefined}
                />
              </div>
              
              <div>
                <TrafficSources 
                  sourceId={selectedSourceId || ''} 
                  startDate={report ? report.start_date : startDate.toISOString().split('T')[0]} 
                  endDate={report ? report.end_date : endDate.toISOString().split('T')[0]}
                  reportId={reportId || undefined}
                />
              </div>
              
              {report && report.dimensions && report.dimensions.includes('deviceCategory') && (
                <div>
                  {/* Custom dimensions visualization would go here */}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
