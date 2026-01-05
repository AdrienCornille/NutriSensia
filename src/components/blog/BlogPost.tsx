import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BlogPostActions } from './BlogPostActions';

export interface BlogPostProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    publishedAt: string;
    updatedAt?: string;
    author?: string;
    tags?: string[];
    category?: string;
    image?: string;
    readingTime?: number;
  };
  className?: string;
}

export const BlogPost: React.FC<BlogPostProps> = ({ post, className }) => {
  return (
    <article className={cn('space-y-8', className)}>
      {/* En-tête de l'article */}
      <Card className='overflow-hidden'>
        {post.image && (
          <div className='aspect-video w-full overflow-hidden'>
            <img
              src={post.image}
              alt={post.title}
              className='w-full h-full object-cover'
            />
          </div>
        )}

        <CardContent className='p-8'>
          {/* Métadonnées */}
          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6'>
            <div className='flex items-center gap-2'>
              <Calendar size={16} />
              <time dateTime={post.publishedAt}>
                {format(new Date(post.publishedAt), 'dd MMMM yyyy', {
                  locale: fr,
                })}
              </time>
            </div>

            {post.readingTime && (
              <div className='flex items-center gap-2'>
                <Clock size={16} />
                <span>{post.readingTime} min de lecture</span>
              </div>
            )}

            {post.author && (
              <div className='flex items-center gap-2'>
                <User size={16} />
                <span>{post.author}</span>
              </div>
            )}
          </div>

          {/* Titre */}
          <h1 className='text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight'>
            {post.title}
          </h1>

          {/* Extrait */}
          <p className='text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed'>
            {post.excerpt}
          </p>

          {/* Tags et catégorie */}
          <div className='flex flex-wrap items-center gap-4 mb-8'>
            {post.category && (
              <Badge variant='secondary' className='text-sm'>
                {post.category}
              </Badge>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {post.tags.map(tag => (
                  <Badge key={tag} variant='outline' className='text-sm'>
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <BlogPostActions />
        </CardContent>
      </Card>

      {/* Contenu de l'article */}
      <Card>
        <CardContent className='p-8'>
          <div className='prose prose-lg max-w-none dark:prose-invert'>
            <MDXRemote source={post.content} />
          </div>
        </CardContent>
      </Card>

      {/* Informations de mise à jour */}
      {post.updatedAt && post.updatedAt !== post.publishedAt && (
        <Card className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300'>
              <BookOpen size={16} />
              <span>
                Article mis à jour le{' '}
                {format(new Date(post.updatedAt), 'dd MMMM yyyy', {
                  locale: fr,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </article>
  );
};

export default BlogPost;
