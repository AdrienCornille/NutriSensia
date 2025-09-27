# 🔧 Correction du Problème d'Upload d'Avatar

## ❌ Problème
```
Erreur d'upload: new row violates row-level security policy
```

## 🎯 Solution Rapide

### Option 1: Configuration via l'Interface Supabase (Recommandée)

1. **Allez dans l'interface Supabase** :
   - Ouvrez [Supabase Dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet
   - Allez dans **Storage** → **Policies**

2. **Créez une politique pour le bucket avatars** :
   - Cliquez sur **"New Policy"**
   - **Table**: `storage.objects`
   - **Policy name**: `Allow all operations on avatars bucket`
   - **Allowed operation**: `ALL`
   - **Target roles**: `public`
   - **USING expression**: `bucket_id = 'avatars'`

3. **Sauvegardez la politique**

### Option 2: Script SQL (Alternative)

1. **Allez dans l'éditeur SQL de Supabase** :
   - Dashboard → **SQL Editor**

2. **Exécutez le script** :
   ```sql
   -- Politique permissive pour le développement
   CREATE POLICY "Allow all operations on avatars bucket" ON storage.objects
   FOR ALL USING (bucket_id = 'avatars');
   ```

### Option 3: Désactivation Temporaire de RLS (Développement uniquement)

⚠️ **ATTENTION**: Ne jamais faire cela en production!

```sql
-- Dans l'éditeur SQL de Supabase
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

## 🧪 Test

Après avoir configuré la politique :

1. Rechargez la page d'onboarding
2. Essayez d'uploader une image d'avatar
3. L'upload devrait maintenant fonctionner

## 🔒 Sécurité en Production

Pour la production, utilisez des politiques plus restrictives :

```sql
-- Lecture publique
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Upload authentifié
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Modification par propriétaire
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);
```

## 📋 Vérification

Pour vérifier que les politiques sont actives :

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%avatar%';
```

## 🎉 Résultat

Une fois la politique configurée, l'upload d'avatar fonctionnera parfaitement dans l'onboarding des nutritionnistes !
