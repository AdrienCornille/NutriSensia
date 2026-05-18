# NutriSensia - User Stories Dashboard Nutritionniste

> **Version 2.1** | Février 2026 | 82 user stories | 10 épics + Phase 2.5

---

## Statistiques globales

| Métrique                     | Valeur         |
| ---------------------------- | -------------- |
| Nombre total d'épics         | 10 + Phase 2.5 |
| Nombre total de user stories | 84             |
| Must Have                    | 35 (43%)       |
| Should Have                  | 37 (45%)       |
| Could Have                   | 10 (12%)       |

### Statut d'implémentation

| Statut        | Nombre | Pourcentage |
| ------------- | ------ | ----------- |
| ✅ Implémenté | 67     | 80%         |
| ⚠️ Partiel    | 6      | 7%          |
| ❌ À faire    | 11     | 13%         |

---

## Système de notifications (Transversal)

Ce système est utilisé par plusieurs épics. L'implémentation doit être centralisée.

### Types de notifications

| Type                          | Description                    | Destinataire           |
| ----------------------------- | ------------------------------ | ---------------------- |
| `new_patient_assigned`        | Nouveau patient assigné        | Nutritionniste         |
| `appointment_confirmed`       | RDV confirmé                   | Patient                |
| `appointment_rejected`        | RDV refusé                     | Patient                |
| `appointment_cancelled`       | RDV annulé                     | Patient/Nutritionniste |
| `appointment_reminder`        | Rappel RDV                     | Patient/Nutritionniste |
| `new_message`                 | Nouveau message                | Patient/Nutritionniste |
| `change_report_submitted`     | Signalement de changement      | Nutritionniste         |
| `questionnaire_completed`     | Questionnaire complété         | Nutritionniste         |
| `questionnaire_overdue`       | Questionnaire en retard        | Patient                |
| `plan_modification_requested` | Demande modif plan             | Nutritionniste         |
| `plan_modification_approved`  | Modif plan approuvée           | Patient                |
| `plan_modification_rejected`  | Modif plan refusée             | Patient                |
| `new_meal_plan`               | Nouveau plan publié            | Patient                |
| `consultation_summary`        | Résumé consultation disponible | Patient                |

### Canaux de diffusion

- **In-app** : Table `notifications`, temps réel via Supabase Realtime
- **Email** : Optionnel, selon préférences utilisateur
- **Push** : Phase future (nécessite service worker)

### Implémentation technique

```sql
-- Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RPC
CREATE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id;
$$ LANGUAGE sql;
```

```typescript
// Hook React
const useNotifications = () => {
  // Supabase Realtime subscription sur notifications
  // où user_id = current user
};
```

---

## Roadmap d'implémentation

### Phase 1 : Fondations ✅ FAIT

- Epic 2 : Gestion des patients
- Epic 3 : Dossier & Anamnèse
- Epic 6 : Agenda & Disponibilités
- Epic 7 : Messagerie

### Phase 2 : Plan alimentaire ✅ FAIT

- Epic 5 : Plan alimentaire - Création & Gestion (PLAN-N-001 à 009)

### Phase 2.5 : Profil Nutritionnel ✅ FAIT (2026-02-21)

- Calcul BMR multi-formules, macro templates, micro targets
- Workflow draft/active/archived, versioning, comparaison
- Patient : consultation profil, historique, export PDF

### Phase 3 : Workflow consultation ✅ FAIT (2026-02-13/14)

- Epic 4 : Consultations & Notes (CONSULT-001 à 007)

### Phase 3.1 : Suivi patient ✅ FAIT (2026-02-21)

- Epic 8 : Suivi & Progression (SUIVI-001 à 007)

### Phase 4 : Dashboard & Finalisation 🔜 PRIORITÉ

- AGENDA-N-011 : Marquage post-RDV
- Epic 1 : Dashboard (enrichir avec vraies données)
- ~~Compléter les badges patient (PAT-008)~~ ✅ FAIT (2026-03-03)
- ~~PAT-006 : Notes internes avec historique~~ ✅ FAIT (2026-03-03)
- Gestion statut patient (activer/pause/réactiver) ✅ FAIT (2026-03-03)

### Phase 5 : Contenu & Profil

- ~~Epic 9 : Contenu éducatif~~ ✅ FAIT (2026-03-22) — CONTENT-N-001 à 013 complets
- Recettes (RECIPE-N-001 à 004 + REC-001 à 007) : à faire — voir `docs/prompts/RECIPES_IMPLEMENTATION.md`
- Epic 10 : Profil & Paramètres

---

## Epic 1 : Dashboard principal nutritionniste

> 7 user stories | ✅ 0 | ⚠️ 3 | ❌ 4

**Dépendances** : Epic 2 (patients), Epic 6 (agenda), Epic 7 (messagerie)

**Wireframe** : Créer `nutrisensia-nutritionist-dashboard-wireframe.jsx`

---

### NUTRI-DASH-001 - Vue d'ensemble du jour [Must Have] ⚠️

**En tant que** nutritionniste,
**Je veux** voir un résumé de ma journée en un coup d'œil,
**Afin de** je puisse organiser ma journée de travail efficacement.

**Point d'entrée** : Page d'accueil `/dashboard/nutritionist`

**Critères d'acceptation** :

- ✓ Affichage du nombre de patients actifs (API connectée)
- ✓ Nombre de RDV aujourd'hui et cette semaine
- ✓ Nombre de messages non lus
- ✓ Prochaine disponibilité
- ✓ Données issues des API (pas de valeurs stub "--")

**Statut actuel** : Layout présent avec 4 cards de stats. Stats consultations connectées via `ConsultationStatsSection`. Manque : stats messages, prochaine disponibilité.

---

### NUTRI-DASH-002 - Rendez-vous du jour [Must Have] ⚠️

**En tant que** nutritionniste,
**Je veux** voir la liste de mes rendez-vous du jour sur le dashboard,
**Afin de** je sache qui je reçois et à quelle heure.

**Critères d'acceptation** :

- ✓ Liste des RDV du jour avec heure, patient, type de consultation
- ✓ Badge mode (visio/cabinet)
- ✓ Bouton "Rejoindre la visio" si RDV visio dans les 15 prochaines minutes
- ✓ Lien vers le dossier patient pour chaque RDV
- ✓ Message "Aucun rendez-vous aujourd'hui" si journée libre

**💡 Notes Claude Code** : Réutiliser le composant `AppointmentCard` de l'agenda. Filtrer appointments par date du jour.

---

### NUTRI-DASH-003 - Demandes en attente [Must Have] ⚠️

**En tant que** nutritionniste,
**Je veux** voir les demandes de RDV en attente depuis le dashboard,
**Afin de** je puisse y répondre rapidement.

**Critères d'acceptation** :

- ✓ Nombre de demandes en attente bien visible (badge)
- ✓ Aperçu des 3 dernières demandes avec nom du patient et date souhaitée
- ✓ Lien rapide vers la page Agenda pour traiter les demandes
- ✓ Alerte visuelle si demande en attente depuis plus de 24h

**Statut actuel** : Le badge de `pending_count` existe dans la sidebar, mais pas de section dédiée sur le dashboard

---

### NUTRI-DASH-004 - Alertes patients [Should Have] ❌

**En tant que** nutritionniste,
**Je veux** voir les alertes importantes de mes patients,
**Afin de** je puisse intervenir en cas de besoin.

**Critères d'acceptation** :

- ✓ Signalements de changements de santé non révisés (`change_reports`)
- ✓ Demandes de modification de plan alimentaire en attente
- ✓ Patients n'ayant pas enregistré de repas depuis 3+ jours
- ✓ Questionnaires de suivi non complétés dépassés
- ✓ Tri par urgence

**💡 Notes Claude Code** : Créer un hook `usePatientAlerts` qui agrège `change_reports` (pending), `plan_modification_requests` (pending), `meals` (last 3 days), `questionnaires` (overdue).

---

### NUTRI-DASH-005 - Accès rapide aux fonctionnalités [Should Have] ⚠️

**En tant que** nutritionniste,
**Je veux** accéder rapidement aux fonctionnalités principales,
**Afin de** je gagne du temps dans ma navigation.

**Critères d'acceptation** :

- ✓ Cards d'accès rapide : Disponibilités, Agenda, Patients, Messagerie
- ✓ Description courte de chaque fonctionnalité
- ✓ Indication du nombre d'éléments à traiter (messages non lus, demandes en attente)

**Statut actuel** : 2 cards d'accès rapide existent (Disponibilités, Agenda). Manquent : Patients, Messagerie

---

### NUTRI-DASH-006 - Statistiques hebdomadaires [Should Have] ❌

**En tant que** nutritionniste,
**Je veux** voir mes statistiques de la semaine,
**Afin de** je puisse évaluer mon activité.

**Critères d'acceptation** :

- ✓ Nombre de consultations réalisées cette semaine
- ✓ Nombre de nouveaux patients
- ✓ Taux de réponse aux messages (délai moyen)
- ✓ Comparaison avec la semaine précédente

