# Scripts de Base de Données NutriSensia

Ce dossier contient les scripts SQL et les outils de déploiement pour la base de données NutriSensia.

## 📁 Structure des Fichiers

```
scripts/
├── user-profiles-schema.sql          # Schéma principal des profils utilisateur
├── test-user-profiles-schema.sql     # Tests de validation du schéma
├── deploy-user-profiles.sh           # Script de déploiement automatisé
└── README.md                         # Ce fichier
```

## 🚀 Déploiement Rapide

### Prérequis

1. **Variables d'environnement** configurées :

   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   export SUPABASE_ANON_KEY="your-anon-key"
   ```

2. **Scripts exécutables** :
   ```bash
   chmod +x scripts/deploy-user-profiles.sh
   ```

### Déploiement Automatique

```bash
# Déploiement complet
./scripts/deploy-user-profiles.sh

# Mode dry-run (validation sans exécution)
./scripts/deploy-user-profiles.sh --dry-run

# Tests uniquement
./scripts/deploy-user-profiles.sh --test

# Aide
./scripts/deploy-user-profiles.sh --help
```

## 📋 Déploiement Manuel

### Via Supabase Dashboard

1. Ouvrir le **SQL Editor** dans votre projet Supabase
2. Copier le contenu de `user-profiles-schema.sql`
3. Exécuter le script
4. Copier et exécuter `test-user-profiles-schema.sql`

### Via CLI Supabase

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à votre projet
supabase login
supabase link --project-ref your-project-ref

# Exécuter le script
supabase db push --file scripts/user-profiles-schema.sql
```

## 🧪 Tests et Validation

### Tests Automatisés

Le script de test valide automatiquement :

- ✅ **Existence des tables** : Vérifie que toutes les tables sont créées
- ✅ **Contraintes** : Valide les clés étrangères et contraintes
- ✅ **Index** : Vérifie les index de performance
- ✅ **Triggers** : Teste les triggers automatiques
- ✅ **RLS** : Valide les politiques de sécurité
- ✅ **Fonctions** : Teste les fonctions utilitaires
- ✅ **Performance** : Mesure les temps de réponse

### Tests Manuels Recommandés

```sql
-- Vérifier la création automatique de profils
SELECT * FROM profiles WHERE role = 'nutritionist';

-- Tester les vues utilitaires
SELECT * FROM nutritionist_profiles LIMIT 5;
SELECT * FROM patient_profiles LIMIT 5;

-- Vérifier les politiques RLS
-- (Ces tests nécessitent une session authentifiée)
```

## 🔧 Configuration

### Variables d'Environnement

| Variable                    | Description                              | Exemple                                   |
| --------------------------- | ---------------------------------------- | ----------------------------------------- |
| `SUPABASE_URL`              | URL de votre projet Supabase             | `https://abc123.supabase.co`              |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé de service pour les opérations admin | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_ANON_KEY`         | Clé anonyme pour les tests               | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Fichier .env

Créer un fichier `.env` dans le dossier `scripts/` :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

## 📊 Structure de la Base de Données

### Tables Principales

1. **`profiles`** - Profils de base de tous les utilisateurs
2. **`nutritionists`** - Informations professionnelles des nutritionnistes
3. **`patients`** - Informations médicales et abonnements des patients

### Vues Utilitaires

- **`nutritionist_profiles`** - Vue complète des profils nutritionnistes
- **`patient_profiles`** - Vue complète des profils patients

### Fonctions

- **`get_user_profile(user_id)`** - Récupère le profil complet d'un utilisateur
- **`calculate_age(birth_date)`** - Calcule l'âge à partir de la date de naissance

## 🔒 Sécurité

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS activées :

- **Profils** : Utilisateurs voient/modifient leur propre profil
- **Nutritionnistes** : Accès aux patients assignés
- **Patients** : Accès à leur nutritionniste assigné
- **Admins** : Accès complet à toutes les données

### Chiffrement

- Données sensibles chiffrées avec AES-256
- Mots de passe gérés par Supabase Auth
- Clés de chiffrement sécurisées

## 🚨 Dépannage

### Erreurs Courantes

#### 1. Erreur de Connexion

```
❌ Impossible de se connecter à Supabase
```

**Solution** : Vérifier les variables d'environnement

#### 2. Erreur de Permissions

```
❌ Permission denied
```

**Solution** : Utiliser la clé de service (service_role_key)

#### 3. Erreur de Contraintes

```
❌ Constraint violation
```

**Solution** : Vérifier les données d'entrée et les contraintes

### Logs et Debug

```bash
# Mode verbose pour plus de détails
DEBUG=1 ./scripts/deploy-user-profiles.sh

# Vérifier la connexion
curl -H "apikey: $SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/"
```

## 📈 Performance

### Index Optimisés

- Index sur les champs fréquemment utilisés
- Index composites pour les requêtes complexes
- Optimisation pour les jointures

### Monitoring

```sql
-- Vérifier les performances
EXPLAIN ANALYZE SELECT * FROM profiles WHERE role = 'nutritionist';

-- Vérifier l'utilisation des index
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('profiles', 'nutritionists', 'patients');
```

## 🔄 Migrations

### Ajout de Nouvelles Tables

1. Créer le script SQL dans `scripts/`
2. Ajouter les tests correspondants
3. Mettre à jour le script de déploiement
4. Tester en mode dry-run
5. Déployer en production

### Modification de Tables Existantes

```sql
-- Exemple d'ajout de colonne
ALTER TABLE profiles ADD COLUMN new_field VARCHAR(100);

-- Exemple de modification de contrainte
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_gender_check;
ALTER TABLE patients ADD CONSTRAINT patients_gender_check
    CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say', 'non_binary'));
```

## 📚 Documentation

- **Documentation complète** : `docs/task-4-1-implementation.md`
- **API Supabase** : [Documentation officielle](https://supabase.com/docs)
- **PostgreSQL** : [Documentation officielle](https://www.postgresql.org/docs/)

## 🤝 Support

Pour toute question ou problème :

1. Consulter la documentation dans `docs/`
2. Vérifier les logs d'erreur
3. Tester en mode dry-run
4. Consulter la documentation Supabase

---

**Dernière mise à jour** : 2025-01-27  
**Version** : 1.0.0
