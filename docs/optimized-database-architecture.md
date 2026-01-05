# Architecture de Base de Données Optimisée - NutriSensia

## 📋 Vue d'Ensemble

Cette documentation décrit la nouvelle architecture de base de données optimisée pour NutriSensia, conçue pour éliminer la redondance et améliorer la maintenabilité.

## 🚨 Problèmes de l'Ancienne Architecture

### **Redondance des Données**

- Tables `users` et `profiles` avec des informations similaires
- Duplication des champs email, nom, etc.

### **Table `profiles` Surchargée**

- Contenait des données spécifiques aux patients (height_cm, weight_kg, etc.)
- Mélange des données d'authentification et métier

### **Manque de Séparation des Responsabilités**

- Pas de distinction claire entre les données auth et business
- Difficile à maintenir et faire évoluer

## ✅ Nouvelle Architecture Optimisée

### **1. Table `profiles` - Authentification Uniquement**

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'nutritionist', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Responsabilités :**

- Informations d'authentification uniquement
- Rôles utilisateur
- États de sécurité (2FA, email vérifié)

### **2. Table `nutritionists` - Profils Professionnels Complets**

```sql
CREATE TABLE nutritionists (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

    -- Informations personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'fr-CH',
    timezone TEXT DEFAULT 'Europe/Zurich',

    -- Identifiants professionnels
    asca_number TEXT UNIQUE,
    rme_number TEXT UNIQUE,
    ean_code TEXT,

    -- Informations professionnelles
    specializations TEXT[],
    bio TEXT,
    consultation_rates JSONB,
    practice_address JSONB,

    -- Paramètres
    verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    max_patients INTEGER DEFAULT 100,
    profile_public BOOLEAN DEFAULT FALSE,
    allow_contact BOOLEAN DEFAULT TRUE,
    notification_preferences JSONB,

    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    onboarding_data JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Responsabilités :**

- Toutes les données spécifiques aux nutritionnistes
- Informations professionnelles complètes
- Données d'onboarding intégrées

### **3. Table `patients` - Profils Médicaux Complets**

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

    -- Informations personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'fr-CH',
    timezone TEXT DEFAULT 'Europe/Zurich',

    -- Informations médicales/nutritionnelles
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    activity_level TEXT,

    -- Préférences alimentaires
    dietary_restrictions TEXT[],
    allergies TEXT[],
    goals TEXT[],

    -- Paramètres
    profile_public BOOLEAN DEFAULT FALSE,
    allow_contact BOOLEAN DEFAULT TRUE,
    notification_preferences JSONB,

    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    onboarding_data JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Responsabilités :**

- Toutes les données spécifiques aux patients
- Informations médicales et nutritionnelles
- Données d'onboarding intégrées

## 🔍 Vues Pratiques

### **Vue `nutritionist_profiles`**

Combine les données d'authentification et professionnelles :

```sql
CREATE VIEW nutritionist_profiles AS
SELECT
    p.id, p.email, p.role, p.email_verified, p.two_factor_enabled,
    n.first_name, n.last_name, n.phone, n.specializations,
    n.verified, n.is_active, n.onboarding_completed
FROM profiles p
JOIN nutritionists n ON p.id = n.id;
```

### **Vue `patient_profiles`**

Combine les données d'authentification et médicales :

```sql
CREATE VIEW patient_profiles AS
SELECT
    p.id, p.email, p.role, p.email_verified, p.two_factor_enabled,
    pt.first_name, pt.last_name, pt.age, pt.gender,
    pt.dietary_restrictions, pt.goals, pt.onboarding_completed
FROM profiles p
JOIN patients pt ON p.id = pt.id;
```

## 🔐 Sécurité (RLS)

### **Politiques de Sécurité**

```sql
-- Profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT USING ((SELECT auth.uid()) = id);

-- Nutritionists
CREATE POLICY "Nutritionists can manage their own data"
    ON nutritionists FOR ALL USING ((SELECT auth.uid()) = id);

