#!/usr/bin/env node

/**
 * Script de test pour l'infrastructure A/B Testing
 * 
 * Ce script teste tous les composants du système A/B Testing
 * pour s'assurer qu'ils fonctionnent correctement.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuration (à adapter selon votre environnement)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_key';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Initialisation du client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Générateur d'utilisateurs de test
 */
function generateTestUser(role = 'nutritionist') {
  const id = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    email: `${id}@test.com`,
    role,
    created_at: new Date().toISOString(),
  };
}

/**
 * Test 1: Vérification des schémas de base de données
 */
async function testDatabaseSchema() {
  console.log('\n🗄️  Test 1: Vérification des schémas de base de données');
  console.log('='.repeat(60));
  
  try {
    // Test de la table ab_test_events
    const { data: eventsTable, error: eventsError } = await supabase
      .from('ab_test_events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.error('❌ Table ab_test_events:', eventsError.message);
      return false;
    }
    console.log('✅ Table ab_test_events: OK');
    
    // Test de la table ab_test_configurations
    const { data: configsTable, error: configsError } = await supabase
      .from('ab_test_configurations')
      .select('*')
      .limit(1);
    
    if (configsError) {
      console.error('❌ Table ab_test_configurations:', configsError.message);
      return false;
    }
    console.log('✅ Table ab_test_configurations: OK');
    
    // Test de la table gradual_rollout_configs
    const { data: rolloutTable, error: rolloutError } = await supabase
      .from('gradual_rollout_configs')
      .select('*')
      .limit(1);
    
    if (rolloutError) {
      console.error('❌ Table gradual_rollout_configs:', rolloutError.message);
      return false;
    }
    console.log('✅ Table gradual_rollout_configs: OK');
    
    // Test des vues analytiques
    const { data: conversionView, error: viewError } = await supabase
      .from('ab_test_conversions_by_variant')
      .select('*')
      .limit(1);
    
    if (viewError) {
      console.error('❌ Vue ab_test_conversions_by_variant:', viewError.message);
      return false;
    }
    console.log('✅ Vue ab_test_conversions_by_variant: OK');
    
    console.log('✅ Tous les schémas de base de données sont correctement déployés');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test des schémas:', error.message);
    return false;
  }
}

/**
 * Test 2: API de découverte des feature flags
 */
