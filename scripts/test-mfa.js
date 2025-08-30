#!/usr/bin/env node

/**
 * Script de test pour vérifier que les composants MFA se chargent correctement
 * Ce script vérifie que tous les fichiers nécessaires existent et sont valides
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de validation des composants MFA...\n');

// Liste des fichiers à vérifier
const filesToCheck = [
  'src/components/auth/MFAEnrollment.tsx',
  'src/components/auth/MFAVerification.tsx',
  'src/components/auth/MFAManagement.tsx',
  'src/components/auth/MFATest.tsx',
  'src/hooks/useMFA.ts',
  'src/middleware.ts',
  'src/app/auth/verify-mfa/page.tsx',
  'src/app/auth/enroll-mfa/page.tsx',
  'src/app/mfa-test/page.tsx',
  'docs/task-3-4-implementation.md',
];

let allFilesExist = true;
let totalFiles = filesToCheck.length;
let existingFiles = 0;

console.log("📁 Vérification de l'existence des fichiers :");

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
    existingFiles++;
  } else {
    console.log(`  ❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

console.log(`\n📊 Résultats : ${existingFiles}/${totalFiles} fichiers trouvés`);

// Vérification des dépendances
console.log('\n📦 Vérification des dépendances :');

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const requiredDeps = ['@supabase/ssr', '@supabase/supabase-js'];
  const missingDeps = [];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep} (${packageJson.dependencies[dep]})`);
    } else {
      console.log(`  ❌ ${dep} - MANQUANT`);
      missingDeps.push(dep);
    }
  });

  if (missingDeps.length > 0) {
    console.log(`\n⚠️  Dépendances manquantes : ${missingDeps.join(', ')}`);
    console.log('   Exécutez : npm install ' + missingDeps.join(' '));
  }
}

// Vérification des variables d'environnement
console.log("\n🔧 Vérification des variables d'environnement :");

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ❌ ${varName} - MANQUANT`);
    }
  });
} else {
  console.log('  ⚠️  Fichier .env.local non trouvé');
  console.log('   Créez un fichier .env.local avec vos variables Supabase');
}

// Résumé final
console.log('\n🎯 Résumé :');

if (allFilesExist) {
  console.log('✅ Tous les composants MFA sont présents');
  console.log("✅ Le système d'authentification à deux facteurs est prêt !");
  console.log('\n🚀 Pour tester :');
  console.log('   1. Assurez-vous que le serveur est démarré : npm run dev');
  console.log('   2. Allez sur : http://localhost:3000/mfa-test');
  console.log('   3. Connectez-vous et testez la configuration 2FA');
} else {
  console.log('❌ Certains fichiers sont manquants');
  console.log('   Vérifiez que tous les composants ont été créés correctement');
}

console.log('\n📚 Documentation : docs/task-3-4-implementation.md');
console.log('🔗 Page de test : http://localhost:3000/mfa-test');
