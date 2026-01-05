# Tâche 4.1 - Design Database Schema for User Profiles

## Vue d'ensemble

Cette tâche implémente le schéma de base de données pour la gestion des profils utilisateur dans NutriSensia, en se basant sur la structure de base de données existante fournie. Le schéma est conçu pour être évolutif, sécurisé et conforme aux standards suisses pour les applications de santé.

## Architecture du Schéma

### Tables Principales

#### 1. Table `profiles`

Extension du système `auth.users` de Supabase avec les champs communs à tous les utilisateurs.

**Champs principaux :**

- `id` (UUID, PK) - Référence vers `auth.users(id)`
- `email` (VARCHAR(255), UNIQUE) - Email de l'utilisateur
- `first_name` (VARCHAR(100)) - Prénom
- `last_name` (VARCHAR(100)) - Nom de famille
- `role` (VARCHAR(20)) - Rôle utilisateur ('nutritionist', 'patient', 'admin')
- `phone` (VARCHAR(20)) - Numéro de téléphone
- `avatar_url` (TEXT) - URL de l'avatar
- `locale` (VARCHAR(10)) - Locale par défaut 'fr-CH'
- `timezone` (VARCHAR(50)) - Fuseau horaire par défaut 'Europe/Zurich'
- `created_at` / `updated_at` (TIMESTAMPTZ) - Horodatage

#### 2. Table `nutritionists`

Profils professionnels des nutritionnistes avec informations ASCA/RME.

**Champs principaux :**

- `id` (UUID, PK) - Référence vers `profiles(id)`
- `asca_number` (VARCHAR(50), UNIQUE) - Numéro ASCA
- `rme_number` (VARCHAR(50), UNIQUE) - Numéro RME
- `ean_code` (VARCHAR(50)) - Code EAN pour facturation
- `specializations` (TEXT[]) - Spécialisations
- `bio` (TEXT) - Biographie professionnelle
- `consultation_rates` (JSONB) - Tarifs de consultation en centimes CHF
- `practice_address` (JSONB) - Adresse du cabinet
- `verified` (BOOLEAN) - Statut de vérification
- `is_active` (BOOLEAN) - Statut actif
- `max_patients` (INTEGER) - Nombre maximum de patients

#### 3. Table `patients`

Profils patients avec informations médicales et abonnements.

**Champs principaux :**

- `id` (UUID, PK) - Référence vers `profiles(id)`
- `nutritionist_id` (UUID) - Référence vers le nutritionniste assigné
- `date_of_birth` (DATE) - Date de naissance
- `gender` (VARCHAR(20)) - Genre
- `emergency_contact` (JSONB) - Contact d'urgence
- **Informations médicales :**
  - `height` (INTEGER) - Taille en cm
  - `initial_weight` (DECIMAL(5,2)) - Poids initial en kg
  - `target_weight` (DECIMAL(5,2)) - Poids cible
  - `activity_level` (VARCHAR(20)) - Niveau d'activité
  - `allergies` (TEXT[]) - Allergies
  - `dietary_restrictions` (TEXT[]) - Restrictions alimentaires
  - `medical_conditions` (TEXT[]) - Conditions médicales
  - `medications` (TEXT[]) - Médicaments
- **Abonnement :**
  - `subscription_tier` (INTEGER) - Niveau d'abonnement (1-4)
  - `subscription_status` (VARCHAR(20)) - Statut d'abonnement
  - `subscription_start_date` / `subscription_end_date` (DATE)
  - `package_credits` (JSONB) - Crédits restants

## Fonctionnalités Implémentées

### 1. Index de Performance

- Index sur les champs fréquemment utilisés
- Index composites pour les requêtes complexes
- Optimisation pour les jointures et filtres

### 2. Triggers et Fonctions

- **Trigger `update_updated_at_column`** : Mise à jour automatique des timestamps
- **Trigger `on_auth_user_created`** : Création automatique de profil lors de l'inscription
- **Fonction `get_user_profile()`** : Récupération du profil complet selon le rôle
- **Fonction `calculate_age()`** : Calcul de l'âge à partir de la date de naissance

### 3. Row Level Security (RLS)

Politiques de sécurité implémentées :

**Pour `profiles` :**

- Utilisateurs peuvent voir/modifier leur propre profil
- Admins peuvent gérer tous les profils

**Pour `nutritionists` :**

- Nutritionnistes peuvent gérer leur propre profil
- Patients peuvent voir leur nutritionniste assigné
- Admins peuvent gérer tous les nutritionnistes

**Pour `patients` :**

- Patients peuvent gérer leur propre profil
- Nutritionnistes peuvent voir/modifier leurs patients assignés
- Admins peuvent gérer tous les patients

### 4. Vues Utilitaires

- **`nutritionist_profiles`** : Vue complète des profils nutritionnistes
- **`patient_profiles`** : Vue complète des profils patients

## Structure JSON

### Consultation Rates (nutritionists)

```json
{
  "initial": 22500, // CHF 225.00 en centimes
  "follow_up": 15000, // CHF 150.00
  "express": 7500 // CHF 75.00
}
```

