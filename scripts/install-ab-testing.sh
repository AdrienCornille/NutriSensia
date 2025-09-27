#!/bin/bash

# =====================================================
# Script d'installation de l'infrastructure A/B Testing
# NutriSensia - Déploiement des tests A/B pour l'onboarding
# =====================================================

set -e

echo "🚀 Installation de l'infrastructure A/B Testing pour NutriSensia"
echo "================================================================="

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que psql est installé (pour Supabase)
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql n'est pas installé. Vous devrez déployer les schémas manuellement."
fi

echo "✅ Prérequis vérifiés"

# Installation des dépendances npm
echo "📦 Installation des dépendances npm..."
npm install flags

echo "✅ Dépendances installées"

# Vérification des variables d'environnement
echo "🔧 Vérification de la configuration..."

if [ -f .env.local ]; then
    echo "✅ Fichier .env.local trouvé"
else
    echo "⚠️  Fichier .env.local non trouvé. Création d'un template..."
    cat > .env.local << EOF
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Configuration des Feature Flags
NEXT_PUBLIC_FLAGS_SECRET=your_flags_secret_here

# Configuration Analytics (optionnel)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id_here

# Configuration Notifications (optionnel)
SMTP_HOST=your_smtp_host_here
SMTP_USER=your_smtp_user_here
SMTP_PASS=your_smtp_pass_here
SLACK_WEBHOOK_URL=your_slack_webhook_here
EOF
    echo "⚠️  Veuillez configurer les variables d'environnement dans .env.local"
fi

# Déploiement des schémas de base de données
echo "🗄️  Déploiement des schémas de base de données..."

if command -v psql &> /dev/null && [ ! -z "$DATABASE_URL" ]; then
    echo "Déploiement du schéma A/B Testing..."
    psql $DATABASE_URL -f scripts/ab-testing-schema.sql
    echo "✅ Schéma A/B Testing déployé"
    
    echo "Déploiement du schéma Gradual Rollout..."
    psql $DATABASE_URL -f scripts/gradual-rollout-schema.sql
    echo "✅ Schéma Gradual Rollout déployé"
else
    echo "⚠️  Impossible de déployer automatiquement les schémas."
    echo "   Veuillez exécuter manuellement :"
    echo "   - psql \$DATABASE_URL -f scripts/ab-testing-schema.sql"
    echo "   - psql \$DATABASE_URL -f scripts/gradual-rollout-schema.sql"
fi

# Vérification de l'installation
echo "🧪 Vérification de l'installation..."

# Test de compilation TypeScript
if npx tsc --noEmit --skipLibCheck; then
    echo "✅ Compilation TypeScript réussie"
else
    echo "❌ Erreurs de compilation TypeScript détectées"
    echo "   Veuillez corriger les erreurs avant de continuer"
fi

# Génération de la documentation
echo "📚 Génération de la documentation..."

cat > docs/AB_TESTING_SETUP.md << 'EOF'
# Configuration des Tests A/B - NutriSensia

## Vue d'ensemble

L'infrastructure A/B Testing de NutriSensia permet de tester différentes variantes de l'expérience d'onboarding pour optimiser les taux de conversion et l'engagement utilisateur.

## Architecture

### Composants principaux

1. **Feature Flags** (`src/lib/feature-flags/flags.ts`)
   - Définition des flags et variantes
   - Logique d'attribution des utilisateurs
   - Configuration des tests A/B

2. **Analytics** (`src/lib/feature-flags/analytics.ts`)
   - Collecte des événements utilisateur
   - Calcul des métriques de conversion
   - Analyse statistique des résultats

3. **Provider React** (`src/components/feature-flags/ABTestProvider.tsx`)
   - Contexte global pour les feature flags
   - Hooks pour l'utilisation dans les composants
   - Tracking automatique des événements

4. **Variantes d'onboarding** (`src/components/feature-flags/OnboardingVariants.tsx`)
   - Différentes versions de l'interface d'onboarding
   - Composants adaptatifs selon les tests A/B

5. **Dashboard d'analyse** (`src/components/dashboard/ABTestDashboard.tsx`)
   - Interface de monitoring des tests
   - Visualisation des résultats
   - Outils d'analyse statistique

