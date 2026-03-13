---
name: implement-epic
description: Planifier et implementer une epic complete NutriSensia (analyse user stories, plan, API, hooks, composants)
disable-model-invocation: true
argument-hint: "[epic-number] [epic-name]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
context: fork
agent: general-purpose
---

# Implement Epic

Planifie et implemente l'**Epic $0 : $1**.

## Workflow

### Phase 1 : Analyse (ne pas coder encore)

1. **Lire les user stories** dans `User_Story_NutriSensia/USER_STORIES_NUTRITIONIST.md`
   - Identifier toutes les stories de cette epic
   - Lister les criteres d'acceptation

2. **Explorer le codebase existant** pour comprendre les patterns :
   - Lire `CLAUDE.md` pour les conventions
   - Explorer les epics deja implementees comme reference :
     - Epic 3 (Dossier) : `src/components/nutritionist/dossier/`
     - Epic 4 (Consultations) : `src/components/nutritionist/dossier/consultations/`
     - Epic 5 (Plans alimentaires) : `src/components/nutritionist/meal-plans/`

3. **Identifier les tables DB** necessaires dans `database/`

4. **Produire un plan d'implementation** structure :
   - Liste ordonnee des stories a implementer
   - Pour chaque story : fichiers a creer/modifier, dependances

### Phase 2 : Implementation (story par story)

Pour chaque story, suivre cet ordre :

1. **Schema Zod** dans `src/lib/api-schemas.ts`
2. **Types TypeScript** dans `src/types/` (si nouveau domaine)
3. **Routes API** dans `src/app/api/protected/nutritionist/`
   - Pattern : `verifyAuth()` + `apiResponse.*` + `createClient()`
   - Verifier le role nutritionniste
   - Mapper `[id]` param -> `patient_profiles.id` -> `user_id` pour les requetes
4. **Hook React Query** dans `src/hooks/`
   - `credentials: 'include'` dans tous les fetch
   - Query keys hierarchiques
5. **Composants** dans `src/components/nutritionist/`
   - Design system : cartes blanches, couleur primaire `#1B998B`
   - Navigation par vues avec `useViewHistory`
6. **Integration** dans la page ou le tab parent
7. **Type-check** : `npx tsc --noEmit`

### Phase 3 : Verification

- [ ] Toutes les stories sont implementees
- [ ] Type-check passe sans erreur
- [ ] Les patterns sont coherents avec les epics existantes
- [ ] Les hooks invalident correctement les queries
- [ ] Les composants ont des etats vides et de chargement

## Conventions DB

- Tables : `patient_id` (pas `user_id`, sauf `meals` et `hydration_logs`)
- URL param `[id]` = `patient_profiles.id`
- DB queries utilisent `profiles.id` = `patient_profiles.user_id`

## Format de sortie

A la fin, produis un resume :
- Stories implementees (avec references aux fichiers)
- Routes API creees
- Hooks crees
- Composants crees
- Migrations DB necessaires
- Points d'attention ou decisions prises
