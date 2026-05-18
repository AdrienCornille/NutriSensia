'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';

/**
 * Page Catégorie Bien-être — DS v2 Editorial
 *
 * Structure : breadcrumb + intro éditoriale + topic chips + grille
 * d'articles + footer. Styles partagés en globals.css.
 */

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
  readingTime: number;
  author: string;
  category: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  nutrition: 'Nutrition',
  sante: 'Santé',
  'bien-etre': 'Bien-être',
  recettes: 'Recettes',
  conseils: 'Conseils',
};

const CATEGORY_COUNTS: Record<string, number> = {
  all: 28,
  nutrition: 10,
  sante: 9,
  'bien-etre': 3,
  recettes: 3,
  conseils: 3,
};

const articles: Article[] = [
  {
    slug: 'gerer-stress-alimentation',
    title: "Gérer le stress par l'alimentation",
    excerpt:
      "Certains aliments aident à réguler le stress et l'anxiété. Les nutriments essentiels pour un système nerveux apaisé.",
    image:
      'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=900&h=600&fit=crop',
    publishedAt: '2026-04-08',
    readingTime: 6,
    author: 'Lucie Cornille',
    category: 'bien-etre',
  },
  {
    slug: 'sommeil-alimentation',
    title: "Comment l'alimentation influence votre sommeil",
    excerpt:
      'Ce que vous mangez affecte directement la qualité de votre sommeil. Les aliments à privilégier et ceux à éviter.',
    image:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=900&h=600&fit=crop',
    publishedAt: '2026-03-18',
    readingTime: 6,
    author: 'Lucie Cornille',
    category: 'bien-etre',
  },
  {
    slug: 'meditation-pleine-conscience',
    title: 'Méditation et pleine conscience au quotidien',
    excerpt:
      'Comment intégrer la méditation dans votre routine pour réduire le stress et améliorer votre bien-être global.',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&h=600&fit=crop',
    publishedAt: '2026-03-04',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'bien-etre',
  },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const articleHref = (article: Article) =>
  `/blog/${article.category}/${article.slug}` as never;

export default function BienEtrePage() {
  const totalReading = articles.reduce((sum, a) => sum + a.readingTime, 0);

  return (
    <div
      className='ns2 min-h-screen'
      style={{ backgroundColor: 'var(--ns-cream-100)' }}
    >
      <MarketingHeader />
      <div style={{ height: 80 }} />

      <main>
        {/* Editorial intro */}
        <section className='blog-intro'>
          <div className='ns2-container'>
            <div className='blog-intro-grid'>
              <div>
                <span className='ns2-eyebrow ns2-eyebrow-dot'>
                  Catégorie · Bien-être
                </span>
                <h1>
                  S&apos;écouter <em>vraiment,</em>
                  <br />
                  au <span className='hl'>quotidien.</span>
                </h1>
              </div>
              <div className='blog-intro-meta'>
                <div className='stat'>
                  <b>{CATEGORY_COUNTS['bien-etre']}</b>
                  <span>
                    articles dédiés
                    <br />
                    au bien-être
                  </span>
                </div>
                <div className='stat'>
                  <b>{totalReading}</b>
                  <span>
                    minutes de lecture
                    <br />
                    pour tout le dossier
                  </span>
                </div>
                <div className='stat'>
                  <b>3</b>
                  <span>
                    sous-thèmes — sommeil,
                    <br />
                    méditation, gestion du stress
                  </span>
                </div>
              </div>
            </div>

            <div className='blog-topics'>
              <Link href='/blog' className='topic'>
                Tout <span className='count'>{CATEGORY_COUNTS.all}</span>
              </Link>
              <Link href={'/blog/nutrition' as never} className='topic'>
                Nutrition{' '}
                <span className='count'>{CATEGORY_COUNTS.nutrition}</span>
              </Link>
              <Link href={'/blog/sante' as never} className='topic'>
                Santé <span className='count'>{CATEGORY_COUNTS.sante}</span>
              </Link>
              <Link href={'/blog/bien-etre' as never} className='topic active'>
                Bien-être{' '}
                <span className='count'>{CATEGORY_COUNTS['bien-etre']}</span>
              </Link>
              <Link href={'/blog/recettes' as never} className='topic'>
                Recettes{' '}
                <span className='count'>{CATEGORY_COUNTS.recettes}</span>
              </Link>
              <Link href={'/blog/conseils' as never} className='topic'>
                Conseils pratiques{' '}
                <span className='count'>{CATEGORY_COUNTS.conseils}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className='ns2-container'>
          <nav className='blog-breadcrumb' aria-label='Fil d’Ariane'>
            <Link href='/blog'>Le Journal</Link>
            <span aria-hidden='true'>/</span>
            <span aria-current='page'>Bien-être</span>
          </nav>
        </div>

        {/* Liste des articles */}
        <div className='ns2-container'>
          <section className='sec' style={{ borderTop: 0, paddingBottom: 96 }}>
            <div className='grid-3'>
              {articles.map(article => (
                <Link
                  key={article.slug}
                  href={articleHref(article)}
                  className='acard'
                >
                  <div
                    className='acard-img'
                    style={{ backgroundImage: `url('${article.image}')` }}
                  />
                  <div className='acard-body'>
                    <div className='acard-meta'>
                      <span className='ns2-tag'>
                        {CATEGORY_LABEL[article.category]}
                      </span>
                      <span className='ns2-meta'>
                        {article.readingTime} min
                      </span>
                    </div>
                    <h3>{article.title}</h3>
                    <div className='acard-foot'>
                      <span>{article.author}</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
