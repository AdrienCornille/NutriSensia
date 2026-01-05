#!/bin/bash

echo "======================================"
echo "NutriSensia - Démarrage en mode debug"
echo "======================================"
echo ""

# Nettoyage
echo "1. Nettoyage des caches..."
rm -rf .next node_modules/.cache
echo "   ✓ Caches nettoyés"
echo ""

# Vérification de Node
echo "2. Vérification de l'environnement..."
echo "   Node version: $(node --version)"
echo "   Next.js version: $(npx next --version)"
echo ""

# Vérification des fichiers critiques
echo "3. Vérification des fichiers critiques..."
test -f src/app/layout.tsx && echo "   ✓ src/app/layout.tsx" || echo "   ✗ src/app/layout.tsx MANQUANT"
test -f "src/app/[locale]/layout.tsx" && echo "   ✓ src/app/[locale]/layout.tsx" || echo "   ✗ MANQUANT"
test -f "src/app/[locale]/page.tsx" && echo "   ✓ src/app/[locale]/page.tsx" || echo "   ✗ MANQUANT"
test -f src/i18n/routing.ts && echo "   ✓ src/i18n/routing.ts" || echo "   ✗ MANQUANT"
test -f src/i18n/request.ts && echo "   ✓ src/i18n/request.ts" || echo "   ✗ MANQUANT"
test -f messages/fr.json && echo "   ✓ messages/fr.json" || echo "   ✗ MANQUANT"
test -f messages/en.json && echo "   ✓ messages/en.json" || echo "   ✗ MANQUANT"
echo ""

# Démarrage
echo "4. Démarrage du serveur Next.js..."
echo "   Port: 3001"
echo "   Mode: development"
echo ""
echo "======================================"
echo "Si le serveur ne démarre pas, les erreurs s'afficheront ci-dessous:"
echo "======================================"
echo ""

# Lancer Next.js avec tous les logs
NODE_OPTIONS='--trace-warnings' npx next dev --port 3001
