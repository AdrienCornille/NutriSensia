# 🚨 Guide de dépannage - NutriSensia

Ce guide vous aide à résoudre les problèmes courants rencontrés lors du développement de NutriSensia.

## 🔧 Problèmes d'environnement

### Node.js et npm

#### Erreur : "Node.js version incompatible"
```bash
# Vérifier la version
node --version
npm --version

# Solution : Installer Node.js 18+
# Sur macOS avec Homebrew
brew install node@18

# Sur Windows avec nvm
nvm install 18
nvm use 18
```

#### Erreur : "npm install failed"
```bash
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Si le problème persiste, essayer avec yarn
npm install -g yarn
yarn install
```

### Git

#### Erreur : "Permission denied"
```bash
# Configurer les permissions SSH
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# Ou utiliser HTTPS
git remote set-url origin https://github.com/AdrienCornille/NutriSensia.git
```

#### Erreur : "Branch protection rules"
```bash
# Vérifier que vous êtes sur la bonne branche
git branch

# Créer une branche feature depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/votre-fonctionnalite
```

## 🐛 Problèmes de build

### Next.js

#### Erreur : "Module not found"
```bash
# Vérifier les imports
# Assurez-vous que les chemins sont corrects
import { Component } from '@/components/Component'

# Nettoyer le cache Next.js
rm -rf .next
npm run build
```

#### Erreur : "TypeScript compilation failed"
```bash
# Vérifier les types
npm run type-check

# Corriger les erreurs de type
# Exemple : ajouter des types manquants
interface User {
  id: string;
  name: string;
  email: string;
}
```

#### Erreur : "Build failed in production"
```bash
# Vérifier les variables d'environnement
cat .env.local

# Tester le build localement
npm run build

# Vérifier les logs de build
npm run build 2>&1 | tee build.log
```

### Tailwind CSS

#### Erreur : "Classes CSS non appliquées"
```bash
# Vérifier la configuration Tailwind
cat tailwind.config.ts

# Redémarrer le serveur de développement
npm run dev

# Vérifier que les classes sont dans le content
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
],
```

## 🔐 Problèmes Supabase

### Connexion

#### Erreur : "Supabase connection failed"
```bash
# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Tester la connexion
npm run dev
# Aller sur http://localhost:3000 et vérifier la console
```

#### Erreur : "Authentication failed"
```bash
# Vérifier les clés Supabase
# Aller sur https://supabase.com/dashboard/project/[PROJECT_ID]/settings/api

# Vérifier que les clés correspondent à .env.local
```

### Base de données

#### Erreur : "Table does not exist"
```bash
# Vérifier que les tables sont créées
# Suivre le guide dans docs/supabase-setup.md

# Vérifier les migrations
# Aller sur https://supabase.com/dashboard/project/[PROJECT_ID]/sql
```

## 🎨 Problèmes de qualité de code

### ESLint

#### Erreur : "ESLint configuration error"
```bash
# Vérifier la configuration
cat .eslintrc.json

# Réinstaller ESLint
npm uninstall eslint
npm install --save-dev eslint@^8

# Corriger les erreurs automatiquement
npm run lint:fix
```

#### Erreur : "Prettier conflict"
```bash
# Formater le code
npm run format

# Vérifier la configuration Prettier
cat .prettierrc

# Résoudre les conflits manuellement si nécessaire
```

### TypeScript

#### Erreur : "Type 'X' is not assignable to type 'Y'"
```typescript
// Solution : Ajouter des types explicites
const user: User = {
  id: '1',
  name: 'John',
  email: 'john@example.com'
};

// Ou utiliser des types génériques
const users: User[] = [];
```

#### Erreur : "Cannot find module"
```typescript
// Vérifier les imports
import { Component } from '@/components/Component';

// Vérifier que le fichier existe
ls src/components/Component.tsx

// Vérifier tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🚀 Problèmes de déploiement

### Vercel

#### Erreur : "Build failed on Vercel"
```bash
# Vérifier les variables d'environnement sur Vercel
# Aller sur https://vercel.com/dashboard/project/[PROJECT_ID]/settings/environment-variables

# Vérifier que toutes les variables sont définies
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Erreur : "Deployment timeout"
```bash
# Optimiser le build
# Vérifier les imports inutiles
# Réduire la taille des bundles

# Vérifier les dépendances
npm audit
npm outdated
```

### GitHub Actions

#### Erreur : "CI/CD pipeline failed"
```bash
# Vérifier les logs GitHub Actions
# Aller sur https://github.com/AdrienCornille/NutriSensia/actions

# Tester localement
npm run quality
npm run build
```

## 🔍 Outils de diagnostic

### Scripts utiles

```bash
# Vérifier l'environnement complet
npm run quality

# Vérifier les types uniquement
npm run type-check

# Vérifier le linting uniquement
npm run lint

# Vérifier le formatage uniquement
npm run format:check

# Nettoyer et reconstruire
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Commandes de diagnostic

```bash
# Vérifier les versions
node --version
npm --version
git --version

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h

# Vérifier les processus Node.js
ps aux | grep node
```

## 📞 Support

### Avant de demander de l'aide

1. **Consulter ce guide** : Recherchez votre problème
2. **Vérifier les logs** : Regardez les messages d'erreur complets
3. **Tester localement** : Reproduisez le problème
4. **Rechercher les issues** : Vérifiez GitHub Issues

### Comment demander de l'aide

Lorsque vous créez une issue ou demandez de l'aide, incluez :

```markdown
## Description du problème
[Description claire du problème]

## Étapes pour reproduire
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

## Comportement attendu
[Ce qui devrait se passer]

## Comportement actuel
[Ce qui se passe réellement]

## Informations système
- OS : [macOS/Windows/Linux]
- Node.js : [version]
- npm : [version]
- Navigateur : [version]

## Logs d'erreur
```
[Coller les logs d'erreur complets]
```

## Captures d'écran
[Si applicable]
```

### Contacts

- **GitHub Issues** : https://github.com/AdrienCornille/NutriSensia/issues
- **Documentation** : `docs/` dans le repository
- **Équipe** : [Contact Slack/Discord]

## 🔄 Mise à jour de ce guide

Ce guide est maintenu par l'équipe. Si vous trouvez une solution à un problème non documenté :

1. Créez une Pull Request avec votre ajout
2. Suivez le template de PR
3. Ajoutez votre solution dans la section appropriée

Merci de contribuer à l'amélioration de ce guide ! 🚀
