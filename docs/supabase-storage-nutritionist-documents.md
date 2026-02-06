# Configuration Supabase Storage : Documents Nutritionnistes

Ce guide explique comment configurer le bucket Supabase Storage pour les documents des nutritionnistes.

## 1. Créer le bucket

Dans le dashboard Supabase :

1. Aller dans **Storage** > **Buckets**
2. Cliquer sur **New bucket**
3. Configurer :
   - **Name** : `nutritionist-documents`
   - **Public bucket** : **Non** (documents privés)
   - **Allowed MIME types** : `image/jpeg, image/png, image/webp, application/pdf`
   - **File size limit** : `5MB`

## 2. Configurer les politiques RLS

Dans **Storage** > **Policies**, créer les politiques suivantes pour le bucket `nutritionist-documents` :

### 2.1 Politique SELECT (lecture)

**Nom** : `Nutritionists and admins can view documents`

```sql
-- Permet aux nutritionnistes de voir leurs propres documents
-- et aux admins de voir tous les documents
((bucket_id = 'nutritionist-documents'::text) AND (
    -- Le nutritionniste peut voir ses propres fichiers
    -- Le chemin est structuré comme : {user_id}/{filename}
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Les admins peuvent tout voir
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
))
```

### 2.2 Politique INSERT (upload)

**Nom** : `Nutritionists can upload their documents`

```sql
-- Permet aux nutritionnistes d'uploader dans leur propre dossier
((bucket_id = 'nutritionist-documents'::text) AND (
    -- Le chemin doit commencer par l'ID de l'utilisateur
    (storage.foldername(name))[1] = auth.uid()::text
))
```

### 2.3 Politique UPDATE (mise à jour)

**Nom** : `Nutritionists can update their documents`

```sql
-- Permet aux nutritionnistes de mettre à jour leurs propres fichiers
((bucket_id = 'nutritionist-documents'::text) AND (
    (storage.foldername(name))[1] = auth.uid()::text
))
```

### 2.4 Politique DELETE (suppression)

**Nom** : `Nutritionists can delete unverified documents`

```sql
-- Permet aux nutritionnistes de supprimer leurs fichiers non vérifiés
-- Note: La vérification du statut "verified" se fait côté application
((bucket_id = 'nutritionist-documents'::text) AND (
    (storage.foldername(name))[1] = auth.uid()::text
))
```

## 3. Structure des fichiers

Les fichiers doivent être organisés par user_id :

```
nutritionist-documents/
├── {user_id_1}/
│   ├── asca_certificate.pdf
│   ├── rme_certificate.pdf
│   ├── diploma.pdf
│   └── photo.jpg
├── {user_id_2}/
│   └── ...
```

## 4. Utilisation côté client

### Upload d'un document

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

async function uploadNutritionistDocument(
  file: File,
  type: 'asca_certificate' | 'rme_certificate' | 'diploma' | 'photo'
) {
  const supabase = createClientComponentClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${type}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('nutritionist-documents')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  // Get the URL (private, need signed URL)
  const { data: urlData } = await supabase.storage
    .from('nutritionist-documents')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  return {
    path: data.path,
    url: urlData?.signedUrl,
  };
}
```

### Récupérer un document

```typescript
async function getNutritionistDocumentUrl(filePath: string) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.storage
    .from('nutritionist-documents')
    .createSignedUrl(filePath, 3600);

  if (error) throw error;
  return data.signedUrl;
}
```

### Supprimer un document

```typescript
async function deleteNutritionistDocument(filePath: string) {
  const supabase = createClientComponentClient();

  const { error } = await supabase.storage
    .from('nutritionist-documents')
    .remove([filePath]);

  if (error) throw error;
}
```

## 5. Types acceptés

| Type de document | Extensions acceptées | Taille max |
|------------------|---------------------|------------|
| Certificat ASCA | PDF, JPG, PNG | 5 MB |
| Certificat RME | PDF, JPG, PNG | 5 MB |
| Diplôme | PDF, JPG, PNG | 5 MB |
| Photo professionnelle | JPG, PNG, WebP | 2 MB |

## 6. Validation côté serveur

Avant d'accepter un fichier, valider :

1. **Type MIME** : Vérifier que le type correspond à l'extension
2. **Taille** : Maximum 5 MB (2 MB pour les photos)
3. **Dimensions** (pour les images) : Minimum 200x200px
4. **Format** : PDF valide ou image valide

## 7. Notes de sécurité

- Les documents sont **privés** par défaut
- Seul le propriétaire et les admins peuvent y accéder
- Les URLs signées expirent après 1 heure
- Les documents vérifiés ne peuvent pas être supprimés par le nutritionniste
