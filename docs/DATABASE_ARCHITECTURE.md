# NutriSensia - Architecture de la Base de Données Supabase

Ce document décrit l'architecture complète de la base de données Supabase utilisée par NutriSensia. Il sert de référence pour l'implémentation des User Stories définies dans `USER_STORIES.md`.

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Extensions et Utilitaires](#extensions-et-utilitaires)
3. [Types ENUM Personnalisés](#types-enum-personnalisés)
4. [Schéma des Tables](#schéma-des-tables)
   - [Profils et Utilisateurs](#1-profils-et-utilisateurs)
   - [Paramètres Utilisateur](#2-paramètres-utilisateur)
   - [Base de Données Aliments](#3-base-de-données-aliments)
   - [Recettes](#4-recettes)
   - [Rendez-vous](#5-rendez-vous)
   - [Messagerie](#6-messagerie)
   - [Biométrie](#7-biométrie)
   - [Repas](#8-repas)
   - [Plans Alimentaires](#9-plans-alimentaires)
   - [Dossier Patient](#10-dossier-patient)
   - [Listes de Courses](#11-listes-de-courses)
   - [Contenu Exclusif](#12-contenu-exclusif)
   - [Notifications](#13-notifications)
   - [Gamification](#14-gamification)
   - [Inscription Nutritionniste](#15-inscription-nutritionniste)
5. [Fonctions Stockées](#fonctions-stockées)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Mapping User Stories ↔ Tables](#mapping-user-stories--tables)

---

## Vue d'ensemble

### Organisation des Migrations

La base de données est organisée en **14 fichiers de migration** exécutés séquentiellement :

| Fichier | Phase | Description | User Stories |
|---------|-------|-------------|--------------|
| `01_extensions_and_types.sql` | 1 | Extensions PostgreSQL et types ENUM | - |
| `02_patient_nutritionist.sql` | 2 | Profils patients et nutritionnistes | AUTH-* |
| `03_user_settings.sql` | 3 | Paramètres utilisateur | SETTINGS-* |
| `04_foods_database.sql` | 4 | Base de données aliments | MEAL-005, MEAL-006 |
| `05_recipes.sql` | 5 | Recettes et ingrédients | REC-* |
| `06_appointments.sql` | 6 | Rendez-vous et agenda | AGENDA-* |
| `07_messaging.sql` | 7 | Messagerie sécurisée | MSG-* |
| `08_biometrics.sql` | 8 | Suivi biométrique | BIO-* |
| `09_meals_enhanced.sql` | 9 | Gestion des repas | MEAL-*, DASH-001/003 |
| `10_meal_plans_enhanced.sql` | 10 | Plans alimentaires | PLAN-* |
| `11_patient_file.sql` | 11 | Dossier patient | FILE-* |
| `12_shopping_lists.sql` | 12 | Listes de courses | PLAN-006, REC-007/008 |
| `13_exclusive_content.sql` | 13 | Contenu exclusif | CONTENT-* |
| `14_notifications.sql` | 14 | Notifications | NOTIF-*, MSG-007 |
| `15_gamification.sql` | 15 | Gamification (badges, streaks, points) | GAME-001 à GAME-004, DASH-007 |
| `16_schema_harmonization.sql` | 16 | Harmonisation schéma (user_id → patient_id) | - |
| `17_nutritionist_registration.sql` | 17 | Inscription et validation nutritionnistes | AUTH-008 à AUTH-013 |

### Principes Architecturaux

- **UUID** comme clés primaires (`gen_random_uuid()`)
- **Soft delete** avec colonne `deleted_at` sur les tables critiques
- **Row Level Security (RLS)** activé sur toutes les tables
- **Triggers automatiques** pour `updated_at`
- **JSONB** pour les données flexibles (questionnaires, préférences)
- **Relations patient-nutritionniste** comme base du contrôle d'accès

---

## Extensions et Utilitaires

### Extensions PostgreSQL

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-text search (French)
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Fonction Utilitaire

```sql
-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Types ENUM Personnalisés

### Rôles et Statuts Utilisateur

| Type | Valeurs | Description |
|------|---------|-------------|
| `user_role` | `'patient'`, `'nutritionist'`, `'admin'` | Rôle de l'utilisateur |
| `user_status` | `'active'`, `'inactive'`, `'suspended'`, `'pending_verification'` | Statut du compte |
| `gender` | `'male'`, `'female'`, `'other'`, `'prefer_not_to_say'` | Genre |

### Repas et Nutrition

| Type | Valeurs | Description |
|------|---------|-------------|
| `meal_type` | `'breakfast'`, `'lunch'`, `'dinner'`, `'snack'`, `'other'` | Type de repas |
| `meal_context` | `'home'`, `'work'`, `'restaurant'`, `'social'`, `'travel'`, `'other'` | Contexte du repas |
| `food_category` | `'fruits'`, `'vegetables'`, `'proteins'`, `'dairy'`, `'grains'`, `'fats'`, `'beverages'`, `'sweets'`, `'other'` | Catégorie d'aliment |

### Plans Alimentaires

| Type | Valeurs | Description |
|------|---------|-------------|
| `meal_plan_status` | `'draft'`, `'active'`, `'paused'`, `'completed'`, `'archived'` | Statut du plan |
| `adherence_status` | `'followed'`, `'partial'`, `'skipped'`, `'not_tracked'` | Adhérence au plan |
| `modification_request_status` | `'pending'`, `'approved'`, `'rejected'`, `'cancelled'` | Statut demande modification |

### Rendez-vous

| Type | Valeurs | Description |
|------|---------|-------------|
| `appointment_status` | `'pending'`, `'confirmed'`, `'cancelled'`, `'cancelled_by_patient'`, `'cancelled_by_nutritionist'`, `'completed'`, `'no_show'` | Statut RDV |
| `appointment_type` | `'initial'`, `'follow_up'`, `'emergency'`, `'group'` | Type de RDV |
| `consultation_mode` | `'video'`, `'phone'`, `'cabinet'`, `'home'` | Mode consultation |
| `recurrence_type` | `'none'`, `'daily'`, `'weekly'`, `'biweekly'`, `'monthly'` | Récurrence |

### Objectifs et Questionnaires

| Type | Valeurs | Description |
|------|---------|-------------|
| `objective_status` | `'not_started'`, `'in_progress'`, `'on_track'`, `'at_risk'`, `'completed'`, `'abandoned'` | Statut objectif |
| `questionnaire_status` | `'pending'`, `'in_progress'`, `'completed'`, `'expired'` | Statut questionnaire |

### Contenu et Notifications

| Type | Valeurs | Description |
|------|---------|-------------|
| `content_type` | `'article'`, `'video'`, `'guide'`, `'infographic'`, `'podcast'` | Type de contenu |
| `content_status` | `'draft'`, `'published'`, `'archived'` | Statut publication |
| `notification_category` | `'appointment'`, `'message'`, `'plan'`, `'biometric'`, `'content'`, `'system'` | Catégorie notification |
| `notification_priority` | `'low'`, `'normal'`, `'high'`, `'urgent'` | Priorité |

### Gamification

| Type | Valeurs | Description |
|------|---------|-------------|
| `badge_level` | `'bronze'`, `'silver'`, `'gold'`, `'platinum'` | Niveau de badge |
| `streak_type` | `'meal_logging'`, `'weight_logging'`, `'hydration'`, `'plan_adherence'`, `'app_usage'` | Type de streak |

---

## Schéma des Tables

### 1. Profils et Utilisateurs

#### `profiles`
Table principale des utilisateurs, liée à `auth.users` de Supabase.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | ID Supabase Auth |
| `email` | VARCHAR(255) | Email unique |
| `first_name` | VARCHAR(100) | Prénom |
| `last_name` | VARCHAR(100) | Nom |
| `phone` | VARCHAR(20) | Téléphone |
| `avatar_url` | TEXT | URL avatar |
| `role` | user_role | Rôle (patient/nutritionist/admin) |
| `status` | user_status | Statut du compte |
| `email_verified` | BOOLEAN | Email vérifié |
| `phone_verified` | BOOLEAN | Téléphone vérifié |
| `last_login_at` | TIMESTAMPTZ | Dernière connexion |
| `created_at` | TIMESTAMPTZ | Date création |
| `updated_at` | TIMESTAMPTZ | Date modification |

**Index**: `email`, `role`, `status`

---

#### `patient_profiles`
Informations spécifiques aux patients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Lien vers profil |
| `nutritionist_id` | UUID (FK→profiles) | Nutritionniste assigné |
| `date_of_birth` | DATE | Date de naissance |
| `gender` | gender | Genre |
| `height_cm` | DECIMAL(5,2) | Taille en cm |
| `current_weight_kg` | DECIMAL(5,2) | Poids actuel |
| `target_weight_kg` | DECIMAL(5,2) | Poids cible |
| `activity_level` | VARCHAR(20) | Niveau d'activité |
| `dietary_restrictions` | TEXT[] | Restrictions alimentaires |
| `allergies` | TEXT[] | Allergies |
| `health_conditions` | TEXT[] | Conditions de santé |
| `goals` | TEXT[] | Objectifs |
| `preferences` | JSONB | Préférences diverses |
| `onboarding_completed` | BOOLEAN | Onboarding terminé |
| `subscription_status` | VARCHAR(20) | Statut abonnement |
| `subscription_ends_at` | TIMESTAMPTZ | Fin abonnement |

**Index**: `user_id`, `nutritionist_id`, `subscription_status`

---

#### `nutritionist_profiles`
Informations spécifiques aux nutritionnistes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Lien vers profil |
| `title` | VARCHAR(50) | Titre (Dr., etc.) |
| `bio` | TEXT | Biographie |
| `specializations` | TEXT[] | Spécialisations |
| `certifications` | JSONB | Certifications (ASCA, RME) |
| `languages` | TEXT[] | Langues parlées |
| `years_experience` | INTEGER | Années d'expérience |
| `consultation_price` | DECIMAL(8,2) | Prix consultation |
| `currency` | VARCHAR(3) | Devise (CHF) |
| `accepts_new_patients` | BOOLEAN | Accepte nouveaux patients |
| `max_patients` | INTEGER | Capacité max patients |
| `current_patient_count` | INTEGER | Nombre patients actuels |
| `availability` | JSONB | Disponibilités |
| `consultation_modes` | consultation_mode[] | Modes de consultation |
| `is_verified` | BOOLEAN | Vérifié par admin |
| `verified_at` | TIMESTAMPTZ | Date vérification |
| `rating_average` | DECIMAL(3,2) | Note moyenne |
| `rating_count` | INTEGER | Nombre d'avis |

**Index**: `user_id`, `is_verified`, `accepts_new_patients`

---

### 2. Paramètres Utilisateur

#### `user_settings`
Paramètres et préférences utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | UNIQUE |
| `language` | VARCHAR(5) | Langue (fr/en) |
| `timezone` | VARCHAR(50) | Fuseau horaire |
| `date_format` | VARCHAR(20) | Format date |
| `time_format` | VARCHAR(10) | Format heure (12h/24h) |
| `unit_system` | VARCHAR(10) | Système (metric/imperial) |
| `theme` | VARCHAR(10) | Thème (light/dark/system) |
| `daily_calorie_target` | INTEGER | Objectif calories/jour |
| `protein_target_g` | DECIMAL(6,2) | Objectif protéines |
| `carbs_target_g` | DECIMAL(6,2) | Objectif glucides |
| `fat_target_g` | DECIMAL(6,2) | Objectif lipides |
| `water_target_ml` | INTEGER | Objectif eau (ml) |
| `meal_reminders` | JSONB | Rappels repas |
| `weight_reminder_enabled` | BOOLEAN | Rappel pesée |
| `weight_reminder_time` | TIME | Heure rappel pesée |
| `weight_reminder_frequency` | VARCHAR(20) | Fréquence rappel |
| `notifications_enabled` | BOOLEAN | Notifications activées |
| `email_notifications` | BOOLEAN | Notifications email |
| `push_notifications` | BOOLEAN | Notifications push |
| `marketing_emails` | BOOLEAN | Emails marketing |

**Index**: `user_id` (UNIQUE)

---

### 3. Base de Données Aliments

#### `foods`
Base de données des aliments avec valeurs nutritionnelles.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `name_fr` | VARCHAR(200) | Nom français |
| `name_en` | VARCHAR(200) | Nom anglais |
| `description` | TEXT | Description |
| `category` | food_category | Catégorie |
| `subcategory` | VARCHAR(100) | Sous-catégorie |
| `brand` | VARCHAR(100) | Marque (si applicable) |
| `barcode` | VARCHAR(50) | Code-barres |
| `calories_per_100g` | INTEGER | Calories/100g |
| `protein_g` | DECIMAL(6,2) | Protéines/100g |
| `carbs_g` | DECIMAL(6,2) | Glucides/100g |
| `fat_g` | DECIMAL(6,2) | Lipides/100g |
| `fiber_g` | DECIMAL(6,2) | Fibres/100g |
| `sugar_g` | DECIMAL(6,2) | Sucres/100g |
| `sodium_mg` | DECIMAL(8,2) | Sodium/100g |
| `saturated_fat_g` | DECIMAL(6,2) | Graisses saturées |
| `cholesterol_mg` | DECIMAL(8,2) | Cholestérol |
| `vitamins` | JSONB | Vitamines |
| `minerals` | JSONB | Minéraux |
| `glycemic_index` | INTEGER | Index glycémique |
| `allergens` | TEXT[] | Allergènes |
| `image_url` | TEXT | Image |
| `source` | VARCHAR(50) | Source données |
| `is_verified` | BOOLEAN | Vérifié |
| `is_custom` | BOOLEAN | Aliment personnalisé |
| `created_by` | UUID (FK→profiles) | Créateur |

**Index**: `name_fr`, `category`, `barcode`, Full-text search sur nom+description

---

#### `food_portions`
Portions standard pour les aliments.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `food_id` | UUID (FK→foods) | Aliment |
| `name` | VARCHAR(100) | Nom portion (ex: "1 tasse") |
| `weight_g` | DECIMAL(8,2) | Poids en grammes |
| `is_default` | BOOLEAN | Portion par défaut |

---

#### `user_favorite_foods`
Aliments favoris de l'utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| `user_id` | UUID (FK→profiles) | - |
| `food_id` | UUID (FK→foods) | - |
| `created_at` | TIMESTAMPTZ | - |
| PK | (user_id, food_id) | - |

---

#### `user_recent_foods`
Historique des aliments récemment utilisés.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | - |
| `food_id` | UUID (FK→foods) | - |
| `used_at` | TIMESTAMPTZ | Dernière utilisation |
| `usage_count` | INTEGER | Nombre d'utilisations |

---

### 4. Recettes

#### `recipes`
Recettes avec informations nutritionnelles.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `created_by` | UUID (FK→profiles) | Créateur |
| `name` | VARCHAR(200) | Nom recette |
| `description` | TEXT | Description |
| `instructions` | TEXT | Instructions |
| `prep_time_minutes` | INTEGER | Temps préparation |
| `cook_time_minutes` | INTEGER | Temps cuisson |
| `total_time_minutes` | INTEGER | Temps total |
| `servings` | INTEGER | Nombre portions |
| `difficulty` | VARCHAR(20) | Difficulté |
| `cuisine_type` | VARCHAR(50) | Type cuisine |
| `meal_types` | meal_type[] | Types de repas |
| `tags` | TEXT[] | Tags |
| `image_url` | TEXT | Image |
| `video_url` | TEXT | Vidéo |
| `calories_per_serving` | INTEGER | Calories/portion |
| `protein_per_serving` | DECIMAL(6,2) | Protéines/portion |
| `carbs_per_serving` | DECIMAL(6,2) | Glucides/portion |
| `fat_per_serving` | DECIMAL(6,2) | Lipides/portion |
| `dietary_flags` | TEXT[] | Labels (vegan, etc.) |
| `allergens` | TEXT[] | Allergènes |
| `is_public` | BOOLEAN | Publique |
| `is_verified` | BOOLEAN | Vérifiée |
| `view_count` | INTEGER | Nombre vues |
| `save_count` | INTEGER | Nombre sauvegardes |
| `rating_average` | DECIMAL(3,2) | Note moyenne |
| `rating_count` | INTEGER | Nombre avis |

**Index**: `created_by`, `is_public`, `meal_types`, Full-text search

---

#### `recipe_ingredients`
Ingrédients des recettes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `recipe_id` | UUID (FK→recipes) | Recette |
| `food_id` | UUID (FK→foods) | Aliment (optionnel) |
| `name` | VARCHAR(200) | Nom ingrédient |
| `quantity` | VARCHAR(50) | Quantité (texte) |
| `quantity_value` | DECIMAL(8,2) | Valeur numérique |
| `unit` | VARCHAR(30) | Unité |
| `notes` | TEXT | Notes (ex: "coupé en dés") |
| `is_optional` | BOOLEAN | Optionnel |
| `display_order` | INTEGER | Ordre affichage |

---

#### `recipe_steps`
Étapes des recettes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `recipe_id` | UUID (FK→recipes) | Recette |
| `step_number` | INTEGER | Numéro étape |
| `instruction` | TEXT | Instruction |
| `duration_minutes` | INTEGER | Durée |
| `image_url` | TEXT | Image étape |
| `tips` | TEXT | Conseils |

---

#### `user_recipe_saves`
Recettes sauvegardées par l'utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| `user_id` | UUID (FK→profiles) | - |
| `recipe_id` | UUID (FK→recipes) | - |
| `created_at` | TIMESTAMPTZ | - |
| PK | (user_id, recipe_id) | - |

---

### 5. Rendez-vous

#### `appointments`
Rendez-vous entre patients et nutritionnistes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `nutritionist_id` | UUID (FK→profiles) | Nutritionniste |
| `appointment_type` | appointment_type | Type RDV |
| `status` | appointment_status | Statut |
| `mode` | consultation_mode | Mode (vidéo/cabinet) |
| `date` | DATE | Date |
| `start_time` | TIME | Heure début |
| `end_time` | TIME | Heure fin |
| `duration_minutes` | INTEGER | Durée |
| `title` | VARCHAR(200) | Titre |
| `notes` | TEXT | Notes |
| `patient_notes` | TEXT | Notes patient |
| `video_link` | TEXT | Lien vidéo |
| `location` | TEXT | Lieu |
| `price` | DECIMAL(8,2) | Prix |
| `currency` | VARCHAR(3) | Devise |
| `is_paid` | BOOLEAN | Payé |
| `reminder_sent_24h` | BOOLEAN | Rappel 24h envoyé |
| `reminder_sent_1h` | BOOLEAN | Rappel 1h envoyé |
| `cancelled_by` | UUID (FK→profiles) | Annulé par |
| `cancellation_reason` | TEXT | Raison annulation |
| `cancelled_at` | TIMESTAMPTZ | Date annulation |
| `recurrence_rule` | JSONB | Règle récurrence |
| `parent_appointment_id` | UUID (FK→appointments) | RDV parent |

**Index**: `patient_id`, `nutritionist_id`, `date`, `status`

---

#### `nutritionist_availability`
Disponibilités des nutritionnistes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `nutritionist_id` | UUID (FK→profiles) | Nutritionniste |
| `day_of_week` | INTEGER | Jour (0=Dim, 6=Sam) |
| `start_time` | TIME | Heure début |
| `end_time` | TIME | Heure fin |
| `is_available` | BOOLEAN | Disponible |
| `consultation_modes` | consultation_mode[] | Modes acceptés |
| `slot_duration_minutes` | INTEGER | Durée créneaux |

---

#### `availability_exceptions`
Exceptions de disponibilité (vacances, etc.).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `nutritionist_id` | UUID (FK→profiles) | Nutritionniste |
| `date` | DATE | Date |
| `start_time` | TIME | Heure début (optionnel) |
| `end_time` | TIME | Heure fin (optionnel) |
| `is_available` | BOOLEAN | Disponible ce jour |
| `reason` | VARCHAR(200) | Raison |

---

### 6. Messagerie

#### `conversations`
Conversations entre utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `nutritionist_id` | UUID (FK→profiles) | Nutritionniste |
| `last_message_at` | TIMESTAMPTZ | Dernier message |
| `last_message_preview` | VARCHAR(200) | Aperçu dernier msg |
| `patient_unread_count` | INTEGER | Non-lus patient |
| `nutritionist_unread_count` | INTEGER | Non-lus nutritionniste |
| `is_archived_patient` | BOOLEAN | Archivé côté patient |
| `is_archived_nutritionist` | BOOLEAN | Archivé côté nutri |

**Index**: `patient_id`, `nutritionist_id`, `last_message_at`

---

#### `messages`
Messages des conversations.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `conversation_id` | UUID (FK→conversations) | Conversation |
| `sender_id` | UUID (FK→profiles) | Expéditeur |
| `content` | TEXT | Contenu |
| `message_type` | VARCHAR(20) | Type (text/image/file) |
| `attachment_url` | TEXT | Pièce jointe |
| `attachment_name` | VARCHAR(255) | Nom fichier |
| `attachment_size` | INTEGER | Taille fichier |
| `attachment_type` | VARCHAR(50) | Type MIME |
| `is_read` | BOOLEAN | Lu |
| `read_at` | TIMESTAMPTZ | Date lecture |
| `is_deleted_sender` | BOOLEAN | Supprimé expéditeur |
| `is_deleted_recipient` | BOOLEAN | Supprimé destinataire |
| `reply_to_id` | UUID (FK→messages) | Réponse à |

**Index**: `conversation_id`, `sender_id`, `created_at`

---

#### `message_reactions`
Réactions aux messages.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `message_id` | UUID (FK→messages) | Message |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `emoji` | VARCHAR(10) | Emoji |

---

### 7. Biométrie

#### `weight_logs`
Historique de poids.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `weight_kg` | DECIMAL(5,2) | Poids (kg) |
| `date` | DATE | Date (UNIQUE par user) |
| `time` | TIME | Heure |
| `notes` | TEXT | Notes |
| `source` | VARCHAR(30) | Source (manual/device) |

**Index**: `user_id`, `date`

---

#### `body_measurements`
Mensurations corporelles.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `date` | DATE | Date |
| `chest_cm` | DECIMAL(5,2) | Tour poitrine |
| `waist_cm` | DECIMAL(5,2) | Tour taille |
| `hips_cm` | DECIMAL(5,2) | Tour hanches |
| `arm_cm` | DECIMAL(5,2) | Tour bras |
| `thigh_cm` | DECIMAL(5,2) | Tour cuisse |
| `body_fat_percent` | DECIMAL(4,2) | % masse grasse |
| `muscle_mass_kg` | DECIMAL(5,2) | Masse musculaire |
| `notes` | TEXT | Notes |

---

#### `hydration_logs`
Suivi hydratation.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `date` | DATE | Date |
| `amount_ml` | INTEGER | Quantité (ml) |
| `beverage_type` | VARCHAR(50) | Type boisson |
| `logged_at` | TIMESTAMPTZ | Heure |

---

#### `sleep_logs`
Suivi sommeil.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `date` | DATE | Date |
| `bedtime` | TIME | Heure coucher |
| `wake_time` | TIME | Heure réveil |
| `duration_minutes` | INTEGER | Durée |
| `quality` | INTEGER | Qualité (1-5) |
| `notes` | TEXT | Notes |

---

#### `activity_logs`
Suivi activité physique.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `date` | DATE | Date |
| `activity_type` | VARCHAR(50) | Type activité |
| `duration_minutes` | INTEGER | Durée |
| `intensity` | VARCHAR(20) | Intensité |
| `calories_burned` | INTEGER | Calories brûlées |
| `distance_km` | DECIMAL(6,2) | Distance |
| `steps` | INTEGER | Pas |
| `notes` | TEXT | Notes |
| `source` | VARCHAR(30) | Source |

---

#### `biometric_goals`
Objectifs biométriques.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `goal_type` | VARCHAR(30) | Type (weight/steps/etc) |
| `target_value` | DECIMAL(10,2) | Valeur cible |
| `current_value` | DECIMAL(10,2) | Valeur actuelle |
| `unit` | VARCHAR(20) | Unité |
| `start_date` | DATE | Date début |
| `target_date` | DATE | Date cible |
| `status` | objective_status | Statut |
| `achieved_at` | TIMESTAMPTZ | Date atteinte |

---

### 8. Repas

#### `meals`
Repas consommés.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `name` | VARCHAR(200) | Nom |
| `description` | TEXT | Description |
| `meal_type` | meal_type | Type repas |
| `meal_date` | DATE | Date |
| `meal_time` | TIME | Heure |
| `total_calories` | INTEGER | Total calories |
| `total_protein` | DECIMAL(6,2) | Total protéines |
| `total_carbs` | DECIMAL(6,2) | Total glucides |
| `total_fat` | DECIMAL(6,2) | Total lipides |
| `photo_url` | TEXT | Photo |
| `notes` | TEXT | Notes |
| `context` | meal_context | Contexte |
| `location` | VARCHAR(100) | Lieu |
| `hunger_level` | INTEGER (1-5) | Niveau faim |
| `satisfaction_level` | INTEGER (1-5) | Satisfaction |
| `is_planned` | BOOLEAN | Planifié |
| `plan_meal_id` | UUID | Lien plan |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

**Index**: `user_id`, `meal_date`, `meal_type`

---

#### `meal_foods`
Aliments dans un repas.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `meal_id` | UUID (FK→meals) | Repas |
| `food_id` | UUID (FK→foods) | Aliment |
| `custom_name` | VARCHAR(200) | Nom perso si pas food_id |
| `quantity` | DECIMAL(8,2) | Quantité |
| `portion_id` | UUID (FK→food_portions) | Portion |
| `unit` | VARCHAR(30) | Unité |
| `calories` | INTEGER | Calories calculées |
| `protein_g` | DECIMAL(6,2) | Protéines |
| `carbs_g` | DECIMAL(6,2) | Glucides |
| `fat_g` | DECIMAL(6,2) | Lipides |
| `fiber_g` | DECIMAL(6,2) | Fibres |
| `display_order` | INTEGER | Ordre |

**Contrainte**: `food_id IS NOT NULL OR custom_name IS NOT NULL`

---

#### `meal_templates`
Modèles de repas réutilisables.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Propriétaire |
| `name` | VARCHAR(200) | Nom |
| `description` | TEXT | Description |
| `meal_type` | meal_type | Type repas |
| `total_calories` | INTEGER | Total calories |
| `total_protein` | DECIMAL(6,2) | Protéines |
| `total_carbs` | DECIMAL(6,2) | Glucides |
| `total_fat` | DECIMAL(6,2) | Lipides |
| `photo_url` | TEXT | Photo |
| `usage_count` | INTEGER | Utilisations |
| `last_used_at` | TIMESTAMPTZ | Dernière utilisation |

---

#### `meal_template_foods`
Aliments des modèles de repas.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `template_id` | UUID (FK→meal_templates) | Template |
| `food_id` | UUID (FK→foods) | Aliment |
| `custom_name` | VARCHAR(200) | Nom perso |
| `quantity` | DECIMAL(8,2) | Quantité |
| `portion_id` | UUID (FK→food_portions) | Portion |
| `unit` | VARCHAR(30) | Unité |
| `calories` | INTEGER | Calories |
| `protein_g` | DECIMAL(6,2) | Protéines |
| `carbs_g` | DECIMAL(6,2) | Glucides |
| `fat_g` | DECIMAL(6,2) | Lipides |
| `display_order` | INTEGER | Ordre |

---

#### `daily_nutrition_summary`
Résumé nutritionnel quotidien (calculé).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `date` | DATE | Date (UNIQUE par user) |
| `total_calories` | INTEGER | Total calories |
| `total_protein` | DECIMAL(8,2) | Total protéines |
| `total_carbs` | DECIMAL(8,2) | Total glucides |
| `total_fat` | DECIMAL(8,2) | Total lipides |
| `total_fiber` | DECIMAL(8,2) | Total fibres |
| `calorie_goal` | INTEGER | Objectif calories |
| `protein_goal` | DECIMAL(6,2) | Objectif protéines |
| `carbs_goal` | DECIMAL(6,2) | Objectif glucides |
| `fat_goal` | DECIMAL(6,2) | Objectif lipides |
| `breakfast_calories` | INTEGER | Calories petit-déj |
| `lunch_calories` | INTEGER | Calories déjeuner |
| `dinner_calories` | INTEGER | Calories dîner |
| `snack_calories` | INTEGER | Calories collations |
| `meal_count` | INTEGER | Nombre repas |

---

#### `meal_photos`
Photos de repas.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `meal_id` | UUID (FK→meals) | Repas |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `photo_url` | TEXT | URL photo |
| `thumbnail_url` | TEXT | Miniature |
| `width` | INTEGER | Largeur |
| `height` | INTEGER | Hauteur |
| `file_size` | INTEGER | Taille fichier |
| `ai_analysis` | JSONB | Analyse IA |
| `taken_at` | TIMESTAMPTZ | Date prise |

---

### 9. Plans Alimentaires

#### `meal_plans`
Plans alimentaires créés par nutritionnistes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Créateur |
| `patient_id` | UUID (FK→profiles) | Patient |
| `nutritionist_id` | UUID (FK→profiles) | Nutritionniste |
| `name` | VARCHAR(200) | Nom du plan |
| `description` | TEXT | Description |
| `status` | meal_plan_status | Statut |
| `objective` | VARCHAR(200) | Objectif |
| `start_date` | DATE | Date début |
| `end_date` | DATE | Date fin |
| `is_template` | BOOLEAN | Est un template |
| `parent_plan_id` | UUID (FK→meal_plans) | Plan parent |
| `notes` | TEXT | Notes |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

**Index**: `patient_id`, `nutritionist_id`, `status`, `dates`

---

#### `meal_plan_days`
Jours du plan alimentaire.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `meal_plan_id` | UUID (FK→meal_plans) | Plan |
| `day_number` | INTEGER (1-31) | Numéro jour |
| `date` | DATE | Date réelle |
| `day_name` | VARCHAR(20) | Nom (Lundi, etc.) |
| `total_calories` | INTEGER | Total calories jour |
| `total_protein` | DECIMAL(6,2) | Protéines |
| `total_carbs` | DECIMAL(6,2) | Glucides |
| `total_fat` | DECIMAL(6,2) | Lipides |
| `notes` | TEXT | Notes |

**Contrainte**: UNIQUE(meal_plan_id, day_number)

---

#### `meal_plan_meals`
Repas planifiés pour chaque jour.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `plan_day_id` | UUID (FK→meal_plan_days) | Jour |
| `meal_type` | meal_type | Type repas |
| `recipe_id` | UUID (FK→recipes) | Recette |
| `title` | VARCHAR(200) | Titre perso |
| `description` | TEXT | Description |
| `image_url` | TEXT | Image |
| `calories` | INTEGER | Calories |
| `protein_g` | DECIMAL(6,2) | Protéines |
| `carbs_g` | DECIMAL(6,2) | Glucides |
| `fat_g` | DECIMAL(6,2) | Lipides |
| `suggested_time` | TIME | Heure suggérée |
| `servings` | INTEGER | Portions |
| `notes` | TEXT | Notes |
| `display_order` | INTEGER | Ordre |

---

#### `meal_plan_meal_foods`
Aliments spécifiques pour repas planifiés.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `plan_meal_id` | UUID (FK→meal_plan_meals) | Repas planifié |
| `food_id` | UUID (FK→foods) | Aliment |
| `custom_name` | VARCHAR(200) | Nom perso |
| `quantity` | DECIMAL(8,2) | Quantité |
| `unit` | VARCHAR(30) | Unité |
| `calories` | INTEGER | Calories |
| `protein_g` | DECIMAL(6,2) | Protéines |
| `carbs_g` | DECIMAL(6,2) | Glucides |
| `fat_g` | DECIMAL(6,2) | Lipides |
| `display_order` | INTEGER | Ordre |

---

#### `meal_plan_alternatives`
Alternatives suggérées pour repas/aliments.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `plan_meal_id` | UUID (FK→meal_plan_meals) | Repas remplacé |
| `plan_food_id` | UUID (FK→meal_plan_meal_foods) | Aliment remplacé |
| `alternative_recipe_id` | UUID (FK→recipes) | Recette alternative |
| `alternative_food_id` | UUID (FK→foods) | Aliment alternatif |
| `alternative_name` | VARCHAR(200) | Nom alternatif |
| `reason` | TEXT | Raison (sans gluten, etc.) |
| `calories` | INTEGER | Calories |
| `protein_g` | DECIMAL(6,2) | Protéines |
| `carbs_g` | DECIMAL(6,2) | Glucides |
| `fat_g` | DECIMAL(6,2) | Lipides |
| `preference_order` | INTEGER | Ordre préférence |

---

#### `plan_modification_requests`
Demandes de modification du plan par le patient.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `meal_plan_id` | UUID (FK→meal_plans) | Plan |
| `patient_id` | UUID (FK→profiles) | Patient |
| `nutritionist_id` | UUID (FK→profiles) | Nutritionniste |
| `plan_meal_id` | UUID (FK→meal_plan_meals) | Repas concerné |
| `plan_day_id` | UUID (FK→meal_plan_days) | Jour concerné |
| `request_type` | VARCHAR(30) | Type (substitute/remove/add) |
| `title` | VARCHAR(200) | Titre |
| `description` | TEXT | Description |
| `suggested_alternative` | TEXT | Alternative suggérée |
| `status` | modification_request_status | Statut |
| `response` | TEXT | Réponse nutritionniste |
| `responded_at` | TIMESTAMPTZ | Date réponse |
| `responded_by` | UUID (FK→profiles) | Répondu par |

---

#### `plan_adherence`
Suivi de l'adhérence au plan.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `meal_plan_id` | UUID (FK→meal_plans) | Plan |
| `plan_meal_id` | UUID (FK→meal_plan_meals) | Repas planifié |
| `patient_id` | UUID (FK→profiles) | Patient |
| `date` | DATE | Date |
| `status` | adherence_status | Statut (followed/partial/skipped) |
| `actual_meal_id` | UUID (FK→meals) | Repas réel consommé |
| `notes` | TEXT | Notes |

**Contrainte**: UNIQUE(plan_meal_id, date)

---

### 10. Dossier Patient

#### `anamneses`
Questionnaires d'anamnèse avec versioning.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `created_by` | UUID (FK→profiles) | Créé par (nutritionniste) |
| `version` | INTEGER | Numéro version |
| `is_current` | BOOLEAN | Version courante |
| `status` | questionnaire_status | Statut |
| `completed_at` | TIMESTAMPTZ | Date complétion |

---

#### `anamnesis_sections`
Sections de l'anamnèse (données JSONB).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `anamnesis_id` | UUID (FK→anamneses) | Anamnèse |
| `section_id` | VARCHAR(50) | ID section (identite, sante, etc.) |
| `section_label` | VARCHAR(100) | Label |
| `section_icon` | VARCHAR(10) | Icône |
| `fields` | JSONB | Champs [{label, value, type}] |
| `display_order` | INTEGER | Ordre |

**Contrainte**: UNIQUE(anamnesis_id, section_id)

---

#### `consultations`
Consultations effectuées.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `nutritionist_id` | UUID (FK→profiles) | Nutritionniste |
| `appointment_id` | UUID (FK→appointments) | RDV lié |
| `date` | DATE | Date |
| `start_time` | TIME | Heure début |
| `duration_minutes` | INTEGER | Durée |
| `consultation_type` | VARCHAR(50) | Type (Suivi, Bilan) |
| `mode` | consultation_mode | Mode |
| `summary` | TEXT | Résumé |
| `key_points` | TEXT[] | Points clés |
| `next_steps` | TEXT | Prochaines étapes |
| `private_notes` | TEXT | Notes privées (nutri) |
| `attached_document_ids` | UUID[] | Documents liés |

---

#### `follow_up_questionnaires`
Questionnaires de suivi périodiques.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `questionnaire_type` | VARCHAR(30) | Type (suivi/feedback) |
| `title` | VARCHAR(200) | Titre |
| `consultation_id` | UUID (FK→consultations) | Consultation liée |
| `status` | questionnaire_status | Statut |
| `due_date` | DATE | Date limite |
| `completed_at` | TIMESTAMPTZ | Date complétion |
| `questions` | JSONB | Questions [{id, question, type}] |
| `answers` | JSONB | Réponses [{question_id, answer}] |

---

#### `documents`
Documents uploadés (analyses, plans, ressources).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `uploaded_by` | UUID (FK→profiles) | Uploadé par |
| `uploader_type` | VARCHAR(20) | patient/nutritionist |
| `name` | VARCHAR(255) | Nom fichier |
| `file_type` | VARCHAR(20) | Type (pdf/image/doc) |
| `mime_type` | VARCHAR(100) | Type MIME |
| `file_url` | TEXT | URL fichier |
| `file_size` | INTEGER | Taille (bytes) |
| `category` | VARCHAR(50) | Catégorie (Analyses, Plans) |
| `description` | TEXT | Description |
| `thumbnail_url` | TEXT | Miniature |
| `page_count` | INTEGER | Nombre pages (PDF) |
| `consultation_id` | UUID (FK→consultations) | Consultation liée |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

---

#### `patient_objectives`
Objectifs du patient.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `created_by` | UUID (FK→profiles) | Créé par (nutritionniste) |
| `title` | VARCHAR(200) | Titre |
| `description` | TEXT | Description |
| `category` | VARCHAR(50) | Catégorie (Poids, Habitude) |
| `target_value` | VARCHAR(100) | Valeur cible |
| `target_unit` | VARCHAR(30) | Unité |
| `current_value` | VARCHAR(100) | Valeur actuelle |
| `start_value` | VARCHAR(100) | Valeur départ |
| `progress` | INTEGER (0-100) | Progression % |
| `start_date` | DATE | Date début |
| `deadline` | DATE | Échéance |
| `status` | objective_status | Statut |
| `priority` | INTEGER | Priorité (1=haute) |
| `notes` | TEXT | Notes |
| `completed_at` | TIMESTAMPTZ | Date complétion |

---

#### `objective_progress_logs`
Historique de progression des objectifs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `objective_id` | UUID (FK→patient_objectives) | Objectif |
| `progress` | INTEGER (0-100) | Progression |
| `value` | VARCHAR(100) | Valeur |
| `notes` | TEXT | Notes |
| `updated_by` | UUID (FK→profiles) | Mis à jour par |

---

#### `change_reports`
Signalements de changement par le patient.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `anamnesis_section_id` | VARCHAR(50) | Section concernée |
| `change_type` | VARCHAR(50) | Type (health/medication) |
| `title` | VARCHAR(200) | Titre |
| `description` | TEXT | Description |
| `old_value` | TEXT | Ancienne valeur |
| `new_value` | TEXT | Nouvelle valeur |
| `status` | VARCHAR(20) | pending/reviewed/integrated |
| `reviewed_by` | UUID (FK→profiles) | Revu par |
| `reviewed_at` | TIMESTAMPTZ | Date révision |
| `reviewer_notes` | TEXT | Notes réviseur |

---

### 11. Listes de Courses

#### `shopping_lists`
Listes de courses.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Propriétaire |
| `name` | VARCHAR(200) | Nom |
| `description` | TEXT | Description |
| `week_start` | DATE | Début période |
| `week_end` | DATE | Fin période |
| `source_type` | VARCHAR(30) | manual/meal_plan/recipe |
| `source_meal_plan_id` | UUID (FK→meal_plans) | Plan source |
| `is_active` | BOOLEAN | Active |
| `completed_at` | TIMESTAMPTZ | Date complétion |
| `shared_link_token` | VARCHAR(100) | Token partage |
| `shared_link_expires_at` | TIMESTAMPTZ | Expiration partage |

---

#### `shopping_list_categories`
Catégories dans une liste.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `shopping_list_id` | UUID (FK→shopping_lists) | Liste |
| `name` | VARCHAR(100) | Nom (Fruits & Légumes) |
| `icon` | VARCHAR(10) | Icône |
| `color` | VARCHAR(20) | Couleur |
| `display_order` | INTEGER | Ordre |

---

#### `shopping_list_items`
Articles des listes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `shopping_list_id` | UUID (FK→shopping_lists) | Liste |
| `category_id` | UUID (FK→shopping_list_categories) | Catégorie |
| `name` | VARCHAR(200) | Nom article |
| `quantity` | VARCHAR(50) | Quantité (texte) |
| `quantity_value` | DECIMAL(10,2) | Valeur numérique |
| `unit` | VARCHAR(30) | Unité |
| `food_id` | UUID (FK→foods) | Aliment lié |
| `recipe_id` | UUID (FK→recipes) | Recette source |
| `is_checked` | BOOLEAN | Coché |
| `checked_at` | TIMESTAMPTZ | Date cochage |
| `notes` | TEXT | Notes |
| `display_order` | INTEGER | Ordre |

---

### 12. Contenu Exclusif

#### `content_categories`
Catégories de contenu.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `slug` | VARCHAR(50) | Slug unique |
| `name_fr` | VARCHAR(100) | Nom français |
| `name_en` | VARCHAR(100) | Nom anglais |
| `icon` | VARCHAR(50) | Icône |
| `emoji` | VARCHAR(10) | Emoji |
| `color` | VARCHAR(20) | Couleur |
| `description` | TEXT | Description |
| `display_order` | INTEGER | Ordre |
| `is_active` | BOOLEAN | Actif |

**Données initiales**: nutrition-guides, meal-prep, mindful-eating, seasonal-tips, video-tutorials, recipes-exclusive, wellness

---

#### `content_themes`
Thèmes/tags pour le contenu.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `slug` | VARCHAR(50) | Slug unique |
| `name_fr` | VARCHAR(100) | Nom français |
| `name_en` | VARCHAR(100) | Nom anglais |
| `color` | VARCHAR(20) | Couleur |
| `is_active` | BOOLEAN | Actif |

**Données initiales**: weight-loss, muscle-gain, energy-boost, digestion, sleep, stress-management, immunity, beginners

---

#### `exclusive_contents`
Contenus exclusifs (articles, vidéos, guides).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `category_id` | UUID (FK→content_categories) | Catégorie |
| `created_by` | UUID (FK→profiles) | Créateur |
| `title` | VARCHAR(200) | Titre |
| `slug` | VARCHAR(200) | Slug unique |
| `description` | TEXT | Description |
| `content_type` | content_type | article/video/guide/etc |
| `content_body` | TEXT | Contenu markdown |
| `video_url` | TEXT | URL vidéo |
| `audio_url` | TEXT | URL audio |
| `pdf_url` | TEXT | URL PDF |
| `thumbnail_url` | TEXT | Miniature |
| `cover_image_url` | TEXT | Image couverture |
| `duration_minutes` | INTEGER | Durée |
| `theme_ids` | UUID[] | Thèmes |
| `target_conditions` | TEXT[] | Conditions cibles |
| `difficulty_level` | VARCHAR(20) | beginner/intermediate/advanced |
| `view_count` | INTEGER | Nombre vues |
| `save_count` | INTEGER | Sauvegardes |
| `like_count` | INTEGER | Likes |
| `is_premium` | BOOLEAN | Premium |
| `status` | content_status | draft/published/archived |
| `published_at` | TIMESTAMPTZ | Date publication |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

---

#### `content_theme_assignments`
Association contenu-thèmes.

| Colonne | Type | Description |
|---------|------|-------------|
| `content_id` | UUID (FK→exclusive_contents) | - |
| `theme_id` | UUID (FK→content_themes) | - |
| PK | (content_id, theme_id) | - |

---

#### `content_saves`
Contenus sauvegardés par utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | - |
| `content_id` | UUID (FK→exclusive_contents) | - |
| PK | UNIQUE(user_id, content_id) | - |

---

#### `content_views`
Historique de visualisation.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | - |
| `content_id` | UUID (FK→exclusive_contents) | - |
| `progress_percent` | INTEGER (0-100) | Progression |
| `completed` | BOOLEAN | Terminé |
| `completed_at` | TIMESTAMPTZ | Date |
| `first_viewed_at` | TIMESTAMPTZ | Première vue |
| `last_viewed_at` | TIMESTAMPTZ | Dernière vue |
| `view_count` | INTEGER | Nombre vues |

---

#### `learning_paths`
Parcours d'apprentissage.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `created_by` | UUID (FK→profiles) | Créateur |
| `title` | VARCHAR(200) | Titre |
| `slug` | VARCHAR(200) | Slug unique |
| `description` | TEXT | Description |
| `thumbnail_url` | TEXT | Miniature |
| `cover_image_url` | TEXT | Couverture |
| `estimated_hours` | DECIMAL(4,1) | Durée estimée |
| `difficulty_level` | VARCHAR(20) | Difficulté |
| `theme_ids` | UUID[] | Thèmes |
| `enrolled_count` | INTEGER | Inscrits |
| `completion_rate` | DECIMAL(5,2) | Taux complétion |
| `status` | content_status | Statut |
| `published_at` | TIMESTAMPTZ | Publication |

---

#### `learning_path_modules`
Modules des parcours.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `learning_path_id` | UUID (FK→learning_paths) | Parcours |
| `content_id` | UUID (FK→exclusive_contents) | Contenu lié |
| `title` | VARCHAR(200) | Titre perso |
| `description` | TEXT | Description |
| `content_body` | TEXT | Contenu perso |
| `module_number` | INTEGER | Numéro module |
| `display_order` | INTEGER | Ordre |
| `estimated_minutes` | INTEGER | Durée |

---

#### `learning_progress`
Progression dans les parcours.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `learning_path_id` | UUID (FK→learning_paths) | Parcours |
| `current_module_id` | UUID (FK→learning_path_modules) | Module actuel |
| `completed_modules` | INTEGER | Modules complétés |
| `total_modules` | INTEGER | Total modules |
| `progress_percent` | INTEGER (0-100) | Progression |
| `started_at` | TIMESTAMPTZ | Début |
| `completed` | BOOLEAN | Terminé |
| `completed_at` | TIMESTAMPTZ | Date fin |

---

#### `learning_module_completions`
Modules complétés.

| Colonne | Type | Description |
|---------|------|-------------|
| `user_id` | UUID (FK→profiles) | - |
| `module_id` | UUID (FK→learning_path_modules) | - |
| `completed_at` | TIMESTAMPTZ | - |
| PK | (user_id, module_id) | - |

---

### 13. Notifications

#### `notification_types`
Types de notifications système.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `code` | VARCHAR(50) | Code unique |
| `name_fr` | VARCHAR(100) | Nom français |
| `name_en` | VARCHAR(100) | Nom anglais |
| `category` | notification_category | Catégorie |
| `title_template_fr` | VARCHAR(200) | Template titre FR |
| `title_template_en` | VARCHAR(200) | Template titre EN |
| `body_template_fr` | TEXT | Template corps FR |
| `body_template_en` | TEXT | Template corps EN |
| `icon` | VARCHAR(50) | Icône |
| `color` | VARCHAR(20) | Couleur |
| `priority` | notification_priority | Priorité |
| `default_channels` | TEXT[] | Canaux par défaut |
| `is_active` | BOOLEAN | Actif |

**Types prédéfinis**: appointment_reminder_24h, appointment_reminder_1h, appointment_confirmed, appointment_cancelled, new_message, new_meal_plan, weight_goal_reached, welcome, etc.

---

#### `notifications`
Notifications utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Destinataire |
| `notification_type_id` | UUID (FK→notification_types) | Type |
| `notification_code` | VARCHAR(50) | Code type |
| `title` | VARCHAR(200) | Titre |
| `body` | TEXT | Corps |
| `icon` | VARCHAR(50) | Icône |
| `data` | JSONB | Données additionnelles |
| `action_url` | TEXT | URL action |
| `action_label` | VARCHAR(50) | Label bouton |
| `priority` | notification_priority | Priorité |
| `is_read` | BOOLEAN | Lue |
| `read_at` | TIMESTAMPTZ | Date lecture |
| `is_dismissed` | BOOLEAN | Fermée |
| `dismissed_at` | TIMESTAMPTZ | Date fermeture |
| `channels_sent` | TEXT[] | Canaux utilisés |
| `email_sent_at` | TIMESTAMPTZ | Email envoyé |
| `push_sent_at` | TIMESTAMPTZ | Push envoyé |
| `scheduled_for` | TIMESTAMPTZ | Programmée pour |
| `sent_at` | TIMESTAMPTZ | Envoyée à |
| `expires_at` | TIMESTAMPTZ | Expiration |

---

#### `notification_preferences`
Préférences de notification par utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `notification_type_id` | UUID (FK→notification_types) | Type spécifique |
| `notification_category` | notification_category | Ou catégorie |
| `in_app_enabled` | BOOLEAN | In-app activé |
| `email_enabled` | BOOLEAN | Email activé |
| `push_enabled` | BOOLEAN | Push activé |
| `sms_enabled` | BOOLEAN | SMS activé |
| `quiet_hours_start` | TIME | Début heures calmes |
| `quiet_hours_end` | TIME | Fin heures calmes |
| `frequency` | VARCHAR(20) | Fréquence (realtime/daily) |

---

#### `push_subscriptions`
Abonnements push.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `user_id` | UUID (FK→profiles) | Utilisateur |
| `endpoint` | TEXT | Endpoint unique |
| `p256dh_key` | TEXT | Clé p256dh |
| `auth_key` | TEXT | Clé auth |
| `device_type` | VARCHAR(30) | web/ios/android |
| `device_name` | VARCHAR(100) | Nom appareil |
| `user_agent` | TEXT | User agent |
| `is_active` | BOOLEAN | Actif |
| `last_used_at` | TIMESTAMPTZ | Dernière utilisation |

---

### 14. Gamification

#### `badge_categories`
Catégories de badges.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `slug` | VARCHAR(50) | Slug unique |
| `name_fr` | VARCHAR(100) | Nom français |
| `name_en` | VARCHAR(100) | Nom anglais |
| `description_fr` | TEXT | Description FR |
| `description_en` | TEXT | Description EN |
| `icon` | VARCHAR(50) | Icône |
| `color` | VARCHAR(20) | Couleur |
| `display_order` | INTEGER | Ordre affichage |

**Catégories initiales**: nutrition, activity, consistency, social, milestones

---

#### `badges`
Badges disponibles avec conditions de déblocage.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `category_id` | UUID (FK→badge_categories) | Catégorie |
| `slug` | VARCHAR(50) | Slug unique |
| `name_fr` | VARCHAR(100) | Nom français |
| `name_en` | VARCHAR(100) | Nom anglais |
| `description_fr` | TEXT | Description FR |
| `description_en` | TEXT | Description EN |
| `level` | badge_level | bronze/silver/gold/platinum |
| `icon` | VARCHAR(50) | Icône |
| `icon_locked` | VARCHAR(50) | Icône verrouillée |
| `points_value` | INTEGER | Points gagnés |
| `unlock_condition` | JSONB | Conditions de déblocage |
| `is_secret` | BOOLEAN | Badge secret |
| `is_active` | BOOLEAN | Actif |
| `display_order` | INTEGER | Ordre |

**Index**: `category_id`, `slug`, `level`

---

#### `patient_badges`
Badges débloqués par les patients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `badge_id` | UUID (FK→badges) | Badge |
| `unlocked_at` | TIMESTAMPTZ | Date déblocage |
| `progress` | INTEGER (0-100) | Progression avant déblocage |
| `notified` | BOOLEAN | Notification envoyée |

**Contrainte**: UNIQUE(patient_id, badge_id)

---

#### `streaks`
Suivi des séries d'activités consécutives.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `streak_type` | streak_type | Type de streak |
| `current_count` | INTEGER | Jours consécutifs actuels |
| `longest_count` | INTEGER | Record personnel |
| `last_activity_date` | DATE | Dernière activité |
| `started_at` | DATE | Début de la série |
| `broken_count` | INTEGER | Nombre de fois cassé |

**Contrainte**: UNIQUE(patient_id, streak_type)

---

#### `weekly_objectives`
Objectifs hebdomadaires pour les patients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `week_start` | DATE | Début semaine (lundi) |
| `objectives` | JSONB | Liste des objectifs |
| `completed_count` | INTEGER | Objectifs complétés |
| `total_count` | INTEGER | Total objectifs |
| `bonus_points` | INTEGER | Points bonus gagnés |

**Structure JSONB objectives**: `[{id, title, description, target, current, completed, points}]`

**Contrainte**: UNIQUE(patient_id, week_start)

---

#### `patient_points`
Points et niveau des patients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient (UNIQUE) |
| `total_points` | INTEGER | Total points cumulés |
| `current_level` | INTEGER | Niveau actuel |
| `points_to_next_level` | INTEGER | Points pour prochain niveau |
| `weekly_points` | INTEGER | Points cette semaine |
| `monthly_points` | INTEGER | Points ce mois |

---

#### `points_history`
Historique des transactions de points.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `patient_id` | UUID (FK→profiles) | Patient |
| `points` | INTEGER | Points (+/-) |
| `action_type` | VARCHAR(50) | Type d'action |
| `action_reference_id` | UUID | Référence (meal_id, etc.) |
| `description` | TEXT | Description |
| `created_at` | TIMESTAMPTZ | Date |

**Index**: `patient_id`, `created_at`

---

### 15. Inscription Nutritionniste

#### Extensions de `nutritionist_profiles`
Colonnes ajoutées pour le workflow d'inscription (AUTH-008 à AUTH-013).

| Colonne | Type | Description |
|---------|------|-------------|
| `status` | VARCHAR(20) | 'pending', 'active', 'rejected', 'info_required', 'suspended' |
| `rejection_reason` | TEXT | Motif de rejet |
| `validated_at` | TIMESTAMPTZ | Date validation admin |
| `validated_by` | UUID (FK→profiles) | Admin validateur |
| `info_request_message` | TEXT | Message demande d'info |
| `info_response` | TEXT | Réponse du nutritionniste |
| `info_responded_at` | TIMESTAMPTZ | Date réponse |
| `asca_number` | VARCHAR(50) | Numéro ASCA |
| `rme_number` | VARCHAR(50) | Numéro RME |
| `years_experience` | INTEGER | Années d'expérience |
| `languages` | TEXT[] | Langues parlées |

**Index**: `status`, `pending` (partiel sur created_at)

---

#### `nutritionist_documents`
Documents uploadés pour vérification.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | - |
| `nutritionist_id` | UUID (FK→nutritionist_profiles) | Nutritionniste |
| `type` | VARCHAR(30) | 'asca_certificate', 'rme_certificate', 'diploma', 'photo', 'other' |
| `file_name` | VARCHAR(255) | Nom fichier |
| `file_url` | TEXT | URL fichier |
| `file_size` | INTEGER | Taille (bytes) |
| `mime_type` | VARCHAR(100) | Type MIME |
| `description` | TEXT | Description |
| `verified` | BOOLEAN | Vérifié par admin |
| `verified_at` | TIMESTAMPTZ | Date vérification |
| `verified_by` | UUID (FK→profiles) | Admin vérificateur |
| `verification_notes` | TEXT | Notes vérification |
| `created_at` | TIMESTAMPTZ | Date création |
| `updated_at` | TIMESTAMPTZ | Date modification |

**Index**: `nutritionist_id`, `(nutritionist_id, type)`

**RLS**: Nutritionnistes voient leurs propres documents, admins voient tout

---

## Fonctions Stockées

### Utilitaires

| Fonction | Description |
|----------|-------------|
| `update_updated_at()` | Trigger: met à jour automatiquement `updated_at` |

### Repas et Nutrition

| Fonction | Description | User Story |
|----------|-------------|------------|
| `calculate_meal_totals(meal_id)` | Recalcule les totaux nutritionnels d'un repas | MEAL-* |
| `calculate_meal_food_nutrition()` | Trigger: calcule les valeurs nutritionnelles d'un aliment | MEAL-* |
| `update_daily_nutrition_summary(user_id, date)` | Met à jour le résumé quotidien | DASH-001 |
| `create_meal_from_template(template_id, user_id, date, time)` | Crée un repas depuis un template | MEAL-012 |
| `get_nutrition_summary(user_id, start_date, end_date)` | Récupère le résumé d'une période | DASH-001 |

### Plans Alimentaires

| Fonction | Description | User Story |
|----------|-------------|------------|
| `calculate_plan_day_totals(day_id)` | Recalcule les totaux d'un jour de plan | PLAN-* |
| `duplicate_meal_plan(plan_id, new_patient_id, new_name)` | Duplique un plan alimentaire | PLAN-* |
| `get_plan_adherence_stats(plan_id, start_date, end_date)` | Statistiques d'adhérence | PLAN-007 |
| `get_active_meal_plan(patient_id)` | Récupère le plan actif d'un patient | PLAN-001 |

### Dossier Patient

| Fonction | Description | User Story |
|----------|-------------|------------|
| `create_anamnesis_version(patient_id, created_by)` | Crée une nouvelle version d'anamnèse | FILE-001 |
| `get_current_anamnesis(patient_id)` | Récupère l'anamnèse courante | FILE-001 |
| `get_patient_file_summary(patient_id)` | Résumé du dossier patient | FILE-* |
| `export_patient_file(patient_id)` | Exporte le dossier en JSON | FILE-007 |

### Listes de Courses

| Fonction | Description | User Story |
|----------|-------------|------------|
| `generate_shopping_list_from_plan(user_id, meal_plan_id, list_name)` | Génère une liste depuis un plan | PLAN-006 |
| `add_recipe_to_shopping_list(list_id, recipe_id)` | Ajoute les ingrédients d'une recette | REC-007 |
| `get_shopping_list_progress(list_id)` | Progression de la liste | REC-008 |
| `generate_shopping_list_share_link(list_id, expires_in_days)` | Génère un lien de partage | REC-008 |

### Contenu Exclusif

| Fonction | Description | User Story |
|----------|-------------|------------|
| `increment_content_view(user_id, content_id)` | Incrémente le compteur de vues | CONTENT-002 |
| `update_learning_progress(user_id, module_id)` | Met à jour la progression parcours | CONTENT-007 |
| `get_recommended_content(user_id, limit)` | Contenu recommandé | CONTENT-* |

### Notifications

| Fonction | Description | User Story |
|----------|-------------|------------|
| `create_notification(user_id, type_code, data, scheduled_for)` | Crée une notification | NOTIF-* |
| `mark_notifications_read(user_id, notification_ids)` | Marque comme lues | NOTIF-002 |
| `get_unread_notification_count(user_id)` | Compte les non-lues | NOTIF-001 |
| `cleanup_old_notifications(days_read, days_unread)` | Nettoie les anciennes | - |

### Gamification

| Fonction | Description | User Story |
|----------|-------------|------------|
| `update_streak(patient_id, streak_type)` | Met à jour une série (streak) | GAME-002 |
| `add_points(patient_id, points, action_type, reference_id, description)` | Ajoute des points | GAME-001 |
| `update_user_level(patient_id)` | Recalcule le niveau utilisateur | GAME-001 |
| `unlock_badge(patient_id, badge_slug)` | Débloquer un badge | GAME-003 |
| `create_weekly_objectives(patient_id, week_start)` | Créer les objectifs hebdomadaires | DASH-007 |
| `check_badge_conditions(patient_id)` | Vérifie les conditions de badges | GAME-003 |
| `get_patient_gamification_stats(patient_id)` | Statistiques gamification complètes | GAME-* |

### Validation Nutritionniste

| Fonction | Description | User Story |
|----------|-------------|------------|
| `validate_nutritionist_registration(nutritionist_id, admin_id)` | Valide une inscription | AUTH-010 |
| `reject_nutritionist_registration(nutritionist_id, admin_id, reason)` | Rejette avec motif | AUTH-010 |
| `request_nutritionist_info(nutritionist_id, admin_id, message)` | Demande d'informations | AUTH-010 |
| `respond_to_info_request(nutritionist_id, response)` | Réponse nutritionniste | AUTH-011 |
| `get_my_nutritionist_status()` | Statut inscription (user connecté) | AUTH-012 |
| `get_pending_registrations_count()` | Compte inscriptions en attente (admin) | AUTH-010 |

---

## Row Level Security (RLS)

Toutes les tables ont RLS activé. Les politiques suivent ces principes:

### Accès Personnel
```sql
-- L'utilisateur peut accéder à ses propres données
user_id = auth.uid()
```

### Accès Nutritionniste-Patient
```sql
-- Le nutritionniste peut accéder aux données de ses patients
EXISTS (
    SELECT 1 FROM patient_profiles pp
    WHERE pp.user_id = table.user_id
    AND pp.nutritionist_id = auth.uid()
)
```

### Accès Admin
```sql
-- Les admins ont accès à tout
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

### Contenu Public
```sql
-- Contenu publié accessible à tous les authentifiés
status = 'published' AND deleted_at IS NULL
```

---

## Mapping User Stories ↔ Tables

| Epic | User Stories | Tables Principales |
|------|--------------|-------------------|
| **AUTH** | AUTH-001 à AUTH-013 | `profiles`, `patient_profiles`, `nutritionist_profiles`, `nutritionist_documents` |
| **DASH** | DASH-001 à DASH-007 | `meals`, `daily_nutrition_summary`, `meal_plans`, `weekly_objectives` |
| **GAME** | GAME-001 à GAME-004 | `badges`, `patient_badges`, `streaks`, `patient_points`, `points_history` |
| **MEAL** | MEAL-001 à MEAL-016 | `meals`, `meal_foods`, `meal_templates`, `foods` |
| **PLAN** | PLAN-001 à PLAN-007 | `meal_plans`, `meal_plan_days`, `meal_plan_meals`, `plan_adherence` |
| **BIO** | BIO-001 à BIO-008 | `weight_logs`, `body_measurements`, `hydration_logs`, `biometric_goals` |
| **MSG** | MSG-001 à MSG-007 | `conversations`, `messages`, `message_reactions` |
| **AGENDA** | AGENDA-001 à AGENDA-008 | `appointments`, `nutritionist_availability` |
| **FILE** | FILE-001 à FILE-007 | `anamneses`, `consultations`, `documents`, `patient_objectives` |
| **REC** | REC-001 à REC-008 | `recipes`, `recipe_ingredients`, `shopping_lists` |
| **CONTENT** | CONTENT-001 à CONTENT-008 | `exclusive_contents`, `learning_paths`, `content_views` |
| **NOTIF** | NOTIF-001 à NOTIF-006 | `notifications`, `notification_preferences` |

---

## Diagramme des Relations Principales

```
                    ┌─────────────┐
                    │   profiles  │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │   patient   │ │nutritionist │ │    admin    │
    │  _profiles  │ │  _profiles  │ │             │
    └──────┬──────┘ └──────┬──────┘ └─────────────┘
           │               │
           │    ┌──────────┴──────────┐
           │    │                     │
    ┌──────▼────▼─┐           ┌───────▼──────┐
    │ meal_plans  │◄──────────│ appointments │
    └──────┬──────┘           └───────┬──────┘
           │                          │
    ┌──────▼──────┐           ┌───────▼──────┐
    │meal_plan    │           │consultations │
    │   _days     │           └───────┬──────┘
    └──────┬──────┘                   │
           │                   ┌──────▼──────┐
    ┌──────▼──────┐            │  anamneses  │
    │meal_plan    │            └─────────────┘
    │  _meals     │
    └─────────────┘

    ┌─────────────┐           ┌─────────────┐
    │   meals     │◄──────────│   foods     │
    └──────┬──────┘           └──────┬──────┘
           │                         │
    ┌──────▼──────┐           ┌──────▼──────┐
    │ meal_foods  │           │  recipes    │
    └─────────────┘           └─────────────┘
```

---

## Notes d'Implémentation

### Convention de Nommage (Harmonisation Schéma)

Suite à la migration `16_schema_harmonization.sql`, les tables spécifiques aux patients utilisent `patient_id` au lieu de `user_id` pour plus de clarté:

| Ancienne table | Nouvelle table | Colonne renommée |
|----------------|----------------|------------------|
| `user_badges` | `patient_badges` | `user_id` → `patient_id` |
| `user_points` | `patient_points` | `user_id` → `patient_id` |
| `streaks` | - | `user_id` → `patient_id` |
| `weekly_objectives` | - | `user_id` → `patient_id` |
| `points_history` | - | `user_id` → `patient_id` |

**Note**: Les tables partagées (`profiles`, `user_settings`, etc.) conservent `user_id`.

---

### Création d'un Nouveau Patient
1. Créer un enregistrement dans `profiles` avec `role = 'patient'`
2. Créer un enregistrement dans `patient_profiles` lié
3. Créer un enregistrement dans `user_settings` avec les valeurs par défaut
4. Envoyer la notification de bienvenue via `create_notification()`

### Création d'un Plan Alimentaire
1. Créer le `meal_plan` avec `status = 'draft'`
2. Ajouter les `meal_plan_days` pour chaque jour
3. Ajouter les `meal_plan_meals` pour chaque repas
4. Optionnellement ajouter les `meal_plan_meal_foods` et `meal_plan_alternatives`
5. Passer le statut à `'active'` et notifier le patient

### Suivi de l'Adhérence
1. Pour chaque repas consommé, créer un `plan_adherence` avec le statut approprié
2. Utiliser `get_plan_adherence_stats()` pour afficher les statistiques
3. Le nutritionniste peut consulter l'adhérence via la relation patient-nutritionniste

---

*Document généré automatiquement - Dernière mise à jour: 25 Janvier 2026*
