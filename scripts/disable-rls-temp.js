/**
 * Script pour désactiver temporairement RLS sur storage.objects
 * ATTENTION: Ceci est pour le développement uniquement!
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables d'environnement Supabase manquantes");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLSTemporarily() {
  try {
    console.log('⚠️  DÉSACTIVATION TEMPORAIRE DE RLS POUR LE DÉVELOPPEMENT');
    console.log('   Ceci ne doit JAMAIS être fait en production!');
    console.log('');

    // Désactiver RLS sur storage.objects
    const { error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;',
    });

    if (error) {
      console.error(
        '❌ Erreur lors de la désactivation de RLS:',
        error.message
      );

      // Essayer une approche alternative
      console.log("🔄 Tentative d'approche alternative...");

      // Créer une politique permissive temporaire
      const { error: policyError } = await supabase.rpc('exec', {
        sql: `
          DROP POLICY IF EXISTS "Allow all operations on avatars" ON storage.objects;
          CREATE POLICY "Allow all operations on avatars" ON storage.objects
          FOR ALL USING (bucket_id = 'avatars');
        `,
      });

      if (policyError) {
        console.error(
          '❌ Impossible de créer une politique permissive:',
          policyError.message
        );
        console.log('');
        console.log('📋 SOLUTION MANUELLE:');
        console.log("1. Allez dans l'interface Supabase → Storage → Policies");
        console.log('2. Créez une politique pour le bucket "avatars" avec:');
        console.log('   - Command: ALL');
        console.log('   - Target: objects');
        console.log("   - USING: bucket_id = 'avatars'");
        console.log('3. Ou désactivez temporairement RLS sur storage.objects');
      } else {
        console.log('✅ Politique permissive créée pour le bucket avatars');
      }
    } else {
      console.log('✅ RLS désactivé temporairement sur storage.objects');
      console.log("⚠️  N'OUBLIEZ PAS de le réactiver en production!");
    }

    console.log('');
    console.log("🧪 Vous pouvez maintenant tester l'upload d'avatar");
    console.log('🔒 Pour réactiver RLS plus tard, exécutez:');
    console.log('   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
disableRLSTemporarily();
