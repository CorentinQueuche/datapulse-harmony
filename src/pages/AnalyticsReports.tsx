import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { CreateReportModal } from '@/components/analytics/CreateReportModal';
import { AnalyticsReportWithSource } from '@/types/supabase-extensions';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsReports = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['analyticsReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_analytics_reports_with_sources');
      
      if (error) throw new Error(error.message);
      return data as AnalyticsReportWithSource[];
    }
  });

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .rpc('delete_analytics_report', { report_id: reportId });
      
      if (error) throw error;
      
      toast({
        title: "Rapport supprimé",
        description: "Le rapport a été supprimé avec succès",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rapport",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar isMenuOpen={false} toggleMenu={() => {}} />
        <main className="flex-1 p-4">
          <div className="container mx-auto py-10">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-semibold text-gray-800">Rapports Analytics</h1>
              <Button onClick={() => setOpen(true)}>Créer un rapport</Button>
            </div>

            <CreateReportModal open={open} onClose={() => setOpen(false)} onSuccess={refetch} />

            {isLoading ? (
              <p>Chargement des rapports...</p>
            ) : error ? (
              <p className="text-red-500">Erreur: {error.message}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>Liste des rapports analytics.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Nom</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date de début</TableHead>
                      <TableHead>Date de fin</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports?.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.analytics_sources?.name}</TableCell>
                        <TableCell>{format(new Date(report.start_date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                        <TableCell>{format(new Date(report.end_date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/analytics-reports/${report.id}`} className="text-blue-500 hover:underline mr-2">
                            Voir
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteReport(report.id)}>Supprimer</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsReports;