**💡 Notes Claude Code** : Créer une fonction DB `get_nutritionist_weekly_stats(nutritionist_id)` pour optimiser les requêtes.

---

### NUTRI-DASH-007 - Progression des patients [Could Have] ❌

**En tant que** nutritionniste,
**Je veux** voir un aperçu de la progression de mes patients,
**Afin de** je puisse identifier ceux qui ont besoin d'attention.

**Critères d'acceptation** :

- ✓ Top 3 patients avec la meilleure adhérence au plan
- ✓ Patients avec adhérence en baisse (< 50%)
- ✓ Nombre moyen d'objectifs atteints cette semaine
- ✓ Lien vers le détail de chaque patient

**💡 Notes Claude Code** : Dépend de l'Epic 5 (Plan alimentaire) pour les données d'adhérence.

---

## Epic 2 : Gestion des patients

> 8 user stories | ✅ 6 | ⚠️ 2 | ❌ 0

**Dépendances** : Aucune

**Wireframe** : Composants existants : `PatientCard`, `PatientListRow`, `PatientQuickView`

---

### PAT-001 - Liste des patients [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** voir la liste de tous mes patients,
**Afin de** je puisse accéder à leurs dossiers.

**Point d'entrée** : Menu "Mes patients" → `/dashboard/nutritionist/patients`

**Critères d'acceptation** :

- ✓ Liste avec photo/initiales, nom, prénom, email
- ✓ Date de début du suivi
- ✓ Dernier RDV et prochain RDV
- ✓ Statut du suivi (actif, en pause, terminé)
- ✓ Nombre de consultations réalisées
- ✓ Badge d'adhérence au plan (vert/orange/rouge)

**Tables DB** : `patient_profiles`, `appointments`

**Statut actuel** : Page complète avec vue cards et vue tableau. API GET `/api/protected/nutritionist/patients`. Manque : badge d'adhérence (nécessite Epic 5).

---

### PAT-002 - Recherche et filtrage de patients [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** rechercher et filtrer mes patients,
**Afin de** je puisse trouver rapidement un patient spécifique.

**Critères d'acceptation** :

- ✓ Recherche par nom, prénom ou email
- ✓ Filtres : statut (actif/en pause/terminé), objectif principal, date de suivi
- ✓ Tri : nom, date dernière consultation, adhérence
- ✓ Compteur de résultats

**Statut actuel** : Recherche + filtres + tri implémentés. Composant `PatientFilters` avec debounce 300ms. Manque : filtre par objectif principal, tri par adhérence.

---

### PAT-003 - Fiche patient (vue synthétique) [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** voir une fiche synthétique de chaque patient,
**Afin de** j'aie une vue d'ensemble rapide avant une consultation.

**Point d'entrée** : Clic sur un patient → `/dashboard/nutritionist/patients/[id]`

**Critères d'acceptation** :

- ✓ Informations personnelles (nom, âge, coordonnées)
- ✓ Données morphologiques actuelles (poids, taille, IMC)
- ✓ Objectifs en cours avec progression
- ✓ Plan alimentaire actif (résumé)
- ✓ Prochain RDV
- ✓ Dernière consultation (date + résumé)
- ✓ Historique récent des repas (3 derniers jours)
- ✓ Adhérence au plan (% semaine en cours)
- ✓ Streak actuel et badges obtenus

**↔ Miroir patient** : DASH-001 à DASH-007

**Statut actuel** : Composant `PatientSyntheseTab` avec 5 rangées. Adhérence renvoie null en attendant Epic 5.

---

### PAT-004 - Navigation entre les sections patient [Must Have] ⚠️

**En tant que** nutritionniste,
**Je veux** naviguer entre les différentes sections du dossier d'un patient,
**Afin de** j'accède rapidement à l'information pertinente.

**Critères d'acceptation** :

- ✓ Onglets : Synthèse, Dossier, Plan, Suivi, Consultations, Messagerie
- ✓ Maintien du contexte patient lors de la navigation
- ✓ Retour rapide à la liste des patients

**Statut actuel** : 6 onglets présents. Synthèse, Dossier, Plan, Suivi, Consultations et Profil fonctionnels. Messagerie à implémenter.

---

### PAT-005 - Assignation d'un nouveau patient [Should Have] ⚠️

**En tant que** nutritionniste,
**Je veux** qu'un nouveau patient soit automatiquement assigné à mon portefeuille,
**Afin de** je puisse commencer son suivi.

**Critères d'acceptation** :

- ✓ Notification lors de l'assignation d'un nouveau patient
- ✓ Accès automatique au profil du patient
- ✓ Information "raison de consultation" visible
- ✓ Indicateur première consultation vs transfert

**Statut actuel** : Bannière amber "X nouveau(x) patient(s)" sur la page liste. Transition automatique `pending → active` à la 1ère consultation + bouton manuel "Activer le suivi" dans la synthèse. Notification patient à l'activation. Manque : notifications push, indicateur transfert.

---

### PAT-006 - Notes internes sur un patient [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** ajouter des notes internes sur un patient,
**Afin de** je puisse garder des informations privées utiles au suivi.

**Critères d'acceptation** :

- ✓ Champ de texte libre non visible par le patient
- ✓ Sauvegarde automatique
- ✓ Historique des notes avec horodatage
- ✓ Visible uniquement par le nutritionniste

**Tables DB** : `patient_notes` (migration: `database/migrations/create_patient_notes.sql`)

**Statut actuel** : Complet. Table `patient_notes` avec CRUD complet (API GET+POST+PATCH+DELETE). Composant `PatientNotesSection` avec ajout, édition inline auto-save (debounce 1s), suppression avec confirmation, horodatage relatif (`date-fns`). RLS nutritionniste-only. Hooks: `usePatientNotes`, `useCreatePatientNote`, `useUpdatePatientNote`, `useDeletePatientNote`.

---

### PAT-007 - Export de la liste patients [Could Have] ✅

**En tant que** nutritionniste,
**Je veux** exporter ma liste de patients,
**Afin de** je puisse l'utiliser dans mes outils de gestion.

**Critères d'acceptation** :

- ✓ Export CSV avec nom, email, date début, statut
- ✓ Respect RGPD (données minimales)
- ✓ Bouton d'export visible dans la page liste

**Statut actuel** : Fonction `exportPatientsToCSV()` client-side avec BOM UTF-8. Téléchargement automatique.

---

### PAT-008 - Indicateurs d'alerte patient [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir des indicateurs d'alerte sur chaque patient,
**Afin de** je puisse prioriser mon attention.

**Critères d'acceptation** :

- ✓ Badge rouge si signalement de changement non révisé
- ✓ Badge orange si adhérence < 50% cette semaine
- ✓ Badge jaune si pas d'enregistrement de repas depuis 3 jours
- ✓ Badge bleu si message non lu
- ✓ Icône si demande de modification de plan en attente

**Statut actuel** : Complet. 5 badges d'alerte dans `PatientCard` et `PatientListRow`. Route API enrichie avec 2 queries parallèles supplémentaires (`plan_adherence` + `plan_modification_requests`). Badge orange (TrendingDown, adhérence < 50%), badge violet (FileEdit, modifications en attente). Gestion statut patient : boutons Activer/Pause/Réactiver dans la synthèse avec notifications patient.

---

## Epic 3 : Dossier & Anamnèse patient

> 10 user stories | ✅ 10 | ⚠️ 0 | ❌ 0

**Dépendances** : Aucune

**Wireframe** : Composants existants : `AnamneseSectionList`, `AnamneseCreateForm`

---

### DOSSIER-001 - Consultation de l'anamnèse d'un patient [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** consulter l'anamnèse de mon patient,
**Afin de** je puisse revoir son historique médical et ses habitudes.

**Critères d'acceptation** :

- ✓ Affichage des 10 sections
- ✓ Sections dépliables/repliables
- ✓ Indication de la version et date de création
- ✓ Historique des versions avec possibilité d'éditer

**↔ Miroir patient** : FILE-001 (patient voit la même anamnèse en lecture seule)

**Tables DB** : `anamneses` + 10 tables normalisées

**Statut actuel** : Complet. API GET `/api/protected/nutritionist/patients/[id]/dossier/anamnese`.

---

### DOSSIER-002 - Création de l'anamnèse [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** créer l'anamnèse de mon patient lors de la première consultation,
**Afin de** toutes les informations médicales soient structurées.

**Critères d'acceptation** :

- ✓ Formulaire multi-sections (10 sections)
- ✓ ~105 champs typés
- ✓ Sauvegarde section par section
- ✓ Horodatage automatique
- ✓ Pré-remplissage depuis le profil patient

**Statut actuel** : Complet. `AnamneseCreateForm` avec conversion automatique frontend → PostgreSQL.

---

### DOSSIER-003 - Mise à jour de l'anamnèse [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** mettre à jour l'anamnèse si les informations changent,
**Afin de** le dossier soit toujours à jour.

**Critères d'acceptation** :

- ✓ Création d'une nouvelle version (l'ancienne est conservée)
- ✓ Pré-remplissage avec les données actuelles
- ✓ Champs modifiés mis en évidence
- ✓ Indication du motif de mise à jour

