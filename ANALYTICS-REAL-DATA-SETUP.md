# 🚀 Configuration des Analytics avec de Vraies Données

## 📋 Étapes à suivre

### 1. Créer les tables de base de données

1. **Ouvrez l'interface Supabase** de votre projet
2. **Allez dans l'onglet "SQL Editor"**
3. **Copiez et collez le contenu** du fichier `scripts/create-analytics-tables-simple.sql`
4. **Exécutez le script SQL** en cliquant sur "Run"

### 2. Insérer des données de test

Une fois les tables créées, exécutez le script d'insertion :

```bash
cd /Users/adriencornille/Desktop/NutriSensia
node scripts/insert-test-analytics-data.js
```

### 3. Vérifier le fonctionnement

1. **Démarrez votre application** :
   ```bash
   npm run dev
   ```

2. **Allez sur la page d'analytics** :
   ```
   http://localhost:3000/admin/analytics/onboarding
   ```

3. **Vérifiez que les données s'affichent** correctement

## 🔧 Ce qui a été modifié

### API Analytics (`src/app/api/analytics/onboarding/metrics/route.ts`)

- ✅ **Remplacement des données codées en dur** par de vraies requêtes à la base de données
- ✅ **Ajout de fallbacks** vers les données de test si les tables n'existent pas encore
- ✅ **Support des filtres** par rôle et période
- ✅ **Calculs en temps réel** des métriques

### Tables créées

- **`onboarding_events`** : Stocke tous les événements d'onboarding
- **`onboarding_sessions`** : Suit les sessions d'utilisateurs
- **Politiques RLS** : Sécurité au niveau des lignes pour protéger les données

### Types d'événements trackés

- `Onboarding Started` : Début d'onboarding
- `Onboarding Step Completed` : Étape complétée
- `Onboarding Step Error` : Erreur sur une étape
- `Onboarding Help Requested` : Demande d'aide
- `Onboarding Completed` : Onboarding terminé
- `Onboarding Abandoned` : Onboarding abandonné

## 📊 Métriques disponibles

### Overview
- Nombre total d'utilisateurs
- Utilisateurs ayant complété l'onboarding
- Utilisateurs ayant abandonné
- Taux de completion
- Taux d'abandon
- Temps moyen de completion
- Utilisateurs actuellement actifs

### Funnel
- Nombre de sessions entrées par étape
- Nombre de sessions complétées par étape
- Taux de completion par étape
- Taux de drop-off par étape
- Temps moyen passé par étape

### Erreurs
- Nombre d'erreurs par étape
- Types d'erreurs (validation, network, server)
- Distribution des erreurs

### Aide
- Demandes d'aide par étape
- Types d'aide (tooltip, faq, video, chat)
- Fréquence des demandes

## 🔄 Prochaines étapes

### 1. Implémenter le tracking des événements

Pour que les analytics fonctionnent avec de vraies données d'utilisateurs, il faut :

1. **Modifier les composants d'onboarding** pour envoyer des événements
2. **Utiliser le hook `useOnboardingAnalytics`** existant
3. **Envoyer les événements** vers l'API `/api/analytics/onboarding/events`

### 2. Ajouter des métriques avancées

- **Trends temporels** : Évolution des métriques dans le temps
- **Segmentation** : Analytics par type d'utilisateur
- **Alertes automatiques** : Notifications en cas de problèmes

### 3. Optimiser les performances

- **Index de base de données** : Déjà créés
- **Cache des métriques** : Pour les requêtes fréquentes
- **Agrégation** : Calculs pré-calculés pour les métriques

## 🐛 Dépannage

### Les données ne s'affichent pas

1. **Vérifiez que les tables existent** dans Supabase
2. **Vérifiez les logs** de l'API dans la console
3. **Vérifiez les permissions** RLS dans Supabase

### Erreurs de permissions

1. **Vérifiez que vous êtes connecté** en tant qu'admin
2. **Vérifiez les politiques RLS** dans Supabase
3. **Vérifiez la clé de service** dans les variables d'environnement

### Données vides

1. **Exécutez le script d'insertion** de données de test
2. **Vérifiez les dates** de filtrage
3. **Vérifiez les rôles** dans les filtres

## 📝 Notes importantes

- **Les données de test** sont générées aléatoirement pour les 7 derniers jours
- **Les fallbacks** vers les données codées en dur sont maintenus pour la compatibilité
- **Les politiques RLS** protègent les données des utilisateurs
- **L'API est optimisée** avec des requêtes parallèles pour le dashboard

## 🎯 Résultat attendu

Après avoir suivi ces étapes, vous devriez voir :

1. **Des métriques réalistes** sur la page d'analytics
2. **Des données qui changent** selon les filtres (rôle, période)
3. **Des graphiques fonctionnels** avec de vraies données
4. **Un système prêt** pour le tracking en temps réel

---

**🎉 Félicitations !** Votre système d'analytics utilise maintenant de vraies données de base de données au lieu de données codées en dur.

