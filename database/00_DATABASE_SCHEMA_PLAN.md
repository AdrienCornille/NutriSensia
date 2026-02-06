# NutriSensia - Plan de Schéma de Base de Données

## Vue d'ensemble

Ce document décrit le plan complet pour créer le schéma de base de données Supabase nécessaire à l'implémentation complète de toutes les User Stories.

## Tables Existantes

| Table | Description | Status |
|-------|-------------|--------|
| `profiles` | Profils utilisateurs (auth) | ✅ Existe |
| `users` | Données utilisateurs legacy | ✅ Existe |
| `meals` | Repas enregistrés | ✅ Existe (à enrichir) |
| `meal_plans` | Plans alimentaires | ✅ Existe (à enrichir) |

## Phases d'Implémentation

### Phase 1: Extensions Profils & Paramètres
**Dépendances**: `auth.users`, `profiles`
**User Stories**: AUTH-001, AUTH-002, AUTH-004, PROF-001 à PROF-011

| Table | Description |
|-------|-------------|
| `patient_profiles` | Données étendues des patients (raison consultation, onboarding) |
| `nutritionist_profiles` | Données étendues des nutritionnistes |
| `user_settings` | Préférences utilisateur (notifications, affichage, unités) |
| `user_sessions` | Sessions actives pour gestion multi-appareils |

### Phase 2: Base d'Aliments
**Dépendances**: `profiles`
**User Stories**: FOOD-001 à FOOD-007

| Table | Description |
|-------|-------------|
| `food_categories` | Catégories d'aliments (Fruits, Légumes, etc.) |
| `foods` | Base de données des aliments avec infos nutritionnelles |
| `food_portions` | Portions standards pour chaque aliment |
| `food_favorites` | Aliments favoris des utilisateurs |

### Phase 3: Recettes
**Dépendances**: `foods`, `profiles`
**User Stories**: REC-001 à REC-008

| Table | Description |
|-------|-------------|
| `recipe_categories` | Catégories de recettes |
| `recipes` | Recettes avec instructions |
| `recipe_ingredients` | Ingrédients des recettes |
| `recipe_favorites` | Recettes favorites des utilisateurs |

### Phase 4: Agenda & Rendez-vous
**Dépendances**: `profiles`, `patient_profiles`, `nutritionist_profiles`
**User Stories**: AGENDA-001 à AGENDA-010, AUTH-005

| Table | Description |
|-------|-------------|
| `consultation_types` | Types de consultation (Suivi, Approfondi, Urgence) |
| `nutritionist_availability` | Disponibilités des nutritionnistes |
| `appointments` | Rendez-vous planifiés |
| `appointment_reminders` | Paramètres de rappel pour chaque RDV |

### Phase 5: Messagerie
**Dépendances**: `profiles`
**User Stories**: MSG-001 à MSG-010

| Table | Description |
|-------|-------------|
| `conversations` | Conversations entre patient et nutritionniste |
| `messages` | Messages individuels |
| `message_attachments` | Pièces jointes des messages |

### Phase 6: Suivi Biométrique
**Dépendances**: `profiles`
**User Stories**: BIO-001 à BIO-009, DASH-002, DASH-004

| Table | Description |
|-------|-------------|
| `weight_entries` | Entrées de poids |
| `measurements` | Mensurations corporelles |
| `wellbeing_logs` | Logs de bien-être quotidien |
| `hydration_logs` | Logs d'hydratation |
| `activity_types` | Types d'activité physique |
| `activities` | Activités physiques enregistrées |

### Phase 7: Gestion des Repas (Enrichissement)
**Dépendances**: `foods`, `profiles`
**User Stories**: MEAL-001 à MEAL-016, DASH-001, DASH-003

| Modification | Description |
|--------------|-------------|
| `meals` (enrichir) | Ajouter photo, notes, tags, date du repas |
| `meal_foods` | Table de liaison repas-aliments avec quantités |

### Phase 8: Plans Alimentaires (Enrichissement)
**Dépendances**: `meals`, `foods`, `profiles`, `nutritionist_profiles`
**User Stories**: PLAN-001 à PLAN-007

| Table | Description |
|-------|-------------|
| `meal_plans` (enrichir) | Ajouter nutritionniste, objectif, statut |
| `meal_plan_days` | Jours du plan alimentaire |
| `meal_plan_meals` | Repas planifiés pour chaque jour |
| `meal_plan_alternatives` | Alternatives suggérées pour chaque aliment |
| `plan_modification_requests` | Demandes de modification du plan |

### Phase 9: Dossier Patient
**Dépendances**: `profiles`, `appointments`
**User Stories**: FILE-001 à FILE-007

| Table | Description |
|-------|-------------|
| `anamneses` | Questionnaires d'anamnèse |
| `anamnesis_sections` | Sections de l'anamnèse |
| `consultations` | Consultations effectuées avec résumé |
| `follow_up_questionnaires` | Questionnaires de suivi |
| `documents` | Documents uploadés |
| `patient_objectives` | Objectifs du patient |

### Phase 10: Listes de Courses
**Dépendances**: `foods`, `recipes`, `meal_plans`
**User Stories**: PLAN-006, REC-007, REC-008

