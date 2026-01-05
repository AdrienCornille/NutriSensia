'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { BlogPost, BLOG_CATEGORIES } from './BlogList';

/**
 * Props du composant BlogCard
 */
export interface BlogCardProps {
  /**
   * Article de blog à afficher
   */
  post: BlogPost;

  /**
   * Variante d'affichage
   */
  variant?: 'default' | 'featured' | 'compact';

  /**
   * Classes CSS personnalisées
   */
  className?: string;

  /**
   * Afficher l'image
   */
  showImage?: boolean;

  /**
   * Afficher l'extrait
   */
  showExcerpt?: boolean;

  /**
   * Afficher les métadonnées (auteur, date, temps de lecture)
   */
  showMeta?: boolean;
}

/**
 * Composant BlogCard pour afficher un aperçu d'article de blog
 *
 * Ce composant présente un article de blog sous forme de carte avec
 * image, titre, extrait et métadonnées selon la variante choisie.
 */
export const BlogCard: React.FC<BlogCardProps> = ({
  post,
  variant = 'default',
  className,
  showImage = true,
  showExcerpt = true,
  showMeta = true,
}) => {
  // Trouver la catégorie pour la couleur
  const category = BLOG_CATEGORIES.find(cat => cat.slug === post.meta.category);
  const categoryColor = category?.color || 'blue';

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Classes CSS selon la variante
  const cardClasses = cn(
    'group cursor-pointer transition-all duration-300 hover:shadow-xl border border-gray-200',
    variant === 'featured' && 'lg:flex lg:items-center',
    variant === 'compact' && 'h-full',
    className
  );

  const imageClasses = cn(
    'relative overflow-hidden rounded-lg',
    variant === 'featured' ? 'lg:w-1/2 lg:mr-6' : 'w-full',
    variant === 'compact' ? 'h-48' : 'h-64'
  );

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className={cardClasses}>
        <CardContent
          className={cn(
            'p-0',
            variant === 'featured' && 'lg:flex lg:items-center'
          )}
        >
          {/* Image */}
          {showImage && post.meta.image && (
            <div className={imageClasses}>
              <Image
                src={post.meta.image}
                alt={post.meta.imageAlt || post.meta.title}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                sizes={
                  variant === 'featured'
                    ? '(max-width: 1024px) 100vw, 50vw'
                    : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                }
              />

              {/* Badge catégorie */}
              <div className='absolute top-4 left-4'>
                <span
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-full text-white',
                    categoryColor === 'blue' && 'bg-blue-500',
                    categoryColor === 'green' && 'bg-green-500',
                    categoryColor === 'orange' && 'bg-orange-500',
                    categoryColor === 'purple' && 'bg-purple-500',
                    categoryColor === 'red' && 'bg-red-500',
                    categoryColor === 'indigo' && 'bg-indigo-500'
                  )}
                >
                  {category?.name}
                </span>
              </div>
            </div>
          )}

          {/* Contenu */}
          <div
            className={cn(
              'p-6',
              variant === 'featured' &&
                showImage &&
                post.meta.image &&
                'lg:w-1/2'
            )}
          >
            {/* Catégorie (si pas d'image) */}
            {(!showImage || !post.meta.image) && (
              <div className='mb-3'>
                <span
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-full',
                    categoryColor === 'blue' &&
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
                    categoryColor === 'green' &&
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
                    categoryColor === 'orange' &&
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
                    categoryColor === 'purple' &&
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
                    categoryColor === 'red' &&
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
                    categoryColor === 'indigo' &&
                      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                  )}
                >
                  {category?.name}
                </span>
              </div>
            )}

            {/* Titre */}
            <h3
              className={cn(
                'font-normal text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors',
                variant === 'featured' ? 'text-2xl lg:text-3xl' : 'text-2xl',
                variant === 'compact' && 'text-xl'
              )}
            >
              {post.meta.title}
            </h3>

            {/* Extrait */}
            {showExcerpt && (
              <p
                className={cn(
                  'text-gray-600 dark:text-gray-300 mb-4 line-clamp-3',
                  variant === 'compact' && 'text-sm line-clamp-2'
                )}
              >
                {post.excerpt}
              </p>
            )}

            {/* Métadonnées */}
            {showMeta && (
              <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
                <div className='flex items-center space-x-4'>
                  {/* Auteur */}
                  <div className='flex items-center space-x-2'>
                    {post.meta.authorImage && (
                      <div className='relative w-6 h-6 rounded-full overflow-hidden'>
                        <Image
                          src={post.meta.authorImage}
                          alt={post.meta.author}
                          fill
                          className='object-cover'
                        />
                      </div>
                    )}
                    <span className='font-medium'>{post.meta.author}</span>
                  </div>

                  {/* Date */}
                  <span>{formatDate(post.meta.date)}</span>
                </div>

                {/* Temps de lecture */}
                <div className='flex items-center space-x-1'>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span>{post.readingTime.text}</span>
                </div>
              </div>
            )}

            {/* Tags (pour la variante featured) */}
            {variant === 'featured' && post.meta.tags.length > 0 && (
              <div className='mt-4 flex flex-wrap gap-2'>
                {post.meta.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md'
                  >
                    #{tag}
                  </span>
                ))}
                {post.meta.tags.length > 3 && (
                  <span className='px-2 py-1 text-xs text-gray-500 dark:text-gray-400'>
                    +{post.meta.tags.length - 3} autres
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