**Statut actuel** : Complet. Bouton "Nouvelle version" avec `create_anamnesis_version()`. Manque : mise en évidence visuelle des diffs.

---

### DOSSIER-004 - Gestion des signalements de changement [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir et traiter les signalements de changement de mes patients,
**Afin de** je puisse mettre à jour leur dossier.

**Critères d'acceptation** :

- ✓ Liste des signalements non révisés
- ✓ Type de changement avec icônes
- ✓ Actions : Marquer comme révisé, Intégrer dans l'anamnèse
- ✓ Notes du nutritionniste

**↔ Miroir patient** : FILE-002 (patient envoie le signalement)

**Tables DB** : `change_reports`

**Statut actuel** : Complet. Composant `ChangeReportsList` avec filtres et actions.

---

### DOSSIER-005 - Création de questionnaires de suivi [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** créer des questionnaires de suivi pour mes patients,
**Afin de** je puisse évaluer leur progression entre les consultations.

**Critères d'acceptation** :

- ✓ Types : suivi, feedback, personnalisé
- ✓ Questions variées (texte, choix multiple, échelle, oui/non)
- ✓ Lien optionnel à une consultation
- ✓ Date limite de complétion
- ✓ Notification au patient

**↔ Miroir patient** : FILE-003 (patient remplit le questionnaire)

**Tables DB** : `follow_up_questionnaires`

**Statut actuel** : Complet. Manque : lien à une consultation (Epic 4), notifications push.

---

### DOSSIER-006 - Consultation des réponses aux questionnaires [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** consulter les réponses de mes patients aux questionnaires,
**Afin de** je puisse préparer mes consultations.

**Critères d'acceptation** :

- ✓ Liste avec statut (complété, en attente, en retard)
- ✓ Visualisation des réponses
- ✓ Comparaison entre questionnaires successifs
- ✓ Alerte si questionnaire en retard

**Statut actuel** : Complet. Manque : comparaison entre questionnaires, alerte visuelle retard.

---

### DOSSIER-007 - Gestion des documents patient [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** gérer les documents du dossier patient,
**Afin de** je puisse centraliser toutes les pièces.

**Critères d'acceptation** :

- ✓ Upload (PDF, images) max 10 Mo
- ✓ Catégories : Analyses, Plans, Ressources, Autre
- ✓ Indication uploadeur (nutritionniste vs patient)
- ✓ Téléchargement et prévisualisation

**↔ Miroir patient** : FILE-004

**Tables DB** : `documents`

**Statut actuel** : Complet. Manque : prévisualisation inline, lien à consultation.

---

### DOSSIER-008 - Définition des objectifs patient [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** définir des objectifs pour mon patient,
**Afin de** nous ayons des cibles claires et mesurables.

**Critères d'acceptation** :

- ✓ Catégories : Poids, Habitude, Comportement, Nutrition, Activité
- ✓ Valeur de départ, cible, unité, échéance
- ✓ Priorité (haute, moyenne, basse)
- ✓ Description et critères de réussite

**↔ Miroir patient** : FILE-006

**Tables DB** : `patient_objectives`

**Statut actuel** : Complet. Composant `ObjectivesList` avec CRUD.

---

### DOSSIER-009 - Suivi de la progression des objectifs [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** suivre la progression des objectifs de mes patients,
**Afin de** je puisse ajuster le plan si nécessaire.

**Critères d'acceptation** :

- ✓ Valeur actuelle vs cible avec barre de progression
- ✓ Statut : en bonne voie, en cours, à améliorer, abandonné
- ✓ Historique des mises à jour
- ✓ Graphique d'évolution dans le temps

**Statut actuel** : Complet. Logs de progression via POST `/objectives/[id]/progress`. Manque : graphique d'évolution.

---

### DOSSIER-010 - Export du dossier patient [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** exporter le dossier complet d'un patient,
**Afin de** je puisse répondre aux demandes RGPD ou transmettre à un confrère.

**Critères d'acceptation** :

- ✓ Sélection des données à inclure
- ✓ Formats supportés : JSON (données brutes), PDF (rapport formaté)
- ✓ Anonymisation optionnelle pour partage professionnel
- ✓ Horodatage de l'export

**↔ Miroir patient** : FILE-007

**Statut actuel** : Complet pour JSON. Manque : format PDF, anonymisation, sélection des sections.

**💡 Notes Claude Code** : Utiliser la fonction DB `export_patient_file(patient_id)`. Pour le PDF, utiliser puppeteer ou pdfkit.

---

## Epic 4 : Consultations & Notes

> 7 user stories | ✅ 7 | ⚠️ 0 | ❌ 0

**Dépendances** : Epic 6 (agenda), Epic 3 (documents), Epic 7 (messagerie)

**Composants** : `ConsultationsTab`, `ConsultationsList`, `ConsultationForm`, `ConsultationPreparation` dans `src/components/nutritionist/dossier/consultations/`

**Hooks** : `src/hooks/useNutritionistConsultations.ts`, `src/hooks/useNutritionistStatistics.ts`

**API** : `src/app/api/protected/nutritionist/patients/[id]/dossier/consultations/` (GET+POST, `[consultationId]/` GET+PATCH+DELETE), `src/app/api/protected/nutritionist/statistics/consultations/` GET

**Patient API** : `src/app/api/protected/dossier/consultations/` GET (final uniquement, sans private_notes)

**Tables DB** : `consultations` (avec status enum: draft/final), migration `database/migrations/add_consultation_status.sql`

**Implémenté** : 2026-02-13/14

---

### CONSULT-001 - Création d'un compte-rendu de consultation [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** créer un compte-rendu après chaque consultation,
**Afin de** je garde une trace structurée de nos échanges.

**Critères d'acceptation** :

- ✓ Lien automatique avec le RDV terminé (`appointment_id`)
- ✓ Champs : date, durée, type, mode
- ✓ Résumé de la consultation (texte libre)
- ✓ Points clés (liste)
- ✓ Prochaines étapes (texte libre)
- ✓ Notes privées (non visibles par le patient)
- ✓ Documents attachés (optionnel)

