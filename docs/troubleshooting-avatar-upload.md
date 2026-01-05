# Guide de Dépannage - Fonctionnalité de Téléchargement d'Avatar

## 🚨 Problèmes Courants et Solutions

### 1. **Impossible d'accéder à la page de profil**

#### Symptômes :

- Redirection vers `/auth/signin` même après connexion
- Redirection vers `/auth/verify-mfa` après connexion
- Erreur 403 ou 404

#### Solutions :

**A. Utiliser la page de test (Recommandé)**

```bash
# Au lieu de /profile, utilisez :
http://localhost:3000/profile-test
```

**B. Vérifier l'authentification**

```bash
# 1. Vérifier que vous êtes bien connecté
# 2. Vérifier dans les outils de développement > Application > Cookies
# 3. S'assurer que les cookies Supabase sont présents
```

**C. Désactiver temporairement la 2FA pour les tests**

```typescript
// Dans src/middleware.ts, commenter temporairement cette section :
/*
if (
  (userRole === 'nutritionist' || userRole === 'admin') &&
  aal !== 'aal2'
) {
  const redirectUrl = new URL('/auth/verify-mfa', req.url);
  redirectUrl.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(redirectUrl);
}
*/
```

### 2. **Erreurs de configuration Supabase**

#### Symptômes :

- Erreur "Bucket not found"
- Erreur "Permission denied"
- Erreur "Invalid API key"

#### Solutions :

**A. Vérifier les variables d'environnement**

```bash
# Vérifier que ces variables sont définies dans .env.local :
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**B. Configurer le bucket automatiquement**

```bash
# Exécuter le script de configuration
node scripts/setup-avatar-storage.js
```

**C. Vérifier la configuration manuellement**

```bash
# Test rapide de la configuration
node scripts/quick-test-avatar.js
```

**D. Configurer manuellement dans Supabase**

```sql
-- Dans l'interface SQL de Supabase, exécuter :
\i scripts/setup-avatar-storage.sql
```

### 3. **Erreurs de téléchargement de fichiers**

#### Symptômes :

- "File too large"
- "Invalid file type"
- "Upload failed"

#### Solutions :

**A. Vérifier les limites de taille**

```javascript
// Dans ImageUpload.tsx, vérifier :
maxFileSize={2 * 1024 * 1024} // 2MB
```

**B. Vérifier les types de fichiers autorisés**

```javascript
// Types autorisés par défaut :
acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
```

**C. Vérifier la configuration du bucket**

```sql
-- Vérifier dans Supabase :
SELECT * FROM storage.buckets WHERE name = 'avatars';
```

### 4. **Problèmes de permissions**

#### Symptômes :

- "Access denied"
- "Unauthorized"
- Erreur 403

#### Solutions :

**A. Vérifier les politiques RLS**

```sql
-- Vérifier les politiques existantes :
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

**B. Recréer les politiques**

```sql
-- Supprimer et recréer les politiques :
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
-- Puis exécuter le script setup-avatar-storage.sql
```

**C. Vérifier l'authentification**

```javascript
// Dans le navigateur, vérifier :
console.log(await supabase.auth.getUser());
```

### 5. **Problèmes d'affichage d'images**

#### Symptômes :

- Images ne s'affichent pas
- Erreur 404 sur les URLs d'images
- Fallback toujours affiché

#### Solutions :

**A. Vérifier les URLs publiques**

```javascript
// Vérifier que l'URL est correcte :
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('path/to/image.jpg');
console.log(data.publicUrl);
```

**B. Vérifier les permissions de lecture**

```sql
-- S'assurer que la politique de lecture existe :
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');
```

**C. Vérifier le bucket public**

```sql
-- S'assurer que le bucket est public :
UPDATE storage.buckets
SET public = true
WHERE name = 'avatars';
```

## 🔧 Scripts de Diagnostic

### 1. **Test de Configuration Complète**

```bash
# Exécuter tous les tests
./scripts/test-avatar-feature.sh
```

### 2. **Test Rapide**

```bash
# Test rapide de la configuration
node scripts/quick-test-avatar.js
```

### 3. **Configuration Automatique**

```bash
# Configurer automatiquement le bucket
node scripts/setup-avatar-storage.js
```

## 📋 Checklist de Diagnostic

### ✅ Vérifications de Base

- [ ] Variables d'environnement Supabase configurées
- [ ] Application démarrée (`npm run dev`)
- [ ] Utilisateur connecté
- [ ] Cookies d'authentification présents

### ✅ Vérifications Supabase

- [ ] Bucket `avatars` créé
- [ ] Bucket configuré comme public
- [ ] Politiques RLS configurées
- [ ] Table `profiles` accessible

### ✅ Vérifications de Téléchargement

- [ ] Types de fichiers autorisés
- [ ] Limite de taille respectée
- [ ] Permissions de téléchargement
- [ ] Permissions de suppression

### ✅ Vérifications d'Affichage

- [ ] URLs publiques générées
- [ ] Permissions de lecture
- [ ] Fallback fonctionnel
- [ ] Notifications affichées

## 🚀 Procédure de Test Recommandée

### 1. **Configuration Initiale**

```bash
# 1. Vérifier les variables d'environnement
cat .env.local

# 2. Configurer Supabase
node scripts/setup-avatar-storage.js

# 3. Tester la configuration
node scripts/quick-test-avatar.js
```

### 2. **Test de l'Application**

```bash
# 1. Démarrer l'application
npm run dev

# 2. Naviguer vers la page de test
http://localhost:3000/profile-test

# 3. Se connecter
# 4. Tester le téléchargement d'avatar
```

### 3. **Test de Fonctionnalité**

- [ ] Cliquer sur l'avatar
- [ ] Télécharger une image valide
- [ ] Vérifier la prévisualisation
- [ ] Vérifier la notification de succès
- [ ] Tester la suppression
- [ ] Tester les validations d'erreur

## 🆘 Support

### Logs Utiles

```bash
# Logs de l'application
npm run dev

# Logs du navigateur
F12 > Console

# Logs Supabase
Dashboard Supabase > Logs
```

### Informations de Diagnostic

```javascript
// Informations à collecter en cas de problème :
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('User:', await supabase.auth.getUser());
console.log('Session:', await supabase.auth.getSession());
console.log('Buckets:', await supabase.storage.listBuckets());
```

### Contact

En cas de problème persistant :

1. Vérifier les logs d'erreur
2. Collecter les informations de diagnostic
3. Vérifier la configuration Supabase
4. Tester avec un compte utilisateur simple (patient)

## 🎯 Résolution Rapide

Si vous voulez juste tester rapidement :

1. **Utilisez la page de test** : `http://localhost:3000/profile-test`
2. **Configurez automatiquement** : `node scripts/setup-avatar-storage.js`
3. **Testez rapidement** : `node scripts/quick-test-avatar.js`

Cette approche évite les problèmes de 2FA et de permissions complexes.
