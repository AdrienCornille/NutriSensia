#!/usr/bin/env node

/**
 * Script de validation d'environnement pour NutriSensia
 * Vérifie que tous les prérequis sont installés et configurés
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'pipe' });
    logSuccess(`${description} - OK`);
    return true;
  } catch (error) {
    logError(`${description} - NON TROUVÉ`);
    return false;
  }
}

function checkVersion(command, minVersion, description) {
  try {
    const output = execSync(command, { stdio: 'pipe' }).toString().trim();
    const version = output.match(/\d+\.\d+\.\d+/)?.[0];

    if (version) {
      const versionParts = version.split('.').map(Number);
      const minVersionParts = minVersion.split('.').map(Number);

      let isCompatible = true;
      for (
        let i = 0;
        i < Math.min(versionParts.length, minVersionParts.length);
        i++
      ) {
        if (versionParts[i] < minVersionParts[i]) {
          isCompatible = false;
          break;
        } else if (versionParts[i] > minVersionParts[i]) {
          break;
        }
      }

      if (isCompatible) {
        logSuccess(`${description} - ${version} (>= ${minVersion})`);
        return true;
      } else {
        logError(`${description} - ${version} (minimum requis: ${minVersion})`);
        return false;
      }
    } else {
      logError(`${description} - Version non détectée`);
      return false;
    }
  } catch (error) {
    logError(`${description} - NON TROUVÉ`);
    return false;
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} - TROUVÉ`);
    return true;
  } else {
    logError(`${description} - MANQUANT`);
    return false;
  }
}

function checkEnvVariables() {
  const envPath = path.join(process.cwd(), '.env.local');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  if (!fs.existsSync(envPath)) {
    logError('.env.local - FICHIER MANQUANT');
    logInfo('Créez le fichier .env.local avec les variables requises');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  let allVarsPresent = true;

  for (const varName of requiredVars) {
    if (envContent.includes(varName)) {
      logSuccess(`${varName} - CONFIGURÉ`);
    } else {
      logError(`${varName} - MANQUANT`);
      allVarsPresent = false;
    }
  }

  return allVarsPresent;
}

function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json - FICHIER MANQUANT');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      'typescript',
      'tailwindcss',
      '@supabase/supabase-js',
      'zustand',
      '@tanstack/react-query',
      'react-hook-form',
      'zod',
      'framer-motion',
    ];

    let allDepsPresent = true;

    for (const dep of requiredDeps) {
      if (
        packageJson.dependencies?.[dep] ||
        packageJson.devDependencies?.[dep]
      ) {
        logSuccess(`${dep} - INSTALLÉ`);
      } else {
        logError(`${dep} - MANQUANT`);
        allDepsPresent = false;
      }
    }

    return allDepsPresent;
  } catch (error) {
    logError('package.json - ERREUR DE LECTURE');
    return false;
  }
}

function checkNodeModules() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');

  if (fs.existsSync(nodeModulesPath)) {
    logSuccess('node_modules - INSTALLÉ');
    return true;
  } else {
    logError('node_modules - MANQUANT');
    logInfo('Exécutez: npm install');
    return false;
  }
}

function checkBuild() {
  try {
    logInfo('Test de build en cours...');
    execSync('npm run build', { stdio: 'pipe' });
    logSuccess('Build - RÉUSSI');
    return true;
  } catch (error) {
    logError('Build - ÉCHOUÉ');
    logInfo('Vérifiez les erreurs de compilation');
    return false;
  }
}

function main() {
  log("🔍 Validation de l'environnement NutriSensia", 'bright');
  log('==========================================', 'bright');

  let allChecksPassed = true;

  // Vérifications système
  log('\n📋 Vérifications système:', 'cyan');
  const nodeOk = checkVersion('node --version', '18.0.0', 'Node.js');
  const npmOk = checkVersion('npm --version', '8.0.0', 'npm');
  const gitOk = checkCommand('git --version', 'Git');

  if (!nodeOk || !npmOk || !gitOk) {
    allChecksPassed = false;
  }

  // Vérifications du projet
  log('\n📁 Vérifications du projet:', 'cyan');
  const packageJsonOk = checkFileExists('package.json', 'package.json');
  const tsConfigOk = checkFileExists('tsconfig.json', 'tsconfig.json');
  const tailwindConfigOk = checkFileExists(
    'tailwind.config.ts',
    'tailwind.config.ts'
  );
  const nextConfigOk = checkFileExists('next.config.js', 'next.config.js');

  if (!packageJsonOk || !tsConfigOk || !tailwindConfigOk || !nextConfigOk) {
    allChecksPassed = false;
  }

  // Vérifications des dépendances
  log('\n📦 Vérifications des dépendances:', 'cyan');
  const depsOk = checkDependencies();
  const nodeModulesOk = checkNodeModules();

  if (!depsOk || !nodeModulesOk) {
    allChecksPassed = false;
  }

  // Vérifications de l'environnement
  log("\n🔐 Vérifications de l'environnement:", 'cyan');
  const envOk = checkEnvVariables();

  if (!envOk) {
    allChecksPassed = false;
  }

  // Test de build
  log('\n🏗️  Test de build:', 'cyan');
  const buildOk = checkBuild();

  if (!buildOk) {
    allChecksPassed = false;
  }

  // Résumé
  log('\n📊 Résumé:', 'bright');
  if (allChecksPassed) {
    logSuccess('Tous les tests sont passés ! Votre environnement est prêt.');
    logInfo(
      'Vous pouvez maintenant démarrer le développement avec: npm run dev'
    );
  } else {
    logError(
      'Certains tests ont échoué. Veuillez corriger les problèmes ci-dessus.'
    );
    logInfo("Consultez docs/troubleshooting.md pour plus d'aide.");
  }

  return allChecksPassed ? 0 : 1;
}

// Exécuter le script
if (require.main === module) {
  process.exit(main());
}

module.exports = { main, checkCommand, checkVersion, checkFileExists };
