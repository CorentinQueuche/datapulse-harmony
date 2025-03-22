
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import VisitorsChart from '@/components/analytics/VisitorsChart';
import MetricCard from '@/components/analytics/MetricCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { LineChart } from 'lucide-react';
import { AnalyticsReportWithSource } from '@/types/supabase-extensions';

const Dashboard = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState('30d');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Replace the featuredReport query with:
  const { data: featuredReport, isLoading: isReportLoading } = useQuery({
    queryKey: ['featuredReport'],
    queryFn: async () => {
      // First get the reports
      const { data, error } = await supabase.rpc('get_analytics_reports_with_sources');
      if (error) throw new Error(error.message);
      
      // Find the most recent report (assuming they're returned in descending order)
      const reports = data as unknown as AnalyticsReportWithSource[];
      return reports && reports.length > 0 ? reports[0] : null;
    },
    meta: {
      errorMessage: 'Failed to fetch featured report'
    }
  });

  const { data: sources, isLoading: isSourcesLoading } = useQuery({
    queryKey: ['analyticsSources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    meta: {
      errorMessage: 'Failed to fetch analytics sources'
    }
  });

  // Update dates when period changes
  useEffect(() => {
    const now = new Date();
    let start;
    
    switch(period) {
      case '7d':
        start = subDays(now, 7);
        break;
      case '30d':
        start = subDays(now, 30);
        break;
      case '90d':
        start = subDays(now, 90);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
        break;
      default:
        start = subDays(now, 30);
    }
    
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(now, 'yyyy-MM-dd'));
  }, [period]);

  // Get the first source if available
  const defaultSource = sources && sources.length > 0 ? sources[0] : null;
  
  // Use featured report if available, otherwise use the first source
  const sourceId = featuredReport?.source_id || defaultSource?.id || null;
  const reportId = featuredReport?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar isMenuOpen={false} toggleMenu={() => {}} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground">Visualisez les performances de votre site web</p>
              </div>

              {(isReportLoading || isSourcesLoading) ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          <Skeleton className="h-4 w-[100px]" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-[120px]" />
                        <Skeleton className="mt-2 h-4 w-[80px]" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sourceId ? (
                <>
                  {featuredReport && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <LineChart className="h-5 w-5 text-analytics-blue" />
                        <h3 className="font-medium">Rapport: {featuredReport.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {featuredReport.description || 'Aucune description'}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        Source: {featuredReport.analytics_sources?.name || 'Inconnue'}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                      title="Visiteurs actifs"
                      metric="activeUsers"
                      sourceId={sourceId}
                      startDate={startDate}
                      endDate={endDate}
                      reportId={reportId}
                    />
                    <MetricCard
                      title="Nouveaux utilisateurs"
                      metric="newUsers"
                      sourceId={sourceId}
                      startDate={startDate}
                      endDate={endDate}
                      reportId={reportId}
                    />
                    <MetricCard
                      title="Sessions"
                      metric="sessions"
                      sourceId={sourceId}
                      startDate={startDate}
                      endDate={endDate}
                      reportId={reportId}
                    />
                    <MetricCard
                      title="Pages vues"
                      metric="pageviews"
                      sourceId={sourceId}
                      startDate={startDate}
                      endDate={endDate}
                      reportId={reportId}
                    />
                  </div>

                  <Tabs defaultValue="visitors" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="visitors">Visiteurs</TabsTrigger>
                      <TabsTrigger value="engagement">Engagement</TabsTrigger>
                      <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
                    </TabsList>
                    <TabsContent value="visitors" className="space-y-4">
                      <VisitorsChart
                        sourceId={sourceId}
                        startDate={startDate}
                        endDate={endDate}
                        period={period}
                        reportId={reportId}
                      />
                    </TabsContent>
                    <TabsContent value="engagement">
                      <Card>
                        <CardHeader>
                          <CardTitle>Engagement</CardTitle>
                          <CardDescription>Mesures d'engagement des utilisateurs sur votre site</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                          <div className="flex h-[300px] items-center justify-center">
                            <p className="text-sm text-muted-foreground">Les graphiques d'engagement seront disponibles prochainement</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="acquisition">
                      <Card>
                        <CardHeader>
                          <CardTitle>Acquisition</CardTitle>
                          <CardDescription>Comment les utilisateurs découvrent votre site</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                          <div className="flex h-[300px] items-center justify-center">
                            <p className="text-sm text-muted-foreground">Les graphiques d'acquisition seront disponibles prochainement</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                  <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <LineChart className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Aucune source d'analytics</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Vous n'avez pas encore configuré de source d'analytics. Ajoutez une source pour commencer à visualiser vos données.
                    </p>
                    <Button variant="default" asChild>
                      <a href="/analytics-sources">Configurer une source</a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
