
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAnalyticsRequest {
  sourceId: string;
  startDate: string;
  endDate: string;
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les paramètres de la requête
    const { sourceId, startDate, endDate, metrics = ['activeUsers'], dimensions = ['date'], filters = {} }: GoogleAnalyticsRequest = await req.json();

    // Récupérer la source d'analytics
    const { data: sourceData, error: sourceError } = await supabase
      .from('analytics_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single();

    if (sourceError || !sourceData) {
      return new Response(
        JSON.stringify({ error: 'Source non trouvée ou accès non autorisé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les identifiants du compte de service
    const credentials = sourceData.credentials;
    if (!credentials) {
      return new Response(
        JSON.stringify({ error: 'Identifiants manquants' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtenir un token d'accès à l'API Google Analytics
    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT',
      kid: credentials.private_key_id
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtClaimSet = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Créer et signer le JWT pour obtenir un token Google
    const encodedHeader = btoa(JSON.stringify(jwtHeader));
    const encodedClaimSet = btoa(JSON.stringify(jwtClaimSet));
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

    // Simuler l'obtention d'un token pour l'exemple (la signature réelle nécessiterait une bibliothèque)
    // Dans une implémentation réelle, il faudrait signer avec la clé privée du compte de service
    console.log('Demande de token d\'accès pour Google Analytics...');

    // Simulons une réponse d'analytics pour l'exemple
    const propertyId = sourceData.property_id;
    console.log(`Récupération des données pour la propriété GA4 ${propertyId}...`);
    console.log(`Filtres appliqués:`, JSON.stringify(filters));

    // Générer les données en fonction des dimensions et filtres demandés
    const analyticsData = generateSampleData(startDate, endDate, metrics, dimensions, filters);

    // Mettre à jour la date de dernière synchronisation
    await supabase
      .from('analytics_sources')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', sourceId);

    // Enregistrer cette requête dans l'historique des rapports si ce n'est pas déjà un rapport enregistré
    // Cette fonctionnalité pourrait être ajoutée ultérieurement

    return new Response(
      JSON.stringify(analyticsData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fonction améliorée pour générer des données d'exemple
function generateSampleData(
  startDate: string, 
  endDate: string, 
  metrics: string[] = ['activeUsers'], 
  dimensions: string[] = ['date'],
  filters: Record<string, any> = {}
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Créer les en-têtes de dimension
  const dimensionHeaders = dimensions.map(dim => ({ name: dim }));
  
  // Créer les en-têtes de métrique
  const metricHeaders = metrics.map(metric => {
    let type = 'INTEGER';
    if (['bounceRate', 'conversionRate'].includes(metric)) {
      type = 'FLOAT';
    } else if (['avgSessionDuration'].includes(metric)) {
      type = 'TIME';
    }
    return { name: metric, type };
  });
  
  // Générer les données en fonction des dimensions
  const rows = [];
  
  // Si la dimension est "date", générer des données quotidiennes
  if (dimensions.includes('date')) {
    const currentDate = new Date(start);
    
    for (let i = 0; i < days; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Générer des valeurs pour toutes les métriques demandées
      const metricValues = generateMetricValues(metrics, filters);
      
      // Créer les valeurs de dimension
      const dimensionValues = dimensions.map(dim => {
        if (dim === 'date') return { value: dateStr };
        if (dim === 'week') return { value: `Week ${Math.ceil((i + 1) / 7)}` };
        if (dim === 'month') return { value: currentDate.toLocaleString('default', { month: 'long' }) };
        return { value: getDimensionValue(dim) };
      });
      
      rows.push({
        dimensionValues,
        metricValues
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } 
  // Si la dimension est "source" ou autre dimension catégorielle
  else if (dimensions.some(d => ['source', 'channel', 'country', 'device', 'browser'].includes(d))) {
    const categories = getCategoriesForDimension(dimensions[0]);
    
    categories.forEach(category => {
      // Générer des valeurs pour toutes les métriques demandées
      const metricValues = generateMetricValues(metrics, filters);
      
      // Créer les valeurs de dimension
      const dimensionValues = dimensions.map(dim => {
        if (dim === dimensions[0]) return { value: category };
        return { value: getDimensionValue(dim) };
      });
      
      rows.push({
        dimensionValues,
        metricValues
      });
    });
  }
  
  return {
    dimensionHeaders,
    metricHeaders,
    rows
  };
}

// Générer des valeurs pour les métriques demandées
function generateMetricValues(metrics: string[], filters: Record<string, any>) {
  return metrics.map(metric => {
    // Appliquer des facteurs de variation basés sur les filtres
    let factor = 1;
    if (filters.country === 'France') factor = 1.2;
    if (filters.device === 'mobile') factor = 0.8;
    
    if (metric === 'activeUsers') {
      return { value: Math.floor((Math.random() * 1000 + 100) * factor).toString() };
    } else if (metric === 'newUsers') {
      return { value: Math.floor((Math.random() * 500 + 50) * factor).toString() };
    } else if (metric === 'sessions') {
      return { value: Math.floor((Math.random() * 1500 + 200) * factor).toString() };
    } else if (metric === 'pageviews') {
      return { value: Math.floor((Math.random() * 3000 + 500) * factor).toString() };
    } else if (metric === 'bounceRate') {
      return { value: (Math.random() * 70 + 10).toFixed(2) };
    } else if (metric === 'avgSessionDuration') {
      return { value: Math.floor(Math.random() * 300 + 60).toString() };
    } else if (metric === 'pagesPerSession') {
      return { value: (Math.random() * 5 + 1).toFixed(2) };
    } else if (metric === 'conversionRate') {
      return { value: (Math.random() * 10 + 1).toFixed(2) };
    }
    return { value: '0' };
  });
}

// Obtenir des catégories pour une dimension donnée
function getCategoriesForDimension(dimension: string): string[] {
  switch (dimension) {
    case 'source':
      return ['Google', 'Direct', 'Facebook', 'Twitter', 'Email', 'Referral'];
    case 'channel':
      return ['Organic Search', 'Direct', 'Social', 'Email', 'Referral', 'Paid Search'];
    case 'country':
      return ['France', 'États-Unis', 'Royaume-Uni', 'Allemagne', 'Canada', 'Espagne'];
    case 'device':
      return ['Desktop', 'Mobile', 'Tablet'];
    case 'browser':
      return ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
    default:
      return ['Catégorie 1', 'Catégorie 2', 'Catégorie 3', 'Catégorie 4'];
  }
}

// Obtenir une valeur pour une dimension donnée
function getDimensionValue(dimension: string): string {
  const categories = getCategoriesForDimension(dimension);
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}
