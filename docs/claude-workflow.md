# Claude Code Workflow - NutriSensia

Ce document définit le workflow standard que Claude Code doit suivre lors de l'implémentation de nouvelles features ou modifications sur le projet NutriSensia.

## 🎯 Objectifs du Workflow

1. **Préserver la context window** - Utiliser les sub-agents pour éviter la compaction
2. **Maximiser l'efficacité** - Paralléliser les tâches quand possible
3. **Garantir la qualité** - Toujours explorer avant d'implémenter
4. **Maintenir la cohérence** - Suivre les patterns existants du projet

---

## 📊 Classification des Tâches

Avant de commencer, classifier la tâche selon sa complexité :

### Niveau 1: Changement Trivial
**Critères**:
- Modification < 3 fichiers
- Pas de décision architecturale
- Pattern existant clair à suivre
- Exemples: fix typo, ajout prop à composant, traduction

**Workflow**: Implémentation directe sans sub-agent

### Niveau 2: Changement Moyen
**Critères**:
- Modification 3-10 fichiers
- Utilise des patterns existants
- Nécessite compréhension du contexte
- Exemples: nouveau composant UI, nouvelle page simple, ajout endpoint API

**Workflow**: Explore → Implémente → Commit

### Niveau 3: Feature Complexe
**Critères**:
- Modification 10+ fichiers
- Décisions architecturales requises
- Plusieurs approches possibles
- Impact sur plusieurs modules
- Exemples: système de messagerie, refactoring architecture, nouveau workflow utilisateur

**Workflow**: Explore → Plan → Implémente → Test → Commit

### Niveau 4: Refactoring Majeur
**Critères**:
- Modification architecture existante
- Impact sur de nombreux fichiers
- Risque de régression élevé
- Exemples: migration DB, changement state management, refonte auth

**Workflow**: Explore (very thorough) → Plan → Review → Implémente par phases → Test continu → Commit progressif

---

## 🚀 Workflows Détaillés

### Workflow Niveau 1: Changement Trivial

```
┌─────────────────────────────────────┐
│ 1. Lire fichier(s) concerné(s)     │
│    Tool: Read                        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 2. Implémenter le changement        │
│    Tool: Edit ou Write               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 3. Vérifier syntaxe si nécessaire   │
│    Tool: Bash (npm run type-check)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 4. Informer l'utilisateur           │
│    Texte: Résumé du changement       │
└─────────────────────────────────────┘
```

**Pas de commit automatique** - Laisser l'utilisateur décider quand commiter

---

