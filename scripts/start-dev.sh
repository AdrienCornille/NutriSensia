#!/bin/bash

# Script de démarrage robuste pour NutriSensia
# Usage: ./scripts/start-dev.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage de NutriSensia en mode développement..."

# 1. Tuer les processus existants sur le port 3000
echo "🔍 Vérification du port 3000..."
PIDS=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PIDS" ]; then
  echo "⚠️  Processus trouvés sur le port 3000, nettoyage..."
  for pid in $PIDS; do
    kill -9 "$pid" 2>/dev/null || true
  done
  sleep 1
fi

# 2. Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install --no-audit
fi

# 3. Nettoyer le cache Next.js si nécessaire
if [ "$1" == "--clean" ]; then
  echo "🧹 Nettoyage du cache..."
  rm -rf .next node_modules/.cache
fi

# 4. Démarrer le serveur de développement
echo "✅ Lancement du serveur avec Turbopack..."
npm run dev
