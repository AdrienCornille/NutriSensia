// Types for Exclusive Content feature

export type ContentType = 'article' | 'video' | 'guide' | 'podcast';

export type ContentCategory =
  | 'all'
  | 'nutrition-basics'
  | 'recipes-tips'
  | 'psychology'
  | 'sport'
  | 'health'
  | 'lifestyle';

export type ContentTab = 'all' | 'articles' | 'videos' | 'guides' | 'podcasts' | 'saved';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  image: string;
  category: ContentCategory;
  author: string;
  authorAvatar?: string;
  date: string;
  isNew: boolean;
  isSaved: boolean;
  // Type-specific fields
  readTime?: string; // For articles
  duration?: string; // For videos and podcasts
  pages?: number; // For guides
  downloadable?: boolean; // For guides
  views?: number;
  listens?: number;
}

export interface FeaturedContent extends Content {
  isFeatured: true;
}

export interface ProgressCourse {
  id: string;
  title: string;
  description?: string;
  modules: number;
  completedModules: number;
  image: string;
}

export interface CategoryConfig {
  id: ContentCategory;
  label: string;
  color: string;
  bgColor: string;
}

export interface TabConfig {
  id: ContentTab;
  label: string;
  icon: string;
}

// State management
export interface ContentState {
  activeTab: ContentTab;
  activeCategory: ContentCategory;
  searchQuery: string;
  savedIds: string[];
  showContentModal: boolean;
  showVideoPlayer: boolean;
  selectedContent: Content | null;
}

export type ContentAction =
  | { type: 'SET_ACTIVE_TAB'; payload: ContentTab }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: ContentCategory }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'TOGGLE_SAVE'; payload: string }
  | { type: 'OPEN_CONTENT_MODAL'; payload: Content }
  | { type: 'CLOSE_CONTENT_MODAL' }
  | { type: 'OPEN_VIDEO_PLAYER'; payload: Content }
  | { type: 'CLOSE_VIDEO_PLAYER' }
  | { type: 'LOAD_SAVED_IDS'; payload: string[] };

export const contentInitialState: ContentState = {
  activeTab: 'all',
  activeCategory: 'all',
  searchQuery: '',
  savedIds: [],
  showContentModal: false,
  showVideoPlayer: false,
  selectedContent: null,
};

export function contentReducer(state: ContentState, action: ContentAction): ContentState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'CLEAR_SEARCH':
      return { ...state, searchQuery: '' };
    case 'TOGGLE_SAVE':
      return {
        ...state,
        savedIds: state.savedIds.includes(action.payload)
          ? state.savedIds.filter((id) => id !== action.payload)
          : [...state.savedIds, action.payload],
      };
    case 'OPEN_CONTENT_MODAL':
      return { ...state, showContentModal: true, selectedContent: action.payload };
    case 'CLOSE_CONTENT_MODAL':
      return { ...state, showContentModal: false, selectedContent: null };
    case 'OPEN_VIDEO_PLAYER':
      return { ...state, showVideoPlayer: true, selectedContent: action.payload };
    case 'CLOSE_VIDEO_PLAYER':
      return { ...state, showVideoPlayer: false, selectedContent: null };
    case 'LOAD_SAVED_IDS':
      return { ...state, savedIds: action.payload };
    default:
      return state;
  }
}

// Configuration
export const tabsConfig: TabConfig[] = [
  { id: 'all', label: 'Tout', icon: 'Library' },
  { id: 'articles', label: 'Articles', icon: 'FileText' },
  { id: 'videos', label: 'Vidéos', icon: 'Video' },
  { id: 'guides', label: 'Guides', icon: 'BookOpen' },
  { id: 'podcasts', label: 'Podcasts', icon: 'Mic' },
  { id: 'saved', label: 'Sauvegardés', icon: 'Bookmark' },
];

export const categoriesConfig: CategoryConfig[] = [
  { id: 'nutrition-basics', label: 'Bases de la nutrition', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { id: 'recipes-tips', label: 'Astuces cuisine', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { id: 'psychology', label: 'Psychologie alimentaire', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { id: 'sport', label: 'Sport & nutrition', color: 'text-green-700', bgColor: 'bg-green-100' },
  { id: 'health', label: 'Santé', color: 'text-red-700', bgColor: 'bg-red-100' },
  { id: 'lifestyle', label: 'Mode de vie', color: 'text-teal-700', bgColor: 'bg-teal-100' },
];

// Helper functions
export function filterContent(
  contents: Content[],
  tab: ContentTab,
  category: ContentCategory,
  searchQuery: string,
  savedIds: string[]
): Content[] {
  return contents.filter((content) => {
    // Filter by tab (type)
    if (tab === 'saved') {
      if (!savedIds.includes(content.id)) return false;
    } else if (tab !== 'all') {
      const typeMap: Record<string, ContentType> = {
        articles: 'article',
        videos: 'video',
        guides: 'guide',
        podcasts: 'podcast',
      };
      if (content.type !== typeMap[tab]) return false;
    }

    // Filter by category
    if (category !== 'all' && content.category !== category) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        content.title.toLowerCase().includes(query) ||
        content.description.toLowerCase().includes(query) ||
        content.author.toLowerCase().includes(query)
      );
    }

    return true;
  });
}

export function getTypeIcon(type: ContentType): string {
  switch (type) {
    case 'video':
      return 'Video';
    case 'article':
      return 'FileText';
    case 'guide':
      return 'BookOpen';
    case 'podcast':
      return 'Mic';
    default:
      return 'File';
  }
}

export function getTypeLabel(type: ContentType): string {
  switch (type) {
    case 'video':
      return 'Vidéo';
    case 'article':
      return 'Article';
    case 'guide':
      return 'Guide';
    case 'podcast':
      return 'Podcast';
    default:
      return 'Contenu';
  }
}

export function getCategoryConfig(categoryId: ContentCategory): CategoryConfig | undefined {
  return categoriesConfig.find((c) => c.id === categoryId);
}
