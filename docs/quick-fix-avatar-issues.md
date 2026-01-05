# 🔧 Résolution Rapide - Problèmes d'Avatar

## 🚨 Problème Identifié

Vous rencontrez des erreurs de récursion infinie et de bucket manquant. Voici comment les résoudre rapidement :

## ✅ Solution en 3 Étapes

### 1. **Exécuter le Script de Correction SQL**

Dans l'interface SQL de Supabase (Dashboard > SQL Editor), exécutez :

```sql
-- Copier et coller le contenu de scripts/fix-avatar-issues.sql
```

Ou copiez directement ce script :

```sql
-- 1. Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 2. Recréer les politiques simples
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. Créer le bucket avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Créer les politiques de stockage
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all avatars" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- 5. Ajouter les colonnes manquantes
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;
```

### 2. **Tester la Configuration**

```bash
# Tester la configuration
node scripts/quick-test-avatar.js
```

### 3. **Tester l'Application**

```bash
# Démarrer l'application
npm run dev

# Naviguer vers la page de test
http://localhost:3000/profile-test
```

## 🎯 Résultat Attendu

Après ces étapes, vous devriez voir :

```
🧪 Test rapide de la fonctionnalité Avatar
========================================

🔍 Test de connexion Supabase...
✅ Connexion Supabase réussie

🔍 Test du bucket de stockage...
✅ Bucket avatars trouvé

🔍 Test de téléchargement de fichier...
✅ Téléchargement réussi

🔍 Test de la table profiles...
✅ Table profiles accessible

📊 Résumé des tests
==================
Tests réussis: 4/4

🎉 Tous les tests sont passés !
```

## 🚀 Test de la Fonctionnalité

1. **Connectez-vous** à l'application
2. **Naviguez** vers `http://localhost:3000/profile-test`
3. **Cliquez** sur l'avatar pour ouvrir l'interface de modification
4. **Testez** le drag-and-drop d'une image
5. **Vérifiez** que l'avatar se met à jour

## 🆘 Si les Problèmes Persistent

### Vérifications Supplémentaires

1. **Variables d'environnement** :

   ```bash
   cat .env.local
   ```

2. **Connexion Supabase** :
   - Vérifiez que votre projet Supabase est actif
   - Vérifiez que les clés API sont correctes

3. **Permissions Supabase** :
   - Assurez-vous d'avoir les droits d'administration sur le projet
   - Vérifiez que RLS est activé sur la table `profiles`

### Logs de Diagnostic

```bash
# Dans le navigateur, ouvrez la console (F12) et tapez :
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

## 📞 Support

Si les problèmes persistent après ces étapes :

1. **Collectez les logs d'erreur** de la console du navigateur
2. **Vérifiez les logs Supabase** dans le dashboard
3. **Testez avec un compte utilisateur simple** (rôle "patient")

## 🎉 Succès !

Une fois que tout fonctionne, vous pourrez :

- ✅ Télécharger des avatars
- ✅ Voir les prévisualisations
- ✅ Recevoir des notifications de succès/erreur
- ✅ Supprimer des avatars
- ✅ Tester toutes les validations

La fonctionnalité sera alors **prête pour la production** ! 🚀
