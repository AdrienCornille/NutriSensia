/**
 * Script pour supprimer les données d'analytics existantes
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearAnalyticsData() {
  try {
    console.log('🗑️ Suppression des données d\'analytics existantes...');
    
    // Supprimer les événements
    const { error: eventsError } = await supabase
      .from('onboarding_events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tout
      
    if (eventsError) {
      console.error('❌ Erreur lors de la suppression des événements:', eventsError);
    } else {
      console.log('✅ Événements supprimés');
    }
    
    // Supprimer les sessions
    const { error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tout
      
    if (sessionsError) {
      console.error('❌ Erreur lors de la suppression des sessions:', sessionsError);
    } else {
      console.log('✅ Sessions supprimées');
    }
    
    console.log('🎉 Données supprimées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
}

clearAnalyticsData();

