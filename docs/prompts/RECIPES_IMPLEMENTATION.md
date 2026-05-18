# Recettes NutriSensia — Document d'implémentation

> **Version 1.0** | 31 mars 2026 | Brainstorm validé avec le Product Owner

---

## 1. Vision produit

Les recettes sont une **feature premium** de NutriSensia qui connecte le savoir-faire du nutritionniste à la cuisine quotidienne du patient. Contrairement aux apps de recettes classiques, chaque recette est **nutritionnellement traçable** grâce à la base CIQUAL et **alignée avec le plan alimentaire** du patient.

### Principes directeurs

1. **Tout est calculé** — Chaque ingrédient est lié à la base CIQUAL, les macros/micros sont calculés automatiquement
2. **Le nutritionniste est l'auteur** — Les recettes viennent du professionnel, pas d'un algorithme
3. **Intégration plan ↔ recettes** — Une recette peut être liée à un repas du plan et loggée en un clic
4. **Simple à créer, riche à consommer** — UX minimaliste pour le nutri, expérience immersive pour le patient

---

## 2. Décisions UX (brainstorm 2026-03-31)

| Décision                      | Choix                                                                       | Raison                                                                              |
| ----------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Plats composés CIQUAL (~200)  | Intégrés dans la **Base aliments et plats** (renommage), PAS comme recettes | Ce sont des fiches nutritionnelles sans ingrédients/étapes — pas de vraies recettes |
| Renommage sidebar             | "Base aliments" → "Base aliments et plats"                                  | Inclut désormais les plats composés CIQUAL                                          |
| Position navigation           | Recettes (pos. 7) au-dessus de Contenu exclusif (pos. 10)                   | Déjà en place, pas de changement nécessaire                                         |
| Ratings/commentaires patients | OUI — même pattern que le contenu éducatif                                  | Feedback utile au nutri, engagement patient                                         |
| Liste de courses              | OUI — génération auto depuis recettes sélectionnées pour la semaine         | Killer feature, très demandée                                                       |
| Logger recette comme repas    | OUI — bouton "J'ai cuisiné cette recette" → pré-remplit le journal          | Pont recettes ↔ journal alimentaire                                                 |
| Mode cuisine pas-à-pas        | Nice-to-have (V2)                                                           | Focus V1 sur le CRUD et l'intégration plan                                          |
| Sources de recettes           | Nutritionniste uniquement (pas de recettes communautaires)                  | Contexte médical, responsabilité du professionnel                                   |
| Workflow publication          | Brouillon → Publié (pas de planification pour les recettes)                 | Simplicité vs contenu éducatif                                                      |

---

## 3. Architecture technique

### 3.1 Schéma de base de données

