// Types pour l'Epic 9 : Contenu educatif

export type ContentType = 'article' | 'video' | 'guide' | 'podcast' | 'course';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type ContentCategory =
  | 'nutrition_basics'
  | 'healthy_recipes'
  | 'weight_management'
  | 'sports_nutrition'
  | 'digestive_health'
  | 'mental_wellbeing'
  | 'food_allergies'
  | 'supplements'
  | 'meal_planning'
  | 'lifestyle'
  | 'other';

export interface EducationalContent {
  id: string;
  nutritionistId: string;
  type: ContentType;
  category: ContentCategory;
  customCategoryId: string | null;
  customCategoryName: string | null;
  customCategoryColor: string | null;
  status: ContentStatus;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  thumbnailUrl: string | null;
  readingTimeMinutes: number | null;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  pageCount: number | null;
  tags: string[];
  keyPoints: string[];
  isFeatured: boolean;
  featuredOrder: number;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  viewCount: number;
  saveCount: number;
  likeCount: number;
  commentCount: number;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface EducationalContentFromDB {
  id: string;
  nutritionist_id: string;
  type: ContentType;
  category: ContentCategory;
  custom_category_id: string | null;
  custom_category_name?: string | null;
  custom_category_color?: string | null;
  status: ContentStatus;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  media_url: string | null;
  media_type: string | null;
  thumbnail_url: string | null;
  reading_time_minutes: number | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  page_count: number | null;
  tags: string[];
  key_points: string[];
  is_featured: boolean;
  featured_order: number;
  published_at: string | null;
  scheduled_publish_at: string | null;
  view_count: number;
  save_count: number;
  like_count: number;
  comment_count: number;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export function transformContentFromDB(
  content: EducationalContentFromDB
): EducationalContent {
  return {
    id: content.id,
    nutritionistId: content.nutritionist_id,
    type: content.type,
    category: content.category,
    customCategoryId: content.custom_category_id || null,
    customCategoryName: content.custom_category_name || null,
    customCategoryColor: content.custom_category_color || null,
    status: content.status,
    title: content.title,
    slug: content.slug,
    summary: content.summary,
    body: content.body,
    mediaUrl: content.media_url,
    mediaType: content.media_type,
    thumbnailUrl: content.thumbnail_url,
    readingTimeMinutes: content.reading_time_minutes,
    durationSeconds: content.duration_seconds,
    fileSizeBytes: content.file_size_bytes,
    pageCount: content.page_count,
    tags: content.tags || [],
    keyPoints: content.key_points || [],
    isFeatured: content.is_featured,
    featuredOrder: content.featured_order ?? 0,
    publishedAt: content.published_at,
    scheduledPublishAt: content.scheduled_publish_at,
    viewCount: content.view_count ?? 0,
    saveCount: content.save_count ?? 0,
    likeCount: content.like_count ?? 0,
    commentCount: content.comment_count ?? 0,
    currentVersion: content.current_version ?? 0,
    createdAt: content.created_at,
    updatedAt: content.updated_at,
  };
}

// Labels en francais
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article: 'Article',
  video: 'Vidéo',
  guide: 'Guide PDF',
  podcast: 'Podcast',
  course: 'Cours',
};

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Planifié',
  published: 'Publié',
  archived: 'Archivé',
};

export const CONTENT_CATEGORY_LABELS: Record<ContentCategory, string> = {
  nutrition_basics: 'Bases de la nutrition',
  healthy_recipes: 'Recettes saines',
  weight_management: 'Gestion du poids',
  sports_nutrition: 'Nutrition sportive',
  digestive_health: 'Santé digestive',
  mental_wellbeing: 'Bien-être mental',
  food_allergies: 'Allergies alimentaires',
  supplements: 'Compléments alimentaires',
  meal_planning: 'Planification des repas',
  lifestyle: 'Mode de vie',
  other: 'Autre',
};

// ─── Types pour les interactions ───

export interface ContentVersion {
  id: string;
  contentId: string;
  versionNumber: number;
  title: string;
  summary: string | null;
  body: string | null;
  tags: string[];
  keyPoints: string[];
  changeSummary: string | null;
  createdAt: string;
  createdBy: string;
}

export interface ContentComment {
  id: string;
  contentId: string;
  userId: string;
  parentId: string | null;
  body: string;
  isNutritionist: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  userName?: string;
  userAvatar?: string;
  replies?: ContentComment[];
}

export interface ContentAssignment {
  id: string;
  contentId: string;
  patientId: string;
  assignedBy: string;
  note: string | null;
  assignedAt: string;
  // Joined fields
  patientName?: string;
  contentTitle?: string;
}

export interface ContentStats {
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
  totalComments: number;
  mostPopular: { id: string; title: string; viewCount: number }[];
  viewsOverTime: { date: string; views: number }[];
}
