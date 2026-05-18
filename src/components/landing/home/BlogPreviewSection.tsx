'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Nos derniers articles — DS v2.
 * Three editorial cards (.ns2-card) with hard ink border + offset shadow on
 * hover. Each card: framed cover image, colored category tag, Fraunces title,
 * meta byline. First card carries an angled "Nouveau" sticker.
 */

interface BlogArticle {
  slug: string;
  category: string;
  title: string;
  image: string;
  publishedAt: string;
  readingTime: number;
  author: { name: string; title: string };
}

const TAG_VARIANTS = ['ns2-tag-peps', 'ns2-tag-coral', 'ns2-tag-sage'] as const;

function ArticleCard({
  article,
  categoryLabels,
  variantIndex,
  showSticker,
}: {
  article: BlogArticle;
  categoryLabels: Record<string, string>;
  variantIndex: number;
  showSticker?: boolean;
}) {
  return (
    <Link
      href={`/blog/${article.category}/${article.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <article
        className='ns2-card'
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {showSticker && (
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: 16,
              zIndex: 2,
            }}
          >
            <span className='ns2-sticker'>Nouveau ↘</span>
          </div>
        )}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            borderBottom: 'var(--ns-bw) solid var(--ns-ink)',
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
        </div>
        <div
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            flex: 1,
          }}
        >
          <span
            className={`ns2-tag ${TAG_VARIANTS[variantIndex % TAG_VARIANTS.length]}`}
            style={{ alignSelf: 'flex-start' }}
          >
            {categoryLabels[article.category] || article.category}
          </span>
          <h3
            className='ns2-display'
            style={{
              fontSize: 24,
              color: 'var(--ns-ink)',
              lineHeight: 1.1,
            }}
          >
            {article.title}
          </h3>
          <p className='ns2-meta' style={{ marginTop: 'auto' }}>
            Par{' '}
            <span style={{ color: 'var(--ns-ink)', fontWeight: 600 }}>
              {article.author.name}
            </span>{' '}
            · {article.readingTime} min de lecture
          </p>
        </div>
      </article>
    </Link>
  );
}

export interface BlogPreviewSectionProps {
  className?: string;
}

export function BlogPreviewSection({ className }: BlogPreviewSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  const showContent = !isFirstVisit || isInView;
  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };
  const getTransition = (delay: number) =>
    isFirstVisit && isInView
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  const latestArticles: BlogArticle[] = [
    {
      slug: 'alimentation-equilibree-bases',
      category: 'nutrition',
      title: 'Les bases d’une alimentation équilibrée pour une vie saine',
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
      title: 'Renforcer son système immunitaire par l’alimentation',
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
        background: 'var(--ns-cream-100)',
        paddingTop: 96,
        paddingBottom: 96,
      }}
    >
      <div className='ns2-container'>
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            marginBottom: 64,
            ...getHidden(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <div>
            <div className='ns2-eyebrow ns2-eyebrow-dot'>Le journal</div>
            <h2
              className='ns2-display'
              style={{
                fontSize: 'clamp(36px, 5vw, 60px)',
                color: 'var(--ns-ink)',
                marginTop: 18,
                maxWidth: 720,
              }}
            >
              Ce qu’on lit, ce qu’on teste, <em>ce qu’on a appris</em>{' '}
              <span className='ns2-hl'>cette semaine</span>.
            </h2>
          </div>
          <Link
            href='/blog'
            className='ns2-btn ns2-btn-outline ns2-btn-sm'
            style={{ flexShrink: 0 }}
          >
            Tous les articles
            <ArrowRight className='w-4 h-4' />
          </Link>
        </motion.div>

        <div className='blog-grid'>
          {latestArticles.map((article, index) => (
            <motion.div
              key={article.slug}
              style={getHidden(40)}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={getTransition(0.15 + index * 0.12)}
            >
              <ArticleCard
                article={article}
                categoryLabels={categoryLabels}
                variantIndex={index}
                showSticker={index === 0}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .blog-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}

export default BlogPreviewSection;
