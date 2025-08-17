# NutriSensia 🍎

Votre assistant nutritionnel intelligent - Une application web moderne pour la gestion nutritionnelle personnalisée avec IA.

## 🚀 Fonctionnalités

- **Planification intelligente** : Créez des plans de repas personnalisés adaptés à vos objectifs
- **Suivi des progrès** : Visualisez vos progrès nutritionnels avec des graphiques détaillés
- **IA personnalisée** : Bénéficiez de recommandations nutritionnelles intelligentes
- **Conformité GDPR** : Hébergement EU-West pour la protection des données européennes

## 🛠️ Technologies

- **Frontend** : Next.js 14.2.5, React 18.3.1, TypeScript 5.5.4
- **Styling** : Tailwind CSS 3.4.7 avec palette personnalisée
- **Backend** : Supabase (PostgreSQL + Auth + Real-time)
- **État** : Zustand pour la gestion d'état
- **Données** : TanStack Query pour la gestion des requêtes
- **Formulaires** : React Hook Form + Zod pour la validation
- **Animations** : Framer Motion

## 📋 Prérequis

- Node.js 18+
- npm, yarn ou pnpm
- Compte Supabase (pour la base de données)

## 🚀 Installation

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/AdrienCornille/NutriSensia.git
   cd NutriSensia
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement**

   ```bash
   cp .env.example .env.local
   ```

   Puis éditez `.env.local` avec vos clés Supabase :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configuration Supabase**

   Suivez le guide de configuration dans [`docs/supabase-setup.md`](docs/supabase-setup.md)

5. **Lancer le serveur de développement**

   ```bash
   npm run dev
   ```

6. **Ouvrir l'application**

   Naviguez vers [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du projet

```
NutriSensia/
├── src/
│   ├── app/                 # App Router Next.js
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants UI réutilisables
│   │   └── forms/          # Composants de formulaires
│   ├── hooks/              # Hooks personnalisés
│   └── lib/                # Utilitaires et configuration
│       ├── store.ts        # Store Zustand
│       ├── supabase.ts     # Client Supabase
│       └── schemas.ts      # Schémas Zod
├── docs/                   # Documentation
├── public/                 # Assets statiques
└── .taskmaster/           # Gestion des tâches
```

## 🎨 Palette de couleurs

- **Primary** : #2E7D5E (Vert principal)
- **Background** : #FAFBFC (Fond principal)
- **Accent** : #FF6B35 (Orange accent)
- **Neutral** : #6B7280 (Gris neutre)

## 📚 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification ESLint
npm run lint:fix     # Correction ESLint automatique
npm run format       # Formatage Prettier
npm run format:check # Vérification formatage
npm run type-check   # Vérification TypeScript
npm run quality      # Vérification complète
npm run validate-env # Validation de l'environnement
npm run setup        # Configuration automatique
```

## 📖 Documentation

### Guides principaux
- [Guide d'onboarding](docs/onboarding.md) - Configuration de l'environnement pour nouveaux développeurs
- [Guide de dépannage](docs/troubleshooting.md) - Résolution des problèmes courants
- [Guide de qualité de code](docs/code-quality.md) - Outils et conventions de qualité
- [Processus de contribution](docs/contribution-process.md) - Comment contribuer au projet
- [Workflow Git](docs/git-workflow.md) - Conventions et workflow Git
- [Configuration Supabase](docs/supabase-setup.md) - Setup de la base de données

### Scripts d'automatisation
- `scripts/validate-env.js` - Validation complète de l'environnement
- `scripts/setup.sh` - Configuration automatique de l'environnement

## 🔧 Configuration

### Variables d'environnement

| Variable                        | Description              | Requis |
| ------------------------------- | ------------------------ | ------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL du projet Supabase   | ✅     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase     | ✅     |
| `NEXT_PUBLIC_APP_NAME`          | Nom de l'application     | ❌     |
| `NEXT_PUBLIC_APP_VERSION`       | Version de l'application | ❌     |

### Base de données

Le projet utilise Supabase avec les tables suivantes :

- `users` - Profils utilisateurs et préférences
- `meals` - Repas individuels avec valeurs nutritionnelles
- `meal_plans` - Plans de repas complets

## 🤝 Contribution

Nous accueillons les contributions ! Consultez notre guide de contribution dans [`CONTRIBUTING.md`](CONTRIBUTING.md).

### Workflow de développement

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [`LICENSE`](LICENSE) pour plus de détails.

## 🆘 Support

- **Documentation** : [`docs/`](docs/)
- **Issues** : [GitHub Issues](https://github.com/AdrienCornille/NutriSensia/issues)
- **Discussions** : [GitHub Discussions](https://github.com/AdrienCornille/NutriSensia/discussions)

## 🔗 Liens utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation Zustand](https://github.com/pmndrs/zustand)

---

Développé avec ❤️ pour une nutrition intelligente et personnalisée.
