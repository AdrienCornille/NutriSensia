# Guide de Test - Fonctionnalité de Téléchargement de Photo de Profil

## 🎯 Vue d'ensemble

Ce guide détaille comment tester complètement la fonctionnalité de téléchargement de photo de profil implémentée dans NutriSensia. Il couvre les tests manuels, automatisés et de configuration.

## 📋 Prérequis

### 1. Configuration de l'environnement

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# Démarrer l'application
npm run dev
```

### 2. Configuration Supabase

Exécuter le script SQL de configuration :

```sql
-- Dans l'interface SQL de Supabase
\i scripts/setup-avatar-storage.sql
```

## 🧪 Tests Manuels

### A. Test de la Page de Profil

#### 1. Navigation et Chargement

```bash
# Naviguer vers la page de profil
http://localhost:3000/profile
```

**Scénarios à vérifier :**

- ✅ La page se charge sans erreur
- ✅ Le skeleton loading s'affiche pendant le chargement
- ✅ Les informations du profil s'affichent correctement
- ✅ L'avatar s'affiche (image ou fallback)

#### 2. Affichage de l'Avatar

**Cas de test :**

| Scénario                         | Attendu                                            |
| -------------------------------- | -------------------------------------------------- |
| Avec image existante             | Affichage de l'image de profil                     |
| Sans image, avec nom             | Affichage des initiales (ex: "JD" pour "John Doe") |
| Sans image, sans nom, avec email | Affichage de la première lettre de l'email         |
| Sans aucune information          | Affichage de "?"                                   |

### B. Test du Composant ImageUpload

#### 1. Interface de Téléchargement

**Actions :**

1. Cliquer sur l'avatar existant
2. Vérifier l'ouverture de l'interface de modification

**Vérifications :**

- ✅ Zone de drop visible avec instructions
- ✅ Bouton "Sélectionner une image" présent
- ✅ Informations sur les types de fichiers acceptés
- ✅ Limite de taille affichée

#### 2. Drag-and-Drop

**Tests à effectuer :**

| Action          | Fichier         | Attendu                                       |
| --------------- | --------------- | --------------------------------------------- |
| Glisser-déposer | image.jpg (1MB) | ✅ Prévisualisation + téléchargement réussi   |
| Glisser-déposer | image.png (2MB) | ✅ Prévisualisation + téléchargement réussi   |
| Glisser-déposer | document.pdf    | ❌ Message d'erreur "Type non supporté"       |
| Glisser-déposer | video.mp4       | ❌ Message d'erreur "Type non supporté"       |
| Glisser-déposer | large.jpg (6MB) | ❌ Message d'erreur "Fichier trop volumineux" |

#### 3. Sélection de Fichier

**Actions :**

1. Cliquer sur "Sélectionner une image"
2. Choisir différents types de fichiers
3. Vérifier la validation

**Vérifications :**

- ✅ Ouverture de l'explorateur de fichiers
- ✅ Filtrage automatique des types d'images
- ✅ Validation côté client avant téléchargement

#### 4. Optimisation d'Image

**Tests de redimensionnement :**

| Image originale | Attendu                       |
| --------------- | ----------------------------- |
| 100x100px       | Pas de redimensionnement      |
| 800x600px       | Redimensionnement à 400x300px |
| 2000x1500px     | Redimensionnement à 400x300px |
| 400x400px       | Pas de redimensionnement      |

### C. Test des Notifications

#### 1. Notifications de Succès

**Scénarios :**

- ✅ Téléchargement réussi → Notification verte "Photo de profil mise à jour"
- ✅ Suppression réussie → Notification verte "Photo de profil supprimée"

#### 2. Notifications d'Erreur

**Scénarios :**

- ❌ Type de fichier invalide → Notification rouge avec message d'erreur
- ❌ Fichier trop volumineux → Notification rouge avec message d'erreur
- ❌ Erreur réseau → Notification rouge avec message d'erreur

### D. Test de Responsive Design

#### 1. Tests sur Différents Écrans

```bash
# Utiliser les outils de développement du navigateur
# Tester sur différentes tailles d'écran
```

**Tailles à tester :**

- 📱 Mobile (320px - 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (1024px+)

**Vérifications :**

- ✅ Interface adaptée à chaque taille
- ✅ Boutons et zones de drop accessibles
- ✅ Prévisualisation d'image correcte
- ✅ Notifications visibles

## 🤖 Tests Automatisés

### A. Exécution des Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests spécifiques
npm test -- --testPathPattern=ImageUpload
npm test -- --testPathPattern=Avatar

# Lancer les tests en mode watch
npm test -- --watch
```

