# Plan : Systeme de filtres multi-facettes pour les recettes

> Remplacement du systeme de categorie unique par un systeme de tags multi-groupes
> avec badges automatiques calcules depuis les ingredients, macros et temps.

## Architecture globale

### Principe

Chaque recette porte N tags issus de groupes differents. Trois modes d'assignation :

| Mode          | Description                                                      | Exemple                                 |
| ------------- | ---------------------------------------------------------------- | --------------------------------------- |
| **Auto**      | Calcule en temps reel depuis les donnees de la recette           | Calories, temps, profil nutritionnel    |
| **Semi-auto** | Suggere automatiquement, confirme/override par le nutritionniste | Courant alimentaire (vegan, vegetarien) |
| **Manuel**    | Choisi par le nutritionniste                                     | Saveurs, occasion, cuisine du monde     |

### Groupes de tags

| Groupe                 | Slug             | Tags                                                                                                       | Mode      | Phase |
| ---------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- | --------- | ----- |
| Calories (par portion) | `calories`       | -200, 200-300, 300-400, 400-500, 500-600, +600                                                             | Auto      | 1     |
| Temps total            | `time`           | <15min, <30min, <45min, <1h, >1h                                                                           | Auto      | 1     |
| Profil nutritionnel    | `nutrition`      | Low carb, High protein, Low fat, Riche en fibres                                                           | Auto      | 1     |
| Type de repas          | `meal-type`      | Petit-dej, Dejeuner, Diner, Encas, Post-training                                                           | Manuel    | 1     |
| Saveurs                | `flavor`         | Sucre, Sale, Sucre-sale                                                                                    | Manuel    | 1     |
| Quotidien              | `everyday`       | Meal prep, Salades, Soupes & veloutes, Pates, Fait maison, Apero healthy                                   | Manuel    | 1     |
| Plaisirs healthy       | `healthy-treats` | Barres & cookies, Energy balls, Gateaux, Boissons, Glaces, Smoothies                                       | Manuel    | 1     |
| Saison                 | `season`         | Printemps, Ete, Automne, Hiver                                                                             | Manuel    | 1     |
| Cuisine du monde       | `cuisine`        | Francaise, Mediterraneenne, Orientale, Asiatique, Mexicaine, Suisse                                        | Manuel    | 1     |
| Occasion               | `occasion`       | Paques, Noel, Halloween, Saint-Valentin, Famille, Brunch                                                   | Manuel    | 1     |
| Bien-etre              | `wellness`       | Detox, Anti-inflammatoire, Digestion & confort, Energie & recuperation                                     | Manuel    | 1     |
| Courant alimentaire    | `diet`           | Vegetarien, Vegan, Pesco-vegetarien, Paleo                                                                 | Semi-auto | 2     |
| Allergenes             | `allergen`       | Sans gluten, Sans lactose, Sans oeuf, Sans arachide, Sans fruits a coque, Sans poisson/crustace, Sans soja | Auto      | 3     |

---

## Phase 1 : Tags manuels + badges auto (calories, temps, profil nutritionnel)

### Objectif

Remplacer `recipe_categories` par le systeme de tags multi-groupes.
Calculer automatiquement les badges calories, temps et profil nutritionnel.

### 1.1 Migration DB

**Fichier** : `database/migrations/recipe_filter_system_phase1.sql`

```
Actions :
- Ajouter colonne `tag_group` a `recipe_tags` (ou reutiliser `tag_type` en l'elargissant)
- Seed tous les tags manuels (meal-type, flavor, everyday, healthy-treats, season, cuisine, occasion, wellness)
- Supprimer les anciennes categories de `recipe_categories` (ou les garder pour reference)
- Retirer `category_id` de `recipes` (ou le rendre nullable/deprecated)
- Ajouter une table `recipe_auto_tags` pour les badges calcules :
  - recipe_id, tag_group (calories|time|nutrition), tag_value (le slug du badge)
  - Recalcule a chaque save d'ingredients/recette
  - Pas de FK vers recipe_tags car les valeurs auto sont des ranges, pas des tags fixes
```

