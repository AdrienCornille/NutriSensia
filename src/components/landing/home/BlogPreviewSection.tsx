'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Blog Preview - Page d'accueil
 *
 * Design selon le Style Guide NutriSensia :
 * - Cartes avec border 1px #3f6655, border-radius 10px
 * - Box-shadow signature : 8px 8px 0 #d7e1ce
 * - Hover : translateY(-2px) translateX(-2px) + border 2px
 * - Typographie : Marcellus (titres) + Plus Jakarta Sans (body)
 * - Grid 3 colonnes sur desktop, responsive
 */

interface BlogArticle {
  slug: string;
  category: string;
  title: string;
  image: string;
  publishedAt: string;
  readingTime: number;
  author: {
    name: string;
    title: string;
  };
}

// Composant ArticleCard séparé pour gérer le hover state correctement
function ArticleCard({
  article,
  categoryLabels,
}: {
  article: BlogArticle;
  categoryLabels: Record<string, string>;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link href={`/blog/${article.category}/${article.slug}`}>
      <div
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
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            overflow: 'hidden',
          }}
        >
          <Image
            src={article.image}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          <div
            className='absolute inset-0 transition-opacity duration-300 pointer-events-none'
            style={{ backgroundColor: 'rgba(27, 153, 139, 0.15)' }}
          />
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
                backgroundColor: 'rgba(240, 249, 248, 0.4)',
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
              {categoryLabels[article.category] || article.category}
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
      </div>
    </Link>
  );
}

export interface BlogPreviewSectionProps {
  /** Classes CSS additionnelles */
  className?: string;
}

export function BlogPreviewSection({ className }: BlogPreviewSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Style initial : cacher seulement si première visite
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) {
      return {};
    }
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px)`,
    };
  };

  // Transition : animation seulement si première visite et en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  // Récupérer les 3 derniers articles (en dur pour l'instant)
  // TODO: Remplacer par une fonction qui récupère dynamiquement les derniers articles
  const latestArticles: BlogArticle[] = [
    {
      slug: 'alimentation-equilibree-bases',
      category: 'nutrition',
      title: "Les bases d'une alimentation équilibrée pour une vie saine",
      image:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
      publishedAt: '2024-12-10',
      readingTime: 8,
      author: {
        name: 'Lucie Cornille',
        title: 'Diététicienne-nutritionniste ASCA/RME',
      },
    },
    {
      slug: 'microbiote-intestinal',
      category: 'sante',
      title: 'Prendre soin de son microbiote intestinal',
      image:
        'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop',
      publishedAt: '2024-12-05',
      readingTime: 10,
      author: {
        name: 'Lucie Cornille',
        title: 'Diététicienne-nutritionniste ASCA/RME',
      },
    },
    {
      slug: 'systeme-immunitaire-alimentation',
      category: 'sante',
      title: "Renforcer son système immunitaire par l'alimentation",
      image:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
      publishedAt: '2024-12-01',
      readingTime: 7,
      author: {
        name: 'Lucie Cornille',
        title: 'Diététicienne-nutritionniste ASCA/RME',
      },
    },
  ];

  // Catégories avec labels
  const categoryLabels: Record<string, string> = {
    nutrition: 'Nutrition',
    sante: 'Santé',
    'bien-etre': 'Bien-être',
    recettes: 'Recettes',
    conseils: 'Conseils',
  };

  return (
    <section
      id='blog-preview'
      ref={ref}
      className={className}
      style={{
        padding: '96px 0',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Container principal - max-width 1200px */}
      <div
        className='container mx-auto max-width-[1200px] px-6'
        style={{ maxWidth: '1200px' }}
      >
        {/* ============================================ */}
        {/* HEADER SECTION - Titre + Sous-titre centrés */}
        {/* ============================================ */}
        <motion.div
          className='text-center'
          style={{ marginBottom: '64px', ...getHiddenStyle(30) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
        >
          {/* H2 Title - Marcellus serif */}
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#1B998B' /* Turquoise Méditerranée */,
              fontSize: '48px',
              lineHeight: '57.6px',
              textAlign: 'center',
              marginBottom: '24px',
              fontWeight: 700,
            }}
          >
            Nos derniers articles
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: '#41556b',
              fontSize: '18px',
              lineHeight: '28px',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Conseils nutrition, recettes saines et astuces pour prendre soin de
            votre santé au quotidien.
          </p>
        </motion.div>

        {/* ============================================ */}
        {/* CARDS GRID - 3 colonnes                      */}
        {/* ============================================ */}
        <div
          className={cn('grid', 'grid-cols-1 md:grid-cols-3')}
          style={{ gap: '32px', marginBottom: '48px' }}
        >
          {latestArticles.map((article, index) => (
            <motion.div
              key={article.slug}
              style={getHiddenStyle(40)}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={getTransition(0.2 + index * 0.15)}
            >
              <ArticleCard article={article} categoryLabels={categoryLabels} />
            </motion.div>
          ))}
        </div>

        {/* ============================================ */}
        {/* CTA Button centré - Voir plus                */}
        {/* ============================================ */}
        <motion.div
          style={{ textAlign: 'center', ...getHiddenStyle(20) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.8)}
        >
          <Link
            href='/blog'
            style={{
              background:
                'linear-gradient(135deg, #1B998B 0%, #147569 100%)' /* Dégradé CTA */,
              borderRadius: '35px',
              lineHeight: '16px',
              color: '#ffffff',
              display: 'inline-block',
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              textAlign: 'center',
              padding: '14px 32px',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #147569 0%, #0f5a50 100%)'; /* Dégradé hover */
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
            }}
          >
            Voir tous nos articles →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default BlogPreviewSection;
