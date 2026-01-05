# Guide des Schémas Zod pour la Validation des Profils Utilisateurs

## Vue d'ensemble

Ce document décrit les schémas de validation Zod implémentés pour la gestion des profils utilisateurs dans NutriSensia. Ces schémas assurent la validation des données côté client et serveur avec des messages d'erreur en français.

## Schémas de Base

### Schémas Utilitaires

#### `swissPostalCodeSchema`

Validation des codes postaux suisses (format: 1000-9999)

```typescript
const postalCode = swissPostalCodeSchema.parse('1200'); // ✅
const invalidCode = swissPostalCodeSchema.parse('0000'); // ❌
```

#### `swissPhoneSchema`

Validation et transformation des numéros de téléphone suisses

```typescript
const phone = swissPhoneSchema.parse('0791234567'); // ✅ Transformé en "+41791234567"
const internationalPhone = swissPhoneSchema.parse('+41791234567'); // ✅
```

#### `ascaNumberSchema`

Validation des numéros ASCA (Association Suisse des Conseillers en Alimentation)

```typescript
const ascaNumber = ascaNumberSchema.parse('AB123456'); // ✅
const invalidAsca = ascaNumberSchema.parse('123456'); // ❌
```

#### `rmeNumberSchema`

Validation des numéros RME (Registre Médecins Empiriques)

```typescript
const rmeNumber = rmeNumberSchema.parse('RME123456'); // ✅
const invalidRme = rmeNumberSchema.parse('123456'); // ❌
```

#### `eanCodeSchema`

Validation des codes EAN (European Article Number)

```typescript
const eanCode = eanCodeSchema.parse('1234567890123'); // ✅ (13 chiffres)
const invalidEan = eanCodeSchema.parse('123456'); // ❌
```

## Schémas pour les Structures JSON

### `consultationRatesSchema`

Validation des tarifs de consultation (en centimes CHF)

```typescript
const rates = {
  initial: 15000, // CHF 150.00
  follow_up: 10000, // CHF 100.00
  express: 5000, // CHF 50.00
};
```

**Règles de validation :**

- Tarif initial : 50-500 CHF
- Tarif de suivi : 30-300 CHF
- Tarif express : 15-150 CHF
- Tarif initial ≥ Tarif de suivi ≥ Tarif express

### `practiceAddressSchema`

Validation des adresses de cabinet

```typescript
const address = {
  street: 'Rue de la Paix 123',
  postal_code: '1200',
  city: 'Genève',
  canton: 'GE',
  country: 'CH',
};
```

**Cantons valides :** AG, AI, AR, BE, BL, BS, FR, GE, GL, GR, JU, LU, NE, NW, OW, SG, SH, SO, SZ, TG, TI, UR, VD, VS, ZG, ZH

### `emergencyContactSchema`

Validation des contacts d'urgence

```typescript
const contact = {
  name: 'Marie Dupont',
  phone: '+41791234568',
  relationship: 'Épouse',
};
```

### `packageCreditsSchema`

Validation des crédits de package

```typescript
const credits = {
  consultations_remaining: 5,
  meal_plans_remaining: 3,
  support_priority: 'priority', // "standard" | "priority" | "premium"
};
```

## Schémas de Profil

### `commonProfileSchema`

Champs communs à tous les utilisateurs

```typescript
const commonProfile = {
  first_name: 'Jean',
  last_name: 'Dupont',
  phone: '+41791234567',
  avatar_url: 'https://example.com/avatar.jpg',
  locale: 'fr-CH',
  timezone: 'Europe/Zurich',
};
```

**Règles de validation :**

- Prénom/Nom : 2-50 caractères, lettres, espaces, tirets, apostrophes
- Téléphone : Format suisse valide
- Avatar : URL valide
- Locale : fr-CH, de-CH, it-CH, en-CH
- Timezone : Format Europe/...

### `nutritionistProfileSchema`

Champs spécifiques aux nutritionnistes

```typescript
const nutritionistProfile = {
  asca_number: 'AB123456',
  specializations: ['Nutrition sportive', 'Diabète'],
  bio: "Nutritionniste diplômée avec plus de 10 ans d'expérience...",
  consultation_rates: {
    /* voir consultationRatesSchema */
  },
  practice_address: {
    /* voir practiceAddressSchema */
  },
  verified: true,
  is_active: true,
  max_patients: 100,
};
```

**Règles de validation :**

