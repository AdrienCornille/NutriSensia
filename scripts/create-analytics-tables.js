/**
 * Script pour créer les tables d'analytics d'onboarding via l'API Supabase
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

async function createAnalyticsTables() {
  try {
    console.log('🚀 Création des tables d\'analytics d\'onboarding...');
    
    // Table principale pour les événements d'onboarding
    console.log('📊 Création de la table onboarding_events...');
    const { error: eventsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS onboarding_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          session_id VARCHAR(255) NOT NULL,
          event_type VARCHAR(100) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('nutritionist', 'patient', 'admin')),
          step VARCHAR(100),
          step_number INTEGER,
          total_steps INTEGER,
          completion_percentage DECIMAL(5,2),
          time_spent INTEGER,
          device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
          browser VARCHAR(50),
          error_type VARCHAR(50),
          error_message TEXT,
          help_type VARCHAR(50),
          help_requested BOOLEAN DEFAULT FALSE,
          skipped BOOLEAN DEFAULT FALSE,
          reason TEXT,
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (eventsError) {
      console.log('⚠️  Erreur lors de la création de onboarding_events:', eventsError.message);
    } else {
      console.log('✅ Table onboarding_events créée');
    }
    
    // Table pour les sessions d'onboarding
    console.log('📊 Création de la table onboarding_sessions...');
    const { error: sessionsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS onboarding_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR(255) UNIQUE NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('nutritionist', 'patient', 'admin')),
          device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
          browser VARCHAR(50),
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          abandoned_at TIMESTAMP WITH TIME ZONE,
          last_step VARCHAR(100),
          total_steps INTEGER,
          completion_percentage DECIMAL(5,2) DEFAULT 0,
          total_time_spent INTEGER,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (sessionsError) {
      console.log('⚠️  Erreur lors de la création de onboarding_sessions:', sessionsError.message);
    } else {
      console.log('✅ Table onboarding_sessions créée');
    }
    
    // Table pour les métriques d'onboarding
    console.log('📊 Création de la table onboarding_metrics...');
    const { error: metricsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS onboarding_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          date DATE NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('nutritionist', 'patient', 'admin')),
          step VARCHAR(100),
          step_number INTEGER,
          total_users INTEGER DEFAULT 0,
          completed_users INTEGER DEFAULT 0,
          skipped_users INTEGER DEFAULT 0,
          abandoned_users INTEGER DEFAULT 0,
          error_count INTEGER DEFAULT 0,
          help_requests INTEGER DEFAULT 0,
          average_time_spent INTEGER DEFAULT 0,
          completion_rate DECIMAL(5,2) DEFAULT 0,
          drop_off_rate DECIMAL(5,2) DEFAULT 0,
          error_rate DECIMAL(5,2) DEFAULT 0,
          help_request_rate DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(date, role, step)
        );
      `
    });
    
    if (metricsError) {
      console.log('⚠️  Erreur lors de la création de onboarding_metrics:', metricsError.message);
    } else {
      console.log('✅ Table onboarding_metrics créée');
    }
    
    // Créer les index
    console.log('📊 Création des index...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON onboarding_events(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_onboarding_events_session_id ON onboarding_events(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_type ON onboarding_events(event_type);',
      'CREATE INDEX IF NOT EXISTS idx_onboarding_events_role ON onboarding_events(role);',
      'CREATE INDEX IF NOT EXISTS idx_onboarding_events_created_at ON onboarding_events(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id ON onboarding_sessions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_session_id ON onboarding_sessions(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);'
    ];
    
    for (const indexSQL of indexes) {
      const { error: indexError } = await supabase.rpc('exec', { sql: indexSQL });
      if (indexError) {
        console.log('⚠️  Erreur index:', indexError.message);
      }
    }
    
    console.log('✅ Index créés');
    
    // Activer RLS
    console.log('🔒 Activation de RLS...');
    const rlsTables = ['onboarding_events', 'onboarding_sessions', 'onboarding_metrics'];
    
    for (const table of rlsTables) {
      const { error: rlsError } = await supabase.rpc('exec', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
      if (rlsError) {
        console.log(`⚠️  Erreur RLS pour ${table}:`, rlsError.message);
      }
    }
    
    console.log('✅ RLS activé');
    
    // Créer les politiques RLS
    console.log('🔒 Création des politiques RLS...');
    const policies = [
      `CREATE POLICY "Users can insert their own onboarding events" ON onboarding_events
       FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
         SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
       ));`,
      `CREATE POLICY "Admins can view all onboarding events" ON onboarding_events
       FOR SELECT USING (auth.uid() IN (
         SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
       ));`,
      `CREATE POLICY "Users can insert their own onboarding sessions" ON onboarding_sessions
       FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
         SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
       ));`,
      `CREATE POLICY "Admins can view all onboarding sessions" ON onboarding_sessions
       FOR SELECT USING (auth.uid() IN (
         SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
       ));`,
      `CREATE POLICY "Admins can view onboarding metrics" ON onboarding_metrics
       FOR SELECT USING (auth.uid() IN (
         SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
       ));`
    ];
    
    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec', { sql: policy });
      if (policyError) {
        console.log('⚠️  Erreur politique:', policyError.message);
      }
    }
    
    console.log('✅ Politiques RLS créées');
    
    // Vérifier que les tables existent
    console.log('🔍 Vérification des tables...');
    
    const { data: tables, error: tablesError } = await supabase.rpc('exec', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'onboarding_%'
        ORDER BY table_name;
      `
    });
    
    if (tablesError) {
      console.log('⚠️  Erreur lors de la vérification:', tablesError.message);
    } else {
      console.log('✅ Tables créées:', tables);
    }
    
    console.log('🎉 Configuration des tables d\'analytics terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
createAnalyticsTables();