**Schema `recipe_auto_tags` :**

```sql
CREATE TABLE recipe_auto_tags (
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag_group VARCHAR(30) NOT NULL,  -- 'calories', 'time', 'nutrition'
    tag_value VARCHAR(50) NOT NULL,  -- 'cal-200-300', 'time-lt-30', 'high-protein'
    PRIMARY KEY (recipe_id, tag_group, tag_value)
);
```

**Logique de calcul auto (executee cote API a chaque save) :**

```
CALORIES (par portion) :
  cal = recipe.calories / recipe.servings
  si cal < 200       → 'cal-lt-200'
  si 200 <= cal < 300 → 'cal-200-300'
  si 300 <= cal < 400 → 'cal-300-400'
  si 400 <= cal < 500 → 'cal-400-500'
  si 500 <= cal < 600 → 'cal-500-600'
  si cal >= 600       → 'cal-gt-600'

TEMPS TOTAL :
  t = prep_time_minutes + cook_time_minutes
  si t <= 15  → 'time-lt-15'
  si t <= 30  → 'time-lt-30'
  si t <= 45  → 'time-lt-45'
  si t <= 60  → 'time-lt-60'
  si t > 60   → 'time-gt-60'

PROFIL NUTRITIONNEL (% des kcal) :
  prot_pct = (proteins_g * 4) / total_kcal * 100
  carb_pct = (carbs_g * 4) / total_kcal * 100
  fat_pct  = (fat_g * 9) / total_kcal * 100
  fiber_g  = recipe.fiber_g / recipe.servings

  si carb_pct < 25  → 'low-carb'
  si prot_pct > 30  → 'high-protein'
  si fat_pct < 20   → 'low-fat'
  si fiber_g > 6    → 'high-fiber'
```

### 1.2 API

**Modifier les routes existantes :**

- `POST /api/protected/nutritionist/recipes` :
  - Remplacer `category_id` par `tags: string[]` (array de tag IDs)
  - Apres creation, calculer et inserer les auto-tags

- `PATCH /api/protected/nutritionist/recipes/[recipeId]` :
  - Meme chose, upsert des tags manuels
  - Recalculer les auto-tags si les champs nutritionnels/temps changent

- `PUT /api/protected/nutritionist/recipes/[recipeId]/ingredients` :
  - Apres upsert des ingredients, recalculer les macros totales de la recette
  - Recalculer les auto-tags (calories, nutrition)

- `GET /api/protected/nutritionist/recipes` et `GET /api/protected/recipes` :
  - Ajouter filtres query params : `tags=tag1,tag2` (OR dans un groupe, AND entre groupes)
  - Inclure auto-tags dans la reponse

- Nouvelle route : `GET /api/protected/recipes/tags` (ou recipes/filters)
  - Retourne tous les groupes de tags avec leur comptage de recettes

**Nouvelle lib utilitaire** : `src/lib/recipe-auto-tags.ts`

- `computeCalorieTag(calories: number, servings: number): string`
- `computeTimeTag(prepTime: number, cookTime: number): string`
- `computeNutritionTags(macros: MacroValues, servings: number): string[]`
- `computeAllAutoTags(recipe: RecipeData): AutoTag[]`

### 1.3 Frontend - Nutritionniste

**RecipeForm (creation/edition) :**

- Remplacer le dropdown `category_id` par un panneau de tags multi-select
- Organise par groupes avec headers
- Affichage des badges auto dans la sidebar (non editables, recalcules en temps reel)
- Chips colorees par groupe

**RecipeFormSidebar :**

- Nouvelle section "Badges automatiques" au-dessus de la checklist
- Affiche les badges calories, temps, profil nutri en temps reel
- Icones + couleurs distinctes par groupe

**Page liste des recettes (nutritionniste) :**

- Remplacer les filtres actuels (status, difficulty) par une barre de filtres multi-facettes
- Dropdowns groupes ou chips toggleables
- Compteur de resultats

### 1.4 Frontend - Patient

**Page browse des recettes :**

