/**
 * Script de vérification des tables d'onboarding
 * Vérifie que les tables existent et sont correctement configurées
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const verifyOnboardingTables = async () => {
  console.log('🔍 Vérification des tables d\'onboarding...\n');

  try {
    // Initialiser Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('📊 Vérification de la table onboarding_events...');
    
    // Vérifier la table onboarding_events
    const { data: eventsData, error: eventsError } = await supabase
      .from('onboarding_events')
      .select('*')
      .limit(1);

    if (eventsError) {
      console.error('❌ Erreur table onboarding_events:', eventsError.message);
      console.log('💡 Vérifiez que la table existe et que les permissions sont correctes');
    } else {
      console.log('✅ Table onboarding_events accessible');
      console.log(`📊 Structure: ${Object.keys(eventsData?.[0] || {}).length} colonnes détectées`);
    }

    console.log('\n📊 Vérification de la table onboarding_sessions...');
    
    // Vérifier la table onboarding_sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('❌ Erreur table onboarding_sessions:', sessionsError.message);
      console.log('💡 Vérifiez que la table existe et que les permissions sont correctes');
    } else {
      console.log('✅ Table onboarding_sessions accessible');
      console.log(`📊 Structure: ${Object.keys(sessionsData?.[0] || {}).length} colonnes détectées`);
    }

    console.log('\n📊 Test d\'insertion d\'un événement de test...');
    
    // Test d'insertion d'un événement (sans user_id pour éviter la contrainte FK)
    const testEvent = {
      session_id: 'test-session-' + Date.now(),
      event_type: 'test_event',
      role: 'nutritionist',
      step: 'test',
      step_number: 1,
      total_steps: 1,
      completion_percentage: 100,
      time_spent: 0,
      device_type: 'desktop',
      browser: 'test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from('onboarding_events')
      .insert(testEvent)
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion test:', insertError.message);
    } else {
      console.log('✅ Insertion test réussie');
      console.log('📊 ID généré:', insertData?.[0]?.id);
      
      // Nettoyer l'événement de test
      if (insertData?.[0]?.id) {
        await supabase
          .from('onboarding_events')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Événement de test nettoyé');
      }
    }

    console.log('\n📊 Test d\'insertion d\'une session de test...');
    
    // Test d'insertion d'une session (sans user_id pour éviter la contrainte FK)
    const testSession = {
      session_id: 'test-session-' + Date.now(),
      role: 'nutritionist',
      device_type: 'desktop',
      browser: 'test',
      started_at: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertSessionData, error: insertSessionError } = await supabase
      .from('onboarding_sessions')
      .insert(testSession)
      .select();

    if (insertSessionError) {
      console.error('❌ Erreur insertion session test:', insertSessionError.message);
    } else {
      console.log('✅ Insertion session test réussie');
      console.log('📊 ID généré:', insertSessionData?.[0]?.id);
      
      // Nettoyer la session de test
      if (insertSessionData?.[0]?.id) {
        await supabase
          .from('onboarding_sessions')
          .delete()
          .eq('id', insertSessionData[0].id);
        console.log('🧹 Session de test nettoyée');
      }
    }

    console.log('\n🎉 Vérification terminée !');
    console.log('💡 Si tout est vert, les tables sont prêtes pour l\'enregistrement des données d\'onboarding');

  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
};

// Exécuter la vérification si le script est appelé directement
if (typeof window === 'undefined') {
  verifyOnboardingTables().catch(console.error);
}

module.exports = { verifyOnboardingTables };
