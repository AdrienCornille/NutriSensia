#!/bin/bash

echo "🧹 NETTOYAGE DES FICHIERS DE TEST ET DIAGNOSTIC"
echo "==============================================="

# Fonction pour supprimer en sécurité
safe_remove() {
    if [ -e "$1" ]; then
        echo "🗑️  Suppression: $1"
        rm -rf "$1"
    else
        echo "⚠️  Déjà supprimé: $1"
    fi
}

echo ""
echo "1. 📂 Suppression des dossiers de test dans l'app..."
safe_remove "./src/app/profile/authenticated-test"
safe_remove "./src/app/api/protected/test"

echo ""
echo "2. 📄 Suppression des documents de diagnostic..."
safe_remove "./docs/testing-guide-avatar-upload.md"
safe_remove "./docs/test-mise-a-jour-nutritionists.md"
safe_remove "./docs/final-test-guide.md"
safe_remove "./docs/debug-data-not-visible.md"
safe_remove "./docs/quick-2fa-fix.md"
safe_remove "./docs/guide-test-formulaire-simplifie.md"
safe_remove "./docs/fix-database-structure.md"
safe_remove "./docs/correction-test-guide.md"
safe_remove "./docs/test-steps.md"
safe_remove "./docs/debug-supabase-save.md"
safe_remove "./docs/profile-access-fix.md"
safe_remove "./docs/quick-fix-avatar-issues.md"

echo ""
echo "3. 🗂️  Suppression du dossier diagnostic complet..."
safe_remove "./scripts/diagnostic"

echo ""
echo "4. 📜 Suppression des scripts de diagnostic individuels..."
safe_remove "./scripts/diagnostic-complet-nutritionists.sql"
safe_remove "./scripts/test-acces-nutritionists.js"
safe_remove "./scripts/test-nutritionists-api.js"
safe_remove "./scripts/test-nutritionists-access.sql"
safe_remove "./scripts/test-ecriture-nutritionists.js"
safe_remove "./scripts/fix-nutritionists-complete.sql"
safe_remove "./scripts/test-nutritionists-browser.js"
safe_remove "./scripts/diagnostic-supabase-nutritionists.sql"
safe_remove "./scripts/test-solution-context7.js"
safe_remove "./scripts/diagnostic-context7-complet.js"
safe_remove "./scripts/solution-context7-definitive.js"

echo ""
echo "5. 🔧 Suppression des hooks de test..."
safe_remove "./src/hooks/useUserProfile-fixed.ts"
safe_remove "./src/hooks/useUserProfile-test.ts"

echo ""
echo "6. 📋 Suppression des schémas de test..."
safe_remove "./src/lib/schemas-test.ts"

echo ""
echo "7. 🧪 Suppression des composants de test..."
safe_remove "./src/components/ui/__tests__"
safe_remove "./src/components/forms/ProfileEditForm.test.tsx"

echo ""
echo "✅ NETTOYAGE TERMINÉ !"
echo "====================="
echo ""
echo "📊 Fichiers conservés (nécessaires pour le projet):"
echo "   - vitest.config.ts (configuration des tests)"
echo "   - vitest.schemas.config.ts (tests des schémas)"
echo "   - vitest.shims.d.ts (types TypeScript)"
echo "   - src/lib/schemas.test.ts (tests unitaires des schémas)"
echo "   - src/lib/test-dependencies.ts (dépendances de test)"
echo "   - scripts/production/security-test.js (test de sécurité production)"
echo ""
echo "🎯 Le projet est maintenant nettoyé et prêt pour la production !"
