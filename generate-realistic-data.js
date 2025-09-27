/**
 * Script pour générer des données réalistes pour tester le graphique en secteurs
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateRealisticData() {
  console.log('📊 Génération de données réalistes pour le graphique en secteurs');
  console.log('=' .repeat(60));

  try {
    // Générer des sessions avec différents statuts
    const sessions = [];
    const events = [];
    const today = new Date();

    // Générer 10 sessions avec différents statuts
    for (let i = 0; i < 10; i++) {
      const sessionId = `realistic_session_${Date.now()}_${i}`;
      const startedAt = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)); // Étalé sur 10 jours
      
      let status, completedAt, abandonedAt;
      
      if (i < 6) {
        // 6 sessions complétées (60%)
        status = 'completed';
        completedAt = new Date(startedAt.getTime() + Math.random() * 2 * 60 * 60 * 1000); // 0-2h après le début
        
        // Ajouter événement onboarding_started
        events.push({
          event_type: 'onboarding_started',
          step: 'welcome',
          step_number: 1,
          role: 'nutritionist',
          session_id: sessionId,
          device_type: 'desktop',
          browser: 'chrome',
          created_at: startedAt.toISOString(),
        });
        
        // Ajouter événement onboarding_completed
        events.push({
          event_type: 'onboarding_completed',
          step: 'completion',
          step_number: 8,
          role: 'nutritionist',
          session_id: sessionId,
          device_type: 'desktop',
          browser: 'chrome',
          time_spent: Math.floor(Math.random() * 300000) + 60000, // 1-5 minutes
          created_at: completedAt.toISOString(),
        });
        
      } else if (i < 8) {
        // 2 sessions abandonnées (20%)
        status = 'abandoned';
        abandonedAt = new Date(startedAt.getTime() + Math.random() * 30 * 60 * 1000); // 0-30min après le début
        
        // Ajouter seulement événement onboarding_started
        events.push({
          event_type: 'onboarding_started',
          step: 'welcome',
          step_number: 1,
          role: 'nutritionist',
          session_id: sessionId,
          device_type: 'desktop',
          browser: 'chrome',
          created_at: startedAt.toISOString(),
        });
        
      } else {
        // 2 sessions en cours (20%)
        status = 'active';
        
        // Ajouter seulement événement onboarding_started
        events.push({
          event_type: 'onboarding_started',
          step: 'welcome',
          step_number: 1,
          role: 'nutritionist',
          session_id: sessionId,
          device_type: 'desktop',
          browser: 'chrome',
          created_at: startedAt.toISOString(),
        });
      }
      
      sessions.push({
        session_id: sessionId,
        role: 'nutritionist',
        device_type: 'desktop',
        browser: 'chrome',
        started_at: startedAt.toISOString(),
        completed_at: completedAt?.toISOString() || null,
        abandoned_at: abandonedAt?.toISOString() || null,
        last_step: status === 'completed' ? 'completion' : 'welcome',
        total_steps: 8,
        completion_percentage: status === 'completed' ? 100 : (status === 'abandoned' ? 12.5 : 25),
        total_time_spent: status === 'completed' ? Math.floor(Math.random() * 300000) + 60000 : null,
        status: status,
        properties: {},
        created_at: startedAt.toISOString(),
        updated_at: (completedAt || abandonedAt || startedAt).toISOString(),
      });
    }

    console.log(`📝 Génération de ${sessions.length} sessions et ${events.length} événements`);

    // Insérer les sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .insert(sessions);

    if (sessionsError) {
      console.error('❌ Erreur lors de l\'insertion des sessions:', sessionsError);
      return;
    }

    // Insérer les événements
    const { data: eventsData, error: eventsError } = await supabase
      .from('onboarding_events')
      .insert(events);

    if (eventsError) {
      console.error('❌ Erreur lors de l\'insertion des événements:', eventsError);
      return;
    }

    console.log('✅ Données réalistes générées avec succès !');
    console.log('📊 Répartition attendue:');
    console.log('   - Complétées: 6/10 (60%)');
    console.log('   - Abandonnées: 2/10 (20%)');
    console.log('   - En cours: 2/10 (20%)');
    console.log('🌐 Rafraîchissez la page http://localhost:3000/admin/analytics/onboarding pour voir le graphique');

  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

generateRealisticData();
