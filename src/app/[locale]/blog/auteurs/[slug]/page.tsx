'use client';

import React, { useRef, use } from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { getAuthorBySlug } from '@/data/authors';
import { articles } from '@/data/articles';
import { notFound } from 'next/navigation';
import { Mail, BookOpen } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ArticleData {
  slug: string;
  category: string;
  title: string;
  image?: string;
  author: {
    name: string;
    title: string;
  };
}

// Mapping des catégories (déplacé hors du composant)
const categoryMapping: Record<string, string> = {
  nutrition: 'Nutrition',
  sante: 'Santé',
  'bien-etre': 'Bien-être',
  recettes: 'Recettes',
  conseils: 'Conseils pratiques',
};

// Composant pour afficher une carte d'article
function AuthorArticleCard({ article }: { article: ArticleData }) {
  return (
    <Link
      href={`/blog/${article.category}/${article.slug}` as any}
      className='block'
    >
      <article
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '8px 8px 0 #E5DED6',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
          transform: 'translateY(0)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '10px 10px 0 #E5DED6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '8px 8px 0 #E5DED6';
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            overflow: 'hidden',
          }}
        >
          {article.image ? (
            <>
              <img
                src={article.image}
                alt={article.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                className='absolute inset-0 pointer-events-none'
                style={{ backgroundColor: 'rgba(27, 153, 139, 0.2)' }}
              />
            </>
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F3EF] to-[#E5DED6]'>
              <BookOpen className='w-20 h-20 text-[#1B998B] opacity-30' />
            </div>
          )}
        </div>
        <div
          style={{
            padding: '24px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                backgroundColor: 'rgba(27, 153, 139, 0.08)',
                color: '#1B998B',
                border: '1px solid #E5DED6',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              {categoryMapping[article.category] || article.category}
            </span>
          </div>
          <h3
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '24px',
              fontWeight: 400,
              lineHeight: '1.4',
              color: '#1a1a1a',
              paddingBottom: '12px',
              marginBottom: '12px',
              borderBottom: '1px solid #e5e5e5',
            }}
          >
            {article.title}
          </h3>
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '11.2px',
              color: '#41556b',
              marginTop: 'auto',
            }}
          >
            Rédigé par{' '}
            <span style={{ color: '#1a1a1a', fontWeight: 600 }}>
              {article.author.name}
            </span>
          </p>
        </div>
      </article>
    </Link>
  );
}

/**
 * Page Auteur - Style NutriSensia inspiré de Finary
 */
export default function AuthorPage({ params }: PageProps) {
  // Next.js 15: params est une Promise, utiliser use() pour l'unwrap
  const { slug } = use(params);
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  // Refs pour les animations
  const profileRef = useRef(null);
  const articlesHeaderRef = useRef(null);
  const articlesGridRef = useRef(null);

  // Hooks useInView
  const isProfileInView = useInView(profileRef, {
    once: true,
    margin: '-100px',
  });
  const isArticlesHeaderInView = useInView(articlesHeaderRef, {
    once: true,
    margin: '-100px',
  });
  const isArticlesGridInView = useInView(articlesGridRef, {
    once: true,
    margin: '-100px',
  });

  // Hook first visit pour animations conditionnelles
  const { isFirstVisit, isReady } = useFirstVisit();

  // Récupérer tous les articles de cet auteur
  const authorArticles = Object.values(articles).filter(
    article =>
      article.author.name === author.name ||
      article.editor?.name === author.name
  );

  return (
    <div
      className='min-h-screen'
      style={{
        backgroundColor: '#FBF9F7',
        backgroundImage:
          'radial-gradient(ellipse 2500px 800px at 0% 0%, rgba(27, 153, 139, 0.15) 0%, transparent 50%)',
      }}
    >
      {/* Header */}
      <MarketingHeader />

      {/* Spacer pour le header flottant fixe */}
      <div style={{ height: '100px' }} />

      {/* Main Content */}
      <main className='pt-8 pb-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
          <div
            className='mb-8 flex items-center gap-2 text-sm'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Link
              href='/blog'
              className='transition-colors hover:text-[#1B998B]'
              style={{ color: '#666666' }}
            >
              Blog
            </Link>
            <span style={{ color: '#666666' }}>›</span>
            <span style={{ color: '#666666' }}>Auteurs</span>
            <span style={{ color: '#666666' }}>›</span>
            <span style={{ color: '#1a1a1a' }}>{author.name}</span>
          </div>

          {/* Section Auteur */}
          <motion.div
            ref={profileRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isProfileInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='mb-16 max-w-[460px]'
          >
            {/* Photo de profil */}
            <div
              className='w-24 h-24 rounded-full mb-6'
              style={{
                backgroundImage: `url(${author.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#1B998B',
              }}
            />

            {/* Nom */}
            <h1
              className='text-3xl font-bold mb-2'
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#1a1a1a',
              }}
            >
              {author.name}
            </h1>

            {/* Titre */}
            <p
              className='text-sm mb-6'
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#666666',
              }}
            >
              {author.title}
            </p>

            {/* Bio */}
            <p
              className='text-base mb-8 leading-relaxed'
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#1a1a1a',
                lineHeight: '1.6',
              }}
            >
              {author.bio}
            </p>

            {/* Liens sociaux */}
            {author.social && (
              <div>
                <div
                  className='text-xs uppercase tracking-wider mb-4'
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#666666',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                  }}
                >
                  SUIVRE
                </div>
                <div className='flex gap-3'>
                  {author.social.linkedin && (
                    <a
                      href={author.social.linkedin}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center transition-all hover:opacity-70'
                      aria-label='LinkedIn'
                    >
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='#E5DED6'
                      >
                        <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                      </svg>
                    </a>
                  )}
                  {author.social.twitter && (
                    <a
                      href={author.social.twitter}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center transition-all hover:opacity-70'
                      aria-label='Twitter'
                    >
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='#E5DED6'
                      >
                        <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                      </svg>
                    </a>
                  )}
                  {author.social.email && (
                    <a
                      href={`mailto:${author.social.email}`}
                      className='flex items-center justify-center transition-all hover:opacity-70'
                      aria-label='Email'
                    >
                      <Mail className='w-5 h-5' style={{ color: '#E5DED6' }} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Section Articles par cet auteur */}
          {authorArticles.length > 0 && (
            <div>
              <motion.h2
                ref={articlesHeaderRef}
                style={{
                  fontFamily: "'Marcellus', serif",
                  color: '#1a1a1a',
                  ...(isFirstVisit
                    ? { opacity: 0, transform: 'translateY(30px)' }
                    : {}),
                }}
                animate={
                  isReady && isArticlesHeaderInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={
                  isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
                }
                className='text-3xl font-bold mb-12'
              >
                Articles par cet auteur
              </motion.h2>

              {/* Grille d'articles */}
              <motion.div
                ref={articlesGridRef}
                style={
                  isFirstVisit
                    ? { opacity: 0, transform: 'translateY(30px)' }
                    : {}
                }
                animate={
                  isReady && isArticlesGridInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={
                  isFirstVisit && isReady
                    ? { duration: 0.6, delay: 0.2 }
                    : { duration: 0 }
                }
                className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'
              >
                {authorArticles.map(article => (
                  <AuthorArticleCard key={article.slug} article={article} />
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
