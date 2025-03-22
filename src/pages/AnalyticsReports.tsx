
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, FileBarChart, Trash2, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CreateReportModal from '@/components/analytics/CreateReportModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { AnalyticsReportWithSource } from '@/types/supabase-extensions';

const AnalyticsReports = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch analytics reports
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['analyticsReports'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_reports_with_sources');
      
      if (error) throw new Error(error.message);
      return data as AnalyticsReportWithSource[];
    },
    meta: {
      errorMessage: 'Failed to fetch analytics reports'
    }
  });

  // Delete report mutation
  const deleteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase.rpc('delete_analytics_report', { report_id: reportId });
      if (error) throw new Error(error.message);
      return reportId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsReports'] });
      toast({
        title: "Rapport supprimé",
        description: "Le rapport a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le rapport: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport?")) {
      deleteMutation.mutate(reportId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar isMenuOpen={false} toggleMenu={() => {}} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Rapports Analytics</h1>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Créer un rapport
              </Button>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Erreur lors du chargement des rapports</h3>
                <p className="text-gray-500 mt-2">Veuillez réessayer ultérieurement</p>
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                  <Card key={report.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileBarChart className="h-5 w-5 mr-2 text-analytics-blue" />
                        {report.name}
                      </CardTitle>
                      <CardDescription>
                        {report.description || 'Aucune description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Source:</span>
                          <span className="font-medium">{report.analytics_sources?.name || 'Inconnue'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Créé le:</span>
                          <span>{format(new Date(report.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Métriques:</span>
                          <span className="font-medium">{(report.metrics && report.metrics.length) || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline" asChild>
                        <a href={`/dashboard?report=${report.id}`}>Visualiser</a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border border-dashed rounded-lg">
                <FileBarChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun rapport analytics</h3>
                <p className="text-gray-500 mb-4">Créez votre premier rapport pour commencer à analyser vos données.</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Créer un rapport
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateReportModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default AnalyticsReports;
