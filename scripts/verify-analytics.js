/**
 * Script de vérification de l'implémentation Analytics
 *
 * Ce script vérifie que tous les composants analytics sont correctement configurés
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Vérification de l'implémentation Analytics...\n");

// Vérifier les fichiers analytics
const analyticsFiles = [
  'src/components/analytics/GoogleAnalytics.tsx',
  'src/components/analytics/CookieConsent.tsx',
  'src/components/analytics/ConversionTracking.tsx',
  'src/components/analytics/StructuredData.tsx',
  'src/components/analytics/index.ts',
];

console.log('📁 Vérification des fichiers analytics :');
analyticsFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
  }
});

// Vérifier la section témoignages
const testimonialsFiles = [
  'src/components/landing/TestimonialsSection.tsx',
  'src/components/admin/TestimonialsManager.tsx',
];

console.log('\n📁 Vérification des fichiers témoignages :');
testimonialsFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
  }
});

// Vérifier l'intégration dans layout.tsx
console.log("\n🔧 Vérification de l'intégration :");
const layoutPath = path.join(__dirname, '..', 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  const checks = [
    { name: 'GoogleAnalytics import', pattern: /import.*GoogleAnalytics/ },
    { name: 'CookieConsent import', pattern: /import.*CookieConsent/ },
    {
      name: 'ConversionTracking import',
      pattern: /import.*ConversionTracking/,
    },
    { name: 'GoogleAnalytics component', pattern: /<GoogleAnalytics/ },
    { name: 'ConversionTracking component', pattern: /<ConversionTracking/ },
    { name: 'CookieConsent component', pattern: /<CookieConsent/ },
  ];

  checks.forEach(check => {
    if (check.pattern.test(layoutContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - MANQUANT`);
    }
  });
} else {
  console.log('❌ src/app/layout.tsx - MANQUANT');
}

// Vérifier les variables d'environnement
console.log("\n🌍 Vérification des variables d'environnement :");
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_GA_ID')) {
    console.log('✅ NEXT_PUBLIC_GA_ID configuré');
  } else {
    console.log('❌ NEXT_PUBLIC_GA_ID - MANQUANT');
  }
} else {
  console.log('❌ .env.local - MANQUANT');
}

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances :');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['@next/third-parties', 'react-slick', 'slick-carousel'];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} (${packageJson.dependencies[dep]})`);
    } else {
      console.log(`❌ ${dep} - MANQUANT`);
    }
  });
}

console.log('\n🎯 Prochaines étapes :');
console.log('1. Configurez votre ID Google Analytics dans .env.local');
console.log('2. Exécutez le script SQL dans Supabase');
console.log('3. Déployez votre application');
console.log('4. Vérifiez les données dans Google Analytics');

console.log('\n✨ Vérification terminée !');
