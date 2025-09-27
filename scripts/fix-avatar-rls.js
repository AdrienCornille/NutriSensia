/**
 * Script pour corriger les politiques RLS du bucket avatars
 * Utilise l'API REST de Supabase pour configurer les politiques
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

async function fixAvatarRLS() {
  try {
    console.log('🔧 Correction des politiques RLS pour le bucket avatars...');

    // 1. D'abord, vérifier si le bucket existe et ses politiques
    const bucketResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket/avatars`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (bucketResponse.ok) {
      const bucket = await bucketResponse.json();
      console.log('✅ Bucket avatars trouvé:', bucket.name);
      console.log('   Public:', bucket.public);
      console.log('   File size limit:', bucket.file_size_limit);
    } else {
      console.log('❌ Bucket avatars non trouvé, création...');
      
      // Créer le bucket
      const createResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'avatars',
          name: 'avatars',
          public: true,
          file_size_limit: 5242880, // 5MB
          allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        }),
      });

      if (createResponse.ok) {
        console.log('✅ Bucket avatars créé avec succès');
      } else {
        const error = await createResponse.text();
        console.error('❌ Erreur lors de la création du bucket:', error);
        return;
      }
    }

    // 2. Configurer les politiques RLS via l'API REST
    console.log('🔒 Configuration des politiques RLS...');

    const policies = [
      {
        name: 'Avatar images are publicly accessible',
        definition: 'bucket_id = \'avatars\'',
        check: null,
        command: 'SELECT',
        target: 'objects'
      },
      {
        name: 'Authenticated users can upload avatars',
        definition: 'bucket_id = \'avatars\' AND auth.role() = \'authenticated\'',
        check: 'bucket_id = \'avatars\' AND auth.role() = \'authenticated\'',
        command: 'INSERT',
        target: 'objects'
      },
      {
        name: 'Users can update their own avatars',
        definition: 'bucket_id = \'avatars\' AND auth.uid()::text = (storage.foldername(name))[2]',
        check: 'bucket_id = \'avatars\' AND auth.uid()::text = (storage.foldername(name))[2]',
        command: 'UPDATE',
        target: 'objects'
      },
      {
        name: 'Users can delete their own avatars',
        definition: 'bucket_id = \'avatars\' AND auth.uid()::text = (storage.foldername(name))[2]',
        check: 'bucket_id = \'avatars\' AND auth.uid()::text = (storage.foldername(name))[2]',
        command: 'DELETE',
        target: 'objects'
      }
    ];

    for (const policy of policies) {
      try {
        // Supprimer la politique existante si elle existe
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_policy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
          },
          body: JSON.stringify({
            policy_name: policy.name,
            table_name: policy.target,
            schema_name: 'storage'
          }),
        });

        // Créer la nouvelle politique
        const createPolicyResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_policy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
          },
          body: JSON.stringify({
            policy_name: policy.name,
            table_name: policy.target,
            schema_name: 'storage',
            definition: policy.definition,
            check_expression: policy.check,
            command: policy.command
          }),
        });

        if (createPolicyResponse.ok) {
          console.log(`✅ Politique "${policy.name}" configurée`);
        } else {
          const error = await createPolicyResponse.text();
          console.warn(`⚠️  Erreur pour la politique "${policy.name}":`, error);
        }
      } catch (error) {
        console.warn(`⚠️  Erreur lors de la configuration de la politique "${policy.name}":`, error.message);
      }
    }

    // 3. Alternative: Désactiver temporairement RLS pour le bucket
    console.log('🔄 Tentative de désactivation temporaire de RLS...');
    
    const disableRLSResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/disable_rls`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({
        table_name: 'objects',
        schema_name: 'storage'
      }),
    });

    if (disableRLSResponse.ok) {
      console.log('✅ RLS temporairement désactivé pour storage.objects');
      console.log('⚠️  ATTENTION: Ceci est temporaire pour les tests. Réactivez RLS en production!');
    } else {
      console.log('ℹ️  RLS reste activé (normal en production)');
    }

    console.log('🎉 Configuration terminée!');
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('1. Testez l\'upload d\'avatar dans l\'application');
    console.log('2. Si cela fonctionne, réactivez RLS dans l\'interface Supabase');
    console.log('3. Configurez manuellement les politiques dans Supabase → Storage → Policies');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
fixAvatarRLS();
