# 🤝 Processus de contribution - NutriSensia

Ce guide détaille le processus de contribution et de code review pour le projet NutriSensia.

## 📋 Vue d'ensemble du processus

```
1. Créer une issue → 2. Créer une branche → 3. Développer → 4. Tests → 5. PR → 6. Review → 7. Merge
```

## 🎯 Étape 1 : Créer une issue

### Avant de commencer à coder

1. **Vérifier les issues existantes** :
   - Rechercher dans les issues GitHub
   - Éviter les doublons
   - Vérifier si le problème est déjà en cours de résolution

2. **Créer une issue claire** :

   ```markdown
   ## Description

   [Description claire du problème ou de la fonctionnalité]

   ## Contexte

   [Pourquoi cette modification est nécessaire]

   ## Solution proposée

   [Approche technique envisagée]

   ## Critères d'acceptation

   - [ ] Critère 1
   - [ ] Critère 2
   - [ ] Critère 3

   ## Informations supplémentaires

   [Captures d'écran, logs, etc.]
   ```

3. **Attribuer les labels appropriés** :
   - `bug` : Correction de bug
   - `enhancement` : Amélioration
   - `feature` : Nouvelle fonctionnalité
   - `documentation` : Documentation
   - `good first issue` : Pour les nouveaux contributeurs

## 🌿 Étape 2 : Créer une branche

### Conventions de nommage

```bash
# Format : type/description-courte
git checkout -b feature/user-authentication
git checkout -b fix/login-validation
git checkout -b docs/api-documentation
git checkout -b refactor/component-structure
```

### Types de branches

- `feature/` : Nouvelles fonctionnalités
- `fix/` : Corrections de bugs
- `docs/` : Documentation
- `refactor/` : Refactoring
- `test/` : Tests
- `chore/` : Tâches de maintenance

## 💻 Étape 3 : Développer

### Workflow de développement

1. **Synchroniser avec develop** :

   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/votre-fonctionnalite
   git merge develop
   ```

2. **Développer avec les bonnes pratiques** :
   - Suivre les conventions de code
   - Écrire des tests
   - Documenter les changements
   - Commiter régulièrement

3. **Vérifications avant commit** :
   ```bash
   npm run quality
   npm run build
   ```

### Conventions de commit

```bash
# Format : type(scope): description

# Exemples
git commit -m "feat(auth): ajouter authentification 2FA"
git commit -m "fix(dashboard): corriger l'affichage des patients"
git commit -m "docs(readme): mettre à jour la documentation"
git commit -m "refactor(components): simplifier la structure des composants"
git commit -m "test(api): ajouter tests pour l'endpoint users"
```

### Types de commits

- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, point-virgules manquants, etc.
- `refactor` : Refactoring
- `test` : Ajout ou modification de tests
- `chore` : Tâches de maintenance

## 🧪 Étape 4 : Tests

### Tests obligatoires

1. **Tests de qualité** :

   ```bash
   npm run quality
   ```

2. **Tests de build** :

   ```bash
   npm run build
   ```

3. **Tests manuels** :
   - Tester la fonctionnalité
   - Vérifier sur différents navigateurs
   - Tester les cas d'erreur

4. **Tests de régression** :
   - Vérifier que les fonctionnalités existantes fonctionnent toujours
   - Tester les intégrations

## 🔄 Étape 5 : Pull Request

### Créer une PR

1. **Pousser la branche** :

   ```bash
   git push -u origin feature/votre-fonctionnalite
   ```

2. **Créer la PR sur GitHub** :
   - Aller sur https://github.com/AdrienCornille/NutriSensia
   - Cliquer sur "Compare & pull request"
   - Remplir le template de PR

### Template de PR

Le template de PR est automatiquement rempli avec :

- **Description** : Résumé des changements
- **Type de changement** : Bug fix, feature, etc.
- **Tests effectués** : Liste des vérifications
- **Checklist** : Critères de qualité
- **Captures d'écran** : Si applicable

### Critères de PR

- [ ] Le code respecte les conventions ESLint
- [ ] Le code est formaté avec Prettier
- [ ] Pas d'erreurs TypeScript
- [ ] Les tests passent
- [ ] Le build fonctionne
- [ ] La documentation est mise à jour
- [ ] Aucune vulnérabilité de sécurité introduite
- [ ] Aucune régression de performance

## 👀 Étape 6 : Code Review

### Processus de review

1. **Review automatique** :
   - GitHub Actions vérifie la qualité
   - Tests automatiques s'exécutent
   - Vérifications de sécurité

2. **Review manuelle** :
   - Au moins un reviewer requis
   - Review de code par un membre de l'équipe
   - Vérification des bonnes pratiques

### Critères de review

#### Qualité du code

- [ ] Code lisible et maintenable
- [ ] Conventions respectées
- [ ] Pas de code dupliqué
- [ ] Gestion d'erreurs appropriée

#### Architecture

- [ ] Structure logique
- [ ] Séparation des responsabilités
- [ ] Réutilisabilité
- [ ] Performance

#### Tests

- [ ] Couverture de tests suffisante
- [ ] Tests pertinents
- [ ] Tests de régression

#### Documentation

- [ ] Code documenté
- [ ] README mis à jour si nécessaire
- [ ] Changelog mis à jour

### Comment faire une review

1. **Lire le code** :
   - Comprendre l'objectif
   - Vérifier la logique
   - Identifier les problèmes potentiels

2. **Tester localement** :

   ```bash
   git fetch origin
   git checkout feature/votre-fonctionnalite
   npm install
   npm run dev
   ```

3. **Commenter** :
   - Être constructif
   - Expliquer les suggestions
   - Proposer des améliorations

4. **Approuver ou demander des changements** :
   - "Approve" si tout est OK
   - "Request changes" si des modifications sont nécessaires

## ✅ Étape 7 : Merge

### Conditions de merge

- [ ] Au moins une approbation
- [ ] Tous les tests passent
- [ ] Pas de conflits
- [ ] Branche à jour avec develop

### Processus de merge

1. **Merge automatique** (si configuré) :
   - GitHub merge automatiquement si les conditions sont remplies

2. **Merge manuel** :
   - Merge par un maintainer
   - Suppression de la branche feature

### Après le merge

1. **Nettoyer** :

   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/votre-fonctionnalite
   git push origin --delete feature/votre-fonctionnalite
   ```

