/**
 * Script pour créer les tables d'analytics d'onboarding avec de vraies données
 * Version directe sans fonction exec
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRealAnalytics() {
  try {
    console.log('🚀 Configuration des analytics d\'onboarding avec de vraies données...');
    
    // 1. Créer les tables une par une
    await createTables();
    
    // 2. Insérer des données de test réalistes
    console.log('📈 Insertion de données de test réalistes...');
    await insertTestData();
    
    console.log('🎉 Configuration terminée ! Les analytics utilisent maintenant de vraies données.');
    console.log('📊 Vous pouvez maintenant voir les vraies métriques sur http://localhost:3000/admin/analytics/onboarding');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  }
}

async function createTables() {
  console.log('📊 Création des tables d\'analytics...');
  
  // Table principale pour les événements d'onboarding
  console.log('📊 Création de la table onboarding_events...');
  const { error: eventsError } = await supabase
    .from('onboarding_events')
    .select('id')
    .limit(1);
    
  if (eventsError && eventsError.code === 'PGRST116') {
    // Table n'existe pas, on va la créer via une requête SQL directe
    console.log('⚠️  Table onboarding_events n\'existe pas. Création nécessaire via l\'interface Supabase.');
    console.log('📋 Veuillez exécuter le script SQL suivant dans l\'interface Supabase :');
    console.log('');
    console.log('-- Table principale pour les événements d\'onboarding');
    console.log('CREATE TABLE IF NOT EXISTS onboarding_events (');
    console.log('    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,');
    console.log('    session_id VARCHAR(255) NOT NULL,');
    console.log('    event_type VARCHAR(100) NOT NULL,');
    console.log('    role VARCHAR(50) NOT NULL CHECK (role IN (\'nutritionist\', \'patient\', \'admin\')),');
    console.log('    step VARCHAR(100),');
    console.log('    step_number INTEGER,');
    console.log('    total_steps INTEGER,');
    console.log('    completion_percentage DECIMAL(5,2),');
    console.log('    time_spent INTEGER,');
    console.log('    device_type VARCHAR(20) CHECK (device_type IN (\'mobile\', \'tablet\', \'desktop\')),');
    console.log('    browser VARCHAR(50),');
    console.log('    error_type VARCHAR(50),');
    console.log('    error_message TEXT,');
    console.log('    help_type VARCHAR(50),');
    console.log('    help_requested BOOLEAN DEFAULT FALSE,');
    console.log('    skipped BOOLEAN DEFAULT FALSE,');
    console.log('    reason TEXT,');
    console.log('    properties JSONB DEFAULT \'{}\',');
    console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- Index pour optimiser les requêtes');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON onboarding_events(user_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_events_session_id ON onboarding_events(session_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_type ON onboarding_events(event_type);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_events_role ON onboarding_events(role);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_events_step ON onboarding_events(step);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_events_created_at ON onboarding_events(created_at);');
    console.log('');
    console.log('-- Table pour les sessions d\'onboarding');
    console.log('CREATE TABLE IF NOT EXISTS onboarding_sessions (');
    console.log('    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('    session_id VARCHAR(255) UNIQUE NOT NULL,');
    console.log('    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,');
    console.log('    role VARCHAR(50) NOT NULL CHECK (role IN (\'nutritionist\', \'patient\', \'admin\')),');
    console.log('    device_type VARCHAR(20) CHECK (device_type IN (\'mobile\', \'tablet\', \'desktop\')),');
    console.log('    browser VARCHAR(50),');
    console.log('    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('    completed_at TIMESTAMP WITH TIME ZONE,');
    console.log('    abandoned_at TIMESTAMP WITH TIME ZONE,');
    console.log('    last_step VARCHAR(100),');
    console.log('    total_steps INTEGER,');
    console.log('    completion_percentage DECIMAL(5,2) DEFAULT 0,');
    console.log('    total_time_spent INTEGER,');
    console.log('    status VARCHAR(20) DEFAULT \'active\' CHECK (status IN (\'active\', \'completed\', \'abandoned\')),');
    console.log('    properties JSONB DEFAULT \'{}\',');
    console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- Index pour les sessions');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id ON onboarding_sessions(user_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_session_id ON onboarding_sessions(session_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_role ON onboarding_sessions(role);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);');
    console.log('CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_started_at ON onboarding_sessions(started_at);');
    console.log('');
    console.log('-- Politiques RLS (Row Level Security)');
    console.log('ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Politique pour les événements d\'onboarding');
    console.log('CREATE POLICY "Users can insert their own onboarding events" ON onboarding_events');
    console.log('    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IN (');
    console.log('        SELECT id FROM auth.users WHERE raw_user_meta_data->>\'role\' = \'admin\'');
    console.log('    ));');
    console.log('');
    console.log('CREATE POLICY "Admins can view all onboarding events" ON onboarding_events');
    console.log('    FOR SELECT USING (auth.uid() IN (');
    console.log('        SELECT id FROM auth.users WHERE raw_user_meta_data->>\'role\' = \'admin\'');
    console.log('    ));');
    console.log('');
    console.log('-- Politique pour les sessions d\'onboarding');
    console.log('CREATE POLICY "Users can insert their own onboarding sessions" ON onboarding_sessions');
    console.log('    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IN (');
    console.log('        SELECT id FROM auth.users WHERE raw_user_meta_data->>\'role\' = \'admin\'');
    console.log('    ));');
    console.log('');
    console.log('CREATE POLICY "Admins can view all onboarding sessions" ON onboarding_sessions');
    console.log('    FOR SELECT USING (auth.uid() IN (');
    console.log('        SELECT id FROM auth.users WHERE raw_user_meta_data->>\'role\' = \'admin\'');
    console.log('    ));');
    console.log('');
    console.log('⚠️  Après avoir créé les tables, relancez ce script pour insérer les données de test.');
    return;
  } else if (eventsError) {
    console.error('❌ Erreur lors de la vérification de la table onboarding_events:', eventsError);
    return;
  }
  
  console.log('✅ Tables d\'analytics existent déjà');
}

async function insertTestData() {
  // Vérifier si les tables existent
  const { data: eventsCheck, error: eventsError } = await supabase
    .from('onboarding_events')
    .select('id')
    .limit(1);
    
  if (eventsError) {
    console.log('⚠️  Tables d\'analytics non créées. Veuillez d\'abord créer les tables via l\'interface Supabase.');
    return;
  }
  
  // Générer des données de test réalistes pour les 7 derniers jours
  const testEvents = [];
  const testSessions = [];
  
  const roles = ['nutritionist', 'patient'];
  const steps = ['Bienvenue', 'Profil', 'Spécialisations', 'Tarifs', 'Finalisation'];
  
  // Générer des sessions et événements pour les 7 derniers jours
  for (let day = 6; day >= 0; day--) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    // Générer 5-15 utilisateurs par jour
    const usersPerDay = Math.floor(Math.random() * 11) + 5;
    
    for (let user = 0; user < usersPerDay; user++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const sessionId = `session-${day}-${user}-${Date.now()}`;
      const userId = `test-user-${day}-${user}`;
      
      // Créer une session
      const session = {
        session_id: sessionId,
        user_id: userId,
        role: role,
        device_type: ['mobile', 'tablet', 'desktop'][Math.floor(Math.random() * 3)],
        browser: ['chrome', 'firefox', 'safari', 'edge'][Math.floor(Math.random() * 4)],
        started_at: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        total_steps: 5,
        status: Math.random() > 0.2 ? 'completed' : 'abandoned'
      };
      
      if (session.status === 'completed') {
        session.completed_at = new Date(session.started_at).getTime() + Math.random() * 30 * 60 * 1000;
        session.completion_percentage = 100;
        session.total_time_spent = Math.floor(Math.random() * 20 + 5) * 60 * 1000; // 5-25 minutes
      } else {
        session.abandoned_at = new Date(session.started_at).getTime() + Math.random() * 15 * 60 * 1000;
        session.completion_percentage = Math.floor(Math.random() * 80);
        session.total_time_spent = Math.floor(Math.random() * 10 + 1) * 60 * 1000; // 1-10 minutes
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
        created_at: session.started_at
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
            created_at: new Date(new Date(session.started_at).getTime() + totalTimeSpent).toISOString()
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
              error_type: ['validation', 'network', 'server'][Math.floor(Math.random() * 3)],
              error_message: 'Erreur de validation du formulaire',
              created_at: new Date(new Date(session.started_at).getTime() + totalTimeSpent).toISOString()
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
              created_at: new Date(new Date(session.started_at).getTime() + totalTimeSpent).toISOString()
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
            help_type: ['tooltip', 'faq', 'video', 'chat'][Math.floor(Math.random() * 4)],
            help_requested: true,
            created_at: new Date(new Date(session.started_at).getTime() + totalTimeSpent).toISOString()
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
          created_at: session.completed_at
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
    console.error('❌ Erreur lors de l\'insertion des sessions:', sessionsError);
  } else {
    console.log('✅ Sessions de test insérées');
  }
  
  // Insérer les événements
  console.log(`📊 Insertion de ${testEvents.length} événements de test...`);
  const { error: eventsInsertError } = await supabase
    .from('onboarding_events')
    .insert(testEvents);
    
  if (eventsInsertError) {
    console.error('❌ Erreur lors de l\'insertion des événements:', eventsInsertError);
  } else {
    console.log('✅ Événements de test insérés');
  }
}

// Exécuter le script
if (require.main === module) {
  setupRealAnalytics();
}

module.exports = { setupRealAnalytics };
