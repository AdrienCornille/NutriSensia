#!/usr/bin/env node

/**
 * Script de test rapide pour la fonctionnalité d'avatar
 * Usage: node scripts/quick-test-avatar.js
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement Supabase manquantes");
  console.error(
    'Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test de connexion Supabase
 */
async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase...');

  try {
    // Test simple de connexion
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }

    console.log('✅ Connexion Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}

/**
 * Test du bucket de stockage
 */
async function testStorageBucket() {
  console.log('🔍 Test du bucket de stockage...');

  try {
    // Vérifier que le bucket existe
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error(
        '❌ Erreur lors de la récupération des buckets:',
        error.message
      );
      return false;
    }

    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');

    if (!avatarsBucket) {
      console.error('❌ Bucket avatars non trouvé');
      console.log(
        'Buckets disponibles:',
        buckets.map(b => b.name)
      );
      return false;
    }

    console.log('✅ Bucket avatars trouvé');
    console.log('   - Public:', avatarsBucket.public);
    console.log('   - Taille limite:', avatarsBucket.file_size_limit);

    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test du bucket:', error.message);
    return false;
  }
}

/**
 * Test de téléchargement de fichier
 */
async function testFileUpload() {
  console.log('🔍 Test de téléchargement de fichier...');

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

    console.log('✅ Téléchargement réussi');
    console.log('   - Chemin:', data.path);

    // Générer l'URL publique
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    console.log('✅ URL publique générée');
    console.log('   - URL:', urlData.publicUrl);

    // Nettoyer le fichier de test
    await supabase.storage.from('avatars').remove([filePath]);
    console.log('✅ Fichier de test supprimé');

    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de téléchargement:', error.message);
    return false;
  }
}

/**
 * Test de la table profiles
 */
async function testProfilesTable() {
  console.log('🔍 Test de la table profiles...');

  try {
    // Vérifier que la table existe et est accessible
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .limit(1);

    if (error) {
      console.error(
        "❌ Erreur lors de l'accès à la table profiles:",
        error.message
      );
      return false;
    }

    console.log('✅ Table profiles accessible');
    console.log('   - Nombre de profils:', data.length);

    return true;
  } catch (error) {
    console.error(
      '❌ Erreur lors du test de la table profiles:',
      error.message
    );
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🧪 Test rapide de la fonctionnalité Avatar');
  console.log('========================================');
  console.log('');

  let testsPassed = 0;
  let totalTests = 4;

  // Test 1: Connexion Supabase
  if (await testSupabaseConnection()) {
    testsPassed++;
  }
  console.log('');

  // Test 2: Bucket de stockage
  if (await testStorageBucket()) {
    testsPassed++;
  }
  console.log('');

  // Test 3: Téléchargement de fichier
  if (await testFileUpload()) {
    testsPassed++;
  }
  console.log('');

  // Test 4: Table profiles
  if (await testProfilesTable()) {
    testsPassed++;
  }
  console.log('');

  // Résumé
  console.log('📊 Résumé des tests');
  console.log('==================');
  console.log(`Tests réussis: ${testsPassed}/${totalTests}`);
  console.log('');

  if (testsPassed === totalTests) {
    console.log('🎉 Tous les tests sont passés !');
    console.log('');
    console.log("✅ La fonctionnalité de téléchargement d'avatar est prête");
    console.log('');
    console.log('📝 Prochaines étapes :');
    console.log("1. Démarrer l'application: npm run dev");
    console.log('2. Naviguer vers: http://localhost:3000/profile-test');
    console.log('3. Se connecter avec votre compte');
    console.log("4. Tester le téléchargement d'avatar");
    process.exit(0);
  } else {
    console.log('⚠️ Certains tests ont échoué');
    console.log('');
    console.log('📝 Vérifiez :');
    console.log("   - Vos variables d'environnement Supabase");
    console.log('   - La configuration de votre projet Supabase');
    console.log("   - L'exécution du script setup-avatar-storage.sql");
    process.exit(1);
  }
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});