### Workflow Niveau 2: Changement Moyen

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: EXPLORATION                                 │
│ Tool: Task (subagent_type: Explore)                 │
│ Thoroughness: "medium"                               │
│                                                      │
│ Prompt exemple:                                      │
│ "Explore [fonctionnalité concernée] dans le projet  │
│  NutriSensia. Je veux comprendre:                   │
│  1. Les fichiers existants liés à [sujet]          │
│  2. Les patterns utilisés pour [type de feature]   │
│  3. Les dépendances et imports concernés"           │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 2: ANALYSE DES RÉSULTATS                       │
│ - Lire le rapport de l'agent Explore                │
│ - Identifier les fichiers clés à modifier           │
│ - Vérifier la cohérence avec l'architecture         │
│ - Poser des questions à l'utilisateur si ambiguïté   │
│   Tool: AskUserQuestion (si nécessaire)             │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 3: TODO LIST                                   │
│ Tool: TodoWrite                                      │
│                                                      │
│ Créer une todo list avec les étapes:                │
│ - Lecture fichiers existants                        │
│ - Modifications à apporter (1 todo par fichier)     │
│ - Vérification type-check                           │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 4: IMPLÉMENTATION                              │
│ Pour chaque todo:                                    │
│ 1. Marquer todo as "in_progress"                    │
│ 2. Lire fichier si pas déjà fait (Tool: Read)       │
│ 3. Appliquer modification (Tool: Edit/Write)         │
│ 4. Marquer todo as "completed"                      │
│                                                      │
│ IMPORTANT: 1 seul todo "in_progress" à la fois      │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 5: VÉRIFICATION                                │
│ Tool: Bash                                           │
│                                                      │
│ Commandes à exécuter en parallèle:                  │
│ - npm run type-check                                │
│ - npm run lint (si modifications importantes)       │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 6: RÉSUMÉ                                      │
│ Texte à l'utilisateur:                              │
│ - Résumé des modifications                          │
│ - Fichiers modifiés (avec liens [file:line])        │
│ - Résultats des vérifications                       │
│ - Proposer de créer un commit (ne pas le faire auto)│
└─────────────────────────────────────────────────────┘
```

---

### Workflow Niveau 3: Feature Complexe

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: EXPLORATION APPROFONDIE                     │
│ Tool: Task (subagent_type: Explore)                 │
│ Thoroughness: "very thorough"                        │
│                                                      │
│ Exploration en PARALLÈLE si possible:                │
│ - Agent 1: "Explore [module A concerné]"            │
│ - Agent 2: "Explore [module B concerné]"            │
│                                                      │
│ Utiliser un SEUL message avec 2 Task tool calls     │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 2: PLANIFICATION                               │
│ Option A: EnterPlanMode (si très complexe)          │
│ Option B: Task (subagent_type: Plan)               │
│                                                      │
│ Le plan doit inclure:                                │
│ 1. Architecture proposée                            │
│ 2. Fichiers à créer / modifier                      │
│ 3. Schéma DB si applicable                          │
│ 4. API endpoints à créer                            │
│ 5. Composants UI nécessaires                        │
│ 6. Points de décision (pour AskUserQuestion)        │
│ 7. Ordre d'implémentation recommandé                │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 3: VALIDATION UTILISATEUR                      │
│ - Présenter le plan de manière structurée           │
│ - Identifier les points de décision                 │
│ - Tool: AskUserQuestion pour clarifier              │
│   (max 4 questions, options claires)                │
│                                                      │
│ Attendre validation explicite avant de continuer    │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 4: TODO LIST DÉTAILLÉE                         │
│ Tool: TodoWrite                                      │
│                                                      │
│ Organisation par phases:                             │
│ Phase 1: Base de données / Types                    │
│ - Créer migration SQL                               │
│ - Créer types TypeScript                            │
│                                                      │
│ Phase 2: API / Backend                              │
│ - Créer route API 1                                 │
│ - Créer route API 2                                 │
│ - Ajouter helpers si nécessaire                     │
│                                                      │
│ Phase 3: Composants UI                              │
│ - Créer composant principal                         │
│ - Créer sous-composants                             │
│ - Intégrer dans pages                               │
│                                                      │
│ Phase 4: Vérification                               │
│ - Type-check                                        │
│ - Lint                                              │
│ - Tests (si demandé)                                │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 5: IMPLÉMENTATION PROGRESSIVE                  │
│                                                      │
│ Pour chaque phase du todo:                          │
│ 1. Annoncer début de phase à l'utilisateur          │
│ 2. Pour chaque todo de la phase:                    │
│    a. Marquer "in_progress"                         │
│    b. Implémenter (Read → Edit/Write)               │
│    c. Marquer "completed"                           │
│ 3. À la fin de chaque phase:                        │
│    - Faire un point avec l'utilisateur              │
│    - Vérifier que tout fonctionne                   │
│    - Proposer de créer un commit intermédiaire      │
│                                                      │
│ IMPORTANT:                                           │
│ - 1 seul todo "in_progress" à la fois               │
│ - Marquer "completed" immédiatement après fin       │
│ - Ne pas batcher les completions                    │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 6: VÉRIFICATION GLOBALE                        │
│ Tool: Bash (commandes en parallèle)                 │
│                                                      │
│ - npm run type-check                                │
│ - npm run lint                                      │
│ - npm run build (si demandé)                        │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 7: DOCUMENTATION & RÉSUMÉ                      │
│                                                      │
│ Fournir à l'utilisateur:                            │
│ 1. Résumé de la feature implémentée                 │
│ 2. Liste des fichiers créés/modifiés avec liens     │
│ 3. Points d'attention pour l'utilisateur            │
│ 4. Prochaines étapes suggérées (si applicable)      │
│ 5. Proposer de créer un commit ou PR                │
│                                                      │
│ NE PAS créer le commit automatiquement              │
└─────────────────────────────────────────────────────┘
```

