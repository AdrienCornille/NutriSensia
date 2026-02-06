# Plan : Routage par Rôle et Inscription Nutritionniste

> **Statut** : En cours d'implémentation
> **Date** : Janvier 2026
> **Auteur** : Claude Code
> **Prérequis** : Migration `16_schema_harmonization.sql` exécutée

---

## 📋 Suivi de progression

### Phase 0 : Préparation (User Stories)

- [x] Ajouter les User Stories AUTH-008 à AUTH-013 dans `USER_STORIES.md`

### Phase 1 : Infrastructure (priorité haute)

- [x] 1.1 Créer migration BDD (`database/17_nutritionist_registration.sql`)
- [x] 1.2 Documenter configuration bucket Supabase Storage (`docs/supabase-storage-nutritionist-documents.md`)
- [x] 1.2b **ACTION MANUELLE** : Créer le bucket `nutritionist-documents` dans Supabase Dashboard ✅
- [x] 1.2c **ACTION MANUELLE** : Exécuter la migration `17_nutritionist_registration.sql` dans Supabase ✅
- [x] 1.3 Créer hook `useUserRole` (`src/hooks/useUserRole.ts`)
- [x] 1.4 Modifier store Zustand (`src/lib/store.ts`)
- [x] 1.5 Modifier middleware routage (`src/middleware.ts`)

### Phase 2 : Réorganisation dashboard patient

- [x] 2.1 Créer structure `/dashboard/patient/`
- [x] 2.2 Déplacer pages existantes
- [x] 2.3 Renommer `DashboardSidebar` → `PatientSidebar`
- [x] 2.4 Mettre à jour imports et liens
- [x] 2.5 Créer page de redirection `/dashboard`
- [x] 2.6 Tester que tout fonctionne ✅

### Phase 3 : Inscription nutritionniste

- [x] 3.1 Créer `DocumentUploader` (`src/components/ui/DocumentUploader.tsx`) ✅
- [x] 3.2 Créer les 5 étapes du formulaire (`src/components/forms/nutritionist/`) ✅
- [x] 3.3 Créer `NutritionistRegistrationForm` ✅
- [x] 3.4 Créer hook `useNutritionistRegistration` ✅
- [x] 3.5 Créer page inscription (`/inscription/nutritionniste`) ✅
- [x] 3.6 Créer page en-attente ✅
- [x] 3.7 Créer page rejetée ✅
- [x] 3.8 Créer page validée ✅

### Phase 4 : Panel admin

- [x] 4.1 Créer `AdminNutritionistList` (`src/components/admin/AdminNutritionistList.tsx`) ✅
- [x] 4.2 Créer `AdminNutritionistDetail` (`src/components/admin/AdminNutritionistDetail.tsx`) ✅
- [x] 4.3 Créer `AdminValidationModal` (`src/components/admin/AdminValidationModal.tsx`) ✅
- [x] 4.4 Créer page liste admin (`/admin/nutritionists`) ✅
- [x] 4.5 Créer page détail admin (intégré dans la page liste) ✅
- [x] 4.6 Implémenter actions valider/rejeter (`/api/admin/nutritionists/[id]/validate`) ✅
- [ ] 4.7 Notifications email (optionnel - à implémenter ultérieurement)

### Phase 5 : Dashboard nutritionniste

