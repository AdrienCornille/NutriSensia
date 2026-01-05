import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

export interface BlogNavigationProps {
  currentSlug: string;
  previousPost?: {
    slug: string;
    title: string;
  };
  nextPost?: {
    slug: string;
    title: string;
  };
  className?: string;
}

export const BlogNavigation: React.FC<BlogNavigationProps> = ({
  currentSlug,
  previousPost,
  nextPost,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Navigation vers le blog */}
      <div className='text-center'>
        <Link href='/blog'>
          <Button variant='outline' className='flex items-center gap-2'>
            <ArrowLeft size={16} />
            Retour au blog
          </Button>
        </Link>
      </div>

      {/* Navigation entre articles */}
      {(previousPost || nextPost) && (
        <div className='grid md:grid-cols-2 gap-4'>
          {/* Article précédent */}
          {previousPost && (
            <Card className='group hover:shadow-lg transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  <ChevronLeft size={16} />
                  <span>Article précédent</span>
                </div>
                <Link href={`/blog/${previousPost.slug}`}>
                  <h3 className='font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2'>
                    {previousPost.title}
                  </h3>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Article suivant */}
          {nextPost && (
            <Card className='group hover:shadow-lg transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-end gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  <span>Article suivant</span>
                  <ChevronRight size={16} />
                </div>
                <Link href={`/blog/${nextPost.slug}`}>
                  <h3 className='font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-right'>
                    {nextPost.title}
                  </h3>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogNavigation;
