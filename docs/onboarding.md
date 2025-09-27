# 🚀 Guide d'onboarding - NutriSensia

Bienvenue dans l'équipe NutriSensia ! Ce guide vous accompagnera dans la configuration de votre environnement de développement.

## 📋 Prérequis

### Outils requis

- **Node.js** : Version 18.x ou supérieure
- **Git** : Version 2.30.x ou supérieure
- **npm** : Version 8.x ou supérieure
- **VS Code** (recommandé) avec les extensions suivantes :
  - ESLint
  - Prettier
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - GitLens

### Comptes requis

- **GitHub** : Pour accéder au repository
- **Supabase** : Pour la base de données (accès fourni par l'équipe)
- **Vercel** : Pour le déploiement (accès fourni par l'équipe)

## 🛠️ Configuration de l'environnement

### 1. Cloner le repository

```bash
# Cloner le repository
git clone https://github.com/AdrienCornille/NutriSensia.git
cd NutriSensia

# Basculer sur la branche develop
git checkout develop
```

### 2. Installer les dépendances

```bash
# Installer les dépendances
npm install

# Vérifier l'installation
npm run quality
```

### 3. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer le fichier avec vos vraies valeurs
nano .env.local
```

**Variables requises :**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuration de l'environnement
NODE_ENV=development

# Autres variables d'environnement pour NutriSensia
NEXT_PUBLIC_APP_NAME=NutriSensia
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### 4. Configuration de Supabase

Suivez le guide dans `docs/supabase-setup.md` pour configurer votre base de données Supabase.

### 5. Vérification de l'installation

```bash
# Tester le build
npm run build

# Démarrer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour vérifier que l'application fonctionne.

## 🎯 Workflow de développement

### 1. Créer une nouvelle fonctionnalité

```bash
# Basculer sur develop
git checkout develop
git pull origin develop

# Créer une branche feature
git checkout -b feature/nom-de-la-fonctionnalite

# Développer...
npm run dev
```

### 2. Vérifications avant commit

```bash
# Vérifier la qualité du code
npm run quality

# Formater le code
npm run format

# Tester le build
npm run build
```

### 3. Commit et push

```bash
# Ajouter les fichiers
git add .

# Commit (les hooks Git s'exécutent automatiquement)
git commit -m "feat: description de la fonctionnalité"

# Pousser la branche
git push -u origin feature/nom-de-la-fonctionnalite
```

### 4. Créer une Pull Request

1. Aller sur GitHub : https://github.com/AdrienCornille/NutriSensia
2. Cliquer sur "Compare & pull request"
3. Remplir le template de PR
4. Attendre les vérifications CI/CD
5. Demander une review

## 📚 Ressources utiles

### Documentation

- [README.md](../README.md) - Vue d'ensemble du projet
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guide de contribution
- [docs/code-quality.md](code-quality.md) - Outils de qualité de code
- [docs/git-workflow.md](git-workflow.md) - Workflow Git
- [docs/supabase-setup.md](supabase-setup.md) - Configuration Supabase

### Technologies utilisées

- [Next.js 14](https://nextjs.org/docs) - Framework React
- [TypeScript](https://www.typescriptlang.org/docs/) - Typage statique
- [Tailwind CSS](https://tailwindcss.com/docs) - Framework CSS
- [Supabase](https://supabase.com/docs) - Backend-as-a-Service
- [Zustand](https://github.com/pmndrs/zustand) - Gestion d'état
- [TanStack Query](https://tanstack.com/query/latest) - Gestion des données
- [React Hook Form](https://react-hook-form.com/) - Gestion des formulaires
- [Zod](https://zod.dev/) - Validation de schémas
- [Framer Motion](https://www.framer.com/motion/) - Animations

### Outils de développement

- [ESLint](https://eslint.org/) - Linting JavaScript/TypeScript
- [Prettier](https://prettier.io/) - Formatage de code
- [Husky](https://typicode.github.io/husky/) - Hooks Git
- [lint-staged](https://github.com/okonet/lint-staged) - Linting des fichiers modifiés

## 🎨 Conventions de code

### Structure des fichiers

```
src/
├── app/                 # Pages Next.js (App Router)
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base
│   └── forms/          # Composants de formulaires
├── lib/                # Utilitaires et configurations
├── hooks/              # Hooks React personnalisés
└── types/              # Types TypeScript globaux
```

### Conventions de nommage

- **Fichiers** : `kebab-case` (ex: `user-profile.tsx`)
- **Composants** : `PascalCase` (ex: `UserProfile`)
- **Variables** : `camelCase` (ex: `userName`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)
- **Types** : `PascalCase` avec préfixe (ex: `UserProfileProps`)

### Palette de couleurs

```css
/* Primary */
--color-primary: #2e7d5e;
--color-primary-light: #4a9b7a;
--color-primary-dark: #1e5a3e;

/* Background */
--color-background: #fafbfc;
--color-background-secondary: #f8f9fa;

/* Accent */
--color-accent: #ff6b35;
--color-accent-light: #ff8a5c;
--color-accent-dark: #e55a2b;

/* Neutral */
--color-neutral: #6b7280;
--color-neutral-light: #9ca3af;
--color-neutral-dark: #4b5563;
```

## 🚨 Dépannage

### Problèmes courants

#### Erreur de build

```bash
# Nettoyer le cache
rm -rf .next
npm run build
```

#### Erreurs ESLint/Prettier

```bash
# Corriger automatiquement
npm run lint:fix
npm run format
```

#### Problèmes de dépendances

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

#### Problèmes de variables d'environnement

```bash
# Vérifier que .env.local existe
ls -la .env.local

# Redémarrer le serveur de développement
npm run dev
```

### Support

Si vous rencontrez des problèmes :

1. Consultez la documentation dans `docs/`
2. Vérifiez les issues GitHub existantes
3. Créez une nouvelle issue avec les détails du problème
4. Contactez l'équipe sur Slack/Discord

## 🎉 Prochaines étapes

Une fois votre environnement configuré :

1. **Explorer le code** : Parcourez les fichiers pour comprendre l'architecture
2. **Lire les tâches** : Consultez les tâches TaskMaster AI pour comprendre les objectifs
3. **Prendre une tâche** : Choisissez une tâche simple pour commencer
4. **Participer aux reviews** : Rejoignez les discussions sur les Pull Requests

Bienvenue dans l'équipe ! 🚀
