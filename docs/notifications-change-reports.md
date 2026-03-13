# Notifications - Signalements de changement (Change Reports)

> **Statut** : A implementer (notifications non encore integrees dans l'application)
> **Date de redaction** : 2026-02-10
> **Contexte** : Feature FILE-002 (Signalement de changement patient)

## Notifications a implementer

### 1. Patient → Nutritionniste

**Declencheur** : Le patient cree un nouveau signalement de changement (POST `/api/protected/dossier/change-reports`)

**Destinataire** : Le nutritionniste assigne au patient (`patient_profiles.nutritionist_id` → `nutritionist_profiles.user_id`)

**Contenu suggere** :
- **Titre** : "Nouveau signalement de changement"
- **Message** : "{prenom_patient} a signale un changement : {report.title}"
- **Lien** : `/dashboard/nutritionist/patients/{patient_profile_id}/dossier` (onglet Signalements)
- **Priorite** : Normale

**Fichier concerne** : `src/app/api/protected/dossier/change-reports/route.ts` (POST)

**Donnees disponibles au moment du declenchement** :
- `auth.user.id` → ID du patient
- `report.title` → Nom du champ modifie (ex: "Lieu principal des repas")
- `report.change_type` → Type de changement (health, lifestyle, etc.)
- `report.anamnesis_section_id` → Section de l'anamnese concernee
- `report.new_value` → Nouvelle valeur

---

### 2. Nutritionniste → Patient (Integration)

**Declencheur** : Le nutritionniste integre un signalement (PATCH `/api/protected/nutritionist/patients/[id]/dossier/change-reports` avec `status: 'integrated'`)

**Destinataire** : Le patient concerne (`patient.user_id`)

**Contenu suggere** :
- **Titre** : "Changement integre dans votre anamnese"
- **Message** : "Votre nutritionniste a integre votre signalement concernant \"{report.title}\". Votre anamnese a ete mise a jour."
- **Lien** : `/dashboard/patient/dossier` (onglet Anamnese)
- **Priorite** : Normale

**Fichier concerne** : `src/app/api/protected/nutritionist/patients/[id]/dossier/change-reports/route.ts` (PATCH, branche `status === 'integrated'`)

**Donnees disponibles au moment du declenchement** :
- `patient.user_id` → ID du patient destinataire
- `auth.user.id` → ID du nutritionniste
- `report.title` → Nom du champ modifie
- `report.new_value` → Nouvelle valeur integree

---

### 3. Nutritionniste → Patient (A aborder en consultation)

**Declencheur** : Le nutritionniste marque un signalement comme "a aborder en consultation" (PATCH avec `status: 'reviewed'`)

**Destinataire** : Le patient concerne (`patient.user_id`)

**Contenu suggere** :
- **Titre** : "Signalement pris en compte"
- **Message** : "Votre nutritionniste a pris connaissance de votre signalement concernant \"{report.title}\". Ce point sera aborde lors de votre prochaine consultation."
- **Lien** : `/dashboard/patient/dossier` (onglet Signalements)
- **Priorite** : Basse

**Fichier concerne** : `src/app/api/protected/nutritionist/patients/[id]/dossier/change-reports/route.ts` (PATCH, branche `status === 'reviewed'`)

**Donnees disponibles au moment du declenchement** :
- `patient.user_id` → ID du patient destinataire
- `auth.user.id` → ID du nutritionniste
- `report.title` → Nom du champ concerne
- `parsed.data.reviewer_notes` → Notes eventuelles du nutritionniste

---

## Schema de la table notifications (suggestion)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),  -- destinataire
  type TEXT NOT NULL,                               -- 'change_report_created', 'change_report_integrated', 'change_report_reviewed'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,                                        -- URL relative vers la page concernee
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,                                   -- donnees supplementaires (report_id, patient_id, etc.)
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Points d'integration dans le code

| Notification | Route API | Condition |
|---|---|---|
| Patient cree signalement | `src/app/api/protected/dossier/change-reports/route.ts` POST | Apres insertion reussie du change_report |
| Nutritionniste integre | `src/app/api/protected/nutritionist/patients/[id]/dossier/change-reports/route.ts` PATCH | `parsed.data.status === 'integrated'` |
| Nutritionniste marque "a aborder" | Meme fichier PATCH | `parsed.data.status === 'reviewed'` |

## Canaux de notification (a definir)

- [ ] In-app (cloche de notification dans le header)
- [ ] Email (optionnel, selon preferences utilisateur)
- [ ] Push (si PWA implementee)
