# Configuration des Tailles de Fichiers - NutriSensia

## 📋 Vue d'ensemble

Ce guide explique comment configurer les tailles maximales de fichiers pour différents types de contenu dans NutriSensia.

## 🎯 Tailles Actuellement Configurées

### **Avatars (Photos de profil)**

- **Taille maximale** : 5MB
- **Types acceptés** : JPEG, PNG, WebP, GIF
- **Redimensionnement automatique** : 400x400px max
- **Qualité** : 85%

### **Documents**

- **Taille maximale** : 10MB (par défaut)
- **Types acceptés** : PDF, DOC, DOCX
- **Stockage** : Bucket privé

### **Fichiers temporaires**

- **Taille maximale** : 5MB
- **Durée de vie** : 24h maximum
- **Nettoyage automatique** : Oui

## 🔧 Comment Modifier les Tailles

### **1. Pour les Avatars**

#### **Dans le composant ImageUpload :**

```tsx
<ImageUpload
  maxFileSize={5 * 1024 * 1024} // 5MB
  maxWidth={400}
  maxHeight={400}
  quality={85}
  // ... autres props
/>
```

#### **Dans le composant AvatarUpload :**

```tsx
// Dans src/components/ui/AvatarUpload.tsx
const maxSize = 5 * 1024 * 1024; // 5MB
```

### **2. Pour les Documents**

#### **Dans les composants de document :**

```tsx
<DocumentUpload
  maxFileSize={10 * 1024 * 1024} // 10MB
  acceptedTypes={['application/pdf', 'application/msword']}
  // ... autres props
/>
```

## 📊 Tailles Recommandées

### **Avatars**

- **Petit** : 1MB (pour les connexions lentes)
- **Moyen** : 5MB (recommandé)
- **Grand** : 10MB (pour haute qualité)

### **Documents**

- **Petit** : 5MB (rapports simples)
- **Moyen** : 10MB (recommandé)
- **Grand** : 25MB (documents complexes)

### **Images de contenu**

- **Petit** : 2MB (thumbnails)
- **Moyen** : 5MB (images standard)
- **Grand** : 15MB (images haute résolution)

## ⚙️ Configuration Supabase

### **Limites du Bucket**

```sql
-- Configuration du bucket avatars
CREATE POLICY "File size limit" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND octet_length(file) <= 5242880 -- 5MB en bytes
);
```

### **Types MIME Autorisés**

```sql
-- Limiter les types de fichiers
CREATE POLICY "Allowed file types" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND file_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
);
```

## 🚨 Considérations de Performance

### **Impact sur les Performances**

- **Upload** : Plus le fichier est gros, plus l'upload est lent
- **Stockage** : Coût de stockage Supabase
- **Bande passante** : Consommation des utilisateurs
- **Temps de chargement** : Affichage des images

### **Optimisations Recommandées**

1. **Redimensionnement automatique** : Toujours activé
2. **Compression** : Qualité 80-85%
3. **Formats modernes** : WebP quand possible
4. **Lazy loading** : Pour les images multiples

## 🔍 Test des Limites

### **Script de Test**

```bash
# Tester avec différents fichiers
node scripts/test-storage-upload.js
```

### **Fichiers de Test**

- **Petit** : 100KB (test rapide)
- **Moyen** : 2MB (test standard)
- **Grand** : 5MB (test limite)
- **Trop grand** : 10MB (test d'erreur)

## 📝 Exemples de Configuration

### **Configuration Conservatrice**

```tsx
// Pour les connexions lentes
maxFileSize={1 * 1024 * 1024} // 1MB
maxWidth={200}
maxHeight={200}
quality={75}
```

### **Configuration Standard**

```tsx
// Recommandé pour la plupart des cas
maxFileSize={5 * 1024 * 1024} // 5MB
maxWidth={400}
maxHeight={400}
quality={85}
```

### **Configuration Premium**

```tsx
// Pour haute qualité
maxFileSize={10 * 1024 * 1024} // 10MB
maxWidth={800}
maxHeight={800}
quality={90}
```

## ✅ Checklist de Validation

- [ ] Taille maximale configurée
- [ ] Types de fichiers autorisés
- [ ] Redimensionnement activé
- [ ] Compression configurée
- [ ] Tests effectués
- [ ] Documentation mise à jour
- [ ] Politiques Supabase vérifiées

## 🚀 Prochaines Étapes

1. **Tester** avec différents fichiers
2. **Monitorer** les performances
3. **Ajuster** selon les retours utilisateurs
4. **Optimiser** si nécessaire

---

**Note** : Les tailles de fichiers ont un impact direct sur l'expérience utilisateur et les coûts. Testez toujours avant de déployer en production.
