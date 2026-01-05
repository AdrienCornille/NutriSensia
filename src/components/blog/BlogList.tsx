'use client';

import React, { useState } from 'react';
import { BlogCard } from './BlogCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Types et constantes pour le blog
export interface BlogPost {
  slug: string;
  meta: {
    title: string;
    description: string;
    date: string;
    author: string;
    authorImage?: string;
    category: string;
    tags: string[];
    image?: string;
    imageAlt?: string;
    published: boolean;
    featured?: boolean;
  };
  content: string;
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
  excerpt?: string;
}

export const BLOG_CATEGORIES = [
  {
    slug: 'nutrition-generale',
    name: 'Nutrition Générale',
    description: 'Conseils et informations sur la nutrition au quotidien',
    color: 'blue',
  },
  {
    slug: 'recettes-sante',
    name: 'Recettes Santé',
    description: 'Recettes équilibrées et savoureuses pour votre bien-être',
    color: 'green',
  },
  {
    slug: 'nutrition-sportive',
    name: 'Nutrition Sportive',
    description:
      "Alimentation optimisée pour les sportifs et l'activité physique",
    color: 'orange',
  },
  {
    slug: 'troubles-alimentaires',
    name: 'Troubles Alimentaires',
    description:
      'Accompagnement et conseils pour les troubles du comportement alimentaire',
    color: 'purple',
  },
  {
    slug: 'nutrition-clinique',
    name: 'Nutrition Clinique',
    description: 'Nutrition thérapeutique et prise en charge médicale',
    color: 'red',
  },
  {
    slug: 'actualites',
    name: 'Actualités',
    description: 'Dernières nouvelles et recherches en nutrition',
    color: 'indigo',
  },
] as const;

/**
 * Props du composant BlogList
 */
export interface BlogListProps {
  /**
   * Articles de blog à afficher
   */
  posts: BlogPost[];

  /**
   * Pagination
   */
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
  };

  /**
   * Fonction appelée lors du changement de page
   */
  onPageChange?: (page: number) => void;

  /**
   * Fonction appelée lors du changement de catégorie
   */
  onCategoryChange?: (category: string | null) => void;

  /**
   * Catégorie actuellement sélectionnée
   */
  selectedCategory?: string | null;

  /**
   * Afficher les filtres
   */
  showFilters?: boolean;

  /**
   * Afficher la pagination
   */
  showPagination?: boolean;

  /**
   * Layout de la grille
   */
  layout?: 'grid' | 'list';

  /**
   * Classes CSS personnalisées
   */
  className?: string;
}

/**
 * Composant BlogList pour afficher une liste d'articles de blog
 *
 * Ce composant gère l'affichage des articles avec filtrage par catégorie,
 * pagination et différents layouts d'affichage.
 */
export const BlogList: React.FC<BlogListProps> = ({
  posts,
  pagination,
  onPageChange,
  onCategoryChange,
  selectedCategory,
  showFilters = true,
  showPagination = true,
  layout = 'grid',
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage des articles par terme de recherche
  const filteredPosts = posts.filter(
    post =>
      post.meta.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.meta.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.meta.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Génération des numéros de page pour la pagination
  const generatePageNumbers = () => {
    if (!pagination) return [];

    const { currentPage, totalPages } = pagination;
    const pages: (number | string)[] = [];

    // Toujours afficher la première page
    pages.push(1);

    // Ajouter des ellipses si nécessaire
    if (currentPage > 3) {
      pages.push('...');
    }

    // Ajouter les pages autour de la page actuelle
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Ajouter des ellipses si nécessaire
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Toujours afficher la dernière page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Filtres et recherche */}
      {showFilters && (
        <Card>
          <CardContent className='p-6'>
            {/* Barre de recherche */}
            <div className='mb-6'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <input
                  type='text'
                  placeholder='Rechercher des articles...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                />
              </div>
            </div>

            {/* Filtres par catégorie */}
            <div>
              <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                Catégories
              </h3>
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant={selectedCategory === null ? 'primary' : 'ghost'}
                  size='sm'
                  onClick={() => onCategoryChange?.(null)}
                >
                  Toutes
                </Button>
                {BLOG_CATEGORIES.map(category => (
                  <Button
                    key={category.slug}
                    variant={
                      selectedCategory === category.slug ? 'primary' : 'ghost'
                    }
                    size='sm'
                    onClick={() => onCategoryChange?.(category.slug)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations sur les résultats */}
      {pagination && (
        <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
          <p>
            {filteredPosts.length === 0
              ? 'Aucun article trouvé'
              : `${filteredPosts.length} article${filteredPosts.length > 1 ? 's' : ''} trouvé${filteredPosts.length > 1 ? 's' : ''}`}
            {selectedCategory && (
              <span className='ml-2'>
                dans la catégorie "
                {
                  BLOG_CATEGORIES.find(cat => cat.slug === selectedCategory)
                    ?.name
                }
                "
              </span>
            )}
          </p>

          {pagination.totalPosts > 0 && (
            <p>
              Page {pagination.currentPage} sur {pagination.totalPages}
            </p>
          )}
        </div>
      )}

      {/* Liste des articles */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              Aucun article trouvé
            </h3>
            <p className='text-gray-600 dark:text-gray-300 mb-4'>
              {searchTerm
                ? `Aucun article ne correspond à "${searchTerm}"`
                : 'Aucun article disponible pour le moment'}
            </p>
            {searchTerm && (
              <Button variant='secondary' onClick={() => setSearchTerm('')}>
                Effacer la recherche
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            layout === 'grid'
              ? 'grid gap-8 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-8'
          )}
        >
          {filteredPosts.map((post, index) => (
            <BlogCard
              key={post.slug}
              post={post}
              variant={
                layout === 'list'
                  ? 'featured'
                  : index === 0
                    ? 'featured'
                    : 'default'
              }
              className={layout === 'list' ? 'w-full' : undefined}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-center space-x-2'>
          {/* Bouton précédent */}
          <Button
            variant='ghost'
            size='sm'
            disabled={pagination.currentPage === 1}
            onClick={() => onPageChange?.(pagination.currentPage - 1)}
          >
            <svg
              className='w-4 h-4 mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Précédent
          </Button>

          {/* Numéros de page */}
          {generatePageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className='px-3 py-2 text-gray-500'>...</span>
              ) : (
                <Button
                  variant={
                    pagination.currentPage === page ? 'primary' : 'ghost'
                  }
                  size='sm'
                  onClick={() => onPageChange?.(page as number)}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}

          {/* Bouton suivant */}
          <Button
            variant='ghost'
            size='sm'
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => onPageChange?.(pagination.currentPage + 1)}
          >
            Suivant
            <svg
              className='w-4 h-4 ml-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
