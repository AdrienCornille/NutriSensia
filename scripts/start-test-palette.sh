#!/bin/bash

# Script de démarrage pour tester la palette Deep Ocean

echo "🎨 Démarrage du test de la palette Deep Ocean"
echo ""

# Tuer les processus sur le port 3000
echo "🔄 Nettoyage du port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "✅ Port 3000 déjà libre"

# Attendre un peu
sleep 1

# Nettoyer le cache Next.js
echo ""
echo "🧹 Nettoyage du cache Next.js..."
rm -rf .next
echo "✅ Cache nettoyé"

# Démarrer le serveur
echo ""
echo "🚀 Démarrage du serveur de développement..."
echo ""
echo "📍 URL de test : http://localhost:3000/test-colors/deepocean"
echo "📍 URL originale : http://localhost:3000/fr"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm run dev