| Table | Description |
|-------|-------------|
| `shopping_lists` | Listes de courses |
| `shopping_list_items` | Articles des listes |

### Phase 11: Contenu Exclusif
**Dépendances**: `profiles`, `nutritionist_profiles`
**User Stories**: CONTENT-001 à CONTENT-008

| Table | Description |
|-------|-------------|
| `content_categories` | Catégories de contenu |
| `content_themes` | Thèmes de contenu |
| `exclusive_contents` | Contenus exclusifs |
| `content_saves` | Contenus sauvegardés |
| `learning_paths` | Parcours d'apprentissage |
| `learning_path_modules` | Modules des parcours |
| `learning_progress` | Progression dans les parcours |

### Phase 12: Notifications
**Dépendances**: `profiles`
**User Stories**: NOTIF-001 à NOTIF-006, MSG-007

| Table | Description |
|-------|-------------|
| `notification_types` | Types de notifications |
| `notifications` | Notifications utilisateur |

### Phase 13: Gamification
**Dépendances**: `profiles`
**User Stories**: GAME-001 à GAME-004, DASH-007

| Table | Description |
|-------|-------------|
| `badge_categories` | Catégories de badges |
| `badges` | Badges disponibles |
| `user_badges` | Badges débloqués par utilisateur |
| `streaks` | Streaks d'enregistrement |
| `weekly_objectives` | Objectifs hebdomadaires |
| `weekly_objective_progress` | Progression des objectifs |

## Ordre d'Exécution des Scripts SQL

```
01_extensions_and_types.sql      # Extensions PostgreSQL et types enum
02_patient_nutritionist.sql      # Profils patients et nutritionnistes
03_user_settings.sql             # Paramètres utilisateur
04_foods_database.sql            # Base d'aliments
05_recipes.sql                   # Recettes
06_appointments.sql              # Rendez-vous
07_messaging.sql                 # Messagerie
08_biometrics.sql                # Suivi biométrique
09_meals_enhanced.sql            # Repas enrichis
10_meal_plans_enhanced.sql       # Plans alimentaires enrichis
11_patient_file.sql              # Dossier patient
12_shopping_lists.sql            # Listes de courses
13_exclusive_content.sql         # Contenu exclusif
14_notifications.sql             # Notifications
15_gamification.sql              # Gamification
16_rls_policies.sql              # Row Level Security policies
17_functions_triggers.sql        # Fonctions et triggers
18_indexes.sql                   # Index pour performance
```

## Conventions

### Nommage
- Tables: `snake_case` pluriel (`user_settings`, `appointments`)
- Colonnes: `snake_case` (`created_at`, `user_id`)
- Clés étrangères: `{table_singulier}_id` (`user_id`, `appointment_id`)
- Index: `idx_{table}_{columns}`
- Contraintes: `{table}_{type}_{columns}` (ex: `appointments_check_dates`)

### Types Standards
- IDs: `uuid` avec `gen_random_uuid()`
- Timestamps: `timestamptz` avec `now()` par défaut
- Soft delete: `deleted_at timestamptz`
- Audit: `created_at`, `updated_at`, `created_by`, `updated_by`

### Row Level Security (RLS)
- Toutes les tables ont RLS activé
- Patients: accès à leurs propres données uniquement
- Nutritionnistes: accès aux données de leurs patients
- Admins: accès complet

## Diagramme des Relations

```
auth.users
    │
    └── profiles (1:1)
            │
            ├── patient_profiles (1:1 pour patients)
            │       │
            │       ├── anamneses
            │       ├── weight_entries
            │       ├── measurements
            │       ├── hydration_logs
            │       ├── wellbeing_logs
            │       ├── activities
            │       ├── meals
            │       ├── patient_objectives
            │       └── documents
            │
            ├── nutritionist_profiles (1:1 pour nutritionnistes)
            │       │
            │       ├── nutritionist_availability
            │       ├── meal_plans (créés)
            │       ├── recipes (créées)
            │       └── exclusive_contents (créés)
            │
            ├── user_settings (1:1)
            ├── user_sessions (1:N)
            ├── notifications (1:N)
            ├── user_badges (1:N)
            ├── streaks (1:N)
            └── conversations (N:N via participants)

appointments
    │
    ├── patient_profile
    ├── nutritionist_profile
    ├── consultation_type
    └── consultations (après RDV)

conversations
    │
    └── messages
            │
            └── message_attachments

meal_plans
    │
    ├── meal_plan_days
    │       │
    │       └── meal_plan_meals
    │               │
    │               └── meal_plan_alternatives
    │
    └── plan_modification_requests
```

## Estimation

| Phase | Nombre de tables | Complexité |
|-------|------------------|------------|
| 1 | 4 | Moyenne |
| 2 | 4 | Moyenne |
| 3 | 4 | Moyenne |
| 4 | 4 | Haute |
| 5 | 3 | Moyenne |
| 6 | 6 | Moyenne |
| 7 | 2 | Basse |
| 8 | 5 | Haute |
| 9 | 6 | Haute |
| 10 | 2 | Basse |
| 11 | 7 | Moyenne |
| 12 | 2 | Basse |
| 13 | 6 | Moyenne |

**Total: ~55 tables/modifications**
