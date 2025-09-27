# 📊 Système d'Analytics d'Onboarding NutriSensia

Ce document explique comment utiliser le système d'analytics d'onboarding qui enregistre automatiquement les données dans Supabase.

## 🎯 Vue d'ensemble

Le système d'analytics d'onboarding capture automatiquement :
- **Événements d'onboarding** : Début, étapes, completion, abandon
- **Sessions d'onboarding** : Durée, progression, statut
- **Métriques détaillées** : Taux de completion, temps moyen, points d'abandon

## 🏗️ Architecture

### Tables Supabase
- `onboarding_events` : Tous les événements d'onboarding
- `onboarding_sessions` : Sessions d'onboarding des utilisateurs

### API Endpoints
- `POST /api/analytics/onboarding/events` : Enregistrer un événement
- `GET /api/analytics/onboarding/events` : Récupérer les événements
- `GET /api/analytics/onboarding/metrics` : Récupérer les métriques

### Services
- `OnboardingAnalyticsDB` : Service d'enregistrement en base
- `useOnboardingAnalytics` : Hook React pour le tracking
- `SimpleOnboardingAnalytics` : Service de tracking côté client

## 🚀 Utilisation

### 1. Vérification des tables

```bash
# Vérifier que les tables Supabase existent
node verify-onboarding-tables.js
```

### 2. Test complet

```bash
# Exécuter tous les tests
node run-onboarding-tests.js
```

### 3. Test avec serveur

```bash
# Démarrer le serveur et exécuter les tests
./start-and-test-onboarding.sh
```

## 📊 Types d'événements trackés

### Événements principaux
- `onboarding_started` : Début d'onboarding
- `step_started` : Début d'une étape
- `step_completed` : Completion d'une étape
- `step_skipped` : Passage d'une étape
- `step_error` : Erreur dans une étape
- `help_requested` : Demande d'aide
- `onboarding_completed` : Completion d'onboarding
- `onboarding_abandoned` : Abandon d'onboarding

### Données capturées
- **Utilisateur** : ID, rôle, session
- **Étape** : Nom, numéro, progression
- **Technique** : Appareil, navigateur, temps
- **Contexte** : Erreurs, aide, raison d'abandon

## 🔧 Configuration

### Variables d'environnement requises
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Permissions Supabase
Les tables doivent avoir les politiques RLS configurées :
- Lecture pour les admins
- Écriture pour les utilisateurs authentifiés

## 📈 Interface d'administration

Accédez à l'interface d'administration à :
```
http://localhost:3000/admin/analytics/onboarding
```

### Métriques disponibles
- **Vue d'ensemble** : Utilisateurs totaux, completion, abandon
- **Progression** : Étapes par étape, temps moyen
- **Funnel** : Taux de conversion par étape
- **Détails** : Événements individuels, sessions

## 🧪 Tests

### Test des API
```bash
node test-onboarding-analytics.js
```

### Test d'intégration
```bash
node test-onboarding-integration.js
```

### Test complet
```bash
node run-onboarding-tests.js
```

## 🔍 Dépannage

### Problèmes courants

1. **Tables manquantes**
   ```bash
   # Exécuter le script SQL dans Supabase
   cat scripts/create-analytics-tables-simple.sql
   ```

2. **Permissions insuffisantes**
   - Vérifier les politiques RLS
   - Vérifier la clé de service

3. **Serveur non démarré**
   ```bash
   npm run dev
   ```

### Logs de débogage

Les logs sont disponibles dans :
- Console du navigateur (côté client)
- Console du serveur (côté API)
- Logs Supabase (base de données)

## 📚 Structure des fichiers

```
src/
├── lib/
│   ├── onboarding-analytics-db.ts     # Service d'enregistrement
│   └── analytics-simple.ts           # Service de tracking
├── hooks/
│   └── useOnboardingAnalytics.ts     # Hook React
├── app/api/analytics/onboarding/
│   ├── events/route.ts               # API événements
│   └── metrics/route.ts              # API métriques
└── components/onboarding/
    └── NutritionistOnboardingWizard.tsx  # Wizard avec analytics
```

## 🎉 Résultat attendu

Après l'implémentation, vous devriez voir :

1. **Données enregistrées** dans les tables Supabase
2. **Métriques visibles** dans l'interface admin
3. **Événements trackés** en temps réel
4. **Sessions complètes** avec progression

## 🔄 Prochaines étapes

1. **Tester l'onboarding** avec un utilisateur réel
2. **Vérifier les données** dans l'interface admin
3. **Analyser les métriques** pour optimiser l'expérience
4. **Ajuster le tracking** selon les besoins

---

**Note** : Ce système est conçu pour être non-intrusif et ne pas affecter les performances de l'onboarding. Les enregistrements se font de manière asynchrone.

