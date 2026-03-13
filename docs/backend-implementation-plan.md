# Plan d'implémentation Backend - NutriSensia Dashboard Patient

**Date de création :** 2026-01-29
**Approche :** Séquentielle (Option A)
**Objectif :** Implémenter l'intégration backend Supabase pour toutes les features du Dashboard Patient

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Phase 1 : Epic 3 - Repas (MEAL)](#phase-1--epic-3---repas-meal) ✅
- [Phase 2 : Epic 5 - Suivi Biométrique (BIO)](#phase-2--epic-5---suivi-biométrique-bio) ✅
- [Phase 3 : Epic 7 - Agenda & Epic 8 - Messagerie](#phase-3--epic-7---agenda--epic-8---messagerie) ✅
- [Phase 4 : Epic 6 - Objectifs & Dashboard](#phase-4--epic-6---objectifs--dashboard) ✅
- [Phase 5 : Dossier Médical (FILE)](#phase-5--dossier-médical-file)
- [Phase 6 : Profil Patient (PROF)](#phase-6--profil-patient-prof)
- [Phase 7 : Notifications (NOTIF)](#phase-7--notifications-notif)
- [Phase 8 : Plan Alimentaire (PLAN)](#phase-8--plan-alimentaire-plan)
- [Phase 9 : Recettes & Base d'Aliments (REC/FOOD)](#phase-9--recettes--base-daliments-recfood)
- [Phase 10 : Contenu Éducatif (CONTENT)](#phase-10--contenu-éducatif-content)
- [Matrice de dépendances](#matrice-de-dépendances)
- [Checklist de validation](#checklist-de-validation)

---

## Vue d'ensemble

### Statistiques globales

| Métrique | Valeur |
|----------|--------|
| **Phases** | 10 (4 complétées + 6 nouvelles) |
| **Modules backend** | 23 |
| **Endpoints API à créer** | ~95 (+ 2 enrichis avec Open Food Facts) |
| **Tables Supabase existantes** | 45+ (+ 1 cache OFF à créer) |
| **API externe** | Open Food Facts v2 (recherche hybride, Phase 9) |
| **Stories frontend déjà implémentées** | ~60 |
| **Pages patient utilisant encore des mocks** | 8 (sur 12) |

### Statut des phases

| Phase | Scope | Statut | Impact |
|-------|-------|--------|--------|
| Phase 1 | Epic 3 - Repas (MEAL) | ✅ **COMPLÉTÉ** | DASH-001, DASH-003 |
| Phase 2 | Epic 5 - Suivi Biométrique (BIO) | ✅ **COMPLÉTÉ** | DASH-002, DASH-004 |
| Phase 3 | Epic 7 - Agenda & Epic 8 - Messagerie | ✅ **COMPLÉTÉ** | DASH-005, DASH-006 |
| Phase 4 | Epic 6 - Objectifs & Dashboard | ✅ **COMPLÉTÉ** | DASH-007 |
| Phase 5 | Dossier Médical (FILE) | 🔲 À faire | Onglets anamnèse, questionnaires, documents, consultations |
| Phase 6 | Profil Patient (PROF) | 🔲 À faire | Page profil, sécurité, préférences, badges |
| Phase 7 | Notifications (NOTIF) | 🔲 À faire | Centre de notifications, préférences, triggers |
| Phase 8 | Plan Alimentaire (PLAN) | 🔲 À faire | Plan hebdo, liste de courses, demandes de modification |
| Phase 9 | Recettes & Base d'Aliments (REC/FOOD) | 🔲 À faire | Catalogue recettes, base d'aliments hybride (interne + Open Food Facts), favoris, scanner |
| Phase 10 | Contenu Éducatif (CONTENT) | 🔲 À faire | Articles, vidéos, guides, parcours d'apprentissage |

### Impact sur le Dashboard (Epic 2) - ✅ COMPLÉTÉ

| Phase | Stories Dashboard impactées | Fonctionnalité débloquée | Statut |
|-------|----------------------------|--------------------------|--------|
| Phase 1 | DASH-001, DASH-003 | Nutrition quotidienne + Boutons repas rapides | ✅ Fait |
| Phase 2 | DASH-002, DASH-004 | Hydratation + Progression hebdomadaire | ✅ Fait |
| Phase 3 | DASH-005, DASH-006 | Prochain RDV + Messages non lus | ✅ Fait |
| Phase 4 | DASH-007 | Objectifs hebdomadaires | ✅ Fait |

### Impact sur les pages dédiées (Phases 5-10)

| Phase | Page patient | Mock actuel | Éléments impactés |
|-------|-------------|-------------|-------------------|
| Phase 5 | `/dashboard/patient/dossier` | `mock-dossier.ts` (4 fonctions) | Onglets anamnèse, questionnaires, documents, consultations |
| Phase 6 | `/dashboard/patient/profil` | `mock-profile.ts` + `mock-gamification.ts` | 8 sections profil + BadgesSection |
| Phase 7 | `/dashboard/patient/notifications` | `mock-notifications.ts` | Liste, filtres, actions, préférences |
| Phase 8 | `/dashboard/patient/plan` | `mock-meal-plan.ts` (8 fonctions) | Plan jour/semaine, courses, modifications |
| Phase 9 | `/dashboard/patient/recettes` + `/aliments` | `mock-recipes.ts` + `mock-foods-database.ts` | Catalogue, favoris, recherche, scanner |
| Phase 10 | `/dashboard/patient/contenu` | `mock-content.ts` (4 constantes) | Articles, vidéos, parcours, favoris |

### Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  Dashboard Patient + Pages dédiées (Repas, Suivi, etc.)    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              API Routes (/api/protected/*)                  │
│  • Validation (Zod schemas)                                 │
│  • Authentication (Supabase Auth)                           │
│  • Business logic                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Backend                            │
│  • PostgreSQL (15 tables)                                   │
│  • Row Level Security (RLS)                                 │
│  • Real-time subscriptions                                  │
│  • Storage (photos de repas, documents)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Prérequis

### Avant de commencer toutes les phases

#### 1. Vérification de la base de données Supabase

**Tâche :** Confirmer que tous les schémas sont migrés et fonctionnels

**Fichiers SQL à vérifier :**
- `database/01_auth_setup.sql` - Auth & Profiles
- `database/02_nutritionist_profiles.sql` - Profils nutritionnistes
- `database/03_patients.sql` - Profils patients
- `database/06_appointments.sql` - Rendez-vous
- `database/07_messaging.sql` - Messagerie
- `database/08_biometrics.sql` - Données biométriques
- `database/09_meals_enhanced.sql` - Repas & nutrition
- `database/10_meal_plans.sql` - Plans alimentaires
- `database/11_recipes.sql` - Recettes
- `database/12_food_database.sql` - Base d'aliments
- `database/15_gamification.sql` - Objectifs & badges
- `database/16_schema_harmonization.sql` - RLS policies

**Commandes de vérification :**
```bash
# Se connecter à Supabase
psql "$SUPABASE_DB_URL"

# Vérifier les tables existantes
\dt

# Vérifier les RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies;

# Tester une requête simple
SELECT id, email, role FROM profiles LIMIT 5;
```

**Critères de validation :**
- [ ] Toutes les tables listées existent
- [ ] RLS est activé sur toutes les tables
- [ ] Policies permettent lecture/écriture selon les rôles
- [ ] Relations (foreign keys) sont valides

---

#### 2. Configuration des variables d'environnement

**Fichier :** `.env.local`

**Variables requises :**
```env
# Supabase (Obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Script de validation :**
```bash
npm run validate-env
```

---

#### 3. Création de la structure API de base

**Dossier :** `/src/app/api/protected/`

**Structure à créer :**
```
src/app/api/protected/
├── meals/              # Phase 1
├── biometrics/         # Phase 2
├── appointments/       # Phase 3
├── conversations/      # Phase 3
├── objectives/         # Phase 4
└── dashboard/          # Phase 4 (agrégations)
```

**Middleware d'authentification :**

Créer `/src/lib/api-middleware.ts` :
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    return handler(req, session.user.id);
  };
}
```

**Critères de validation :**
- [ ] Dossiers API créés
- [ ] Middleware d'auth fonctionne (test avec route dummy)
- [ ] Erreur 401 si non authentifié

---

#### 4. Schémas de validation Zod

**Fichier à créer :** `/src/lib/api-schemas.ts`

**Schémas de base :**
```typescript
import { z } from 'zod';

// Repas
export const mealSchema = z.object({
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  consumed_at: z.string().datetime(),
  notes: z.string().optional(),
  location: z.string().optional(),
  photo_url: z.string().url().optional(),
});

export const mealFoodSchema = z.object({
  food_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.enum(['g', 'ml', 'portion']),
});

// Hydratation
export const hydrationLogSchema = z.object({
  amount_ml: z.number().positive().max(5000),
  beverage_type: z.enum(['water', 'tea', 'coffee', 'juice', 'other']).optional(),
  notes: z.string().optional(),
});

// Poids
export const weightEntrySchema = z.object({
  weight_kg: z.number().positive().max(500),
  measured_at: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Objectifs
export const objectiveUpdateSchema = z.object({
  current: z.number(),
  isCompleted: z.boolean().optional(),
});
```

**Critères de validation :**
- [ ] Schémas créés pour toutes les entités principales
- [ ] Validation testée avec données valides/invalides

---

## Phase 1 : Epic 3 - Repas (MEAL)

**Durée estimée :** 1 semaine
**Priorité :** Haute (Must Have)
**Impact Dashboard :** DASH-001, DASH-003

### Vue d'ensemble

Cette phase implémente toute la gestion des repas :
- Enregistrement de repas avec aliments
- Recherche d'aliments
- Scan code-barres
- Historique et statistiques
- Génération du résumé nutritionnel quotidien

**Frontend déjà implémenté :**
- Page `/dashboard/patient/repas` (MEAL-001 à MEAL-016) ✅
- Composants de saisie, recherche, scan ✅

**Tables Supabase utilisées :**
- `meals` - Repas enregistrés
- `meal_foods` - Aliments par repas
- `daily_nutrition_summary` - Résumé journalier
- `food_items` - Base d'aliments
- `favorite_foods` - Aliments favoris

---

### Module 1.1 : CRUD Repas

#### Endpoint 1.1.1 : Créer un repas

**Route :** `POST /api/protected/meals`

**Frontend appelant :**
- `src/app/[locale]/dashboard/patient/repas/page.tsx` (ligne 316 - drawer d'ajout)

**Request body :**
```typescript
{
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  consumed_at: '2026-01-29T08:30:00Z',
  notes?: string,
  location?: 'home' | 'work' | 'restaurant' | 'other',
  photo_url?: string,
  foods: [
    {
      food_id: 'uuid',
      quantity: 100,
      unit: 'g'
    }
  ]
}
```

**Response :**
```typescript
{
  id: 'uuid',
  user_id: 'uuid',
  type: 'breakfast',
  consumed_at: '2026-01-29T08:30:00Z',
  total_calories: 450,
  total_protein: 25,
  total_carbs: 60,
  total_fat: 12,
  notes: 'Repas équilibré',
  location: 'home',
  photo_url: null,
  created_at: '2026-01-29T08:31:00Z',
  foods: [
    {
      food_id: 'uuid',
      food_name: 'Flocons d\'avoine',
      quantity: 100,
      unit: 'g',
      calories: 389,
      protein: 13.2,
      carbs: 66.3,
      fat: 6.9
    }
  ]
}
```

**Logique métier :**
1. Valider le body avec `mealSchema`
2. Vérifier que l'utilisateur est authentifié (middleware)
3. Pour chaque aliment :
   - Récupérer les infos nutritionnelles depuis `food_items`
   - Calculer les valeurs pour la quantité donnée
4. Insérer dans `meals` avec totaux calculés
5. Insérer chaque aliment dans `meal_foods`
6. Déclencher le recalcul de `daily_nutrition_summary` (trigger ou function)
7. Retourner le repas complet avec aliments

**Fichier à créer :** `/src/app/api/protected/meals/route.ts`

**Code squelette :**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { mealSchema } from '@/lib/api-schemas';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Parse & validate
    const body = await req.json();
    const validated = mealSchema.parse(body);

    // TODO: Calculate nutrition totals
    // TODO: Insert meal
    // TODO: Insert meal_foods
    // TODO: Trigger daily_nutrition_summary update

    return NextResponse.json({ meal: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating meal:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du repas' },
      { status: 500 }
    );
  }
}
```

**Tests à effectuer :**
- [ ] Création avec 1 aliment → Success 201
- [ ] Création avec 5 aliments → Success 201
- [ ] Totaux nutritionnels correctement calculés
- [ ] `daily_nutrition_summary` mis à jour
- [ ] Erreur 400 si body invalide
- [ ] Erreur 401 si non authentifié
- [ ] Erreur 404 si food_id n'existe pas

---

#### Endpoint 1.1.2 : Lister les repas

**Route :** `GET /api/protected/meals?date=2026-01-29&type=breakfast`

**Query params :**
- `date` (optional) - Format YYYY-MM-DD
- `type` (optional) - breakfast | lunch | dinner | snack
- `limit` (optional) - Default 50
- `offset` (optional) - Default 0

**Response :**
```typescript
{
  meals: [
    {
      id: 'uuid',
      type: 'breakfast',
      consumed_at: '2026-01-29T08:30:00Z',
      total_calories: 450,
      total_protein: 25,
      total_carbs: 60,
      total_fat: 12,
      food_count: 3,
      has_photo: false,
      location: 'home'
    }
  ],
  total: 12,
  limit: 50,
  offset: 0
}
```

**Logique métier :**
1. Parser les query params
2. Construire la requête avec filtres
3. Joindre `meal_foods` pour compter les aliments
4. Retourner les repas triés par `consumed_at DESC`

**Fichier :** `/src/app/api/protected/meals/route.ts` (export GET)

**Tests à effectuer :**
- [ ] Liste tous les repas sans filtre
- [ ] Filtre par date fonctionne
- [ ] Filtre par type fonctionne
- [ ] Pagination fonctionne
- [ ] Tri chronologique inversé
- [ ] Erreur 401 si non authentifié

---

#### Endpoint 1.1.3 : Détail d'un repas

**Route :** `GET /api/protected/meals/[id]`

**Response :**
```typescript
{
  id: 'uuid',
  user_id: 'uuid',
  type: 'breakfast',
  consumed_at: '2026-01-29T08:30:00Z',
  total_calories: 450,
  total_protein: 25,
  total_carbs: 60,
  total_fat: 12,
  notes: 'Repas équilibré',
  location: 'home',
  photo_url: null,
  created_at: '2026-01-29T08:31:00Z',
  updated_at: '2026-01-29T08:31:00Z',
  foods: [
    {
      id: 'uuid',
      food_id: 'uuid',
      food_name: 'Flocons d\'avoine',
      brand: 'Migros Bio',
      quantity: 100,
      unit: 'g',
      calories: 389,
      protein: 13.2,
      carbs: 66.3,
      fat: 6.9,
      fiber: 10.6
    }
  ]
}
```

**Logique métier :**
1. Récupérer le repas par ID
2. Vérifier que `user_id` = session.user.id (sécurité)
3. Joindre `meal_foods` et `food_items`
4. Retourner le détail complet

**Fichier :** `/src/app/api/protected/meals/[id]/route.ts`

**Tests à effectuer :**
- [ ] Détail complet avec tous les aliments
- [ ] Erreur 404 si ID invalide
- [ ] Erreur 403 si repas d'un autre utilisateur
- [ ] Erreur 401 si non authentifié

---

#### Endpoint 1.1.4 : Modifier un repas

**Route :** `PATCH /api/protected/meals/[id]`

**Request body :**
```typescript
{
  type?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  consumed_at?: '2026-01-29T09:00:00Z',
  notes?: string,
  location?: string,
  photo_url?: string,
  foods?: [
    {
      food_id: 'uuid',
      quantity: 120,
      unit: 'g'
    }
  ]
}
```

**Logique métier :**
1. Vérifier ownership du repas
2. Si `foods` fourni, supprimer les anciens `meal_foods` et recréer
3. Recalculer les totaux nutritionnels
4. Mettre à jour `meals`
5. Recalculer `daily_nutrition_summary`
6. Retourner le repas mis à jour

**Fichier :** `/src/app/api/protected/meals/[id]/route.ts` (export PATCH)

**Tests à effectuer :**
- [ ] Modification des notes seulement
- [ ] Modification des aliments (totaux recalculés)
- [ ] `daily_nutrition_summary` mis à jour
- [ ] Erreur 403 si repas d'un autre utilisateur

---

#### Endpoint 1.1.5 : Supprimer un repas

**Route :** `DELETE /api/protected/meals/[id]`

**Response :**
```typescript
{
  success: true,
  message: 'Repas supprimé avec succès'
}
```

**Logique métier :**
1. Vérifier ownership
2. Supprimer les `meal_foods` (CASCADE)
3. Supprimer le `meal`
4. Recalculer `daily_nutrition_summary`

**Fichier :** `/src/app/api/protected/meals/[id]/route.ts` (export DELETE)

**Tests à effectuer :**
- [ ] Suppression réussie
- [ ] `meal_foods` supprimés (CASCADE)
- [ ] `daily_nutrition_summary` mis à jour
- [ ] Erreur 403 si repas d'un autre utilisateur

---

### Module 1.2 : Résumé nutritionnel quotidien

#### Endpoint 1.2.1 : Résumé du jour

**Route :** `GET /api/protected/meals/daily-summary?date=2026-01-29`

**Frontend appelant :**
- Dashboard (`DASH-001`)
- Page Repas (sidebar résumé - `MEAL-005`)

**Response :**
```typescript
{
  date: '2026-01-29',
  total_calories: 1850,
  calorie_goal: 2100,
  calorie_remaining: 250,
  total_protein: 95,
  protein_goal: 120,
  total_carbs: 220,
  carbs_goal: 250,
  total_fat: 62,
  fat_goal: 70,
  meals: {
    breakfast: { calories: 450, logged: true },
    lunch: { calories: 650, logged: true },
    dinner: { calories: 750, logged: true },
    snack: { calories: 0, logged: false }
  },
  meal_count: 3,
  adherence_percent: 88,
  last_updated: '2026-01-29T20:30:00Z'
}
```

**Logique métier :**
1. Parser la date (default = today)
2. Query `daily_nutrition_summary` pour cette date
3. Si n'existe pas, calculer depuis `meals` et créer l'entrée
4. Récupérer les objectifs depuis le plan alimentaire actif ou paramètres utilisateur
5. Calculer `calorie_remaining`, `adherence_percent`
6. Retourner le résumé complet

**Fichier :** `/src/app/api/protected/meals/daily-summary/route.ts`

**Tests à effectuer :**
- [ ] Résumé correct pour une journée avec repas
- [ ] Création auto si n'existe pas
- [ ] Objectifs récupérés depuis le plan actif
- [ ] Adhérence calculée correctement
- [ ] Date par défaut = aujourd'hui

---

#### Endpoint 1.2.2 : Vérifier l'état des repas du jour

**Route :** `GET /api/protected/meals/check?date=2026-01-29`

**Frontend appelant :**
- Dashboard (`DASH-003` - Boutons repas rapides)

**Response :**
```typescript
{
  date: '2026-01-29',
  breakfast: true,
  lunch: true,
  dinner: false,
  snack: false
}
```

**Logique métier :**
1. Parser la date (default = today)
2. Query `meals` avec filtre sur date et user_id
3. Grouper par type
4. Retourner boolean par type

**Fichier :** `/src/app/api/protected/meals/check/route.ts`

**Tests à effectuer :**
- [ ] État correct pour chaque type de repas
- [ ] Date par défaut = aujourd'hui
- [ ] False si aucun repas du type

---

### Module 1.3 : Base d'aliments

#### Endpoint 1.3.1 : Rechercher des aliments

**Route :** `GET /api/protected/foods/search?q=avoine&limit=20`

**Query params :**
- `q` (required) - Terme de recherche (min 2 caractères)
- `category` (optional) - Filtrer par catégorie
- `limit` (optional) - Default 20

**Response :**
```typescript
{
  foods: [
    {
      id: 'uuid',
      name: 'Flocons d\'avoine',
      brand: 'Migros Bio',
      category: 'Céréales',
      calories_per_100g: 389,
      protein_per_100g: 13.2,
      carbs_per_100g: 66.3,
      fat_per_100g: 6.9,
      fiber_per_100g: 10.6,
      common_portions: [
        { name: '1 bol', grams: 50 },
        { name: '1 portion', grams: 80 }
      ],
      is_favorite: false
    }
  ],
  total: 5
}
```

**Logique métier :**
1. Valider que `q` a minimum 2 caractères
2. Full-text search sur `name` et `brand`
3. Joindre avec `favorite_foods` pour déterminer `is_favorite`
4. Ordonner par pertinence, favoris en premier
5. Limiter les résultats

**Fichier :** `/src/app/api/protected/foods/search/route.ts`

**Tests à effectuer :**
- [ ] Recherche fonctionne (tolérance aux fautes)
- [ ] Favoris affichés en premier
- [ ] Filtre par catégorie fonctionne
- [ ] Erreur 400 si q < 2 caractères

---

#### Endpoint 1.3.2 : Détail d'un aliment

**Route :** `GET /api/protected/foods/[id]`

**Response :**
```typescript
{
  id: 'uuid',
  name: 'Flocons d\'avoine',
  brand: 'Migros Bio',
  category: 'Céréales',
  barcode: '7610200012345',
  calories_per_100g: 389,
  protein_per_100g: 13.2,
  carbs_per_100g: 66.3,
  fat_per_100g: 6.9,
  fiber_per_100g: 10.6,
  sugar_per_100g: 1.2,
  sodium_per_100mg: 5,
  common_portions: [
    { name: '1 bol', grams: 50 },
    { name: '1 portion', grams: 80 }
  ],
  is_favorite: false,
  last_used_at: '2026-01-28T12:00:00Z'
}
```

**Fichier :** `/src/app/api/protected/foods/[id]/route.ts`

**Tests à effectuer :**
- [ ] Détail complet avec tous les nutriments
- [ ] `is_favorite` correct
- [ ] `last_used_at` depuis l'historique utilisateur
- [ ] Erreur 404 si ID invalide

---

#### Endpoint 1.3.3 : Scan code-barres

**Route :** `GET /api/protected/foods/barcode/[barcode]`

**Response :**
```typescript
{
  found: true,
  food: {
    id: 'uuid',
    name: 'Müesli Bio',
    brand: 'Migros Bio',
    barcode: '7610200012345',
    calories_per_100g: 380,
    protein_per_100g: 10,
    carbs_per_100g: 65,
    fat_per_100g: 8
  }
}
```

**Logique métier :**
1. Rechercher dans `food_items` par `barcode`
2. Si trouvé, retourner l'aliment
3. Si non trouvé, retourner `{ found: false }`

**Fichier :** `/src/app/api/protected/foods/barcode/[barcode]/route.ts`

**Tests à effectuer :**
- [ ] Trouvé si barcode existe
- [ ] `found: false` si n'existe pas
- [ ] Format barcode validé (EAN-13)

---

#### Endpoint 1.3.4 : Aliments favoris

**Route :** `GET /api/protected/foods/favorites`

**Response :**
```typescript
{
  favorites: [
    {
      id: 'uuid',
      name: 'Banane',
      category: 'Fruits',
      calories_per_100g: 89,
      last_used_at: '2026-01-28T12:00:00Z',
      usage_count: 45
    }
  ]
}
```

**Logique métier :**
1. Query `favorite_foods` WHERE `user_id` = session.user.id
2. Joindre avec `food_items`
3. Ordonner par `last_used_at DESC`

**Fichier :** `/src/app/api/protected/foods/favorites/route.ts`

---

#### Endpoint 1.3.5 : Ajouter/Supprimer favori

**Route :** `POST /api/protected/foods/[id]/favorite`
**Route :** `DELETE /api/protected/foods/[id]/favorite`

**Response :**
```typescript
{
  is_favorite: true
}
```

**Logique métier :**
- POST : Insérer dans `favorite_foods`
- DELETE : Supprimer de `favorite_foods`

**Fichier :** `/src/app/api/protected/foods/[id]/favorite/route.ts`

---

### Module 1.4 : Intégration Frontend

#### Tâche 1.4.1 : Remplacer les données mockées

**Fichier :** `/src/app/[locale]/dashboard/patient/repas/page.tsx`

**Changements :**
1. Supprimer `mockMeals`, `mockDailyNutrition` (lignes 497-526)
2. Créer des hooks React Query :

```typescript
// hooks/useMeals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useMeals(date?: string) {
  return useQuery({
    queryKey: ['meals', date],
    queryFn: () => fetch(`/api/protected/meals?date=${date}`).then(r => r.json())
  });
}

export function useDailySummary(date?: string) {
  return useQuery({
    queryKey: ['daily-summary', date],
    queryFn: () => fetch(`/api/protected/meals/daily-summary?date=${date}`).then(r => r.json())
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meal) => fetch('/api/protected/meals', {
      method: 'POST',
      body: JSON.stringify(meal)
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['meals']);
      queryClient.invalidateQueries(['daily-summary']);
    }
  });
}
```

3. Utiliser les hooks dans le composant :

```typescript
const { data: meals, isLoading } = useMeals(selectedDate);
const { data: summary } = useDailySummary(selectedDate);
const createMeal = useCreateMeal();
```

**Tests à effectuer :**
- [ ] Liste des repas chargée depuis l'API
- [ ] Résumé nutritionnel chargé depuis l'API
- [ ] Création de repas fonctionne
- [ ] Invalidation du cache après création
- [ ] Loading states affichés
- [ ] Messages d'erreur gérés

---

#### Tâche 1.4.2 : Intégration Dashboard

**Fichier :** `/src/app/[locale]/dashboard/patient/page.tsx`

**Changements (lignes 816-891) :**
1. Remplacer `mockDailyNutrition` par `useDailySummary()`
2. Remplacer `mockMeals` par `useMealsCheck()` pour DASH-003

```typescript
const { data: nutrition, isLoading: loadingNutrition } = useDailySummary();
const { data: mealsCheck } = useMealsCheck();
```

3. Mettre à jour le rendu des composants :

```typescript
// DASH-001 (lignes 1200+)
{loadingNutrition ? (
  <Skeleton className="h-32" />
) : (
  <DailyNutritionCard nutrition={nutrition} />
)}

// DASH-003 (boutons repas)
<MealButton
  type="breakfast"
  isLogged={mealsCheck?.breakfast}
  onClick={() => openMealDrawer('breakfast')}
/>
```

**Tests à effectuer :**
- [ ] Dashboard affiche les vraies données
- [ ] Loading states pour chaque section
- [ ] Boutons repas ont le bon état (logged/non-logged)
- [ ] Clic ouvre le drawer d'ajout

---

### Critères de validation Phase 1

**Backend :**
- [ ] Tous les endpoints CRUD repas fonctionnent
- [ ] Résumé nutritionnel calculé correctement
- [ ] Recherche d'aliments performante (< 500ms)
- [ ] Scan code-barres fonctionne
- [ ] Favoris gérés correctement
- [ ] RLS policies testées (utilisateur ne voit que ses repas)
- [ ] Triggers `daily_nutrition_summary` fonctionnent

**Frontend :**
- [ ] Page Repas utilise les API (plus de mock)
- [ ] Dashboard DASH-001 et DASH-003 fonctionnels
- [ ] Création/modification/suppression de repas OK
- [ ] Messages d'erreur affichés si API fail
- [ ] Loading states partout

**Performance :**
- [ ] Liste des repas < 500ms
- [ ] Résumé quotidien < 300ms
- [ ] Recherche d'aliments < 500ms
- [ ] Création de repas < 1s

---

## Phase 2 : Epic 5 - Suivi Biométrique (BIO)

**Durée estimée :** 1 semaine
**Priorité :** Haute (Must Have pour hydratation, Should Have pour le reste)
**Impact Dashboard :** DASH-002, DASH-004

### Vue d'ensemble

Cette phase implémente le suivi des données biométriques :
- Hydratation quotidienne (Must Have - BIO-008)
- Poids (BIO-001, BIO-002, BIO-003)
- Mensurations (BIO-004)
- Bien-être quotidien (BIO-005)
- Activité physique (BIO-007)
- Progression hebdomadaire (BIO-004)

**Frontend déjà implémenté :**
- Page `/dashboard/patient/suivi` ✅
- Composants de saisie ✅

**Tables Supabase utilisées :**
- `hydration_logs`
- `hydration_goals`
- `weight_entries`
- `weight_goals`
- `body_measurements`
- `wellness_logs`
- `activity_logs`

---

### Module 2.1 : Hydratation (BIO-008)

#### Endpoint 2.1.1 : Hydratation du jour

**Route :** `GET /api/protected/biometrics/hydration/today`

**Frontend appelant :**
- Dashboard (`DASH-002`)
- Page Suivi biométrique

**Response :**
```typescript
{
  date: '2026-01-29',
  current_ml: 1500,
  goal_ml: 2000,
  remaining_ml: 500,
  percent: 75,
  logs: [
    {
      id: 'uuid',
      amount_ml: 250,
      beverage_type: 'water',
      logged_at: '2026-01-29T08:30:00Z'
    },
    {
      id: 'uuid',
      amount_ml: 500,
      beverage_type: 'tea',
      logged_at: '2026-01-29T10:15:00Z'
    }
  ]
}
```

**Logique métier :**
1. Récupérer tous les `hydration_logs` pour aujourd'hui
2. Sommer les `amount_ml`
3. Récupérer le `daily_goal_ml` depuis `hydration_goals`
4. Calculer `remaining_ml` et `percent`
5. Retourner avec liste chronologique des logs

**Fichier :** `/src/app/api/protected/biometrics/hydration/today/route.ts`

**Tests à effectuer :**
- [ ] Somme correcte des logs du jour
- [ ] Objectif récupéré correctement
- [ ] Logs triés chronologiquement
- [ ] Gestion si aucun log (current_ml = 0)

---

#### Endpoint 2.1.2 : Ajouter un log d'hydratation

**Route :** `POST /api/protected/biometrics/hydration/logs`

**Request body :**
```typescript
{
  amount_ml: 250,
  beverage_type?: 'water' | 'tea' | 'coffee' | 'juice' | 'other',
  notes?: string
}
```

**Response :**
```typescript
{
  id: 'uuid',
  user_id: 'uuid',
  amount_ml: 250,
  beverage_type: 'water',
  logged_at: '2026-01-29T14:30:00Z',
  created_at: '2026-01-29T14:30:00Z'
}
```

**Logique métier :**
1. Valider avec `hydrationLogSchema`
2. Insérer dans `hydration_logs` avec `logged_at = NOW()`
3. Retourner le log créé

**Fichier :** `/src/app/api/protected/biometrics/hydration/logs/route.ts`

**Tests à effectuer :**
- [ ] Création réussie
- [ ] Validation des valeurs (max 5000ml)
- [ ] Beverage type par défaut = 'water'
- [ ] Timestamp auto

---

#### Endpoint 2.1.3 : Objectif d'hydratation

**Route :** `GET /api/protected/biometrics/hydration/goals`

**Response :**
```typescript
{
  daily_goal_ml: 2000,
  valid_from: '2026-01-01',
  valid_until: null
}
```

**Fichier :** `/src/app/api/protected/biometrics/hydration/goals/route.ts`

---

#### Endpoint 2.1.4 : Modifier objectif d'hydratation

**Route :** `PATCH /api/protected/biometrics/hydration/goals`

**Request body :**
```typescript
{
  daily_goal_ml: 2500
}
```

**Logique métier :**
1. Invalider l'objectif actuel (`valid_until = NOW()`)
2. Créer un nouvel objectif avec `valid_from = NOW()`

**Fichier :** `/src/app/api/protected/biometrics/hydration/goals/route.ts` (export PATCH)

---

#### Endpoint 2.1.5 : Historique hebdomadaire hydratation

**Route :** `GET /api/protected/biometrics/hydration/weekly`

**Response :**
```typescript
{
  days: [
    { date: '2026-01-23', total_ml: 1800, goal_ml: 2000, percent: 90 },
    { date: '2026-01-24', total_ml: 2100, goal_ml: 2000, percent: 105 },
    // ... 7 jours
  ],
  average_ml: 1950,
  goal_ml: 2000,
  days_reached_goal: 4
}
```

**Logique métier :**
1. Récupérer les logs des 7 derniers jours
2. Grouper par date et sommer
3. Calculer les statistiques

**Fichier :** `/src/app/api/protected/biometrics/hydration/weekly/route.ts`

---

### Module 2.2 : Poids (BIO-001, BIO-002, BIO-003)

#### Endpoint 2.2.1 : Enregistrer un poids

**Route :** `POST /api/protected/biometrics/weight`

**Request body :**
```typescript
{
  weight_kg: 75.2,
  measured_at?: '2026-01-29T07:00:00Z',
  notes?: string
}
```

**Response :**
```typescript
{
  id: 'uuid',
  user_id: 'uuid',
  weight_kg: 75.2,
  measured_at: '2026-01-29T07:00:00Z',
  variation_kg: -0.3,
  notes: null,
  created_at: '2026-01-29T07:05:00Z'
}
```

**Logique métier :**
1. Valider avec `weightEntrySchema`
2. Récupérer la dernière entrée pour calculer `variation_kg`
3. Insérer dans `weight_entries`
4. Retourner avec variation

**Fichier :** `/src/app/api/protected/biometrics/weight/route.ts`

**Tests à effectuer :**
- [ ] Création avec variation calculée
- [ ] Première entrée (variation = null)
- [ ] Date par défaut = NOW()
- [ ] Validation max 500kg

---

#### Endpoint 2.2.2 : Historique du poids

**Route :** `GET /api/protected/biometrics/weight?period=3months`

**Query params :**
- `period` (optional) - 1week | 1month | 3months | 6months | all

**Response :**
```typescript
{
  entries: [
    {
      id: 'uuid',
      weight_kg: 75.2,
      measured_at: '2026-01-29',
      variation_kg: -0.3
    }
  ],
  current_weight_kg: 75.2,
  goal_weight_kg: 70,
  start_weight_kg: 80,
  total_lost_kg: 4.8,
  remaining_kg: 5.2,
  average_weekly_loss_kg: 0.5,
  trend: 'descending'
}
```

**Logique métier :**
1. Récupérer les entrées selon la période
2. Récupérer l'objectif depuis `weight_goals`
3. Calculer les statistiques (total perdu, moyenne, tendance)
4. Retourner les données pour le graphique

**Fichier :** `/src/app/api/protected/biometrics/weight/route.ts` (export GET)

**Tests à effectuer :**
- [ ] Filtrage par période fonctionne
- [ ] Statistiques calculées correctement
- [ ] Tendance détectée (moyenne mobile)
- [ ] Gestion si aucune entrée

---

#### Endpoint 2.2.3 : Objectif de poids

**Route :** `GET /api/protected/biometrics/weight/goal`
**Route :** `PATCH /api/protected/biometrics/weight/goal`

**GET Response :**
```typescript
{
  goal_weight_kg: 70,
  target_date: '2026-06-30',
  weekly_goal_kg: 0.5,
  created_at: '2026-01-01'
}
```

**PATCH Request :**
```typescript
{
  goal_weight_kg: 68,
  target_date: '2026-12-31',
  weekly_goal_kg: 0.3
}
```

**Fichier :** `/src/app/api/protected/biometrics/weight/goal/route.ts`

---

### Module 2.3 : Progression hebdomadaire (DASH-004)

#### Endpoint 2.3.1 : Progression hebdomadaire complète

**Route :** `GET /api/protected/biometrics/weekly-progress`

**Frontend appelant :**
- Dashboard (`DASH-004`)

**Response :**
```typescript
{
  week_start: '2026-01-27',
  week_end: '2026-02-02',

  // Streak
  meal_streak_days: 7,
  longest_streak: 14,

  // Poids
  weight: {
    current_kg: 75.2,
    week_start_kg: 75.8,
    change_kg: -0.6,
    entries: [
      { date: '2026-01-27', weight_kg: 75.8 },
      { date: '2026-01-28', weight_kg: 75.5 },
      // ... 7 jours
    ]
  },

  // Nutrition
  nutrition: {
    avg_calories: 2050,
    goal_calories: 2100,
    adherence_percent: 88,
    meals_logged: 18,
    meals_expected: 21
  },

  // Hydratation
  hydration: {
    avg_ml: 1900,
    goal_ml: 2000,
    days_reached_goal: 5
  },

  // Activité
  activity: {
    sessions: 3,
    total_minutes: 150,
    calories_burned: 450
  },

  // Comparaison semaine précédente
  comparison: {
    calories_diff: +50,
    weight_diff: -0.4,
    activity_diff: +1
  }
}
```

**Logique métier :**
1. Calculer les dates de la semaine en cours (lundi-dimanche)
2. **Meal Streak :**
   - Query `meals` pour compter les jours consécutifs avec au moins 1 repas
   - Algorithme : itérer depuis aujourd'hui vers le passé, s'arrêter au premier jour sans repas
   - Calculer le longest streak historique
3. **Poids :**
   - Récupérer les 7 dernières entrées
   - Calculer la variation depuis le début de semaine
4. **Nutrition :**
   - Query `daily_nutrition_summary` pour les 7 derniers jours
   - Calculer moyenne calories
   - Calculer adhérence (meals_logged / meals_expected)
5. **Hydratation :**
   - Query `hydration_logs` pour les 7 derniers jours
   - Compter les jours ayant atteint l'objectif
6. **Activité :**
   - Query `activity_logs` pour la semaine
   - Sommer minutes et calories
7. **Comparaison :**
   - Même calculs pour la semaine précédente
   - Calculer les différences

**Fichier :** `/src/app/api/protected/biometrics/weekly-progress/route.ts`

**Tests à effectuer :**
- [ ] Toutes les sections calculées correctement
- [ ] Streak calculé précisément
- [ ] Comparaison semaine précédente exacte
- [ ] Gestion des données manquantes
- [ ] Performance < 1s (plusieurs queries)

---

### Module 2.4 : Autres biométries

#### Endpoint 2.4.1 : Mensurations (BIO-004)

**Route :** `POST /api/protected/biometrics/measurements`
**Route :** `GET /api/protected/biometrics/measurements`

**POST Request :**
```typescript
{
  chest_cm: 95,
  waist_cm: 85,
  hips_cm: 100,
  thigh_cm: 60,
  arm_cm: 35,
  measured_at?: '2026-01-29'
}
```

**GET Response :**
```typescript
{
  entries: [
    {
      id: 'uuid',
      measured_at: '2026-01-29',
      chest_cm: 95,
      waist_cm: 85,
      variations: {
        chest: -1,
        waist: -2,
        hips: -1.5
      }
    }
  ]
}
```

**Fichier :** `/src/app/api/protected/biometrics/measurements/route.ts`

---

#### Endpoint 2.4.2 : Bien-être quotidien (BIO-005)

**Route :** `POST /api/protected/biometrics/wellness`
**Route :** `GET /api/protected/biometrics/wellness?date=2026-01-29`

**POST Request :**
```typescript
{
  date: '2026-01-29',
  energy_level: 4,
  sleep_hours: 7.5,
  mood: 'good',
  digestion_tags: ['normal'],
  notes?: string
}
```

**Fichier :** `/src/app/api/protected/biometrics/wellness/route.ts`

---

#### Endpoint 2.4.3 : Activité physique (BIO-007)

**Route :** `POST /api/protected/biometrics/activity`
**Route :** `GET /api/protected/biometrics/activity?period=1week`

**POST Request :**
```typescript
{
  activity_type: 'running',
  duration_minutes: 30,
  intensity: 'moderate',
  calories_burned?: 250,
  notes?: string,
  performed_at?: '2026-01-29T18:00:00Z'
}
```

**Fichier :** `/src/app/api/protected/biometrics/activity/route.ts`

---

### Module 2.5 : Intégration Frontend

#### Tâche 2.5.1 : Remplacer les données mockées (Suivi)

**Fichier :** `/src/app/[locale]/dashboard/patient/suivi/page.tsx`

**Créer les hooks :**
```typescript
// hooks/useBiometrics.ts
export function useHydrationToday() { /* ... */ }
export function useAddHydrationLog() { /* ... */ }
export function useWeightHistory(period: string) { /* ... */ }
export function useWeeklyProgress() { /* ... */ }
```

**Tests à effectuer :**
- [ ] Page Suivi utilise les API
- [ ] Ajout d'eau met à jour l'UI instantanément
- [ ] Graphique poids chargé depuis l'API
- [ ] Progression hebdomadaire affichée

---

#### Tâche 2.5.2 : Intégration Dashboard

**Fichier :** `/src/app/[locale]/dashboard/patient/page.tsx`

**Changements :**
```typescript
const { data: hydration } = useHydrationToday();
const { data: weeklyProgress } = useWeeklyProgress();

// DASH-002 (lignes ~1400+)
<HydrationCard hydration={hydration} />

// DASH-004 (lignes ~1600+)
<WeeklyProgressCard progress={weeklyProgress} />
```

**Tests à effectuer :**
- [ ] Dashboard DASH-002 fonctionnel (hydratation)
- [ ] Dashboard DASH-004 fonctionnel (progression)
- [ ] Ajout d'eau depuis le dashboard met à jour
- [ ] Streak affiché correctement

---

### Critères de validation Phase 2

**Backend :**
- [ ] Hydratation : logs, objectifs, historique OK
- [ ] Poids : enregistrement, historique, graphique OK
- [ ] Progression hebdomadaire : toutes les métriques calculées
- [ ] Meal streak calculé correctement
- [ ] Mensurations et bien-être fonctionnels
- [ ] Performance < 1s pour weekly-progress

**Frontend :**
- [ ] Page Suivi utilise les API
- [ ] Dashboard DASH-002 et DASH-004 fonctionnels
- [ ] Ajout d'eau en temps réel
- [ ] Graphiques affichés correctement

---

## Phase 3 : Epic 7 - Agenda & Epic 8 - Messagerie

**Durée estimée :** 1 semaine
**Priorité :** Haute (Must Have)
**Impact Dashboard :** DASH-005, DASH-006

### Vue d'ensemble

Cette phase implémente :
- **Epic 7 - Agenda** : Gestion des rendez-vous (prise, modification, annulation, visio)
- **Epic 8 - Messagerie** : Conversations avec nutritionniste (envoi messages, photos, documents, indicateurs de lecture)

**Frontend déjà implémenté :**
- Page `/dashboard/patient/agenda` (AGENDA-001 à AGENDA-010) ✅
- Page `/dashboard/patient/messagerie` (MSG-001 à MSG-010) ⚠️

**Tables Supabase utilisées :**
- `appointments`
- `consultation_types`
- `conversations`
- `messages`
- `nutritionist_profiles`

---

### Module 3.1 : Rendez-vous (AGENDA)

#### Endpoint 3.1.1 : Prochain rendez-vous

**Route :** `GET /api/protected/appointments/next`

**Frontend appelant :**
- Dashboard (`DASH-005`)

**Response :**
```typescript
{
  id: 'uuid',
  scheduled_at: '2026-02-05T14:00:00Z',
  scheduled_end_at: '2026-02-05T15:00:00Z',
  type: {
    id: 'uuid',
    name: 'Consultation de suivi',
    duration_minutes: 60,
    price_chf: 120
  },
  mode: 'visio',
  status: 'confirmed',
  nutritionist: {
    id: 'uuid',
    first_name: 'Dr. Sophie',
    last_name: 'Martin',
    initials: 'SM',
    photo_url: null
  },
  video_link: 'https://meet.jitsi.si/nutrisensia-abc123',
  patient_notes: 'Questions sur les glucides',
  countdown_days: 7
}
```

**Logique métier :**
1. Query `appointments` avec :
   - `patient_id = session.user.id`
   - `status IN ('pending', 'confirmed')`
   - `scheduled_at >= NOW()`
   - `ORDER BY scheduled_at ASC LIMIT 1`
2. JOIN avec `consultation_types` et `nutritionist_profiles`
3. Calculer `countdown_days`
4. Retourner le prochain RDV

**Fichier :** `/src/app/api/protected/appointments/next/route.ts`

**Tests à effectuer :**
- [ ] Retourne le bon prochain RDV
- [ ] Null si aucun RDV futur
- [ ] Countdown calculé correctement
- [ ] Nutritionist details inclus

---

#### Endpoint 3.1.2 : Liste des rendez-vous

**Route :** `GET /api/protected/appointments?filter=upcoming`

**Query params :**
- `filter` (optional) - upcoming | past | all
- `limit` (optional) - Default 50
- `offset` (optional) - Default 0

**Response :**
```typescript
{
  appointments: [
    {
      id: 'uuid',
      scheduled_at: '2026-02-05T14:00:00Z',
      type: { name: 'Suivi', duration_minutes: 60 },
      mode: 'visio',
      status: 'confirmed',
      nutritionist: { first_name: 'Dr. Sophie', last_name: 'Martin' }
    }
  ],
  total: 12,
  upcoming_count: 2,
  past_count: 10
}
```

**Logique métier :**
1. Filtrer selon `filter` :
   - `upcoming` : `scheduled_at >= NOW()`
   - `past` : `scheduled_at < NOW()`
   - `all` : tous
2. Ordonner par `scheduled_at` (ASC pour upcoming, DESC pour past)
3. Pagination

**Fichier :** `/src/app/api/protected/appointments/route.ts`

**Tests à effectuer :**
- [ ] Filtre upcoming fonctionne
- [ ] Filtre past fonctionne
- [ ] Pagination fonctionne
- [ ] Tri correct selon filtre

---

#### Endpoint 3.1.3 : Créneaux disponibles

**Route :** `GET /api/protected/appointments/available-slots?nutritionist_id=uuid&date=2026-02-05&consultation_type_id=uuid`

**Query params :**
- `nutritionist_id` (required)
- `date` (required) - Format YYYY-MM-DD
- `consultation_type_id` (required) - Pour connaître la durée

**Response :**
```typescript
{
  date: '2026-02-05',
  slots: [
    { start: '09:00', end: '10:00', available: true },
    { start: '10:00', end: '11:00', available: false },
    { start: '14:00', end: '15:00', available: true }
  ]
}
```

**Logique métier :**
1. Récupérer la durée de consultation depuis `consultation_types`
2. Récupérer les horaires de travail du nutritionniste (table `nutritionist_availability`)
3. Générer tous les créneaux possibles pour la journée
4. Query `appointments` pour marquer les créneaux occupés
5. Retourner les créneaux avec statut available/unavailable

**Fichier :** `/src/app/api/protected/appointments/available-slots/route.ts`

**Tests à effectuer :**
- [ ] Créneaux générés selon horaires nutritionniste
- [ ] Créneaux occupés marqués unavailable
- [ ] Respect de la durée de consultation
- [ ] Gestion jours de fermeture

---

#### Endpoint 3.1.4 : Réserver un rendez-vous

**Route :** `POST /api/protected/appointments`

**Request body :**
```typescript
{
  nutritionist_id: 'uuid',
  consultation_type_id: 'uuid',
  scheduled_at: '2026-02-05T14:00:00Z',
  mode: 'visio' | 'cabinet' | 'phone',
  patient_notes?: string
}
```

**Response :**
```typescript
{
  id: 'uuid',
  patient_id: 'uuid',
  nutritionist_id: 'uuid',
  consultation_type_id: 'uuid',
  scheduled_at: '2026-02-05T14:00:00Z',
  scheduled_end_at: '2026-02-05T15:00:00Z',
  mode: 'visio',
  status: 'pending',
  video_link: 'https://meet.jitsi.si/nutrisensia-xyz789',
  created_at: '2026-01-29T10:00:00Z'
}
```

**Logique métier :**
1. Valider le body
2. Vérifier que le créneau est disponible
3. Calculer `scheduled_end_at` (scheduled_at + consultation duration)
4. Si `mode = 'visio'`, générer un lien de visioconférence unique
5. Insérer dans `appointments` avec `status = 'pending'`
6. Envoyer email de confirmation au patient (optionnel)
7. Créer une notification pour le nutritionniste (optionnel)
8. Retourner le RDV créé

**Fichier :** `/src/app/api/protected/appointments/route.ts` (export POST)

**Tests à effectuer :**
- [ ] Création réussie si créneau disponible
- [ ] Erreur 409 si créneau déjà pris
- [ ] `scheduled_end_at` calculé correctement
- [ ] Lien visio généré si mode = visio
- [ ] Email envoyé (si configuré)

---

#### Endpoint 3.1.5 : Modifier un rendez-vous

**Route :** `PATCH /api/protected/appointments/[id]`

**Request body :**
```typescript
{
  scheduled_at?: '2026-02-06T10:00:00Z',
  mode?: 'cabinet',
  patient_notes?: string
}
```

**Logique métier :**
1. Vérifier ownership (patient_id = session.user.id)
2. Vérifier que modification possible (> 24h avant le RDV)
3. Si `scheduled_at` changé, vérifier disponibilité du nouveau créneau
4. Mettre à jour `appointments`
5. Notifier le nutritionniste
6. Envoyer email de confirmation de modification

**Fichier :** `/src/app/api/protected/appointments/[id]/route.ts` (export PATCH)

**Tests à effectuer :**
- [ ] Modification réussie si > 24h avant
- [ ] Erreur 403 si < 24h avant
- [ ] Vérification disponibilité nouveau créneau
- [ ] Notification nutritionniste envoyée

---

#### Endpoint 3.1.6 : Annuler un rendez-vous

**Route :** `DELETE /api/protected/appointments/[id]`

**Response :**
```typescript
{
  success: true,
  message: 'Rendez-vous annulé avec succès',
  cancellation_policy: 'Annulation gratuite car > 24h avant le RDV'
}
```

**Logique métier :**
1. Vérifier ownership
2. Vérifier que annulation possible (> 24h avant)
3. Mettre à jour `status = 'cancelled_by_patient'` (ne pas supprimer)
4. Notifier le nutritionniste
5. Appliquer la politique d'annulation (gratuit si > 24h)

**Fichier :** `/src/app/api/protected/appointments/[id]/route.ts` (export DELETE)

**Tests à effectuer :**
- [ ] Annulation réussie si > 24h avant
- [ ] Erreur 403 si < 24h avant
- [ ] Status = 'cancelled_by_patient' (pas de suppression)
- [ ] Notification envoyée

---

#### Endpoint 3.1.7 : Rejoindre une visio

**Route :** `GET /api/protected/appointments/[id]/join`

**Response :**
```typescript
{
  can_join: true,
  video_link: 'https://meet.jitsi.si/nutrisensia-xyz789',
  message: 'Vous pouvez rejoindre la visio'
}
```

**Logique métier :**
1. Récupérer le RDV
2. Vérifier que :
   - `mode = 'visio'`
   - `status = 'confirmed'`
   - Heure actuelle entre (scheduled_at - 15 min) et (scheduled_end_at + 30 min)
3. Si OK, retourner le lien visio
4. Sinon, retourner `can_join: false` avec message d'erreur

**Fichier :** `/src/app/api/protected/appointments/[id]/join/route.ts`

**Tests à effectuer :**
- [ ] Lien retourné si dans la fenêtre de temps
- [ ] Erreur si trop tôt (> 15 min avant)
- [ ] Erreur si trop tard (> 30 min après)
- [ ] Erreur si mode != visio

---

### Module 3.2 : Messagerie (MSG)

#### Endpoint 3.2.1 : Nombre de messages non lus

**Route :** `GET /api/protected/conversations/unread-count`

**Frontend appelant :**
- Dashboard (`DASH-006`)
- Sidebar (badge messagerie)

**Response :**
```typescript
{
  count: 3
}
```

**Logique métier :**
1. Query `conversations` WHERE `patient_id = session.user.id`
2. Sommer les `patient_unread_count`
3. Retourner le total

**Fichier :** `/src/app/api/protected/conversations/unread-count/route.ts`

**Tests à effectuer :**
- [ ] Compte correct des messages non lus
- [ ] 0 si aucun message non lu
- [ ] Mise à jour en temps réel (si Realtime activé)

---

#### Endpoint 3.2.2 : Liste des conversations

**Route :** `GET /api/protected/conversations`

**Response :**
```typescript
{
  conversations: [
    {
      id: 'uuid',
      nutritionist: {
        id: 'uuid',
        first_name: 'Dr. Sophie',
        last_name: 'Martin',
        photo_url: null,
        initials: 'SM'
      },
      last_message_at: '2026-01-29T15:30:00Z',
      last_message_preview: 'Merci pour votre question, je vous...',
      patient_unread_count: 2
    }
  ]
}
```

**Logique métier :**
1. Query `conversations` WHERE `patient_id = session.user.id`
2. JOIN avec `nutritionist_profiles`
3. Ordonner par `last_message_at DESC`
4. Retourner la liste

**Fichier :** `/src/app/api/protected/conversations/route.ts`

**Tests à effectuer :**
- [ ] Liste des conversations triée par date
- [ ] Nutritionist details inclus
- [ ] Unread count correct
- [ ] Preview du dernier message

---

#### Endpoint 3.2.3 : Historique d'une conversation

**Route :** `GET /api/protected/conversations/[id]/messages?limit=50&before=uuid`

**Query params :**
- `limit` (optional) - Default 50
- `before` (optional) - Message ID pour pagination

**Response :**
```typescript
{
  messages: [
    {
      id: 'uuid',
      sender_id: 'uuid',
      sender_type: 'patient',
      sender_name: 'Jean Dupont',
      content: 'Bonjour, j\'ai une question sur les glucides',
      sent_at: '2026-01-29T14:00:00Z',
      read_at: '2026-01-29T14:05:00Z',
      attachments: []
    },
    {
      id: 'uuid',
      sender_id: 'uuid',
      sender_type: 'nutritionist',
      sender_name: 'Dr. Sophie Martin',
      content: 'Bonjour Jean, je suis là pour vous aider',
      sent_at: '2026-01-29T14:10:00Z',
      read_at: null,
      attachments: []
    }
  ],
  has_more: true
}
```

**Logique métier :**
1. Vérifier que l'utilisateur a accès à cette conversation
2. Query `messages` WHERE `conversation_id = id`
3. Si `before` fourni, filter `created_at < (SELECT created_at FROM messages WHERE id = before)`
4. Ordonner par `sent_at DESC`
5. Limiter à `limit` messages
6. Marquer les messages non lus comme lus (`read_at = NOW()`)
7. Décrémenter `patient_unread_count` dans `conversations`

**Fichier :** `/src/app/api/protected/conversations/[id]/messages/route.ts`

**Tests à effectuer :**
- [ ] Messages triés chronologiquement
- [ ] Pagination fonctionne
- [ ] Marquage comme lu automatique
- [ ] Unread count décrémenté
- [ ] Erreur 403 si accès non autorisé

---

#### Endpoint 3.2.4 : Envoyer un message texte

**Route :** `POST /api/protected/conversations/[id]/messages`

**Request body :**
```typescript
{
  content: 'Merci pour votre réponse, c\'est très clair'
}
```

**Response :**
```typescript
{
  id: 'uuid',
  conversation_id: 'uuid',
  sender_id: 'uuid',
  sender_type: 'patient',
  content: 'Merci pour votre réponse, c\'est très clair',
  sent_at: '2026-01-29T15:30:00Z',
  read_at: null
}
```

**Logique métier :**
1. Vérifier accès à la conversation
2. Valider le contenu (min 1 caractère, max 5000)
3. Insérer dans `messages` avec `sender_type = 'patient'`
4. Mettre à jour `conversations` :
   - `last_message_at = NOW()`
   - `last_message_preview = content (100 premiers caractères)`
   - `nutritionist_unread_count++`
5. Déclencher notification push au nutritionniste (si activé)
6. Retourner le message créé

**Fichier :** `/src/app/api/protected/conversations/[id]/messages/route.ts` (export POST)

**Tests à effectuer :**
- [ ] Message créé avec succès
- [ ] Conversation updated (last_message_at, preview)
- [ ] Unread count nutritionniste incrémenté
- [ ] Notification envoyée
- [ ] Erreur 400 si content vide

---

#### Endpoint 3.2.5 : Envoyer une photo

**Route :** `POST /api/protected/conversations/[id]/messages/upload`

**Request body (FormData) :**
```
file: [Image File]
caption?: string
```

**Response :**
```typescript
{
  id: 'uuid',
  conversation_id: 'uuid',
  sender_id: 'uuid',
  sender_type: 'patient',
  content: 'Photo de mon repas ce midi',
  sent_at: '2026-01-29T15:35:00Z',
  attachments: [
    {
      id: 'uuid',
      type: 'image',
      url: 'https://xyz.supabase.co/storage/v1/object/public/messages/abc123.jpg',
      filename: 'repas.jpg',
      size_bytes: 245678
    }
  ]
}
```

**Logique métier :**
1. Vérifier accès
2. Valider le fichier :
   - Type MIME : image/jpeg, image/png, image/webp
   - Taille max : 5 MB
3. Upload vers Supabase Storage (bucket `messages`)
4. Créer un enregistrement dans `message_attachments`
5. Créer le message avec `content = caption` et lien vers attachment
6. Mettre à jour la conversation
7. Notifier le nutritionniste

**Fichier :** `/src/app/api/protected/conversations/[id]/messages/upload/route.ts`

**Tests à effectuer :**
- [ ] Upload image réussi
- [ ] URL Supabase Storage correcte
- [ ] Erreur 400 si type invalide
- [ ] Erreur 413 si taille > 5 MB
- [ ] Légende attachée au message

---

#### Endpoint 3.2.6 : Envoyer un document

**Route :** `POST /api/protected/conversations/[id]/messages/upload`

(Même endpoint que 3.2.5, mais accepte aussi PDF)

**Validations supplémentaires :**
- Type MIME : application/pdf
- Taille max : 10 MB

**Tests à effectuer :**
- [ ] Upload PDF réussi
- [ ] Erreur 400 si type invalide
- [ ] Erreur 413 si taille > 10 MB

---

#### Endpoint 3.2.7 : Réponses rapides

**Route :** `GET /api/protected/conversations/quick-replies`

**Response :**
```typescript
{
  quick_replies: [
    { id: '1', text: 'Merci beaucoup !' },
    { id: '2', text: 'D\'accord, je comprends' },
    { id: '3', text: 'J\'ai une question' },
    { id: '4', text: 'Oui, exactement' },
    { id: '5', text: 'Non, pas vraiment' }
  ]
}
```

**Logique métier :**
- Retourner une liste prédéfinie de réponses rapides
- Peut être personnalisée selon l'historique utilisateur (ML/AI)

**Fichier :** `/src/app/api/protected/conversations/quick-replies/route.ts`

---

### Module 3.3 : Intégration Frontend

#### Tâche 3.3.1 : Intégration Agenda

**Fichier :** `/src/app/[locale]/dashboard/patient/agenda/page.tsx`

**Créer les hooks :**
```typescript
// hooks/useAppointments.ts
export function useUpcomingAppointments() { /* ... */ }
export function useAvailableSlots(nutritionistId, date, typeId) { /* ... */ }
export function useBookAppointment() { /* ... */ }
export function useCancelAppointment() { /* ... */ }
```

**Tests à effectuer :**
- [ ] Liste des RDV chargée
- [ ] Réservation fonctionne
- [ ] Annulation fonctionne (avec confirmation)
- [ ] Modification fonctionne
- [ ] Bouton "Rejoindre visio" visible au bon moment

---

#### Tâche 3.3.2 : Intégration Messagerie

**Fichier :** `/src/app/[locale]/dashboard/patient/messagerie/page.tsx`

**Créer les hooks :**
```typescript
// hooks/useConversations.ts
export function useUnreadCount() { /* ... */ }
export function useConversations() { /* ... */ }
export function useMessages(conversationId) { /* ... */ }
export function useSendMessage() { /* ... */ }
export function useSendAttachment() { /* ... */ }
```

**Implémenter Supabase Realtime (optionnel) :**
```typescript
// Écouter les nouveaux messages en temps réel
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      // Ajouter le nouveau message à la liste
      queryClient.invalidateQueries(['messages', conversationId]);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [conversationId]);
```

**Tests à effecturer :**
- [ ] Liste des conversations chargée
- [ ] Historique des messages affiché
- [ ] Envoi de message texte fonctionne
- [ ] Upload de photo fonctionne
- [ ] Upload de document fonctionne
- [ ] Indicateurs de lecture ✓✓
- [ ] Scroll infini (pagination)
- [ ] Realtime (si activé)

---

#### Tâche 3.3.3 : Intégration Dashboard

**Fichier :** `/src/app/[locale]/dashboard/patient/page.tsx`

**Changements :**
```typescript
const { data: nextAppointment } = useNextAppointment();
const { data: unreadMessages } = useUnreadCount();

// DASH-005 (lignes ~1800+)
<NextAppointmentCard appointment={nextAppointment} />

// DASH-006 (lignes ~1200+)
<UnreadMessagesCard count={unreadMessages?.count} />
```

**Tests à effectuer :**
- [ ] Dashboard DASH-005 affiche le prochain RDV
- [ ] Countdown correct
- [ ] Dashboard DASH-006 affiche le badge non lus
- [ ] Clic redirige vers messagerie
- [ ] Mise à jour en temps réel

---

### Critères de validation Phase 3

**Backend :**
- [ ] Tous les endpoints AGENDA fonctionnent
- [ ] Créneaux disponibles calculés correctement
- [ ] Réservation, modification, annulation OK
- [ ] Lien visio généré et accessible
- [ ] Tous les endpoints MSG fonctionnent
- [ ] Envoi messages, photos, documents OK
- [ ] Unread count exact
- [ ] Notifications envoyées (email/push)

**Frontend :**
- [ ] Page Agenda utilise les API
- [ ] Page Messagerie utilise les API
- [ ] Dashboard DASH-005 et DASH-006 fonctionnels
- [ ] Realtime fonctionne (si activé)
- [ ] Upload de fichiers fonctionne

**Performance :**
- [ ] Liste messages < 500ms
- [ ] Envoi message < 300ms
- [ ] Upload fichier < 3s
- [ ] Créneaux disponibles < 1s

---

## Phase 4 : Epic 6 - Objectifs & Dashboard

**Durée estimée :** 1 semaine
**Priorité :** Moyenne (Should Have)
**Impact Dashboard :** DASH-007 + finalisation Dashboard complet

### Vue d'ensemble

Cette phase implémente :
- **Epic 6 - Mon dossier** : Objectifs hebdomadaires (FILE-006)
- **Dashboard final** : Agrégation de toutes les données

**Frontend déjà implémenté :**
- Page `/dashboard/patient/dossier` (FILE-001 à FILE-007) ✅
- Dashboard (DASH-007 objectifs) ⚠️

**Tables Supabase utilisées :**
- `weekly_objectives`
- `user_points`
- `badges`

---

### Module 4.1 : Objectifs hebdomadaires (FILE-006, DASH-007)

#### Endpoint 4.1.1 : Objectifs de la semaine

**Route :** `GET /api/protected/objectives?week=2026-W05`

**Query params :**
- `week` (optional) - Format YYYY-WXX (default = current week)

**Frontend appelant :**
- Dashboard (`DASH-007`)
- Page Mon dossier (FILE-006)

**Response :**
```typescript
{
  week_start: '2026-01-27',
  week_end: '2026-02-02',
  objectives: [
    {
      id: 'obj-1',
      category: 'nutrition',
      label: 'Enregistrer tous les repas',
      description: 'Objectif : 21 repas sur la semaine',
      target: 21,
      current: 18,
      unit: 'repas',
      progress: 85,
      isCompleted: false,
      definedBy: {
        name: 'Dr. Sophie Martin',
        initials: 'SM',
        role: 'nutritionist'
      }
    },
    {
      id: 'obj-2',
      category: 'hydration',
      label: 'Boire 2L d\'eau par jour',
      description: 'Objectif : atteindre 2L pendant 5 jours minimum',
      target: 5,
      current: 4,
      unit: 'jours',
      progress: 80,
      isCompleted: false,
      definedBy: {
        name: 'Système',
        initials: 'S',
        role: 'system'
      }
    },
    {
      id: 'obj-3',
      category: 'activity',
      label: 'Faire 3 séances de sport',
      description: '30 minutes minimum par séance',
      target: 3,
      current: 3,
      unit: 'séances',
      progress: 100,
      isCompleted: true,
      completedAt: '2026-01-29T18:00:00Z',
      definedBy: {
        name: 'Vous',
        initials: 'JD',
        role: 'user'
      }
    }
  ],
  total_objectives: 3,
  completed_objectives: 1,
  overall_progress: 88,
  points_earned: 50,
  time_remaining: {
    days: 3,
    label: '3 jours restants'
  }
}
```

**Logique métier :**
1. Calculer les dates de début/fin de semaine (lundi-dimanche)
2. Query `weekly_objectives` pour cette semaine
3. Pour chaque objectif dans le JSONB `objectives` :
   - **Calculer dynamiquement `current`** selon la `category` :
     - `nutrition` : Compter les repas enregistrés dans `meals` cette semaine
     - `hydration` : Compter les jours ayant atteint l'objectif dans `hydration_logs`
     - `activity` : Compter les sessions dans `activity_logs`
     - `tracking` : Vérifier si pesée hebdomadaire effectuée
     - `recipes` : Compter les recettes consultées
     - `custom` : Valeur manuelle (pas de calcul auto)
   - Calculer `progress = (current / target) * 100`
   - Déterminer `isCompleted = progress >= 100`
4. Calculer `overall_progress` (moyenne des progress)
5. Calculer `time_remaining` (jours jusqu'à dimanche soir)
6. Retourner les objectifs enrichis

**Fichier :** `/src/app/api/protected/objectives/route.ts`

**Tests à effectuer :**
- [ ] Objectifs de la semaine en cours retournés
- [ ] `current` calculé correctement pour chaque catégorie
- [ ] `progress` exact
- [ ] `isCompleted` correct
- [ ] `time_remaining` exact
- [ ] Historique (semaines passées) accessible

---

#### Endpoint 4.1.2 : Créer des objectifs hebdomadaires

**Route :** `POST /api/protected/objectives`

**Request body :**
```typescript
{
  week_start: '2026-02-03',
  objectives: [
    {
      id: 'temp-1',
      category: 'nutrition',
      label: 'Enregistrer tous les repas',
      description: '21 repas sur la semaine',
      target: 21,
      unit: 'repas',
      definedBy: {
        name: 'Dr. Sophie Martin',
        role: 'nutritionist'
      }
    }
  ]
}
```

**Response :**
```typescript
{
  id: 'uuid',
  user_id: 'uuid',
  week_start: '2026-02-03',
  week_end: '2026-02-09',
  objectives: [ /* ... */ ],
  total_objectives: 1,
  completed_objectives: 0,
  progress_percent: 0,
  points_earned: 0,
  created_at: '2026-01-29T10:00:00Z'
}
```

**Logique métier :**
1. Valider le body
2. Calculer `week_end` (week_start + 6 jours)
3. Générer des IDs uniques pour chaque objectif
4. Insérer dans `weekly_objectives`
5. Retourner les objectifs créés

**Fichier :** `/src/app/api/protected/objectives/route.ts` (export POST)

**Tests à effectuer :**
- [ ] Création réussie
- [ ] IDs générés
- [ ] `week_end` calculé correctement
- [ ] Erreur 409 si objectifs déjà existent pour cette semaine

---

#### Endpoint 4.1.3 : Mettre à jour un objectif

**Route :** `PATCH /api/protected/objectives/[id]`

**Request body :**
```typescript
{
  objective_id: 'obj-1',
  current?: 19,
  isCompleted?: false,
  completedAt?: null
}
```

**Logique métier :**
1. Récupérer l'entrée `weekly_objectives`
2. Trouver l'objectif dans le JSONB `objectives` par `objective_id`
3. Mettre à jour les champs fournis
4. Recalculer `progress_percent` global
5. Sauvegarder

**Fichier :** `/src/app/api/protected/objectives/[id]/route.ts`

**Tests à effectuer :**
- [ ] Mise à jour réussie
- [ ] `progress_percent` recalculé
- [ ] Erreur 404 si objective_id invalide

---

#### Endpoint 4.1.4 : Historique des objectifs

**Route :** `GET /api/protected/objectives/history?limit=12`

**Response :**
```typescript
{
  weeks: [
    {
      week_start: '2026-01-27',
      week_end: '2026-02-02',
      total_objectives: 3,
      completed_objectives: 2,
      progress_percent: 88,
      points_earned: 50
    },
    {
      week_start: '2026-01-20',
      week_end: '2026-01-26',
      total_objectives: 3,
      completed_objectives: 3,
      progress_percent: 100,
      points_earned: 75
    }
  ]
}
```

**Logique métier :**
1. Query `weekly_objectives` pour les X dernières semaines
2. Ordonner par `week_start DESC`
3. Limiter à `limit`
4. Retourner le résumé de chaque semaine

**Fichier :** `/src/app/api/protected/objectives/history/route.ts`

**Tests à effectuer :**
- [ ] Historique trié par date décroissante
- [ ] Statistiques correctes par semaine
- [ ] Pagination fonctionne

---

### Module 4.2 : Gamification (Bonus)

#### Endpoint 4.2.1 : Points utilisateur

**Route :** `GET /api/protected/gamification/points`

**Response :**
```typescript
{
  total_points: 1250,
  level: 5,
  next_level_points: 1500,
  points_to_next_level: 250,
  rank: 'Bronze',
  badges_count: 8
}
```

**Fichier :** `/src/app/api/protected/gamification/points/route.ts`

---

#### Endpoint 4.2.2 : Badges utilisateur

**Route :** `GET /api/protected/gamification/badges`

**Response :**
```typescript
{
  badges: [
    {
      id: 'uuid',
      name: 'Premier repas enregistré',
      description: 'Vous avez enregistré votre premier repas',
      icon_url: 'https://...',
      unlocked_at: '2026-01-15T10:00:00Z'
    }
  ],
  locked_badges: [
    {
      id: 'uuid',
      name: '7 jours d\'affilée',
      description: 'Enregistrez tous vos repas pendant 7 jours consécutifs',
      icon_url: 'https://...',
      progress: 4,
      target: 7
    }
  ]
}
```

**Fichier :** `/src/app/api/protected/gamification/badges/route.ts`

---

### Module 4.3 : Dashboard - Agrégations finales

#### Endpoint 4.3.1 : Dashboard summary

**Route :** `GET /api/protected/dashboard/summary`

**Frontend appelant :**
- Dashboard principal (toutes les cards)

**Response :**
```typescript
{
  nutrition: {
    total_calories: 1850,
    calorie_goal: 2100,
    calories_remaining: 250,
    macros: { protein: 95, carbs: 220, fat: 62 },
    adherence_percent: 88
  },
  hydration: {
    current_ml: 1500,
    goal_ml: 2000,
    percent: 75
  },
  meals_status: {
    breakfast: true,
    lunch: true,
    dinner: false,
    snack: false
  },
  weekly_progress: {
    meal_streak_days: 7,
    weight_change_kg: -0.6,
    adherence_percent: 88
  },
  next_appointment: {
    scheduled_at: '2026-02-05T14:00:00Z',
    type: 'Suivi',
    nutritionist: 'Dr. Sophie Martin',
    countdown_days: 7
  },
  unread_messages_count: 3,
  weekly_objectives: {
    total: 3,
    completed: 1,
    overall_progress: 88,
    time_remaining_days: 3
  }
}
```

**Logique métier :**
- Agrège tous les endpoints précédents en un seul appel
- Optimisé avec queries parallèles
- Cache de 5 minutes pour performance

**Fichier :** `/src/app/api/protected/dashboard/summary/route.ts`

**Tests à effectuer :**
- [ ] Toutes les sections retournées
- [ ] Performance < 2s (queries parallèles)
- [ ] Cache fonctionne
- [ ] Gestion des erreurs partielles (ne pas bloquer tout le dashboard si une section fail)

---

### Module 4.4 : Intégration Frontend finale

#### Tâche 4.4.1 : Intégration Objectifs

**Fichier :** `/src/app/[locale]/dashboard/patient/dossier/page.tsx` (section FILE-006)

**Créer les hooks :**
```typescript
// hooks/useObjectives.ts
export function useWeeklyObjectives(week?: string) { /* ... */ }
export function useObjectivesHistory(limit: number) { /* ... */ }
```

**Tests à effectuer :**
- [ ] Objectifs hebdomadaires affichés
- [ ] Progression calculée dynamiquement
- [ ] Historique accessible

---

#### Tâche 4.4.2 : Dashboard final

**Fichier :** `/src/app/[locale]/dashboard/patient/page.tsx`

**Option 1 : Appels séparés (actuel)**
```typescript
const { data: nutrition } = useDailySummary();
const { data: hydration } = useHydrationToday();
const { data: mealsCheck } = useMealsCheck();
const { data: weeklyProgress } = useWeeklyProgress();
const { data: nextAppointment } = useNextAppointment();
const { data: unreadMessages } = useUnreadCount();
const { data: objectives } = useWeeklyObjectives();
```

**Option 2 : Appel unique (recommandé pour performance)**
```typescript
const { data: dashboard, isLoading } = useDashboardSummary();
// dashboard contient toutes les données en une seule requête
```

**Supprimer toutes les données mockées :**
```typescript
// SUPPRIMER (lignes 497-758)
// const mockDailyNutrition = { ... };
// const mockHydrationData = { ... };
// const mockMeals = [ ... ];
// const mockWeeklyProgress = { ... };
// const mockNextAppointment = { ... };
// const mockMessagesData = { ... };
// const mockWeeklyObjectivesData = { ... };
```

**Remplacer par :**
```typescript
const { data: dashboard, isLoading } = useDashboardSummary();

if (isLoading) {
  return <DashboardSkeleton />;
}

// DASH-001
<DailyNutritionCard nutrition={dashboard.nutrition} />

// DASH-002
<HydrationCard hydration={dashboard.hydration} />

// DASH-003
<MealButtons status={dashboard.meals_status} />

// DASH-004
<WeeklyProgressCard progress={dashboard.weekly_progress} />

// DASH-005
<NextAppointmentCard appointment={dashboard.next_appointment} />

// DASH-006
<UnreadMessagesCard count={dashboard.unread_messages_count} />

// DASH-007
<WeeklyObjectivesCard objectives={dashboard.weekly_objectives} />
```

**Tests à effectuer :**
- [ ] Toutes les 7 stories du dashboard fonctionnelles
- [ ] Plus aucune donnée mockée
- [ ] Loading state global
- [ ] Gestion des erreurs pour chaque section
- [ ] Performance : chargement complet < 2s
- [ ] Cache fonctionne (pas de rechargement inutile)

---

### Critères de validation Phase 4

**Backend :**
- [ ] Objectifs hebdomadaires avec calcul dynamique
- [ ] Historique des objectifs
- [ ] Dashboard summary agrégé
- [ ] Performance < 2s pour dashboard summary
- [ ] Cache implémenté

**Frontend :**
- [ ] Dashboard 100% fonctionnel (7/7 stories)
- [ ] Objectifs affichés avec progression
- [ ] Plus de données mockées
- [ ] Toutes les pages utilisent les API
- [ ] Navigation fluide entre les pages

**Validation finale :**
- [ ] User flow complet testé (inscription → dashboard → repas → suivi → agenda → messagerie)
- [ ] RLS policies testées pour toutes les tables
- [ ] Performance globale < 2s par page
- [ ] SEO tags mis à jour
- [ ] Erreurs loggées (Sentry ou similaire)
- [ ] Documentation API créée (Swagger/OpenAPI)

---

## Phase 5 : Dossier Médical (FILE)

**Priorité :** Haute (Must Have)
**Impact :** Page `/dashboard/patient/dossier` - onglets anamnèse, questionnaires, documents, consultations
**Mock à remplacer :** `getAnamneseData()`, `getQuestionnairesData()`, `getDocumentsData()`, `getConsultationsData()` de `mock-dossier.ts`

### Vue d'ensemble

Cette phase implémente le dossier médical du patient :
- Anamnèse (historique médical structuré en 7 sections)
- Questionnaires de suivi
- Documents partagés (analyses, plans, ressources)
- Notes de consultation

**Frontend déjà implémenté :**
- Page `/dashboard/patient/dossier` (FILE-001 à FILE-007) ✅
- Objectifs (FILE-006) déjà connecté à l'API ✅

**Tables Supabase existantes** (migration `11_patient_file.sql`) :
- `anamneses` + `anamnesis_sections`
- `follow_up_questionnaires`
- `documents`
- `consultations`
- `patient_objectives` + `objective_progress_logs`
- `change_reports`

---

### Module 5.1 : Anamnèse

#### Endpoint 5.1.1 : Récupérer l'anamnèse du patient

**Route :** `GET /api/protected/dossier/anamnese`

**Frontend appelant :**
- Dossier page, onglet "Anamnèse"

**Response :**
```typescript
{
  createdAt: '2025-12-15T10:00:00Z',
  updatedAt: null,
  nutritionist: 'Lucie Martin',
  version: 1,
  is_current: true,
  sections: [
    {
      id: 'identite',
      label: 'Identité & Contact',
      icon: '👤',
      fields: [
        { label: 'Nom', value: 'Jean Dupont' },
        { label: 'Date de naissance', value: '12 mars 1988' }
        // ...
      ]
    }
    // 7 sections : identite, morphologie, historique, sante, habitudes, lifestyle, motivation
  ]
}
```

**Logique métier :**
1. Query `anamneses` WHERE `patient_id = session.user.id` AND `is_current = true`
2. JOIN `anamnesis_sections` pour récupérer les 7 sections
3. JOIN `profiles` pour le nom du nutritionniste créateur
4. Retourner les données formatées

**Fichier :** `/src/app/api/protected/dossier/anamnese/route.ts`

**Tests :**
- [ ] Retourne l'anamnèse courante
- [ ] Null si aucune anamnèse créée
- [ ] Sections ordonnées correctement
- [ ] Erreur 401 si non authentifié

---

### Module 5.2 : Questionnaires

#### Endpoint 5.2.1 : Lister les questionnaires

**Route :** `GET /api/protected/dossier/questionnaires`

**Response :**
```typescript
{
  questionnaires: [
    {
      id: 'uuid',
      title: 'Questionnaire initial',
      type: 'Anamnèse',
      date: '2025-12-15',
      status: 'completed',
      consultationLinked: 'Première consultation'
    }
  ]
}
```

**Logique métier :**
1. Query `follow_up_questionnaires` WHERE `patient_id`
2. JOIN `consultations` pour le lien consultation
3. Ordonner par date DESC

**Fichier :** `/src/app/api/protected/dossier/questionnaires/route.ts`

#### Endpoint 5.2.2 : Compléter un questionnaire

**Route :** `POST /api/protected/dossier/questionnaires/[id]/complete`

**Request body :**
```typescript
{
  answers: { [questionId: string]: any }
}
```

**Fichier :** `/src/app/api/protected/dossier/questionnaires/[id]/complete/route.ts`

---

### Module 5.3 : Documents

#### Endpoint 5.3.1 : Lister les documents

**Route :** `GET /api/protected/dossier/documents?category=all`

**Query params :**
- `category` (optional) : `Analyses` | `Plans` | `Ressources` | `Autre` | `all`

**Response :**
```typescript
{
  documents: [
    {
      id: 'uuid',
      name: 'Bilan sanguin complet',
      type: 'pdf',
      size: '245 Ko',
      uploadedAt: '2025-12-10',
      uploadedBy: 'patient',
      category: 'Analyses'
    }
  ]
}
```

**Logique métier :**
1. Query `documents` WHERE `patient_id`
2. Filtrer par catégorie si spécifié
3. Ordonner par date DESC

**Fichier :** `/src/app/api/protected/dossier/documents/route.ts`

#### Endpoint 5.3.2 : Uploader un document

**Route :** `POST /api/protected/dossier/documents`

**Request body (FormData) :**
```
file: [File]
category: 'Analyses' | 'Plans' | 'Ressources' | 'Autre'
name?: string
```

**Logique métier :**
1. Valider le fichier (PDF/image, max 10 MB)
2. Upload vers Supabase Storage bucket `patient-documents`
3. Insérer dans `documents` avec `uploaded_by = 'patient'`
4. Retourner le document créé

**Fichier :** `/src/app/api/protected/dossier/documents/route.ts` (export POST)

#### Endpoint 5.3.3 : Télécharger un document

**Route :** `GET /api/protected/dossier/documents/[id]/download`

**Logique métier :**
1. Vérifier ownership (patient_id = session.user.id)
2. Récupérer le `file_url` depuis `documents`
3. Générer une signed URL Supabase Storage
4. Redirect ou retourner l'URL

**Fichier :** `/src/app/api/protected/dossier/documents/[id]/download/route.ts`

#### Endpoint 5.3.4 : Supprimer un document

**Route :** `DELETE /api/protected/dossier/documents/[id]`

**Fichier :** `/src/app/api/protected/dossier/documents/[id]/route.ts`

---

### Module 5.4 : Consultations

#### Endpoint 5.4.1 : Historique des consultations

**Route :** `GET /api/protected/dossier/consultations`

**Response :**
```typescript
{
  consultations: [
    {
      id: 'uuid',
      date: '2025-12-15',
      type: 'Première consultation',
      duration: '60 min',
      mode: 'Cabinet',
      summary: 'Bilan initial complet...',
      keyPoints: ['Objectif : -7kg en 6 mois', 'Priorités identifiées...'],
      nextSteps: 'Plan alimentaire personnalisé à suivre...'
    }
  ]
}
```

**Logique métier :**
1. Query `consultations` WHERE `patient_id`
2. JOIN `appointments` pour date, mode, durée
3. Exclure `private_notes` (réservé au nutritionniste)
4. Ordonner par date DESC

**Fichier :** `/src/app/api/protected/dossier/consultations/route.ts`

---

### Module 5.5 : Intégration Frontend

**Fichier :** `/src/app/[locale]/dashboard/patient/dossier/page.tsx`

**Hooks à créer :**
```typescript
// hooks/useDossier.ts
export function useAnamnese() { /* GET /api/protected/dossier/anamnese */ }
export function useQuestionnaires() { /* GET /api/protected/dossier/questionnaires */ }
export function useDocuments(category?: string) { /* GET /api/protected/dossier/documents */ }
export function useConsultations() { /* GET /api/protected/dossier/consultations */ }
export function useUploadDocument() { /* POST /api/protected/dossier/documents */ }
export function useDeleteDocument() { /* DELETE /api/protected/dossier/documents/:id */ }
```

**Changements :**
1. Supprimer imports de `mock-dossier.ts` (`getAnamneseData`, `getQuestionnairesData`, `getDocumentsData`, `getConsultationsData`)
2. Utiliser les hooks dans chaque onglet avec loading states
3. Connecter le formulaire d'upload au vrai endpoint

**Tests :**
- [ ] Onglet anamnèse charge les vraies données
- [ ] Onglet questionnaires liste depuis l'API
- [ ] Upload de document fonctionne
- [ ] Téléchargement de document fonctionne
- [ ] Timeline consultations affichée correctement
- [ ] Loading states et empty states

---

### Critères de validation Phase 5

**Backend :**
- [ ] Anamnèse récupérée avec les 7 sections
- [ ] Questionnaires CRUD fonctionnel
- [ ] Documents upload/download/delete via Supabase Storage
- [ ] Consultations (sans notes privées)
- [ ] RLS policies testées

**Frontend :**
- [ ] Page Dossier 100% connectée à l'API
- [ ] Mock `mock-dossier.ts` plus importé
- [ ] Upload documents fonctionnel
- [ ] Loading states partout

**Endpoints :** 8 au total
- `GET /api/protected/dossier/anamnese`
- `GET /api/protected/dossier/questionnaires`
- `POST /api/protected/dossier/questionnaires/[id]/complete`
- `GET /api/protected/dossier/documents`
- `POST /api/protected/dossier/documents`
- `GET /api/protected/dossier/documents/[id]/download`
- `DELETE /api/protected/dossier/documents/[id]`
- `GET /api/protected/dossier/consultations`

---

## Phase 6 : Profil Patient (PROF)

**Priorité :** Moyenne (Should Have)
**Impact :** Page `/dashboard/patient/profil` - 8 sections + BadgesSection
**Mock à remplacer :** `getInitialProfileState()` de `mock-profile.ts`, `getBadges()` et `getStreakData()` de `mock-gamification.ts`

### Vue d'ensemble

Cette phase implémente la page de profil complète du patient :
- Informations personnelles (lecture/édition)
- Sécurité (mot de passe, 2FA, sessions)
- Préférences (langue, unités, apparence)
- Paramètres de notifications
- Appareils connectés
- Badges & streaks (gamification)
- Statistiques de données
- Export/suppression de compte (RGPD)

**Frontend déjà implémenté :**
- Page `/dashboard/patient/profil` ✅
- Composants modaux (EditFieldModal, PasswordModal, TwoFactorModal, ExportDataModal, DeleteAccountModal) ✅

**Tables Supabase existantes** (migrations `02_patient_nutritionist.sql`, `03_user_settings.sql`, `15_gamification.sql`) :
- `profiles` (données personnelles)
- `user_settings` (préférences, notifications, quiet hours)
- `user_sessions` (sessions actives)
- `patient_points`, `patient_badges`, `streaks` (gamification)
- `badges`, `badge_categories` (catalogue badges)

---

### Module 6.1 : Informations personnelles

#### Endpoint 6.1.1 : Récupérer le profil

**Route :** `GET /api/protected/profile` (existe déjà, à enrichir)

**Response enrichie :**
```typescript
{
  id: 'uuid',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@email.ch',
  phone: '+41 79 123 45 67',
  birthDate: '1988-03-12',
  gender: 'male',
  address: 'Rue de la Gare 15, 2000 Neuchâtel',
  avatar_url: null,
  memberSince: '2025-12-15'
}
```

#### Endpoint 6.1.2 : Mettre à jour le profil

**Route :** `PATCH /api/protected/profile` (existe déjà, à enrichir)

**Request body :**
```typescript
{
  firstName?: string,
  lastName?: string,
  phone?: string,
  birthDate?: string,
  gender?: string,
  address?: string
}
```

#### Endpoint 6.1.3 : Upload avatar

**Route :** `POST /api/protected/profile/avatar`

**Request body (FormData) :**
```
file: [Image - max 5MB, jpeg/png/webp]
```

**Fichier :** `/src/app/api/protected/profile/avatar/route.ts`

---

### Module 6.2 : Sécurité

#### Endpoint 6.2.1 : Changer le mot de passe

**Route :** `POST /api/protected/security/password`

**Request body :**
```typescript
{
  currentPassword: string,
  newPassword: string
}
```

**Logique métier :**
1. Vérifier le mot de passe actuel via Supabase Auth
2. Mettre à jour via `auth.updateUser({ password: newPassword })`
3. Mettre à jour `last_password_change` dans `user_settings`

**Fichier :** `/src/app/api/protected/security/password/route.ts`

#### Endpoint 6.2.2 : Sessions actives

**Route :** `GET /api/protected/security/sessions`

**Response :**
```typescript
{
  sessions: [
    {
      id: 'uuid',
      device: 'desktop',
      deviceName: 'MacBook Pro',
      browser: 'Chrome',
      location: 'Neuchâtel',
      lastActive: '2026-02-06T10:00:00Z',
      isCurrent: true
    }
  ]
}
```

**Fichier :** `/src/app/api/protected/security/sessions/route.ts`

#### Endpoint 6.2.3 : Révoquer une session

**Route :** `DELETE /api/protected/security/sessions/[id]`

**Fichier :** `/src/app/api/protected/security/sessions/[id]/route.ts`

---

### Module 6.3 : Préférences & Notifications

#### Endpoint 6.3.1 : Récupérer les préférences

**Route :** `GET /api/protected/profile/preferences`

**Response :**
```typescript
{
  language: 'fr',
  timezone: 'Europe/Zurich',
  firstDayOfWeek: 'monday',
  weightUnit: 'kg',
  heightUnit: 'cm',
  liquidUnit: 'L',
  appearance: 'light'
}
```

**Fichier :** `/src/app/api/protected/profile/preferences/route.ts`

#### Endpoint 6.3.2 : Mettre à jour les préférences

**Route :** `PATCH /api/protected/profile/preferences`

#### Endpoint 6.3.3 : Récupérer les paramètres de notifications

**Route :** `GET /api/protected/profile/notifications`

**Response :**
```typescript
{
  email: {
    appointments: true,
    messages: true,
    weeklyReport: true,
    newContent: false,
    marketing: false
  },
  push: {
    appointments: true,
    messages: true,
    mealReminders: true,
    hydrationReminders: true,
    weightReminders: false,
    streakAlerts: true
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00'
  }
}
```

**Fichier :** `/src/app/api/protected/profile/notifications/route.ts`

#### Endpoint 6.3.4 : Mettre à jour les paramètres de notifications

**Route :** `PATCH /api/protected/profile/notifications`

---

### Module 6.4 : Badges & Gamification (profil)

#### Endpoint 6.4.1 : Badges du profil

Ce module réutilise les API gamification existantes (`/api/protected/gamification/badges` et `/api/protected/gamification/streaks`) mais nécessite un mapping des types API vers les types frontend `Badge` et `StreakData` de `@/types/gamification`.

**Changement principal :**
Réécrire `BadgesSection.tsx` pour utiliser `useBadges()` et `useStreaks()` de `@/hooks/useGamification.ts` avec des fonctions de transformation :

```typescript
function mapApiBadgeToBadge(apiBadge: UnlockedBadge | LockedBadge): Badge {
  return {
    id: apiBadge.code as BadgeId,
    name: apiBadge.name,
    description: apiBadge.description,
    icon: apiBadge.emoji || apiBadge.icon,
    category: mapCategory(apiBadge.category?.slug),
    rarity: mapLevelToRarity(apiBadge.level),
    requirement: apiBadge.description,
    unlockedAt: 'unlocked_at' in apiBadge ? new Date(apiBadge.unlocked_at) : null,
    progress: 'progress' in apiBadge ? apiBadge.progress : 100,
  };
}
```

---

### Module 6.5 : Données & RGPD

#### Endpoint 6.5.1 : Statistiques de données

**Route :** `GET /api/protected/profile/data-stats`

**Response :**
```typescript
{
  totalMeals: 156,
  totalWeightEntries: 24,
  totalMessages: 32,
  accountCreated: '2025-12-15'
}
```

**Logique métier :** Requêtes COUNT sur `meals`, `weight_entries`, `messages`

**Fichier :** `/src/app/api/protected/profile/data-stats/route.ts`

#### Endpoint 6.5.2 : Exporter les données (RGPD)

**Route :** `POST /api/protected/profile/data-export`

**Request body :**
```typescript
{
  categories: ['personal', 'meals', 'tracking', 'messages', 'documents']
}
```

**Response :**
```typescript
{
  exportId: 'uuid',
  status: 'processing',
  message: 'Votre export sera prêt dans quelques minutes'
}
```

**Logique métier :**
1. Créer un job d'export asynchrone
2. Collecter les données de chaque catégorie
3. Générer un fichier JSON/CSV
4. Uploader dans Supabase Storage (bucket privé, expire 7 jours)
5. Notifier par email avec lien de téléchargement

**Fichier :** `/src/app/api/protected/profile/data-export/route.ts`

#### Endpoint 6.5.3 : Supprimer le compte

**Route :** `POST /api/protected/profile/delete-account`

**Request body :**
```typescript
{
  password: string,
  reason?: string
}
```

**Logique métier :**
1. Vérifier le mot de passe
2. Anonymiser les données (soft delete conforme RGPD)
3. Supprimer les fichiers Storage
4. Désactiver le compte Supabase Auth
5. Envoyer email de confirmation

**Fichier :** `/src/app/api/protected/profile/delete-account/route.ts`

---

### Module 6.6 : Intégration Frontend

**Fichier :** `/src/app/[locale]/dashboard/patient/profil/page.tsx`

**Hooks à créer :**
```typescript
// hooks/useProfile.ts (enrichir l'existant)
export function useProfilePreferences() { /* ... */ }
export function useUpdatePreferences() { /* ... */ }
export function useNotificationSettings() { /* ... */ }
export function useUpdateNotificationSettings() { /* ... */ }
export function useActiveSessions() { /* ... */ }
export function useDataStats() { /* ... */ }
export function useUploadAvatar() { /* ... */ }
export function useChangePassword() { /* ... */ }
export function useDeleteAccount() { /* ... */ }
export function useExportData() { /* ... */ }
```

**Changements :**
1. Supprimer `getInitialProfileState()` de `mock-profile.ts`
2. Réécrire `BadgesSection.tsx` avec `useBadges()` + `useStreaks()`
3. Connecter chaque section aux hooks API
4. Gérer les modaux avec mutations

---

### Critères de validation Phase 6

**Backend :**
- [ ] Profil GET/PATCH avec avatar
- [ ] Changement mot de passe + 2FA
- [ ] Sessions actives + révocation
- [ ] Préférences + notifications settings
- [ ] Export données RGPD
- [ ] Suppression compte RGPD

**Frontend :**
- [ ] Page Profil 100% connectée
- [ ] BadgesSection utilise `useBadges()`/`useStreaks()`
- [ ] Mocks `mock-profile.ts` et `mock-gamification.ts` plus importés
- [ ] Modaux fonctionnels

**Endpoints :** ~15 au total
- `GET/PATCH /api/protected/profile` (enrichi)
- `POST /api/protected/profile/avatar`
- `POST /api/protected/security/password`
- `GET /api/protected/security/sessions`
- `DELETE /api/protected/security/sessions/[id]`
- `GET/PATCH /api/protected/profile/preferences`
- `GET/PATCH /api/protected/profile/notifications`
- `GET /api/protected/profile/data-stats`
- `POST /api/protected/profile/data-export`
- `POST /api/protected/profile/delete-account`

---

## Phase 7 : Notifications (NOTIF)

**Priorité :** Moyenne (Should Have)
**Impact :** Page `/dashboard/patient/notifications` + badge sidebar
**Mock à remplacer :** `getNotifications()` de `mock-notifications.ts`

### Vue d'ensemble

Cette phase implémente le système de notifications complet :
- Liste des notifications avec filtres
- Marquage lu/non lu
- Suppression
- Préférences de notification (channels, quiet hours)
- Triggers automatiques (messages, RDV, achievements, rappels)

**Frontend déjà implémenté :**
- Page `/dashboard/patient/notifications` ✅
- Composants : NotificationsList, NotificationsFilters, NotificationItem ✅

**Tables Supabase existantes** (migration `14_notifications.sql`) :
- `notification_types` (catalogue de types avec templates)
- `notifications` (notifications par utilisateur)
- `notification_preferences` (préférences par type/canal)
- `push_subscriptions` (endpoints push)

---

### Module 7.1 : CRUD Notifications

#### Endpoint 7.1.1 : Lister les notifications

**Route :** `GET /api/protected/notifications?filter=all&limit=50&offset=0`

**Query params :**
- `filter` : `all` | `unread` | `message` | `appointment` | `reminder` | `achievement`
- `limit` (default 50)
- `offset` (default 0)

**Response :**
```typescript
{
  notifications: [
    {
      id: 'uuid',
      type: 'message',
      title: 'Nouveau message de Lucie Martin',
      description: 'Excellent choix ! Les proportions sont parfaites...',
      timestamp: '2026-02-06T08:30:00Z',
      read: false,
      icon: '💬',
      action: {
        label: 'Voir le message',
        link: '/dashboard/messagerie'
      }
    }
  ],
  total: 11,
  unread_count: 3
}
```

**Logique métier :**
1. Query `notifications` WHERE `user_id` AND `deleted_at IS NULL`
2. JOIN `notification_types` pour les icônes et templates
3. Filtrer par type si `filter` spécifié (note : `reminder` inclut aussi `hydration`)
4. Ordonner par `created_at DESC`
5. Pagination

**Fichier :** `/src/app/api/protected/notifications/route.ts`

#### Endpoint 7.1.2 : Marquer comme lu

**Route :** `PATCH /api/protected/notifications/[id]/read`

**Logique métier :**
1. Vérifier ownership
2. Mettre à jour `is_read = true`, `read_at = NOW()`

**Fichier :** `/src/app/api/protected/notifications/[id]/read/route.ts`

#### Endpoint 7.1.3 : Tout marquer comme lu

**Route :** `POST /api/protected/notifications/read-all`

**Logique métier :**
1. UPDATE `notifications` SET `is_read = true` WHERE `user_id` AND `is_read = false`

**Fichier :** `/src/app/api/protected/notifications/read-all/route.ts`

#### Endpoint 7.1.4 : Supprimer une notification

**Route :** `DELETE /api/protected/notifications/[id]`

**Logique métier :** Soft delete (`deleted_at = NOW()`)

**Fichier :** `/src/app/api/protected/notifications/[id]/route.ts`

#### Endpoint 7.1.5 : Tout supprimer

**Route :** `POST /api/protected/notifications/clear-all`

**Fichier :** `/src/app/api/protected/notifications/clear-all/route.ts`

---

### Module 7.2 : Compteur non lus (sidebar)

#### Endpoint 7.2.1 : Compteur de notifications non lues

**Route :** `GET /api/protected/notifications/unread-count`

**Response :**
```typescript
{ count: 3 }
```

**Frontend appelant :**
- Sidebar badge notifications
- Optimiser avec Supabase Realtime si possible

**Fichier :** `/src/app/api/protected/notifications/unread-count/route.ts`

---

### Module 7.3 : Triggers de création automatique

Les notifications sont créées automatiquement par des triggers ou des side-effects dans les API existantes :

| Événement | Type notification | Trigger |
|-----------|------------------|---------|
| Nouveau message reçu | `message` | Side-effect dans POST `/conversations/[id]/messages` |
| RDV dans 24h | `appointment` | Cron job / Supabase Edge Function |
| RDV terminé | `appointment` | Side-effect lors du changement de status |
| Plan alimentaire modifié | `plan` | Side-effect nutritionniste |
| Pas de pesée depuis 5 jours | `reminder` | Cron job quotidien |
| Hydratation < 50% à 17h | `hydration` | Cron job quotidien |
| Badge débloqué | `achievement` | Side-effect dans `unlock_badge()` |
| Streak milestone (7, 14, 30 jours) | `achievement` | Side-effect dans `update_streak()` |
| Nouveau contenu publié | `content` | Side-effect publication |
| Création de compte | `system` | Side-effect dans signup |

**Implémentation recommandée :**
- Créer une fonction helper `createNotification(userId, typeCode, data)` réutilisable
- Les triggers DB PostgreSQL peuvent appeler des fonctions Supabase Edge Functions
- Pour les rappels temporels : Supabase cron extensions ou Edge Functions programmées

---

### Module 7.4 : Intégration Frontend

**Fichier :** `/src/app/[locale]/dashboard/patient/notifications/page.tsx`

**Hooks à créer :**
```typescript
// hooks/useNotifications.ts
export function useNotifications(filter?: string) { /* GET /api/protected/notifications */ }
export function useUnreadNotificationsCount() { /* GET /api/protected/notifications/unread-count */ }
export function useMarkAsRead() { /* PATCH .../notifications/:id/read */ }
export function useMarkAllAsRead() { /* POST .../notifications/read-all */ }
export function useDeleteNotification() { /* DELETE .../notifications/:id */ }
export function useClearAllNotifications() { /* POST .../notifications/clear-all */ }
```

**Changements :**
1. Supprimer `getNotifications()` de `mock-notifications.ts`
2. Remplacer `useEffect` + dispatch par `useNotifications()` hook
3. Connecter chaque action (mark read, delete, clear) à une mutation
4. Formater les timestamps ISO en relatif côté frontend

---

### Critères de validation Phase 7

**Backend :**
- [ ] CRUD notifications complet
- [ ] Filtrage par type fonctionnel
- [ ] Compteur non lus exact
- [ ] Soft delete
- [ ] Helper `createNotification()` réutilisable
- [ ] Au moins 3 triggers automatiques fonctionnels

**Frontend :**
- [ ] Page Notifications connectée à l'API
- [ ] Mock `mock-notifications.ts` plus importé
- [ ] Badge sidebar avec compteur réel

**Endpoints :** 6 au total
- `GET /api/protected/notifications`
- `PATCH /api/protected/notifications/[id]/read`
- `POST /api/protected/notifications/read-all`
- `DELETE /api/protected/notifications/[id]`
- `POST /api/protected/notifications/clear-all`
- `GET /api/protected/notifications/unread-count`

---

## Phase 8 : Plan Alimentaire (PLAN)

**Priorité :** Haute (Must Have)
**Impact :** Page `/dashboard/patient/plan`
**Mock à remplacer :** 8 fonctions de `mock-meal-plan.ts`

### Vue d'ensemble

Cette phase implémente la gestion du plan alimentaire personnalisé :
- Vue quotidienne (repas détaillés avec aliments et alternatives)
- Vue hebdomadaire (résumé par jour)
- Informations du plan (créateur, objectif, dates)
- Demandes de modification au nutritionniste
- Génération de liste de courses

**Frontend déjà implémenté :**
- Page `/dashboard/patient/plan` (PLAN-001 à PLAN-007) ✅
- Composants : MealCard, WeeklyMealGrid, ShoppingListModal, ModificationRequestModal ✅

**Tables Supabase existantes** (migration `10_meal_plans_enhanced.sql`) :
- `meal_plans` (plan principal)
- `meal_plan_days` (jours du plan)
- `meal_plan_meals` (repas par jour)
- `meal_plan_meal_foods` (aliments par repas)
- `meal_plan_alternatives` (alternatives)
- `plan_modification_requests` (demandes de modification)
- `plan_adherence` (suivi d'adhérence)

---

### Module 8.1 : Consultation du plan

#### Endpoint 8.1.1 : Informations du plan actif

**Route :** `GET /api/protected/meal-plans/current`

**Response :**
```typescript
{
  id: 'uuid',
  creator: {
    name: 'Lucie Martin',
    initials: 'LM',
    role: 'nutritionist'
  },
  lastUpdated: '2026-01-20T10:00:00Z',
  objective: 'Rééquilibrage alimentaire progressif avec perte de -7kg',
  isActive: true,
  weekStart: '2026-01-20',
  weekEnd: '2026-01-26'
}
```

**Logique métier :**
1. Query `meal_plans` WHERE `patient_id` AND `status = 'active'`
2. JOIN `profiles` pour le créateur
3. Retourner le plan actif

**Fichier :** `/src/app/api/protected/meal-plans/current/route.ts`

#### Endpoint 8.1.2 : Plan du jour

**Route :** `GET /api/protected/meal-plans/[id]/daily?date=2026-01-29`

**Response :**
```typescript
{
  date: '2026-01-29',
  targets: {
    calories: 2100,
    protein: 120,
    carbs: 250,
    fat: 70,
    fiber: 30,
    sodium: 2300
  },
  meals: {
    'petit-dejeuner': {
      id: 'uuid',
      label: 'Petit-déjeuner',
      icon: '🌅',
      time: '07:00 - 08:30',
      targetCalories: 500,
      foods: [
        {
          id: 'uuid',
          name: 'Flocons d\'avoine',
          quantity: '60g',
          calories: 234,
          protein: 7.9,
          carbs: 39.8,
          fat: 4.1,
          category: 'feculents-cereales',
          alternatives: [
            { id: 'uuid', name: 'Muesli sans sucre', quantity: '50g' }
          ]
        }
      ]
    },
    // dejeuner, collation, diner
  },
  micronutrients: [
    { id: 'fibres', name: 'Fibres', value: 28, target: 30, unit: 'g', status: 'warning' }
  ]
}
```

**Logique métier :**
1. Calculer le `day_number` basé sur la date et `start_date` du plan
2. Query `meal_plan_days` → `meal_plan_meals` → `meal_plan_meal_foods`
3. JOIN `food_items` pour les détails nutritionnels
4. JOIN `meal_plan_alternatives` pour les alternatives

**Fichier :** `/src/app/api/protected/meal-plans/[id]/daily/route.ts`

#### Endpoint 8.1.3 : Plan hebdomadaire

**Route :** `GET /api/protected/meal-plans/[id]/weekly?weekStart=2026-01-20`

**Response :**
```typescript
{
  weekStart: '2026-01-20',
  weekEnd: '2026-01-26',
  targets: { calories: 2100, protein: 120, carbs: 250, fat: 70 },
  days: [
    {
      date: '2026-01-20',
      dayName: 'Lundi',
      totalCalories: 2050,
      meals: {
        'petit-dejeuner': { summary: 'Porridge aux fruits', calories: 480 },
        'dejeuner': { summary: 'Salade César au poulet', calories: 650 },
        'collation': { summary: 'Pomme + amandes', calories: 200 },
        'diner': { summary: 'Saumon grillé + légumes', calories: 720 }
      }
    }
    // ... 7 jours
  ]
}
```

**Fichier :** `/src/app/api/protected/meal-plans/[id]/weekly/route.ts`

---

### Module 8.2 : Demandes de modification

#### Endpoint 8.2.1 : Lister les demandes

**Route :** `GET /api/protected/meal-plans/[id]/modification-requests`

**Response :**
```typescript
{
  requests: [
    {
      id: 'uuid',
      createdAt: '2026-01-22T10:00:00Z',
      meal: 'dejeuner',
      mealLabel: 'Déjeuner',
      food: 'Brocolis vapeur',
      reason: 'Je n\'aime pas les brocolis, puis-je les remplacer ?',
      status: 'reviewed',
      nutritionistResponse: 'Remplacez par des haricots verts.',
      respondedAt: '2026-01-22T14:00:00Z'
    }
  ]
}
```

**Fichier :** `/src/app/api/protected/meal-plans/[id]/modification-requests/route.ts`

#### Endpoint 8.2.2 : Créer une demande

**Route :** `POST /api/protected/meal-plans/[id]/modification-requests`

**Request body :**
```typescript
{
  meal?: 'petit-dejeuner' | 'dejeuner' | 'collation' | 'diner',
  mealLabel?: string,
  food?: string,
  reason: string
}
```

**Logique métier :**
1. Valider le body
2. Insérer dans `plan_modification_requests` avec `status = 'pending'`
3. Créer une notification pour le nutritionniste
4. Retourner la demande créée

**Fichier :** `/src/app/api/protected/meal-plans/[id]/modification-requests/route.ts` (export POST)

---

### Module 8.3 : Liste de courses

#### Endpoint 8.3.1 : Générer la liste de courses

**Route :** `POST /api/protected/meal-plans/[id]/shopping-list`

**Request body :**
```typescript
{
  weekStart: '2026-01-20',
  weekEnd: '2026-01-26'
}
```

**Response :**
```typescript
{
  weekStart: '2026-01-20',
  weekEnd: '2026-01-26',
  totalItems: 28,
  categories: [
    {
      id: 'legumes',
      name: 'Légumes',
      icon: '🥬',
      items: [
        {
          id: 'uuid',
          name: 'Brocolis',
          quantity: '500g',
          weeklyQuantity: '500g',
          occurrences: 3,
          checked: false
        }
      ]
    }
    // 8 catégories
  ]
}
```

**Logique métier :**
1. Récupérer tous les `meal_plan_meal_foods` pour la semaine
2. Agréger par aliment (somme des quantités)
3. Grouper par catégorie alimentaire
4. Retourner avec quantités totales

**Fichier :** `/src/app/api/protected/meal-plans/[id]/shopping-list/route.ts`

---

### Module 8.4 : Intégration Frontend

**Fichier :** `/src/app/[locale]/dashboard/patient/plan/page.tsx`

**Hooks à créer :**
```typescript
// hooks/useMealPlan.ts
export function useCurrentPlan() { /* GET /api/protected/meal-plans/current */ }
export function useDailyPlan(planId: string, date: string) { /* GET .../daily */ }
export function useWeeklyPlan(planId: string, weekStart?: string) { /* GET .../weekly */ }
export function useModificationRequests(planId: string) { /* GET .../modification-requests */ }
export function useCreateModificationRequest(planId: string) { /* POST */ }
export function useShoppingList(planId: string) { /* POST .../shopping-list */ }
```

**Changements :**
1. Supprimer toutes les importations de `mock-meal-plan.ts`
2. `getCurrentWeekDays()` et `formatWeekRange()` sont des utilitaires purs → déplacer dans `lib/date-utils.ts`
3. Connecter chaque vue au hook correspondant
4. Loading states pour chaque section

---

### Critères de validation Phase 8

**Backend :**
- [ ] Plan actif récupéré avec métadonnées
- [ ] Vue quotidienne avec aliments détaillés et alternatives
- [ ] Vue hebdomadaire avec résumés
- [ ] Demandes de modification CRUD
- [ ] Liste de courses générée correctement (agrégation)
- [ ] Notification nutritionniste sur nouvelle demande

**Frontend :**
- [ ] Page Plan 100% connectée
- [ ] Mock `mock-meal-plan.ts` plus importé
- [ ] Demande de modification fonctionnelle
- [ ] Liste de courses générée depuis l'API

**Endpoints :** 6 au total
- `GET /api/protected/meal-plans/current`
- `GET /api/protected/meal-plans/[id]/daily`
- `GET /api/protected/meal-plans/[id]/weekly`
- `GET /api/protected/meal-plans/[id]/modification-requests`
- `POST /api/protected/meal-plans/[id]/modification-requests`
- `POST /api/protected/meal-plans/[id]/shopping-list`

---

## Phase 9 : Recettes & Base d'Aliments (REC/FOOD)

**Priorité :** Moyenne (Should Have)
**Impact :** Pages `/dashboard/patient/recettes` et `/dashboard/patient/aliments`
**Mock à remplacer :** `getRecipes()`, `getShoppingList()` de `mock-recipes.ts` + `mockFoodsDatabase`, `defaultRecentSearches`, `defaultFavorites`, `getFavoriteFoods()` de `mock-foods-database.ts`

### Vue d'ensemble

Cette phase implémente :
- **Recettes :** Catalogue de recettes avec filtres, favoris, détails
- **Base d'aliments hybride :** Approche à deux sources complémentaires :
  - **Base interne `food_items`** : Aliments bruts/naturels (fruits, légumes, viandes, etc.) avec données nutritionnelles fiables et validées par les nutritionnistes
  - **Open Food Facts (OFF)** : Produits transformés/emballés du commerce suisse (Migros, Coop, Aldi, etc.) avec code-barres, Nutri-Score, NOVA Group via l'API externe gratuite
- **Scanner code-barres :** Scan → recherche OFF par barcode → données nutritionnelles instantanées

**API externe :** [Open Food Facts API v2](https://openfoodfacts.github.io/openfoodfacts-server/api/) - Base de données ouverte (3M+ produits, Open Database License, gratuit)

**Frontend déjà implémenté :**
- Page `/dashboard/patient/recettes` (REC-001 à REC-005) ✅
- Page `/dashboard/patient/aliments` (FOOD-001 à FOOD-005) ✅

**Tables Supabase existantes** (migrations `04_foods_database.sql`, `05_recipes.sql`, `12_shopping_lists.sql`) :
- `food_items` + `food_portions` (base d'aliments interne)
- `favorite_foods` (favoris utilisateur)
- `recipes` + `recipe_ingredients` + `recipe_steps` (recettes)
- `recipe_categories` + `recipe_tags` + `recipe_tag_assignments`
- `recipe_favorites` + `recipe_ratings` + `recipe_history`
- `shopping_lists` + `shopping_list_categories` + `shopping_list_items`

**Table Supabase à créer :**
- `off_products_cache` (cache local des produits Open Food Facts consultés)

---

### Module 9.1 : Catalogue de recettes

#### Endpoint 9.1.1 : Lister les recettes

**Route :** `GET /api/protected/recipes?category=all&difficulty=all&limit=20&offset=0&search=poulet`

**Query params :**
- `category` : slug catégorie ou `all`
- `difficulty` : `Facile` | `Moyen` | `Difficile` | `all`
- `time` : `< 15 min` | `15-30 min` | `30-60 min` | `> 1h` | `all`
- `diet` : `Sans gluten` | `Végétarien` | `Végan` | etc.
- `search` : recherche texte libre
- `sort` : `popular` | `newest` | `calories_asc` | `calories_desc`
- `limit`, `offset`

**Response :**
```typescript
{
  recipes: [
    {
      id: 'uuid',
      title: 'Porridge aux fruits rouges',
      image: '/images/recipes/porridge.jpg',
      category: 'petit-dejeuner',
      time: '15 min',
      difficulty: 'Facile',
      calories: 380,
      protein: 12,
      carbs: 58,
      fat: 8,
      rating: 4.8,
      reviews: 24,
      isFavorite: false,
      isRecommended: true,
      tags: ['Végétarien', 'Riche en fibres']
    }
  ],
  total: 45,
  categories: [
    { id: 'petit-dejeuner', label: 'Petit-déjeuner', count: 8 }
  ]
}
```

**Logique métier :**
1. Query `recipes` WHERE `status = 'published'`
2. JOIN `recipe_categories`, `recipe_tag_assignments` + `recipe_tags`
3. LEFT JOIN `recipe_favorites` pour `isFavorite`
4. Filtrer par catégorie, difficulté, temps, régime, recherche
5. Trier selon le paramètre `sort`
6. Pagination

**Fichier :** `/src/app/api/protected/recipes/route.ts`

#### Endpoint 9.1.2 : Détail d'une recette

**Route :** `GET /api/protected/recipes/[id]`

**Response :**
```typescript
{
  id: 'uuid',
  title: 'Porridge aux fruits rouges',
  // ... tous les champs du listing +
  ingredients: [
    { name: 'Flocons d\'avoine', quantity: '60g' },
    { name: 'Lait d\'amande', quantity: '200ml' }
  ],
  steps: [
    'Faire chauffer le lait dans une casserole',
    'Ajouter les flocons d\'avoine...'
  ],
  tips: 'Préparez les portions la veille pour un overnight oats'
}
```

**Fichier :** `/src/app/api/protected/recipes/[id]/route.ts`

#### Endpoint 9.1.3 : Favoris recettes

**Route :** `POST /api/protected/recipes/[id]/favorite` (toggle)

**Logique métier :**
- Si déjà favori → supprimer de `recipe_favorites`
- Sinon → insérer dans `recipe_favorites`

**Fichier :** `/src/app/api/protected/recipes/[id]/favorite/route.ts`

---

### Module 9.2 : Base d'aliments (page dédiée)

> **Note :** Les endpoints de base d'aliments (search, barcode, favoris) existent déjà depuis la Phase 1 (`/api/protected/foods/*`). Ce module concerne uniquement la page dédiée `/aliments` qui les utilise.

#### Endpoint 9.2.1 : Catalogue d'aliments avec catégories

**Route :** `GET /api/protected/foods?category=fruits&sort=name_asc&limit=30`

**Query params :**
- `category` : slug catégorie ou `all`
- `search` : texte libre
- `sort` : `name_asc` | `name_desc` | `calories_asc` | `calories_desc` | `protein_desc`
- `limit`, `offset`

**Response :**
```typescript
{
  foods: [
    {
      id: 'uuid',
      name: 'Banane',
      category: 'fruits',
      image: '🍌',
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      fiber: 2.6,
      per: '100g',
      brand: null,
      portions: [
        { label: '1 banane moyenne', grams: 120 },
        { label: '100g', grams: 100 }
      ],
      isFavorite: false
    }
  ],
  total: 150,
  categories: [
    { id: 'fruits', label: 'Fruits', emoji: '🍎', count: 12 }
  ]
}
```

**Logique métier :**
1. Query `food_items` avec filtres
2. JOIN `food_portions` pour les portions
3. LEFT JOIN `favorite_foods` pour `isFavorite`
4. Grouper par catégorie pour les compteurs

**Fichier :** Enrichir `/src/app/api/protected/foods/search/route.ts` ou créer `/src/app/api/protected/foods/route.ts` (GET catalog)

#### Endpoint 9.2.2 : Recherches récentes

**Route :** `GET /api/protected/foods/recent-searches`

**Response :**
```typescript
{
  searches: ['poulet', 'quinoa', 'avocat', 'fromage blanc']
}
```

**Logique métier :** Query dernières recherches distinctes depuis `food_search_history` (ou localStorage fallback)

**Fichier :** `/src/app/api/protected/foods/recent-searches/route.ts`

---

### Module 9.3 : Intégration Open Food Facts (OFF)

> **Approche hybride :** La base interne `food_items` contient les aliments bruts/naturels (validés par les nutritionnistes). L'API Open Food Facts complète avec les produits transformés/emballés du commerce. Les résultats de recherche fusionnent les deux sources de manière transparente pour le patient.

#### Architecture du proxy API

```
Patient (frontend)
  │
  ├─ Recherche texte ──> GET /api/protected/foods/search
  │                        ├─ 1. Chercher dans food_items (base interne)
  │                        ├─ 2. Chercher dans off_products_cache (cache OFF)
  │                        ├─ 3. Si < seuil résultats → appeler OFF API
  │                        └─ 4. Fusionner, dédupliquer, retourner
  │
  └─ Scan code-barres ──> GET /api/protected/foods/barcode/:barcode
                            ├─ 1. Chercher dans food_items
                            ├─ 2. Chercher dans off_products_cache
                            ├─ 3. Si introuvable → appeler OFF API
                            └─ 4. Cacher le résultat + retourner
```

#### Endpoint 9.3.1 : Recherche hybride (enrichir l'existant)

**Route :** `GET /api/protected/foods/search?query=nutella&source=all`

**Query params enrichis :**
- `source` (nouveau) : `all` | `internal` | `openfoodfacts` (default: `all`)
- `query`, `category`, `sort`, `limit`, `offset` : existants

**Response enrichie :**
```typescript
{
  foods: [
    // Résultat interne (food_items)
    {
      id: 'uuid',
      name: 'Banane',
      source: 'internal',
      // ... champs existants
    },
    // Résultat Open Food Facts
    {
      id: 'off_3017624010701',
      name: 'Nutella',
      source: 'openfoodfacts',
      barcode: '3017624010701',
      brand: 'Ferrero',
      calories: 539,
      protein: 6.3,
      carbs: 57.5,
      fat: 30.9,
      fiber: 3.4,
      per: '100g',
      image: 'https://images.openfoodfacts.org/...',
      nutriscore: 'e',
      novaGroup: 4,
      allergens: ['Lait', 'Noisettes', 'Soja'],
      isFavorite: false
    }
  ],
  total: 25,
  sources: { internal: 3, openfoodfacts: 22 }
}
```

**Logique métier :**
1. Rechercher dans `food_items` (base interne, prioritaire)
2. Rechercher dans `off_products_cache` (cache local OFF)
3. Si `source != 'internal'` et résultats insuffisants → appeler `https://world.openfoodfacts.net/api/v2/search`
4. Transformer les résultats OFF au format `food_items` unifié
5. Cacher les nouveaux produits OFF dans `off_products_cache`
6. Fusionner les résultats (internes en premier) et dédupliquer
7. LEFT JOIN `favorite_foods` pour `isFavorite`

**Fichier :** Enrichir `/src/app/api/protected/foods/search/route.ts`

#### Endpoint 9.3.2 : Lookup par code-barres (enrichir l'existant)

**Route :** `GET /api/protected/foods/barcode/[barcode]`

**Logique métier enrichie :**
1. Chercher dans `food_items` WHERE `barcode = :barcode`
2. Si trouvé → retourner (source interne prioritaire)
3. Sinon chercher dans `off_products_cache` WHERE `barcode = :barcode`
4. Si trouvé et `cached_at` < 30 jours → retourner depuis le cache
5. Sinon appeler `https://world.openfoodfacts.net/api/v2/product/{barcode}`
6. Si trouvé → transformer, cacher dans `off_products_cache`, retourner
7. Si introuvable → retourner 404

**Fichier :** Enrichir `/src/app/api/protected/foods/barcode/[barcode]/route.ts`

#### Table de cache : `off_products_cache`

```sql
CREATE TABLE off_products_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(20) UNIQUE NOT NULL,
  product_name VARCHAR(500) NOT NULL,
  brand VARCHAR(200),
  categories TEXT,
  image_url TEXT,
  -- Données nutritionnelles (pour 100g)
  calories DECIMAL(8,2),
  protein DECIMAL(8,2),
  carbs DECIMAL(8,2),
  fat DECIMAL(8,2),
  fiber DECIMAL(8,2),
  sodium DECIMAL(8,2),
  sugars DECIMAL(8,2),
  saturated_fat DECIMAL(8,2),
  -- Scores & classifications
  nutriscore_grade CHAR(1),
  nova_group SMALLINT,
  ecoscore_grade CHAR(1),
  -- Allergènes & labels
  allergens TEXT[],
  labels TEXT[],
  -- Métadonnées
  countries_tags TEXT[],
  off_last_modified TIMESTAMPTZ,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  search_keywords TSVECTOR,
  CONSTRAINT valid_nova CHECK (nova_group BETWEEN 1 AND 4),
  CONSTRAINT valid_nutriscore CHECK (nutriscore_grade IN ('a','b','c','d','e'))
);

-- Index pour la recherche full-text
CREATE INDEX idx_off_cache_search ON off_products_cache USING GIN (search_keywords);
CREATE INDEX idx_off_cache_barcode ON off_products_cache (barcode);
CREATE INDEX idx_off_cache_cached_at ON off_products_cache (cached_at);

-- RLS : lecture pour tous les authentifiés (cache partagé)
ALTER TABLE off_products_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read OFF cache"
  ON off_products_cache FOR SELECT
  TO authenticated USING (true);
```

**Fichier migration :** `database/19_off_products_cache.sql`

#### Fonction de transformation OFF → format interne

```typescript
// lib/openfoodfacts-transformers.ts

interface OFFProduct {
  code: string;
  product_name: string;
  brands?: string;
  nutriments?: Record<string, number>;
  nutriscore_grade?: string;
  nova_group?: number;
  image_front_url?: string;
  allergens_tags?: string[];
  categories_tags?: string[];
  countries_tags?: string[];
}

function transformOFFProduct(off: OFFProduct): FoodItem {
  return {
    id: `off_${off.code}`,
    name: off.product_name,
    source: 'openfoodfacts',
    barcode: off.code,
    brand: off.brands || null,
    calories: off.nutriments?.['energy-kcal_100g'] ?? null,
    protein: off.nutriments?.['proteins_100g'] ?? null,
    carbs: off.nutriments?.['carbohydrates_100g'] ?? null,
    fat: off.nutriments?.['fat_100g'] ?? null,
    fiber: off.nutriments?.['fiber_100g'] ?? null,
    sodium: off.nutriments?.['sodium_100g'] ?? null,
    per: '100g',
    image: off.image_front_url || null,
    nutriscore: off.nutriscore_grade || null,
    novaGroup: off.nova_group || null,
    allergens: (off.allergens_tags || []).map(a => a.replace('en:', '')),
  };
}
```

#### Contraintes techniques

| Contrainte | Valeur | Mitigation |
|---|---|---|
| Rate limit produits | 100 req/min | Cache `off_products_cache` (TTL 30 jours) |
| Rate limit recherche | 10 req/min | Debounce 500ms + cache résultats + recherche interne d'abord |
| User-Agent requis | Obligatoire | Header `NutriSensia/1.0 (contact@nutrisensia.ch)` |
| Qualité données | Variable | Validation des champs nutritionnels avant cache |
| Disponibilité API | Pas de SLA | Fallback sur base interne si OFF indisponible |

---

### Module 9.4 : Intégration Frontend

**Hooks à créer :**
```typescript
// hooks/useRecipes.ts
export function useRecipes(filters?: RecipeFilters) { /* GET /api/protected/recipes */ }
export function useRecipe(id: string) { /* GET /api/protected/recipes/:id */ }
export function useToggleRecipeFavorite() { /* POST /api/protected/recipes/:id/favorite */ }

// hooks/useFoodsDatabase.ts (enrichir useFoods.ts existant)
export function useFoodsCatalog(category?: string, sort?: string) { /* GET /api/protected/foods */ }
export function useRecentSearches() { /* GET /api/protected/foods/recent-searches */ }
export function useFoodSearch(query: string, source?: 'all' | 'internal' | 'openfoodfacts') {
  /* GET /api/protected/foods/search?query=...&source=... */
  /* Debounce 500ms pour respecter les rate limits OFF */
}
```

**Changements :**
1. Supprimer imports de `mock-recipes.ts` et `mock-foods-database.ts`
2. Remplacer les états locaux par les hooks React Query
3. Les favoris localStorage → API `recipe_favorites` et `favorite_foods`
4. Afficher un badge `source` sur chaque aliment (interne vs Open Food Facts)
5. Afficher Nutri-Score et NOVA Group pour les produits OFF
6. Scanner code-barres → appel endpoint enrichi avec fallback OFF

---

### Critères de validation Phase 9

**Backend :**
- [ ] Catalogue recettes avec filtres multi-critères
- [ ] Détail recette avec ingrédients et étapes
- [ ] Favoris recettes toggle
- [ ] Catalogue aliments avec catégories et tri
- [ ] Recherche full-text aliments
- [ ] Recherches récentes
- [ ] Proxy Open Food Facts fonctionnel (recherche + barcode)
- [ ] Cache OFF (`off_products_cache`) avec TTL 30 jours
- [ ] Transformation OFF → format interne correcte
- [ ] Fallback si API OFF indisponible
- [ ] Rate limits respectés (debounce + cache)

**Frontend :**
- [ ] Page Recettes connectée à l'API
- [ ] Page Aliments connectée à l'API
- [ ] Mocks `mock-recipes.ts` et `mock-foods-database.ts` plus importés
- [ ] Résultats hybrides affichés (interne + OFF) avec badge source
- [ ] Nutri-Score et NOVA Group affichés pour les produits OFF
- [ ] Scanner code-barres connecté au proxy OFF

**Endpoints :** ~6 au total (+ existants Phase 1 enrichis)
- `GET /api/protected/recipes`
- `GET /api/protected/recipes/[id]`
- `POST /api/protected/recipes/[id]/favorite`
- `GET /api/protected/foods` (catalogue enrichi)
- `GET /api/protected/foods/search` (enrichi : recherche hybride interne + OFF)
- `GET /api/protected/foods/barcode/[barcode]` (enrichi : fallback OFF)
- `GET /api/protected/foods/recent-searches`

---

## Phase 10 : Contenu Educatif (CONTENT)

**Priorité :** Basse (Could Have)
**Impact :** Page `/dashboard/patient/contenu`
**Mock à remplacer :** `mockContents`, `featuredContent`, `progressCourses`, `defaultSavedIds` de `mock-content.ts`

### Vue d'ensemble

Cette phase implémente le module de contenu éducatif :
- Catalogue de contenus (articles, vidéos, guides, podcasts)
- Contenu mis en avant
- Parcours d'apprentissage avec progression
- Favoris / contenus sauvegardés
- Filtres par type, catégorie, recherche

**Frontend déjà implémenté :**
- Page `/dashboard/patient/contenu` ✅
- Composants : ContentGrid, ContentModal, VideoPlayerModal, ContentProgressCourses ✅

**Tables Supabase existantes** (migration `13_exclusive_content.sql`) :
- `content_categories` + `content_themes`
- `exclusive_contents` + `content_theme_assignments`
- `content_saves` + `content_views`
- `learning_paths` + `learning_path_modules`
- `learning_progress` + `learning_module_completions`

---

### Module 10.1 : Catalogue de contenus

#### Endpoint 10.1.1 : Lister les contenus

**Route :** `GET /api/protected/content?type=all&category=all&search=nutrition&limit=12&offset=0`

**Query params :**
- `type` : `article` | `video` | `guide` | `podcast` | `all`
- `category` : slug catégorie ou `all`
- `search` : texte libre
- `sort` : `newest` | `popular`
- `limit`, `offset`

**Response :**
```typescript
{
  contents: [
    {
      id: 'uuid',
      type: 'video',
      title: 'Meal prep du dimanche : organiser sa semaine',
      description: 'Apprenez à préparer vos repas de la semaine...',
      image: '/images/content/meal-prep.jpg',
      category: 'recipes-tips',
      author: 'Lucie Martin',
      authorAvatar: null,
      date: '2026-01-12T10:00:00Z',
      isNew: true,
      isSaved: true,
      duration: '18 min',
      views: 1243
    }
  ],
  total: 16
}
```

**Logique métier :**
1. Query `exclusive_contents` WHERE `status = 'published'`
2. JOIN `content_categories`
3. JOIN `profiles` pour l'auteur
4. LEFT JOIN `content_saves` pour `isSaved`
5. LEFT JOIN `content_views` pour le compteur de vues
6. Filtrer et paginer

**Fichier :** `/src/app/api/protected/content/route.ts`

#### Endpoint 10.1.2 : Contenu mis en avant

**Route :** `GET /api/protected/content/featured`

**Response :**
```typescript
{
  id: 'uuid',
  type: 'article',
  title: 'Les bases d\'une alimentation équilibrée',
  // ... mêmes champs
  isFeatured: true
}
```

**Logique métier :** Query le contenu avec `is_featured = true` le plus récent

**Fichier :** `/src/app/api/protected/content/featured/route.ts`

#### Endpoint 10.1.3 : Détail d'un contenu

**Route :** `GET /api/protected/content/[id]`

**Response :** Le contenu complet avec `content_body`, `video_url`, `pdf_url` selon le type

**Side-effect :** Incrémenter le compteur de vues dans `content_views`

**Fichier :** `/src/app/api/protected/content/[id]/route.ts`

---

### Module 10.2 : Contenus sauvegardés

#### Endpoint 10.2.1 : Toggle sauvegarde

**Route :** `POST /api/protected/content/[id]/save`

**Logique métier :**
- Si déjà sauvegardé → supprimer de `content_saves`
- Sinon → insérer dans `content_saves`

**Fichier :** `/src/app/api/protected/content/[id]/save/route.ts`

---

### Module 10.3 : Parcours d'apprentissage

#### Endpoint 10.3.1 : Parcours en cours

**Route :** `GET /api/protected/courses`

**Response :**
```typescript
{
  courses: [
    {
      id: 'uuid',
      title: 'Les fondamentaux de la nutrition',
      description: 'Maîtrisez les bases pour une alimentation équilibrée',
      modules: 8,
      completedModules: 5,
      image: '/images/courses/fundamentals.jpg'
    }
  ]
}
```

**Logique métier :**
1. Query `learning_paths` WHERE `status = 'published'`
2. JOIN `learning_progress` pour la progression de l'utilisateur
3. Compter les modules complétés via `learning_module_completions`

**Fichier :** `/src/app/api/protected/courses/route.ts`

#### Endpoint 10.3.2 : Marquer un module comme complété

**Route :** `POST /api/protected/courses/[id]/modules/[moduleId]/complete`

**Logique métier :**
1. Insérer dans `learning_module_completions`
2. Recalculer `progress_percent` dans `learning_progress`
3. Si 100% → marquer comme `completed`

**Fichier :** `/src/app/api/protected/courses/[id]/modules/[moduleId]/complete/route.ts`

---

### Module 10.4 : Intégration Frontend

**Hooks à créer :**
```typescript
// hooks/useContent.ts
export function useContents(filters?: ContentFilters) { /* GET /api/protected/content */ }
export function useFeaturedContent() { /* GET /api/protected/content/featured */ }
export function useContent(id: string) { /* GET /api/protected/content/:id */ }
export function useToggleSaveContent() { /* POST .../content/:id/save */ }
export function useCourses() { /* GET /api/protected/courses */ }
export function useCompleteModule() { /* POST .../courses/:id/modules/:moduleId/complete */ }
```

**Changements :**
1. Supprimer `mockContents`, `featuredContent`, `progressCourses`, `defaultSavedIds` de `mock-content.ts`
2. Remplacer localStorage `nutrisensia-content-saved` par API `content_saves`
3. Connecter la progression des cours au backend

---

### Critères de validation Phase 10

**Backend :**
- [ ] Catalogue contenus avec filtres
- [ ] Contenu featured
- [ ] Toggle sauvegarde
- [ ] Parcours avec progression
- [ ] Compteur de vues

**Frontend :**
- [ ] Page Contenu connectée à l'API
- [ ] Mock `mock-content.ts` plus importé
- [ ] Progression des cours persistée

**Endpoints :** 7 au total
- `GET /api/protected/content`
- `GET /api/protected/content/featured`
- `GET /api/protected/content/[id]`
- `POST /api/protected/content/[id]/save`
- `GET /api/protected/courses`
- `POST /api/protected/courses/[id]/modules/[moduleId]/complete`

---

## Matrice de dépendances

### Ordre d'implémentation recommandé

```
Phase 1 (Repas) ✅ COMPLÉTÉE
  └─> Module 1.1 (CRUD Repas)
      └─> Module 1.2 (Résumé nutritionnel) ─┐
      └─> Module 1.3 (Base d'aliments)     ─┤
      └─> Module 1.4 (Intégration Frontend)─┴─> DASH-001 & DASH-003 ✅

Phase 2 (Biométrique) ✅ COMPLÉTÉE
  └─> Module 2.1 (Hydratation) ─────────────┐
      └─> Module 2.4.1 (Intégration DASH-002) ✅
  └─> Module 2.2 (Poids) ───────────────────┤
  └─> Module 2.4 (Autres biométries) ───────┤
  └─> Module 2.3 (Progression hebdo) ───────┴─> DASH-004 ✅

Phase 3 (Agenda & Messagerie) ✅ COMPLÉTÉE
  └─> Module 3.1 (Rendez-vous) ─────────────> DASH-005 ✅
  └─> Module 3.2 (Messagerie) ──────────────> DASH-006 ✅
  └─> Module 3.3 (Intégration Frontend)

Phase 4 (Objectifs & Dashboard final) ✅ COMPLÉTÉE
  └─> Module 4.1 (Objectifs) ───────────────> DASH-007 ✅
  └─> Module 4.2 (Gamification - Bonus)
  └─> Module 4.3 (Dashboard summary)
  └─> Module 4.4 (Intégration finale) ──────> Dashboard 100% ✅

Phase 5 (Dossier Médical)
  └─> Module 5.1 (Anamnèse) ────────────────> Onglet Anamnèse
  └─> Module 5.2 (Questionnaires) ──────────> Onglet Questionnaires
  └─> Module 5.3 (Documents) ───────────────> Onglet Documents + Supabase Storage
  └─> Module 5.4 (Consultations) ───────────> Onglet Consultations
  └─> Module 5.5 (Intégration Frontend) ────> Page Dossier 100%

Phase 6 (Profil Patient)
  └─> Module 6.1 (Infos personnelles) ──────> Enrichir GET/PATCH /profile
  └─> Module 6.2 (Sécurité) ────────────────> Mot de passe, sessions
  └─> Module 6.3 (Préférences) ─────────────> Notifications settings
  └─> Module 6.4 (Badges profil) ───────────> Dépend de Phase 4 (gamification API)
  └─> Module 6.5 (RGPD) ────────────────────> Export + suppression compte
  └─> Module 6.6 (Intégration Frontend) ────> Page Profil 100%

Phase 7 (Notifications)
  └─> Module 7.1 (CRUD Notifications) ──────> Page Notifications
  └─> Module 7.2 (Compteur sidebar) ────────> Badge sidebar
  └─> Module 7.3 (Triggers auto) ───────────> Dépend de Phase 3 + 4
  └─> Module 7.4 (Intégration Frontend) ────> Page Notifications 100%

Phase 8 (Plan Alimentaire)
  └─> Module 8.1 (Consultation plan) ───────> Vues quotidienne/hebdo
  └─> Module 8.2 (Demandes modification) ───> Modal modification
  └─> Module 8.3 (Liste de courses) ────────> Modal shopping list
  └─> Module 8.4 (Intégration Frontend) ────> Page Plan 100%

Phase 9 (Recettes & Aliments + Open Food Facts)
  └─> Module 9.1 (Catalogue recettes) ──────> Dépend de Phase 1 (food_items)
  └─> Module 9.2 (Base aliments page) ──────> Enrichit Phase 1 (foods API)
  └─> Module 9.3 (Open Food Facts) ─────────> Proxy API + cache + recherche hybride
  └─> Module 9.4 (Intégration Frontend) ────> Pages Recettes + Aliments 100%

Phase 10 (Contenu Éducatif)
  └─> Module 10.1 (Catalogue contenus) ─────> Page Contenu
  └─> Module 10.2 (Sauvegarde) ─────────────> Favoris
  └─> Module 10.3 (Parcours) ───────────────> Progression cours
  └─> Module 10.4 (Intégration Frontend) ───> Page Contenu 100%
```

### Dépendances inter-modules

| Module | Dépend de |
|--------|-----------|
| DASH-001 | Module 1.2 (Résumé nutritionnel) |
| DASH-002 | Module 2.1 (Hydratation) |
| DASH-003 | Module 1.1 (CRUD Repas) |
| DASH-004 | Module 2.3 (Progression hebdo) → dépend de Repas + Poids |
| DASH-005 | Module 3.1 (Rendez-vous) |
| DASH-006 | Module 3.2 (Messagerie) |
| DASH-007 | Module 4.1 (Objectifs) → dépend de Repas + Hydratation |
| Dashboard summary | Tous les modules précédents |
| Phase 5 (Dossier) | Indépendant (tables propres) |
| Phase 6 (Profil) | Phase 4 (API gamification pour badges) |
| Phase 7 (Notifications) | Phase 3 + 4 (triggers sur messages, RDV, badges) |
| Phase 8 (Plan) | Phase 1 (food_items pour détails nutritionnels) |
| Phase 9 (Recettes + OFF) | Phase 1 (food_items, favorite_foods) + API externe Open Food Facts |
| Phase 10 (Contenu) | Indépendant (tables propres) |

---

## Checklist de validation

### Avant de démarrer chaque phase

- [ ] Toutes les tables Supabase de la phase sont migrées
- [ ] RLS policies activées et testées
- [ ] Variables d'environnement configurées
- [ ] Schémas Zod créés pour validation

### Après chaque module backend

- [ ] Tous les endpoints fonctionnent (tests manuels + Postman/Insomnia)
- [ ] Validation Zod en place
- [ ] Erreurs gérées (400, 401, 403, 404, 500)
- [ ] RLS testé (utilisateur ne voit que ses données)
- [ ] Performance acceptable (< temps indiqué dans les specs)
- [ ] Code commenté et lisible

### Après chaque intégration frontend

- [ ] Données mockées supprimées
- [ ] Hooks React Query créés
- [ ] Loading states affichés
- [ ] Erreurs affichées à l'utilisateur
- [ ] Invalidation du cache après mutations
- [ ] Navigation fonctionne
- [ ] Responsive design OK (mobile + desktop)

### Validation de fin de phase

- [ ] Stories dashboard de la phase fonctionnelles
- [ ] User flow complet testé
- [ ] Pas de console errors
- [ ] Performance mesurée (Lighthouse)
- [ ] Documentation mise à jour

### Validation finale (fin Phase 4 - Dashboard)

- [x] Dashboard 100% fonctionnel (7/7 stories)
- [ ] Plus de données mockées sur le dashboard
- [ ] RLS policies testées pour les tables Phases 1-4
- [ ] Performance globale < 2s par page
- [ ] Documentation API des endpoints existants

### Validation finale (fin Phase 10 - Application complète)

- [ ] Toutes les 8 pages patient connectées à l'API
- [ ] Plus AUCUNE donnée mockée dans le code (0 imports `mock-*.ts`)
- [ ] Fichiers `mock-*.ts` supprimés ou vidés
- [ ] RLS policies testées pour TOUTES les tables
- [ ] Performance globale < 2s par page
- [ ] Tests end-to-end passent
- [ ] Documentation API complète (Swagger/OpenAPI)
- [ ] Export RGPD fonctionnel
- [ ] Suppression de compte fonctionnelle
- [ ] README mis à jour
- [ ] Code review effectué
- [ ] Prêt pour déploiement en staging

---

## Annexes

### A. Modèle de fichier API route

```typescript
// /src/app/api/protected/[module]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Schéma de validation
const schema = z.object({
  // ...
});

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const param = searchParams.get('param');

    // Business logic
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Parse & validate body
    const body = await req.json();
    const validated = schema.parse(body);

    // Insert
    const { data, error } = await supabase
      .from('table_name')
      .insert({ ...validated, user_id: session.user.id })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

---

### B. Modèle de hook React Query

```typescript
// /src/hooks/useModule.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useGetData(params?: string) {
  return useQuery({
    queryKey: ['module', params],
    queryFn: async () => {
      const response = await fetch(`/api/protected/module?param=${params}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/protected/module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module'] });
    },
  });
}

export function useUpdateData(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/protected/module/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module'] });
      queryClient.invalidateQueries({ queryKey: ['module', id] });
    },
  });
}

export function useDeleteData(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/protected/module/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module'] });
    },
  });
}
```

---

### C. Script de test RLS

```sql
-- Test RLS policies pour une table

