# Guide de Test des API Endpoints

Ce document explique comment tester les endpoints API de NutriSensia.

## Prérequis

1. **Serveur de développement démarré**
   ```bash
   npm run dev
   ```

2. **Un utilisateur patient connecté** (pour obtenir un token de session)
   - Créer un compte patient via l'interface
   - Ou utiliser un compte existant

3. **Outil de test API** (au choix)
   - Postman
   - Insomnia
   - cURL (ligne de commande)
   - Extension VSCode REST Client

---

## Tests Phase 1 - Endpoints Repas

### Prérequis : Récupérer le token de session

Les endpoints `/api/protected/*` nécessitent une authentification via cookies Supabase.

**Option A : Utiliser le navigateur**
1. Se connecter via l'interface web
2. Ouvrir les DevTools → Application → Cookies
3. Copier les cookies `sb-*` (session tokens)

**Option B : Via l'API login** (si endpoint existe)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

---

### 1. POST /api/protected/meals - Créer un repas

#### Prérequis : Avoir des aliments dans la table `foods`

Vérifier qu'il existe des aliments dans la base de données :

```sql
SELECT id, name_fr, brand, calories, proteins, carbohydrates, fat
FROM foods
LIMIT 5;
```

Si aucun aliment, en insérer quelques-uns :

```sql
INSERT INTO foods (name_fr, brand, calories, proteins, carbohydrates, fat, fiber)
VALUES
  ('Flocons d''avoine', 'Migros Bio', 389, 13.2, 66.3, 6.9, 10.6),
  ('Banane', NULL, 89, 1.1, 22.8, 0.3, 2.6),
  ('Lait écrémé', 'Emmi', 35, 3.4, 5.0, 0.1, 0),
  ('Poulet (blanc)', NULL, 165, 31.0, 0, 3.6, 0),
  ('Riz basmati', 'Uncle Ben''s', 360, 8.0, 79.0, 0.6, 1.5);
```

#### Requête cURL

```bash
curl -X POST http://localhost:3000/api/protected/meals \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "type": "breakfast",
    "consumed_at": "2026-01-29T08:30:00Z",
    "notes": "Petit-déjeuner équilibré",
    "location": "home",
    "foods": [
      {
        "food_id": "UUID_FLOCONS_AVOINE",
        "quantity": 80,
        "unit": "g"
      },
      {
        "food_id": "UUID_BANANE",
        "quantity": 120,
        "unit": "g"
      },
      {
        "food_id": "UUID_LAIT",
        "quantity": 200,
        "unit": "ml"
      }
    ]
  }'
```

**Remplacer les UUID** par les vrais IDs des aliments de votre base de données.

#### Réponse attendue (201 Created)

```json
{
  "id": "abc123...",
  "user_id": "user123...",
  "type": "breakfast",
  "consumed_at": "2026-01-29T08:30:00",
  "total_calories": 450,
  "total_protein": 25.2,
  "total_carbs": 85.1,
  "total_fat": 8.3,
  "notes": "Petit-déjeuner équilibré",
  "location": "home",
  "photo_url": null,
  "created_at": "2026-01-29T08:31:00Z",
  "foods": [
    {
      "id": "mf1...",
      "food_id": "...",
      "food_name": "Flocons d'avoine",
      "brand": "Migros Bio",
      "quantity": 80,
      "unit": "g",
      "calories": 311,
      "protein": 10.56,
      "carbs": 53.04,
      "fat": 5.52
    },
    {
      "id": "mf2...",
      "food_id": "...",
      "food_name": "Banane",
      "brand": null,
      "quantity": 120,
      "unit": "g",
      "calories": 106,
      "protein": 1.32,
      "carbs": 27.36,
      "fat": 0.36
    }
  ]
}
```

#### Tests à effectuer

- [ ] ✅ Création avec 1 aliment → Success 201
- [ ] ✅ Création avec 3 aliments → Success 201
- [ ] ✅ Totaux nutritionnels correctement calculés
- [ ] ✅ Vérifier dans la BDD que `daily_nutrition_summary` est mise à jour
- [ ] ❌ Body vide → Erreur 400 "Données invalides"
- [ ] ❌ food_id inexistant → Erreur 404 "Aucun aliment trouvé"
- [ ] ❌ Sans authentification → Erreur 401 "Authentification requise"

**Vérification dans la BDD :**

```sql
-- Vérifier le repas créé
SELECT * FROM meals WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC LIMIT 1;

-- Vérifier les aliments du repas
SELECT mf.*, f.name
FROM meal_foods mf
JOIN foods f ON f.id = mf.food_id
WHERE meal_id = 'MEAL_ID_FROM_ABOVE';

-- Vérifier le résumé quotidien
SELECT *
FROM daily_nutrition_summary
WHERE user_id = 'YOUR_USER_ID'
AND date = '2026-01-29';
```

---

### 2. GET /api/protected/meals - Lister les repas

#### Requête cURL (sans filtres)