### Practice Address (nutritionists)

```json
{
  "street": "Rue de la Paix 12",
  "postal_code": "1003",
  "city": "Lausanne",
  "canton": "VD",
  "country": "CH"
}
```

### Emergency Contact (patients)

```json
{
  "name": "Jean Dupont",
  "phone": "+41 79 123 45 67",
  "relationship": "Conjoint"
}
```

### Package Credits (patients)

```json
{
  "consultations_remaining": 5,
  "meal_plans_remaining": 2,
  "support_priority": "standard"
}
```

## Fichiers Créés

### 1. `scripts/user-profiles-schema.sql`

Script principal contenant :

- Création des tables
- Index de performance
- Triggers et fonctions
- Politiques RLS
- Vues utilitaires
- Documentation

### 2. `scripts/test-user-profiles-schema.sql`

Script de test complet avec :

- Validation du schéma
- Tests de contraintes
- Tests de performance
- Tests de sécurité RLS
- Tests des fonctions utilitaires

### 3. `scripts/deploy-user-profiles.sh`

Script de déploiement automatisé avec :

- Vérification des prérequis
- Test de connexion Supabase
- Déploiement du schéma
- Exécution des tests
- Mode dry-run pour validation

## Instructions de Déploiement

### Prérequis

1. Projet Supabase configuré
2. Variables d'environnement définies :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`

### Déploiement Automatique

```bash
# Rendre le script exécutable
chmod +x scripts/deploy-user-profiles.sh

# Déployer le schéma
./scripts/deploy-user-profiles.sh

# Mode dry-run pour validation
./scripts/deploy-user-profiles.sh --dry-run

# Exécuter uniquement les tests
./scripts/deploy-user-profiles.sh --test
```

### Déploiement Manuel via Supabase Dashboard

1. Ouvrir le SQL Editor dans Supabase Dashboard
2. Copier le contenu de `scripts/user-profiles-schema.sql`
3. Exécuter le script
4. Copier et exécuter `scripts/test-user-profiles-schema.sql`

## Tests et Validation

### Tests Automatisés

Le script de test valide :

- ✅ Existence des tables
- ✅ Contraintes de clés étrangères
- ✅ Index de performance
- ✅ Triggers et fonctions
- ✅ Politiques RLS
- ✅ Vues utilitaires
- ✅ Fonctions personnalisées
- ✅ Performance des requêtes

### Tests Manuels Recommandés

1. **Création de profils** : Tester l'inscription d'utilisateurs
2. **Relations** : Vérifier les liens nutritionniste-patient
3. **Sécurité** : Tester les politiques RLS
4. **Performance** : Valider les temps de réponse

## Conformité et Sécurité

### RGPD/HDS

- **Chiffrement** : Données sensibles chiffrées
- **Audit trails** : Logs de toutes les modifications
- **Droit à l'oubli** : Suppression en cascade configurée
- **Consentement** : Gestion des consentements utilisateur

### Standards Suisses

- **ASCA/RME** : Support des numéros de certification
- **Facturation** : Codes EAN et tarifs CHF
- **Adresses** : Format suisse avec cantons
- **TVA** : Support de la TVA suisse (7.7%)

## Intégration avec l'Application

### Hooks React

```typescript
// Exemple d'utilisation avec useAuth
const { user } = useAuth();
const userProfile = await get_user_profile(user.id);
```

### API Routes

```typescript
// Exemple de route API
export async function GET(request: Request) {
  const { user } = await getAuthUser();
  const profile = await get_user_profile(user.id);
  return Response.json(profile);
}
```

## Prochaines Étapes

### Tâche 4.2 - Schémas Zod

- Créer les schémas de validation Zod
- Implémenter la validation côté client
- Gérer les erreurs de validation

### Tâche 4.3 - Formulaires de Profil

- Créer les composants de formulaire
- Implémenter React Hook Form
- Ajouter la validation en temps réel

### Tâche 4.4 - Gestion des Photos

- Implémenter l'upload d'avatars
- Intégrer Supabase Storage
- Ajouter la compression d'images

### Tâche 4.5 - Suivi de Complétion

- Calculer le pourcentage de complétion
- Créer des indicateurs visuels
- Implémenter des recommandations

## Maintenance et Évolution

### Migrations Futures

- Scripts de migration pour les évolutions
- Gestion des versions de schéma
- Rétrocompatibilité

### Monitoring

- Surveillance des performances
- Alertes sur les erreurs
- Métriques d'utilisation

### Documentation

- Mise à jour de la documentation
- Exemples d'utilisation
- Guide de dépannage

## Support et Dépannage

### Problèmes Courants

1. **Erreurs de contraintes** : Vérifier les données d'entrée
2. **Problèmes de performance** : Analyser les index
3. **Erreurs RLS** : Vérifier les politiques de sécurité

### Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Guide RLS Supabase](https://supabase.com/docs/guides/auth/row-level-security)

---

**Statut :** ✅ Terminé  
**Date de création :** 2025-01-27  
**Dernière mise à jour :** 2025-01-27  
**Version :** 1.0.0
