
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import VisitorsChart from '@/components/analytics/VisitorsChart';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
import TrafficSources from '@/components/analytics/TrafficSources';
import { Calendar, ChevronDown, Filter, RefreshCw, Database, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('report');
  const [websiteFilter, setWebsiteFilter] = useState('all');
  const [showWebsiteFilter, setShowWebsiteFilter] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [showDateRange, setShowDateRange] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  
  // Dates pour le filtrage
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDates = {
    'today': format(new Date(), 'yyyy-MM-dd'),
    'yesterday': format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    '7d': format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    '30d': format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    '90d': format(subDays(new Date(), 90), 'yyyy-MM-dd'),
  };
  const startDate = startDates[dateRange as keyof typeof startDates] || startDates['30d'];
  
  // Récupérer le rapport si reportId est fourni
  const { data: report, isLoading: loadingReport } = useQuery({
    queryKey: ['analyticsReport', reportId],
    queryFn: async () => {
      if (!reportId) return null;
      
      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*, analytics_sources(name)')
        .eq('id', reportId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!reportId && !!user?.id,
    onSuccess: (data) => {
      if (data) {
        setSelectedSourceId(data.source_id);
        toast({
          title: "Rapport chargé",
          description: `Le rapport "${data.name}" a été chargé avec succès.`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de charger le rapport demandé.",
        variant: "destructive",
      });
    }
  });
  
  // Récupérer les sources d'analytics
  const { data: sources, isLoading: loadingSources } = useQuery({
    queryKey: ['analyticsSources', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Sélectionner automatiquement la première source si aucune n'est sélectionnée
  useEffect(() => {
    if (sources && sources.length > 0 && !selectedSourceId && !reportId) {
      setSelectedSourceId(sources[0].id);
    }
  }, [sources, selectedSourceId, reportId]);
  
  const dateRanges = [
    { label: 'Aujourd\'hui', value: 'today' },
    { label: 'Hier', value: 'yesterday' },
    { label: '7 derniers jours', value: '7d' },
    { label: '30 derniers jours', value: '30d' },
    { label: '90 derniers jours', value: '90d' },
  ];

  const isLoading = loadingSources || loadingReport;

  return (
    <div className="flex h-screen bg-analytics-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={report ? `Rapport: ${report.name}` : "Dashboard"} 
          subtitle={report ? `${report.analytics_sources?.name || 'Source inconnue'} • ${new Date(report.start_date).toLocaleDateString()} - ${new Date(report.end_date).toLocaleDateString()}` : "Vue d'ensemble de vos données d'analytics"}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold text-analytics-gray-900">
                {report ? report.name : "Vue d'ensemble"}
              </h2>
              <div className="ml-3 px-2 py-1 bg-analytics-blue bg-opacity-10 rounded-md text-xs font-medium text-analytics-blue">
                Live
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!report && sources && sources.length > 0 ? (
                <>
                  <div className="relative">
                    <button 
                      onClick={() => setShowWebsiteFilter(!showWebsiteFilter)} 
                      className="btn-outline flex items-center px-3 py-2 text-sm"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      <span>{
                        selectedSourceId 
                          ? sources.find(s => s.id === selectedSourceId)?.name || 'Toutes les sources'
                          : 'Toutes les sources'
                      }</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                    
                    {showWebsiteFilter && (
                      <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md border border-analytics-gray-200 py-1 z-10">
                        {sources.map((source) => (
                          <button
                            key={source.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-analytics-gray-100 transition-colors duration-200"
                            onClick={() => {
                              setSelectedSourceId(source.id);
                              setShowWebsiteFilter(false);
                            }}
                          >
                            {source.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowDateRange(!showDateRange)}
                      className="btn-outline flex items-center px-3 py-2 text-sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{dateRanges.find(d => d.value === dateRange)?.label || '30 derniers jours'}</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                    
                    {showDateRange && (
                      <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md border border-analytics-gray-200 py-1 z-10">
                        {dateRanges.map((range) => (
                          <button
                            key={range.value}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-analytics-gray-100 transition-colors duration-200"
                            onClick={() => {
                              setDateRange(range.value);
                              setShowDateRange(false);
                            }}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : report ? (
                <div className="flex gap-2">
                  <Link to="/analytics-reports">
                    <Button variant="outline" size="sm">
                      Tous les rapports
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard standard
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-analytics-gray-400" />
            </div>
          ) : !sources || sources.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-analytics-blue/10 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-analytics-blue" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune source d'analytics
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Vous n'avez pas encore connecté de source d'analytics. Ajoutez Google Analytics pour commencer à visualiser vos données.
              </p>
              <Link to="/analytics-sources">
                <Button className="bg-analytics-blue hover:bg-analytics-blue/90 text-white">
                  Ajouter une source
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <AnalyticsSummary 
                sourceId={selectedSourceId}
                startDate={report ? report.start_date : startDate}
                endDate={report ? report.end_date : endDate}
                reportId={reportId || undefined}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisitorsChart 
                  sourceId={selectedSourceId}
                  startDate={report ? report.start_date : startDate}
                  endDate={report ? report.end_date : endDate}
                  period={dateRange}
                  reportId={reportId || undefined}
                />
                <PerformanceMetrics 
                  sourceId={selectedSourceId}
                  startDate={report ? report.start_date : startDate}
                  endDate={report ? report.end_date : endDate}
                  reportId={reportId || undefined}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TrafficSources 
                  sourceId={selectedSourceId}
                  startDate={report ? report.start_date : startDate}
                  endDate={report ? report.end_date : endDate}
                  reportId={reportId || undefined}
                />
                
                <div className="glass-card p-5 col-span-1 lg:col-span-2 animate-fade-in">
                  <h3 className="text-lg font-semibold text-analytics-gray-900 mb-4">
                    Pages les plus visitées
                    {report && report.dimensions.includes('page') && " (Rapport)"}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-analytics-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Page</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Visiteurs</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Pages vues</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Temps moyen</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-analytics-gray-500 uppercase tracking-wider">Taux de rebond</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { page: '/home', visitors: 8241, views: 10432, time: '2:12', bounce: '32%' },
                          { page: '/products', visitors: 6389, views: 8954, time: '3:45', bounce: '28%' },
                          { page: '/about', visitors: 4128, views: 5621, time: '1:54', bounce: '45%' },
                          { page: '/blog', visitors: 3852, views: 6284, time: '4:21', bounce: '22%' },
                          { page: '/contact', visitors: 2914, views: 3526, time: '1:32', bounce: '51%' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-analytics-gray-200 hover:bg-analytics-gray-50 transition-colors duration-150">
                            <td className="px-4 py-3 text-sm text-analytics-gray-900 font-medium">{row.page}</td>
                            <td className="px-4 py-3 text-sm text-analytics-gray-600 text-right">{row.visitors.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-analytics-gray-600 text-right">{row.views.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-analytics-gray-600 text-right">{row.time}</td>
                            <td className="px-4 py-3 text-sm text-analytics-gray-600 text-right">{row.bounce}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
