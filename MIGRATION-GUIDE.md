# 📋 Guide de Migration - Champs de Consentement

## 🎯 Objectif
Ajouter les champs de consentement légal (RGPD) à la table `nutritionists` pour enregistrer :
- ✅ Acceptation des conditions d'utilisation
- ✅ Acceptation de la politique de confidentialité  
- ✅ Consentement marketing (optionnel)

## 🚀 Méthode 1 : Via l'interface Supabase (Recommandé)

### Étapes :
1. **Ouvrir Supabase Dashboard**
   - Aller sur [supabase.com](https://supabase.com)
   - Se connecter à votre projet NutriSensia

2. **Accéder à l'éditeur SQL**
   - Cliquer sur "SQL Editor" dans la barre latérale
   - Cliquer sur "New query"

3. **Exécuter la migration**
   - Copier le contenu de `scripts/simple-consent-migration.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" 

4. **Vérifier le résultat**
   - Aller dans "Table Editor" > "nutritionists"
   - Vérifier que les nouveaux champs sont présents :
     - `terms_accepted` (boolean)
     - `terms_accepted_at` (timestamptz)
     - `privacy_policy_accepted` (boolean)
     - `privacy_policy_accepted_at` (timestamptz)
     - `marketing_consent` (boolean)
     - `marketing_consent_at` (timestamptz)

## 🔧 Méthode 2 : Via ligne de commande (Alternative)

Si vous avez accès à `psql` :

```bash
# Charger les variables d'environnement
source .env.local

# Exécuter la migration
psql $DATABASE_URL -f scripts/simple-consent-migration.sql
```

## ✅ Vérification

Après la migration, testez :

1. **Structure de table**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'nutritionists' 
   AND column_name LIKE '%consent%' OR column_name LIKE '%accepted%';
   ```

2. **Test d'onboarding**
   - Aller sur `http://localhost:3000/onboarding/nutritionist`
   - Compléter jusqu'à l'étape de récapitulatif
   - Cocher/décocher les cases de consentement
   - Vérifier dans Supabase que les données sont enregistrées

## 🛡️ Conformité RGPD

Les nouveaux champs respectent :
- ✅ **Consentement explicite** avec horodatage
- ✅ **Distinction obligatoire/optionnel**
- ✅ **Traçabilité complète**
- ✅ **Base légale documentée**

## 🔄 Rollback (en cas de problème)

Pour annuler la migration :

```sql
ALTER TABLE nutritionists 
DROP COLUMN IF EXISTS terms_accepted,
DROP COLUMN IF EXISTS terms_accepted_at,
DROP COLUMN IF EXISTS privacy_policy_accepted,
DROP COLUMN IF EXISTS privacy_policy_accepted_at,
DROP COLUMN IF EXISTS marketing_consent,
DROP COLUMN IF EXISTS marketing_consent_at;

DROP INDEX IF EXISTS idx_nutritionists_terms_accepted;
DROP INDEX IF EXISTS idx_nutritionists_privacy_accepted;
DROP INDEX IF EXISTS idx_nutritionists_marketing_consent;
```

## 📞 Support

En cas de problème :
1. Vérifier les logs Supabase
2. Consulter la documentation Supabase
3. Vérifier que la table `nutritionists` existe bien


