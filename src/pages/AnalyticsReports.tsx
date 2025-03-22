
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreateReportModal from '@/components/analytics/CreateReportModal';
import { AnalyticsReportWithSource } from '@/types/supabase-extensions';

const AnalyticsReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch reports with their source names
  const { data: reports, isLoading } = useQuery({
    queryKey: ['analyticsReports'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_reports_with_sources');
      
      if (error) throw new Error(error.message);
      
      return data as unknown as AnalyticsReportWithSource[];
    },
    meta: {
      errorMessage: 'Failed to fetch reports'
    }
  });

  // Delete report mutation
  const deleteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase.rpc('delete_analytics_report', {
        report_id: reportId  // Changed from p_report_id to report_id
      });
      
      if (error) throw new Error(error.message);
      
      return reportId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsReports'] });
      toast({
        title: "Rapport supprimé",
        description: "Le rapport a été supprimé avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleDeleteReport = (reportId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) {
      deleteMutation.mutate(reportId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Rapports Analytics" subtitle="Gérez vos rapports d'analyses" />
      <div className="flex">
        <Sidebar isMenuOpen={false} toggleMenu={() => {}} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Rapports Analytics</h1>
                <p className="text-muted-foreground">Gérez vos rapports analytics personnalisés</p>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau rapport
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du rapport</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.analytics_sources?.name || 'Inconnue'}</TableCell>
                        <TableCell>
                          {format(new Date(report.start_date), 'dd/MM/yyyy')} - {format(new Date(report.end_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{format(new Date(report.created_at), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteReport(report.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <h3 className="mt-4 text-lg font-semibold">Aucun rapport</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Vous n'avez pas encore créé de rapport. Créez votre premier rapport pour visualiser vos données analytics.
                  </p>
                  <Button variant="default" onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un rapport
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <CreateReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </main>
      </div>
    </div>
  );
};

export default AnalyticsReports;
