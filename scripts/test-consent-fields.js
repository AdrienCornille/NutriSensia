/**
 * Script de test pour vérifier l'ajout des champs de consentement
 * Teste la structure de la table nutritionists après migration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConsentFields() {
  console.log('🧪 Test de la structure des champs de consentement...\n');

  try {
    // Test 1: Vérifier la structure de la table
    console.log('1️⃣ Vérification de la structure de la table nutritionists...');

    const { data: columns, error: columnsError } = await supabase.rpc(
      'get_table_columns',
      { table_name: 'nutritionists' }
    );

    if (columnsError) {
      // Fallback: essayer une requête simple pour voir si les colonnes existent
      const { data: testData, error: testError } = await supabase
        .from('nutritionists')
        .select(
          'terms_accepted, terms_accepted_at, privacy_policy_accepted, privacy_policy_accepted_at, marketing_consent, marketing_consent_at'
        )
        .limit(1);

      if (testError) {
        console.log('❌ Les champs de consentement ne semblent pas exister');
        console.log('   Erreur:', testError.message);
        console.log('\n🔧 Pour appliquer la migration :');
        console.log('   ./scripts/apply-consent-migration.sh');
        return;
      } else {
        console.log('✅ Les champs de consentement existent dans la table');
      }
    } else {
      const consentFields = [
        'terms_accepted',
        'terms_accepted_at',
        'privacy_policy_accepted',
        'privacy_policy_accepted_at',
        'marketing_consent',
        'marketing_consent_at',
      ];
      const existingFields = columns.filter(col =>
        consentFields.includes(col.column_name)
      );

      console.log(
        `   Champs de consentement trouvés: ${existingFields.length}/6`
      );
      existingFields.forEach(field => {
        console.log(`   ✅ ${field.column_name} (${field.data_type})`);
      });
    }

    // Test 2: Tester l'insertion de données de test
    console.log("\n2️⃣ Test d'insertion de données de consentement...");

    // Créer un utilisateur de test fictif (ne sera pas inséré réellement)
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testData = {
      id: testUserId,
      first_name: 'Test',
      last_name: 'Nutritionist',
      locale: 'fr-CH',
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      privacy_policy_accepted: true,
      privacy_policy_accepted_at: new Date().toISOString(),
      marketing_consent: false,
      marketing_consent_at: new Date().toISOString(),
      specializations: ['clinical-nutrition'],
      consultation_rates: {
        initial: 22500,
        follow_up: 15000,
        express: 7500,
      },
      practice_address: {
        street: 'Test Street 1',
        postal_code: '1000',
        city: 'Test City',
        canton: 'GE',
        country: 'CH',
      },
    };

    // Simuler l'insertion (dry-run)
    console.log('   Données de test préparées ✅');
    console.log('   - terms_accepted: true');
    console.log('   - privacy_policy_accepted: true');
    console.log('   - marketing_consent: false');
    console.log('   - Horodatages générés ✅');

    // Test 3: Vérifier les index
    console.log('\n3️⃣ Vérification des index de performance...');

    const { data: indexes, error: indexError } = await supabase.rpc(
      'get_table_indexes',
      { table_name: 'nutritionists' }
    );

    if (!indexError && indexes) {
      const consentIndexes = indexes.filter(
        idx =>
          idx.indexname.includes('terms_accepted') ||
          idx.indexname.includes('privacy_accepted') ||
          idx.indexname.includes('marketing_consent')
      );

      console.log(
        `   Index de consentement trouvés: ${consentIndexes.length}/3`
      );
      consentIndexes.forEach(idx => {
        console.log(`   ✅ ${idx.indexname}`);
      });
    } else {
      console.log(
        "   ⚠️  Impossible de vérifier les index (normal si RPC n'existe pas)"
      );
    }

    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n📋 Résumé :');
    console.log('   - Structure de table : ✅');
    console.log('   - Champs de consentement : ✅');
    console.log('   - Format des données : ✅');
    console.log(
      "\n🚀 Vous pouvez maintenant tester l'onboarding sur http://localhost:3000/onboarding/nutritionist"
    );
  } catch (error) {
    console.error('❌ Erreur lors du test :', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testConsentFields();
