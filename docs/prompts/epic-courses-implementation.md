# Prompt : Implémentation Epic Cours éducatifs

> Copier-coller ce prompt dans une nouvelle session Claude Code.

---

## Contexte

Implémente l'Epic "Cours éducatifs" dans NutriSensia. Cette epic a été séparée de l'Epic 9 (Contenu éducatif) car le scope est trop large pour une simple story. L'Epic 9 est déjà implémentée (12 stories sur 13, tout sauf CONTENT-N-005).

Le type `course` existe déjà dans le code TypeScript (`src/types/educational-content.ts`) et dans le schéma Zod (`src/lib/api-schemas.ts`). La valeur enum PostgreSQL `course` a déjà été ajoutée via `database/migrations/add_course_content_type.sql`.

**Important** : Une implémentation simpliste existe déjà et doit être REMPLACÉE :

- `database/migrations/create_course_sections.sql` → à supprimer/remplacer
- `src/hooks/useCourseSections.ts` → à remplacer
- `src/components/nutritionist/content/CourseEditor.tsx` → à remplacer
- API routes `src/app/api/protected/nutritionist/content/[contentId]/sections/` → à remplacer

## Décisions UX/Architecture (validées le 2026-03-22)

### Structure : Cours → Chapitres → Sections (3 niveaux)

```
Cours "Nutrition de base"
├── Chapitre 1 : "Les macronutriments"
│   ├── Section 1.1 : "Protéines" (texte riche + vidéo YouTube intégrée)
│   ├── Section 1.2 : "Glucides" (texte riche + PDF téléchargeable)
│   ├── Section 1.3 : "Lipides" (référence à un article déjà publié)
│   └── Quizz chapitre 1 (3 QCM + 2 Vrai/Faux)
├── Chapitre 2 : "Les micronutriments"
│   ├── Section 2.1 : "Vitamines" (texte riche)
│   ├── Section 2.2 : "Minéraux" (vidéo + texte)
│   └── Quizz chapitre 2
└── Quizz final du cours
```

### Contenu des sections

- Une section peut mixer PLUSIEURS blocs : texte riche (Tiptap) + vidéo intégrée (YouTube/Vimeo) + PDF téléchargeable, le tout dans la même section
- Une section peut aussi être une RÉFÉRENCE à un contenu existant déjà publié (article, vidéo, guide PDF) — ce contenu reste visible dans la liste générale ET dans le cours

### Progression patient

- **Linéaire séquentielle** : la section N+1 est bloquée tant que N n'est pas terminée
- **Complétion** : bouton manuel "Marquer comme terminé" cliqué par le patient
- **Reprise** : page d'accueil du cours avec barre de progression visible + bouton "Reprendre où j'en étais" (redirige vers la dernière section non terminée)

### Quizz

- **Format** : QCM (une ou plusieurs bonnes réponses) + Vrai/Faux, correction automatique
- **Placement** : un quizz optionnel en fin de chaque chapitre + un quizz final récapitulatif en fin de cours
- **Score** : affiché au patient après soumission, stocké pour le suivi nutritionniste

### Prérequis entre cours

- **Paramétrable** par le nutritionniste lors de la création d'un cours
- Options : 100% de progression du cours prérequis ET/OU score minimum au quizz final (ex: ≥ 70%)
- Un cours peut avoir 0 à N prérequis

### Templates de cours

- Dupliquer un cours existant (structure + contenu des sections, sans les données de progression)
- Le nutritionniste peut ensuite modifier le cours dupliqué

### Badges

- Badge simple : icône + titre affiché dans le profil patient
- Attribué automatiquement à la complétion du cours (100% des sections terminées + quizz final passé)
- Intégré au système de gamification existant (points via `add_points()`, niveaux)

### Suivi nutritionniste

- Vue détaillée par patient : chaque section avec statut terminé/non terminé + date de complétion
- Temps passé par section (tracking côté client, envoyé au serveur)
- Graphe de progression dans le temps
- Score aux quizz par chapitre

## Schéma DB proposé

