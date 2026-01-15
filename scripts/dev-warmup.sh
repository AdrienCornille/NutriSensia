#!/bin/bash

# Script de démarrage avec warmup automatique
# Lance le serveur et précompile les pages principales

echo "🚀 Démarrage de NutriSensia..."

# Tuer tout processus existant sur le port 3000
for pid in $(lsof -ti:3000 2>/dev/null); do
  kill -9 $pid 2>/dev/null
done
sleep 1

# Démarrer le serveur en arrière-plan
NODE_OPTIONS='--max-old-space-size=4096' npm run dev &
SERVER_PID=$!

echo "⏳ Attente du démarrage du serveur..."

# Attendre que le serveur soit prêt
MAX_WAIT=30
WAITED=0
while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "⚠️  Le serveur prend du temps à démarrer..."
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

echo "🔥 Warmup des pages principales..."

# Précompiler les pages principales (en arrière-plan pour ne pas bloquer)
(
  curl -s http://localhost:3000/ > /dev/null 2>&1 && echo "  ✓ Page d'accueil compilée"
  curl -s http://localhost:3000/forfaits > /dev/null 2>&1 && echo "  ✓ Page forfaits compilée"
  curl -s http://localhost:3000/approche > /dev/null 2>&1 && echo "  ✓ Page approche compilée"
  curl -s http://localhost:3000/blog > /dev/null 2>&1 && echo "  ✓ Page blog compilée"
) &

echo ""
echo "✅ Serveur démarré sur http://localhost:3000"
echo "   Les pages se compilent en arrière-plan..."
echo ""
echo "   Appuyez sur Ctrl+C pour arrêter le serveur"

# Attendre le processus serveur
wait $SERVER_PID
