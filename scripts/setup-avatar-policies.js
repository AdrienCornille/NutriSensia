/**
 * Script pour configurer les politiques RLS du stockage d'avatars
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables d'environnement Supabase manquantes");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAvatarPolicies() {
  try {
    console.log('🔒 Configuration des politiques RLS pour les avatars...');

    // SQL pour créer les politiques
    const policiesSQL = `
      -- Supprimer les politiques existantes si elles existent
      DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
      DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

      -- Politique SELECT (lecture publique)
      CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');

      -- Politique INSERT (upload authentifié)
      CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'avatars'
      );

      -- Politique UPDATE (mise à jour par propriétaire)
      CREATE POLICY "Users can update their own avatars" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[2]
      );

      -- Politique DELETE (suppression par propriétaire)
      CREATE POLICY "Users can delete their own avatars" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[2]
      );
    `;

    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', { sql: policiesSQL });

    if (error) {
      // Si la fonction exec_sql n'existe pas, on utilise une approche différente
      console.log(
        "⚠️  Fonction exec_sql non disponible, utilisation d'une approche alternative..."
      );

      // Créer les politiques une par une
      const policies = [
        {
          name: 'Avatar images are publicly accessible',
          sql: `CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars')`,
        },
        {
          name: 'Authenticated users can upload avatars',
          sql: `CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'avatars')`,
        },
        {
          name: 'Users can update their own avatars',
          sql: `CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[2])`,
        },
        {
          name: 'Users can delete their own avatars',
          sql: `CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[2])`,
        },
      ];

      for (const policy of policies) {
        try {
          const { error: policyError } = await supabase.rpc('exec_sql', {
            sql: policy.sql,
          });
          if (policyError) {
            console.warn(
              `⚠️  Erreur pour la politique ${policy.name}:`,
              policyError.message
            );
          } else {
            console.log(`✅ Politique ${policy.name} créée`);
          }
        } catch (err) {
          console.warn(
            `⚠️  Impossible de créer la politique ${policy.name}:`,
            err.message
          );
        }
      }
    } else {
      console.log('✅ Toutes les politiques ont été créées avec succès');
    }

    // Vérifier les politiques existantes
    const { data: policies, error: listError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .like('policyname', '%avatar%');

    if (!listError && policies) {
      console.log("📋 Politiques d'avatars configurées:");
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    }

    console.log('🎉 Configuration des politiques terminée!');
  } catch (error) {
    console.error(
      '❌ Erreur lors de la configuration des politiques:',
      error.message
    );
    process.exit(1);
  }
}

// Exécuter le script
setupAvatarPolicies();
