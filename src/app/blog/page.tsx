import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getBlogPostsForComponent } from '@/lib/mdx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, TrendingUp, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: "Blog Nutrition | NutriSensia - Conseils d'Experts",
  description:
    "Découvrez nos conseils d'experts en nutrition, recettes santé et dernières actualités pour améliorer votre bien-être au quotidien. Articles rédigés par des nutritionnistes certifiés.",
  keywords:
    'blog nutrition, conseils nutrition, recettes santé, nutritionniste suisse, alimentation équilibrée, bien-être',
  openGraph: {
    title: 'Blog Nutrition | NutriSensia',
    description:
      "Conseils d'experts en nutrition pour améliorer votre bien-être au quotidien.",
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
  },
};

/**
 * Page principale du blog NutriSensia
 */
export default async function BlogPage() {
  // Charger les articles de blog
  const posts = await getBlogPostsForComponent();

  // Extraire les tags uniques
  const allTags = posts.flatMap(post => post.tags || []);
  const tagCounts = allTags.reduce(
    (acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const popularTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Articles populaires (les plus récents pour l'instant)
  const popularPosts = posts.slice(0, 3);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-7xl mx-auto'>
          {/* En-tête du blog */}
          <div className='text-center mb-16'>
            <h1 className='text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6'>
              Blog Nutrition
            </h1>
            <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
              Découvrez nos conseils d'experts, recettes santé et dernières
              actualités en nutrition pour améliorer votre bien-être au
              quotidien.
            </p>
          </div>

          <div className='grid lg:grid-cols-4 gap-8'>
            {/* Contenu principal */}
            <div className='lg:col-span-3'>
              {posts.length > 0 ? (
                <div className='space-y-8'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    {posts.map(post => (
                      <Card
                        key={post.slug}
                        className='overflow-hidden hover:shadow-lg transition-shadow'
                      >
                        {post.image && (
                          <div className='aspect-video w-full overflow-hidden'>
                            <img
                              src={post.image}
                              alt={post.title}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        )}
                        <CardContent className='p-6'>
                          <div className='flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3'>
                            <div className='flex items-center gap-1'>
                              <Calendar size={14} />
                              <time dateTime={post.publishedAt}>
                                {format(
                                  new Date(post.publishedAt),
                                  'dd/MM/yyyy',
                                  { locale: fr }
                                )}
                              </time>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Clock size={14} />
                              <span>{post.readingTime} min</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <User size={14} />
                              <span>{post.author}</span>
                            </div>
                          </div>

                          <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2'>
                            {post.title}
                          </h2>

                          <p className='text-gray-600 dark:text-gray-300 mb-4 line-clamp-3'>
                            {post.excerpt}
                          </p>

                          {post.tags && post.tags.length > 0 && (
                            <div className='flex flex-wrap gap-2 mb-4'>
                              {post.tags.slice(0, 3).map(tag => (
                                <Badge
                                  key={tag}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Link href={`/blog/${post.slug}`}>
                            <Button
                              variant='outline'
                              size='sm'
                              className='w-full'
                            >
                              Lire l'article
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className='p-12 text-center'>
                    <div className='w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4'>
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
                          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                        />
                      </svg>
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                      Aucun article pour le moment
                    </h3>
                    <p className='text-gray-600 dark:text-gray-300'>
                      De nouveaux articles seront bientôt disponibles.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-8'>
              {/* Articles populaires */}
              {popularPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                      <TrendingUp size={20} />
                      Articles populaires
                    </h2>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {popularPosts.map(post => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className='block group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-3 transition-colors'
                      >
                        <h3 className='font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 mb-2'>
                          {post.title}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2'>
                          {post.excerpt}
                        </p>
                        <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
                          <Calendar size={12} />
                          <span>
                            {format(new Date(post.publishedAt), 'dd/MM/yyyy', {
                              locale: fr,
                            })}
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

              {/* Tags populaires */}
              {popularTags.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                      <Tag size={20} />
                      Tags populaires
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {popularTags.map(({ tag, count }) => (
                        <Link
                          key={tag}
                          href={`/blog/tag/${tag}`}
                          className='inline-block'
                        >
                          <Badge
                            variant='outline'
                            className='hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer text-xs'
                          >
                            #{tag} ({count})
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter */}
              <Card className='bg-gradient-to-br from-blue-500 to-green-500 text-white'>
                <CardContent className='p-6'>
                  <div className='text-center'>
                    <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-6 h-6'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-lg font-semibold mb-2'>
                      Newsletter Nutrition
                    </h3>
                    <p className='text-sm opacity-90 mb-4'>
                      Recevez nos derniers conseils et recettes directement dans
                      votre boîte mail.
                    </p>
                    <Button
                      variant='secondary'
                      className='w-full bg-white text-blue-600 hover:bg-gray-100'
                    >
                      S'abonner
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact expert */}
              <Card>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <svg
                      className='w-6 h-6 text-green-600 dark:text-green-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                    Besoin de conseils personnalisés ?
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>
                    Consultez nos nutritionnistes certifiés pour un
                    accompagnement sur mesure.
                  </p>
                  <Button className='w-full'>Prendre rendez-vous</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
