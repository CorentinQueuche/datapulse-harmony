
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AddAnalyticsSourceModal from '@/components/analytics/AddAnalyticsSourceModal';

const AnalyticsSources = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: sources, isLoading } = useQuery({
    queryKey: ['analyticsSources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      const { error } = await supabase
        .from('analytics_sources')
        .delete()
        .eq('id', sourceId);
      
      if (error) throw error;
      return sourceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsSources'] });
      toast({
        title: "Source supprimée",
        description: "La source d'analytics a été supprimée avec succès."
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

  const handleDeleteSource = (sourceId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette source ?")) {
      deleteMutation.mutate(sourceId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Sources Analytics" 
        subtitle="Gérez vos sources de données analytics"
      />
      <div className="flex">
        <Sidebar isMenuOpen={false} toggleMenu={() => {}} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Sources Analytics</h1>
                <p className="text-muted-foreground">Gérez vos sources de données analytics (Google Analytics 4, etc.)</p>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle source
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sources && sources.length > 0 ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Property ID</TableHead>
                      <TableHead>Dernière synchronisation</TableHead>
                      <TableHead>Créée le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="font-medium">{source.name}</TableCell>
                        <TableCell>{source.property_id}</TableCell>
                        <TableCell>
                          {source.last_synced ? format(new Date(source.last_synced), 'dd/MM/yyyy HH:mm') : 'Jamais'}
                        </TableCell>
                        <TableCell>{format(new Date(source.created_at), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteSource(source.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === source.id ? (
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
                  <h3 className="mt-4 text-lg font-semibold">Aucune source d'analytics</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Vous n'avez pas encore configuré de source d'analytics. Ajoutez votre première source pour commencer.
                  </p>
                  <Button variant="default" onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une source
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <AddAnalyticsSourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </main>
      </div>
    </div>
  );
};

export default AnalyticsSources;
