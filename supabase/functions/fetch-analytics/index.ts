
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
    const { sourceId, startDate, endDate, metrics = ['activeUsers'], dimensions = ['date'] }: GoogleAnalyticsRequest = await req.json();

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

    // Génération de données fictives pour l'exemple
    const analyticsData = {
      dimensionHeaders: [
        { name: 'date' }
      ],
      metricHeaders: [
        { name: 'activeUsers', type: 'INTEGER' }
      ],
      rows: generateSampleData(startDate, endDate)
    };

    // Mettre à jour la date de dernière synchronisation
    await supabase
      .from('analytics_sources')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', sourceId);

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

// Fonction pour générer des données d'exemple
function generateSampleData(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const rows = [];
  const currentDate = new Date(start);
  
  for (let i = 0; i < days; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const randomUsers = Math.floor(Math.random() * 1000) + 100;
    
    rows.push({
      dimensionValues: [{ value: dateStr }],
      metricValues: [{ value: randomUsers.toString() }]
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return rows;
}
