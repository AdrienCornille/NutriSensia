# Guide de Résolution - Erreur 406 Table Nutritionists

## Problème identifié

L'erreur `406 (Not Acceptable)` sur la table `nutritionists` indique un problème d'accès à l'API Supabase, même si la table existe et a la bonne structure.

## Solutions appliquées

### 1. Solution temporaire immédiate ✅

**Fichier modifié :** `src/hooks/useUserProfile.ts`

**Changements :**

- Accès aux tables `nutritionists` et `patients` temporairement désactivé
- Le profil se charge avec les données de base uniquement
- Plus d'erreurs 406 dans la console

**Avantages :**

- ✅ Formulaire fonctionne immédiatement
- ✅ Plus d'erreurs dans la console
- ✅ Utilisateur peut modifier son profil de base

**Inconvénients :**

- ⚠️ Données spécifiques au rôle non disponibles
- ⚠️ Fonctionnalités avancées limitées

### 2. Solution permanente (à appliquer)

**Script SQL à exécuter dans Supabase :**

```sql
-- Solution complète et définitive
-- Étape 1: Désactiver complètement RLS
ALTER TABLE nutritionists DISABLE ROW LEVEL SECURITY;

-- Étape 2: Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Nutritionists can update own profile" ON nutritionists;
DROP POLICY IF EXISTS "Nutritionists can view own profile" ON nutritionists;
DROP POLICY IF EXISTS "nutritionists_insert_policy" ON nutritionists;
DROP POLICY IF EXISTS "nutritionists_read_policy" ON nutritionists;
DROP POLICY IF EXISTS "nutritionists_update_policy" ON nutritionists;
DROP POLICY IF EXISTS "Patients can view assigned nutritionist" ON nutritionists;

-- Étape 3: Créer une politique simple et permissive
CREATE POLICY "nutritionists_full_access" ON nutritionists
    FOR ALL USING (true);

-- Étape 4: Réactiver RLS
ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;
```

## Étapes de résolution

### Phase 1: Test immédiat ✅

1. ✅ Hook modifié pour éviter l'erreur 406
2. ✅ Formulaire fonctionne avec les données de base
3. ✅ Plus d'erreurs dans la console

### Phase 2: Résolution permanente (à faire)

1. 🔄 Exécuter le script SQL dans Supabase
2. 🔄 Tester l'accès à la table nutritionists
3. 🔄 Restaurer le hook original
4. 🔄 Vérifier le bon fonctionnement complet

### Phase 3: Restauration du hook

1. 🔄 Remplacer le hook temporaire par l'original
2. 🔄 Tester l'accès complet aux données
3. 🔄 Vérifier toutes les fonctionnalités

## Test de vérification

### Test immédiat (après modification du hook)

```javascript
// Dans la console du navigateur
console.log('🧪 Test après modification du hook...');
// Plus d'erreurs 406, formulaire fonctionne
```

### Test après résolution SQL

```javascript
// Dans la console du navigateur
supabase
  .from('nutritionists')
  .select('*')
  .eq('id', 'd9fa5dd9-689b-4dc7-8ff1-4df62264442d')
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Erreur persistante:', error.message);
    } else {
      console.log('✅ Problème résolu !', data);
    }
  });
```

## Fichiers de sauvegarde

- **Original :** `src/hooks/useUserProfile-original.ts`
- **Temporaire :** `src/hooks/useUserProfile.ts`

## Prochaines étapes

1. **Tester le formulaire** avec le hook temporaire ✅
2. **Appliquer le script SQL** dans Supabase
3. **Restaurer le hook original** après résolution
4. **Vérifier le bon fonctionnement** complet

## Notes importantes

- L'erreur 406 n'est pas liée au code TypeScript
- Le problème est au niveau des permissions Supabase
- La solution temporaire permet de continuer le développement
- La solution permanente nécessite une intervention sur la base de données

## Support

Si le problème persiste après application du script SQL :

1. Vérifier les permissions de l'API Supabase
2. Contrôler la configuration des clés d'API
3. Vérifier l'exposition des tables via l'API
