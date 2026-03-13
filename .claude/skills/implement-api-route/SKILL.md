---
name: implement-api-route
description: Creer une route API protegee selon les patterns NutriSensia (verifyAuth, apiResponse, Zod, Supabase)
disable-model-invocation: true
argument-hint: "[route-path] [methods GET/POST/PATCH/DELETE]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
context: fork
agent: general-purpose
---

# Implement API Route

Cree une route API a `$0` avec les methodes `$1`.

## Pattern obligatoire

Toutes les routes protegees suivent cette structure. Lis d'abord un exemple existant pour confirmer :
- Exemple GET+POST : `src/app/api/protected/nutritionist/appointments/route.ts`
- Exemple GET+PATCH+DELETE : `src/app/api/protected/nutritionist/patients/[id]/dossier/consultations/[consultationId]/route.ts`

### Structure d'une route

```typescript
import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { apiResponse } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { monSchema } from '@/lib/api-schemas';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth();
    if (auth.error) return auth.error;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('patient_id', auth.user.id);

    if (error) return apiResponse.error(error.message, 500);
    return apiResponse.ok(data);
  } catch (error) {
    return apiResponse.error('Erreur interne', 500);
  }
}
```

## Etapes

1. **Schema Zod** : Ajouter le schema de validation dans `src/lib/api-schemas.ts`
2. **Route** : Creer le fichier `src/app/api/$0/route.ts`
3. **Conventions** :
   - Routes nutritionniste : verifier `auth.user.role === 'nutritionist'`
   - URL param `[id]` = `patient_profiles.id`, mapper vers `user_id` pour les requetes DB
   - Tables utilisent `patient_id` (sauf `meals` et `hydration_logs` qui utilisent `user_id`)
4. **Valider** : Executer `npx tsc --noEmit` pour verifier le typage

## Apres creation

Indique clairement :
- Le chemin du fichier cree
- Le schema Zod ajoute
- Les methodes HTTP implementees
- Le hook React Query a creer (nom suggere + fichier)
