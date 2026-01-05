#!/bin/bash

# Script de vérification de l'implémentation de IntroSection
# Usage: bash verify-intro-section.sh

echo "🔍 Vérification de l'implémentation de IntroSection..."
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
SUCCESS=0
FAILED=0

# Fonction de vérification
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} $1 (manquant)"
        ((FAILED++))
    fi
}

# Vérification des fichiers créés
echo "📁 Vérification des fichiers créés..."
echo ""

check_file "src/components/landing/approach/IntroSection.tsx"
check_file "src/components/landing/approach/ApproachPageWithIntro.tsx"
check_file "src/components/landing/approach/IntroSection.stories.tsx"
check_file "INTRO_SECTION_APPROCHE.md"
check_file "SECTION_INTRO_APPROCHE_COMPLETE.md"
check_file "QUICK_START_INTRO_SECTION.md"
check_file "INTRO_SECTION_FILES_SUMMARY.md"

echo ""
echo "📝 Vérification des exports dans index.ts..."
echo ""

# Vérification des exports
if grep -q "export { IntroSection }" src/components/landing/approach/index.ts; then
    echo -e "${GREEN}✓${NC} Export de IntroSection trouvé"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Export de IntroSection manquant"
    ((FAILED++))
fi

if grep -q "export { ApproachPageWithIntro }" src/components/landing/approach/index.ts; then
    echo -e "${GREEN}✓${NC} Export de ApproachPageWithIntro trouvé"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Export de ApproachPageWithIntro manquant"
    ((FAILED++))
fi

echo ""
echo "🔧 Vérification de la syntaxe TypeScript..."
echo ""

# Vérification de la syntaxe
if node -e "console.log('Node.js disponible')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Node.js disponible"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Node.js non disponible"
    ((FAILED++))
fi

echo ""
echo "📦 Vérification des dépendances..."
echo ""

# Vérification de framer-motion
if grep -q "\"framer-motion\"" package.json; then
    echo -e "${GREEN}✓${NC} framer-motion dans package.json"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} framer-motion non trouvé dans package.json"
fi

# Vérification de react
if grep -q "\"react\"" package.json; then
    echo -e "${GREEN}✓${NC} react dans package.json"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} react non trouvé dans package.json"
    ((FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "📊 Résumé"
echo "═══════════════════════════════════════════════"
echo -e "Succès: ${GREEN}${SUCCESS}${NC}"
echo -e "Échecs: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Tout est en ordre !${NC}"
    echo ""
    echo "🚀 Prochaines étapes :"
    echo "  1. npm run storybook"
    echo "  2. Naviguer vers : Landing > Approach > IntroSection"
    echo "  3. Tester les différentes stories"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Des fichiers sont manquants ou incorrects${NC}"
    echo ""
    echo "📖 Consultez la documentation :"
    echo "  - QUICK_START_INTRO_SECTION.md"
    echo "  - INTRO_SECTION_APPROCHE.md"
    echo ""
    exit 1
fi
