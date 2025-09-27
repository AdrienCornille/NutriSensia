#!/usr/bin/env node

/**
 * Script de diagnostic approfondi pour identifier les problèmes MFA
 * Analyse en détail l'état des facteurs MFA et les erreurs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Diagnostic approfondi MFA...\n');

// Vérifier les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Variables d'environnement manquantes");
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function deepMFADiagnostic() {
  try {
    console.log('🔧 Connexion à Supabase...');

    // 1. Vérifier la session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log('❌ Erreur de session:', sessionError.message);
      return;
    }

    if (!sessionData.session) {
      console.log('❌ Aucune session active');
      console.log(
        "📋 Connectez-vous d'abord sur http://localhost:3002/mfa-test"
      );
      return;
    }

    console.log('✅ Session active trouvée');
    console.log(`   Utilisateur: ${sessionData.session.user.email}`);
    console.log(`   ID: ${sessionData.session.user.id}`);

    // 2. Vérifier l'assurance level
    console.log("\n🔐 Vérification du niveau d'assurance...");
    try {
      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        console.log('❌ Erreur AAL:', aalError.message);
      } else {
        console.log("✅ Niveau d'assurance:", aalData);
      }
    } catch (err) {
      console.log('❌ Erreur lors de la vérification AAL:', err.message);
    }

    // 3. Lister les facteurs avec plus de détails
    console.log('\n📋 Liste détaillée des facteurs MFA...');
    try {
      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.log('❌ Erreur lors de la récupération des facteurs:');
        console.log(`   ${factorsError.message}`);
        console.log(`   Code: ${factorsError.status}`);
        console.log(`   Détails:`, factorsError);
      } else {
        console.log('✅ Facteurs récupérés avec succès');
        console.log('   Données brutes:', JSON.stringify(factorsData, null, 2));

        const totpFactors = factorsData.totp || [];
        const smsFactors = factorsData.sms || [];

        console.log(`   Facteurs TOTP: ${totpFactors.length}`);
        console.log(`   Facteurs SMS: ${smsFactors.length}`);

        if (totpFactors.length > 0) {
          console.log('\n📱 Facteurs TOTP détaillés:');
          totpFactors.forEach((factor, index) => {
            console.log(`   ${index + 1}. ID: ${factor.id}`);
            console.log(`      Nom: "${factor.friendly_name || '(vide)'}"`);
            console.log(`      Statut: ${factor.status}`);
            console.log(
              `      Créé: ${new Date(factor.created_at).toLocaleString('fr-FR')}`
            );
            console.log(
              `      Mis à jour: ${new Date(factor.updated_at).toLocaleString('fr-FR')}`
            );
            console.log(`      Données complètes:`, factor);
          });
        }

        if (smsFactors.length > 0) {
          console.log('\n📞 Facteurs SMS détaillés:');
          smsFactors.forEach((factor, index) => {
            console.log(`   ${index + 1}. ID: ${factor.id}`);
            console.log(`      Nom: "${factor.friendly_name || '(vide)'}"`);
            console.log(`      Statut: ${factor.status}`);
            console.log(
              `      Créé: ${new Date(factor.created_at).toLocaleString('fr-FR')}`
            );
            console.log(
              `      Mis à jour: ${new Date(factor.updated_at).toLocaleString('fr-FR')}`
            );
            console.log(`      Données complètes:`, factor);
          });
        }
      }
    } catch (err) {
      console.log('❌ Erreur lors de la récupération des facteurs:');
      console.log(`   ${err.message}`);
      console.log(`   Type: ${err.constructor.name}`);
      console.log(`   Stack: ${err.stack}`);
    }

    // 4. Tester l'enrôlement avec gestion d'erreur détaillée
    console.log("\n🧪 Test d'enrôlement avec gestion d'erreur détaillée...");
    try {
      const { data: enrollData, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: 'totp',
        });

      if (enrollError) {
        console.log("❌ Erreur d'enrôlement:");
        console.log(`   Message: ${enrollError.message}`);
        console.log(`   Code: ${enrollError.status}`);
        console.log(`   Détails complets:`, enrollError);

        // Analyser l'erreur spécifique
        if (enrollError.message.includes('friendly name')) {
          console.log('\n🔍 Analyse de l\'erreur "friendly name":');
          console.log(
            "   Cette erreur indique qu'il y a un facteur avec un nom vide"
          );
          console.log('   Solution: Supprimer tous les facteurs existants');
        }
      } else {
        console.log('✅ Enrôlement réussi !');
        console.log(
          "   Données d'enrôlement:",
          JSON.stringify(enrollData, null, 2)
        );
      }
    } catch (err) {
      console.log("❌ Erreur lors du test d'enrôlement:");
      console.log(`   ${err.message}`);
      console.log(`   Type: ${err.constructor.name}`);
    }

    // 5. Vérifier les paramètres MFA dans Supabase
    console.log('\n⚙️  Vérification des paramètres MFA...');
    console.log('📋 Pour vérifier les paramètres MFA dans Supabase:');
    console.log('   1. Allez sur https://supabase.com/dashboard');
    console.log('   2. Sélectionnez votre projet');
    console.log('   3. Authentication > Settings');
    console.log('   4. Vérifiez que "Multi-Factor Authentication" est activé');

    // 6. Recommandations
    console.log('\n💡 Recommandations:');
    console.log('   1. Vérifiez que MFA est activé dans Supabase');
    console.log('   2. Si des facteurs existent, supprimez-les tous');
    console.log('   3. Essayez de créer un nouveau facteur');
    console.log('   4. Vérifiez les logs Supabase pour plus de détails');
  } catch (error) {
    console.log('❌ Erreur lors du diagnostic:');
    console.log(`   ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }
}

// Exécuter le diagnostic
deepMFADiagnostic().catch(console.error);
