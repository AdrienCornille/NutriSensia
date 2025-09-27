#!/bin/bash

# =====================================================
# Script d'application de la migration des champs de consentement
# Applique la migration add-consent-fields.sql à la base de données
# =====================================================

echo "🚀 Application de la migration des champs de consentement..."

# Vérifier que le fichier de migration existe
if [ ! -f "scripts/add-consent-fields.sql" ]; then
    echo "❌ Erreur: Le fichier de migration scripts/add-consent-fields.sql n'existe pas"
    exit 1
fi

# Charger les variables d'environnement
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Vérifier que SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Erreur: Variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises"
    echo "   Assurez-vous qu'elles sont définies dans .env.local"
    exit 1
fi

# Extraire l'URL de la base de données
DB_URL="${SUPABASE_URL}/rest/v1/"

echo "📊 Application de la migration à la base de données..."

# Appliquer la migration via l'API Supabase
curl -X POST "${DB_URL}rpc/execute_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$(cat scripts/add-consent-fields.sql | tr '\n' ' ' | sed 's/"/\\"/g')\"}"

if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès !"
    echo ""
    echo "📋 Champs ajoutés à la table nutritionists :"
    echo "   - terms_accepted (BOOLEAN)"
    echo "   - terms_accepted_at (TIMESTAMP)"
    echo "   - privacy_policy_accepted (BOOLEAN)" 
    echo "   - privacy_policy_accepted_at (TIMESTAMP)"
    echo "   - marketing_consent (BOOLEAN)"
    echo "   - marketing_consent_at (TIMESTAMP)"
    echo ""
    echo "🔧 Prochaines étapes :"
    echo "   1. Testez l'onboarding sur http://localhost:3000/onboarding/nutritionist"
    echo "   2. Vérifiez que les consentements sont bien enregistrés en base"
    echo "   3. Consultez les données dans le tableau de bord Supabase"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi
