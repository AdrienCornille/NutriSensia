---
name: add-hook
description: Creer un hook React Query (useQuery/useMutation) selon les patterns NutriSensia
disable-model-invocation: true
argument-hint: "[hook-name] [api-route]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
context: fork
agent: general-purpose
---

# Add React Query Hook

Cree le hook `$0` qui consomme l'API `$1`.

## Pattern obligatoire

Lis d'abord un exemple existant pour confirmer le pattern :
- Hooks nutritionniste : `src/hooks/useNutritionistConsultations.ts`
- Hooks patient : `src/hooks/usePatientMealPlan.ts`
- Hooks meal plans : `src/hooks/useNutritionistMealPlans.ts`

### Structure type

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface MonType {
  id: string;
  // ...
}

// Query keys
const keys = {
  all: (parentId: string) => ['mon-domaine', parentId] as const,
  detail: (parentId: string, id: string) => ['mon-domaine', parentId, id] as const,
};

// Fetch helpers (toujours credentials: 'include')
async function fetchItems(parentId: string): Promise<MonType[]> {
  const res = await fetch(`/api/protected/path/${parentId}/items`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur chargement');
  const json = await res.json();
  return json.data;
}

// Hooks
export function useItems(parentId: string) {
  return useQuery({
    queryKey: keys.all(parentId),
    queryFn: () => fetchItems(parentId),
    enabled: !!parentId,
  });
}

export function useCreateItem(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateItemData) => {
      const res = await fetch(`/api/protected/path/${parentId}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur creation');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(parentId) });
    },
  });
}
```

## Conventions

- Fichier dans `src/hooks/`
- Nommage : `use<Domaine><Action>.ts` (ex: `useNutritionistMealPlans.ts`)
- Toujours `credentials: 'include'` dans les fetch
- Exporter les types d'interface depuis le hook
- Query keys hierachiques pour l'invalidation

## Etapes

1. Lire la route API cible pour comprendre les types de requete/reponse
2. Creer le fichier hook avec types, keys, fetch helpers, et hooks exportes
3. Valider avec `npx tsc --noEmit`

## Apres creation

Indique :
- Le fichier cree
- Les hooks exportes (nom + usage)
- Les query keys pour l'invalidation
