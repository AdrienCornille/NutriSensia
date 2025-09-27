#!/bin/bash

# Script d'installation automatique pour NutriSensia
# Configure l'environnement de développement complet

set -e  # Arrêter en cas d'erreur

# Couleurs pour la console
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions de logging
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

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet NutriSensia"
    exit 1
fi

echo "🚀 Configuration automatique de l'environnement NutriSensia"
echo "=========================================================="

# Vérifier les prérequis
log_info "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    log_info "Installez Node.js 18+ depuis https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    log_error "Node.js version $NODE_VERSION détectée. Version 18+ requise."
    exit 1
fi

log_success "Node.js $NODE_VERSION détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

NPM_VERSION=$(npm --version)
log_success "npm $NPM_VERSION détecté"

# Vérifier Git
if ! command -v git &> /dev/null; then
    log_error "Git n'est pas installé"
    exit 1
fi

GIT_VERSION=$(git --version | cut -d' ' -f3)
log_success "Git $GIT_VERSION détecté"

# Installer les dépendances
log_info "Installation des dépendances..."
npm install
log_success "Dépendances installées"

# Vérifier si .env.local existe
if [ ! -f ".env.local" ]; then
    log_warning "Fichier .env.local non trouvé"
    
    if [ -f ".env.example" ]; then
        log_info "Copie du fichier .env.example vers .env.local"
        cp .env.example .env.local
        log_success "Fichier .env.local créé"
        log_warning "⚠️  IMPORTANT: Modifiez .env.local avec vos vraies valeurs Supabase"
    else
        log_error "Fichier .env.example non trouvé"
        log_info "Créez manuellement le fichier .env.local avec les variables requises"
    fi
else
    log_success "Fichier .env.local trouvé"
fi

# Configurer Husky
log_info "Configuration de Husky..."
npx husky install
log_success "Husky configuré"

# Vérifier la configuration Git
log_info "Vérification de la configuration Git..."

# Vérifier si le remote origin est configuré
if ! git remote get-url origin &> /dev/null; then
    log_warning "Remote origin non configuré"
    log_info "Ajoutez le remote avec: git remote add origin https://github.com/AdrienCornille/NutriSensia.git"
else
    log_success "Remote origin configuré"
fi

# Vérifier la branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    log_warning "Vous êtes sur la branche $CURRENT_BRANCH"
    log_info "Considérez basculer sur develop: git checkout develop"
else
    log_success "Branche $CURRENT_BRANCH détectée"
fi

# Tester le build
log_info "Test de build..."
if npm run build &> /dev/null; then
    log_success "Build réussi"
else
    log_error "Build échoué"
    log_info "Vérifiez les erreurs de compilation"
    exit 1
fi

# Vérifier la qualité du code
log_info "Vérification de la qualité du code..."
if npm run quality &> /dev/null; then
    log_success "Qualité du code OK"
else
    log_warning "Problèmes de qualité détectés"
    log_info "Exécutez 'npm run format' pour corriger le formatage"
fi

# Créer les dossiers manquants si nécessaire
log_info "Création des dossiers de développement..."

mkdir -p src/components/ui
mkdir -p src/components/forms
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types
mkdir -p docs

log_success "Structure des dossiers vérifiée"

# Afficher les informations finales
echo ""
echo "🎉 Configuration terminée !"
echo "=========================="
echo ""
log_success "Votre environnement NutriSensia est prêt !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Modifiez .env.local avec vos clés Supabase"
echo "2. Suivez le guide dans docs/supabase-setup.md"
echo "3. Démarrez le développement : npm run dev"
echo "4. Consultez docs/onboarding.md pour plus d'informations"
echo ""
echo "🔧 Scripts disponibles :"
echo "- npm run dev          # Serveur de développement"
echo "- npm run build        # Build de production"
echo "- npm run quality      # Vérification complète"
echo "- npm run format       # Formatage du code"
echo "- node scripts/validate-env.js  # Validation de l'environnement"
echo ""
echo "📚 Documentation :"
echo "- docs/onboarding.md   # Guide d'onboarding"
echo "- docs/troubleshooting.md  # Guide de dépannage"
echo "- docs/code-quality.md # Outils de qualité"
echo "- docs/git-workflow.md # Workflow Git"
echo ""

# Vérifier si on peut démarrer le serveur
read -p "Voulez-vous démarrer le serveur de développement maintenant ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Démarrage du serveur de développement..."
    npm run dev
fi
