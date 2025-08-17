# Guide de Contribution - NutriSensia

## 🚀 Workflow de développement

### Prérequis
- Node.js 18+
- Git
- Compte GitHub

### 1. Configuration initiale

```bash
# Cloner le repository
git clone https://github.com/AdrienCornille/NutriSensia.git
cd NutriSensia

# Installer les dépendances
npm install

# Basculer sur la branche develop
git checkout develop
```

### 2. Commencer une nouvelle fonctionnalité

```bash
# Utiliser le script automatisé
./scripts/git-workflow.sh start-feature nom-de-la-fonctionnalite

# Ou manuellement
git checkout develop
git pull origin develop
git checkout -b feature/nom-de-la-fonctionnalite
```

### 3. Développement

- **Suivre les conventions de commit** (voir section ci-dessous)
- **Tester votre code** avant de commiter
- **Respecter le design system** NutriSensia
- **Documenter les changements** importants

### 4. Finaliser une fonctionnalité

```bash
# Utiliser le script automatisé
./scripts/git-workflow.sh finish-feature

# Ou manuellement
git checkout develop
git pull origin develop
git merge feature/nom-de-la-fonctionnalite --no-ff
git push origin develop
git branch -d feature/nom-de-la-fonctionnalite
```

## 📋 Conventions de commit

### Format
```
type(scope): description

[body optionnel]

[footer optionnel]
```

### Types de commit
- **`feat`** : Nouvelle fonctionnalité
- **`fix`** : Correction de bug
- **`docs`** : Documentation
- **`style`** : Formatage, point-virgules manquants, etc.
- **`refactor`** : Refactoring
- **`test`** : Ajout ou modification de tests
- **`chore`** : Tâches de maintenance

### Exemples
```bash
git commit -m "feat(auth): ajouter authentification 2FA"
git commit -m "fix(dashboard): corriger l'affichage des patients"
git commit -m "docs(readme): mettre à jour la documentation"
git commit -m "style(components): formater les composants Button"
```

## 🧪 Tests et qualité

### Avant chaque commit
```bash
npm run lint
npm run test
npm run build
```

### Avant chaque merge
- Tests E2E passent
- Code coverage > 80%
- Pas de vulnérabilités de sécurité
- Performance acceptable

## 🔒 Protection des branches

### Branches protégées
- **`main`** : Requiert review et tests
- **`develop`** : Requiert review

### Règles de merge
- Pull Request obligatoire
- Tests automatiques doivent passer
- Review d'au moins une personne
- Pas de merge direct

## 📱 Intégration avec Task Master AI

### Workflow recommandé
1. Créer une branche feature pour chaque tâche Task Master AI
2. Développer la fonctionnalité
3. Mettre à jour la tâche avec le statut "in-progress"
4. Tester et valider
5. Mettre à jour la tâche avec le statut "done"
6. Fusionner la branche

### Exemple pour une tâche
```bash
# 1. Commencer la tâche
./scripts/git-workflow.sh start-feature setup-project-infrastructure

# 2. Développer...
# ... votre code ...

# 3. Commiter avec convention
git commit -m "feat(setup): initialiser Next.js avec Supabase"

# 4. Finir la fonctionnalité
./scripts/git-workflow.sh finish-feature
```

## 🚨 Gestion des conflits

### Résolution de conflits
1. Identifier les fichiers en conflit
2. Ouvrir chaque fichier et résoudre manuellement
3. Ajouter les fichiers résolus
4. Finaliser le merge

### En cas de conflit complexe
```bash
# Annuler le merge
git merge --abort

# Revenir à l'état précédent
git reset --hard HEAD
```

## 🔄 Rollback et récupération

### Annuler le dernier commit
```bash
git reset --soft HEAD~1
```

### Revenir à un commit spécifique
```bash
git reset --hard <commit-hash>
```

### Créer un point de sauvegarde
```bash
git tag -a backup-v1.0.0 -m "Sauvegarde avant refactoring"
```

## 🍎 Spécificités NutriSensia

### Conventions de nommage
- **Composants** : PascalCase (ex: `UserProfile.tsx`)
- **Hooks** : camelCase avec préfixe `use` (ex: `useAuth.ts`)
- **Fonctions utilitaires** : camelCase (ex: `formatNutritionData.ts`)
- **Types/Interfaces** : PascalCase (ex: `NutritionData`)

### Structure des composants
```typescript
// 1. Imports
import { useState } from 'react'
import { motion } from 'framer-motion'

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Composant principal
export function ComponentName({ ... }: ComponentProps) {
  // 4. Hooks et état
  const [state, setState] = useState()
  
  // 5. Fonctions utilitaires
  const handleAction = () => {
    // ...
  }
  
  // 6. Rendu
  return (
    <motion.div>
      {/* JSX */}
    </motion.div>
  )
}
```

### Palette de couleurs
Utilisez uniquement les couleurs définies dans `tailwind.config.ts` :
- `text-primary` / `bg-primary` : #2E7D5E
- `text-accent` / `bg-accent` : #FF6B35
- `text-neutral` / `bg-neutral` : #6B7280
- `bg-background` : #FAFBFC

### Tests
- Tests unitaires pour les hooks personnalisés
- Tests d'intégration pour les composants de formulaire
- Tests E2E pour les flux utilisateur critiques

## 📚 Ressources

- [Git Workflow Documentation](docs/git-workflow.md)
- [Supabase Setup Documentation](docs/supabase-setup.md)
- [Design System Documentation](.taskmaster/docs/design-system-specs.md)
- [Task Master AI Documentation](.taskmaster/docs/)

## 🤝 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les issues existantes
3. Créez une nouvelle issue si nécessaire
