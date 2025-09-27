/**
 * Script pour nettoyer les données réalistes de test
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupRealisticData() {
  console.log('🧹 Nettoyage des données réalistes de test');
  console.log('=' .repeat(60));

  try {
    // Supprimer les sessions de test (celles avec session_id commençant par "realistic_session_")
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .delete()
      .like('session_id', 'realistic_session_%');

    if (sessionsError) {
      console.error('❌ Erreur lors de la suppression des sessions:', sessionsError);
    } else {
      console.log('✅ Sessions de test supprimées');
    }

    // Supprimer les événements de test (ceux avec session_id commençant par "realistic_session_")
    const { data: eventsData, error: eventsError } = await supabase
      .from('onboarding_events')
      .delete()
      .like('session_id', 'realistic_session_%');

    if (eventsError) {
      console.error('❌ Erreur lors de la suppression des événements:', eventsError);
    } else {
      console.log('✅ Événements de test supprimés');
    }

    console.log('✅ Données réalistes supprimées avec succès !');
    console.log('🌐 Le dashboard affichera maintenant vos vraies données');

    // Vérifier les données restantes
    const { data: remainingSessions, error: checkSessionsError } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (checkSessionsError) {
      console.error('❌ Erreur lors de la vérification des sessions:', checkSessionsError);
    } else {
      console.log(`📊 ${remainingSessions.length} sessions restantes dans la base de données`);
      
      if (remainingSessions.length > 0) {
        console.log('📋 Sessions restantes:');
        remainingSessions.forEach((session, index) => {
          console.log(`   ${index + 1}. ${session.session_id} - ${session.status} - ${session.created_at}`);
        });
      }
    }

    const { data: remainingEvents, error: checkEventsError } = await supabase
      .from('onboarding_events')
      .select('event_type, session_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (checkEventsError) {
      console.error('❌ Erreur lors de la vérification des événements:', checkEventsError);
    } else {
      console.log(`📊 ${remainingEvents.length} événements récents restants`);
      
      if (remainingEvents.length > 0) {
        console.log('📋 Événements récents:');
        remainingEvents.slice(0, 5).forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.event_type} - ${event.session_id} - ${event.created_at}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

cleanupRealisticData();
