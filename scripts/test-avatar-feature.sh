#!/bin/bash

# Script de test pour la fonctionnalité de téléchargement d'avatar
# Usage: ./scripts/test-avatar-feature.sh

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    print_status "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier les variables d'environnement
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_warning "Variables d'environnement Supabase non définies"
        print_warning "Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies"
    fi
    
    # Vérifier que package.json existe
    if [ ! -f "package.json" ]; then
        print_error "package.json non trouvé. Exécutez ce script depuis la racine du projet."
        exit 1
    fi
    
    print_success "Prérequis vérifiés"
}

# Fonction pour installer les dépendances
install_dependencies() {
    print_status "Installation des dépendances..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dépendances installées"
    else
        print_status "Dépendances déjà installées"
    fi
}

# Fonction pour exécuter les tests automatisés
run_automated_tests() {
    print_status "Lancement des tests automatisés..."
    
    # Tests des composants
    print_status "Tests des composants ImageUpload et Avatar..."
    npm test -- --testPathPattern="(ImageUpload|Avatar)" --passWithNoTests --silent
    
    if [ $? -eq 0 ]; then
        print_success "Tests automatisés réussis"
    else
        print_error "Tests automatisés échoués"
        return 1
    fi
}

# Fonction pour tester la configuration Supabase
test_supabase_config() {
    print_status "Test de la configuration Supabase..."
    
    if [ -f "scripts/test-avatar-storage.js" ]; then
        node scripts/test-avatar-storage.js
        
        if [ $? -eq 0 ]; then
            print_success "Configuration Supabase validée"
        else
            print_warning "Configuration Supabase avec des problèmes"
            return 1
        fi
    else
        print_warning "Script de test Supabase non trouvé"
    fi
}

# Fonction pour tester le build de production
test_production_build() {
    print_status "Test du build de production..."
    
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build de production réussi"
    else
        print_error "Build de production échoué"
        return 1
    fi
}

# Fonction pour lancer les tests de linting
run_linting() {
    print_status "Vérification du code avec ESLint..."
    
    if npm run lint &> /dev/null; then
        print_success "Linting réussi"
    else
        print_warning "Problèmes de linting détectés"
        npm run lint
    fi
}

# Fonction pour vérifier les types TypeScript
check_types() {
    print_status "Vérification des types TypeScript..."
    
    if npx tsc --noEmit; then
        print_success "Types TypeScript valides"
    else
        print_error "Erreurs de types TypeScript"
        return 1
    fi
}

# Fonction pour générer un rapport de couverture
generate_coverage_report() {
    print_status "Génération du rapport de couverture..."
    
    npm test -- --coverage --testPathPattern="(ImageUpload|Avatar)" --passWithNoTests --silent
    
    if [ -d "coverage" ]; then
        print_success "Rapport de couverture généré dans coverage/"
        print_status "Ouvrez coverage/lcov-report/index.html pour voir le rapport"
    else
        print_warning "Rapport de couverture non généré"
    fi
}

# Fonction pour afficher les instructions de test manuel
show_manual_test_instructions() {
    echo ""
    print_status "Instructions pour les tests manuels :"
    echo ""
    echo "1. Démarrer l'application :"
    echo "   npm run dev"
    echo ""
    echo "2. Naviguer vers :"
    echo "   http://localhost:3000/profile"
    echo ""
    echo "3. Tests à effectuer :"
    echo "   - Cliquer sur l'avatar pour ouvrir l'interface de modification"
    echo "   - Tester le drag-and-drop d'images"
    echo "   - Tester la sélection de fichiers"
    echo "   - Vérifier les validations (types, tailles)"
    echo "   - Tester les notifications de succès/erreur"
    echo "   - Vérifier le responsive design"
    echo ""
    echo "4. Consulter la documentation complète :"
    echo "   docs/testing-guide-avatar-upload.md"
    echo ""
}

# Fonction principale
main() {
    echo "🧪 Démarrage des tests de la fonctionnalité Avatar"
    echo "=================================================="
    echo ""
    
    # Variables pour suivre les résultats
    tests_passed=0
    tests_failed=0
    
    # Vérifier les prérequis
    check_prerequisites
    tests_passed=$((tests_passed + 1))
    
    # Installer les dépendances
    install_dependencies
    tests_passed=$((tests_passed + 1))
    
    # Tests automatisés
    if run_automated_tests; then
        tests_passed=$((tests_passed + 1))
    else
        tests_failed=$((tests_failed + 1))
    fi
    
    # Test de configuration Supabase
    if test_supabase_config; then
        tests_passed=$((tests_passed + 1))
    else
        tests_failed=$((tests_failed + 1))
    fi
    
    # Test du build de production
    if test_production_build; then
        tests_passed=$((tests_passed + 1))
    else
        tests_failed=$((tests_failed + 1))
    fi
    
    # Linting
    if run_linting; then
        tests_passed=$((tests_passed + 1))
    else
        tests_failed=$((tests_failed + 1))
    fi
    
    # Vérification des types
    if check_types; then
        tests_passed=$((tests_passed + 1))
    else
        tests_failed=$((tests_failed + 1))
    fi
    
    # Générer le rapport de couverture
    generate_coverage_report
    tests_passed=$((tests_passed + 1))
    
    # Afficher le résumé
    echo ""
    echo "📊 Résumé des tests"
    echo "=================="
    echo "Tests réussis : $tests_passed"
    echo "Tests échoués : $tests_failed"
    echo "Total : $((tests_passed + tests_failed))"
    echo ""
    
    if [ $tests_failed -eq 0 ]; then
        print_success "🎉 Tous les tests sont passés !"
        echo ""
        print_status "La fonctionnalité de téléchargement d'avatar est prête pour les tests manuels."
    else
        print_warning "⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus."
        echo ""
        print_status "Corrigez les problèmes avant de procéder aux tests manuels."
    fi
    
    # Afficher les instructions de test manuel
    show_manual_test_instructions
    
    # Code de sortie
    if [ $tests_failed -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Exécuter la fonction principale
main "$@"
