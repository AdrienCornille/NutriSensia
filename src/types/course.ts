// Types pour l'Epic Cours educatifs (structure 3 niveaux)

// ─── Chapitres ───

export interface CourseChapter {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // Joined
  sections?: CourseSection[];
  quiz?: CourseQuiz | null;
}

export interface CourseChapterFromDB {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  sections?: CourseSectionFromDB[];
  quiz?: CourseQuizFromDB | null;
}

// ─── Sections ───

export type SectionType = 'blocks' | 'reference';

export interface CourseSection {
  id: string;
  chapterId: string;
  title: string;
  sortOrder: number;
  sectionType: SectionType;
  referencedContentId: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined
  blocks?: CourseSectionBlock[];
  referencedContent?: {
    id: string;
    title: string;
    type: string;
    thumbnailUrl: string | null;
    status: string;
  } | null;
  // Progress (patient side)
  completed?: boolean;
  completedAt?: string | null;
  timeSpentSeconds?: number;
}

export interface CourseSectionFromDB {
  id: string;
  chapter_id: string;
  title: string;
  sort_order: number;
  section_type: SectionType;
  referenced_content_id: string | null;
  created_at: string;
  updated_at: string;
  blocks?: CourseSectionBlockFromDB[];
  referenced_content?: {
    id: string;
    title: string;
    type: string;
    thumbnail_url: string | null;
    status: string;
  } | null;
}

// ─── Blocs de contenu ───

export type BlockType = 'rich_text' | 'video' | 'pdf' | 'image';

