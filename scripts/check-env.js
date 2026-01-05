/**
 * Script de vérification des variables d'environnement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Vérification des variables d'environnement...\n");

// Charger le fichier .env.local
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ Fichier .env.local manquant');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// Vérifier les variables requises
const requiredVars = [
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

console.log("🌍 Variables d'environnement :");

let allConfigured = true;

requiredVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=(.*)$`, 'm');
  const match = envContent.match(regex);

  if (
    match &&
    match[1] &&
    !match[1].includes('your_') &&
    !match[1].includes('votre_')
  ) {
    console.log(`✅ ${varName} - Configuré`);
  } else {
    console.log(`❌ ${varName} - NON CONFIGURÉ`);
    allConfigured = false;
  }
});

console.log('\n📋 Instructions :');
console.log('1. Allez sur https://supabase.com');
console.log('2. Sélectionnez votre projet');
console.log('3. Allez dans Settings → API');
console.log('4. Copiez les valeurs et remplacez dans .env.local :');
console.log('   - Project URL → NEXT_PUBLIC_SUPABASE_URL');
console.log('   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - service_role → SUPABASE_SERVICE_ROLE_KEY');

if (allConfigured) {
  console.log('\n✨ Toutes les variables sont configurées !');
} else {
  console.log('\n⚠️  Certaines variables ne sont pas configurées.');
  console.log("   Configurez-les avant de démarrer l'application.");
}