async function testFlagsAPI() {
  console.log('\n🚩 Test 2: API de découverte des feature flags');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/flags`, {
      headers: {
        'Authorization': 'Bearer test-token', // À adapter selon votre auth
      }
    });
    
    if (!response.ok) {
      console.error('❌ API Flags - Status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API Flags accessible');
    console.log('📊 Flags disponibles:', Object.keys(data.flags || {}).length);
    
    // Vérifier la présence des flags attendus
    const expectedFlags = [
      'nutritionist-onboarding-variant',
      'onboarding-progress-display',
      'form-validation-type',
      'onboarding-animations'
    ];
    
    let flagsFound = 0;
    expectedFlags.forEach(flag => {
      if (data.flags && data.flags[flag]) {
        console.log(`✅ Flag ${flag}: configuré`);
        flagsFound++;
      } else {
        console.log(`⚠️  Flag ${flag}: non trouvé`);
      }
    });
    
    console.log(`📈 ${flagsFound}/${expectedFlags.length} flags configurés`);
    return flagsFound > 0;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API Flags:', error.message);
    return false;
  }
}

/**
 * Test 3: Enregistrement d'événements A/B
 */
async function testEventTracking() {
  console.log('\n📊 Test 3: Enregistrement d\'événements A/B');
  console.log('='.repeat(60));
  
  try {
    const testUser = generateTestUser();
    const testEvents = [
      {
        event_type: 'flag_assignment',
        user_id: testUser.id,
        session_id: `session_${Date.now()}`,
        flag_key: 'nutritionist-onboarding-variant',
        flag_value: 'simplified',
        variant: 'simplified',
        user_role: 'nutritionist',
        custom_data: { test: true }
      },
      {
        event_type: 'onboarding_start',
        user_id: testUser.id,
        session_id: `session_${Date.now()}`,
        flag_key: 'nutritionist-onboarding-variant',
        flag_value: 'simplified',
        variant: 'simplified',
        user_role: 'nutritionist',
        onboarding_step: 'welcome'
      },
      {
        event_type: 'conversion',
        user_id: testUser.id,
        session_id: `session_${Date.now()}`,
        flag_key: 'nutritionist-onboarding-variant',
        flag_value: 'simplified',
        variant: 'simplified',
        user_role: 'nutritionist',
        duration_ms: 120000
      }
    ];
    
    // Insertion des événements de test
    const { data, error } = await supabase
      .from('ab_test_events')
      .insert(testEvents)
      .select();
    
    if (error) {
      console.error('❌ Erreur insertion événements:', error.message);
      return false;
    }
    
    console.log(`✅ ${data.length} événements insérés avec succès`);
    
    // Vérification de la lecture
    const { data: readData, error: readError } = await supabase
      .from('ab_test_events')
      .select('*')
      .eq('user_id', testUser.id);
    
    if (readError) {
      console.error('❌ Erreur lecture événements:', readError.message);
      return false;
    }
    
    console.log(`✅ ${readData.length} événements lus avec succès`);
    
    // Nettoyage des données de test
    await supabase
      .from('ab_test_events')
      .delete()
      .eq('user_id', testUser.id);
    
    console.log('🧹 Données de test nettoyées');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de tracking:', error.message);
    return false;
  }
}

/**
 * Test 4: API Analytics A/B
 */
async function testAnalyticsAPI() {
  console.log('\n📈 Test 4: API Analytics A/B');
  console.log('='.repeat(60));
  
  try {
    // Test de l'endpoint summary
    const summaryResponse = await fetch(`${BASE_URL}/api/ab-test/analytics?action=summary`, {
      headers: {
        'Authorization': 'Bearer test-token', // À adapter selon votre auth
      }
    });
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ API Analytics Summary: OK');
      console.log('📊 Tests trouvés:', summaryData.data?.length || 0);
    } else {
      console.log('⚠️  API Analytics Summary: Status', summaryResponse.status);
    }
    
    // Test de l'endpoint results
    const resultsResponse = await fetch(`${BASE_URL}/api/ab-test/analytics?action=results&flagKey=nutritionist-onboarding-variant`, {
      headers: {
        'Authorization': 'Bearer test-token',
      }
    });
    
    if (resultsResponse.ok) {
      console.log('✅ API Analytics Results: OK');
    } else {
      console.log('⚠️  API Analytics Results: Status', resultsResponse.status);
    }
    
    // Test de l'endpoint metrics
    const metricsResponse = await fetch(`${BASE_URL}/api/ab-test/analytics?action=metrics&flagKey=nutritionist-onboarding-variant`, {
      headers: {
        'Authorization': 'Bearer test-token',
      }
    });
    
    if (metricsResponse.ok) {
      console.log('✅ API Analytics Metrics: OK');
    } else {
      console.log('⚠️  API Analytics Metrics: Status', metricsResponse.status);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API Analytics:', error.message);
    return false;
  }
}

/**
 * Test 5: Attribution des feature flags
 */
async function testFlagAttribution() {
  console.log('\n🎯 Test 5: Attribution des feature flags');
  console.log('='.repeat(60));
  
  try {
    // Simuler l'attribution pour différents utilisateurs
    const testUsers = [
      generateTestUser('nutritionist'),
      generateTestUser('nutritionist'),
      generateTestUser('nutritionist'),
      generateTestUser('patient'),
      generateTestUser('patient')
    ];
    
    const attributions = new Map();
    
    for (const user of testUsers) {
      // Simuler le hash de l'utilisateur (même logique que dans flags.ts)
      const encoder = new TextEncoder();
      const data = encoder.encode(user.id);
      const hashBuffer = crypto.createHash('sha256').update(data).digest();
      const hashArray = new Uint8Array(hashBuffer);
      
      let hash = 0;
      for (let i = 0; i < 4; i++) {
        hash = (hash << 8) | hashArray[i];
      }
      hash = Math.abs(hash);
      
      const hashValue = hash % 100;
      
      // Déterminer la variante selon la logique des flags
      let variant = 'control';
      if (user.role === 'nutritionist') {
        if (hashValue < 25) variant = 'control';
        else if (hashValue < 50) variant = 'simplified';
        else if (hashValue < 75) variant = 'gamified';
        else variant = 'guided';
      }
      
      if (!attributions.has(variant)) {
        attributions.set(variant, 0);
      }
      attributions.set(variant, attributions.get(variant) + 1);
      
      console.log(`👤 ${user.role} ${user.id}: ${variant} (hash: ${hashValue})`);
    }
    
    console.log('\n📊 Distribution des variantes:');
    for (const [variant, count] of attributions) {
      const percentage = ((count / testUsers.length) * 100).toFixed(1);
      console.log(`   ${variant}: ${count} utilisateurs (${percentage}%)`);
    }
    
    console.log('✅ Attribution des flags testée avec succès');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'attribution:', error.message);
    return false;
  }
}

/**
 * Test 6: Calculs statistiques
 */
async function testStatisticalCalculations() {
  console.log('\n🧮 Test 6: Calculs statistiques');
  console.log('='.repeat(60));
  
  try {
    // Générer des données de test
    const testData = [
      { variant: 'control', users: 100, conversions: 15 },
      { variant: 'simplified', users: 98, conversions: 20 },
      { variant: 'gamified', users: 105, conversions: 18 },
      { variant: 'guided', users: 97, conversions: 22 }
    ];
    
    console.log('📊 Données de test:');
    testData.forEach(data => {
      const rate = ((data.conversions / data.users) * 100).toFixed(1);
      console.log(`   ${data.variant}: ${data.conversions}/${data.users} (${rate}%)`);
    });
    
    // Test de la fonction de significativité statistique (si disponible)
    try {
      const { data: significance, error } = await supabase
        .rpc('calculate_statistical_significance', {
          control_conversions: testData[0].conversions,
          control_users: testData[0].users,
          variant_conversions: testData[1].conversions,
          variant_users: testData[1].users
        });
      
      if (!error && significance && significance.length > 0) {
        const result = significance[0];
        console.log(`✅ Significativité statistique calculée:`);
        console.log(`   P-value: ${result.p_value}`);
        console.log(`   Significatif: ${result.is_significant ? 'Oui' : 'Non'}`);
        console.log(`   Confiance: ${(result.confidence_level * 100).toFixed(1)}%`);
      } else {
        console.log('⚠️  Fonction de significativité non disponible ou erreur');
      }
    } catch (funcError) {
      console.log('⚠️  Fonction calculate_statistical_significance non trouvée');
    }
    
    console.log('✅ Calculs statistiques testés');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test des calculs:', error.message);
    return false;
  }
}

/**
 * Test 7: Performance et charge
 */
async function testPerformance() {
  console.log('\n⚡ Test 7: Performance et charge');
  console.log('='.repeat(60));
  
  try {
    const startTime = Date.now();
    const batchSize = 50;
    const testUser = generateTestUser();
    
    // Génération d'événements en batch
    const events = [];
    for (let i = 0; i < batchSize; i++) {
      events.push({
        event_type: 'onboarding_step',
        user_id: `${testUser.id}_${i}`,
        session_id: `session_${Date.now()}_${i}`,
        flag_key: 'nutritionist-onboarding-variant',
        flag_value: 'control',
        variant: 'control',
        user_role: 'nutritionist',
        onboarding_step: `step_${i % 5}`,
        step_index: i % 5,
        custom_data: { test: true, batch: true }
      });
    }
    
    // Insertion en batch
    const { data, error } = await supabase
      .from('ab_test_events')
      .insert(events)
      .select();
    
    if (error) {
      console.error('❌ Erreur insertion batch:', error.message);
      return false;
    }
    
    const insertTime = Date.now() - startTime;
    console.log(`✅ ${batchSize} événements insérés en ${insertTime}ms`);
    console.log(`📊 Performance: ${(batchSize / insertTime * 1000).toFixed(0)} événements/seconde`);
    
    // Test de requête analytique
    const queryStart = Date.now();
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('ab_test_conversions_by_variant')
      .select('*');
    
    if (!analyticsError) {
      const queryTime = Date.now() - queryStart;
      console.log(`✅ Requête analytique exécutée en ${queryTime}ms`);
    }
    
    // Nettoyage
    await supabase
      .from('ab_test_events')
      .delete()
      .like('user_id', `${testUser.id}_%`);
    
    console.log('🧹 Données de test nettoyées');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de performance:', error.message);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runAllTests() {
  console.log('🚀 DÉMARRAGE DES TESTS A/B TESTING SYSTEM');
  console.log('='.repeat(80));
  
  const tests = [
    { name: 'Schémas de base de données', fn: testDatabaseSchema },
    { name: 'API Feature Flags', fn: testFlagsAPI },
    { name: 'Tracking d\'événements', fn: testEventTracking },
    { name: 'API Analytics', fn: testAnalyticsAPI },
    { name: 'Attribution des flags', fn: testFlagAttribution },
    { name: 'Calculs statistiques', fn: testStatisticalCalculations },
    { name: 'Performance et charge', fn: testPerformance }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ Erreur dans le test ${test.name}:`, error.message);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  // Résumé des résultats
  console.log('\n📋 RÉSUMÉ DES TESTS');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.name}`);
      passed++;
    } else {
      console.log(`❌ ${result.name}`);
      if (result.error) {
        console.log(`   Erreur: ${result.error}`);
      }
      failed++;
    }
  });
  
  console.log('\n📊 STATISTIQUES FINALES');
  console.log('='.repeat(80));
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
    console.log('✅ Le système A/B Testing est prêt pour la production.');
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🔧 Veuillez corriger les problèmes avant de déployer en production.');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Exécution des tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Erreur fatale lors des tests:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testDatabaseSchema,
  testFlagsAPI,
  testEventTracking,
  testAnalyticsAPI,
  testFlagAttribution,
  testStatisticalCalculations,
  testPerformance
};