- Au moins un numéro d'identification professionnelle (ASCA, RME, ou EAN)
- Spécialisations : 1-10 éléments, 3-50 caractères chacun
- Bio : 50-1000 caractères
- Max patients : 1-500

### `patientProfileSchema`

Champs spécifiques aux patients

```typescript
const patientProfile = {
  date_of_birth: '1990-05-15',
  gender: 'female',
  emergency_contact: {
    /* voir emergencyContactSchema */
  },
  height: 165,
  initial_weight: 70,
  target_weight: 65,
  activity_level: 'moderate',
  allergies: ['Gluten', 'Lactose'],
  dietary_restrictions: ['Végétarien'],
  medical_conditions: ['Hypertension'],
  medications: ['Médicament A'],
  subscription_tier: 2,
  subscription_status: 'active',
  package_credits: {
    /* voir packageCreditsSchema */
  },
};
```

**Règles de validation :**

- Date de naissance : Format YYYY-MM-DD, âge 13-120 ans
- Genre : male, female, other, prefer_not_to_say
- Taille : 100-250 cm
- Poids : 30-300 kg
- Si poids cible défini, poids initial requis et différent
- Niveau d'activité : sedentary, light, moderate, active, very_active
- Allergies : Max 20 éléments
- Restrictions alimentaires : Max 15 éléments
- Conditions médicales : Max 10 éléments
- Médicaments : Max 15 éléments

## Schémas Complets

### `completeNutritionistProfileSchema`

Combinaison de `commonProfileSchema` et `nutritionistProfileSchema`

### `completePatientProfileSchema`

Combinaison de `commonProfileSchema` et `patientProfileSchema`

### `profileUpdateSchema`

Schéma pour les mises à jour partielles (tous les champs optionnels)

## Utilisation

### Validation de Données

```typescript
import { completeNutritionistProfileSchema } from '@/lib/schemas';

// Validation avec gestion d'erreur
const result = completeNutritionistProfileSchema.safeParse(data);
if (result.success) {
  // Données valides
  const validatedData = result.data;
} else {
  // Erreurs de validation
  console.log(result.error.issues);
}

// Validation avec exception
try {
  const validatedData = completeNutritionistProfileSchema.parse(data);
} catch (error) {
  console.log(error.issues);
}
```

### Types TypeScript

```typescript
import type { NutritionistProfile, PatientProfile } from '@/lib/schemas';

// Types dérivés automatiquement des schémas
const nutritionist: NutritionistProfile = {
  // TypeScript fournit l'autocomplétion et la vérification de type
};
```

### Messages d'Erreur en Français

Tous les schémas incluent des messages d'erreur en français pour une meilleure expérience utilisateur :

```typescript
// Exemple d'erreur
{
  code: "too_small",
  minimum: 2,
  type: "string",
  inclusive: true,
  message: "Le prénom doit contenir au moins 2 caractères",
  path: ["first_name"]
}
```

## Tests

Les schémas sont entièrement testés avec Vitest. Exécutez les tests avec :

```bash
npx vitest run --config vitest.schemas.config.ts
```

Les tests couvrent :

- Validation de données valides
- Rejet de données invalides
- Messages d'erreur appropriés
- Transformations automatiques
- Règles métier complexes

## Intégration avec React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { completeNutritionistProfileSchema } from '@/lib/schemas';

const form = useForm({
  resolver: zodResolver(completeNutritionistProfileSchema),
  defaultValues: {
    first_name: '',
    last_name: '',
    // ...
  },
});
```

## Conformité GDPR

Les schémas respectent les exigences GDPR :

- Validation des données personnelles
- Contrôle des champs obligatoires vs optionnels
- Support pour la portabilité des données
- Validation des formats de données sensibles

## Maintenance

### Ajout de Nouveaux Champs

1. Ajouter le champ au schéma approprié
2. Définir les règles de validation
3. Ajouter les tests correspondants
4. Mettre à jour la documentation

### Modification des Règles

1. Modifier le schéma
2. Mettre à jour les tests
3. Vérifier la compatibilité avec les données existantes
4. Mettre à jour la documentation

## Support

Pour toute question sur les schémas Zod ou la validation des données, consultez :

- [Documentation Zod officielle](https://zod.dev/)
- [Tests dans `src/lib/schemas.test.ts`](../src/lib/schemas.test.ts)
- [Types dans `src/lib/schemas.ts`](../src/lib/schemas.ts)