### B. Tests du Composant ImageUpload

```bash
# Tests inclus dans src/components/ui/__tests__/ImageUpload.test.tsx
```

**Couverture des tests :**

- ✅ Rendu initial
- ✅ Affichage avec image existante
- ✅ Sélection de fichier
- ✅ Validation des types de fichiers
- ✅ Validation de la taille
- ✅ Drag-and-drop
- ✅ Téléchargement
- ✅ Gestion d'erreurs
- ✅ Suppression
- ✅ Accessibilité

### C. Tests du Composant Avatar

```bash
# Tests inclus dans src/components/ui/__tests__/Avatar.test.tsx
```

**Couverture des tests :**

- ✅ Affichage d'image
- ✅ Gestion des erreurs de chargement
- ✅ Fallback avec initiales
- ✅ Fallback avec email
- ✅ Fallback par défaut
- ✅ Différentes tailles
- ✅ Interactivité
- ✅ États de chargement
- ✅ Accessibilité

## 🔧 Tests de Configuration

### A. Test de la Configuration Supabase

```bash
# Exécuter le script de test
node scripts/test-avatar-storage.js
```

**Tests inclus :**

- ✅ Configuration du bucket
- ✅ Permissions de téléchargement
- ✅ Permissions de lecture
- ✅ Génération d'URL publique
- ✅ Validation des types de fichiers
- ✅ Limite de taille de fichier
- ✅ Authentification

### B. Vérification des Politiques RLS

```sql
-- Vérifier les politiques existantes
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

**Politiques attendues :**

- `Users can upload their own avatar`
- `Users can view all avatars`
- `Users can update their own avatar`
- `Users can delete their own avatar`
- `Public can view avatars`

## 🚨 Tests de Sécurité

### A. Tests d'Authentification

```bash
# Test sans authentification
# 1. Ouvrir l'application en mode incognito
# 2. Naviguer vers /profile
# 3. Tenter de télécharger une image
```

**Attendu :**

- ❌ Redirection vers la page de connexion
- ❌ Impossible de télécharger sans authentification

### B. Tests d'Isolation des Données

```bash
# Test d'accès croisé
# 1. Se connecter avec l'utilisateur A
# 2. Tenter d'accéder aux fichiers de l'utilisateur B
```

**Attendu :**

- ❌ Impossible d'accéder aux fichiers d'autres utilisateurs
- ❌ Messages d'erreur appropriés

### C. Tests de Validation Côté Serveur

```bash
# Contourner la validation côté client
# 1. Modifier les requêtes réseau
# 2. Envoyer des fichiers invalides directement à l'API
```

**Attendu :**

- ❌ Rejet des fichiers invalides côté serveur
- ❌ Messages d'erreur appropriés

## 📊 Tests de Performance

### A. Tests de Téléchargement

**Métriques à mesurer :**

- ⏱️ Temps de téléchargement (objectif : < 2 secondes pour 2MB)
- 📦 Taille avant/après optimisation (réduction attendue : 60-80%)
- 🖼️ Qualité visuelle maintenue

### B. Tests de Mémoire

```bash
# Utiliser les outils de développement
# Surveiller l'utilisation mémoire pendant les téléchargements
```

**Vérifications :**

- ✅ Pas de fuites mémoire
- ✅ Libération des ressources après téléchargement
- ✅ Gestion correcte des blobs temporaires

## 🎯 Tests d'Accessibilité

### A. Navigation au Clavier

```bash
# Tester uniquement avec le clavier
# 1. Tab pour naviguer
# 2. Entrée/Espace pour activer
# 3. Échap pour fermer
```

**Vérifications :**

- ✅ Tous les éléments sont accessibles au clavier
- ✅ Ordre de tabulation logique
- ✅ Indicateurs de focus visibles
- ✅ Messages d'état annoncés

### B. Lecteurs d'Écran

```bash
# Utiliser un lecteur d'écran (NVDA, JAWS, VoiceOver)
# Tester la navigation et les messages
```

**Vérifications :**

- ✅ Textes alternatifs appropriés
- ✅ Messages d'état annoncés
- ✅ Structure sémantique correcte
- ✅ Attributs ARIA appropriés

## 🐛 Tests de Gestion d'Erreurs

### A. Erreurs Réseau

```bash
# Simuler des erreurs réseau
# 1. Désactiver la connexion internet
# 2. Utiliser les outils de développement pour simuler des erreurs
```

**Scénarios à tester :**

- ❌ Perte de connexion pendant le téléchargement
- ❌ Timeout de la requête
- ❌ Erreur 500 du serveur
- ❌ Erreur 403 (permissions)

### B. Erreurs de Fichier

**Tests à effectuer :**

- ❌ Fichier corrompu
- ❌ Fichier avec extension incorrecte
- ❌ Fichier vide
- ❌ Fichier avec métadonnées invalides

## 📝 Checklist de Test

### ✅ Tests Fonctionnels

- [ ] Téléchargement d'image valide
- [ ] Validation des types de fichiers
- [ ] Validation de la taille
- [ ] Optimisation d'image
- [ ] Prévisualisation
- [ ] Suppression d'image
- [ ] Notifications de succès/erreur

### ✅ Tests d'Interface

- [ ] Responsive design
- [ ] Drag-and-drop
- [ ] Sélection de fichier
- [ ] États de chargement
- [ ] Messages d'erreur

### ✅ Tests de Sécurité

- [ ] Authentification requise
- [ ] Isolation des données
- [ ] Validation côté serveur
- [ ] Politiques RLS

### ✅ Tests de Performance

- [ ] Temps de téléchargement
- [ ] Optimisation d'image
- [ ] Gestion mémoire
- [ ] Qualité visuelle

### ✅ Tests d'Accessibilité

- [ ] Navigation au clavier
- [ ] Lecteurs d'écran
- [ ] Attributs ARIA
- [ ] Textes alternatifs

## 🚀 Exécution Rapide des Tests

### Script de Test Complet

```bash
#!/bin/bash
# test-avatar-feature.sh

