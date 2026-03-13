---
name: add-component
description: Creer un composant React nutritionniste ou patient selon les patterns NutriSensia (Tailwind, Framer Motion, hooks)
disable-model-invocation: true
argument-hint: "[domain: nutritionist|patient] [component-name] [description]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
context: fork
agent: general-purpose
---

# Add Component

Cree un composant pour le domaine `$0`, nomme `$1`, pour : $2.

## Ou placer le fichier

- **nutritionist** : `src/components/nutritionist/<sous-domaine>/$1.tsx`
  - sous-domaines : `dossier/`, `meal-plans/`, `patients/`, `dashboard/`
- **patient** : `src/components/<domaine>/$1.tsx`
  - domaines : `meal-plan/`, `dossier/`, `agenda/`

## Pattern obligatoire

Lis d'abord 1-2 composants existants dans le meme domaine pour reproduire le style.

### Structure type

```typescript
'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

// Types
interface MonComponentProps {
  // ...
}

// Sub-components (si complexe, les definir avant le composant principal)
function SubComponent({ ... }: { ... }) {
  return (...);
}

// Main component
export function MonComponent({ ... }: MonComponentProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div className='p-6 border-b border-gray-100'>
        <h3 className='font-semibold text-gray-800'>Titre</h3>
        <p className='text-sm text-gray-500 mt-1'>Description</p>
      </div>
      {/* Content */}
      <div className='p-4'>
        ...
      </div>
      {/* Empty state */}
      <div className='p-6 text-center'>
        <p className='text-sm text-gray-500'>Aucune donnee.</p>
      </div>
    </div>
  );
}
```

## Conventions de design

- **Carte** : `bg-white rounded-xl border border-gray-200`
- **Header de carte** : `p-6 border-b border-gray-100` + `font-semibold text-gray-800`
- **Couleur primaire** : `#1B998B` (boutons, accents, icones actives)
- **Badges status** : `px-2 py-0.5 text-xs font-medium rounded-full`
- **Bouton primaire** : `bg-[#1B998B] text-white rounded-lg hover:bg-[#178a7d]`
- **Bouton secondaire** : `bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200`
- **Icones** : Lucide React, taille `w-4 h-4` ou `w-5 h-5`
- **Animations** : Framer Motion `AnimatePresence` pour expand/collapse
- **Grilles macros** : `grid-cols-5 gap-2`, couleurs par macro (orange/blue/amber/rose/green)
- **Grilles micros** : `grid-cols-5 gap-2`, text colore par status (vert/ambre/rouge)

## Navigation par vues

Si le composant gere plusieurs vues (liste -> detail -> creation), utiliser le hook `useViewHistory` :

```typescript
import { useViewHistory } from '@/hooks/useViewHistory';

const { goBack } = useViewHistory({
  onBack: () => setView('list'),
  onForward: () => { /* restore child view */ },
});
```

## Etapes

1. Explorer les composants existants du meme domaine
2. Creer le composant avec les props typees
3. Exporter depuis l'index si existant (`src/components/<domaine>/index.ts`)
4. Valider avec `npx tsc --noEmit`

## Apres creation

Indique :
- Le fichier cree
- Les props du composant
- Les hooks utilises
- Comment l'integrer dans la page parente
