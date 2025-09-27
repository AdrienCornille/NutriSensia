/**
 * Script de test pour différents rôles utilisateur
 * 
 * Ce script simule différents rôles pour tester la protection d'accès
 */

// Simuler différents rôles
const testRoles = [
  { role: 'admin', shouldAccess: true },
  { role: 'nutritionist', shouldAccess: false },
  { role: 'user', shouldAccess: false },
  { role: 'super_admin', shouldAccess: true },
  { role: 'administrator', shouldAccess: true },
  { role: 'Admin', shouldAccess: true },
  { role: 'ADMIN', shouldAccess: true },
  { role: 'nutritionist_admin', shouldAccess: false },
  { role: 'admin_nutritionist', shouldAccess: true }
];

function testRoleAccess(role) {
  const roleNormalized = role?.toLowerCase().trim();
  const isAdmin = roleNormalized === 'admin' || 
                 roleNormalized === 'super_admin' || 
                 roleNormalized === 'administrator' ||
                 roleNormalized === 'superadmin' ||
                 roleNormalized === 'admin_user' ||
                 roleNormalized === 'system_admin';
  
  return isAdmin;
}

console.log('🧪 Test des différents rôles pour l\'accès A/B Testing:');
console.log('='.repeat(60));

testRoles.forEach(({ role, shouldAccess }) => {
  const hasAccess = testRoleAccess(role);
  const status = hasAccess === shouldAccess ? '✅' : '❌';
  const accessText = hasAccess ? 'AUTORISÉ' : 'REFUSÉ';
  
  console.log(`${status} Rôle: "${role}" → ${accessText} ${hasAccess === shouldAccess ? '(attendu)' : '(INATTENDU!)'}`);
});

console.log('\n📋 Résumé:');
console.log('- ✅ = Test réussi');
console.log('- ❌ = Test échoué (problème de logique)');
console.log('- Seuls les administrateurs devraient avoir accès');
