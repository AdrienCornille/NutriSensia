'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';

/**
 * Page Catégorie Conseils pratiques — DS v2 Editorial
 *
 * Structure : breadcrumb + intro éditoriale + topic chips + grille
 * d'articles + footer.
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
    slug: 'hydratation-importance',
    title: "L'importance de l'hydratation pour votre santé",
    excerpt:
      "L'eau est essentielle à notre organisme. Combien boire et comment optimiser votre hydratation au quotidien.",
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&h=600&fit=crop',
    publishedAt: '2026-04-15',
    readingTime: 4,
    author: 'Lucie Cornille',
    category: 'conseils',
  },
  {
    slug: 'lire-etiquettes-alimentaires',
    title: 'Apprendre à lire les étiquettes alimentaires',
    excerpt:
      'Comprendre les informations nutritionnelles sur les emballages pour faire des choix éclairés au supermarché.',
    image:
      'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=900&h=600&fit=crop',
    publishedAt: '2026-03-28',
    readingTime: 6,
    author: 'Lucie Cornille',
    category: 'conseils',
  },
  {
    slug: 'courses-intelligentes',
    title: 'Faire ses courses intelligemment pour mieux manger',
    excerpt:
      'Des astuces pratiques pour organiser vos courses et remplir votre panier de produits sains et nutritifs.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=600&fit=crop',
    publishedAt: '2026-03-12',
    readingTime: 5,
    author: 'Lucie Cornille',
    category: 'conseils',
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

export default function ConseilsPage() {
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
                  Catégorie · Conseils pratiques
                </span>
                <h1>
                  Des gestes <em>simples,</em>
                  <br />
                  une <span className='hl'>vraie</span> différence.
                </h1>
              </div>
              <div className='blog-intro-meta'>
                <div className='stat'>
                  <b>{CATEGORY_COUNTS.conseils}</b>
                  <span>
                    conseils pratiques
                    <br />
                    pour le quotidien
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
                    sous-thèmes — hydratation,
                    <br />
                    courses, étiquettes
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
              <Link href={'/blog/recettes' as never} className='topic'>
                Recettes{' '}
                <span className='count'>{CATEGORY_COUNTS.recettes}</span>
              </Link>
              <Link href={'/blog/conseils' as never} className='topic active'>
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
            <span aria-current='page'>Conseils pratiques</span>
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