```sql
-- Chapitres d'un cours
course_chapters (
  id UUID PK,
  course_id UUID FK → educational_contents(id),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  created_at, updated_at
)

-- Sections d'un chapitre
course_sections (
  id UUID PK,
  chapter_id UUID FK → course_chapters(id),
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  -- Type : 'blocks' (contenu original multi-blocs) ou 'reference' (lien vers contenu existant)
  section_type TEXT NOT NULL CHECK ('blocks', 'reference'),
  -- Pour 'reference' : lien vers educational_contents
  referenced_content_id UUID FK → educational_contents(id) NULLABLE,
  -- Pour 'blocks' : contenu stocké dans course_section_blocks
  created_at, updated_at
)

-- Blocs de contenu dans une section (texte riche, vidéo, PDF)
course_section_blocks (
  id UUID PK,
  section_id UUID FK → course_sections(id),
  sort_order INTEGER NOT NULL,
  block_type TEXT NOT NULL CHECK ('rich_text', 'video', 'pdf', 'image'),
  -- Pour 'rich_text' : HTML Tiptap
  body TEXT,
  -- Pour 'video' : URL YouTube/Vimeo
  media_url TEXT,
  media_type TEXT, -- 'youtube', 'vimeo'
  -- Pour 'pdf'/'image' : URL Supabase Storage
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at, updated_at
)

-- Quizz (fin de chapitre ou fin de cours)
course_quizzes (
  id UUID PK,
  course_id UUID FK → educational_contents(id),
  chapter_id UUID FK → course_chapters(id) NULLABLE, -- NULL = quizz final du cours
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70, -- score minimum en %
  sort_order INTEGER NOT NULL,
  created_at, updated_at
)

-- Questions d'un quizz
quiz_questions (
  id UUID PK,
  quiz_id UUID FK → course_quizzes(id),
  sort_order INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK ('mcq', 'true_false'),
  question_text TEXT NOT NULL,
  -- Pour MCQ : options en JSONB [{text, is_correct}]
  options JSONB NOT NULL DEFAULT '[]',
  -- Pour Vrai/Faux : la bonne réponse
  correct_answer BOOLEAN,
  explanation TEXT, -- explication affichée après réponse
  created_at
)

-- Tentatives de quizz par un patient
quiz_attempts (
  id UUID PK,
  quiz_id UUID FK → course_quizzes(id),
  user_id UUID FK → auth.users(id),
  answers JSONB NOT NULL, -- [{question_id, selected_options/answer}]
  score INTEGER NOT NULL, -- pourcentage 0-100
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL
)

-- Prérequis entre cours
course_prerequisites (
  id UUID PK,
  course_id UUID FK → educational_contents(id),
  prerequisite_course_id UUID FK → educational_contents(id),
  require_completion BOOLEAN DEFAULT TRUE, -- 100% progression requise
  require_quiz_score BOOLEAN DEFAULT FALSE,
  min_quiz_score INTEGER DEFAULT 70, -- score minimum au quizz final
  UNIQUE (course_id, prerequisite_course_id)
)

-- Progression patient (section par section)
course_progress (
  id UUID PK,
  course_id UUID FK → educational_contents(id),
  section_id UUID FK → course_sections(id),
  user_id UUID FK → auth.users(id),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0, -- temps cumulé passé
  UNIQUE (section_id, user_id)
)

-- Badges de complétion
course_badges (
  id UUID PK,
  course_id UUID FK → educational_contents(id) UNIQUE,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL, -- emoji ou URL icône
  points_awarded INTEGER DEFAULT 50,
  created_at
)

-- Badges obtenus par les patients
earned_badges (
  id UUID PK,
  badge_id UUID FK → course_badges(id),
  user_id UUID FK → auth.users(id),
  earned_at TIMESTAMPTZ NOT NULL,
  UNIQUE (badge_id, user_id)
)
```

## API Routes à créer

### Côté nutritionniste

```
# Chapitres
GET/POST  /api/protected/nutritionist/content/[contentId]/chapters
PATCH/DELETE /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]
PATCH  /api/protected/nutritionist/content/[contentId]/chapters/reorder  (body: {chapter_ids})

# Sections
GET/POST  /api/protected/nutritionist/content/[contentId]/chapters/[chapterId]/sections
PATCH/DELETE .../sections/[sectionId]
PATCH  .../sections/reorder

# Blocs de section
GET/POST  .../sections/[sectionId]/blocks
PATCH/DELETE .../blocks/[blockId]
PATCH  .../blocks/reorder

# Quizz
GET/POST  /api/protected/nutritionist/content/[contentId]/quizzes
PATCH/DELETE .../quizzes/[quizId]

# Questions
GET/POST  .../quizzes/[quizId]/questions
PATCH/DELETE .../questions/[questionId]

# Prérequis
GET/POST/DELETE  /api/protected/nutritionist/content/[contentId]/prerequisites

# Badge
GET/POST/PATCH  /api/protected/nutritionist/content/[contentId]/badge

# Suivi progression patients
GET  /api/protected/nutritionist/content/[contentId]/progress  (tous les patients)
GET  /api/protected/nutritionist/content/[contentId]/progress/[patientId]  (détail)

# Duplication
POST  /api/protected/nutritionist/content/[contentId]/duplicate
```