- [ ] 5.1 Créer `NutritionistSidebar`
- [ ] 5.2 Créer layout nutritionniste
- [ ] 5.3 Créer page d'accueil
- [ ] 5.4 Créer page liste patients
- [ ] 5.5 Créer vue dossier patient
- [ ] 5.6 Créer agenda nutritionniste
- [ ] 5.7 Créer messagerie globale

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Décisions d'architecture](#décisions-darchitecture)
3. [User Stories à ajouter](#user-stories-à-ajouter)
4. [Structure des dossiers](#structure-des-dossiers)
5. [Middleware de routage](#middleware-de-routage)
6. [Pages d'inscription nutritionniste](#pages-dinscription-nutritionniste)
7. [Panel Admin - Validation](#panel-admin---validation)
8. [Modifications base de données](#modifications-base-de-données)
9. [Hooks et Store](#hooks-et-store)
10. [Composants à créer/modifier](#composants-à-créermodifier)
11. [Ordre d'implémentation](#ordre-dimplémentation)
12. [Estimation de complexité](#estimation-de-complexité)

---

## Vue d'ensemble

### Objectifs

L'objectif est de :

1. **Séparer les dashboards** patient et nutritionniste avec des routes distinctes
2. **Ajouter un formulaire d'inscription nutritionniste** avec validation admin
3. **Implémenter une redirection automatique** basée sur le rôle après connexion

### Contexte

L'application NutriSensia doit gérer deux types d'utilisateurs principaux :

- **Patients** : Suivent leur nutrition, consultent leur plan alimentaire, prennent rendez-vous
- **Nutritionnistes** : Gèrent leurs patients, créent des plans alimentaires, suivent les progrès

La base de données a été harmonisée avec la migration `16_schema_harmonization.sql` qui renomme `user_id` → `patient_id` dans les tables spécifiques aux patients.

---

## Décisions d'architecture

### Options considérées

| Option | Description | Avantages | Inconvénients |
|--------|-------------|-----------|---------------|
| **A** | Routes séparées `/dashboard/patient/*` et `/dashboard/nutritionist/*` | Claire, maintenable, SEO-friendly | Duplication potentielle de code |
| B | Route unique `/dashboard/*` avec layout dynamique | Moins de routes | Complexité middleware, moins intuitif |
| C | Sous-domaines `patient.nutrisensia.ch` / `pro.nutrisensia.ch` | Séparation totale | Infrastructure complexe |

### Option retenue : A (Routes séparées)

**Raisons :**
- Architecture claire et maintenable
- Facilite les permissions et le débogage
- Permet des layouts spécifiques par rôle
- Standard de l'industrie pour les applications multi-rôles

### Règles métier décidées

| Question | Décision |
|----------|----------|
| Comment s'inscrit un nutritionniste ? | Via formulaire dédié `/inscription/nutritionniste` |
| Validation requise ? | Oui, par un administrateur |
| Un patient peut devenir nutritionniste ? | Oui, changement de rôle possible |
| Multi-rôle autorisé ? | Non, un utilisateur = un rôle à la fois |

---

## User Stories à ajouter

### Epic AUTH (extension)

| ID | User Story | Priorité | Description |
|----|------------|----------|-------------|
| AUTH-008 | Inscription nutritionniste - Formulaire | Must Have | En tant que nutritionniste, je veux m'inscrire via un formulaire dédié pour créer mon compte professionnel |
| AUTH-009 | Inscription nutritionniste - Documents | Must Have | En tant que nutritionniste, je veux uploader mes certifications (ASCA/RME) lors de l'inscription |
| AUTH-010 | Inscription nutritionniste - Validation admin | Must Have | En tant qu'admin, je veux valider/rejeter les demandes d'inscription nutritionniste |
| AUTH-011 | Notification validation | Should Have | En tant que nutritionniste, je veux être notifié par email quand ma demande est validée/rejetée |
| AUTH-012 | Redirection par rôle | Must Have | En tant qu'utilisateur connecté, je veux être redirigé vers mon dashboard approprié (patient/nutritionniste) |
| AUTH-013 | Changement de rôle | Could Have | En tant que patient, je veux pouvoir demander à devenir nutritionniste |

### Critères d'acceptation détaillés

#### AUTH-008 : Formulaire inscription nutritionniste

```gherkin
Feature: Inscription nutritionniste

Scenario: Accès au formulaire
  Given je suis un visiteur non connecté
  When je navigue vers /inscription/nutritionniste
  Then je vois le formulaire d'inscription nutritionniste

Scenario: Soumission réussie
  Given je remplis tous les champs obligatoires
  And je coche les conditions d'utilisation
  When je clique sur "Créer mon compte"
  Then mon compte est créé avec status "pending"
  And je suis redirigé vers la page d'attente de validation
  And je reçois un email de confirmation
```

#### AUTH-010 : Validation admin

```gherkin
Feature: Validation inscription nutritionniste

Scenario: Liste des demandes en attente
  Given je suis connecté en tant qu'admin
  When je navigue vers /admin/nutritionnistes
  Then je vois la liste des demandes avec status "pending"

Scenario: Validation d'une demande
  Given je consulte une demande d'inscription
  And les documents sont valides
  When je clique sur "Valider"
  Then le status passe à "active"
  And le nutritionniste reçoit un email de confirmation
  And il peut accéder à /dashboard/nutritionist
```

---

## Structure des dossiers

### Arborescence actuelle (à modifier)

```
src/app/[locale]/dashboard/
├── page.tsx                    # Vue d'ensemble patient
├── plan-alimentaire/
├── suivi/
├── agenda/
├── dossier/
├── messagerie/
├── aliments/
└── recettes/
```

### Nouvelle arborescence (cible)

```
src/app/[locale]/dashboard/
├── page.tsx                    # Redirection intelligente → /patient ou /nutritionist
├── layout.tsx                  # Layout commun (minimal)
│
├── patient/                    # Dashboard Patient
│   ├── layout.tsx              # Layout patient (PatientSidebar)
│   ├── page.tsx                # Accueil patient (Vue d'ensemble)
│   ├── plan-alimentaire/       # (déplacé depuis dashboard/)
│   ├── suivi/                  # (déplacé depuis dashboard/)
│   ├── agenda/                 # (déplacé depuis dashboard/)
│   ├── dossier/                # (déplacé depuis dashboard/)
│   ├── messagerie/             # (déplacé depuis dashboard/)
│   ├── aliments/               # (déplacé depuis dashboard/)
│   └── recettes/               # (déplacé depuis dashboard/)
│
└── nutritionist/               # Dashboard Nutritionniste
    ├── layout.tsx              # Layout nutritionniste (NutritionistSidebar)
    ├── page.tsx                # Accueil nutritionniste (Vue d'ensemble)
    ├── patients/               # Liste et gestion des patients
    │   ├── page.tsx            # Liste des patients
    │   └── [patientId]/        # Dossier patient individuel
    │       ├── page.tsx        # Vue d'ensemble patient
    │       ├── plan/           # Plan alimentaire du patient
    │       ├── suivi/          # Suivi biométrique du patient
    │       └── messages/       # Conversation avec ce patient
    ├── agenda/                 # Agenda nutritionniste (vue globale)
    ├── messagerie/             # Toutes les conversations
    └── parametres/             # Paramètres du compte pro
```

### Pages d'inscription nutritionniste

```
src/app/[locale]/inscription/
├── page.tsx                        # (existant) - Inscription patient
└── nutritionniste/
    ├── page.tsx                    # Formulaire inscription nutritionniste
    ├── en-attente/
    │   └── page.tsx                # Page "Votre demande est en cours de validation"
    ├── rejete/
    │   └── page.tsx                # Page "Votre demande a été rejetée" + recours
    └── valide/
        └── page.tsx                # Page "Bienvenue !" + redirection dashboard
```

### Pages admin

```
src/app/[locale]/admin/
└── nutritionnistes/
    ├── page.tsx                    # Liste des demandes (pending/validated/rejected)
    └── [nutritionistId]/
        └── page.tsx                # Détail demande + actions (valider/rejeter)
```

---

## Middleware de routage

### Fichier : `src/middleware.ts`

Le middleware existant doit être modifié pour gérer le routage par rôle.

### Logique à implémenter

```typescript
// Pseudo-code du middleware

async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Routes publiques - pas de vérification
  if (isPublicRoute(pathname)) {
    return next();
  }

  // 2. Vérifier l'authentification
  const session = await getSession(request);
  if (!session) {
    return redirect('/connexion');
  }

  // 3. Récupérer le rôle utilisateur
  const { role, nutritionistStatus } = await getUserRole(session.user.id);

  // 4. Gestion des nutritionnistes en attente
  if (role === 'nutritionist' && nutritionistStatus === 'pending') {
    if (!pathname.includes('/inscription/nutritionniste/en-attente')) {
      return redirect('/inscription/nutritionniste/en-attente');
    }
    return next();
  }

  if (role === 'nutritionist' && nutritionistStatus === 'rejected') {
    if (!pathname.includes('/inscription/nutritionniste/rejete')) {
      return redirect('/inscription/nutritionniste/rejete');
    }
    return next();
  }

  // 5. Redirection /dashboard → dashboard approprié
  if (pathname === '/dashboard' || pathname === '/fr/dashboard') {
    if (role === 'patient') {
      return redirect('/dashboard/patient');
    } else if (role === 'nutritionist') {
      return redirect('/dashboard/nutritionist');
    } else if (role === 'admin') {
      return redirect('/admin');
    }
  }

  // 6. Protection des routes par rôle
  if (pathname.includes('/dashboard/patient') && role !== 'patient') {
    return redirect('/403'); // ou redirection vers bon dashboard
  }

  if (pathname.includes('/dashboard/nutritionist') && role !== 'nutritionist') {
    return redirect('/403');
  }

  if (pathname.includes('/admin') && role !== 'admin') {
    return redirect('/403');
  }

  return next();
}
```

### Cas particuliers à gérer

| Situation | Comportement |
|-----------|--------------|
| Nutritionniste `status = 'pending'` | Redirection vers `/inscription/nutritionniste/en-attente` |
| Nutritionniste `status = 'rejected'` | Redirection vers `/inscription/nutritionniste/rejete` |
| Nutritionniste `status = 'suspended'` | Redirection vers page de suspension |
| Patient accède à `/dashboard/nutritionist/*` | Erreur 403 ou redirection |
| Nutritionniste accède à `/dashboard/patient/*` | Erreur 403 ou redirection |
| Admin | Accès à `/admin/*` uniquement |

---

## Pages d'inscription nutritionniste

### Étape 1 : Informations personnelles

**Champs :**
- Prénom (obligatoire)
- Nom (obligatoire)
- Email (obligatoire, unique)
- Téléphone (obligatoire, format suisse)
- Mot de passe (obligatoire, min 8 caractères)

### Étape 2 : Informations professionnelles

**Champs :**
- Numéro ASCA (optionnel si RME fourni)
- Numéro RME (optionnel si ASCA fourni)
- Spécialisations (liste multi-sélection) :
  - Nutrition sportive
  - Nutrition pédiatrique
  - Troubles alimentaires
  - Diabète et maladies métaboliques
  - Nutrition végétarienne/vegan
  - Allergies et intolérances
  - Gestion du poids
  - Nutrition gériatrique
- Années d'expérience (select)
- Adresse du cabinet (optionnel)
- Langues parlées (multi-sélection)

### Étape 3 : Documents

**Uploads requis :**
- Certificat ASCA ou RME (PDF/image, max 5MB)
- Diplôme (optionnel, PDF/image, max 5MB)
- Photo professionnelle (image, max 2MB)

### Étape 4 : Conditions

**Checkboxes :**
- [ ] J'accepte les conditions générales d'utilisation
- [ ] J'accepte les conditions générales de vente pour nutritionnistes
- [ ] Je certifie que les informations fournies sont exactes

### Étape 5 : Récapitulatif et soumission

**Affichage :**
- Résumé de toutes les informations
- Bouton "Modifier" pour chaque section
- Bouton "Soumettre ma demande"

---

## Panel Admin - Validation

### Liste des demandes (`/admin/nutritionnistes`)

**Colonnes du tableau :**
- Photo
- Nom complet
- Email
- Date de demande
- Certifications (ASCA/RME)
- Statut (badge coloré)
- Actions

**Filtres :**
- Par statut : Tous, En attente, Validés, Rejetés
- Recherche par nom/email

### Détail d'une demande (`/admin/nutritionnistes/[id]`)

**Sections :**
1. **Informations personnelles**
2. **Informations professionnelles**
3. **Documents** (avec aperçu/téléchargement)
4. **Historique** (si demande précédente rejetée)

**Actions :**
- **Valider** → Modal de confirmation → `status = 'active'`
- **Rejeter** → Modal avec motif obligatoire → `status = 'rejected'`
- **Demander plus d'infos** → Modal avec message → `status = 'info_required'`

### Workflow de validation

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   pending   │────▶│   Reviewed   │────▶│   active   │
└─────────────┘     │   by Admin   │     └────────────┘
                    └──────────────┘
                           │
                           ▼
                    ┌────────────────┐
                    │    rejected    │
                    └────────────────┘
                           │
                           ▼
                    ┌────────────────┐
                    │  info_required │──▶ (retour à pending après réponse)
                    └────────────────┘
```

---

## Modifications base de données

### Script SQL : `17_nutritionist_registration.sql`

```sql
-- ============================================================================
-- NUTRITIONIST REGISTRATION ENHANCEMENTS
-- ============================================================================

-- 1. Ajouter les colonnes de validation à nutritionist_profiles (si pas présentes)
ALTER TABLE nutritionist_profiles
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'rejected', 'info_required', 'suspended'));

ALTER TABLE nutritionist_profiles
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE nutritionist_profiles
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

ALTER TABLE nutritionist_profiles
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES profiles(id);

ALTER TABLE nutritionist_profiles
ADD COLUMN IF NOT EXISTS info_request_message TEXT;

ALTER TABLE nutritionist_profiles
ADD COLUMN IF NOT EXISTS info_response TEXT;

ALTER TABLE nutritionist_profiles
ADD COLUMN IF NOT EXISTS info_responded_at TIMESTAMPTZ;

-- 2. Table pour les documents nutritionniste
CREATE TABLE IF NOT EXISTS nutritionist_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relation
    nutritionist_id UUID NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,

    -- Type de document
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'asca_certificate',
        'rme_certificate',
        'diploma',
        'photo',
        'other'
    )),

    -- Fichier
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- en bytes
    mime_type VARCHAR(100),

    -- Vérification
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_nutritionist_documents_nutritionist
    ON nutritionist_documents(nutritionist_id);

-- Trigger updated_at
CREATE TRIGGER nutritionist_documents_updated_at
    BEFORE UPDATE ON nutritionist_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE nutritionist_documents ENABLE ROW LEVEL SECURITY;

-- Le nutritionniste peut voir ses propres documents
CREATE POLICY nutritionist_documents_own ON nutritionist_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = nutritionist_documents.nutritionist_id
            AND np.user_id = auth.uid()
        )
    );

-- L'admin peut tout voir
CREATE POLICY nutritionist_documents_admin ON nutritionist_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 3. Index sur le status pour les requêtes admin
CREATE INDEX idx_nutritionist_profiles_status
    ON nutritionist_profiles(status);

CREATE INDEX idx_nutritionist_profiles_pending
    ON nutritionist_profiles(created_at DESC)
    WHERE status = 'pending';
```

### Bucket Supabase Storage

**Nom du bucket :** `nutritionist-documents`

**Structure :**
```
nutritionist-documents/
├── {nutritionist_id}/
│   ├── asca_certificate.pdf
│   ├── rme_certificate.pdf
│   ├── diploma.pdf
│   └── photo.jpg
```

**Politiques RLS Storage :**
- Le nutritionniste peut uploader dans son dossier
- Le nutritionniste peut lire ses propres fichiers
- L'admin peut lire tous les fichiers

---

## Hooks et Store

### Nouveau hook : `useUserRole`

**Fichier :** `src/hooks/useUserRole.ts`

```typescript
interface UseUserRoleReturn {
  // Données
  role: 'patient' | 'nutritionist' | 'admin' | null;
  nutritionistStatus: 'pending' | 'active' | 'rejected' | 'info_required' | 'suspended' | null;

  // Helpers booléens
  isPatient: boolean;
  isNutritionist: boolean;
  isActiveNutritionist: boolean;
  isPendingNutritionist: boolean;
  isAdmin: boolean;

  // État
  isLoading: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;
}

export function useUserRole(): UseUserRoleReturn;
```

### Modification du store Zustand

**Fichier :** `src/lib/store.ts`

```typescript
interface NutriSensiaStore {
  // ... existant ...

  // Nouveau
  role: 'patient' | 'nutritionist' | 'admin' | null;
  nutritionistStatus: 'pending' | 'active' | 'rejected' | 'info_required' | 'suspended' | null;

  // Actions
  setRole: (role: string | null) => void;
  setNutritionistStatus: (status: string | null) => void;
}
```

### Hook pour la soumission d'inscription

**Fichier :** `src/hooks/useNutritionistRegistration.ts`

```typescript
interface UseNutritionistRegistrationReturn {
  // État du formulaire
  currentStep: number;
  formData: NutritionistRegistrationData;

  // État de soumission
  isSubmitting: boolean;
  error: string | null;

  // Actions
  setStep: (step: number) => void;
  updateFormData: (data: Partial<NutritionistRegistrationData>) => void;
  uploadDocument: (type: string, file: File) => Promise<string>;
  submitRegistration: () => Promise<void>;

  // Validation
  validateStep: (step: number) => boolean;
  getStepErrors: (step: number) => Record<string, string>;
}
```

---

## Composants à créer/modifier

### Nouveaux composants

| Composant | Chemin | Description |
|-----------|--------|-------------|
| `NutritionistSidebar` | `src/components/nutritionist/NutritionistSidebar.tsx` | Sidebar pour le dashboard nutritionniste |
| `NutritionistRegistrationForm` | `src/components/forms/NutritionistRegistrationForm.tsx` | Formulaire multi-étapes inscription |
| `NutritionistRegistrationStep1` | `src/components/forms/nutritionist/Step1PersonalInfo.tsx` | Étape 1 : Infos personnelles |
| `NutritionistRegistrationStep2` | `src/components/forms/nutritionist/Step2ProfessionalInfo.tsx` | Étape 2 : Infos professionnelles |
| `NutritionistRegistrationStep3` | `src/components/forms/nutritionist/Step3Documents.tsx` | Étape 3 : Upload documents |
| `NutritionistRegistrationStep4` | `src/components/forms/nutritionist/Step4Terms.tsx` | Étape 4 : Conditions |
| `NutritionistRegistrationStep5` | `src/components/forms/nutritionist/Step5Summary.tsx` | Étape 5 : Récapitulatif |
| `DocumentUploader` | `src/components/ui/DocumentUploader.tsx` | Upload de documents avec preview |
| `PendingValidationCard` | `src/components/nutritionist/PendingValidationCard.tsx` | Card affichée en attente de validation |
| `AdminNutritionistList` | `src/components/admin/AdminNutritionistList.tsx` | Liste des demandes pour admin |
| `AdminNutritionistDetail` | `src/components/admin/AdminNutritionistDetail.tsx` | Détail demande + actions admin |
| `AdminValidationModal` | `src/components/admin/AdminValidationModal.tsx` | Modal validation/rejet |

### Composants à modifier

| Composant | Modification |
|-----------|--------------|
| `DashboardSidebar` | Renommer en `PatientSidebar`, déplacer dans `src/components/patient/` |
| `DashboardHeader` | Rendre générique, accepter un prop `userRole` pour affichage conditionnel |
| `DashboardLayout` | Créer une version générique qui accepte le sidebar en prop |

---

## Ordre d'implémentation

> **📋 Suivi de progression** : Voir la [section Suivi de progression](#-suivi-de-progression) en haut du document pour l'état actuel des tâches.

### Phase 0 : Préparation

| # | Tâche | Fichiers |
|---|-------|----------|
| 0.1 | Ajouter les User Stories AUTH-008 à AUTH-013 | `User_Story_NutriSensia/USER_STORIES.md` |

### Phase 1 : Infrastructure (priorité haute)

| # | Tâche | Fichiers |
|---|-------|----------|
| 1.1 | Créer migration BDD | `database/17_nutritionist_registration.sql` |
| 1.2 | Documenter configuration bucket Storage | `docs/supabase-storage-nutritionist-documents.md` |
| 1.2b | **ACTION MANUELLE** : Créer bucket dans Supabase | Dashboard Supabase |
| 1.2c | **ACTION MANUELLE** : Exécuter migration SQL | Dashboard Supabase |
| 1.3 | Créer hook `useUserRole` | `src/hooks/useUserRole.ts` |
| 1.4 | Modifier store Zustand | `src/lib/store.ts` |
| 1.5 | Modifier middleware routage | `src/middleware.ts` |

### Phase 2 : Réorganisation dashboard patient

| # | Tâche | Fichiers |
|---|-------|----------|
| 2.1 | Créer structure `/dashboard/patient/` | Dossiers |
| 2.2 | Déplacer pages existantes | Toutes les pages dashboard |
| 2.3 | Renommer `DashboardSidebar` → `PatientSidebar` | Composants |
| 2.4 | Mettre à jour imports et liens | Toute l'app |
| 2.5 | Créer page de redirection `/dashboard` | `src/app/[locale]/dashboard/page.tsx` |
| 2.6 | Tester que tout fonctionne | - |

### Phase 3 : Inscription nutritionniste

| # | Tâche | Fichiers |
|---|-------|----------|
| 3.1 | Créer `DocumentUploader` | `src/components/ui/DocumentUploader.tsx` |
| 3.2 | Créer les 5 étapes du formulaire | `src/components/forms/nutritionist/` |
| 3.3 | Créer `NutritionistRegistrationForm` | `src/components/forms/NutritionistRegistrationForm.tsx` |
| 3.4 | Créer hook `useNutritionistRegistration` | `src/hooks/useNutritionistRegistration.ts` |
| 3.5 | Créer page inscription | `src/app/[locale]/inscription/nutritionniste/page.tsx` |
| 3.6 | Créer page en-attente | `src/app/[locale]/inscription/nutritionniste/en-attente/page.tsx` |
| 3.7 | Créer page rejetée | `src/app/[locale]/inscription/nutritionniste/rejete/page.tsx` |
| 3.8 | Créer page validée | `src/app/[locale]/inscription/nutritionniste/valide/page.tsx` |

### Phase 4 : Panel admin

| # | Tâche | Fichiers |
|---|-------|----------|
| 4.1 | Créer `AdminNutritionistList` | `src/components/admin/AdminNutritionistList.tsx` |
| 4.2 | Créer `AdminNutritionistDetail` | `src/components/admin/AdminNutritionistDetail.tsx` |
| 4.3 | Créer `AdminValidationModal` | `src/components/admin/AdminValidationModal.tsx` |
| 4.4 | Créer page liste admin | `src/app/[locale]/admin/nutritionnistes/page.tsx` |
| 4.5 | Créer page détail admin | `src/app/[locale]/admin/nutritionnistes/[id]/page.tsx` |
| 4.6 | Implémenter actions valider/rejeter | API routes |
| 4.7 | Notifications email | Optionnel |

### Phase 5 : Dashboard nutritionniste

| # | Tâche | Fichiers |
|---|-------|----------|
| 5.1 | Créer `NutritionistSidebar` | `src/components/nutritionist/NutritionistSidebar.tsx` |
| 5.2 | Créer layout nutritionniste | `src/app/[locale]/dashboard/nutritionist/layout.tsx` |
| 5.3 | Créer page d'accueil | `src/app/[locale]/dashboard/nutritionist/page.tsx` |
| 5.4 | Créer page liste patients | `src/app/[locale]/dashboard/nutritionist/patients/page.tsx` |
| 5.5 | Créer vue dossier patient | `src/app/[locale]/dashboard/nutritionist/patients/[id]/` |
| 5.6 | Créer agenda nutritionniste | `src/app/[locale]/dashboard/nutritionist/agenda/page.tsx` |
| 5.7 | Créer messagerie globale | `src/app/[locale]/dashboard/nutritionist/messagerie/page.tsx` |

---

## Estimation de complexité

| Phase | Complexité | Dépendances | Fichiers estimés |
|-------|------------|-------------|------------------|
| Phase 1 (Infrastructure) | Moyenne | Aucune | 5 |
| Phase 2 (Réorg patient) | Moyenne | Phase 1 | 15+ |
| Phase 3 (Inscription) | Haute | Phase 1, 2 | 12 |
| Phase 4 (Admin) | Moyenne | Phase 1, 3 | 6 |
| Phase 5 (Dashboard nutri) | Haute | Phase 1-4 | 10+ |

### Ordre de priorité recommandé

1. **Phase 1** - Bloquant pour tout le reste
2. **Phase 2** - Nécessaire avant d'ajouter le dashboard nutritionniste
3. **Phase 3** - Permet aux nutritionnistes de s'inscrire
4. **Phase 4** - Permet la validation des inscriptions
5. **Phase 5** - Dashboard nutritionniste complet

---

## Tests et validation

### Checklist de test Phase 2

- [ ] `/dashboard` redirige vers `/dashboard/patient` pour un patient
- [ ] Toutes les pages patient fonctionnent à leur nouvel emplacement
- [ ] La sidebar patient affiche les bons liens
- [ ] Les liens actifs sont correctement surlignés

### Checklist de test Phase 3

- [ ] Le formulaire d'inscription s'affiche correctement
- [ ] La validation des champs fonctionne
- [ ] L'upload de documents fonctionne
- [ ] La soumission crée un compte avec `status = 'pending'`
- [ ] La redirection vers page d'attente fonctionne

### Checklist de test Phase 4

- [ ] L'admin voit la liste des demandes
- [ ] Les filtres fonctionnent
- [ ] La validation met à jour le status à `'active'`
- [ ] Le rejet demande un motif et met à jour le status
- [ ] L'email de notification est envoyé (si implémenté)

### Checklist de test Phase 5

- [ ] Le nutritionniste validé accède à son dashboard
- [ ] La sidebar nutritionniste s'affiche
- [ ] La liste des patients fonctionne
- [ ] L'accès au dossier patient fonctionne

---

## Notes importantes

### Sécurité

- Les documents uploadés doivent être vérifiés (type MIME, taille)
- Les routes admin doivent vérifier le rôle côté serveur
- Les données sensibles (certifications) ne doivent pas être exposées publiquement

### Performance

- Utiliser la pagination pour la liste des demandes admin
- Optimiser les requêtes avec des index appropriés
- Mettre en cache les informations de rôle

### UX

- Messages d'erreur clairs en français
- Indicateur de progression dans le formulaire multi-étapes
- Confirmation avant soumission définitive
- Feedback visuel pendant les uploads

---

## Références

- [CLAUDE.md](../CLAUDE.md) - Instructions générales du projet
- [USER_STORIES.md](../User_Story_NutriSensia/USER_STORIES.md) - User stories existantes
- [Migration 16](../database/16_schema_harmonization.sql) - Harmonisation du schéma
