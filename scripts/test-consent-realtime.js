/**
 * Script de test en temps réel pour vérifier l'enregistrement des consentements
 * Surveille les changements dans la table nutritionists
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConsentRealtime() {
  console.log('🔍 Test en temps réel des consentements...\n');

  try {
    // Récupérer les nutritionnistes avec leurs consentements
    const { data: nutritionists, error } = await supabase
      .from('nutritionists')
      .select(`
        id, 
        first_name, 
        last_name, 
        terms_accepted, 
        terms_accepted_at,
        privacy_policy_accepted, 
        privacy_policy_accepted_at,
        marketing_consent, 
        marketing_consent_at,
        updated_at
      `)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Erreur lors de la récupération des données:', error.message);
      return;
    }

    if (!nutritionists || nutritionists.length === 0) {
      console.log('📭 Aucun nutritionniste trouvé dans la base de données.');
      console.log('🔧 Complétez l\'onboarding sur http://localhost:3000/onboarding/nutritionist pour créer des données de test.');
      return;
    }

    console.log(`📊 ${nutritionists.length} nutritionniste(s) trouvé(s):\n`);

    nutritionists.forEach((nutritionist, index) => {
      console.log(`${index + 1}. ${nutritionist.first_name} ${nutritionist.last_name} (ID: ${nutritionist.id.substring(0, 8)}...)`);
      console.log(`   📋 Conditions d'utilisation: ${nutritionist.terms_accepted ? '✅ Acceptées' : '❌ Non acceptées'}`);
      if (nutritionist.terms_accepted_at) {
        console.log(`      Acceptées le: ${new Date(nutritionist.terms_accepted_at).toLocaleString('fr-FR')}`);
      }
      
      console.log(`   🔒 Politique de confidentialité: ${nutritionist.privacy_policy_accepted ? '✅ Acceptée' : '❌ Non acceptée'}`);
      if (nutritionist.privacy_policy_accepted_at) {
        console.log(`      Acceptée le: ${new Date(nutritionist.privacy_policy_accepted_at).toLocaleString('fr-FR')}`);
      }
      
      console.log(`   📧 Consentement marketing: ${nutritionist.marketing_consent ? '✅ Accepté' : '❌ Refusé'}`);
      if (nutritionist.marketing_consent_at) {
        console.log(`      Décidé le: ${new Date(nutritionist.marketing_consent_at).toLocaleString('fr-FR')}`);
      }
      
      console.log(`   🕒 Dernière mise à jour: ${new Date(nutritionist.updated_at).toLocaleString('fr-FR')}`);
      console.log('');
    });

    // Instructions pour le test
    console.log('🧪 Pour tester en temps réel :');
    console.log('1. Gardez ce script ouvert dans un terminal');
    console.log('2. Allez sur http://localhost:3000/onboarding/nutritionist');
    console.log('3. Complétez jusqu\'à l\'étape de récapitulatif');
    console.log('4. Cochez/décochez les cases de consentement');
    console.log('5. Relancez ce script pour voir les changements');
    console.log('');
    console.log('💡 Astuce: Ouvrez les outils de développement (F12) pour voir les logs de sauvegarde');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testConsentRealtime();