- Barre de filtres horizontale avec chips par groupe
- Filtres combinables
- Badges visuels sur chaque RecipeCard
- Couleurs par groupe de tag :
  - Calories → orange
  - Temps → bleu
  - Nutrition → vert
  - Meal type → violet
  - Saveurs → rose
  - Quotidien → gris
  - Saison → teal
  - Cuisine → ambre

### 1.5 Fichiers a creer/modifier

```
CREER :
  database/migrations/recipe_filter_system_phase1.sql
  src/lib/recipe-auto-tags.ts
  src/components/nutritionist/recipes/RecipeTagSelector.tsx
  src/components/recipes/RecipeFilterBar.tsx
  src/components/recipes/RecipeTagBadges.tsx

MODIFIER :
  src/types/recipes.ts                    -- Nouveaux types pour tags/auto-tags
  src/lib/api-schemas.ts                  -- Schemas create/update sans category_id
  src/app/api/protected/nutritionist/recipes/route.ts
  src/app/api/protected/nutritionist/recipes/[recipeId]/route.ts
  src/app/api/protected/nutritionist/recipes/[recipeId]/ingredients/route.ts
  src/app/api/protected/recipes/route.ts
  src/hooks/useNutritionistRecipes.ts
  src/hooks/usePatientRecipes.ts          -- (si existe)
  src/components/nutritionist/recipes/RecipeForm.tsx
  src/components/nutritionist/recipes/RecipeFormSidebar.tsx
  src/components/nutritionist/recipes/RecipeList.tsx
  src/components/recipes/RecipeCard.tsx
  src/components/recipes/RecipeFilters.tsx
  src/app/[locale]/dashboard/nutritionist/recettes/page.tsx
  src/app/[locale]/dashboard/patient/recettes/page.tsx
```

---

## Phase 2 : Courants alimentaires (semi-auto)

### Objectif

Suggerer automatiquement les tags de courant alimentaire (vegan, vegetarien, etc.)
depuis l'analyse des ingredients, avec possibilite d'override par le nutritionniste.

### Prerequis

- Phase 1 complete
- Table de classification des aliments par origine (animale, vegetale, etc.)

### 2.1 Classification des aliments

**Ajouter colonne `origin` a `foods` :**

```sql
ALTER TABLE foods ADD COLUMN origin VARCHAR(20);
-- Valeurs : 'animal', 'dairy', 'egg', 'fish', 'seafood', 'plant', 'mixed', 'other'
```

**Mapping initial par categories CIQUAL :**

- Categories poisson/crustaces → 'fish'/'seafood'
- Categories viandes → 'animal'
- Categories oeufs → 'egg'
- Categories laits/fromages → 'dairy'
- Categories fruits/legumes/cereales → 'plant'

### 2.2 Logique de suggestion

```
VEGAN :
  Aucun ingredient avec origin IN ('animal', 'dairy', 'egg', 'fish', 'seafood')
  + aucun ingredient contenant "miel" dans le nom

VEGETARIEN :
  Aucun ingredient avec origin IN ('animal', 'fish', 'seafood')

PESCO-VEGETARIEN :
  Aucun ingredient avec origin = 'animal'

PALEO :
  Aucun ingredient avec origin = 'dairy'
  + aucun ingredient de type cereale/legumineuse
```

### 2.3 UX

- Dans RecipeForm, section "Courant alimentaire" avec chips pre-cochees
- Indicateur visuel "Suggere automatiquement" (icone eclair)
- Le nutritionniste peut decocher ou forcer un tag
- Les tags forces sont marques `is_override = true` dans `recipe_tag_assignments`

### 2.4 Fichiers a creer/modifier

```
CREER :
  database/migrations/recipe_filter_system_phase2.sql
  database/migrations/seed_food_origins.sql
  src/lib/recipe-diet-analyzer.ts

MODIFIER :
  src/lib/recipe-auto-tags.ts             -- Ajouter logique diet
  src/components/nutritionist/recipes/RecipeTagSelector.tsx
  src/types/recipes.ts
```

---

## Phase 3 : Allergenes automatiques

### Objectif

