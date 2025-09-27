# Workflow Sécurisé - Repository Privé

## 🔒 Protections manuelles pour repository privé

Puisque les protections de branches GitHub ne sont pas disponibles sur les repositories privés gratuits, voici un workflow sécurisé alternatif.

## 🛡️ Règles de sécurité

### 1. Branche `main` - Code de production

- **NE JAMAIS** pousser directement sur `main`
- **NE JAMAIS** faire de commits directs sur `main`
- **TOUJOURS** utiliser des Pull Requests
- **TOUJOURS** merger depuis `develop`

### 2. Branche `develop` - Intégration

- **NE JAMAIS** pousser directement sur `develop`
- **TOUJOURS** utiliser des Pull Requests depuis les features
- **TOUJOURS** tester avant de merger

### 3. Branches `feature/*` - Développement

- **TOUJOURS** créer depuis `develop`
- **TOUJOURS** merger vers `develop` via Pull Request
- **TOUJOURS** supprimer après merge

## 🚀 Workflow sécurisé

### Commencer une fonctionnalité

```bash
# 1. Basculer sur develop
git checkout develop
git pull origin develop

# 2. Créer une branche feature
./scripts/git-workflow.sh start-feature nom-de-la-fonctionnalite

# 3. Développer...
# ... votre code ...

# 4. Commiter avec convention
git commit -m "feat(scope): description"

# 5. Pousser la branche
git push -u origin feature/nom-de-la-fonctionnalite
```

### Finaliser une fonctionnalité

```bash
# 1. Créer Pull Request sur GitHub
# - Aller sur GitHub
# - Cliquer "Compare & pull request"
# - Remplir le template PR
# - Assigner un reviewer (vous-même)

# 2. Après review, merger sur GitHub
# 3. Supprimer la branche feature
git checkout develop
git pull origin develop
git branch -d feature/nom-de-la-fonctionnalite
```

### Release vers production

```bash
# 1. Créer Pull Request develop → main
# 2. Review et validation
# 3. Merge sur GitHub
# 4. Tag de version
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 🔍 Checklist de sécurité

### Avant chaque commit

- [ ] Code testé localement
- [ ] Linting passé (`npm run lint`)
- [ ] Tests passés (`npm run test`)
- [ ] Build réussi (`npm run build`)
- [ ] Commit message conventionnel

### Avant chaque Pull Request

- [ ] Branche à jour avec develop
- [ ] Tests automatisés passés
- [ ] Code review effectuée
- [ ] Documentation mise à jour
- [ ] Design system respecté

### Avant chaque merge vers main

- [ ] Tests E2E passés
- [ ] Performance validée
- [ ] Sécurité vérifiée
- [ ] Documentation complète
- [ ] Version taggée

## 🚨 Procédures d'urgence

### Rollback rapide

```bash
# Annuler le dernier commit
git reset --soft HEAD~1

# Revenir à un commit spécifique
git reset --hard <commit-hash>

# Créer un hotfix
./scripts/git-workflow.sh start-hotfix critical-bug
```

### Récupération de données

```bash
# Voir l'historique des commits
git log --oneline

# Voir les branches
git branch -a

# Récupérer un fichier supprimé
git checkout <commit-hash> -- path/to/file
```

## 📋 Monitoring manuel

### Vérifications quotidiennes

1. **État des branches** : `./scripts/git-workflow.sh status`
2. **Pull Requests en attente** : Vérifier sur GitHub
3. **Tests de build** : Exécuter localement
4. **Sécurité** : Vérifier les dépendances

### Alertes à surveiller

- Commits directs sur main/develop
- Branches feature non supprimées
- Pull Requests sans review
- Tests qui échouent

## 🎯 Intégration avec Task Master AI

### Workflow recommandé

1. **Créer une branche feature** pour chaque tâche
2. **Développer** la fonctionnalité
3. **Mettre à jour** le statut de la tâche
4. **Créer Pull Request** avec template
5. **Review et merger** sur GitHub
6. **Marquer la tâche** comme terminée

### Exemple pour la tâche #1

```bash
# 1. Commencer la tâche
./scripts/git-workflow.sh start-feature setup-project-infrastructure

# 2. Développer...
# ... votre code ...

# 3. Commiter
git commit -m "feat(setup): initialiser Next.js avec Supabase"

# 4. Pousser et créer PR
git push -u origin feature/setup-project-infrastructure
# Aller sur GitHub pour créer la Pull Request

# 5. Après merge, nettoyer
git checkout develop
git pull origin develop
git branch -d feature/setup-project-infrastructure
```

## 🔄 Migration vers public (optionnel)

Si vous décidez de rendre le repository public plus tard :

1. **Backup** : Exporter les données sensibles
2. **Nettoyer** : Supprimer les secrets et données privées
3. **Changer la visibilité** : Settings → Danger Zone
4. **Activer les protections** : Settings → Branches
5. **Tester** : Vérifier que tout fonctionne

## 📚 Ressources

- [Git Workflow Documentation](git-workflow.md)
- [Task Master AI Documentation](.taskmaster/docs/)
- [Design System](.taskmaster/docs/design-system-specs.md)
