/**
 * Utilitaire pour tester la logique de redirection 2FA
 * Permet de simuler différents scénarios de connexion
 */

interface TestScenario {
  userRole: 'nutritionist' | 'patient';
  currentLevel: 'aal1' | 'aal2';
  nextLevel: 'aal1' | 'aal2';
  hasVerifiedFactorsInAuth: boolean;
  twoFactorEnabledInDB: boolean;
  expectedRedirection: '/auth/verify-mfa' | '/auth/enroll-mfa' | '/';
  description: string;
}

export const TEST_SCENARIOS: TestScenario[] = [
  // Nutritionnistes
  {
    userRole: 'nutritionist',
    currentLevel: 'aal1',
    nextLevel: 'aal2',
    hasVerifiedFactorsInAuth: true,
    twoFactorEnabledInDB: true,
    expectedRedirection: '/auth/verify-mfa',
    description: 'Nutritionniste avec 2FA configuré -> Vérification',
  },
  {
    userRole: 'nutritionist',
    currentLevel: 'aal1',
    nextLevel: 'aal2',
    hasVerifiedFactorsInAuth: false,
    twoFactorEnabledInDB: false,
    expectedRedirection: '/auth/enroll-mfa',
    description: 'Nutritionniste sans 2FA -> Enrôlement',
  },

  // Patients - NOUVEAU COMPORTEMENT (même que nutritionnistes)
  {
    userRole: 'patient',
    currentLevel: 'aal1',
    nextLevel: 'aal2',
    hasVerifiedFactorsInAuth: true,
    twoFactorEnabledInDB: true,
    expectedRedirection: '/auth/verify-mfa',
    description: 'Patient avec 2FA configuré -> Vérification (NOUVEAU)',
  },
  {
    userRole: 'patient',
    currentLevel: 'aal1',
    nextLevel: 'aal2',
    hasVerifiedFactorsInAuth: false,
    twoFactorEnabledInDB: false,
    expectedRedirection: '/auth/enroll-mfa',
    description: 'Patient sans 2FA -> Enrôlement (NOUVEAU)',
  },

  // Cas exceptionnels
  {
    userRole: 'patient',
    currentLevel: 'aal2',
    nextLevel: 'aal2',
    hasVerifiedFactorsInAuth: true,
    twoFactorEnabledInDB: true,
    expectedRedirection: '/',
    description: 'Patient déjà au niveau AAL2 -> Dashboard',
  },
  {
    userRole: 'nutritionist',
    currentLevel: 'aal2',
    nextLevel: 'aal2',
    hasVerifiedFactorsInAuth: true,
    twoFactorEnabledInDB: true,
    expectedRedirection: '/',
    description: 'Nutritionniste déjà au niveau AAL2 -> Dashboard',
  },
];

/**
 * Simule la logique de redirection 2FA
 */
export function simulateMFARedirection(scenario: TestScenario): string {
  const {
    userRole,
    currentLevel,
    nextLevel,
    hasVerifiedFactorsInAuth,
    twoFactorEnabledInDB,
  } = scenario;

  const hasVerifiedFactors = hasVerifiedFactorsInAuth && twoFactorEnabledInDB;

  if (userRole === 'nutritionist') {
    // Nutritionnistes : 2FA obligatoire selon nextLevel
    if (nextLevel === 'aal2' && currentLevel === 'aal1') {
      return hasVerifiedFactors ? '/auth/verify-mfa' : '/auth/enroll-mfa';
    } else {
      return '/';
    }
  } else {
    // Patients : 2FA FORCÉ si currentLevel === 'aal1' (indépendamment de nextLevel)
    if (currentLevel === 'aal1') {
      return hasVerifiedFactors ? '/auth/verify-mfa' : '/auth/enroll-mfa';
    } else {
      return '/';
    }
  }
}

/**
 * Teste tous les scénarios et affiche les résultats
 */
export function runMFARedirectionTests(): void {
  console.log('🧪 Tests de redirection MFA');
  console.log('============================\n');

  let passedTests = 0;
  let totalTests = TEST_SCENARIOS.length;

  TEST_SCENARIOS.forEach((scenario, index) => {
    const actualRedirection = simulateMFARedirection(scenario);
    const isCorrect = actualRedirection === scenario.expectedRedirection;

    console.log(`Test ${index + 1}: ${scenario.description}`);
    console.log(`  Rôle: ${scenario.userRole}`);
    console.log(`  AAL: ${scenario.currentLevel} -> ${scenario.nextLevel}`);
    console.log(`  Facteurs Auth: ${scenario.hasVerifiedFactorsInAuth}`);
    console.log(`  2FA DB: ${scenario.twoFactorEnabledInDB}`);
    console.log(`  Attendu: ${scenario.expectedRedirection}`);
    console.log(`  Résultat: ${actualRedirection}`);
    console.log(`  ✅ ${isCorrect ? 'PASS' : '❌ FAIL'}\n`);

    if (isCorrect) passedTests++;
  });

  console.log(`📊 Résultats: ${passedTests}/${totalTests} tests réussis`);

  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests sont réussis !');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la logique.');
  }
}

/**
 * Affiche un résumé des changements
 */
export function showMFAChanges(): void {
  console.log('📋 Résumé des changements de comportement 2FA');
  console.log('==============================================\n');

  console.log('🔧 AVANT (comportement différent) :');
  console.log(
    '  • Nutritionnistes : 2FA obligatoire (nextLevel === "aal2" && currentLevel === "aal1")'
  );
  console.log(
    '  • Patients : 2FA optionnel (nextLevel === "aal2" && currentLevel === "aal1")\n'
  );

  console.log('✅ APRÈS (comportement forcé uniforme) :');
  console.log(
    '  • Nutritionnistes : 2FA obligatoire (nextLevel === "aal2" && currentLevel === "aal1")'
  );
  console.log(
    '  • Patients : 2FA FORCÉ (currentLevel === "aal1") - NOUVEAU !\n'
  );

  console.log('🎯 Résultat :');
  console.log(
    '  • Tous les utilisateurs ont maintenant le même niveau de sécurité'
  );
  console.log(
    '  • Les patients sont redirigés vers 2FA comme les nutritionnistes'
  );
  console.log('  • Comportement cohérent entre OAuth et connexion classique\n');
}
