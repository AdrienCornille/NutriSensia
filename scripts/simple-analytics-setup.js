/**
 * Script simple pour créer les tables d'analytics d'onboarding
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

async function createSimpleAnalyticsTables() {
  try {
    console.log('🚀 Création des tables d\'analytics d\'onboarding...');
    
    // Test de connexion
    console.log('🔍 Test de connexion à Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('⚠️  Erreur de connexion:', testError.message);
    } else {
      console.log('✅ Connexion à Supabase OK');
    }
    
    // Créer une table simple pour tester
    console.log('📊 Création d\'une table de test...');
    
    // Insérer des données de test dans une table existante ou créer une nouvelle table
    const { data: insertData, error: insertError } = await supabase
      .from('onboarding_events')
      .insert([
        {
          session_id: 'test-session-123',
          event_type: 'Onboarding Started',
          role: 'nutritionist',
          step: 'welcome',
          step_number: 1,
          total_steps: 5,
          completion_percentage: 0,
          time_spent: 0,
          device_type: 'desktop',
          browser: 'chrome',
          properties: { test: true }
        }
      ])
      .select();
    
    if (insertError) {
      console.log('⚠️  Erreur lors de l\'insertion de test:', insertError.message);
      console.log('💡 La table onboarding_events n\'existe peut-être pas encore.');
      
      // Essayer de créer la table via une requête SQL directe
      console.log('🔧 Tentative de création de la table...');
      
      const { data: createData, error: createError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS onboarding_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            session_id VARCHAR(255) NOT NULL,
            event_type VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            step VARCHAR(100),
            step_number INTEGER,
            total_steps INTEGER,
            completion_percentage DECIMAL(5,2),
            time_spent INTEGER,
            device_type VARCHAR(20),
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
      
      if (createError) {
        console.log('❌ Erreur lors de la création de la table:', createError.message);
      } else {
        console.log('✅ Table onboarding_events créée avec succès !');
        
        // Réessayer l'insertion
        const { data: retryData, error: retryError } = await supabase
          .from('onboarding_events')
          .insert([
            {
              session_id: 'test-session-123',
              event_type: 'Onboarding Started',
              role: 'nutritionist',
              step: 'welcome',
              step_number: 1,
              total_steps: 5,
              completion_percentage: 0,
              time_spent: 0,
              device_type: 'desktop',
              browser: 'chrome',
              properties: { test: true }
            }
          ])
          .select();
        
        if (retryError) {
          console.log('❌ Erreur lors de l\'insertion après création:', retryError.message);
        } else {
          console.log('✅ Données de test insérées avec succès !');
          console.log('📊 Données insérées:', retryData);
        }
      }
    } else {
      console.log('✅ Données de test insérées avec succès !');
      console.log('📊 Données insérées:', insertData);
    }
    
    // Créer la table des sessions
    console.log('📊 Création de la table onboarding_sessions...');
    const { data: sessionsData, error: sessionsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS onboarding_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR(255) UNIQUE NOT NULL,
          user_id UUID,
          role VARCHAR(50) NOT NULL,
          device_type VARCHAR(20),
          browser VARCHAR(50),
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          abandoned_at TIMESTAMP WITH TIME ZONE,
          last_step VARCHAR(100),
          total_steps INTEGER,
          completion_percentage DECIMAL(5,2) DEFAULT 0,
          total_time_spent INTEGER,
          status VARCHAR(20) DEFAULT 'active',
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
    
    // Créer la table des métriques
    console.log('📊 Création de la table onboarding_metrics...');
    const { data: metricsData, error: metricsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS onboarding_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          date DATE NOT NULL,
          role VARCHAR(50) NOT NULL,
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
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (metricsError) {
      console.log('⚠️  Erreur lors de la création de onboarding_metrics:', metricsError.message);
    } else {
      console.log('✅ Table onboarding_metrics créée');
    }
    
    // Activer RLS
    console.log('🔒 Activation de RLS...');
    const rlsTables = ['onboarding_events', 'onboarding_sessions', 'onboarding_metrics'];
    
    for (const table of rlsTables) {
      const { error: rlsError } = await supabase.rpc('exec', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
      if (rlsError) {
        console.log(`⚠️  Erreur RLS pour ${table}:`, rlsError.message);
      } else {
        console.log(`✅ RLS activé pour ${table}`);
      }
    }
    
    console.log('🎉 Configuration des tables d\'analytics terminée !');
    
    // Test final
    console.log('🧪 Test final - Vérification des tables...');
    const { data: finalTest, error: finalError } = await supabase
      .from('onboarding_events')
      .select('*')
      .limit(1);
    
    if (finalError) {
      console.log('❌ Erreur lors du test final:', finalError.message);
    } else {
      console.log('✅ Test final réussi ! Tables d\'analytics opérationnelles.');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
createSimpleAnalyticsTables();
