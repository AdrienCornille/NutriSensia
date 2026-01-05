/**
 * Script pour configurer le stockage d'avatars dans Supabase
 * Crée le bucket 'avatars' avec les bonnes permissions
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables d'environnement Supabase manquantes");
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAvatarStorage() {
  try {
    console.log("🚀 Configuration du stockage d'avatars...");

    // 1. Vérifier si le bucket existe
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(
        `Erreur lors de la liste des buckets: ${listError.message}`
      );
    }

    const avatarBucket = buckets.find(bucket => bucket.name === 'avatars');

    if (avatarBucket) {
      console.log('✅ Bucket "avatars" existe déjà');
    } else {
      console.log('📦 Création du bucket "avatars"...');

      // 2. Créer le bucket
      const { data, error: createError } = await supabase.storage.createBucket(
        'avatars',
        {
          public: true,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
          ],
          fileSizeLimit: 5242880, // 5MB
        }
      );

      if (createError) {
        throw new Error(
          `Erreur lors de la création du bucket: ${createError.message}`
        );
      }

      console.log('✅ Bucket "avatars" créé avec succès');
    }

    // 3. Configurer les politiques RLS
    console.log('🔒 Configuration des politiques de sécurité...');

    // Politique pour permettre la lecture publique des avatars
    const { error: selectPolicyError } = await supabase.rpc(
      'create_avatar_select_policy'
    );
    if (
      selectPolicyError &&
      !selectPolicyError.message.includes('already exists')
    ) {
      console.warn(
        '⚠️  Erreur lors de la création de la politique SELECT:',
        selectPolicyError.message
      );
    } else {
      console.log('✅ Politique SELECT configurée');
    }

    // Politique pour permettre l'upload aux utilisateurs authentifiés
    const { error: insertPolicyError } = await supabase.rpc(
      'create_avatar_insert_policy'
    );
    if (
      insertPolicyError &&
      !insertPolicyError.message.includes('already exists')
    ) {
      console.warn(
        '⚠️  Erreur lors de la création de la politique INSERT:',
        insertPolicyError.message
      );
    } else {
      console.log('✅ Politique INSERT configurée');
    }

    // Politique pour permettre la mise à jour aux propriétaires
    const { error: updatePolicyError } = await supabase.rpc(
      'create_avatar_update_policy'
    );
    if (
      updatePolicyError &&
      !updatePolicyError.message.includes('already exists')
    ) {
      console.warn(
        '⚠️  Erreur lors de la création de la politique UPDATE:',
        updatePolicyError.message
      );
    } else {
      console.log('✅ Politique UPDATE configurée');
    }

    // Politique pour permettre la suppression aux propriétaires
    const { error: deletePolicyError } = await supabase.rpc(
      'create_avatar_delete_policy'
    );
    if (
      deletePolicyError &&
      !deletePolicyError.message.includes('already exists')
    ) {
      console.warn(
        '⚠️  Erreur lors de la création de la politique DELETE:',
        deletePolicyError.message
      );
    } else {
      console.log('✅ Politique DELETE configurée');
    }

    console.log("🎉 Configuration du stockage d'avatars terminée avec succès!");
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
setupAvatarStorage();
