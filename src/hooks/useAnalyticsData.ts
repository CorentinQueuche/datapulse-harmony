
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsDataOptions {
  sourceId: string | null;
  startDate: string;
  endDate: string;
  metrics?: string[];
  dimensions?: string[];
  reportId?: string;
  filters?: Record<string, any>;
}

export const useAnalyticsData = ({ 
  sourceId, 
  startDate, 
  endDate, 
  metrics = ['activeUsers'], 
  dimensions = ['date'],
  reportId,
  filters
}: AnalyticsDataOptions) => {
  const [token, setToken] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  // Récupérer le token d'authentification
  useEffect(() => {
    const getToken = async () => {
      const { data } = await supabase.auth.getSession();
      setToken(data.session?.access_token || null);
    };
    getToken();
  }, []);

  // Récupérer le rapport si reportId est fourni
  const reportQuery = useQuery({
    queryKey: ['analyticsReport', reportId],
    queryFn: async () => {
      if (!reportId) return null;

      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .eq('id', reportId)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!reportId && !!token,
    onSuccess: (data) => {
      if (data) {
        setReport(data);
      }
    }
  });

  // Détermine les paramètres à utiliser (du rapport ou des props)
  const effectiveSourceId = report?.source_id || sourceId;
  const effectiveStartDate = report?.start_date || startDate;
  const effectiveEndDate = report?.end_date || endDate;
  const effectiveMetrics = report?.metrics || metrics;
  const effectiveDimensions = report?.dimensions || dimensions;
  const effectiveFilters = report?.filters || filters;

  // Requête pour récupérer les données d'analytics
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analyticsData', effectiveSourceId, effectiveStartDate, effectiveEndDate, effectiveMetrics, effectiveDimensions, effectiveFilters],
    queryFn: async () => {
      if (!token) throw new Error('Non authentifié');
      if (!effectiveSourceId) throw new Error('Aucune source sélectionnée');

      const response = await fetch(`${window.location.origin}/functions/v1/fetch-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceId: effectiveSourceId,
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
          metrics: effectiveMetrics,
          dimensions: effectiveDimensions,
          filters: effectiveFilters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }

      return response.json();
    },
    enabled: !!token && !!effectiveSourceId && (!reportId || reportQuery.isSuccess),
  });

  return { 
    data, 
    isLoading: isLoading || (reportId && reportQuery.isLoading), 
    error: error || reportQuery.error, 
    refetch,
    report: report
  };
};