---

### Workflow Niveau 4: Refactoring Majeur

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: EXPLORATION EXHAUSTIVE                     │
│ Tool: Task (subagent_type: Explore)                 │
│ Thoroughness: "very thorough"                        │
│                                                      │
│ Exploration complète en PARALLÈLE:                  │
│ - Agent 1: "Explore architecture actuelle complète" │
│ - Agent 2: "Explore toutes dépendances de [module]" │
│ - Agent 3: "Explore tests existants"               │
│                                                      │
│ Attendre tous les résultats avant de continuer      │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 2: ANALYSE D'IMPACT                            │
│                                                      │
│ Synthétiser les rapports des agents:                │
│ - Identifier TOUS les fichiers impactés             │
│ - Lister les breaking changes potentiels            │
│ - Évaluer les risques de régression                 │
│ - Identifier les dépendances critiques              │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 3: STRATÉGIE DE MIGRATION                      │
│ Tool: EnterPlanMode (OBLIGATOIRE pour refactoring)  │
│                                                      │
│ Le plan de migration doit inclure:                  │
│ 1. État actuel (AS-IS)                              │
│ 2. État cible (TO-BE)                               │
│ 3. Stratégie de migration:                          │
│    - Approche Big Bang vs Progressive               │
│    - Phases de migration détaillées                 │
│    - Points de rollback possibles                   │
│ 4. Gestion de la compatibilité ascendante           │
│ 5. Plan de tests pour chaque phase                  │
│ 6. Checklist de validation                          │
│                                                      │
│ Tool: ExitPlanMode pour soumettre le plan           │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 4: VALIDATION APPROFONDIE                      │
│                                                      │
│ - Présenter le plan complet                         │
│ - Tool: AskUserQuestion pour:                       │
│   * Confirmer l'approche (Big Bang vs Progressive)  │
│   * Valider l'ordre des phases                      │
│   * Confirmer les breaking changes acceptables      │
│   * Définir la stratégie de rollback                │
│                                                      │
│ ATTENDRE validation explicite + confirmation écrite │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 5: IMPLÉMENTATION PAR PHASES                   │
│                                                      │
│ Pour CHAQUE phase de migration:                     │
│                                                      │
│ A. Todo list de la phase (Tool: TodoWrite)          │
│ B. Implémentation progressive                       │
│ C. Vérification immédiate (type-check + lint)       │
│ D. COMMIT de la phase (Tool: Bash)                  │
│    - Message descriptif de la phase                 │
│    - Permet rollback facile                         │
│ E. Point de validation avec utilisateur             │
│    - Tester manuellement la phase                   │
│    - Confirmer avant phase suivante                 │
│                                                      │
│ NE JAMAIS passer à la phase suivante sans           │
│ confirmation utilisateur                             │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 6: VÉRIFICATION GLOBALE POST-REFACTORING       │
│ Tool: Bash                                           │
│                                                      │
│ Commandes à exécuter:                                │
│ - npm run type-check (doit passer à 100%)           │
│ - npm run lint:fix (corriger auto si possible)      │
│ - npm run build (vérifier production build)         │
│ - npm run test (si tests existent)                  │
│                                                      │
│ Si ÉCHEC: identifier et corriger avant de continuer │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│ PHASE 7: DOCUMENTATION DU REFACTORING                │
│                                                      │
│ Créer/Mettre à jour documentation:                  │
│ - Migration guide (si applicable)                   │
│ - Changelog détaillé                                │
│ - Breaking changes list                             │
│ - Architecture documentation update                 │
│                                                      │
│ Fournir résumé complet:                             │
│ - Ce qui a changé                                   │
│ - Impact sur le code existant                       │
│ - Actions requises (si breaking changes)            │
│ - Bénéfices du refactoring                          │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Patterns Spécifiques à NutriSensia

