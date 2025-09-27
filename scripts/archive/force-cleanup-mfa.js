#!/usr/bin/env node

/**
 * Script pour forcer la suppression de tous les facteurs MFA
 * Utilise des méthodes plus agressives pour nettoyer les facteurs cachés
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('💥 Nettoyage forcé des facteurs MFA...\n');

// Vérifier les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Variables d'environnement manquantes");
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function forceCleanupMFA() {
  try {
    console.log('🔧 Connexion à Supabase...');

    // Vérifier la session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.log('❌ Aucune session active');
      console.log(
        "📋 Connectez-vous d'abord sur http://localhost:3002/mfa-test"
      );
      return;
    }

    console.log('✅ Session active trouvée');
    console.log(`   Utilisateur: ${sessionData.session.user.email}`);

    // Méthode 1: Lister et supprimer les facteurs visibles
    console.log('\n🗑️  Méthode 1: Suppression des facteurs visibles...');

    try {
      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (!factorsError && factorsData) {
        const totpFactors = factorsData.totp || [];
        const smsFactors = factorsData.sms || [];

        console.log(`   Facteurs TOTP trouvés: ${totpFactors.length}`);
        console.log(`   Facteurs SMS trouvés: ${smsFactors.length}`);

        // Supprimer les facteurs TOTP
        for (const factor of totpFactors) {
          try {
            console.log(`   Suppression TOTP: ${factor.id}`);
            const { error: deleteError } = await supabase.auth.mfa.unenroll({
              factorId: factor.id,
            });

            if (deleteError) {
              console.log(`   ❌ Erreur: ${deleteError.message}`);
            } else {
              console.log(`   ✅ Supprimé`);
            }
          } catch (err) {
            console.log(`   ❌ Erreur: ${err.message}`);
          }
        }

        // Supprimer les facteurs SMS
        for (const factor of smsFactors) {
          try {
            console.log(`   Suppression SMS: ${factor.id}`);
            const { error: deleteError } = await supabase.auth.mfa.unenroll({
              factorId: factor.id,
            });

            if (deleteError) {
              console.log(`   ❌ Erreur: ${deleteError.message}`);
            } else {
              console.log(`   ✅ Supprimé`);
            }
          } catch (err) {
            console.log(`   ❌ Erreur: ${err.message}`);
          }
        }
      }
    } catch (err) {
      console.log(`   ❌ Erreur lors de la méthode 1: ${err.message}`);
    }

    // Méthode 2: Essayer de supprimer par nom vide
    console.log('\n🗑️  Méthode 2: Tentative de suppression par nom vide...');

    try {
      // Essayer de supprimer un facteur avec un nom vide (si c'est le problème)
      const { error: deleteError } = await supabase.auth.mfa.unenroll({
        factorId: 'empty-name-factor',
      });

      if (deleteError) {
        console.log(`   Erreur attendue: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Facteur supprimé`);
      }
    } catch (err) {
      console.log(`   Erreur attendue: ${err.message}`);
    }

    // Méthode 3: Réinitialiser la session
    console.log('\n🔄 Méthode 3: Réinitialisation de la session...');

    try {
      // Se déconnecter et se reconnecter pour nettoyer le cache
      await supabase.auth.signOut();
      console.log('   ✅ Déconnexion effectuée');

      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(
        '   📋 Veuillez vous reconnecter sur http://localhost:3002/mfa-test'
      );
    } catch (err) {
      console.log(`   ❌ Erreur lors de la déconnexion: ${err.message}`);
    }

    // Méthode 4: Vérifier l'état final
    console.log("\n🔍 Méthode 4: Vérification de l'état final...");

    try {
      const { data: finalFactorsData, error: finalFactorsError } =
        await supabase.auth.mfa.listFactors();

      if (finalFactorsError) {
        console.log(
          `   ❌ Erreur lors de la vérification: ${finalFactorsError.message}`
        );
      } else {
        const finalTotpFactors = finalFactorsData.totp || [];
        const finalSmsFactors = finalFactorsData.sms || [];

        console.log(`   Facteurs TOTP restants: ${finalTotpFactors.length}`);
        console.log(`   Facteurs SMS restants: ${finalSmsFactors.length}`);

        if (finalTotpFactors.length === 0 && finalSmsFactors.length === 0) {
          console.log('   ✅ Aucun facteur restant');
        } else {
          console.log('   ⚠️  Des facteurs restent encore');
        }
      }
    } catch (err) {
      console.log(
        `   ❌ Erreur lors de la vérification finale: ${err.message}`
      );
    }

    // Recommandations finales
    console.log('\n💡 Recommandations finales:');
    console.log('   1. Reconnectez-vous sur http://localhost:3002/mfa-test');
    console.log('   2. Essayez de configurer un nouveau facteur MFA');
    console.log(
      '   3. Si le problème persiste, vérifiez les paramètres MFA dans Supabase'
    );
    console.log('   4. Contactez le support Supabase si nécessaire');
  } catch (error) {
    console.log('❌ Erreur lors du nettoyage forcé:');
    console.log(`   ${error.message}`);
  }
}

// Exécuter le nettoyage forcé
forceCleanupMFA().catch(console.error);
