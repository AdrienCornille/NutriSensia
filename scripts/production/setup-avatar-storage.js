#!/usr/bin/env node

/**
 * Script de configuration automatique du bucket de stockage pour les avatars
 * Usage: node scripts/setup-avatar-storage.js
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Créer le bucket avatars s'il n'existe pas
 */
async function createAvatarBucket() {
  console.log('🔧 Création du bucket avatars...');
  
  try {
    // Vérifier si le bucket existe déjà
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des buckets:', listError.message);
      return false;
    }
    
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Bucket avatars existe déjà');
      return true;
    }
    
    // Créer le bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });
    
    if (error) {
      console.error('❌ Erreur lors de la création du bucket:', error.message);
      return false;
    }
    
    console.log('✅ Bucket avatars créé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création du bucket:', error.message);
    return false;
  }
}

/**
 * Tester les permissions de base
 */
async function testBasicPermissions() {
  console.log('🔍 Test des permissions de base...');
  
  try {
    // Créer un fichier de test
    const testFile = new Blob(['test content'], { type: 'image/jpeg' });
    const fileName = `test-${Date.now()}.jpg`;
    const filePath = `test-user/${fileName}`;
    
    // Tenter de télécharger
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, testFile, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('❌ Erreur de téléchargement:', error.message);
      return false;
    }
    
    console.log('✅ Téléchargement de test réussi');
    
    // Nettoyer le fichier de test
    await supabase.storage.from('avatars').remove([filePath]);
    console.log('✅ Fichier de test supprimé');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test des permissions:', error.message);
    return false;
  }
}

/**
 * Vérifier la configuration actuelle
 */
async function checkCurrentConfiguration() {
  console.log('🔍 Vérification de la configuration actuelle...');
  
  try {
    // Vérifier que le bucket existe
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des buckets:', error.message);
      return false;
    }
    
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucket) {
      console.error('❌ Bucket avatars non trouvé');
      return false;
    }
    
    console.log('✅ Bucket avatars trouvé');
    console.log('   - Public:', avatarsBucket.public);
    console.log('   - Taille limite:', avatarsBucket.file_size_limit);
    console.log('   - Types MIME autorisés:', avatarsBucket.allowed_mime_types);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Configuration du stockage d\'avatars');
  console.log('=====================================');
  console.log('');
  
  let success = true;
  
  // 1. Créer le bucket si nécessaire
  if (!(await createAvatarBucket())) {
    success = false;
  }
  
  console.log('');
  
  // 2. Vérifier la configuration
  if (!(await checkCurrentConfiguration())) {
    success = false;
  }
  
  console.log('');
  
  // 3. Tester les permissions
  if (!(await testBasicPermissions())) {
    success = false;
  }
  
  console.log('');
  console.log('📊 Résumé');
  console.log('=========');
  
  if (success) {
    console.log('🎉 Configuration réussie !');
    console.log('');
    console.log('✅ Le bucket avatars est configuré et fonctionnel');
    console.log('✅ Les permissions de base sont correctes');
    console.log('✅ Vous pouvez maintenant tester la fonctionnalité de téléchargement d\'avatar');
    console.log('');
    console.log('📝 Prochaines étapes :');
    console.log('1. Naviguez vers http://localhost:3000/profile-test');
    console.log('2. Connectez-vous avec votre compte');
    console.log('3. Testez le téléchargement d\'avatar');
    process.exit(0);
  } else {
    console.log('⚠️ Configuration incomplète');
    console.log('');
    console.log('❌ Certaines étapes ont échoué');
    console.log('📝 Vérifiez :');
    console.log('   - Vos variables d\'environnement Supabase');
    console.log('   - Votre connexion internet');
    console.log('   - Les permissions de votre projet Supabase');
    process.exit(1);
  }
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});
