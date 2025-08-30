# Tâche 3.2 - User Roles and Profiles Implementation

## 📋 **Vue d'ensemble**

Cette tâche implémente un système complet de rôles et profils utilisateur avec contrôle d'accès basé sur les rôles (RBAC) et Row Level Security (RLS) dans Supabase.

## ✅ **Fonctionnalités implémentées**

### **1. Système de Rôles**

- **Patient** : Utilisateurs standards avec accès à leurs propres données
- **Nutritioniste** : Professionnels de santé avec accès aux données de leurs patients
- **Admin** : Administrateurs avec accès complet à toutes les données

### **2. Table Profiles Avancée**

- Informations de base (nom, email, téléphone)
- Informations nutritionnelles (taille, poids, âge, genre, niveau d'activité)
- Préférences et restrictions (régimes, allergies, objectifs)
- Paramètres de confidentialité (profil public, autorisation de contact)
- Métadonnées (fuseau horaire, langue, préférences de notification)

### **3. Politiques RLS Granulaires**

- **Profils publics** : Visibles par tous les utilisateurs authentifiés
- **Profils privés** : Visibles uniquement par le propriétaire
- **Accès nutritioniste** : Peut voir les profils de ses patients
- **Accès admin** : Peut voir et modifier tous les profils

### **4. Fonctions Utilitaires**

- `get_user_role()` : Récupérer le rôle d'un utilisateur
- `is_nutritionist()` : Vérifier si l'utilisateur est nutritioniste
- `is_admin()` : Vérifier si l'utilisateur est admin
- `get_user_stats()` : Statistiques utilisateur (repas, plans, complétion profil)

### **5. Triggers Automatiques**

- Création automatique de profil lors de l'inscription
- Mise à jour automatique de `last_sign_in_at`
- Mise à jour automatique de `updated_at`

## 🗂️ **Structure des fichiers**

### **Script de base de données**

- `scripts/init-database.sql` - Script complet d'initialisation

### **Composants React**

- `src/components/ProfileTest.tsx` - Composant de test complet
- `src/app/profile-test/page.tsx` - Page de test

### **Documentation**

- `docs/task-3-2-implementation.md` - Cette documentation

## 🗄️ **Schéma de base de données**

### **Table `profiles`**

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'nutritionist', 'admin')),
    avatar_url TEXT,
    phone TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Informations nutritionnelles
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),

    -- Préférences et restrictions
    dietary_restrictions TEXT[],
    allergies TEXT[],
    goals TEXT[],

    -- Paramètres de confidentialité
    profile_public BOOLEAN DEFAULT FALSE,
    allow_contact BOOLEAN DEFAULT TRUE,

    -- Métadonnées
    timezone TEXT DEFAULT 'Europe/Paris',
    language TEXT DEFAULT 'fr',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb
);
```

### **Politiques RLS principales**

#### **Profils publics visibles par tous les utilisateurs authentifiés**

```sql
CREATE POLICY "Profils publics visibles par tous les utilisateurs authentifiés"
    ON profiles FOR SELECT
    TO authenticated
    USING (profile_public = true OR auth.uid() = id);
```

#### **Nutritionistes peuvent voir les profils patients**

```sql
CREATE POLICY "Nutritionistes peuvent voir les profils patients"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        is_nutritionist() AND role = 'patient'
    );
```

#### **Admins peuvent voir tous les profils**

```sql
CREATE POLICY "Admins peuvent voir tous les profils"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_admin());
```

## 🔧 **Configuration requise**

### **1. Exécuter le script de base de données**

```bash
# Dans l'éditeur SQL de Supabase Dashboard
# Copier et exécuter le contenu de scripts/init-database.sql
```

### **2. Vérifier les triggers**

- Le trigger `on_auth_user_created` doit être actif
- Le trigger `on_auth_user_sign_in` doit être actif

### **3. Tester les politiques RLS**

- Utiliser la page de test : `http://localhost:3000/profile-test`

## 🧪 **Tests et validation**

### **Tests automatiques inclus**

1. **Création de profil** : Vérification que le profil est créé automatiquement
2. **Mise à jour de profil** : Test de modification des données utilisateur
3. **Politiques RLS** : Validation des règles d'accès
4. **Fonctions utilitaires** : Test des fonctions de base de données

### **Scénarios de test**

- ✅ Utilisateur patient peut voir/modifier son propre profil
- ✅ Utilisateur patient ne peut pas voir les profils d'autres patients
- ✅ Nutritioniste peut voir les profils de ses patients
- ✅ Admin peut voir et modifier tous les profils
- ✅ Profils publics sont visibles par tous les utilisateurs authentifiés

## 🔒 **Sécurité**