```sql
-- ============================================================================
-- Table principale des recettes
-- ============================================================================
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES nutritionist_profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,                          -- Vignette (obligatoire pour publier)
  category recipe_category NOT NULL,       -- petit-dejeuner, dejeuner, diner, collation, dessert, boisson
  difficulty recipe_difficulty NOT NULL DEFAULT 'medium',  -- easy, medium, hard
  prep_time INTEGER NOT NULL DEFAULT 0,    -- minutes
  cook_time INTEGER NOT NULL DEFAULT 0,    -- minutes
  total_time INTEGER GENERATED ALWAYS AS (prep_time + cook_time) STORED,
  servings INTEGER NOT NULL DEFAULT 4,

  -- Valeurs nutritionnelles calculées (par portion)
  calories_per_serving NUMERIC(8,2),
  protein_per_serving NUMERIC(8,2),
  carbs_per_serving NUMERIC(8,2),
  fat_per_serving NUMERIC(8,2),
  fiber_per_serving NUMERIC(8,2),

  -- Métadonnées
  tags TEXT[] DEFAULT '{}',               -- tags libres
  diet_types TEXT[] DEFAULT '{}',         -- sans-gluten, sans-lactose, vegetarien, vegan, pauvre-en-sel, riche-en-proteines
  tips TEXT,                              -- astuces du chef
  status recipe_status NOT NULL DEFAULT 'draft',  -- draft, published

  -- Statistiques (dénormalisées pour performance)
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- ============================================================================
-- Ingrédients de recette (liés à CIQUAL)
-- ============================================================================
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),      -- Lien CIQUAL (nullable pour ingrédients manuels)
  name TEXT NOT NULL,                      -- Nom affiché (pré-rempli depuis CIQUAL ou saisi manuellement)
  quantity NUMERIC(8,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',          -- g, ml, unité, c.à.s, c.à.c, pincée, etc.
  quantity_grams NUMERIC(8,2),            -- Équivalent en grammes (pour calcul nutritionnel)
  is_optional BOOLEAN DEFAULT false,
  group_name TEXT,                         -- Regroupement : "Pour la sauce", "Pour la garniture", etc.
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Valeurs nutritionnelles de cet ingrédient (calculées)
  calories NUMERIC(8,2),
  protein NUMERIC(8,2),
  carbs NUMERIC(8,2),
  fat NUMERIC(8,2)
);

-- ============================================================================
-- Étapes de préparation
-- ============================================================================
CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  duration_minutes INTEGER,               -- Durée optionnelle (pour timers V2)
  image_url TEXT,                          -- Photo optionnelle de l'étape

  UNIQUE(recipe_id, step_number)
);

-- ============================================================================
-- Favoris patient
-- ============================================================================
CREATE TABLE recipe_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(patient_id, recipe_id)
);

-- ============================================================================
-- Évaluations patient
-- ============================================================================
CREATE TABLE recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(patient_id, recipe_id)
);

-- ============================================================================
-- Recommandations du nutritionniste à un patient
-- ============================================================================
CREATE TABLE recipe_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES nutritionist_profiles(id),
  note TEXT,                              -- Message personnalisé du nutri
  meal_plan_meal_id UUID,                 -- Lien optionnel vers un repas du plan
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(recipe_id, patient_id)
);

-- ============================================================================
-- Liste de courses (persistée côté serveur)
-- ============================================================================
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Ma liste de courses',
  week_start DATE,                        -- Semaine concernée (optionnel)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  name TEXT NOT NULL,
  quantity NUMERIC(8,2),
  unit TEXT,
  category TEXT,                          -- Fruits & légumes, Protéines, Épicerie, etc.
  is_checked BOOLEAN DEFAULT false,
  recipe_id UUID REFERENCES recipes(id),  -- D'où vient cet ingrédient
  sort_order INTEGER DEFAULT 0
);

-- ============================================================================
-- Enums
-- ============================================================================
CREATE TYPE recipe_category AS ENUM (
  'petit-dejeuner', 'dejeuner', 'diner', 'collation', 'dessert', 'boisson'
);

CREATE TYPE recipe_difficulty AS ENUM ('easy', 'medium', 'hard');

CREATE TYPE recipe_status AS ENUM ('draft', 'published');
```

### 3.2 RLS Policies

```sql
-- Nutritionniste : CRUD sur ses propres recettes
CREATE POLICY "Nutritionists manage own recipes"
ON recipes FOR ALL TO authenticated
USING (
  nutritionist_id IN (
    SELECT id FROM nutritionist_profiles WHERE user_id = auth.uid()
  )
);

-- Patient : lecture des recettes publiées de SON nutritionniste
CREATE POLICY "Patients read own nutritionist recipes"
ON recipes FOR SELECT TO authenticated
USING (
  status = 'published'
  AND nutritionist_id IN (
    SELECT pp.nutritionist_id FROM patient_profiles pp
    WHERE pp.user_id = auth.uid()
  )
);

-- Favoris, ratings, shopping : patient gère les siens
-- Assignments : nutri crée, patient lit les siens
```

### 3.3 Structure fichiers

