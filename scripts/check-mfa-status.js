#!/usr/bin/env node

/**
 * Script pour vérifier le statut de la 2FA dans Supabase
 * Ce script teste si la 2FA est correctement configurée
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Vérification du statut 2FA dans Supabase...\n');

// Vérifier les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Variables d'environnement manquantes");
  console.log('   Vérifiez votre fichier .env.local');
  process.exit(1);
}

console.log("✅ Variables d'environnement trouvées");
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Clé: ${supabaseKey.substring(0, 20)}...`);

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMFAStatus() {
  try {
    console.log('\n🔧 Test de connexion à Supabase...');

    // Test de connexion basique
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log('❌ Erreur de connexion à Supabase:');
      console.log(`   ${error.message}`);
      return;
    }

    console.log('✅ Connexion à Supabase réussie');

    // Test de l'API MFA
    console.log("\n🔐 Test de l'API MFA...");

    try {
      // Essayer d'accéder à l'API MFA (cela échouera si MFA n'est pas activé)
      const { data: mfaData, error: mfaError } =
        await supabase.auth.mfa.listFactors();

      if (mfaError) {
        if (
          mfaError.message.includes('MFA') ||
          mfaError.message.includes('multi-factor')
        ) {
          console.log("❌ MFA n'est pas activé dans votre projet Supabase");
          console.log('\n📋 Pour activer la 2FA :');
          console.log('   1. Allez sur https://supabase.com/dashboard');
          console.log('   2. Sélectionnez votre projet');
          console.log('   3. Authentication > Settings');
          console.log('   4. Activez "Multi-Factor Authentication"');
        } else {
          console.log('⚠️  Erreur lors du test MFA:');
          console.log(`   ${mfaError.message}`);
        }
      } else {
        console.log('✅ API MFA accessible');
        console.log('   La 2FA semble être activée dans votre projet');
      }
    } catch (mfaTestError) {
      console.log("❌ Impossible de tester l'API MFA");
      console.log("   Cela peut indiquer que MFA n'est pas activé");
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification:');
    console.log(`   ${error.message}`);
  }
}

async function testMFAEnrollment() {
  console.log("\n🧪 Test d'enrôlement MFA...");

  try {
    // Créer un utilisateur de test temporaire
    const testEmail = `test-${Date.now()}@nutrisensia.test`;
    const testPassword = 'TestPassword123!';

    console.log(`   Création d'un utilisateur de test: ${testEmail}`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      }
    );

    if (signUpError) {
      console.log('❌ Erreur lors de la création du compte de test:');
      console.log(`   ${signUpError.message}`);
      return;
    }

    console.log('✅ Compte de test créé');

    // Se connecter avec le compte de test
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (signInError) {
      console.log('❌ Erreur lors de la connexion:');
      console.log(`   ${signInError.message}`);
      return;
    }

    console.log('✅ Connexion réussie');

    // Tester l'enrôlement MFA
    try {
      const { data: enrollData, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: 'totp',
        });

      if (enrollError) {
        console.log("❌ Erreur lors de l'enrôlement MFA:");
        console.log(`   ${enrollError.message}`);
        console.log('\n📋 Cela peut indiquer que :');
        console.log("   - MFA n'est pas activé dans Supabase");
        console.log("   - L'utilisateur a déjà un facteur MFA");
        console.log('   - Il y a un problème de configuration');
      } else {
        console.log('✅ Enrôlement MFA réussi !');
        console.log('   La 2FA est correctement configurée');
      }
    } catch (enrollTestError) {
      console.log("❌ Erreur lors du test d'enrôlement:");
      console.log(`   ${enrollTestError.message}`);
    }

    // Nettoyer : supprimer le compte de test
    await supabase.auth.signOut();
  } catch (error) {
    console.log("❌ Erreur lors du test d'enrôlement:");
    console.log(`   ${error.message}`);
  }
}

// Exécuter les vérifications
async function main() {
  await checkMFAStatus();
  await testMFAEnrollment();

  console.log('\n📚 Documentation : docs/supabase-2fa-setup.md');
  console.log('🔗 Dashboard Supabase : https://supabase.com/dashboard');
  console.log('🔗 Page de test : http://localhost:3002/mfa-test');
}

main().catch(console.error);