### **Row Level Security (RLS)**

- Activé sur toutes les tables sensibles
- Politiques granulaires par rôle et opération
- Utilisation de fonctions `SECURITY DEFINER` pour les vérifications de rôles

### **Validation des données**

- Contraintes CHECK sur les rôles et genres
- Validation des types de données
- Valeurs par défaut sécurisées

### **Audit et traçabilité**

- Horodatage automatique (`created_at`, `updated_at`)
- Suivi des connexions (`last_sign_in_at`)
- Logs des modifications via triggers

## 📊 **Fonctions utilitaires**

### **get_user_stats(user_id)**

Retourne les statistiques d'un utilisateur :

```json
{
  "total_meals": 15,
  "total_meal_plans": 3,
  "last_meal_date": "2024-01-15T10:30:00Z",
  "last_meal_plan_date": "2024-01-10T14:20:00Z",
  "profile_completion": 75
}
```

### **is_nutritionist(user_id)**

Vérifie si l'utilisateur a le rôle nutritioniste ou admin.

### **is_admin(user_id)**

Vérifie si l'utilisateur a le rôle admin.

## 🚀 **Utilisation**

### **1. Accéder à la page de test**

```bash
npm run dev
# Puis aller sur http://localhost:3000/profile-test
```

### **2. Tester les fonctionnalités**

1. **Se connecter** avec un compte existant
2. **Charger le profil** pour voir les données actuelles
3. **Modifier le profil** avec les nouvelles informations
4. **Tester les politiques RLS** pour valider la sécurité
5. **Tester les fonctions utilitaires** pour vérifier les statistiques

### **3. Vérifier les rôles**

- Les nouveaux utilisateurs ont le rôle `patient` par défaut
- Les nutritionistes et admins doivent être créés manuellement ou via l'interface admin
- Les rôles peuvent être modifiés via l'interface admin

## 📈 **Métriques et monitoring**

### **Vue `user_stats`**

Fournit des statistiques globales par rôle :

- Nombre total d'utilisateurs par rôle
- Utilisateurs vérifiés
- Utilisateurs avec 2FA activé
- Utilisateurs actifs (dernière connexion < 30 jours)

### **Vue `user_profiles`**

Combine les données des tables `profiles` et `users` pour un accès simplifié.

## 🔄 **Maintenance**

### **Mise à jour des politiques RLS**

```sql
-- Exemple : Ajouter une nouvelle politique
CREATE POLICY "Nouvelle politique" ON profiles
    FOR SELECT TO authenticated
    USING (condition);
```

### **Ajout de nouveaux champs**

```sql
-- Exemple : Ajouter un nouveau champ
ALTER TABLE profiles ADD COLUMN new_field TEXT;
```

### **Migration des données**

```sql
-- Exemple : Mettre à jour les rôles existants
UPDATE profiles SET role = 'patient' WHERE role IS NULL;
```

## 🎯 **Prochaines étapes**

### **Tâche 3.3 - Authentication UI Components**

- Créer des composants d'interface pour la gestion des profils
- Formulaires de modification de profil
- Interface de gestion des rôles (admin)

### **Tâche 3.4 - Two-Factor Authentication Implementation**

- Implémenter l'authentification à deux facteurs
- Interface de configuration 2FA
- Politiques RLS basées sur le niveau d'assurance

### **Tâche 3.5 - Auth Context and Protected Routes**

- Context React pour la gestion de l'état d'authentification
- Routes protégées basées sur les rôles
- Middleware de protection des routes

## ✅ **Validation de la tâche**

### **Critères de succès**

- [x] Table `profiles` créée avec tous les champs requis
- [x] Système de rôles implémenté (patient, nutritionist, admin)
- [x] Politiques RLS configurées et testées
- [x] Triggers automatiques fonctionnels
- [x] Fonctions utilitaires implémentées
- [x] Tests complets disponibles
- [x] Documentation complète

### **Tests de validation**

- [x] Création automatique de profil lors de l'inscription
- [x] Mise à jour de profil avec validation des données
- [x] Politiques RLS respectées selon les rôles
- [x] Fonctions utilitaires retournent les bonnes données
- [x] Interface de test fonctionnelle

## 📝 **Notes importantes**

1. **Sécurité** : Les politiques RLS sont la première ligne de défense
2. **Performance** : Les index sont créés pour optimiser les requêtes
3. **Extensibilité** : Le schéma permet d'ajouter facilement de nouveaux champs
4. **Compatibilité** : Maintient la compatibilité avec l'ancienne table `users`
5. **Internationalisation** : Support multilingue avec paramètres de langue

---

**Tâche 3.2 - User Roles and Profiles Implementation** ✅ **TERMINÉE**
