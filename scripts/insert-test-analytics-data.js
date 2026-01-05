/**
 * Script pour insérer des données de test dans les tables d'analytics
 * À exécuter après avoir créé les tables via l'interface Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables d'environnement manquantes:");
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertTestData() {
  try {
    console.log('🚀 Insertion de données de test pour les analytics...');

    // Vérifier si les tables existent
    const { data: eventsCheck, error: eventsError } = await supabase
      .from('onboarding_events')
      .select('id')
      .limit(1);

    if (eventsError) {
      console.log(
        "⚠️  Tables d'analytics non créées. Veuillez d'abord créer les tables via l'interface Supabase."
      );
      console.log(
        '📋 Utilisez le fichier: scripts/create-analytics-tables-simple.sql'
      );
      return;
    }

    // Générer des données de test réalistes pour les 7 derniers jours
    const testEvents = [];
    const testSessions = [];

    const roles = ['nutritionist', 'patient'];
    const steps = [
      'Bienvenue',
      'Profil',
      'Spécialisations',
      'Tarifs',
      'Finalisation',
    ];

    // Générer des sessions et événements pour les 7 derniers jours
    for (let day = 6; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      // Utiliser l'année actuelle du système (pas de setFullYear)
      date.setHours(0, 0, 0, 0); // Commencer au début de la journée

      // Générer 5-15 utilisateurs par jour
      const usersPerDay = Math.floor(Math.random() * 11) + 5;

      for (let user = 0; user < usersPerDay; user++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        const sessionId = `session-${day}-${user}-${Date.now()}`;
        const userId = null; // Utiliser null pour éviter les contraintes de clé étrangère

        // Créer une session
        const sessionStartTime = new Date(
          date.getTime() + Math.random() * 24 * 60 * 60 * 1000
        );
        const session = {
          session_id: sessionId,
          user_id: userId,
          role: role,
          device_type: ['mobile', 'tablet', 'desktop'][
            Math.floor(Math.random() * 3)
          ],
          browser: ['chrome', 'firefox', 'safari', 'edge'][
            Math.floor(Math.random() * 4)
          ],
          started_at: sessionStartTime.toISOString(),
          total_steps: 5,
          status: Math.random() > 0.2 ? 'completed' : 'abandoned',
        };

        if (session.status === 'completed') {
          session.completed_at = new Date(
            new Date(session.started_at).getTime() +
              Math.random() * 30 * 60 * 1000
          ).toISOString();
          session.completion_percentage = 100;
          session.total_time_spent =
            Math.floor(Math.random() * 20 + 5) * 60 * 1000; // 5-25 minutes
        } else {
          session.abandoned_at = new Date(
            new Date(session.started_at).getTime() +
              Math.random() * 15 * 60 * 1000
          ).toISOString();
          session.completion_percentage = Math.floor(Math.random() * 80);
          session.total_time_spent =
            Math.floor(Math.random() * 10 + 1) * 60 * 1000; // 1-10 minutes
        }

        testSessions.push(session);

        // Créer des événements pour cette session
        let currentStep = 0;
        let totalTimeSpent = 0;

        // Événement de démarrage
        testEvents.push({
          session_id: sessionId,
          user_id: userId,
          event_type: 'Onboarding Started',
          role: role,
          step: 'Bienvenue',
          step_number: 1,
          total_steps: 5,
          completion_percentage: 0,
          time_spent: 0,
          device_type: session.device_type,
          browser: session.browser,
          created_at: sessionStartTime.toISOString(),
        });

        // Événements pour chaque étape
        for (let step = 0; step < steps.length; step++) {
          const stepTime = Math.floor(Math.random() * 5 + 1) * 60 * 1000; // 1-5 minutes par étape
          totalTimeSpent += stepTime;

          // 90% de chance de compléter l'étape
          if (Math.random() > 0.1) {
            testEvents.push({
              session_id: sessionId,
              user_id: userId,
              event_type: 'Onboarding Step Completed',
              role: role,
              step: steps[step],
              step_number: step + 1,
              total_steps: 5,
              completion_percentage: ((step + 1) / 5) * 100,
              time_spent: stepTime,
              device_type: session.device_type,
              browser: session.browser,
              created_at: new Date(
                new Date(session.started_at).getTime() + totalTimeSpent
              ).toISOString(),
            });
            currentStep = step + 1;
          } else {
            // Événement d'erreur ou d'abandon
            if (Math.random() > 0.5) {
              testEvents.push({
                session_id: sessionId,
                user_id: userId,
                event_type: 'Onboarding Step Error',
                role: role,
                step: steps[step],
                step_number: step + 1,
                total_steps: 5,
                completion_percentage: (step / 5) * 100,
                time_spent: stepTime,
                device_type: session.device_type,
                browser: session.browser,
                error_type: ['validation', 'network', 'server'][
                  Math.floor(Math.random() * 3)
                ],
                error_message: 'Erreur de validation du formulaire',
                created_at: new Date(
                  new Date(session.started_at).getTime() + totalTimeSpent
                ).toISOString(),
              });
            } else {
              testEvents.push({
                session_id: sessionId,
                user_id: userId,
                event_type: 'Onboarding Abandoned',
                role: role,
                step: steps[step],
                step_number: step + 1,
                total_steps: 5,
                completion_percentage: (step / 5) * 100,
                time_spent: stepTime,
                device_type: session.device_type,
                browser: session.browser,
                reason: 'Utilisateur a quitté la page',
                created_at: new Date(
                  new Date(session.started_at).getTime() + totalTimeSpent
                ).toISOString(),
              });
              break;
            }
          }

          // 10% de chance de demander de l'aide
          if (Math.random() > 0.9) {
            testEvents.push({
              session_id: sessionId,
              user_id: userId,
              event_type: 'Onboarding Help Requested',
              role: role,
              step: steps[step],
              step_number: step + 1,
              total_steps: 5,
              completion_percentage: (step / 5) * 100,
              time_spent: 0,
              device_type: session.device_type,
              browser: session.browser,
              help_type: ['tooltip', 'faq', 'video', 'chat'][
                Math.floor(Math.random() * 4)
              ],
              help_requested: true,
              created_at: new Date(
                new Date(session.started_at).getTime() + totalTimeSpent
              ).toISOString(),
            });
          }
        }

        // Événement de finalisation si complété
        if (session.status === 'completed') {
          testEvents.push({
            session_id: sessionId,
            user_id: userId,
            event_type: 'Onboarding Completed',
            role: role,
            step: 'Finalisation',
            step_number: 5,
            total_steps: 5,
            completion_percentage: 100,
            time_spent: 0,
            device_type: session.device_type,
            browser: session.browser,
            created_at: session.completed_at,
          });
        }
      }
    }

    // Insérer les sessions
    console.log(`📊 Insertion de ${testSessions.length} sessions de test...`);
    const { error: sessionsError } = await supabase
      .from('onboarding_sessions')
      .insert(testSessions);

    if (sessionsError) {
      console.error(
        "❌ Erreur lors de l'insertion des sessions:",
        sessionsError
      );
    } else {
      console.log('✅ Sessions de test insérées');
    }

    // Insérer les événements
    console.log(`📊 Insertion de ${testEvents.length} événements de test...`);
    const { error: eventsInsertError } = await supabase
      .from('onboarding_events')
      .insert(testEvents);

    if (eventsInsertError) {
      console.error(
        "❌ Erreur lors de l'insertion des événements:",
        eventsInsertError
      );
    } else {
      console.log('✅ Événements de test insérés');
    }

    console.log('🎉 Données de test insérées avec succès !');
    console.log(
      '📊 Vous pouvez maintenant voir les vraies métriques sur http://localhost:3000/admin/analytics/onboarding'
    );
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion des données de test:", error);
  }
}

// Exécuter le script
if (require.main === module) {
  insertTestData();
}

module.exports = { insertTestData };