export interface CourseSectionBlock {
  id: string;
  sectionId: string;
  sortOrder: number;
  blockType: BlockType;
  body: string | null;
  mediaUrl: string | null;
  mediaType: 'youtube' | 'vimeo' | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSectionBlockFromDB {
  id: string;
  section_id: string;
  sort_order: number;
  block_type: BlockType;
  body: string | null;
  media_url: string | null;
  media_type: 'youtube' | 'vimeo' | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Quizz ───

export type QuestionType = 'mcq' | 'true_false';

export interface QuizOption {
  text: string;
  is_correct: boolean;
}

export interface CourseQuiz {
  id: string;
  courseId: string;
  chapterId: string | null;
  title: string;
  description: string | null;
  passingScore: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // Joined
  questions?: QuizQuestion[];
}

export interface CourseQuizFromDB {
  id: string;
  course_id: string;
  chapter_id: string | null;
  title: string;
  description: string | null;
  passing_score: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestionFromDB[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  sortOrder: number;
  questionType: QuestionType;
  questionText: string;
  options: QuizOption[];
  correctAnswer: boolean | null;
  explanation: string | null;
  createdAt: string;
}

export interface QuizQuestionFromDB {
  id: string;
  quiz_id: string;
  sort_order: number;
  question_type: QuestionType;
  question_text: string;
  options: QuizOption[];
  correct_answer: boolean | null;
  explanation: string | null;
  created_at: string;
}

// ─── Tentatives de quizz ───

export interface QuizAttemptAnswer {
  question_id: string;
  selected_options?: number[]; // for MCQ
  answer?: boolean; // for true_false
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAttemptAnswer[];
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface QuizAttemptFromDB {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: QuizAttemptAnswer[];
  score: number;
  passed: boolean;
  completed_at: string;
}

// ─── Prerequis ───

export interface CoursePrerequisite {
  id: string;
  courseId: string;
  prerequisiteCourseId: string;
  requireCompletion: boolean;
  requireQuizScore: boolean;
  minQuizScore: number;
  createdAt: string;
  // Joined
  prerequisiteCourse?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface CoursePrerequisiteFromDB {
  id: string;
  course_id: string;
  prerequisite_course_id: string;
  require_completion: boolean;
  require_quiz_score: boolean;
  min_quiz_score: number;
  created_at: string;
  prerequisite_course?: {
    id: string;
    title: string;
    status: string;
  };
}

// ─── Progression ───

export interface CourseProgress {
  id: string;
  courseId: string;
  sectionId: string;
  userId: string;
  completedAt: string | null;
  timeSpentSeconds: number;
  createdAt: string;
}

export interface CourseProgressFromDB {
  id: string;
  course_id: string;
  section_id: string;
  user_id: string;
  completed_at: string | null;
  time_spent_seconds: number;
  created_at: string;
}

// ─── Badges ───

export interface CourseBadge {
  id: string;
  courseId: string;
  badgeName: string;
  badgeIcon: string;
  pointsAwarded: number;
  createdAt: string;
}

export interface CourseBadgeFromDB {
  id: string;
  course_id: string;
  badge_name: string;
  badge_icon: string;
  points_awarded: number;
  created_at: string;
}

export interface EarnedBadge {
  id: string;
  badgeId: string;
  userId: string;
  earnedAt: string;
  // Joined
  badge?: CourseBadge;
}

export interface EarnedBadgeFromDB {
  id: string;
  badge_id: string;
  user_id: string;
  earned_at: string;
  badge?: CourseBadgeFromDB;
}

// ─── Transformers ───

export function transformChapterFromDB(ch: CourseChapterFromDB): CourseChapter {
  return {
    id: ch.id,
    courseId: ch.course_id,
    title: ch.title,
    description: ch.description,
    sortOrder: ch.sort_order,
    createdAt: ch.created_at,
    updatedAt: ch.updated_at,
    sections: ch.sections?.map(transformSectionFromDB),
    quiz: ch.quiz ? transformQuizFromDB(ch.quiz) : null,
  };
}

export function transformSectionFromDB(s: CourseSectionFromDB): CourseSection {
  return {
    id: s.id,
    chapterId: s.chapter_id,
    title: s.title,
    sortOrder: s.sort_order,
    sectionType: s.section_type,
    referencedContentId: s.referenced_content_id,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    blocks: s.blocks?.map(transformBlockFromDB),
    referencedContent: s.referenced_content
      ? {
          id: s.referenced_content.id,
          title: s.referenced_content.title,
          type: s.referenced_content.type,
          thumbnailUrl: s.referenced_content.thumbnail_url,
          status: s.referenced_content.status,
        }
      : null,
  };
}

export function transformBlockFromDB(
  b: CourseSectionBlockFromDB
): CourseSectionBlock {
  return {
    id: b.id,
    sectionId: b.section_id,
    sortOrder: b.sort_order,
    blockType: b.block_type,
    body: b.body,
    mediaUrl: b.media_url,
    mediaType: b.media_type,
    fileUrl: b.file_url,
    fileName: b.file_name,
    fileSize: b.file_size,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

export function transformQuizFromDB(q: CourseQuizFromDB): CourseQuiz {
  return {
    id: q.id,
    courseId: q.course_id,
    chapterId: q.chapter_id,
    title: q.title,
    description: q.description,
    passingScore: q.passing_score,
    sortOrder: q.sort_order,
    createdAt: q.created_at,
    updatedAt: q.updated_at,
    questions: q.questions?.map(transformQuestionFromDB),
  };
}

export function transformQuestionFromDB(q: QuizQuestionFromDB): QuizQuestion {
  return {
    id: q.id,
    quizId: q.quiz_id,
    sortOrder: q.sort_order,
    questionType: q.question_type,
    questionText: q.question_text,
    options: q.options || [],
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    createdAt: q.created_at,
  };
}

export function transformPrerequisiteFromDB(
  p: CoursePrerequisiteFromDB
): CoursePrerequisite {
  return {
    id: p.id,
    courseId: p.course_id,
    prerequisiteCourseId: p.prerequisite_course_id,
    requireCompletion: p.require_completion,
    requireQuizScore: p.require_quiz_score,
    minQuizScore: p.min_quiz_score,
    createdAt: p.created_at,
    prerequisiteCourse: p.prerequisite_course,
  };
}

export function transformBadgeFromDB(b: CourseBadgeFromDB): CourseBadge {
  return {
    id: b.id,
    courseId: b.course_id,
    badgeName: b.badge_name,
    badgeIcon: b.badge_icon,
    pointsAwarded: b.points_awarded,
    createdAt: b.created_at,
  };
}

// ─── Vue complete d'un cours (patient) ───

export interface CourseFullView {
  id: string;
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  chapters: CourseChapter[];
  finalQuiz: CourseQuiz | null;
  badge: CourseBadge | null;
  prerequisites: CoursePrerequisite[];
  // Player state
  totalSections: number;
  completedSections: number;
  completionPercent: number;
  nextSectionId: string | null;
}

// ─── Suivi nutritionniste ───

export interface PatientCourseProgress {
  patientId: string;
  patientName: string;
  completionPercent: number;
  totalTimeSpentSeconds: number;
  sectionsCompleted: number;
  totalSections: number;
  lastActivityAt: string | null;
  quizScores: {
    quizId: string;
    quizTitle: string;
    bestScore: number;
    passed: boolean;
    attempts: number;
  }[];
  badgeEarned: boolean;
}

export interface SectionProgressDetail {
  sectionId: string;
  sectionTitle: string;
  chapterTitle: string;
  completed: boolean;
  completedAt: string | null;
  timeSpentSeconds: number;
}