### Pattern 1: Ajout d'une Nouvelle Page

```typescript
// Workflow automatique pour nouvelle page

ÉTAPE 1: Vérifier structure i18n
- Lire: src/i18n/routing.ts
- Ajouter path localisé si nécessaire

ÉTAPE 2: Créer la page
- Structure: src/app/[locale]/[section]/page.tsx
- Template de base avec metadata

ÉTAPE 3: Ajouter traductions
- messages/fr.json
- messages/en.json

ÉTAPE 4: Mettre à jour navigation si nécessaire
- components/layout/Header.tsx
- components/dashboard/DashboardSidebar.tsx (si dashboard)

ÉTAPE 5: Vérifier middleware
- src/middleware.ts
- Ajouter route protégée si nécessaire
```

### Pattern 2: Ajout d'un Endpoint API Protégé

```typescript
// Workflow automatique pour API route

ÉTAPE 1: Explorer routes API existantes similaires
- Tool: Grep "withAuth" ou "withAdminAuth"
- Identifier le pattern à suivre

ÉTAPE 2: Créer le fichier
- Structure: src/app/api/[section]/[endpoint]/route.ts
- Utiliser wrapper approprié (withAuth, withAdminAuth, etc.)

ÉTAPE 3: Définir permissions
interface APIPermissions {
  requireAuth: boolean;
  requiredRole?: 'nutritionist' | 'patient' | 'admin';
  require2FA?: boolean;
}

ÉTAPE 4: Valider avec Zod schema
- Importer depuis src/lib/schemas.ts ou créer nouveau

ÉTAPE 5: Gestion d'erreur
- Utiliser apiResponse.error() de src/lib/api-auth.ts
- Messages d'erreur en français

ÉTAPE 6: Tests manuels suggérés
- Fournir exemples de curl/fetch pour tester
```

### Pattern 3: Ajout d'un Composant UI

```typescript
// Workflow automatique pour composant UI

ÉTAPE 1: Vérifier design system
- Lire: tailwind.config.ts
- Utiliser tokens du design system (colors, spacing, typography)

ÉTAPE 2: Explorer composants similaires
- Tool: Glob "src/components/ui/**/*.tsx"
- Identifier pattern de props, variants, etc.

ÉTAPE 3: Créer composant
- Structure: src/components/[category]/ComponentName.tsx
- Props avec TypeScript
- Utiliser forwardRef si nécessaire
- Ajouter displayName

ÉTAPE 4: Utiliser clsx/tailwind-merge
- Import depuis src/lib/utils ou similaire
- Gérer conditional classes

ÉTAPE 5: Accessibilité
- Ajouter ARIA labels appropriés
- Tester navigation clavier
- Gérer focus states

ÉTAPE 6: Export
- Ajouter à src/components/ui/index.ts si composant UI de base
```

### Pattern 4: Modification du Schéma Database

