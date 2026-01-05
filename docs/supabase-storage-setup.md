# Guide de Configuration du Stockage Supabase pour NutriSensia

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer le stockage Supabase pour gérer les avatars et autres fichiers dans NutriSensia.

## 🎯 Objectifs

- ✅ Créer le bucket `avatars` pour les photos de profil
- ✅ Configurer les politiques de sécurité (RLS)
- ✅ Tester l'upload et la récupération d'images
- ✅ Assurer la sécurité et les performances

## 🚀 Méthodes de Configuration

### **Méthode 1 : Interface Web Supabase (Recommandée pour débutants)**

#### **Étape 1 : Accéder à votre projet**

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet NutriSensia

#### **Étape 2 : Créer le bucket avatars**

1. Dans le menu de gauche, cliquez sur **"Storage"**
2. Cliquez sur **"New bucket"**
3. Remplissez les informations :
   - **Name** : `avatars`
   - **Public bucket** : ✅ **Cochez cette option**
   - Cliquez sur **"Create bucket"**

#### **Étape 3 : Configurer les politiques**

1. Cliquez sur le bucket `avatars` créé
2. Allez dans l'onglet **"Policies"**
3. Cliquez sur **"New policy"**
4. Utilisez le template **"Enable read access to everyone"**
5. Cliquez sur **"Review"** puis **"Save policy"**

### **Méthode 2 : Scripts Automatisés (Recommandée pour développeurs)**

#### **Étape 1 : Vérifier les variables d'environnement**

Assurez-vous que votre fichier `.env.local` contient :

```bash
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service
```

#### **Étape 2 : Exécuter le script de vérification**

```bash
node scripts/check-storage-buckets.js
```

Ce script va :

- ✅ Vérifier si le bucket `avatars` existe
- ✅ Le créer automatiquement s'il n'existe pas
- ✅ Configurer les paramètres de sécurité
- ✅ Créer d'autres buckets utiles (`documents`, `temp`)

#### **Étape 3 : Configurer les politiques de sécurité**

1. Allez dans l'éditeur SQL de votre projet Supabase
2. Copiez et exécutez le contenu de `scripts/setup-storage-policies.sql`

#### **Étape 4 : Tester la configuration**

```bash
node scripts/test-storage-upload.js
```

Ce script va :

- ✅ Tester l'upload d'un fichier de test
- ✅ Vérifier la génération d'URL publique
- ✅ Tester la liste et suppression de fichiers
- ✅ Nettoyer automatiquement les fichiers de test

## 🔧 Configuration Détaillée

### **Structure des Buckets**

```
avatars/           # Photos de profil (public)
├── user-id-1/
│   ├── avatar-1.jpg
│   └── avatar-2.png
└── user-id-2/
    └── avatar-1.webp

documents/         # Documents privés (privé)
├── user-id-1/
│   ├── rapport.pdf
│   └── plan-nutrition.docx
└── user-id-2/
    └── historique.pdf

temp/             # Fichiers temporaires (privé)
├── user-id-1/
│   └── upload-temp.jpg
└── user-id-2/
    └── draft-avatar.png
```

### **Politiques de Sécurité**

#### **Bucket Avatars (Public)**

- ✅ **Lecture** : Tout le monde peut voir les avatars
- ✅ **Upload** : Utilisateurs authentifiés uniquement
- ✅ **Mise à jour** : Propriétaire uniquement
- ✅ **Suppression** : Propriétaire uniquement

#### **Bucket Documents (Privé)**

- ✅ **Lecture** : Propriétaire uniquement
- ✅ **Upload** : Utilisateurs authentifiés uniquement
- ✅ **Mise à jour** : Propriétaire uniquement
- ✅ **Suppression** : Propriétaire uniquement

#### **Bucket Temp (Temporaire)**

- ✅ **Lecture** : Propriétaire uniquement
- ✅ **Upload** : Utilisateurs authentifiés uniquement
- ✅ **Suppression** : Propriétaire uniquement
- ✅ **Nettoyage automatique** : Fichiers supprimés après 24h

## 🧪 Tests et Validation

### **Test Manuel via l'Interface**

1. **Accédez à la page de profil** :

   ```
   http://localhost:3000/profile
   ```

2. **Testez l'upload d'avatar** :
   - Cliquez sur l'avatar existant
   - Sélectionnez une image
   - Vérifiez que l'upload fonctionne
   - Vérifiez que l'image s'affiche correctement

### **Test Automatisé**

```bash
# Test complet du stockage
node scripts/test-storage-upload.js

# Vérification des buckets
node scripts/check-storage-buckets.js
```

### **Vérification des Politiques**

Dans l'éditeur SQL de Supabase :

```sql
-- Vérifier que toutes les politiques sont en place
SELECT
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
```

## 🔒 Sécurité

### **Bonnes Pratiques**

1. **Authentification obligatoire** pour l'upload
2. **Isolation par utilisateur** : chaque utilisateur dans son dossier
3. **Validation des types de fichiers** côté client et serveur
4. **Limitation de taille** : 5MB max pour les avatars
5. **Nettoyage automatique** des fichiers temporaires

### **Types de Fichiers Autorisés**

```javascript
// Avatars
['image/jpeg', 'image/png', 'image/webp', 'image/gif'][
  // Documents
  ('application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
];

// Taille maximale
maxFileSize: 5 * 1024 * 1024; // 5MB (configurable)
```

## 🚨 Dépannage

### **Erreurs Courantes**

#### **"Bucket not found"**

```bash
# Solution : Créer le bucket
node scripts/check-storage-buckets.js
```

#### **"Access denied"**

```bash
# Solution : Vérifier les politiques
# Exécuter le script SQL de configuration
```

#### **"File too large"**

```bash
# Solution : Vérifier la limite de taille
# Modifier maxFileSize dans le composant ImageUpload
```

#### **"Invalid file type"**

```bash
# Solution : Vérifier les types MIME autorisés
# Ajouter le type manquant dans acceptedTypes
```

### **Logs de Débogage**

```javascript
// Activer les logs détaillés
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(path, file, options);

console.log('Upload result:', { data, error });
```

## 📚 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Politiques RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Storage](https://supabase.com/docs/reference/javascript/storage-createbucket)

## ✅ Checklist de Validation

- [ ] Bucket `avatars` créé et configuré
- [ ] Politiques de sécurité appliquées
- [ ] Tests d'upload réussis
- [ ] Tests de récupération d'URL réussis
- [ ] Interface utilisateur fonctionnelle
- [ ] Gestion d'erreurs implémentée
- [ ] Nettoyage automatique configuré

---

**Note** : Ce guide couvre la configuration complète du stockage Supabase pour NutriSensia. Suivez les étapes dans l'ordre pour une configuration optimale.