6. **Déploiement progressif** (`src/lib/feature-flags/gradual-rollout.ts`)
   - Système de rollout graduel des variantes gagnantes
   - Monitoring automatique et rollback d'urgence

## Configuration

### Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Feature Flags
NEXT_PUBLIC_FLAGS_SECRET=your_secret_key
```

### Base de données

Les schémas suivants doivent être déployés :

1. `scripts/ab-testing-schema.sql` - Tables pour les événements et analyses A/B
2. `scripts/gradual-rollout-schema.sql` - Tables pour le déploiement progressif

## Utilisation

### 1. Intégration dans un composant

```tsx
import { ABTestProvider, useFeatureFlag } from '@/components/feature-flags/ABTestProvider';

function MyComponent() {
  return (
    <ABTestProvider userId={userId} userRole={userRole}>
      <OnboardingWithABTest />
    </ABTestProvider>
  );
}

function OnboardingWithABTest() {
  const variant = useFeatureFlag('nutritionist-onboarding-variant', 'control');
  
  return (
    <div>
      {variant === 'simplified' ? <SimplifiedOnboarding /> : <StandardOnboarding />}
    </div>
  );
}
```

### 2. Tracking des événements

```tsx
import { useOnboardingTracking } from '@/components/feature-flags/ABTestProvider';

function OnboardingStep() {
  const { trackOnboardingStep, trackOnboardingComplete } = useOnboardingTracking();
  
  const handleStepComplete = () => {
    trackOnboardingStep('personal-info', 1, 7);
  };
  
  const handleOnboardingComplete = () => {
    trackOnboardingComplete(totalDuration);
  };
}
```

### 3. Accès au dashboard

Le dashboard d'analyse est accessible à l'adresse `/dashboard/ab-tests` pour les utilisateurs admin et nutritionnistes.

## Tests A/B disponibles

### 1. Variantes d'onboarding nutritionniste

- **control** : Version actuelle standard
- **simplified** : Version simplifiée avec moins d'étapes
- **gamified** : Version avec éléments de gamification
- **guided** : Version avec aide contextuelle renforcée

### 2. Affichage du progrès

- **linear** : Barre de progression linéaire
- **circular** : Indicateur circulaire
- **steps** : Affichage par étapes
- **minimal** : Indicateur minimal

### 3. Validation des formulaires

- **realtime** : Validation en temps réel
- **onblur** : Validation à la perte de focus
- **onsubmit** : Validation à la soumission
- **progressive** : Validation progressive

## Monitoring et alertes

### Métriques surveillées

- Taux de conversion
- Taux d'abandon par étape
- Temps de completion
- Taux d'erreur
- Score de satisfaction utilisateur

### Alertes automatiques

- Pic d'erreurs
- Chute de conversion
- Dégradation des performances
- Feedback utilisateur négatif

## Déploiement progressif

Le système de gradual rollout permet de déployer progressivement les variantes gagnantes :

1. **Configuration initiale** : 5% des utilisateurs
2. **Incréments automatiques** : +10% toutes les 24h
3. **Monitoring continu** : Surveillance des métriques
4. **Rollback automatique** : En cas de problème détecté

## Sécurité et performance

- **RLS (Row Level Security)** : Accès sécurisé aux données
- **Cache intelligent** : Optimisation des performances
- **Anonymisation** : Protection de la vie privée
- **GDPR compliant** : Respect des réglementations

## Support et maintenance

Pour toute question ou problème :

1. Consultez les logs dans Supabase
2. Vérifiez le dashboard de monitoring
3. Consultez la documentation technique
4. Contactez l'équipe de développement

EOF

echo "✅ Documentation générée dans docs/AB_TESTING_SETUP.md"

# Instructions finales
echo ""
echo "🎉 Installation terminée avec succès !"
echo "======================================="
echo ""
echo "📋 Prochaines étapes :"
echo "1. Configurez les variables d'environnement dans .env.local"
echo "2. Déployez les schémas de base de données si ce n'est pas fait"
echo "3. Testez l'intégration avec votre onboarding existant"
echo "4. Configurez vos premiers tests A/B"
echo "5. Consultez le dashboard d'analyse"
echo ""
echo "📚 Documentation disponible dans docs/AB_TESTING_SETUP.md"
echo ""
echo "🚀 Bonne optimisation de votre onboarding !"
EOF
