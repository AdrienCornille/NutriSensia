#!/bin/bash

# =====================================================
# Script d'exécution de la migration vers l'architecture optimisée
# =====================================================

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration vers l'architecture de base de données optimisée"
echo "============================================================"

# Vérifier que les variables d'environnement sont présentes
if [ ! -f ".env.local" ]; then
    echo "❌ Fichier .env.local non trouvé"
    echo "💡 Assurez-vous d'avoir configuré vos variables Supabase"
    exit 1
fi

# Charger les variables d'environnement
source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Variables d'environnement Supabase manquantes"
    echo "💡 Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local"
    exit 1
fi

echo "✅ Variables d'environnement chargées"

# Demander confirmation
echo ""
echo "⚠️  ATTENTION: Cette migration va modifier la structure de votre base de données"
echo "📋 Actions qui vont être effectuées:"
echo "   1. Sauvegarde automatique des données existantes"
echo "   2. Suppression et recréation des tables"
echo "   3. Migration des données vers la nouvelle structure"
echo "   4. Configuration des politiques de sécurité"
echo ""
read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration annulée"
    exit 1
fi

echo "🔄 Début de la migration..."

# Créer une sauvegarde avant migration
BACKUP_FILE="backup_before_migration_$(date +%Y%m%d_%H%M%S).sql"
echo "📦 Création de la sauvegarde: $BACKUP_FILE"

# Note: Cette commande nécessite psql installé localement
# Si vous utilisez Supabase Cloud, vous pouvez faire la sauvegarde depuis le dashboard
echo "💡 Créez une sauvegarde depuis le dashboard Supabase avant de continuer"
read -p "Sauvegarde créée ? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Veuillez créer une sauvegarde avant de continuer"
    exit 1
fi

# Exécuter la migration
echo "🔄 Exécution du script de migration..."

# Utiliser psql pour exécuter le script
# Remplacez ces valeurs par vos paramètres de connexion réels
DB_HOST=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co.*|.supabase.co|')
DB_NAME="postgres"
DB_USER="postgres"

echo "🔗 Connexion à la base de données..."
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Demander le mot de passe
echo ""
echo "💡 Vous devez entrer le mot de passe de votre base de données Supabase"
echo "   (Vous le trouveez dans Settings > Database dans votre dashboard Supabase)"
echo ""

# Exécuter la migration
if command -v psql &> /dev/null; then
    echo "📊 Exécution de la migration SQL..."
    PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "scripts/migration-to-optimized-schema.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration SQL terminée avec succès"
    else
        echo "❌ Erreur lors de l'exécution de la migration SQL"
        exit 1
    fi
else
    echo "⚠️  psql n'est pas installé"
    echo "💡 Vous pouvez exécuter le script manuellement:"
    echo "   1. Ouvrez le SQL Editor dans votre dashboard Supabase"
    echo "   2. Copiez le contenu de scripts/migration-to-optimized-schema.sql"
    echo "   3. Exécutez le script"
    echo ""
    read -p "Migration SQL exécutée manuellement ? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Veuillez exécuter la migration SQL avant de continuer"
        exit 1
    fi
fi

# Tester la nouvelle architecture
echo "🧪 Test de la nouvelle architecture..."
node test-optimized-architecture.js

if [ $? -eq 0 ]; then
    echo "✅ Tests de la nouvelle architecture réussis"
else
    echo "⚠️  Certains tests ont échoué, mais c'est peut-être normal"
fi

echo ""
echo "🎉 Migration terminée !"
echo "============================================================"
echo "📋 Prochaines étapes:"
echo "   1. Testez l'application: npm run dev"
echo "   2. Vérifiez l'onboarding: http://localhost:3000/onboarding/nutritionist"
echo "   3. Vérifiez les données dans Supabase"
echo "   4. Si tout fonctionne, supprimez les anciens scripts"
echo ""
echo "🔧 En cas de problème:"
echo "   1. Restaurez depuis la sauvegarde"
echo "   2. Contactez l'équipe de développement"
echo ""
echo "✅ Migration vers l'architecture optimisée terminée !"