Detecter automatiquement les allergenes presents dans une recette
depuis les ingredients CIQUAL et afficher les badges "Sans X".

### Prerequis

- Phase 1 + 2 completes
- Enrichissement de la colonne `foods.allergens`

### 3.1 Enrichissement des donnees allergenes

**Nouvelle table de mapping :**

```sql
CREATE TABLE food_allergen_defaults (
    food_category_pattern VARCHAR(200),  -- Pattern LIKE sur food_categories.name
    allergens TEXT[] NOT NULL             -- Allergenes par defaut pour cette categorie
);

-- Exemples :
-- '%ble%', '%farine%', '%pain%', '%pate%' → {'gluten'}
-- '%lait%', '%fromage%', '%creme%', '%beurre%', '%yaourt%' → {'lactose'}
-- '%oeuf%', '%mayonnaise%' → {'oeuf'}
-- '%arachide%', '%cacahuete%' → {'arachide'}
-- '%noix%', '%noisette%', '%amande%', '%pistache%', '%cajou%' → {'fruits_a_coque'}
-- '%poisson%', '%saumon%', '%thon%', '%crevette%', '%crabe%' → {'poisson_crustace'}
-- '%soja%', '%tofu%', '%edamame%' → {'soja'}
```

**Script de peuplement :**

- Parcourir les noms d'aliments CIQUAL
- Matcher les patterns pour remplir `foods.allergens` en masse
- Marqueur `allergen_source = 'auto'` vs `'verified'` pour tracer la fiabilite

### 3.2 Logique de detection

```
Pour chaque allergene A dans [gluten, lactose, oeuf, arachide, fruits_a_coque, poisson_crustace, soja] :
  ingredients_with_allergen = recipe.ingredients.filter(
    ing => ing.food?.allergens?.includes(A)
  )
  ingredients_unknown = recipe.ingredients.filter(
    ing => !ing.food_id  -- pas lie a CIQUAL
  )

  si ingredients_with_allergen.length == 0 :
    si ingredients_unknown.length == 0 :
      → badge "Sans {A}" (garanti, couleur verte)
    sinon :
      → badge "Sans {A} *" (non garanti, couleur jaune avec tooltip)
  sinon :
    → pas de badge (contient l'allergene)
```

### 3.3 UX

- Badges allergenes dans la sidebar avec 3 etats visuels :
  - Vert : garanti sans (tous ingredients CIQUAL, aucun ne contient l'allergene)
  - Jaune : probable sans (ingredients non-CIQUAL presents, avertissement)
  - Absent : contient l'allergene
- Tooltip sur chaque badge indiquant quels ingredients contiennent/pourraient contenir
- Cote patient : filtrage "Sans X" qui n'inclut que les recettes vertes (garanties)

### 3.4 Fichiers a creer/modifier

```
CREER :
  database/migrations/recipe_filter_system_phase3.sql
  database/migrations/seed_food_allergen_defaults.sql
  src/lib/recipe-allergen-analyzer.ts

MODIFIER :
  src/lib/recipe-auto-tags.ts
  src/types/recipes.ts
  src/components/nutritionist/recipes/RecipeFormSidebar.tsx
  src/components/recipes/RecipeCard.tsx
  src/components/recipes/RecipeFilterBar.tsx
```

---

## Resume des phases

| Phase       | Contenu                                                                                  | Estimation stories |
| ----------- | ---------------------------------------------------------------------------------------- | ------------------ |
| **Phase 1** | Migration tags, badges auto (calories/temps/nutrition), UI multi-select, filtres patient | 8-10 stories       |
| **Phase 2** | Classification aliments par origine, detection courants alimentaires, UI semi-auto       | 4-5 stories        |
| **Phase 3** | Enrichissement allergenes CIQUAL, detection auto, badges 3 etats, filtrage patient       | 5-6 stories        |

## Dependances techniques

- Phase 1 : aucune dependance externe
- Phase 2 : necessite un mapping initial des ~3000 aliments CIQUAL par origine (script SQL)
- Phase 3 : necessite enrichissement des allergenes (script SQL + verification manuelle recommandee)
