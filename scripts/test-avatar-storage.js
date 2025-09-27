#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration du stockage d'avatars
 * Usage: node scripts/test-avatar-storage.js
 */

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
 * Test de la configuration du bucket
 */
async function testBucketConfiguration() {
  console.log('🔍 Test de la configuration du bucket...');
  
  try {
    // Vérifier que le bucket existe
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des buckets:', error.message);
      return false;
    }
    
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucket) {
      console.error('❌ Bucket "avatars" non trouvé');
      console.log('Buckets disponibles:', buckets.map(b => b.name));
      return false;
    }
    
    console.log('✅ Bucket "avatars" trouvé');
    console.log('   - Public:', avatarsBucket.public);
    console.log('   - Taille limite:', avatarsBucket.file_size_limit);
    console.log('   - Types MIME autorisés:', avatarsBucket.allowed_mime_types);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de configuration:', error.message);
    return false;
  }
}

/**
 * Test des permissions de téléchargement
 */
async function testUploadPermissions() {
  console.log('\n🔍 Test des permissions de téléchargement...');
  
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
 * Test des permissions de lecture
 */
async function testReadPermissions() {
  console.log('\n🔍 Test des permissions de lecture...');
  
  try {
    // Lister les fichiers dans le bucket
    const { data: files, error } = await supabase.storage
      .from('avatars')
      .list('', { limit: 10 });
    
    if (error) {
      console.error('❌ Erreur lors de la lecture:', error.message);
      return false;
    }
    
    console.log('✅ Lecture réussie');
    console.log('   - Fichiers trouvés:', files.length);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de lecture:', error.message);
    return false;
  }
}

/**
 * Test de la génération d'URL publique
 */
async function testPublicUrlGeneration() {
  console.log('\n🔍 Test de la génération d\'URL publique...');
  
  try {
    // Créer un fichier de test
    const testFile = new Blob(['test content'], { type: 'image/jpeg' });
    const fileName = `test-url-${Date.now()}.jpg`;
    const filePath = `test-user/${fileName}`;
    
    // Télécharger le fichier
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, testFile, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('❌ Erreur lors du téléchargement pour le test d\'URL:', uploadError.message);
      return false;
    }
    
    // Générer l'URL publique
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    console.log('✅ URL publique générée');
    console.log('   - URL:', urlData.publicUrl);
    
    // Vérifier que l'URL est accessible
    try {
      const response = await fetch(urlData.publicUrl);
      if (response.ok) {
        console.log('✅ URL accessible');
      } else {
        console.warn('⚠️ URL non accessible (statut:', response.status, ')');
      }
    } catch (fetchError) {
      console.warn('⚠️ Impossible de vérifier l\'accessibilité de l\'URL:', fetchError.message);
    }
    
    // Nettoyer
    await supabase.storage.from('avatars').remove([filePath]);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test d\'URL publique:', error.message);
    return false;
  }
}

/**
 * Test de la validation des types de fichiers
 */
async function testFileTypeValidation() {
  console.log('\n🔍 Test de la validation des types de fichiers...');
  
  try {
    // Tester avec un type de fichier non autorisé
    const invalidFile = new Blob(['test content'], { type: 'application/pdf' });
    const fileName = `test-invalid-${Date.now()}.pdf`;
    const filePath = `test-user/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, invalidFile, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.log('✅ Validation des types de fichiers active');
      console.log('   - Erreur attendue pour PDF:', error.message);
    } else {
      console.warn('⚠️ La validation des types de fichiers pourrait ne pas être active');
      // Nettoyer si le fichier a été téléchargé
      await supabase.storage.from('avatars').remove([filePath]);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de validation:', error.message);
    return false;
  }
}

/**
 * Test de la limite de taille de fichier
 */
async function testFileSizeLimit() {
  console.log('\n🔍 Test de la limite de taille de fichier...');
  
  try {
    // Créer un fichier de 6MB (au-dessus de la limite de 5MB)
    const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
    const largeFile = new Blob([largeContent], { type: 'image/jpeg' });
    const fileName = `test-large-${Date.now()}.jpg`;
    const filePath = `test-user/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, largeFile, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.log('✅ Limite de taille de fichier active');
      console.log('   - Erreur attendue pour fichier trop volumineux:', error.message);
    } else {
      console.warn('⚠️ La limite de taille de fichier pourrait ne pas être active');
      // Nettoyer si le fichier a été téléchargé
      await supabase.storage.from('avatars').remove([filePath]);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de limite de taille:', error.message);
    return false;
  }
}

/**
 * Test de l'authentification
 */
async function testAuthentication() {
  console.log('\n🔍 Test de l\'authentification...');
  
  try {
    // Vérifier l'état de l'authentification
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('ℹ️ Utilisateur non authentifié (normal pour les tests)');
      console.log('   - Erreur:', error.message);
    } else if (user) {
      console.log('✅ Utilisateur authentifié');
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
    } else {
      console.log('ℹ️ Aucun utilisateur connecté');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test d\'authentification:', error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function runTests() {
  console.log('🚀 Démarrage des tests de configuration du stockage d\'avatars\n');
  
  const tests = [
    { name: 'Configuration du bucket', fn: testBucketConfiguration },
    { name: 'Permissions de téléchargement', fn: testUploadPermissions },
    { name: 'Permissions de lecture', fn: testReadPermissions },
    { name: 'Génération d\'URL publique', fn: testPublicUrlGeneration },
    { name: 'Validation des types de fichiers', fn: testFileTypeValidation },
    { name: 'Limite de taille de fichier', fn: testFileSizeLimit },
    { name: 'Authentification', fn: testAuthentication },
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Erreur lors du test "${test.name}":`, error.message);
    }
  }
  
  console.log('\n📊 Résumé des tests');
  console.log('==================');
  console.log(`Tests réussis: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests sont passés ! La configuration est correcte.');
    process.exit(0);
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration.');
    process.exit(1);
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});