```
src/
├── types/
│   └── recipes.ts                    # ← REFACTO : types DB + transform functions
├── lib/
│   └── api-schemas.ts                # ← AJOUT : schemas Zod recettes
├── hooks/
│   ├── useNutritionistRecipes.ts     # CRUD nutri (React Query)
│   ├── usePatientRecipes.ts          # Browse patient (React Query)
│   └── useShoppingList.ts            # Liste de courses (React Query)
├── app/
│   ├── api/protected/
│   │   ├── nutritionist/recipes/     # API nutritionniste
│   │   │   ├── route.ts              # GET (list) + POST (create)
│   │   │   ├── [recipeId]/
│   │   │   │   ├── route.ts          # GET + PATCH + DELETE
│   │   │   │   ├── ingredients/route.ts  # PUT (bulk upsert)
│   │   │   │   ├── steps/route.ts    # PUT (bulk upsert)
│   │   │   │   ├── publish/route.ts  # POST (publish)
│   │   │   │   └── duplicate/route.ts    # POST
│   │   │   ├── assignments/route.ts  # POST (recommander à patient)
│   │   │   └── stats/route.ts        # GET (stats engagement)
│   │   └── recipes/                  # API patient
│   │       ├── route.ts              # GET (browse published)
│   │       ├── [recipeId]/
│   │       │   ├── route.ts          # GET (detail)
│   │       │   ├── favorite/route.ts # POST/DELETE (toggle)
│   │       │   ├── rating/route.ts   # POST/PATCH (noter)
│   │       │   └── log-meal/route.ts # POST (logger comme repas)
│   │       ├── favorites/route.ts    # GET (mes favoris)
│   │       ├── recommended/route.ts  # GET (recommandées par mon nutri)
│   │       └── shopping-list/        # Liste de courses
│   │           ├── route.ts          # GET + POST
│   │           └── [itemId]/route.ts # PATCH + DELETE
│   └── [locale]/dashboard/
│       ├── patient/
│       │   ├── recettes/page.tsx     # ← REFACTO : brancher sur API
│       │   └── aliments/page.tsx     # ← RENOMMER label sidebar
│       └── nutritionist/
│           └── recettes/page.tsx     # ← NOUVEAU : gestion recettes nutri
├── components/
│   ├── recipes/                      # ← REFACTO : composants patient
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeModal.tsx           # ← enrichir (nutrition, log meal)
│   │   ├── RecipeFilters.tsx
│   │   ├── RecipesTabs.tsx
│   │   ├── RecipesGrid.tsx
│   │   ├── RecipesHeader.tsx
│   │   ├── ShoppingListView.tsx      # ← REFACTO : persisté serveur
│   │   ├── RecipeRating.tsx          # NOUVEAU
│   │   └── RecipeNutritionBar.tsx    # NOUVEAU : barre macros vs plan
│   └── nutritionist/
│       └── recipes/                  # NOUVEAU : composants nutri
│           ├── RecipeForm.tsx        # Formulaire création/édition
│           ├── RecipeList.tsx        # Liste avec filtres
│           ├── RecipeIngredientEditor.tsx  # Éditeur ingrédients + CIQUAL
│           ├── RecipeStepEditor.tsx   # Éditeur étapes
│           ├── RecipeAssignModal.tsx  # Recommander à un patient
│           ├── RecipeStatsPanel.tsx   # Statistiques engagement
│           └── RecipeNutritionPreview.tsx  # Preview macros en temps réel
```

---

## 4. User Stories

### 4.1 Côté Nutritionniste (Epic 9 — suite)

---

#### RECIPE-N-001 - CRUD des recettes [Must Have] ❌

**En tant que** nutritionniste,
**Je veux** créer, modifier et supprimer des recettes,
**Afin que** mes patients aient accès à des recettes validées nutritionnellement.

**Point d'entrée** : Menu "Recettes" → `/dashboard/nutritionist/recettes`

**Critères d'acceptation** :

- [ ] Page de gestion avec liste des recettes (grille cards + vue tableau)
- [ ] Filtres : catégorie, statut (brouillon/publié), difficulté, régime
- [ ] Recherche par titre
- [ ] Formulaire de création : titre, description, catégorie, difficulté, temps prep/cuisson, portions
- [ ] Ajout d'ingrédients via **recherche CIQUAL** (réutiliser `FoodSearchModal` du plan alimentaire)
- [ ] Ingrédients avec quantité, unité, groupement optionnel ("Pour la sauce", etc.)
- [ ] Ajout d'ingrédients manuels (non-CIQUAL) avec saisie manuelle des macros
- [ ] Calcul automatique des macros/micros par portion en temps réel
- [ ] Étapes de préparation ordonnées (drag & drop pour réordonner)
- [ ] Upload de vignette obligatoire pour publier
- [ ] Upload de photo optionnelle par étape
- [ ] Tags libres et types de régime (checkboxes : sans gluten, végétarien, etc.)
- [ ] Champ "Astuces du chef" (texte libre)
- [ ] Actions : dupliquer une recette existante
- [ ] Suppression avec confirmation

**Tables DB** : `recipes`, `recipe_ingredients`, `recipe_steps`

**💡 Notes Claude Code** : Réutiliser `FoodSearchModal` et le moteur de calcul nutritionnel du plan alimentaire (`MealPlanEditor`). Pattern identique à `ContentForm` pour le workflow brouillon/publié. Le composant `RecipeIngredientEditor` doit afficher les macros en temps réel comme `MacroObjectivesCard`.

---