### Côté patient

```
# Vue du cours
GET  /api/protected/content/[contentId]/course  (chapitres + sections + progression)

# Progression
POST  /api/protected/content/[contentId]/sections/[sectionId]/complete
POST  /api/protected/content/[contentId]/sections/[sectionId]/time  (body: {seconds})

# Quizz
GET   /api/protected/content/[contentId]/quizzes/[quizId]  (questions)
POST  /api/protected/content/[contentId]/quizzes/[quizId]/submit  (body: {answers})
GET   /api/protected/content/[contentId]/quizzes/[quizId]/result

# Prérequis check
GET  /api/protected/content/[contentId]/can-access  (vérifie prérequis)
```

## Composants à créer

### Côté nutritionniste (`src/components/nutritionist/content/course/`)

1. **CourseBuilder.tsx** — Vue principale d'édition du cours (liste des chapitres, drag & drop)
2. **ChapterEditor.tsx** — Édition d'un chapitre (titre, description, liste des sections)
3. **SectionEditor.tsx** — Édition d'une section (blocs de contenu ou référence)
4. **BlockEditor.tsx** — Éditeur de bloc individuel (texte riche Tiptap / vidéo URL / upload PDF)
5. **ContentPicker.tsx** — Modal pour sélectionner un contenu existant à référencer
6. **QuizEditor.tsx** — Éditeur de quizz (ajout/édition de questions QCM et V/F)
7. **QuestionEditor.tsx** — Éditeur de question individuelle
8. **PrerequisiteManager.tsx** — Gestion des prérequis (sélection cours + paramètres)
9. **BadgeEditor.tsx** — Configuration du badge (nom, icône, points)
10. **CourseProgressDashboard.tsx** — Tableau de suivi des patients (progression + temps + scores)

### Côté patient (`src/components/patient/course/`)

1. **CourseOverview.tsx** — Page d'accueil du cours (table des matières, progression, bouton reprendre)
2. **ChapterView.tsx** — Vue d'un chapitre avec ses sections et leur état
3. **SectionView.tsx** — Vue d'une section (rendu des blocs, bouton "Terminé")
4. **QuizView.tsx** — Interface de passage du quizz
5. **QuizResult.tsx** — Affichage résultat + corrections
6. **CourseLockedMessage.tsx** — Message quand un cours a des prérequis non remplis
7. **CourseBadge.tsx** — Affichage du badge obtenu

### Hooks (`src/hooks/`)

- **useCourseBuilder.ts** — Hooks CRUD pour chapitres, sections, blocs, quizz
- **usePatientCourse.ts** — Hooks pour la vue patient (progression, quizz, prérequis)
- **useCourseProgress.ts** — Hooks pour le suivi nutritionniste

## Patterns du projet à respecter

- **API** : `verifyAuth()` + `apiResponse.*` de `@/lib/api-auth`, `createClient()` de `@/lib/supabase/server`
- **Hooks** : React Query avec `credentials: 'include'`, invalidation des queries associées
- **Styling** : Tailwind avec couleur primaire `#1B998B`, design system NutriSensia
- **i18n** : Textes en français dans le code (pas de fichier de traduction pour le dashboard)
- **RLS** : Toutes les tables avec Row Level Security, policies basées sur `nutritionist_profiles.user_id = auth.uid()` pour les nutritionnistes

## Ordre d'implémentation suggéré

1. **Migration DB** : Créer toutes les tables (supprimer l'ancien `create_course_sections.sql`)
2. **API chapitres + sections + blocs** (CRUD + reorder)
3. **CourseBuilder + ChapterEditor + SectionEditor + BlockEditor** (côté nutritionniste)
4. **API quizz + questions**
5. **QuizEditor + QuestionEditor**
6. **API progression patient + vue cours**
7. **CourseOverview + SectionView + QuizView** (côté patient)
8. **API prérequis + templates + badges**
9. **PrerequisiteManager + BadgeEditor + CourseProgressDashboard**
10. **Duplication de cours**

Explore d'abord le code existant avant d'implémenter. La mémoire projet dans `.claude/projects/` contient les détails de l'Epic 9 et les décisions UX dans `epic_courses_decisions.md`.
