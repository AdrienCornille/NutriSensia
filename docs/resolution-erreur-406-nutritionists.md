# 🚨 Guide de Résolution - Erreur 406 Table Nutritionists

## 📋 Résumé du problème

**Erreur** : `406 (Not Acceptable)` lors de l'accès à la table `nutritionists`
**Code PostgREST** : `PGRST116` - "Cannot coerce the result to a single JSON object"
**Impact** : Impossible de charger ou sauvegarder les données nutritionniste

## 🔍 Diagnostic détaillé

### ❌ **Symptômes observés**
1. Erreur 406 dans la console du navigateur
2. Code d'erreur PGRST116
3. Table `nutritionists` inaccessible en lecture et écriture
4. Formulaire ne peut pas sauvegarder les données spécifiques au rôle

### 🎯 **Causes possibles**
1. **Politiques RLS mal configurées** - Accès bloqué par Row Level Security
2. **Structure de table corrompue** - Problème de types de données
3. **Permissions insuffisantes** - Droits d'accès manquants
4. **Contraintes de validation** - Règles métier bloquant l'accès

## 🛠️ Solution en 3 étapes

### **Étape 1 : Diagnostic et correction de la base de données**

#### 1.1 Exécuter le script de diagnostic
```sql
-- Dans votre dashboard Supabase → SQL Editor
-- Exécutez le script : scripts/diagnostic-complet-nutritionists.sql
```

#### 1.2 Vérifier les résultats
Le script va :
- ✅ Vérifier l'existence et la structure de la table
- ✅ Analyser les politiques RLS
- ✅ Vérifier les permissions
- ✅ Corriger automatiquement les problèmes
- ✅ Tester l'accès à la table

#### 1.3 Résultats attendus
```
✅ Politiques supprimées. Vérification:
(0 rows)

✅ Test de lecture:
 id | asca_number | rme_number 
----+-------------+------------
(0 rows)

✅ Test d'insertion:
 id | asca_number | rme_number | specializations | created_at | updated_at
----+-------------+------------+-----------------+------------+------------
 d9fa5dd9-689b-4dc7-8ff1-4df62264442d | TEST123 | TEST456 | {nutrition,dietetics} | 2024-01-... | 2024-01-...

✅ Vérification finale:
 check_type | status
------------+--------
 RLS Status | ENABLED
 Policies Count | 1
 Data Count | 1
```

### **Étape 2 : Test de l'accès depuis l'application**

#### 2.1 Tester avec le script JavaScript
```javascript
// Dans votre navigateur, console de développement
// 1. Copiez le contenu de scripts/test-acces-nutritionists.js
// 2. Remplacez SUPABASE_ANON_KEY par votre vraie clé
// 3. Exécutez le script
```

#### 2.2 Vérifier les résultats
```
🚀 Démarrage des tests d'accès à la table nutritionists...

🧪 Test 1: Vérification de l'existence de la table...
✅ Table accessible - Nombre de lignes: 0-0/1

🧪 Test 2: Vérification de la structure...
✅ Structure accessible - Colonnes disponibles: ['id', 'asca_number', 'rme_number', ...]

🧪 Test 3: Test d'insertion...
✅ Insertion réussie: [{...}]

🧪 Test 4: Test de mise à jour...
✅ Mise à jour réussie: [{...}]

🧪 Test 5: Test de lecture authentifiée...
✅ Lecture authentifiée réussie: [{...}]

📊 RÉSULTATS DES TESTS:
========================
✅ existence: SUCCÈS
✅ structure: SUCCÈS
✅ insertion: SUCCÈS
✅ update: SUCCÈS
✅ authenticatedRead: SUCCÈS

🎯 SCORE FINAL: 5/5 tests réussis
🎉 Tous les tests sont passés! La table nutritionists est maintenant accessible.
```

### **Étape 3 : Vérification dans l'application**

#### 3.1 Recharger la page de profil
```
http://localhost:3000/profile/authenticated-test
```

#### 3.2 Vérifier les logs de la console
**Avant (erreur)** :
```
GET https://ywshijyzpmothwjnvrxi.supabase.co/rest/v1/nutritionists?select=*&id=eq.d9fa5dd9-689b-4dc7-8ff1-4df62264442d 406 (Not Acceptable)
⚠️ Erreur d'accès à la table nutritionists: Cannot coerce the result to a single JSON object
```

**Après (succès)** :
```
✅ Profil chargé: {...}
✅ Données nutritionniste chargées
```

#### 3.3 Tester la sauvegarde
1. Modifier un champ spécifique au rôle (ASCA, RME, spécialisations)
2. Sauvegarder le formulaire
3. Vérifier les logs :
```
✅ Profil de base mis à jour
🔄 Mise à jour Supabase - Table: nutritionists
📊 Données à sauvegarder: {asca_number: "12345", ...}
✅ Données spécifiques au rôle sauvegardées avec succès: [...]
```

## 🔧 Dépannage avancé

### **Problème 1 : Erreur persiste après correction**
```sql
-- Vérifier que RLS est bien configuré
SELECT relrowsecurity FROM pg_class WHERE relname = 'nutritionists';

-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'nutritionists';

-- Vérifier les permissions
SELECT grantee, privilege_type FROM information_schema.role_table_grants 
WHERE table_name = 'nutritionists';
```

### **Problème 2 : Structure de table corrompue**
```sql
-- Recréer la table si nécessaire
DROP TABLE IF EXISTS nutritionists CASCADE;
CREATE TABLE nutritionists (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    asca_number TEXT,
    rme_number TEXT,
    specializations TEXT[],
    consultation_rates JSONB,
    practice_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Problème 3 : Permissions insuffisantes**
```sql
-- Donner tous les droits à l'utilisateur authentifié
GRANT ALL ON nutritionists TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
```

## 📊 Vérification finale

### **Checklist de validation**
- [ ] Script SQL exécuté sans erreur
- [ ] Tests JavaScript tous passés (5/5)
- [ ] Page de profil se charge sans erreur 406
- [ ] Données nutritionniste se chargent correctement
- [ ] Sauvegarde fonctionne pour tous les champs
- [ ] Données persistent après rechargement

### **Logs de succès attendus**
```
✅ Profil chargé: {...}
✅ Données nutritionniste chargées
✅ Profil de base mis à jour
✅ Données spécifiques au rôle sauvegardées avec succès
```

## 🚀 Prochaines étapes

1. **Exécuter le script de diagnostic** dans Supabase
2. **Tester l'accès** avec le script JavaScript
3. **Vérifier l'application** fonctionne correctement
4. **Documenter les changements** pour l'équipe
5. **Surveiller les performances** de la table

## 📞 Support

Si le problème persiste après avoir suivi ce guide :
1. Vérifiez les logs Supabase (Dashboard → Logs)
2. Testez avec l'API REST directement
3. Vérifiez la configuration RLS et des permissions
4. Contactez l'équipe de développement

---

**🎯 Objectif** : Rétablir l'accès complet à la table `nutritionists` pour permettre la sauvegarde des données de profil nutritionniste.