```typescript
// Workflow STRICT pour modifications DB

ÉTAPE 1: Explorer schéma existant
- Lire fichiers dans database/
- Identifier numéro de migration suivant

ÉTAPE 2: Créer fichier de migration
- Nom: database/XX_description.sql (XX = numéro séquentiel)
- Toujours inclure UP et DOWN migrations
- Ajouter commentaires explicatifs

ÉTAPE 3: RLS Policies
- TOUJOURS définir Row Level Security
- Pattern: qui peut SELECT/INSERT/UPDATE/DELETE quoi
- Tester avec différents rôles

ÉTAPE 4: Mettre à jour types TypeScript
- src/lib/supabase.ts → Database interface
- Générer types si possible: npx supabase gen types

ÉTAPE 5: Validation avant commit
- NE JAMAIS commiter migration DB seule
- Toujours avec le code qui l'utilise
- Tester rollback (DOWN migration)

ÉTAPE 6: Documentation
- Ajouter note dans docs/DATABASE_ARCHITECTURE.md
- Expliquer le pourquoi de la modification
```

---

## 🔧 Règles de Gestion des Todos

### Création de Todos

```typescript
// TOUJOURS créer des todos pour:
- Tâches complexes (niveau 2+)
- Tâches multi-étapes (3+ étapes)
- Implémentation de features

// JAMAIS créer des todos pour:
- Tâches triviales (fix typo)
- Une seule action simple
- Questions/discussions
```

### Format des Todos

```typescript
// Exemple de bonne structure
TodoWrite({
  todos: [
    {
      content: "Créer migration SQL pour table messages",
      activeForm: "Création de la migration SQL",
      status: "pending"
    },
    {
      content: "Créer types TypeScript pour messages",
      activeForm: "Création des types TypeScript",
      status: "pending"
    },
    {
      content: "Créer API route POST /api/messages",
      activeForm: "Création de l'API route",
      status: "pending"
    },
    {
      content: "Créer composant MessageList",
      activeForm: "Création du composant MessageList",
      status: "pending"
    },
    {
      content: "Vérifier type-check et lint",
      activeForm: "Vérification type-check et lint",
      status: "pending"
    }
  ]
});

// ❌ MAUVAIS: Trop vague
{
  content: "Implémenter la messagerie",
  activeForm: "Implémentation de la messagerie",
  status: "pending"
}

// ✅ BON: Spécifique et actionnable
{
  content: "Créer table messages avec colonnes (id, sender_id, receiver_id, content, created_at)",
  activeForm: "Création de la table messages",
  status: "pending"
}
```

### Gestion d'État des Todos

```typescript
// RÈGLES STRICTES:

// 1. Un seul todo "in_progress" à la fois
// ❌ INTERDIT:
- Marquer plusieurs todos "in_progress"
- Commencer un todo avant de finir le précédent

// ✅ OBLIGATOIRE:
- Marquer "in_progress" → Travailler → Marquer "completed"
- Puis passer au suivant

// 2. Marquer "completed" IMMÉDIATEMENT après fin
// ❌ INTERDIT:
- Finir 3 todos puis marquer tous "completed" d'un coup
- Oublier de marquer "completed"

// ✅ OBLIGATOIRE:
- Dès qu'un todo est terminé → marquer "completed"
- Ne jamais batching des completions

// 3. Critères de "completed"
// Marquer "completed" SEULEMENT si:
- Tâche 100% terminée
- Pas d'erreurs bloquantes
- Tests passent (si applicable)

// Garder "in_progress" si:
- Erreurs non résolues
- Implémentation partielle
- Tests échouent
```

### Gestion d'Erreurs dans Todos

```typescript
// Si un todo rencontre une erreur bloquante:

// 1. Garder le todo "in_progress"
// 2. Créer nouveau todo pour résoudre l'erreur
// 3. Résoudre l'erreur
// 4. Retourner au todo original
// 5. Marquer "completed" quand vraiment terminé

// Exemple:
[
  {
    content: "Créer API route POST /api/messages",
    activeForm: "Création de l'API route",
    status: "in_progress" // Erreur TypeScript rencontrée
  },
  {
    content: "Corriger type MessagePayload manquant",
    activeForm: "Correction du type MessagePayload",
    status: "pending" // Nouveau todo pour l'erreur
  }
]
```