-- 1. Se connecter en tant qu'utilisateur test
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-123"}';

-- 2. Tester la lecture (SELECT)
SELECT * FROM meals WHERE user_id = 'user-uuid-123'; -- Doit retourner des résultats
SELECT * FROM meals WHERE user_id = 'autre-user-uuid'; -- Doit retourner vide

-- 3. Tester l'insertion (INSERT)
INSERT INTO meals (user_id, type, consumed_at)
VALUES ('user-uuid-123', 'breakfast', NOW()); -- Doit réussir

INSERT INTO meals (user_id, type, consumed_at)
VALUES ('autre-user-uuid', 'breakfast', NOW()); -- Doit échouer

-- 4. Tester la mise à jour (UPDATE)
UPDATE meals SET notes = 'Test' WHERE user_id = 'user-uuid-123'; -- Doit réussir
UPDATE meals SET notes = 'Test' WHERE user_id = 'autre-user-uuid'; -- Doit échouer

-- 5. Tester la suppression (DELETE)
DELETE FROM meals WHERE user_id = 'user-uuid-123'; -- Doit réussir
DELETE FROM meals WHERE user_id = 'autre-user-uuid'; -- Doit échouer

-- Répéter pour toutes les tables sensibles
```

---

### D. Calendrier de référence (10 phases)

| Semaine | Phase | Modules | Deliverables |
|---------|-------|---------|--------------|
| **Semaine 1** | Phase 1 ✅ | Repas (MEAL) | • Tous endpoints CRUD repas<br>• Base d'aliments<br>• Résumé nutritionnel<br>• Dashboard DASH-001 & DASH-003 |
| **Semaine 2** | Phase 2 ✅ | Biométrique (BIO) | • Hydratation complète<br>• Poids & mensurations<br>• Progression hebdo<br>• Dashboard DASH-002 & DASH-004 |
| **Semaine 3** | Phase 3 ✅ | Agenda & Messagerie | • Gestion RDV complète<br>• Messagerie temps réel<br>• Dashboard DASH-005 & DASH-006 |
| **Semaine 4** | Phase 4 ✅ | Objectifs & Dashboard | • Objectifs hebdomadaires<br>• Gamification<br>• Dashboard 100% fonctionnel |
| **Semaine 5** | Phase 5 | Dossier Médical (FILE) | • Anamnèse + Questionnaires<br>• Documents (Supabase Storage)<br>• Consultations<br>• Page Dossier 100% API |
| **Semaine 6** | Phase 6 | Profil Patient (PROF) | • Profil enrichi + avatar<br>• Sécurité (password, sessions)<br>• Préférences + notifications<br>• RGPD (export, suppression) |
| **Semaine 7** | Phase 7 | Notifications (NOTIF) | • CRUD notifications<br>• Compteur sidebar<br>• Triggers automatiques<br>• Page Notifications 100% API |
| **Semaine 8** | Phase 8 | Plan Alimentaire (PLAN) | • Vues quotidienne/hebdomadaire<br>• Demandes de modification<br>• Liste de courses<br>• Page Plan 100% API |
| **Semaine 9** | Phase 9 | Recettes & Aliments (REC/FOOD) | • Catalogue recettes avec filtres<br>• Détails + favoris<br>• Intégration Open Food Facts (proxy + cache)<br>• Recherche hybride (interne + OFF)<br>• Scanner code-barres → OFF<br>• Pages Recettes + Aliments 100% API |
| **Semaine 10** | Phase 10 | Contenu Éducatif (CONTENT) | • Catalogue contenus<br>• Parcours d'apprentissage<br>• Sauvegarde + vues<br>• Page Contenu 100% API<br>• **Suppression de tous les mocks** |

---

## Fin du document

**Prochaine action recommandée :** Phases 1-4 complétées. Démarrer Phase 5 (Dossier Médical) - les tables DB existent déjà, il suffit de créer les API routes et les hooks frontend.

**Ordre de priorité recommandé :**
1. Phase 5 (Dossier) + Phase 8 (Plan Alimentaire) - Haute priorité, fonctionnalités core
2. Phase 6 (Profil) + Phase 7 (Notifications) - Priorité moyenne, qualité de vie
3. Phase 9 (Recettes & Aliments) - Enrichit l'expérience
4. Phase 10 (Contenu Éducatif) - Priorité basse, contenu additionnel

**Contact :** Pour toute question ou clarification, se référer aux USER_STORIES.md et aux schémas SQL existants dans `database/`.

**Version :** 2.0
**Dernière mise à jour :** 2026-02-06
