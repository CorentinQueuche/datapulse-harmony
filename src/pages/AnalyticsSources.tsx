import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw, Database } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import AddAnalyticsSourceModal from '@/components/analytics/AddAnalyticsSourceModal';

const AnalyticsSources = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const { data: sources, isLoading, error, refetch } = useQuery({
    queryKey: ['analyticsSources', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user?.id,
  });

  const handleDeleteSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('analytics_sources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Source supprimée",
        description: "La source d'analytics a été supprimée avec succès.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la source.",
        variant: "destructive",
      });
      console.error("Erreur de suppression:", error);
    }
  };

  return (
    <div className="flex h-screen bg-analytics-gray-50">
      <Sidebar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Sources d'Analytics" 
          subtitle="Gérez vos connexions aux plateformes d'analytics"
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-analytics-gray-900">Vos sources de données</h2>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-analytics-blue hover:bg-analytics-blue/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Ajouter une source
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-analytics-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              Une erreur est survenue lors du chargement des sources d'analytics.
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Synchronisation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière synchronisation</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sources.map((source) => (
                    <tr key={source.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{source.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{source.property_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{source.sync_frequency || 'Manuel'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {source.last_synced 
                            ? new Date(source.last_synced).toLocaleString() 
                            : 'Jamais'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSource(source.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-analytics-blue/10 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-analytics-blue" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune source d'analytics
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Vous n'avez pas encore connecté de source d'analytics. Ajoutez Google Analytics pour commencer à visualiser vos données.
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-analytics-blue hover:bg-analytics-blue/90 text-white"
              >
                Ajouter Google Analytics
              </Button>
            </div>
          )}
        </main>
      </div>

      <AddAnalyticsSourceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};

export default AnalyticsSources;
