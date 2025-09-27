/**
 * Script de debug pour vérifier le rôle utilisateur
 * 
 * Ce script teste l'API /api/auth/me pour voir exactement
 * quel rôle est retourné pour l'utilisateur connecté.
 */

async function debugUserRole() {
  try {
    console.log('🔍 Debug du rôle utilisateur...');
    
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('📊 Status de la réponse:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log('❌ Erreur API:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('❌ Détails de l\'erreur:', errorText);
      return;
    }

    const userData = await response.json();
    console.log('✅ Données utilisateur:', userData);
    
    console.log('\n📋 Analyse du rôle:');
    console.log('👤 Rôle exact:', `"${userData.role}"`);
    console.log('📏 Longueur du rôle:', userData.role?.length);
    console.log('🔤 Type:', typeof userData.role);
    console.log('🎯 isAdmin:', userData.isAdmin);
    
    // Test de différentes variantes
    const roleVariants = [
      'admin',
      'Admin', 
      'ADMIN',
      'administrator',
      'super_admin',
      'nutritionist',
      'user'
    ];
    
    console.log('\n🧪 Test des variantes de rôle:');
    roleVariants.forEach(variant => {
      const matches = userData.role === variant;
      console.log(`  "${variant}" === "${userData.role}": ${matches ? '✅' : '❌'}`);
    });
    
    // Test insensible à la casse
    const caseInsensitiveMatch = userData.role?.toLowerCase() === 'admin';
    console.log(`\n🔤 Test insensible à la casse (admin): ${caseInsensitiveMatch ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}

// Exécuter le debug
debugUserRole();
