'use client';

import React, { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { CategoryNavBar } from '@/components/blog/CategoryNavBar';
import { motion, useInView } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Page Catégorie Santé - NutriSensia
 */

// Types
interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  publishedAt: string;
  readingTime: number;
  author: string;
  category: string;
  tags: string[];
}

// Articles de la catégorie Santé
const santeArticles: Article[] = [
  {
    slug: 'microbiote-intestinal',
    title: 'Prendre soin de son microbiote intestinal',
    excerpt:
      'Le microbiote intestinal joue un rôle crucial dans notre santé. Voici comment le nourrir et le préserver pour un bien-être optimal.',
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop',
    publishedAt: '2024-12-05',
    readingTime: 10,
    author: 'Lucie Cornille',
    category: 'sante',
    tags: ['microbiote', 'digestion', 'santé'],
  },
  {
    slug: 'systeme-immunitaire-alimentation',
    title: "Renforcer son système immunitaire par l'alimentation",
    excerpt:
      'Découvrez les nutriments essentiels et les aliments clés pour booster naturellement vos défenses immunitaires.',
    image:
      'https://images.unsplash.com/photo-1610465299996-e4558eecfdd4?w=800&h=600&fit=crop',
    publishedAt: '2024-12-01',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'sante',
    tags: ['immunité', 'santé', 'prévention'],
  },
  {
    slug: 'sante-cardiovasculaire',
    title: 'Protéger sa santé cardiovasculaire au quotidien',
    excerpt:
      'Les habitudes alimentaires qui contribuent à maintenir un cœur en bonne santé et prévenir les maladies cardiovasculaires.',
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
    publishedAt: '2024-11-25',
    readingTime: 9,
    author: 'Lucie Cornille',
    category: 'sante',
    tags: ['cardiovasculaire', 'santé', 'prévention'],
  },
];

// Utilitaires
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Carte Article - Style NutriSensia
 */
function ArticleCard({ article }: { article: Article }) {
  const [isHovered, setIsHovered] = React.useState(false);

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
          boxShadow: isHovered ? '10px 10px 0 #E5DED6' : '8px 8px 0 #E5DED6',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
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
                style={{
                  backgroundColor: 'rgba(27, 153, 139, 0.2)',
                }}
              />
            </>
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F3EF] to-[#E5DED6]'>
              <BookOpen className='w-20 h-20 text-[#1B998B] opacity-30' />
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: '24px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Category badge */}
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
              Santé
            </span>
          </div>

          {/* Title */}
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

          {/* Author */}
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
              {article.author}
            </span>
          </p>
        </div>
      </article>
    </Link>
  );
}

/**
 * Page Santé
 */
export default function SantePage() {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });
  const isGridInView = useInView(gridRef, { once: true, margin: '-100px' });
  const { isFirstVisit, isReady } = useFirstVisit();

  return (
    <div
      className='min-h-screen'
      style={{
        backgroundColor: '#FBF9F7',
        backgroundImage:
          'radial-gradient(ellipse 2500px 800px at 0% 0%, rgba(27, 153, 139, 0.15) 0%, transparent 50%)',
      }}
    >
      {/* Header - disparaît au scroll, réapparaît uniquement en haut */}
      <MarketingHeader hideOnScroll={true} />

      {/* Spacer pour le header flottant fixe */}
      <div style={{ height: '100px' }} />

      {/* Barre de navigation des catégories */}
      <CategoryNavBar activeCategory='sante' topOffset='80px' />

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
            <span style={{ color: '#1a1a1a' }}>Santé</span>
          </div>

          {/* Titre de la catégorie */}
          <motion.div
            ref={headerRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isHeaderInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='mb-12'
          >
            <h1
              className='text-4xl lg:text-5xl font-bold mb-4'
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#1B998B',
                lineHeight: '1.2',
              }}
            >
              Santé
            </h1>
            <p
              className='text-lg max-w-3xl'
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#666666',
                lineHeight: '1.6',
              }}
            >
              Explorez nos conseils pour préserver et améliorer votre santé au
              quotidien grâce à une alimentation adaptée et des habitudes de vie
              saines.
            </p>
          </motion.div>

          {/* Grille d'articles */}
          <motion.div
            ref={gridRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isGridInView
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
            {santeArticles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