2. **Déploiement** :
   - Déploiement automatique sur Vercel
   - Tests de régression

## 🚨 Gestion des conflits

### Résolution de conflits

1. **Identifier les conflits** :

   ```bash
   git status
   ```

2. **Résoudre manuellement** :
   - Ouvrir les fichiers en conflit
   - Choisir les bonnes parties
   - Supprimer les marqueurs de conflit

3. **Finaliser** :
   ```bash
   git add .
   git commit -m "resolve: conflits de merge"
   ```

### En cas de conflit complexe

```bash
# Annuler le merge
git merge --abort

# Revenir à l'état précédent
git reset --hard HEAD

# Refaire le merge avec une approche différente
```

## 📊 Métriques de qualité

### Indicateurs suivis

- **Temps de review** : < 48h
- **Taux d'approbation** : > 90%
- **Couverture de tests** : > 80%
- **Temps de build** : < 5min
- **Vulnérabilités** : 0 critique/haute

### Outils de monitoring

- **GitHub Actions** : CI/CD
- **Vercel** : Déploiement et performance
- **Supabase** : Base de données
- **ESLint/Prettier** : Qualité du code

## 🎯 Bonnes pratiques

### Pour les contributeurs

1. **Communiquer** :
   - Poser des questions si nécessaire
   - Expliquer les choix techniques
   - Répondre aux commentaires de review

2. **Itérer** :
   - Accepter les feedbacks
   - Améliorer le code
   - Répondre aux demandes de changement

3. **Apprendre** :
   - Lire les reviews des autres
   - Participer aux discussions
   - Améliorer ses compétences

### Pour les reviewers

1. **Être constructif** :
   - Expliquer les suggestions
   - Proposer des alternatives
   - Encourager les bonnes pratiques

2. **Être rapide** :
   - Répondre dans les 48h
   - Être disponible pour les questions
   - Faire des reviews complètes

3. **Être cohérent** :
   - Appliquer les mêmes standards
   - Respecter les conventions
   - Maintenir la qualité

## 📞 Support

### En cas de problème

1. **Consulter la documentation** :
   - `docs/troubleshooting.md`
   - `docs/onboarding.md`
   - `docs/code-quality.md`

2. **Créer une issue** :
   - Décrire le problème clairement
   - Fournir les logs d'erreur
   - Proposer une solution si possible

3. **Contacter l'équipe** :
   - GitHub Discussions
   - Issues GitHub
   - Slack/Discord (si disponible)

## 🔄 Amélioration continue

### Feedback et suggestions

- **Améliorer le processus** : Proposer des améliorations
- **Documentation** : Compléter les guides
- **Outils** : Suggérer de nouveaux outils
- **Formation** : Partager les connaissances

### Événements

- **Code reviews** : Sessions de review en groupe
- **Pair programming** : Développement en binôme
- **Rétrospectives** : Amélioration du processus
- **Formations** : Partage de compétences

Merci de contribuer à NutriSensia ! 🚀
