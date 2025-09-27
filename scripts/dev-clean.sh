#!/bin/bash

# Script pour nettoyer et relancer le serveur de développement
# Usage: ./scripts/dev-clean.sh

echo "🧹 Nettoyage du serveur de développement..."

# Arrêter tous les processus Next.js
echo "🛑 Arrêt des processus Next.js existants..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Aucun processus à arrêter"

# Attendre un moment
sleep 2

# Nettoyer le cache Next.js
echo "🗑️ Nettoyage du cache Next.js..."
rm -rf .next

# Vérifier que le port est libre
echo "🔍 Vérification du port 3000..."
if lsof -i:3000 >/dev/null 2>&1; then
    echo "❌ Le port 3000 est encore occupé"
    exit 1
else
    echo "✅ Le port 3000 est libre"
fi

# Lancer le serveur de développement
echo "🚀 Lancement du serveur de développement..."
npm run dev