#### RECIPE-N-002 - Publication de recettes [Must Have] ❌

**En tant que** nutritionniste,
**Je veux** publier mes recettes quand elles sont prêtes,
**Afin que** mes patients puissent les consulter.

**Critères d'acceptation** :

- [ ] Workflow : Brouillon → Publié
- [ ] Validation avant publication : titre, ≥ 1 ingrédient, ≥ 1 étape, vignette
- [ ] Dé-publication possible (Publié → Brouillon)
- [ ] Indicateur visuel du statut dans la liste
- [ ] Date de publication affichée

---

#### RECIPE-N-003 - Recommandation de recette à un patient [Should Have] ❌

**En tant que** nutritionniste,
**Je veux** recommander une recette spécifique à un ou plusieurs patients,
**Afin de** personnaliser les conseils culinaires selon leur profil.

**Critères d'acceptation** :

- [ ] Bouton "Recommander" sur chaque recette publiée
- [ ] Modal de sélection de patients (multi-select avec recherche)
- [ ] Message personnalisé optionnel du nutri
- [ ] Lien optionnel vers un repas du plan alimentaire
- [ ] Badge "Recommandé pour vous" côté patient
- [ ] Notification au patient lors de la recommandation
- [ ] Vue nutri : liste des recommandations par recette et par patient

**Tables DB** : `recipe_assignments`

---

#### RECIPE-N-004 - Statistiques d'engagement recettes [Could Have] ❌

**En tant que** nutritionniste,
**Je veux** voir les statistiques d'engagement sur mes recettes,
**Afin de** savoir ce qui plaît et adapter ma production.

**Critères d'acceptation** :

- [ ] Nombre de vues, favoris, notes moyennes par recette
- [ ] Classement des recettes les plus populaires
- [ ] Nombre de fois "cuisiné" (logged as meal)
- [ ] Panel de stats accessible depuis la liste et le détail

**Tables DB** : `recipe_favorites`, `recipe_ratings`

---

### 4.2 Côté Patient (nouveau Epic REC)

---

#### REC-001 - Découverte des recettes [Must Have] ❌

**En tant que** patient,
**Je veux** parcourir les recettes créées par mon nutritionniste,
**Afin de** trouver l'inspiration pour cuisiner sainement.

**Point d'entrée** : Menu "Recettes" → `/dashboard/patient/recettes`

**Critères d'acceptation** :

- [ ] Grille de cards avec vignette, titre, temps, difficulté, macros rapides
- [ ] Section "Recommandées pour vous" en haut (recettes assignées par le nutri)
- [ ] Filtres rapides : catégorie (repas), difficulté, temps de préparation, régime alimentaire
- [ ] Recherche par titre/mot-clé
- [ ] Tri : plus récentes, mieux notées, plus rapides
- [ ] Badge "Nouveau" (< 7 jours)
- [ ] Badge "Recommandé par votre nutritionniste" sur les recettes assignées
- [ ] Pagination ou infinite scroll

**↔ Miroir nutritionniste** : RECIPE-N-001, RECIPE-N-003

**Statut actuel** : Page et composants UI existants avec mock data. À brancher sur l'API.

---

#### REC-002 - Détail d'une recette [Must Have] ❌

**En tant que** patient,
**Je veux** voir le détail complet d'une recette,
**Afin de** la préparer et connaître ses valeurs nutritionnelles.

**Critères d'acceptation** :

- [ ] Image hero avec infos rapides (temps, portions, difficulté)
- [ ] **Barre nutritionnelle visuelle** : calories, P/G/L par portion avec barres colorées
- [ ] Comparaison optionnelle avec les objectifs du plan alimentaire actif (% du budget calorique)
- [ ] Liste des ingrédients avec quantités ajustables (slider portions)
- [ ] Regroupement des ingrédients par section ("Pour la sauce", etc.)
- [ ] Étapes numérotées avec photos optionnelles
- [ ] Section "Astuces du chef"
- [ ] Tags (régimes compatibles)
- [ ] Actions : Favoris, Noter, Ajouter à la liste de courses, Logger comme repas

---

#### REC-003 - Favoris [Should Have] ❌

**En tant que** patient,
**Je veux** sauvegarder mes recettes favorites,
**Afin de** les retrouver rapidement.

**Critères d'acceptation** :

- [ ] Bouton cœur sur chaque card et dans le détail
- [ ] Onglet "Mes favoris" avec filtrage
- [ ] Compteur de favoris dans l'onglet
- [ ] Persistance serveur (pas localStorage)

