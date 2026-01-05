import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { TrendingUp, Tag, Calendar, Users } from 'lucide-react';

export interface BlogSidebarProps {
  relatedPosts?: Array<{
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    tags?: string[];
    readingTime?: number;
  }>;
  categories?: Array<{
    name: string;
    count: number;
    slug: string;
  }>;
  tags?: string[];
  className?: string;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  relatedPosts = [],
  categories = [],
  tags = [],
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Articles liés */}
      {relatedPosts.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <TrendingUp size={20} />
              Articles liés
            </h3>
          </CardHeader>
          <CardContent className='space-y-4'>
            {relatedPosts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className='block group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-3 transition-colors'
              >
                <h4 className='font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 mb-2'>
                  {post.title}
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                  {post.excerpt}
                </p>
                <div className='flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-500'>
                  <Calendar size={12} />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
                  </span>
                  {post.readingTime && (
                    <>
                      <span>•</span>
                      <span>{post.readingTime} min</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Catégories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <Users size={20} />
              Catégories
            </h3>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {categories.map(category => (
                <Link
                  key={category.slug}
                  href={`/blog/category/${category.slug}`}
                  className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                >
                  <span className='text-gray-700 dark:text-gray-300'>
                    {category.name}
                  </span>
                  <Badge variant='secondary' className='text-xs'>
                    {category.count}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags populaires */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <Tag size={20} />
              Tags populaires
            </h3>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className='inline-block'
                >
                  <Badge
                    variant='outline'
                    className='hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer'
                  >
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter (optionnel) */}
      <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'>
        <CardContent className='p-6 text-center'>
          <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
            Restez informé
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
            Recevez nos derniers articles sur la nutrition directement dans
            votre boîte mail.
          </p>
          <Link href='/newsletter'>
            <button className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
              S'abonner
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogSidebar;