---

## 🚫 Règles Importantes

### Ce Qu'il NE FAUT JAMAIS Faire

1. **Créer des commits automatiquement**
   - Toujours proposer, jamais imposer
   - Laisser l'utilisateur décider du moment

2. **Deviner les valeurs de paramètres**
   - Si un paramètre manque, demander à l'utilisateur
   - Ne jamais utiliser de placeholders

3. **Ignorer les erreurs de build**
   - Si type-check ou lint échoue, corriger avant de continuer
   - Ne JAMAIS marquer un todo "completed" avec des erreurs

4. **Utiliser Bash pour lire/écrire des fichiers**
   - TOUJOURS utiliser Read/Edit/Write tools
   - Bash uniquement pour git, npm, tests, etc.

5. **Modifier plus que demandé**
   - Pas d'over-engineering
   - Pas de refactoring non demandé
   - Pas d'ajout de features "bonus"

6. **Créer de la documentation non demandée**
   - Pas de README.md automatiques
   - Pas de fichiers .md sauf si explicitement demandé

### Ce Qu'il FAUT TOUJOURS Faire

1. **Explorer avant d'implémenter** (sauf niveau 1)
   - Comprendre le contexte existant
   - Suivre les patterns du projet

2. **Utiliser le design system**
   - Tokens de couleur du tailwind.config.ts
   - Spacing scale personnalisé
   - Typography predefined

3. **Valider avec l'utilisateur** si:
   - Plusieurs approches possibles
   - Décision architecturale
   - Breaking change potentiel
   - Ambiguïté dans les exigences

4. **Vérifier la qualité**
   - type-check après modifications TypeScript
   - lint après changements importants
   - build avant de proposer commit (features majeures)