**Tables DB** : `recipe_favorites`

---

#### REC-004 - Évaluation des recettes [Should Have] ❌

**En tant que** patient,
**Je veux** noter et commenter les recettes,
**Afin de** donner mon retour à mon nutritionniste.

**Critères d'acceptation** :

- [ ] Note 1 à 5 étoiles
- [ ] Commentaire optionnel
- [ ] Modification de sa note
- [ ] Note moyenne affichée sur la card
- [ ] Visible par le nutritionniste dans ses stats

**Tables DB** : `recipe_ratings`

---

#### REC-005 - Logger une recette comme repas [Must Have] ❌

**En tant que** patient,
**Je veux** enregistrer qu'j'ai cuisiné une recette dans mon journal alimentaire,
**Afin que** mes apports nutritionnels soient automatiquement calculés.

**Critères d'acceptation** :

- [ ] Bouton "J'ai cuisiné cette recette" dans le détail
- [ ] Choix du repas cible (petit-déjeuner, déjeuner, dîner, collation)
- [ ] Choix de la date (aujourd'hui par défaut)
- [ ] Ajustement des portions (1 portion par défaut)
- [ ] Pré-remplissage du journal avec tous les ingrédients et macros corrects
- [ ] Confirmation avec récapitulatif nutritionnel
- [ ] Lien retour depuis le journal vers la recette

**💡 Notes Claude Code** : Réutiliser l'API POST `/api/protected/meals` existante. Créer un `meal` avec les `meal_foods` correspondant aux ingrédients de la recette (liés via `food_id` CIQUAL). Ajouter `recipe_id` optionnel sur la table `meals` pour traçabilité.

---

#### REC-006 - Liste de courses [Should Have] ❌

**En tant que** patient,
**Je veux** générer une liste de courses à partir des recettes,
**Afin de** préparer mes achats pour la semaine.

**Critères d'acceptation** :

- [ ] Bouton "Ajouter à ma liste" dans le détail recette
- [ ] Onglet "Ma liste de courses" dans la page recettes
- [ ] Ingrédients regroupés par catégorie (Fruits & légumes, Protéines, Épicerie, Produits laitiers, Autre)
- [ ] Quantités cumulées si même ingrédient dans plusieurs recettes
- [ ] Checkbox pour cocher les items achetés
- [ ] Barre de progression (X/Y items)
- [ ] Indication de quelle recette vient chaque ingrédient
- [ ] Bouton "Vider la liste" avec confirmation
- [ ] Persistance serveur

**Tables DB** : `shopping_lists`, `shopping_list_items`

---

#### REC-007 - Recettes compatibles avec mon plan [Could Have] ❌

**En tant que** patient,
**Je veux** voir quelles recettes correspondent à mes objectifs nutritionnels,
**Afin de** choisir les repas les plus adaptés à mon plan.

**Critères d'acceptation** :

- [ ] Section "Compatible avec votre plan" sur la page d'accueil recettes
- [ ] Score de compatibilité (%) basé sur les macros du plan actif
- [ ] Filtre "Compatible avec mon plan" dans les filtres
- [ ] Badge visuel sur les cards (vert = < 10% écart, orange = 10-25%, pas de badge = > 25%)

**💡 Notes Claude Code** : Comparer `calories_per_serving` / `protein_per_serving` / etc. avec les objectifs journaliers du plan actif divisés par le nombre de repas. Calcul côté client pour éviter des requêtes complexes.

---

### 4.3 Renommage "Base aliments et plats"

#### ALIM-001 - Renommage de la section Base aliments [Must Have] ❌

**En tant que** patient,
**Je veux** que la base de données alimentaire inclue les plats composés CIQUAL,
**Afin de** retrouver aussi bien les aliments simples que les plats préparés.

**Critères d'acceptation** :

- [ ] Sidebar : "Base aliments" → "Aliments & plats"
- [ ] Page : inclure les plats composés CIQUAL (groupe 01) avec badge "Plat composé"
- [ ] Filtres : ajouter filtre "Type" (aliment / plat composé)
- [ ] Les plats composés affichent les mêmes infos nutritionnelles que les aliments simples

---

## 5. Ordre d'implémentation recommandé

### Phase 1 — Backend + Nutri CRUD (RECIPE-N-001, RECIPE-N-002)

1. Migration DB (tables, enums, RLS, indexes)
2. Schemas Zod dans `api-schemas.ts`
3. Types dans `types/recipes.ts` (refacto des types existants)
4. API routes nutritionniste (CRUD + publish)
5. Hook `useNutritionistRecipes.ts`
6. Composants nutritionniste (`RecipeForm`, `RecipeList`, `RecipeIngredientEditor`, `RecipeStepEditor`)
7. Page `/dashboard/nutritionist/recettes`
8. Ajouter entrée dans `NutritionistSidebar`

### Phase 2 — Patient browse + favoris (REC-001, REC-002, REC-003)

1. API routes patient (browse, detail, favorites)
2. Hook `usePatientRecipes.ts`
3. Refacto composants patient existants pour brancher sur API (remplacer mock data)
4. `RecipeNutritionBar` (nouveau composant)
5. Ajustement des portions dans le détail
6. Renommage sidebar "Aliments & plats" (ALIM-001)

### Phase 3 — Interactions + intégration plan (REC-004, REC-005, REC-006)

1. API ratings + log-meal + shopping-list
2. Composant `RecipeRating`
3. Logique "Logger comme repas" (lien avec journal alimentaire)
4. Refacto `ShoppingListView` (persistance serveur)
5. Hook `useShoppingList.ts`

### Phase 4 — Recommandations + stats (RECIPE-N-003, RECIPE-N-004, REC-007)

1. API assignments + stats
2. `RecipeAssignModal` (nutri)
3. `RecipeStatsPanel` (nutri)
4. Section "Recommandées pour vous" (patient)
5. Score de compatibilité plan (patient)

---

## 6. Composants à réutiliser

| Composant existant                       | Usage dans les recettes                             |
| ---------------------------------------- | --------------------------------------------------- |
| `FoodSearchModal` (plan alimentaire)     | Recherche CIQUAL pour les ingrédients               |
| `MacroObjectivesCard` (plan alimentaire) | Preview macros temps réel dans le formulaire nutri  |
| Pattern `ContentForm` (contenu éducatif) | Structure formulaire avec workflow brouillon/publié |
| Pattern `ContentList` (contenu éducatif) | Liste grille/tableau avec filtres                   |
| `create_notification()` RPC              | Notifications recommandation recette                |
| `DragDropContext` (@dnd-kit)             | Réordonnancement étapes et ingrédients              |

---

## 7. User Stories récapitulatif

### Nutritionniste (4 stories)

| ID           | Titre                       | Priorité    | Phase |
| ------------ | --------------------------- | ----------- | ----- |
| RECIPE-N-001 | CRUD des recettes           | Must Have   | 1     |
| RECIPE-N-002 | Publication de recettes     | Must Have   | 1     |
| RECIPE-N-003 | Recommandation à un patient | Should Have | 4     |
| RECIPE-N-004 | Statistiques d'engagement   | Could Have  | 4     |

### Patient (7 stories)

| ID      | Titre                              | Priorité    | Phase |
| ------- | ---------------------------------- | ----------- | ----- |
| REC-001 | Découverte des recettes            | Must Have   | 2     |
| REC-002 | Détail d'une recette               | Must Have   | 2     |
| REC-003 | Favoris                            | Should Have | 2     |
| REC-004 | Évaluation des recettes            | Should Have | 3     |
| REC-005 | Logger une recette comme repas     | Must Have   | 3     |
| REC-006 | Liste de courses                   | Should Have | 3     |
| REC-007 | Recettes compatibles avec mon plan | Could Have  | 4     |

### Transversal (1 story)

| ID       | Titre                        | Priorité  | Phase |
| -------- | ---------------------------- | --------- | ----- |
| ALIM-001 | Renommage "Aliments & plats" | Must Have | 2     |

**Total : 12 user stories** (5 Must Have, 4 Should Have, 3 Could Have)

---

## 8. Correspondances Patient ↔ Nutritionniste

| Feature            | Côté Patient     | Côté Nutritionniste       |
| ------------------ | ---------------- | ------------------------- |
| Browse recettes    | REC-001, REC-002 | RECIPE-N-001 (crée)       |
| Favoris            | REC-003          | RECIPE-N-004 (voit stats) |
| Évaluations        | REC-004          | RECIPE-N-004 (voit stats) |
| Logger comme repas | REC-005          | —                         |
| Liste de courses   | REC-006          | —                         |
| Recommandations    | REC-007          | RECIPE-N-003 (recommande) |
| Publication        | —                | RECIPE-N-002              |
