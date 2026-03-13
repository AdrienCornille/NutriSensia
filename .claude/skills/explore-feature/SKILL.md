---
name: explore-feature
description: Explorer en profondeur un domaine ou une feature du codebase NutriSensia (routes, hooks, composants, types, DB)
argument-hint: "[domain or feature to explore]"
allowed-tools: Read, Glob, Grep, Bash
context: fork
agent: Explore
---

# Explore Feature

Explore en profondeur le domaine/feature : **$ARGUMENTS**

## Methode d'exploration

### 1. Identifier les fichiers concernes

Cherche dans ces emplacements selon le domaine :

- **API routes** : `src/app/api/protected/` (nutritionniste ou patient)
- **Composants** : `src/components/nutritionist/` ou `src/components/`
- **Hooks** : `src/hooks/use*.ts`
- **Types** : `src/types/`
- **Schemas Zod** : `src/lib/api-schemas.ts`
- **DB migrations** : `database/migrations/`
- **DB functions** : `database/`

### 2. Cartographier l'architecture

Pour chaque domaine, documente :
- Les **routes API** (methodes HTTP, params, body)
- Les **hooks React Query** (queries + mutations, query keys)
- Les **composants** (arbre, props, state local)
- Les **types TypeScript** (interfaces principales)
- Les **tables DB** utilisees et leurs relations

### 3. Identifier les patterns

- Comment l'auth est geree (verifyAuth, role check)
- Comment les donnees circulent (API -> hook -> composant)
- Les patterns de layout (grid, sidebar, cards)
- Les patterns d'interaction (modals, expand/collapse, drag-drop)

## Format de sortie

Structure ta reponse ainsi :

```
## [Nom du domaine]

### Routes API
- `GET /api/protected/...` : description
- `POST /api/protected/...` : description

### Hooks
- `useXxx(params)` dans `src/hooks/useXxx.ts` : description

### Composants
- `ComponentName` dans `src/components/.../` : description
  - Props : { ... }
  - Sous-composants : ...

### Types cles
- `InterfaceName` dans `src/types/...`

### Tables DB
- `table_name` : colonnes principales, relations

### Points d'attention
- Patterns specifiques a ce domaine
- Inconsistances ou dette technique
- Dependances avec d'autres domaines
```