CREATE POLICY "Public can view verified nutritionist profiles"
    ON nutritionists FOR SELECT
    USING (verified = true AND profile_public = true);

-- Patients
CREATE POLICY "Patients can manage their own data"
    ON patients FOR ALL USING ((SELECT auth.uid()) = id);
```

## 📊 Avantages de la Nouvelle Architecture

### **✅ Élimination de la Redondance**

- Plus de duplication entre `users` et `profiles`
- Une seule source de vérité par type de données

### **✅ Séparation Claire des Responsabilités**

- `profiles` : Authentification uniquement
- `nutritionists` : Données professionnelles
- `patients` : Données médicales

### **✅ Meilleure Maintenabilité**

- Structure plus claire et logique
- Évolution plus facile
- Moins de risques d'incohérence

### **✅ Performance Optimisée**

- Index spécialisés par type d'utilisateur
- Requêtes plus efficaces
- Moins de jointures inutiles

### **✅ Onboarding Intégré**

- Données d'onboarding directement dans les tables métier
- Suivi de progression simplifié
- Pas de table intermédiaire nécessaire

## 🚀 Migration

### **1. Sauvegarde**

```bash
# Créer une sauvegarde complète
pg_dump -h your-host -U postgres -d postgres > backup_before_migration.sql
```

### **2. Exécution Automatique**

```bash
# Exécuter le script de migration
chmod +x scripts/execute-migration.sh
./scripts/execute-migration.sh
```

### **3. Exécution Manuelle**

```sql
-- Dans le SQL Editor de Supabase
-- Copier et exécuter : scripts/migration-to-optimized-schema.sql
```

### **4. Vérification**

```bash
# Tester la nouvelle architecture
node test-optimized-architecture.js
```

## 🔧 Adaptation du Code

### **Types TypeScript Mis à Jour**

```typescript
// Nouveaux types dans src/types/onboarding.ts
interface BaseProfile {
  id: string;
  email: string;
  role: 'patient' | 'nutritionist' | 'admin';
  email_verified: boolean;
  two_factor_enabled: boolean;
}

interface NutritionistProfile {
  id: string;
  first_name: string;
  last_name: string;
  // ... autres champs
}

interface CompleteNutritionistProfile
  extends BaseProfile,
    NutritionistProfile {}
```

### **Code d'Onboarding Adapté**

```typescript
// Nouvelle sauvegarde directe dans nutritionists
const { error } = await supabase.from('nutritionists').upsert({
  id: user.id,
  first_name: data.firstName,
  last_name: data.lastName,
  // ... toutes les données en une fois
  onboarding_completed: true,
  onboarding_data: data,
});
```

## 📋 Checklist Post-Migration

### **Vérifications Techniques**

- [ ] Tables créées correctement
- [ ] Données migrées sans perte
- [ ] Index et contraintes appliqués
- [ ] Politiques RLS fonctionnelles
- [ ] Vues accessibles

### **Tests Fonctionnels**

- [ ] Authentification fonctionne
- [ ] Onboarding nutritionniste complet
- [ ] Onboarding patient complet
- [ ] Sauvegarde progressive
- [ ] Affichage des profils

### **Performance**

- [ ] Temps de réponse acceptables
- [ ] Requêtes optimisées
- [ ] Pas de N+1 queries

## 🆘 Dépannage

### **Erreur "Table not found"**

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'nutritionists', 'patients');
```

### **Erreur "Column does not exist"**

```sql
-- Vérifier la structure d'une table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'nutritionists';
```

### **Problèmes RLS**

```sql
-- Vérifier les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles', 'nutritionists', 'patients');
```

## 📞 Support

En cas de problème avec la migration :

1. **Vérifiez les logs** dans la console Supabase
2. **Consultez la documentation** Supabase officielle
3. **Restaurez depuis la sauvegarde** si nécessaire
4. **Contactez l'équipe** de développement

---

**📅 Dernière mise à jour :** Septembre 2025  
**👥 Équipe :** Architecture NutriSensia  
**🔄 Version :** 2.0 - Architecture Optimisée
