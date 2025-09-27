#!/bin/bash

# =====================================================
# NutriSensia - Script de Déploiement du Schéma des Profils
# Tâche 4.1: Design Database Schema for User Profiles
# =====================================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SCHEMA_FILE="$SCRIPT_DIR/user-profiles-schema.sql"
TEST_FILE="$SCRIPT_DIR/test-user-profiles-schema.sql"

# Variables d'environnement
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier que les fichiers existent
    if [[ ! -f "$SCHEMA_FILE" ]]; then
        log_error "Fichier de schéma non trouvé: $SCHEMA_FILE"
        exit 1
    fi
    
    if [[ ! -f "$TEST_FILE" ]]; then
        log_error "Fichier de test non trouvé: $TEST_FILE"
        exit 1
    fi
    
    # Vérifier les variables d'environnement
    if [[ -z "$SUPABASE_URL" ]]; then
        log_error "Variable SUPABASE_URL non définie"
        exit 1
    fi
    
    if [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
        log_error "Variable SUPABASE_SERVICE_ROLE_KEY non définie"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Fonction pour exécuter des requêtes SQL via l'API Supabase
execute_sql() {
    local sql_file="$1"
    local description="$2"
    
    log_info "Exécution: $description"
    
    # Lire le contenu du fichier SQL
    local sql_content
    sql_content=$(cat "$sql_file")
    
    # Exécuter via l'API Supabase
    local response
    response=$(curl -s -X POST \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=minimal" \
        -d "{\"query\": $(echo "$sql_content" | jq -R -s .)}" \
        "$SUPABASE_URL/rest/v1/rpc/exec_sql")
    
    # Vérifier la réponse
    if [[ $? -eq 0 ]]; then
        log_success "$description terminé"
    else
        log_error "Échec de $description"
        log_error "Réponse: $response"
        return 1
    fi
}

# Fonction pour vérifier la connexion à Supabase
test_connection() {
    log_info "Test de connexion à Supabase..."
    
    local response
    response=$(curl -s -X GET \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/")
    
    if [[ $? -eq 0 ]]; then
        log_success "Connexion à Supabase établie"
    else
        log_error "Impossible de se connecter à Supabase"
        log_error "Vérifiez vos variables d'environnement"
        exit 1
    fi
}

# Fonction pour créer une sauvegarde
create_backup() {
    log_info "Création d'une sauvegarde de la base de données..."
    
    local backup_file="$SCRIPT_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"
    
    # Note: Cette fonction nécessiterait l'accès direct à PostgreSQL
    # Pour Supabase, utilisez leur interface de sauvegarde
    log_warning "Sauvegarde manuelle recommandée via l'interface Supabase"
    log_info "Sauvegarde suggérée: $backup_file"
}

# Fonction principale de déploiement
deploy_schema() {
    log_info "Début du déploiement du schéma des profils utilisateur..."
    
    # Test de connexion
    test_connection
    
    # Créer une sauvegarde
    create_backup
    
    # Déployer le schéma principal
    execute_sql "$SCHEMA_FILE" "Déploiement du schéma des profils utilisateur"
    
    # Exécuter les tests
    execute_sql "$TEST_FILE" "Tests de validation du schéma"
    
    log_success "Déploiement terminé avec succès !"
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -t, --test     Exécuter uniquement les tests"
    echo "  -d, --dry-run  Afficher les requêtes sans les exécuter"
    echo ""
    echo "Variables d'environnement requises:"
    echo "  SUPABASE_URL              URL de votre projet Supabase"
    echo "  SUPABASE_SERVICE_ROLE_KEY Clé de service Supabase"
    echo "  SUPABASE_ANON_KEY         Clé anonyme Supabase (pour les tests)"
    echo ""
    echo "Exemple:"
    echo "  SUPABASE_URL=https://your-project.supabase.co \\"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \\"
    echo "  SUPABASE_ANON_KEY=your-anon-key \\"
    echo "  $0"
}

# Fonction pour mode dry-run
dry_run() {
    log_info "Mode dry-run - Affichage des requêtes sans exécution"
    
    echo ""
    echo "=== SCHÉMA PRINCIPAL ==="
    echo "Fichier: $SCHEMA_FILE"
    echo "Contenu:"
    cat "$SCHEMA_FILE"
    
    echo ""
    echo "=== TESTS ==="
    echo "Fichier: $TEST_FILE"
    echo "Contenu:"
    cat "$TEST_FILE"
    
    log_success "Dry-run terminé"
}

# Fonction pour exécuter uniquement les tests
run_tests_only() {
    log_info "Exécution des tests uniquement..."
    
    test_connection
    execute_sql "$TEST_FILE" "Tests de validation du schéma"
    
    log_success "Tests terminés"
}

# Gestion des arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -t|--test)
        check_prerequisites
        run_tests_only
        exit 0
        ;;
    -d|--dry-run)
        check_prerequisites
        dry_run
        exit 0
        ;;
    "")
        check_prerequisites
        deploy_schema
        exit 0
        ;;
    *)
        log_error "Option inconnue: $1"
        show_help
        exit 1
        ;;
esac
