/**
 * Script de test pour la protection des rôles
 * 
 * Ce script teste l'accès aux pages A/B Testing avec différents rôles
 */

async function testRoleProtection() {
  const baseUrl = 'http://localhost:3000';
  const testRoles = [
    { role: 'admin', shouldAccess: true, description: 'Administrateur' },
    { role: 'nutritionist', shouldAccess: false, description: 'Nutritionniste' },
    { role: 'user', shouldAccess: false, description: 'Utilisateur standard' }
  ];

  console.log('🧪 Test de protection des rôles pour A/B Testing');
  console.log('='.repeat(60));

  for (const { role, shouldAccess, description } of testRoles) {
    try {
      console.log(`\n🔍 Test du rôle: ${description} (${role})`);
      
      // 1. Tester l'API d'authentification
      const authResponse = await fetch(`${baseUrl}/api/auth/me?role=${role}`);
      const userData = await authResponse.json();
      
      console.log(`   📊 API Auth: ${authResponse.status} - Rôle: ${userData.role}, isAdmin: ${userData.isAdmin}`);
      
      // 2. Tester l'accès à la page protégée
      const pageResponse = await fetch(`${baseUrl}/testing/ab-demo`);
      const pageStatus = pageResponse.status;
      
      console.log(`   📄 Page A/B Testing: ${pageStatus}`);
      
      // 3. Analyser le résultat
      const hasAccess = pageStatus === 200;
      const status = hasAccess === shouldAccess ? '✅' : '❌';
      const accessText = hasAccess ? 'AUTORISÉ' : 'REFUSÉ';
      
      console.log(`   ${status} Résultat: ${accessText} ${hasAccess === shouldAccess ? '(attendu)' : '(INATTENDU!)'}`);
      
      if (hasAccess !== shouldAccess) {
        console.log(`   ⚠️  PROBLÈME: ${description} ${hasAccess ? 'a accès' : 'n\'a pas accès'} mais devrait ${shouldAccess ? 'avoir' : 'ne pas avoir'} accès`);
      }
      
    } catch (error) {
      console.error(`   ❌ Erreur lors du test du rôle ${role}:`, error.message);
    }
  }

  console.log('\n📋 Résumé des tests:');
  console.log('- ✅ = Test réussi (accès correct)');
  console.log('- ❌ = Test échoué (accès incorrect)');
  console.log('- Seuls les administrateurs devraient avoir accès aux pages A/B Testing');
}

// Exécuter les tests
testRoleProtection().catch(console.error);
