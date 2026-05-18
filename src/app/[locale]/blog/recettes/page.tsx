'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';

/**
 * Page Catégorie Recettes — DS v2 Editorial
 *
 * Structure : breadcrumb + intro éditoriale + topic chips + grille
 * de recettes (rec-card carnet 1:1) + footer.
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
  difficulty?: string;
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
    slug: 'petit-dejeuner-energetique',
    title: '5 petits-déjeuners énergétiques pour bien commencer la journée',
    excerpt:
      "Des recettes simples et nutritives pour un petit-déjeuner qui vous donnera l'énergie nécessaire toute la matinée.",
    image:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=900&h=600&fit=crop',
    publishedAt: '2026-04-12',
    readingTime: 5,
    author: 'Lucie Cornille',
    category: 'recettes',
    difficulty: 'facile',
  },
  {
    slug: 'bowls-equilibres',
    title: 'Bowls équilibrés : 10 recettes colorées et nutritives',
    excerpt:
      'Composer des bowls savoureux et complets pour vos déjeuners et dîners.',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=600&fit=crop',
    publishedAt: '2026-03-26',
    readingTime: 6,
    author: 'Lucie Cornille',
    category: 'recettes',
    difficulty: 'facile',
  },
  {
    slug: 'snacks-sains',
    title: 'Snacks sains pour combler les petites faims',
    excerpt:
      'Des collations nutritives et faciles à préparer pour éviter les grignotages malsains.',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&h=600&fit=crop',
    publishedAt: '2026-03-08',
    readingTime: 4,
    author: 'Lucie Cornille',
    category: 'recettes',
    difficulty: 'facile',
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

export default function RecettesPage() {
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
                  Catégorie · Recettes
                </span>
                <h1>
                  Manger <em>bon,</em>
                  <br />
                  cuisiner <span className='hl'>vivant.</span>
                </h1>
              </div>
              <div className='blog-intro-meta'>
                <div className='stat'>
                  <b>{CATEGORY_COUNTS.recettes}</b>
                  <span>
                    recettes
                    <br />
                    publiées
                  </span>
                </div>
                <div className='stat'>
                  <b>{totalReading}</b>
                  <span>
                    minutes de lecture
                    <br />
                    pour tout le carnet
                  </span>
                </div>
                <div className='stat'>
                  <b>3</b>
                  <span>
                    catégories — petit-déjeuners,
                    <br />
                    bowls, snacks
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
              <Link href={'/blog/bien-etre' as never} className='topic'>
                Bien-être{' '}
                <span className='count'>{CATEGORY_COUNTS['bien-etre']}</span>
              </Link>
              <Link href={'/blog/recettes' as never} className='topic active'>
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
            <span aria-current='page'>Recettes</span>
          </nav>
        </div>

        {/* Liste des recettes */}
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
