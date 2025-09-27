#!/usr/bin/env node

/**
 * Script pour nettoyer les facteurs MFA existants
 * Résout le problème "A factor with the friendly name "" for this user already exists"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🧹 Nettoyage des facteurs MFA existants...\n');

// Vérifier les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Variables d'environnement manquantes");
  console.log('   Vérifiez votre fichier .env.local');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupMFAFactors() {
  try {
    console.log('🔧 Connexion à Supabase...');

    // Vérifier la session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log('❌ Erreur de session:');
      console.log(`   ${sessionError.message}`);
      console.log(
        "\n📋 Connectez-vous d'abord sur http://localhost:3002/mfa-test"
      );
      return;
    }

    if (!sessionData.session) {
      console.log('❌ Aucune session active');
      console.log(
        "\n📋 Connectez-vous d'abord sur http://localhost:3002/mfa-test"
      );
      return;
    }

    console.log('✅ Session active trouvée');
    console.log(`   Utilisateur: ${sessionData.session.user.email}`);

    // Lister les facteurs existants
    console.log('\n📋 Liste des facteurs MFA existants...');
    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      console.log('❌ Erreur lors de la récupération des facteurs:');
      console.log(`   ${factorsError.message}`);
      return;
    }

    const totpFactors = factorsData.totp || [];
    const smsFactors = factorsData.sms || [];

    console.log(`   Facteurs TOTP trouvés: ${totpFactors.length}`);
    console.log(`   Facteurs SMS trouvés: ${smsFactors.length}`);

    if (totpFactors.length === 0 && smsFactors.length === 0) {
      console.log('✅ Aucun facteur à nettoyer');
      return;
    }

    // Afficher les détails des facteurs
    if (totpFactors.length > 0) {
      console.log('\n📱 Facteurs TOTP:');
      totpFactors.forEach((factor, index) => {
        console.log(`   ${index + 1}. ID: ${factor.id}`);
        console.log(`      Nom: "${factor.friendly_name || '(vide)'}"`);
        console.log(`      Statut: ${factor.status}`);
        console.log(
          `      Créé: ${new Date(factor.created_at).toLocaleString('fr-FR')}`
        );
      });
    }

    if (smsFactors.length > 0) {
      console.log('\n📞 Facteurs SMS:');
      smsFactors.forEach((factor, index) => {
        console.log(`   ${index + 1}. ID: ${factor.id}`);
        console.log(`      Nom: "${factor.friendly_name || '(vide)'}"`);
        console.log(`      Statut: ${factor.status}`);
        console.log(
          `      Créé: ${new Date(factor.created_at).toLocaleString('fr-FR')}`
        );
      });
    }

    // Supprimer les facteurs problématiques
    console.log('\n🗑️  Suppression des facteurs...');

    let deletedCount = 0;

    // Supprimer les facteurs TOTP
    for (const factor of totpFactors) {
      try {
        console.log(`   Suppression du facteur TOTP: ${factor.id}`);
        const { error: deleteError } = await supabase.auth.mfa.unenroll({
          factorId: factor.id,
        });

        if (deleteError) {
          console.log(`   ❌ Erreur: ${deleteError.message}`);
        } else {
          console.log(`   ✅ Supprimé avec succès`);
          deletedCount++;
        }
      } catch (err) {
        console.log(`   ❌ Erreur: ${err.message}`);
      }
    }

    // Supprimer les facteurs SMS
    for (const factor of smsFactors) {
      try {
        console.log(`   Suppression du facteur SMS: ${factor.id}`);
        const { error: deleteError } = await supabase.auth.mfa.unenroll({
          factorId: factor.id,
        });

        if (deleteError) {
          console.log(`   ❌ Erreur: ${deleteError.message}`);
        } else {
          console.log(`   ✅ Supprimé avec succès`);
          deletedCount++;
        }
      } catch (err) {
        console.log(`   ❌ Erreur: ${err.message}`);
      }
    }

    console.log(
      `\n✅ Nettoyage terminé: ${deletedCount} facteur(s) supprimé(s)`
    );

    // Vérifier le résultat
    console.log('\n🔍 Vérification après nettoyage...');
    const { data: finalFactorsData, error: finalFactorsError } =
      await supabase.auth.mfa.listFactors();

    if (finalFactorsError) {
      console.log('❌ Erreur lors de la vérification finale:');
      console.log(`   ${finalFactorsError.message}`);
      return;
    }

    const finalTotpFactors = finalFactorsData.totp || [];
    const finalSmsFactors = finalFactorsData.sms || [];

    console.log(`   Facteurs TOTP restants: ${finalTotpFactors.length}`);
    console.log(`   Facteurs SMS restants: ${finalSmsFactors.length}`);

    if (finalTotpFactors.length === 0 && finalSmsFactors.length === 0) {
      console.log(
        '✅ Nettoyage réussi ! Vous pouvez maintenant configurer un nouveau facteur MFA.'
      );
    } else {
      console.log("⚠️  Certains facteurs n'ont pas pu être supprimés.");
    }
  } catch (error) {
    console.log('❌ Erreur lors du nettoyage:');
    console.log(`   ${error.message}`);
  }
}

// Exécuter le nettoyage
cleanupMFAFactors().catch(console.error);
