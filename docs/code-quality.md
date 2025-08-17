# Code Quality - NutriSensia

## 🛠️ Outils configurés

### ESLint
- **Configuration** : `.eslintrc.json`
- **Règles** : Next.js + Prettier
- **Commandes** :
  ```bash
  npm run lint          # Vérifier le code
  npm run lint:fix      # Corriger automatiquement
  ```

### Prettier
- **Configuration** : `.prettierrc`
- **Fichiers ignorés** : `.prettierignore`
- **Commandes** :
  ```bash
  npm run format        # Formater tout le code
  npm run format:check  # Vérifier le formatage
  ```

### TypeScript
- **Configuration** : `tsconfig.json`
- **Commande** :
  ```bash
  npm run type-check    # Vérifier les types
  ```

### Husky (Git Hooks)
- **Configuration** : `.husky/pre-commit`
- **Fonction** : Exécute automatiquement lint-staged avant chaque commit

### lint-staged
- **Configuration** : `package.json`
- **Fonction** : Formate et vérifie uniquement les fichiers modifiés

## 🚀 Workflow de développement

### 1. Avant de commencer
```bash
# Installer les dépendances
npm install

# Vérifier que tout fonctionne
npm run quality
```

### 2. Pendant le développement
```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, surveiller la qualité
npm run lint -- --watch
```

### 3. Avant de commiter
```bash
# Vérifier la qualité complète
npm run quality

# Formater le code si nécessaire
npm run format
```

### 4. Commit automatique
Les hooks Git s'exécutent automatiquement :
- Formatage automatique avec Prettier
- Vérification ESLint
- Vérification TypeScript

## 📋 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run lint:fix` | Correction ESLint automatique |
| `npm run format` | Formatage Prettier |
| `npm run format:check` | Vérification formatage |
| `npm run type-check` | Vérification TypeScript |
| `npm run quality` | Vérification complète |

## 🔧 Configuration des outils

### ESLint
```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

### Prettier
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### lint-staged
```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

## 🚨 Résolution des problèmes

### Erreurs ESLint courantes

#### Variables non utilisées
```typescript
// ❌ Erreur
const unusedVar = 'test';

// ✅ Solution
const _unusedVar = 'test'; // Préfixe avec _
// ou
// eslint-disable-next-line no-unused-vars
const unusedVar = 'test';
```

#### Console.log en production
```typescript
// ❌ Erreur
console.log('debug info');

// ✅ Solution
if (process.env.NODE_ENV === 'development') {
  console.log('debug info');
}
```

### Erreurs Prettier courantes

#### Guillemets
```typescript
// ❌ Erreur
const message = "Hello world";

// ✅ Solution
const message = 'Hello world';
```

#### Longues lignes
```typescript
// ❌ Erreur
const veryLongLine = "Cette ligne est très longue et dépasse la limite de 80 caractères définie par Prettier";

// ✅ Solution (automatique)
const veryLongLine =
  'Cette ligne est très longue et dépasse la limite de 80 caractères définie par Prettier';
```

## 🔄 Intégration CI/CD

### GitHub Actions
Le workflow `.github/workflows/ci.yml` vérifie automatiquement :
- Linting ESLint
- Formatage Prettier
- Types TypeScript
- Build de production
- Audit de sécurité

### Vercel
- Déploiement automatique sur push vers `main`
- Preview automatique sur Pull Requests
- Variables d'environnement configurées

## 📚 Ressources

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [TypeScript Documentation](https://www.typescriptlang.org/)
