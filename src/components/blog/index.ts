/**
 * Composants du blog NutriSensia
 *
 * Ce module exporte tous les composants utilisés pour créer
 * un système de blog complet avec SEO optimisé.
 */

export { BlogCard } from './BlogCard';
export type { BlogCardProps } from './BlogCard';

export { BlogList } from './BlogList';
export type { BlogListProps } from './BlogList';

export { BlogPost } from './BlogPost';
export type { BlogPostProps } from './BlogPost';

export { BlogNavigation } from './BlogNavigation';
export type { BlogNavigationProps } from './BlogNavigation';

export { BlogSidebar } from './BlogSidebar';
export type { BlogSidebarProps } from './BlogSidebar';

export { BlogPostActions } from './BlogPostActions';
export type { BlogPostActionsProps } from './BlogPostActions';

// Réexports des utilitaires MDX
export * from '@/lib/mdx';
