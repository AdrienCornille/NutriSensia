/**
 * Script pour créer les tables d'analytics d'onboarding
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

async function setupAnalyticsTables() {
  try {
    console.log('🚀 Création des tables d\'analytics d\'onboarding...');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'onboarding-analytics-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Exécuter le SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Erreur lors de l\'exécution du SQL:', error);
      
      // Essayer d'exécuter les commandes une par une
      console.log('🔄 Tentative d\'exécution commande par commande...');
      
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
      
      for (const command of commands) {
        if (command.trim()) {
          try {
            const { error: cmdError } = await supabase.rpc('exec_sql', { sql: command + ';' });
            if (cmdError) {
              console.log(`⚠️  Erreur sur la commande: ${command.substring(0, 50)}...`);
              console.log(`   Erreur: ${cmdError.message}`);
            } else {
              console.log(`✅ Commande exécutée: ${command.substring(0, 50)}...`);
            }
          } catch (err) {
            console.log(`❌ Erreur sur la commande: ${command.substring(0, 50)}...`);
            console.log(`   Erreur: ${err.message}`);
          }
        }
      }
    } else {
      console.log('✅ Tables d\'analytics créées avec succès !');
    }
    
    // Vérifier que les tables existent
    console.log('🔍 Vérification des tables créées...');
    
    const tables = [
      'onboarding_events',
      'onboarding_sessions', 
      'onboarding_metrics',
      'onboarding_alerts',
      'onboarding_ab_tests',
      'onboarding_ab_test_variants',
      'onboarding_ab_test_assignments'
    ];
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.log(`❌ Table ${table}: ${tableError.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    }
    
    console.log('🎉 Configuration des tables d\'analytics terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour exécuter du SQL directement
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error('Erreur SQL:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erreur d\'exécution:', err);
    return false;
  }
}

// Exécuter le script
setupAnalyticsTables();