```bash
curl -X GET "http://localhost:3000/api/protected/meals" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

#### Réponse attendue (200 OK)

```json
{
  "meals": [
    {
      "id": "meal1...",
      "type": "breakfast",
      "consumed_at": "2026-01-29T08:30:00",
      "total_calories": 450,
      "total_protein": 25.2,
      "total_carbs": 85.1,
      "total_fat": 8.3,
      "food_count": 3,
      "has_photo": false,
      "location": "home"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### Requête avec filtres

```bash
# Filtrer par date
curl -X GET "http://localhost:3000/api/protected/meals?date=2026-01-29" \
  -b cookies.txt

# Filtrer par type
curl -X GET "http://localhost:3000/api/protected/meals?type=breakfast" \
  -b cookies.txt

# Pagination
curl -X GET "http://localhost:3000/api/protected/meals?limit=10&offset=0" \
  -b cookies.txt

# Combinaison de filtres
curl -X GET "http://localhost:3000/api/protected/meals?date=2026-01-29&type=lunch" \
  -b cookies.txt
```

#### Tests à effectuer

- [ ] ✅ Liste tous les repas sans filtre
- [ ] ✅ Filtre par date fonctionne (date=2026-01-29)
- [ ] ✅ Filtre par type fonctionne (type=breakfast)
- [ ] ✅ Pagination fonctionne (limit=10&offset=0)
- [ ] ✅ Tri chronologique inversé (le plus récent en premier)
- [ ] ✅ Compteur `total` correct
- [ ] ✅ `food_count` correct pour chaque repas
- [ ] ❌ Date invalide → Erreur 400
- [ ] ❌ Type invalide → Erreur 400
- [ ] ❌ Sans authentification → Erreur 401

---

## Tests avec Postman

### Collection Postman

Créer une collection avec les requests suivantes :

1. **POST Create Meal**
   - Method: POST
   - URL: `{{baseUrl}}/api/protected/meals`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "type": "breakfast",
       "consumed_at": "2026-01-29T08:30:00Z",
       "notes": "Test meal",
       "foods": [
         {
           "food_id": "{{foodId1}}",
           "quantity": 100,
           "unit": "g"
         }
       ]
     }
     ```

2. **GET List Meals**
   - Method: GET
   - URL: `{{baseUrl}}/api/protected/meals`

3. **GET List Meals (filtered)**
   - Method: GET
   - URL: `{{baseUrl}}/api/protected/meals?date=2026-01-29&type=breakfast`

### Variables d'environnement Postman

```json
{
  "baseUrl": "http://localhost:3000",
  "foodId1": "uuid-aliment-1",
  "foodId2": "uuid-aliment-2"
}
```

---

## Tests avec VSCode REST Client

Créer un fichier `api-tests.http` :

```http
### Variables
@baseUrl = http://localhost:3000
@foodId1 = UUID_ALIMENT_1
@foodId2 = UUID_ALIMENT_2

### POST Create Meal
POST {{baseUrl}}/api/protected/meals
Content-Type: application/json

{
  "type": "lunch",
  "consumed_at": "2026-01-29T12:30:00Z",
  "notes": "Déjeuner au bureau",
  "location": "work",
  "foods": [
    {
      "food_id": "{{foodId1}}",
      "quantity": 150,
      "unit": "g"
    },
    {
      "food_id": "{{foodId2}}",
      "quantity": 200,
      "unit": "g"
    }
  ]
}

### GET List All Meals
GET {{baseUrl}}/api/protected/meals

### GET List Meals (filtered by date)
GET {{baseUrl}}/api/protected/meals?date=2026-01-29

### GET List Meals (filtered by type)
GET {{baseUrl}}/api/protected/meals?type=breakfast

### GET List Meals (pagination)
GET {{baseUrl}}/api/protected/meals?limit=10&offset=0
```

---

## Debugging

### Logs du serveur

Surveiller les logs dans le terminal où `npm run dev` tourne :

```bash
# Les logs devraient afficher :
POST /api/protected/meals 201 in 234ms
GET /api/protected/meals?date=2026-01-29 200 in 56ms
```

### Erreurs courantes

| Erreur | Cause probable | Solution |
|--------|---------------|----------|
| 401 Unauthorized | Pas de cookie de session | Se connecter via l'interface et copier les cookies |
| 404 Aucun aliment trouvé | food_id inexistant | Vérifier les IDs dans la table `foods` |
| 400 Données invalides | Body mal formaté | Vérifier le JSON et les types |
| 500 Erreur serveur | Problème BDD/Trigger | Vérifier les logs serveur |

### Vérifier l'authentification

```bash
# Tester si l'utilisateur est authentifié
curl -X GET http://localhost:3000/api/protected/user \
  -b cookies.txt
```

---

## Prochaines étapes

Après avoir validé ces tests, implémenter les endpoints suivants :

1. `GET /api/protected/meals/[id]` - Détail d'un repas
2. `PATCH /api/protected/meals/[id]` - Modifier un repas
3. `DELETE /api/protected/meals/[id]` - Supprimer un repas
4. `GET /api/protected/meals/daily-summary` - Résumé nutritionnel quotidien
5. `GET /api/protected/meals/check` - Vérifier l'état des repas du jour

---

**Date de dernière mise à jour :** 2026-01-29
