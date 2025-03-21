
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw, FileBarChart } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import CreateReportModal from '@/components/analytics/CreateReportModal';
import { AnalyticsReportWithSource } from '@/types/supabase-extensions';

const AnalyticsReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['analyticsReports', user?.id],
    queryFn: async () => {
      // Use raw RPC call instead of typed tables
      const { data, error } = await supabase
        .rpc('get_analytics_reports_with_sources');
      
      if (error) throw new Error(error.message);
      return data as AnalyticsReportWithSource[];
    },
    enabled: !!user?.id,
  });

  const handleDeleteReport = async (id: string) => {
    try {
      // Using rpc instead of direct table access
      const { error } = await supabase
        .rpc('delete_analytics_report', { report_id: id });
      
      if (error) throw error;
      
      toast({
        title: "Rapport supprimé",
        description: "Le rapport a été supprimé avec succès.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du rapport.",
        variant: "destructive",
      });
      console.error("Erreur de suppression:", error);
    }
  };

  const handleViewReport = (id: string) => {
    navigate(`/dashboard?report=${id}`);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <div className="flex h-screen bg-analytics-gray-50">
      <Sidebar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Rapports d'Analytics" 
          subtitle="Gérez vos rapports et analyses sauvegardés"
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-analytics-gray-900">Vos rapports</h2>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-analytics-blue hover:bg-analytics-blue/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Créer un rapport
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-analytics-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              Une erreur est survenue lors du chargement des rapports.
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-analytics-gray-900">{report.name}</h3>
                        <p className="text-sm text-analytics-gray-500 mt-1">
                          Source: {report.analytics_sources?.name || 'Inconnue'}
                        </p>
                      </div>
                      <div className="bg-analytics-blue/10 p-2 rounded-full">
                        <FileBarChart className="h-5 w-5 text-analytics-blue" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-analytics-gray-600">{report.description || 'Aucune description'}</p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-analytics-gray-500">Période:</span>
                        <span className="text-analytics-gray-700 font-medium">
                          {formatDateRange(report.start_date, report.end_date)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-analytics-gray-500">Métriques:</span>
                        <span className="text-analytics-gray-700 font-medium">
                          {report.metrics?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-analytics-gray-500">Créé le:</span>
                        <span className="text-analytics-gray-700 font-medium">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-analytics-gray-200 p-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewReport(report.id)}
                    >
                      Afficher
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-analytics-blue/10 flex items-center justify-center mb-4">
                <FileBarChart className="h-6 w-6 text-analytics-blue" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun rapport sauvegardé
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Vous n'avez pas encore créé de rapport d'analytics. Créez un rapport personnalisé pour sauvegarder vos métriques importantes.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-analytics-blue hover:bg-analytics-blue/90 text-white"
              >
                Créer un rapport
              </Button>
            </div>
          )}
        </main>
      </div>

      <CreateReportModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default AnalyticsReports;
