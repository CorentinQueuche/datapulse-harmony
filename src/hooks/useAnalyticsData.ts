
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsDataOptions {
  sourceId: string;
  startDate: string;
  endDate: string;
  metrics?: string[];
  dimensions?: string[];
}

export const useAnalyticsData = ({ sourceId, startDate, endDate, metrics, dimensions }: AnalyticsDataOptions) => {
  const [token, setToken] = useState<string | null>(null);

  // Récupérer le token d'authentification
  useEffect(() => {
    const getToken = async () => {
      const { data } = await supabase.auth.getSession();
      setToken(data.session?.access_token || null);
    };
    getToken();
  }, []);

  // Requête pour récupérer les données d'analytics
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analyticsData', sourceId, startDate, endDate, metrics, dimensions],
    queryFn: async () => {
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${window.location.origin}/functions/v1/fetch-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceId,
          startDate,
          endDate,
          metrics,
          dimensions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }

      return response.json();
    },
    enabled: !!token && !!sourceId,
  });

  return { data, isLoading, error, refetch };
};
