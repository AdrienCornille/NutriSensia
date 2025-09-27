# Git Workflow - NutriSensia

## 🌿 Structure des branches

```
main (production)
├── develop (intégration)
├── feature/* (nouvelles fonctionnalités)
├── release/* (préparation des releases)
└── hotfix/* (corrections urgentes)
```

## 🚀 Workflow de développement

### 1. Commencer une nouvelle fonctionnalité

```bash
# Basculer sur develop
git checkout develop
git pull origin develop

# Créer une branche feature
git checkout -b feature/nom-de-la-fonctionnalite

# Développer...
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser la branche
git push -u origin feature/nom-de-la-fonctionnalite
```

### 2. Finaliser une fonctionnalité

```bash
# Mettre à jour develop
git checkout develop
git pull origin develop

# Fusionner la feature
git merge feature/nom-de-la-fonctionnalite

# Supprimer la branche feature
git branch -d feature/nom-de-la-fonctionnalite
git push origin --delete feature/nom-de-la-fonctionnalite

# Pousser develop
git push origin develop
```

### 3. Préparer une release

```bash
# Créer une branche release
git checkout -b release/v1.0.0

# Finaliser la release (tests, documentation)
# ...

# Fusionner dans main et develop
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"

git checkout develop
git merge release/v1.0.0

# Supprimer la branche release
git branch -d release/v1.0.0
```

### 4. Correction urgente (hotfix)

```bash
# Créer une branche hotfix depuis main
git checkout main
git checkout -b hotfix/critical-bug-fix

# Corriger le bug
# ...

# Fusionner dans main et develop
git checkout main
git merge hotfix/critical-bug-fix
git tag -a v1.0.1 -m "Hotfix v1.0.1"

git checkout develop
git merge hotfix/critical-bug-fix

# Supprimer la branche hotfix
git branch -d hotfix/critical-bug-fix
```

## 📋 Conventions de commit

### Format

```
type(scope): description

[body optionnel]

[footer optionnel]
```

### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, point-virgules manquants, etc.
- `refactor`: Refactoring
- `test`: Ajout ou modification de tests
- `chore`: Tâches de maintenance

### Exemples

```bash
git commit -m "feat(auth): ajouter authentification 2FA"
git commit -m "fix(dashboard): corriger l'affichage des patients"
git commit -m "docs(readme): mettre à jour la documentation"
```

## 🔒 Protection des branches

### Branches protégées

- `main`: Requiert review et tests
- `develop`: Requiert review

### Règles de merge

- Pull Request obligatoire
- Tests automatiques doivent passer
- Review d'au moins une personne
- Pas de merge direct

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

## 📱 Intégration avec Task Master AI

### Workflow recommandé

1. Créer une branche feature pour chaque tâche Task Master AI
2. Développer la fonctionnalité
3. Mettre à jour la tâche avec le statut "in-progress"
4. Tester et valider
5. Mettre à jour la tâche avec le statut "done"
6. Fusionner la branche

### Exemple pour la tâche #1

```bash
git checkout -b feature/setup-project-infrastructure
# Développer...
git commit -m "feat(setup): initialiser Next.js avec Supabase"
git push origin feature/setup-project-infrastructure
# Créer Pull Request
# Après validation, merger dans develop
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

## 📚 Ressources

- [Git Flow Documentation](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