**↔ Miroir patient** : FILE-005 (patient voit l'historique, hors notes privées)

**Tables DB** : `consultations`

**Statut actuel** : Complet. `ConsultationForm` avec workflow draft/final, lien RDV, private_notes. API POST + GET.

---

### CONSULT-002 - Historique des consultations d'un patient [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** voir l'historique complet des consultations d'un patient,
**Afin de** je puisse suivre l'évolution du suivi.

**Critères d'acceptation** :

- ✓ Timeline chronologique inversée
- ✓ Date, durée, type, mode pour chaque consultation
- ✓ Résumé et points clés
- ✓ Notes privées du nutritionniste
- ✓ Documents attachés
- ✓ Lien vers le RDV associé

**Statut actuel** : Complet. `ConsultationsList` avec timeline, filtres, expansion détail.

---

### CONSULT-003 - Modification d'un compte-rendu [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** modifier un compte-rendu de consultation,
**Afin de** je puisse corriger ou compléter les informations.

**Critères d'acceptation** :

- ✓ Modification possible jusqu'à 48h après la création
- ✓ Indication de la dernière modification
- ✓ Tous les champs éditables

**Statut actuel** : Complet. PATCH route avec fenêtre de 48h, `updated_at` affiché.

---

### CONSULT-004 - Notes privées par consultation [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** ajouter des notes privées à chaque consultation,
**Afin de** je puisse garder des observations non partagées avec le patient.

**Critères d'acceptation** :

- ✓ Champ de texte dédié, clairement identifié comme "privé"
- ✓ Non visible dans la vue patient
- ✓ Sauvegarde indépendante du reste du compte-rendu
- ✓ Icône ou badge "confidentiel" visible

**Statut actuel** : Complet. Champ `private_notes` avec badge "Confidentiel", exclu de l'API patient.

---

### CONSULT-005 - Préparation de la prochaine consultation [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir un résumé pré-consultation,
**Afin de** je puisse préparer mon entretien.

**Critères d'acceptation** :

- ✓ Objectifs en cours et progression
- ✓ Adhérence au plan depuis la dernière consultation
- ✓ Évolution du poids et mensurations
- ✓ Signalements de changement non traités
- ✓ Messages échangés depuis la dernière consultation
- ✓ Notes privées de la dernière consultation

**Statut actuel** : Complet. `ConsultationPreparation` agrège données depuis multiple sources.

---

### CONSULT-006 - Lien consultation-RDV [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** qu'un compte-rendu soit automatiquement lié au RDV terminé,
**Afin de** la traçabilité soit assurée.

**Critères d'acceptation** :

- ✓ Après un RDV passé, proposition automatique de créer le compte-rendu
- ✓ Pré-remplissage avec les infos du RDV
- ✓ Notification si aucun compte-rendu créé 24h après le RDV
- ✓ Lien bidirectionnel RDV ↔ consultation

**Statut actuel** : Complet. `appointment_id` lié, pré-remplissage date/type/mode depuis RDV.

---

### CONSULT-007 - Statistiques de consultation [Could Have] ✅

**En tant que** nutritionniste,
**Je veux** voir mes statistiques de consultation,
**Afin de** je puisse évaluer mon activité.

**Critères d'acceptation** :

- ✓ Nombre total de consultations (par mois, par type)
- ✓ Durée moyenne
- ✓ Répartition visio vs cabinet
- ✓ Nombre de patients uniques vus ce mois
- ✓ Taux de no-show

**Statut actuel** : Complet. API `/nutritionist/statistics/consultations`, `ConsultationStatsSection` sur le dashboard, `useNutritionistStatistics` hook.

---

## Epic 5 : Plan alimentaire - Création & Gestion

> 9 user stories | ✅ 9 | ⚠️ 0 | ❌ 0

**Dépendances** : Epic 3 (pour lier aux objectifs)

**Wireframe** : Composants existants : `MealPlanForm`, `MealPlanEditor`, `MealPlanList`, `TemplatePicker`, `ShoppingListModal`

---

### PLAN-N-001 - Création d'un plan alimentaire [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** créer un plan alimentaire pour mon patient,
**Afin de** il ait un guide nutritionnel adapté à ses besoins.

**Point d'entrée** : Section "Plan" dans la fiche patient

**Critères d'acceptation** :

- ✓ Objectif du plan (texte libre)
- ✓ Date de début et date de fin
- ✓ Objectifs nutritionnels journaliers (calories, macros)
- ✓ Objectifs en micronutriments (16 CIQUAL)
- ✓ Statut : brouillon, actif, archivé

**↔ Miroir patient** : PLAN-001 à PLAN-007

**Tables DB** : `meal_plans`

**Statut actuel** : Complet. API routes GET+POST+PATCH+DELETE, `MealPlanForm`, `MealPlanList`.

---

### PLAN-N-002 - Construction des repas jour par jour [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** définir les repas pour chaque jour du plan,
**Afin de** le patient sache exactement quoi manger.

**Critères d'acceptation** :

- ✓ 7 jours configurables
- ✓ 6 types de repas par jour
- ✓ Nom et heure suggérée pour chaque repas
- ✓ Calcul automatique des totaux nutritionnels
- ✓ Indicateur visuel si totaux hors objectifs

**Tables DB** : `meal_plan_days`, `meal_plan_meals`

**Statut actuel** : Complet. `MealPlanEditor` avec `DayTabs`, `MealSection`, `MacroObjectivesCard`.

---

### PLAN-N-003 - Ajout d'aliments aux repas [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** ajouter des aliments avec des quantités précises à chaque repas,
**Afin de** le plan soit détaillé et actionnable.

**Critères d'acceptation** :

- ✓ Recherche dans la base CIQUAL + aliments manuels
- ✓ Sélection de la portion (grammes ou unités)
- ✓ Affichage en temps réel des macros
- ✓ Recalcul automatique du total
- ✓ Réordonnancement par drag-and-drop

**Tables DB** : `meal_plan_meal_foods`

**Statut actuel** : Complet. Drag-and-drop via `@dnd-kit/sortable` avec batch reorder API.

---

### PLAN-N-004 - Définition d'alternatives alimentaires [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** proposer des alternatives pour chaque aliment,
**Afin de** le patient puisse adapter sans perdre l'équilibre nutritionnel.

**Critères d'acceptation** :

- ✓ 2 à 3 alternatives par aliment
- ✓ Équivalence nutritionnelle indiquée (écart en %)
- ✓ Quantité ajustée automatiquement
- ✓ Note explicative optionnelle

**↔ Miroir patient** : PLAN-004

**Tables DB** : `meal_plan_alternatives`

**Statut actuel** : Complet. `AlternativeModal` avec recherche CIQUAL et comparaison macros.

---

### PLAN-N-005 - Duplication de plan (templates) [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** sauvegarder un plan comme template et le dupliquer,
**Afin de** je puisse réutiliser mes plans types.

**Critères d'acceptation** :

- ✓ Option "Sauvegarder comme template"
- ✓ Bibliothèque de templates
- ✓ Duplication vers un autre patient avec ajustement
- ✓ Modification sans affecter le template original

**Statut actuel** : Complet. Toggle template sur `MealPlanList` et `MealPlanEditor`, `TemplatePicker` modal.

---

### PLAN-N-006 - Publication du plan au patient [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** publier le plan quand il est prêt,
**Afin de** le patient puisse le consulter.

**Critères d'acceptation** :

- ✓ Passage de "brouillon" à "actif"
- ✓ Vérification que tous les jours ont au moins 3 repas
- ✓ Notification envoyée au patient
- ✓ Le plan précédent passe en "archivé"

**Statut actuel** : Complet. Validation 3 repas/jour, notification via `create_notification()` RPC, toast de succès.

---

### PLAN-N-007 - Traitement des demandes de modification [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** voir et répondre aux demandes de modification de plan,
**Afin de** je puisse ajuster selon les besoins.

**Critères d'acceptation** :

- ✓ Liste des demandes en attente avec motif
- ✓ Actions : Approuver, Refuser, Demander des précisions
- ✓ Notification au patient du résultat
- ✓ Historique des demandes traitées

**↔ Miroir patient** : PLAN-005

**Tables DB** : `plan_modification_requests`

**Statut actuel** : Complet. Notification via `create_notification()` RPC.

---

### PLAN-N-008 - Suivi de l'adhérence au plan [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir l'adhérence de mon patient au plan alimentaire,
**Afin de** je puisse évaluer s'il le suit correctement.

**Critères d'acceptation** :

- ✓ Pourcentage d'adhérence par jour et par semaine
- ✓ Comparaison repas enregistrés vs repas prévus
- ✓ Écarts nutritionnels vs plan
- ✓ Graphique d'adhérence sur la durée du plan

**Tables DB** : `plan_adherence`

**Statut actuel** : Complet. `AdherenceSection` avec stats, barre de progression, graphique Recharts.

---

### PLAN-N-009 - Génération de liste de courses [Could Have] ✅

**En tant que** nutritionniste,
**Je veux** générer une liste de courses à partir du plan,
**Afin de** je puisse la partager avec mon patient.

**Critères d'acceptation** :

- ✓ Génération pour 1 semaine
- ✓ Regroupement par catégorie d'aliment
- ✓ Quantités cumulées
- ✓ Envoi direct au patient via messagerie

**↔ Miroir patient** : PLAN-006

**Statut actuel** : Complet. `ShoppingListModal` avec bouton "Envoyer au patient".

---

## Epic 6 : Agenda & Disponibilités

> 11 user stories | ✅ 10 | ⚠️ 0 | ❌ 1

**Dépendances** : Aucune

**Wireframe** : Pages existantes : `/dashboard/nutritionist/agenda`, `/dashboard/nutritionist/disponibilites`

---

### AGENDA-N-001 - Consultation des demandes de RDV [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** voir les demandes de rendez-vous en attente,
**Afin de** je puisse les accepter ou les refuser.

**Critères d'acceptation** :

- ✓ Liste avec nom, type, date, mode
- ✓ Message du patient visible
- ✓ Badge "Nouvelle demande"
- ✓ Tri par date de demande

**Statut actuel** : Implémenté dans `/dashboard/nutritionist/agenda` (onglet "En attente").

---

### AGENDA-N-002 - Acceptation d'un rendez-vous [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** accepter une demande de rendez-vous,
**Afin de** le patient soit confirmé.

**Critères d'acceptation** :

- ✓ Bouton "Accepter" sur chaque demande
- ✓ Confirmation visuelle
- ✓ Notification envoyée au patient
- ✓ RDV passe en statut "confirmé"

---

### AGENDA-N-003 - Refus d'un rendez-vous [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** refuser une demande de rendez-vous avec un motif,
**Afin de** le patient comprenne et puisse reproposer.

**Critères d'acceptation** :

- ✓ Bouton "Refuser" sur chaque demande
- ✓ Modale avec champ motif obligatoire (min 5 car)
- ✓ Notification au patient avec le motif

---

### AGENDA-N-004 - Proposition d'un horaire alternatif [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** proposer un autre horaire au patient,
**Afin de** nous trouvions un créneau qui convient aux deux.

**Critères d'acceptation** :

- ✓ Bouton "Proposer un autre horaire"
- ✓ Calendrier avec mes disponibilités
- ✓ Grille horaire pour le jour sélectionné
- ✓ Message optionnel au patient
- ✓ Notification avec la contre-proposition

---

### AGENDA-N-005 - Vue des rendez-vous à venir [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** voir tous mes rendez-vous à venir,
**Afin de** je puisse m'organiser.

**Critères d'acceptation** :

- ✓ Liste chronologique avec date, patient, type, mode
- ✓ Badges de statut
- ✓ Clic pour détails
- ✓ Actions : modifier, annuler

---

### AGENDA-N-006 - Historique des rendez-vous passés [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** consulter l'historique de mes rendez-vous,
**Afin de** je puisse retrouver les détails d'une consultation passée.

**Critères d'acceptation** :

- ✓ Liste chronologique inversée
- ✓ Patient, type, date, durée, mode
- ✓ Statut (effectué, annulé, no-show)
- ✓ Lien vers le compte-rendu associé

---

### AGENDA-N-007 - Annulation d'un rendez-vous [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** annuler un rendez-vous confirmé,
**Afin de** je puisse gérer les imprévus.

**Critères d'acceptation** :

- ✓ Motif obligatoire (min 5 car)
- ✓ Confirmation requise
- ✓ Notification au patient
- ✓ RDV passe en statut "annulé par nutritionniste"

---

### AGENDA-N-008 - Gestion des disponibilités récurrentes [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** définir mes disponibilités hebdomadaires récurrentes,
**Afin de** les patients puissent voir mes créneaux libres.

**Point d'entrée** : Menu "Mes disponibilités" → `/dashboard/nutritionist/disponibilites`

**Critères d'acceptation** :

- ✓ Sélection des jours de la semaine
- ✓ Créneaux horaires multiples par jour
- ✓ Mode de consultation par créneau
- ✓ Type de consultation associé (optionnel)
- ✓ Affichage groupé par jour

---

### AGENDA-N-009 - Gestion des exceptions et blocages [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** ajouter des exceptions ou bloquer des dates spécifiques,
**Afin de** je puisse gérer les vacances et imprévus.

**Critères d'acceptation** :

- ✓ Exceptions : disponibilité ponctuelle
- ✓ Blocages : indisponibilité (vacances, maladie)
- ✓ Les blocages priment sur les récurrentes
- ✓ Affichage dans des sections séparées

---

### AGENDA-N-010 - Gestion des types de consultation [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** configurer mes types de consultation (durée, prix, mode),
**Afin de** les patients puissent choisir le format adapté.

**Point d'entrée** : Menu "Mes consultations" → `/dashboard/nutritionist/parametres/types-consultation`

**Critères d'acceptation** :

- ✓ CRUD complet
- ✓ Champs : nom, code, description, durée, prix, modes
- ✓ Réordonnancement drag-and-drop
- ✓ Code unique auto-généré

---

### AGENDA-N-011 - Marquage du statut post-RDV [Must Have] ❌

**En tant que** nutritionniste,
**Je veux** marquer le statut d'un RDV après son heure,
**Afin de** je puisse assurer le suivi et déclencher les workflows.

**Critères d'acceptation** :

- ✓ Après l'heure du RDV, notification pour marquer : Effectué / No-show / Reporté
- ✓ Si "Effectué", proposition de créer le compte-rendu (lien vers CONSULT-001)
- ✓ Si "No-show", option d'envoyer un message au patient
- ✓ Rappel si statut non marqué après 2h

**💡 Notes Claude Code** : Créer un composant `PostAppointmentModal`. Utiliser un cron job ou edge function pour détecter les RDV passés sans statut.

---

## Epic 7 : Messagerie nutritionniste

> 6 user stories | ✅ 5 | ⚠️ 0 | ❌ 1

**Dépendances** : Aucune

**Wireframe** : Réutiliser/adapter `nutrisensia-messaging-wireframe.jsx`

---

### MSG-N-001 - Liste des conversations [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** voir toutes mes conversations avec mes patients,
**Afin de** je puisse gérer mes échanges.

**Critères d'acceptation** :

- ✓ Liste avec aperçu du dernier message
- ✓ Avatar/initiales du patient
- ✓ Nombre de messages non lus (badge)
- ✓ Horodatage relatif
- ✓ Tri par message le plus récent

---

### MSG-N-002 - Envoi de messages texte [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** envoyer des messages à mes patients,
**Afin de** je puisse communiquer entre les consultations.

**Critères d'acceptation** :

- ✓ Champ de saisie avec envoi par bouton ou Entrée
- ✓ Message affiché immédiatement (optimistic UI)
- ✓ Horodatage visible
- ✓ Mise à jour en temps réel (Supabase Realtime)

---

### MSG-N-003 - Envoi de fichiers et images [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** envoyer des fichiers et images à mes patients,
**Afin de** je puisse partager des documents, plans ou ressources.

**Critères d'acceptation** :

- ✓ Upload d'images (JPG, PNG) et documents (PDF)
- ✓ Prévisualisation des images dans le chat
- ✓ Téléchargement par le patient
- ✓ Taille max par fichier

---

### MSG-N-004 - Réponses rapides (templates) [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** utiliser des réponses pré-définies,
**Afin de** je puisse répondre plus rapidement aux questions fréquentes.

**Critères d'acceptation** :

- ✓ Bouton d'accès aux réponses rapides
- ✓ Texte inséré dans le champ de saisie
- ✓ Modifiable avant envoi
- ✓ Templates adaptés au contexte nutritionniste

---

### MSG-N-005 - Recherche de conversations [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** rechercher un patient dans mes conversations,
**Afin de** je puisse retrouver rapidement un échange.

**Critères d'acceptation** :

- ✓ Barre de recherche "Rechercher un patient..."
- ✓ Filtrage en temps réel
- ✓ Message si aucun résultat

**💡 Notes Claude Code** : Préparer un index tsvector sur `messages.content` pour future évolution vers MSG-N-006.

---

### MSG-N-006 - Recherche dans l'historique des messages [Could Have] ❌

**En tant que** nutritionniste,
**Je veux** rechercher un mot-clé dans l'historique des messages,
**Afin de** je puisse retrouver une information partagée.

**Critères d'acceptation** :

- ✓ Recherche textuelle dans tous les messages
- ✓ Résultats avec contexte (message complet + conversation)
- ✓ Navigation directe vers le message trouvé

**💡 Notes Claude Code** : Utiliser PostgreSQL full-text search avec tsvector. Créer un index GIN sur `messages.content`.

---

## Epic 8 : Suivi & Progression patient

> 7 user stories | ✅ 7 | ⚠️ 0 | ❌ 0

**Dépendances** : Epic 5 (pour adhérence), Données patient côté BIO-001 à BIO-009

**Composants** : `src/components/nutritionist/suivi/` - 18 composants (SuiviTab, SuiviSynthese, TimeRangeSelector, sections par domaine, charts Recharts)

**Hook** : `src/hooks/useNutritionistSuivi.ts` - 6 queries + 2 mutations

**API** : `src/app/api/protected/nutritionist/patients/[id]/suivi/` (weight, measurements, wellbeing, activity, hydration, meals, meals/[mealId]/feedback)

**Types** : `src/types/nutritionist-suivi.ts`

**DB migration** : `database/migrations/add_meal_feedback.sql` (table `meal_feedback`)

**Implémenté** : 2026-02-21

---

### SUIVI-001 - Vue du poids et évolution [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir l'évolution du poids de mon patient,
**Afin de** je puisse évaluer l'efficacité du plan.

**Critères d'acceptation** :

- ✓ Graphique linéaire avec tous les points de pesée
- ✓ Ligne d'objectif visible
- ✓ Sélection de période
- ✓ Tendance calculée (moyenne mobile)
- ✓ Poids actuel, objectif, variation depuis le début

**↔ Miroir patient** : BIO-001 à BIO-003

**Statut actuel** : Complet. `WeightSection` + `WeightChart` (Recharts), objectif visible, tendance, sélection période via `TimeRangeSelector`.

---

### SUIVI-002 - Vue des mensurations [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir l'évolution des mensurations de mon patient,
**Afin de** je puisse suivre les changements corporels au-delà du poids.

**Critères d'acceptation** :

- ✓ Zones : tour de poitrine, taille, hanches, cuisses, bras
- ✓ Historique et graphique d'évolution
- ✓ Variation depuis la dernière mesure
- ✓ Variation depuis le début du suivi

**↔ Miroir patient** : BIO-004

**Statut actuel** : Complet. `MeasurementsSection` + `MeasurementChart`, 5 zones corporelles, variations.

---

### SUIVI-003 - Vue du bien-être et habitudes [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir les indicateurs de bien-être de mon patient,
**Afin de** je puisse identifier des corrélations avec la nutrition.

**Critères d'acceptation** :

- ✓ Niveau d'énergie (échelle 1-5) sur les 2 dernières semaines
- ✓ Heures de sommeil (graphique)
- ✓ Humeur (tendance)
- ✓ Digestion (tags récurrents)
- ✓ Corrélations détectées (insights)

**↔ Miroir patient** : BIO-005, BIO-006

**Statut actuel** : Complet. `WellbeingSection` + `WellbeingHeatmap`, énergie/sommeil/humeur/digestion.

---

### SUIVI-004 - Vue de l'activité physique [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir l'activité physique de mon patient,
**Afin de** je puisse adapter les apports caloriques.

**Critères d'acceptation** :

- ✓ Type d'activité, durée, intensité
- ✓ Calories brûlées estimées
- ✓ Résumé hebdomadaire
- ✓ Fréquence d'activité (nb séances/semaine)

**↔ Miroir patient** : BIO-007

**Statut actuel** : Complet. `ActivitySection` + `ActivityChart`, types/durée/intensité/calories, résumé hebdo.

---

### SUIVI-005 - Vue de l'hydratation [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir le suivi d'hydratation de mon patient,
**Afin de** je puisse vérifier qu'il s'hydrate correctement.

**Critères d'acceptation** :

- ✓ Moyenne quotidienne vs objectif
- ✓ Graphique hebdomadaire
- ✓ Alerte si moyenne < 50% de l'objectif

**↔ Miroir patient** : BIO-008, DASH-002

**Statut actuel** : Complet. `HydrationSection` + `HydrationChart`, moyenne vs objectif, alerte < 50%.

---

### SUIVI-006 - Vue synthétique multi-indicateurs [Could Have] ✅

**En tant que** nutritionniste,
**Je veux** voir un tableau de bord synthétique de tous les indicateurs de mon patient,
**Afin de** j'aie une vue globale de sa santé.

**Critères d'acceptation** :

- ✓ Dashboard avec widgets : poids, mensurations, bien-être, activité, hydratation, adhérence
- ✓ Période configurable
- ✓ Export en PDF pour inclusion dans le compte-rendu

**Statut actuel** : Complet. `SuiviSynthese` avec tous les widgets, `TimeRangeSelector` pour la période.

---

### SUIVI-007 - Vue des repas enregistrés par le patient [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir les repas enregistrés par mon patient avec détails,
**Afin de** je puisse évaluer son alimentation réelle.

**Critères d'acceptation** :

- ✓ Liste des repas avec détails (aliments, quantités, photos)
- ✓ Filtrage par date, type de repas
- ✓ Comparaison visuelle avec le plan prévu (côte à côte)
- ✓ Possibilité d'ajouter un commentaire/feedback sur un repas
- ✓ Indicateur d'écart nutritionnel vs plan

**↔ Miroir patient** : MEAL-001 à MEAL-016

**Statut actuel** : Complet. `MealsReviewSection` + `MealDetailModal` + `MealFeedbackForm` + `MacroComparisonChart`. Filtrage date/type, feedback nutritionniste, comparaison plan vs réel.

---

## Epic 9 : Contenu éducatif - Gestion

> 17 user stories | ✅ 13 | ⚠️ 0 | ❌ 4

**Dépendances** : Aucune

**Décisions UX (brainstorm 2026-03-22, révisé)** :

- Éditeur : Tiptap enrichi (colonnes, tableaux, images, embeds) + mode preview desktop/mobile
- Cours : hybride — sections internes + insertion de contenus existants (articles, vidéos, PDF) comme modules
- Catégories : 11 fixes + catégories custom du nutri
- Publication : Brouillon → Planifié → Publié → Archivé
- Publication planifiée : automatique via cron/Edge Function + notification au nutri
- Versioning : nouvelle version créée uniquement à la publication, auto-save écrase le brouillon courant
- Vue liste : toggle grille (cards) / liste (tableau)
- Vignette : obligatoire pour publier
- Assignation : publié = visible par tous + assignation spécifique possible
- Interactions patient : bookmark + like + commentaires publics
- Commentaires : publics avec mention d'avertissement (données personnelles → messagerie privée) + bouton "Message privé" contextuel
- Notifications : au choix du nutri (checkbox avant publication)
- Auto-save : sauvegarde automatique en arrière-plan (écrase brouillon, pas de version)
- Actions en masse : archiver, supprimer plusieurs contenus
- PDF : upload par le nutri, download par le patient
- Vidéos : URL uniquement (YouTube/Vimeo), pas d'upload fichier
- Recherche patient : full-text + filtres par type et catégorie

**Tables DB** : `educational_contents`, `content_views`, `content_saves`, `content_likes`, `content_comments`, `content_versions`, `content_assignments`, `custom_content_categories`

---

### CONTENT-N-001 - Liste et gestion des contenus [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** voir et gérer la liste de tous mes contenus éducatifs,
**Afin de** consulter, filtrer, trier et agir sur mes contenus efficacement.

**Critères d'acceptation** :

- ✓ Toggle vue grille (cards avec vignettes) / vue liste (tableau compact)
- ✓ Filtres par type (article, vidéo, guide PDF, cours), catégorie et statut
- ✓ Recherche full-text par titre ou mot-clé
- ✓ Tri par date, popularité (vues), titre
- ✓ Indication du nombre de vues, likes et sauvegardes par contenu
- ✓ Badge "Nouveau" automatique (< 7 jours)
- ✓ Actions en masse : archiver, supprimer (checkboxes + barre d'actions)
- ✓ Actions individuelles : modifier, publier, archiver, supprimer
- ✓ Pagination

---

### CONTENT-N-002 - Éditeur d'articles riche [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** créer et modifier des articles éducatifs avec un éditeur riche et modulable,
**Afin de** produire du contenu de qualité professionnelle pour mes patients.

**Critères d'acceptation** :

- ✓ Éditeur Tiptap avec toolbar complète : titres (H1-H3), gras, italique, souligné, barré, exposant, indice
- ✓ Listes à puces et numérotées
- ✓ Citations (blockquote)
- ✓ Liens hypertexte
- ✓ Images (upload + URL) avec redimensionnement
- ✓ Tableaux configurables (lignes, colonnes, bordures, fond de cellule, alignement, fusion)
- ✓ Disposition en colonnes (texte + image côte à côte)
- ✓ Embed vidéo YouTube/Vimeo inline
- ✓ Séparateurs horizontaux
- ✓ Undo/Redo
- ✓ Catégorie (fixes + custom)
- ✓ Résumé et points clés
- ✓ Tags libres
- ✓ Temps de lecture auto-calculé
- ✓ Vignette obligatoire (upload image)
- ✓ Auto-save toutes les 30s en arrière-plan
- ✓ Mode preview avec toggle desktop/mobile (voir l'article tel que le patient le verra)

**↔ Miroir patient** : CONTENT-004

**💡 Notes Claude Code** : Tiptap avec extensions StarterKit, Table, Image, Link, Youtube, Columns. Auto-save via mutation debounced.

---

### CONTENT-N-003 - Ajout de vidéo via URL [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** ajouter une vidéo éducative via un lien YouTube ou Vimeo,
**Afin de** mes patients puissent apprendre visuellement sans coût d'hébergement.

**Critères d'acceptation** :

- ✓ Saisie d'URL YouTube ou Vimeo
- ✓ Détection automatique du type (YouTube/Vimeo) et extraction de la miniature
- ✓ Titre, description
- ✓ Durée (saisie manuelle)
- ✓ Catégorie et tags
- ✓ Vignette obligatoire (auto-extraite ou upload)
- ✓ Player intégré en preview

**↔ Miroir patient** : CONTENT-005

---

### CONTENT-N-004 - Upload et partage de guide PDF [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** partager un guide PDF téléchargeable,
**Afin de** mes patients puissent le consulter hors-ligne.

**Critères d'acceptation** :

- ✓ Upload de fichier PDF (max 20 Mo)
- ✓ Stockage Supabase Storage (bucket dédié)
- ✓ Titre, description, nombre de pages
- ✓ Catégorie et tags
- ✓ Vignette obligatoire (upload)
- ✓ Téléchargement côté patient (pas de viewer intégré)

**↔ Miroir patient** : CONTENT-006

---

### CONTENT-N-005 - Création de cours éducatifs (hybride) [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** créer des cours éducatifs structurés combinant contenu original et contenus existants,
**Afin de** structurer l'apprentissage de mes patients étape par étape sans réécrire du contenu.

**Critères d'acceptation** :

- ✓ Titre du cours, description, vignette obligatoire
- ✓ Ajout de sections/chapitres ordonnés (drag & drop pour réordonner)
- ✓ Chaque section : soit un contenu riche original (éditeur Tiptap), soit un contenu existant inséré (article, vidéo, PDF)
- ✓ Insertion de contenus existants : sélecteur avec recherche parmi les contenus publiés du nutri
- ✓ Possibilité d'inclure des médias dans les sections originales (images, vidéos embed, PDF à télécharger)
- ✓ Table des matières auto-générée
- ✓ Progression du patient suivie par section (% de complétion)
- ✓ Catégorie et tags

**↔ Miroir patient** : CONTENT-008

---

### CONTENT-N-006 - Workflow de publication [Must Have] ✅

**En tant que** nutritionniste,
**Je veux** un workflow de publication complet avec planification,
**Afin de** contrôler quand et comment mes contenus sont visibles.

**Critères d'acceptation** :

- ✓ Statuts : Brouillon → Planifié → Publié → Archivé
- ✓ Publication immédiate (Brouillon → Publié)
- ✓ Publication planifiée : choix de date et heure, publication automatique via cron/Edge Function
- ✓ Notification au nutri quand un contenu planifié est publié automatiquement
- ✓ Archivage : le contenu n'est plus visible par les patients
- ✓ Dé-publication : Publié → Brouillon (pour modifications majeures)
- ✓ Checkbox "Notifier mes patients" avant publication (optionnelle)
- ✓ Historique des changements de statut

---

### CONTENT-N-007 - Versioning des contenus [Could Have] ✅

**En tant que** nutritionniste,
**Je veux** conserver un historique des versions de mes contenus,
**Afin de** pouvoir revenir à une version antérieure si nécessaire.

**Critères d'acceptation** :

- ✓ Chaque publication crée une nouvelle version (l'auto-save écrase le brouillon courant sans créer de version)
- ✓ Liste des versions avec date, numéro et résumé des modifications
- ✓ Comparaison entre deux versions (diff)
- ✓ Restauration d'une version antérieure
- ✓ Modification libre d'un contenu publié (crée une nouvelle version à la prochaine publication)

---

### CONTENT-N-008 - Catégories personnalisées [Should Have] ✅

**En tant que** nutritionniste,
**Je veux** créer mes propres catégories de contenu en plus des catégories prédéfinies,
**Afin de** organiser mes contenus selon ma spécialité et ma méthode.

**Critères d'acceptation** :

- ✓ 11 catégories prédéfinies non supprimables
- ✓ Ajout de catégories personnalisées (nom, couleur optionnelle)
- ✓ Modification et suppression des catégories custom (réassignation des contenus)
- ✓ Catégories custom visibles dans les filtres et le formulaire de création

**Tables DB** : `custom_content_categories`

---

### CONTENT-N-009 - Mise en avant de contenu [Could Have] ✅

**En tant que** nutritionniste,
**Je veux** mettre en avant certains contenus sur la page de mes patients,
**Afin qu'**ils voient les ressources les plus pertinentes en premier.

**Critères d'acceptation** :

- ✓ Marquage "À la une" (1 à 3 contenus max)
- ✓ Ordre de priorité configurable (drag & drop)
- ✓ Badge "Nouveau" automatique (< 7 jours)
- ✓ Section dédiée en haut de la page patient

**↔ Miroir patient** : CONTENT-003

---

### CONTENT-N-010 - Assignation de contenu à un patient [Could Have] ✅

**En tant que** nutritionniste,
**Je veux** assigner un contenu spécifique à un ou plusieurs patients,
**Afin de** personnaliser les recommandations éducatives par patient.

**Critères d'acceptation** :

- ✓ Par défaut, tout contenu publié est visible par tous les patients du nutri
- ✓ Possibilité d'assigner un contenu à des patients spécifiques (en plus de la visibilité globale)
- ✓ Badge "Recommandé pour vous" côté patient sur les contenus assignés
- ✓ Notification au patient lors de l'assignation (si activée)
- ✓ Vue nutri : liste des contenus assignés par patient

**Tables DB** : `content_assignments`

---

### CONTENT-N-011 - Statistiques d'engagement [Could Have] ✅

**En tant que** nutritionniste,
**Je veux** voir les statistiques d'engagement sur mes contenus,
**Afin de** savoir ce qui intéresse mes patients et adapter ma production.

**Critères d'acceptation** :

- ✓ Nombre de vues par contenu
- ✓ Nombre de likes et sauvegardes
- ✓ Contenus les plus populaires (classement)
- ✓ Taux de complétion des cours
- ✓ Nombre de commentaires
- ✓ Graphique d'évolution des vues dans le temps

---

### CONTENT-N-012 - Interactions patient : likes et bookmarks [Should Have] ✅

**En tant que** patient,
**Je veux** liker et sauvegarder les contenus qui m'intéressent,
**Afin de** les retrouver facilement et montrer mon intérêt au nutritionniste.

**Critères d'acceptation** :

- ✓ Bouton like (toggle) sur chaque contenu
- ✓ Bouton bookmark/sauvegarder (toggle)
- ✓ Page "Mes contenus sauvegardés" dans le dashboard patient
- ✓ Compteur de likes visible par le nutri

**Tables DB** : `content_likes`, `content_saves`

---

### CONTENT-N-013 - Commentaires sur les contenus [Could Have] ✅

**En tant que** patient,
**Je veux** commenter les contenus éducatifs,
**Afin de** poser des questions ou partager mon retour avec mon nutritionniste.

**Critères d'acceptation** :

- ✓ Zone de commentaire sous chaque contenu publié
- ✓ Commentaires publics : visibles par tous les patients du nutri
- ✓ Mention d'avertissement : "Les commentaires sont visibles par tous les patients. Pour des questions personnelles, utilisez la messagerie privée."
- ✓ Bouton "Message privé" à côté de la zone de commentaire, qui ouvre la messagerie avec le contenu en contexte (titre + lien du contenu pré-rempli dans le message)
- ✓ Le nutri peut répondre aux commentaires
- ✓ Notification au nutri lors d'un nouveau commentaire
- ✓ Le nutri peut supprimer un commentaire
- ✓ Pagination des commentaires

**Tables DB** : `content_comments`

---

### RECIPE-N-001 - CRUD des recettes [Must Have] ❌

**En tant que** nutritionniste,
**Je veux** créer, modifier et supprimer des recettes,
**Afin que** mes patients aient accès à des recettes validées nutritionnellement.

**Point d'entrée** : Menu "Recettes" → `/dashboard/nutritionist/recettes`

**Critères d'acceptation** :

- ✓ Page de gestion avec liste des recettes (grille cards + vue tableau)
- ✓ Filtres : catégorie, statut (brouillon/publié), difficulté, régime
- ✓ Recherche par titre
- ✓ Formulaire : titre, description, catégorie, difficulté, temps prep/cuisson, portions
- ✓ Ajout d'ingrédients via **recherche CIQUAL** (réutiliser `FoodSearchModal`)
- ✓ Ingrédients avec quantité, unité, groupement optionnel ("Pour la sauce", etc.)
- ✓ Ingrédients manuels (non-CIQUAL) avec saisie manuelle des macros
- ✓ Calcul automatique des macros/micros par portion en temps réel
- ✓ Étapes de préparation ordonnées (drag & drop)
- ✓ Upload de vignette obligatoire pour publier
- ✓ Tags libres et types de régime (sans gluten, végétarien, etc.)
- ✓ Champ "Astuces du chef"
- ✓ Duplication de recette
- ✓ Suppression avec confirmation

**↔ Miroir patient** : REC-001 à REC-007

**Tables DB** : `recipes`, `recipe_ingredients`, `recipe_steps`

**💡 Notes Claude Code** : Réutiliser `FoodSearchModal` et le moteur de calcul du plan alimentaire. Pattern identique à `ContentForm` pour le workflow brouillon/publié. Voir `docs/prompts/RECIPES_IMPLEMENTATION.md` pour l'architecture complète.

---

### RECIPE-N-002 - Publication de recettes [Must Have] ❌

**En tant que** nutritionniste,
**Je veux** publier mes recettes quand elles sont prêtes,
**Afin que** mes patients puissent les consulter.

**Critères d'acceptation** :

- ✓ Workflow : Brouillon → Publié
- ✓ Validation : titre, ≥ 1 ingrédient, ≥ 1 étape, vignette
- ✓ Dé-publication possible (Publié → Brouillon)
- ✓ Indicateur visuel du statut dans la liste
- ✓ Date de publication affichée

---

### RECIPE-N-003 - Recommandation de recette à un patient [Should Have] ❌

**En tant que** nutritionniste,
**Je veux** recommander une recette spécifique à un ou plusieurs patients,
**Afin de** personnaliser les conseils culinaires selon leur profil.

**Critères d'acceptation** :

- ✓ Bouton "Recommander" sur chaque recette publiée
- ✓ Modal de sélection de patients (multi-select avec recherche)
- ✓ Message personnalisé optionnel
- ✓ Lien optionnel vers un repas du plan alimentaire
- ✓ Badge "Recommandé pour vous" côté patient
- ✓ Notification au patient
- ✓ Vue nutri : liste des recommandations par recette et par patient

**Tables DB** : `recipe_assignments`

---

### RECIPE-N-004 - Statistiques d'engagement recettes [Could Have] ❌

**En tant que** nutritionniste,
**Je veux** voir les statistiques d'engagement sur mes recettes,
**Afin de** savoir ce qui plaît et adapter ma production.

**Critères d'acceptation** :

- ✓ Nombre de vues, favoris, notes moyennes par recette
- ✓ Classement des recettes les plus populaires
- ✓ Nombre de fois "cuisiné" (logged as meal)
- ✓ Panel de stats accessible depuis la liste et le détail

**Tables DB** : `recipe_favorites`, `recipe_ratings`

---

## Epic 10 : Profil professionnel & Paramètres

> 8 user stories | ✅ 0 | ⚠️ 0 | ❌ 8

**Dépendances** : Aucune

**Wireframe** : Adapter `nutrisensia-profile-settings-wireframe.jsx`

---

### PROF-N-001 - Modification du profil professionnel [Must Have] ❌

**En tant que** nutritionniste,
**Je veux** modifier mes informations professionnelles,
**Afin de** mon profil soit à jour pour mes patients.

**Point d'entrée** : Menu "Profil" → `/dashboard/nutritionist/profil`

**Critères d'acceptation** :

- ✓ Titre professionnel
- ✓ Biographie
- ✓ Spécialisations (liste à choix multiples)
- ✓ Certifications (ASCA, RME + numéros)
- ✓ Années d'expérience
- ✓ Langues parlées
- ✓ Photo professionnelle

**Tables DB** : `nutritionist_profiles`

---

### PROF-N-002 - Informations du cabinet [Must Have] ❌

**En tant que** nutritionniste,
**Je veux** configurer les informations de mon cabinet,
**Afin de** mes patients sachent où me trouver.

**Critères d'acceptation** :

- ✓ Nom du cabinet
- ✓ Adresse complète (rue, ville, code postal, pays)
- ✓ Téléphone du cabinet
- ✓ Horaires d'ouverture (informatif)

---

### PROF-N-003 - Configuration de la visioconférence [Should Have] ❌

**En tant que** nutritionniste,
**Je veux** configurer mes paramètres de visioconférence,
**Afin de** les consultations en ligne fonctionnent correctement.

**Critères d'acceptation** :

- ✓ Activation/désactivation de la visio
- ✓ Plateforme (Jitsi par défaut)
- ✓ Template de lien visio (optionnel)
- ✓ Test de connexion

---

### PROF-N-004 - Gestion de la capacité patient [Should Have] ❌

**En tant que** nutritionniste,
**Je veux** définir le nombre maximum de patients que j'accepte,
**Afin de** je puisse contrôler ma charge de travail.

**Critères d'acceptation** :

- ✓ Nombre max de patients (défaut : 50)
- ✓ Toggle "Accepte de nouveaux patients"
- ✓ Indication du nombre actuel vs maximum
- ✓ Lorsque max atteint, nouveaux patients voient "indisponible"

---

### PROF-N-005 - Changement de mot de passe [Must Have] ❌

**En tant que** nutritionniste,
**Je veux** changer mon mot de passe,
**Afin de** je puisse sécuriser mon compte.

**Critères d'acceptation** :

- ✓ Saisie de l'ancien mot de passe
- ✓ Saisie et confirmation du nouveau
- ✓ Validation des critères de sécurité
- ✓ Déconnexion des autres sessions

---

### PROF-N-006 - Préférences de notifications [Should Have] ❌

**En tant que** nutritionniste,
**Je veux** configurer mes notifications,
**Afin de** je reçoive uniquement les alertes pertinentes.

**Critères d'acceptation** :

- ✓ Toggle par type : nouveau RDV, message patient, signalement, modification plan
- ✓ Email et/ou push pour chaque type
- ✓ Heures calmes configurables
- ✓ Résumé quotidien optionnel

---

### PROF-N-007 - Préférences d'affichage [Could Have] ❌

**En tant que** nutritionniste,
**Je veux** configurer mes préférences d'affichage,
**Afin de** l'interface corresponde à mes habitudes.

**Critères d'acceptation** :

- ✓ Langue (FR, EN)
- ✓ Fuseau horaire (défaut: Europe/Zurich)
- ✓ Thème (clair, sombre, système)
- ✓ Premier jour de la semaine

---

### PROF-N-008 - Gestion des sessions actives [Should Have] ❌

**En tant que** nutritionniste,
**Je veux** voir et gérer mes sessions actives,
**Afin de** je puisse déconnecter les appareils non reconnus.

**Critères d'acceptation** :

- ✓ Liste des sessions avec appareil et localisation
- ✓ Session actuelle identifiée
- ✓ Déconnexion individuelle ou globale

---

## Correspondances Patient ↔ Nutritionniste

Features bidirectionnelles nécessitant une cohérence frontend + backend.

| Feature                 | Côté Patient                 | Côté Nutritionniste                | Statut     |
| ----------------------- | ---------------------------- | ---------------------------------- | ---------- |
| Anamnèse                | FILE-001 (lecture)           | DOSSIER-001/002 (lecture/écriture) | ✅ Fait    |
| Signalements            | FILE-002 (envoie)            | DOSSIER-004 (traite)               | ✅ Fait    |
| Questionnaires          | FILE-003 (remplit)           | DOSSIER-005/006 (crée/lit)         | ✅ Fait    |
| Documents               | FILE-004 (uploade)           | DOSSIER-007 (gère)                 | ✅ Fait    |
| Consultations           | FILE-005 (lecture)           | CONSULT-001/002 (écriture)         | ✅ Fait    |
| Objectifs               | FILE-006 (progression)       | DOSSIER-008/009 (définition)       | ✅ Fait    |
| Export dossier          | FILE-007 (exporte)           | DOSSIER-010 (exporte)              | ✅ Fait    |
| **Profil nutritionnel** | FILE-008 à 014 (consulte)    | CALC-001 à 009 (crée/gère)         | ✅ Fait    |
| Plan alimentaire        | PLAN-001 à 007 (consulte)    | PLAN-N-001 à 009 (crée)            | ✅ Fait    |
| Agenda                  | AGENDA-001 à 010 (réserve)   | AGENDA-N-001 à 011 (gère)          | ⚠️ Partiel |
| Messagerie              | MSG-001 à 010 (échange)      | MSG-N-001 à 006 (échange)          | ✅ Fait    |
| Contenu                 | CONTENT-001 à 008 (consulte) | CONTENT-N-001 à 013 (publie)       | ✅ Fait    |
| Recettes                | REC-001 à 007 (consulte)     | RECIPE-N-001 à 004 (gère)          | ❌ À faire |
| Suivi bio               | BIO-001 à 009 (saisit)       | SUIVI-001 à 006 (consulte)         | ✅ Fait    |
| Repas                   | MEAL-001 à 016 (enregistre)  | SUIVI-007 (consulte)               | ✅ Fait    |

---

## Légende des statuts

| Symbole | Signification                                                |
| ------- | ------------------------------------------------------------ |
| ✅      | Implémenté (frontend + backend fonctionnels)                 |
| ⚠️      | Partiellement implémenté (frontend ou backend, pas les deux) |
| ❌      | Non implémenté                                               |
| 💡      | Notes pour Claude Code                                       |
| ↔       | Référence croisée avec le dashboard patient                  |
| 🆕      | Nouveau dans cette version                                   |

---

## Annexe : Formules de calcul BMR

### Mifflin-St Jeor (1990) - Recommandée

```
Hommes : BMR = (10 × poids_kg) + (6.25 × taille_cm) - (5 × âge) + 5
Femmes : BMR = (10 × poids_kg) + (6.25 × taille_cm) - (5 × âge) - 161
```

### Harris-Benedict révisée (1984)

```
Hommes : BMR = (13.397 × poids) + (4.799 × taille) - (5.677 × âge) + 88.362
Femmes : BMR = (9.247 × poids) + (3.098 × taille) - (4.330 × âge) + 447.593
```

### Harris-Benedict originale (1919)

```
Hommes : BMR = 66.5 + (13.75 × poids) + (5.003 × taille) - (6.755 × âge)
Femmes : BMR = 655.1 + (9.563 × poids) + (1.850 × taille) - (4.676 × âge)
```

### Katch-McArdle

```
BMR = 370 + (21.6 × masse_maigre_kg)
où masse_maigre = poids × (1 - %graisse / 100)
```

---

## Annexe : Facteurs d'activité physique (PAL)

| Niveau            | Facteur | Description                              |
| ----------------- | ------- | ---------------------------------------- |
| Sédentaire        | 1.2     | Travail de bureau, peu ou pas d'exercice |
| Légèrement actif  | 1.375   | Exercice léger 1-3 jours/semaine         |
| Modérément actif  | 1.55    | Exercice modéré 3-5 jours/semaine        |
| Très actif        | 1.725   | Exercice intense 6-7 jours/semaine       |
| Extrêmement actif | 1.9     | Athlète, travail physique très intense   |

---

## Annexe : Ajustements caloriques cas spéciaux

| Cas          | Ajustement                             | Source |
| ------------ | -------------------------------------- | ------ |
| Grossesse T1 | +0 kcal                                | ANSES  |
| Grossesse T2 | +340 kcal                              | ANSES  |
| Grossesse T3 | +450 kcal                              | ANSES  |
| Allaitement  | +500 kcal                              | ANSES  |
| Sportif      | Selon PAL (1.725 à 1.9)                | -      |
| Senior (65+) | -100 à -200 kcal (métabolisme ralenti) | -      |
| Adolescent   | +200 à +400 kcal (croissance)          | -      |

---

## Annexe : Templates macros système

| Nom              | P   | G   | L   | Usage                      |
| ---------------- | --- | --- | --- | -------------------------- |
| Équilibré ANSES  | 15% | 50% | 35% | Standard santé             |
| Modéré protéines | 25% | 45% | 30% | Activité modérée           |
| High Protein     | 30% | 40% | 30% | Sportifs, masse musculaire |
| Low Carb         | 30% | 25% | 45% | Perte de poids             |
| Très Low Carb    | 30% | 15% | 55% | Restriction glucidique     |
| Keto             | 25% | 5%  | 70% | Régime cétogène            |
| Zone             | 30% | 40% | 30% | Méthode Zone               |