echo "🧪 Démarrage des tests de la fonctionnalité Avatar"

# 1. Tests automatisés
echo "📋 Lancement des tests automatisés..."
npm test -- --testPathPattern="(ImageUpload|Avatar)" --passWithNoTests

# 2. Test de configuration Supabase
echo "🔧 Test de configuration Supabase..."
node scripts/test-avatar-storage.js

# 3. Build de production
echo "🏗️ Test du build de production..."
npm run build

echo "✅ Tests terminés !"
```

### Utilisation

```bash
# Rendre le script exécutable
chmod +x test-avatar-feature.sh

# Exécuter tous les tests
./test-avatar-feature.sh
```

## 📈 Métriques de Qualité

### Objectifs de Test

| Métrique                | Objectif         | Mesure                  |
| ----------------------- | ---------------- | ----------------------- |
| Couverture de code      | > 90%            | Jest coverage           |
| Temps de téléchargement | < 2s             | Outils de développement |
| Taille optimisée        | 60-80% réduction | Comparaison avant/après |
| Tests passants          | 100%             | Jest results            |
| Accessibilité           | WCAG 2.1 AA      | Lighthouse audit        |

### Rapport de Test

Après exécution des tests, générer un rapport :

```bash
# Générer un rapport de couverture
npm test -- --coverage --testPathPattern="(ImageUpload|Avatar)"

# Ouvrir le rapport
open coverage/lcov-report/index.html
```

## 🎉 Conclusion

Ce guide de test couvre tous les aspects de la fonctionnalité de téléchargement de photo de profil. En suivant ces tests, vous vous assurez que :

1. **La fonctionnalité fonctionne correctement** dans tous les scénarios
2. **La sécurité est maintenue** avec une validation appropriée
3. **L'expérience utilisateur est optimale** avec des performances acceptables
4. **L'accessibilité est respectée** pour tous les utilisateurs
5. **La robustesse est garantie** avec une gestion d'erreurs complète

N'hésitez pas à adapter ces tests selon vos besoins spécifiques et à les intégrer dans votre pipeline CI/CD.