5. **Fournir des liens de code**
   - Format: [filename:line](path#Lline)
   - Facilite la navigation pour l'utilisateur

6. **Suivre les conventions Git**
   - Messages de commit en français
   - Format: "✨ feat: description" ou "🐛 fix: description"
   - Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>

---

## 📝 Templates de Prompts pour Sub-Agents

### Template: Agent Explore (Medium)

```
Explore [fonctionnalité/module] dans le projet NutriSensia.

Je veux comprendre:
1. L'architecture actuelle de [module]
2. Les fichiers clés impliqués
3. Les patterns utilisés (composants, hooks, API, etc.)
4. Les dépendances et imports
5. Les types TypeScript définis

Fournis un résumé structuré avec:
- Liste des fichiers par catégorie (DB, API, Components, Types, etc.)
- Patterns identifiés
- Points d'attention ou incohérences potentielles
- Recommandations pour nouvelle implémentation similaire

Niveau de profondeur: "medium"
```

### Template: Agent Explore (Very Thorough)

```
Explore de manière exhaustive [système/architecture] dans NutriSensia.

Analyse complète:
1. Architecture globale et flux de données
2. Tous les fichiers impliqués (DB, API, UI, middleware, etc.)
3. Schéma de base de données (tables, relations, RLS)
4. Routes API et leurs protections
5. Composants UI et leur hiérarchie
6. State management (Context, Zustand, etc.)
7. Flows utilisateur complets
8. Gestion d'erreurs
9. Sécurité et permissions
10. Points d'amélioration identifiés

Fournis un rapport détaillé type documentation avec:
- Diagrammes textuels des flows
- Exemples de code des parties critiques
- Analyse d'impact pour modifications futures
- Recommandations d'architecture

Niveau de profondeur: "very thorough"
```

### Template: Agent Plan

```
Plan l'implémentation de [feature] pour NutriSensia.

Context:
- [Description de la feature]
- [Contraintes techniques si applicables]
- [Intégration avec systèmes existants]

Le plan doit inclure:
1. **Architecture proposée**
   - Schéma DB (tables, colonnes, relations, RLS)
   - Routes API (endpoints, méthodes, protections)
   - Composants UI (hiérarchie, props, state)
   - State management (où et comment)

2. **Fichiers à créer/modifier**
   - Liste exhaustive avec chemins
   - Raison de chaque modification

3. **Ordre d'implémentation**
   - Phases logiques
   - Dépendances entre étapes

4. **Points de décision**
   - Approches alternatives
   - Trade-offs à considérer
   - Questions pour l'utilisateur

5. **Tests et validation**
   - Comment tester chaque partie
   - Cas limites à considérer

6. **Impact sur l'existant**
   - Breaking changes potentiels
   - Migration requise (si applicable)
```

---

## 🎯 Checklist Avant de Finaliser une Feature

Avant de proposer un commit ou de marquer la feature comme terminée:

```markdown
## Checklist Technique

- [ ] Type-check passe (npm run type-check)
- [ ] Lint passe (npm run lint)
- [ ] Build réussit (npm run build) - si feature majeure
- [ ] Pas d'erreurs console dans le navigateur
- [ ] Pas de warnings TypeScript ignorés

## Checklist Code Quality

- [ ] Respect du design system (couleurs, spacing, typo)
- [ ] Accessibilité (ARIA labels, navigation clavier)
- [ ] Gestion d'erreurs appropriée
- [ ] Messages d'erreur en français
- [ ] Pas de console.log oubliés
- [ ] Pas de code commenté non nécessaire

## Checklist Sécurité

- [ ] RLS policies définies (si DB modifiée)
- [ ] API routes protégées avec withAuth()
- [ ] Pas de données sensibles exposées
- [ ] Validation Zod sur inputs utilisateur
- [ ] Pas de XSS/injection possibles

## Checklist i18n

- [ ] Traductions FR ajoutées (messages/fr.json)
- [ ] Traductions EN ajoutées (messages/en.json)
- [ ] useTranslations() utilisé (pas de hardcoded text)
- [ ] Routes localisées ajoutées (si nouvelle page)

## Checklist Documentation

- [ ] Résumé fourni à l'utilisateur
- [ ] Fichiers modifiés listés avec liens
- [ ] Points d'attention mentionnés
- [ ] Prochaines étapes suggérées (si applicable)
```

---

## 🔄 Gestion des Cas Spéciaux

### Cas 1: L'utilisateur demande quelque chose d'impossible/risqué

```
1. NE PAS implémenter directement
2. Expliquer pourquoi c'est problématique
3. Proposer des alternatives
4. Tool: AskUserQuestion si plusieurs alternatives
5. Attendre confirmation explicite avant de procéder
```

### Cas 2: Erreur bloquante rencontrée pendant l'implémentation

```
1. NE PAS continuer avec les todos suivants
2. Garder le todo actuel "in_progress"
3. Analyser l'erreur
4. Créer nouveau todo pour corriger l'erreur
5. Résoudre l'erreur
6. Retourner au todo original
7. Marquer "completed" seulement quand résolu
```

### Cas 3: L'utilisateur demande un commit pendant l'implémentation

```
1. Vérifier que tous les todos "in_progress" sont "completed"
2. Exécuter type-check + lint
3. Si succès: proposer de créer le commit via Bash
4. Si échec: corriger d'abord, puis proposer commit
5. Utiliser format de commit approprié
```

### Cas 4: Feature nécessite breaking change

```
1. STOP l'implémentation
2. Informer l'utilisateur du breaking change
3. Expliquer l'impact
4. Tool: AskUserQuestion pour confirmer
   - Option 1: Procéder avec breaking change
   - Option 2: Approche alternative sans breaking change
   - Option 3: Annuler
5. Attendre décision explicite
6. Documenter le breaking change si procéder
```

### Cas 5: Découverte de bug pendant l'implémentation

```
1. Informer l'utilisateur du bug découvert
2. Tool: AskUserQuestion:
   - "Voulez-vous que je corrige ce bug maintenant ou que je continue la feature actuelle?"
   - Options claires (Corriger maintenant / Continuer et noter / Créer issue)
3. Suivre la décision de l'utilisateur
```

---

## 📊 Métriques de Succès

Pour chaque session, évaluer:

1. **Efficacité de la context window**
   - Nombre de compactions évitées grâce aux agents
   - Ratio: (tokens agent) / (tokens conversation principale)

2. **Qualité du code**
   - Type-check ✅
   - Lint ✅
   - Build ✅
   - Pas de breaking changes non intentionnels

3. **Satisfaction utilisateur**
   - Clarté de la communication
   - Respect des demandes
   - Pas de sur-engineering

4. **Respect du workflow**
   - Exploration faite avant implémentation (si niveau 2+)
   - Todos créés et gérés correctement
   - Validation utilisateur obtenue quand nécessaire

---

## 🎓 Apprentissage Continu

### Quand adapter le workflow

Le workflow peut être adapté si:
- L'utilisateur demande explicitement une approche différente
- Le contexte de la tâche nécessite une exception
- Une meilleure méthode est identifiée

**MAIS**: Toujours informer l'utilisateur de la déviation et pourquoi.

### Feedback Loop

Après chaque feature majeure, considérer:
- Qu'est-ce qui a bien fonctionné?
- Qu'est-ce qui pourrait être amélioré?
- Y a-t-il de nouveaux patterns à documenter?
- Faut-il mettre à jour ce workflow?

---

## 📚 Références Rapides

### Fichiers Clés du Projet

| Fichier | Quand le consulter |
|---------|-------------------|
| `CLAUDE.md` | Toujours au début d'une session |
| `tailwind.config.ts` | Avant de créer/modifier UI |
| `src/i18n/routing.ts` | Avant d'ajouter routes/pages |
| `src/lib/supabase.ts` | Avant d'utiliser Supabase |
| `src/lib/api-auth.ts` | Avant de créer API route protégée |
| `docs/DATABASE_ARCHITECTURE.md` | Avant de modifier DB |
| `messages/fr.json` & `messages/en.json` | Pour toute modification UI avec texte |

### Commandes NPM Essentielles

```bash
# Développement
npm run dev              # Start dev server
npm run dev:clean        # Clean start

# Qualité
npm run type-check       # Vérifier types
npm run lint             # Linter
npm run lint:fix         # Fix auto
npm run build            # Build production

# Avant commit (vérification complète)
npm run quality          # Tout vérifier
```

### Patterns de Code Récurrents

```typescript
// 1. Utiliser translations
import { useTranslations } from 'next-intl';
const t = useTranslations('namespace');
<p>{t('key')}</p>

// 2. Navigation localisée
import { Link, useRouter } from '@/i18n/navigation';
<Link href="/about">{t('about')}</Link>

// 3. Client Supabase
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// 4. API route protégée
import { withAuth } from '@/lib/api-auth';
export const POST = withAuth({ requireAuth: true })(async (req, auth) => {
  // auth.user disponible
});

// 5. Hook de rôle
import { useUserRole } from '@/hooks/useUserRole';
const { role, isPatient, isAdmin } = useUserRole();
```

---

## ✅ Validation de ce Document

Ce workflow doit être suivi par défaut dans toutes les interactions futures sur le projet NutriSensia, sauf instruction contraire explicite de l'utilisateur.

**Version**: 1.0
**Dernière mise à jour**: 2026-01-29
**Créé par**: Adrien Cornille & Claude Sonnet 4.5

---

## 🔄 Changelog

- **v1.0** (2026-01-29): Version initiale du workflow
  - Définition des 4 niveaux de complexité
  - Workflows détaillés pour chaque niveau
  - Patterns spécifiques NutriSensia
  - Règles de gestion des todos
  - Templates de prompts pour agents
  - Checklist de finalisation
