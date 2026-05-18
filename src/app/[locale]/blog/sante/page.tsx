'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';

/**
 * Page Catégorie Santé — DS v2 Editorial
 *
 * Mêmes patterns que /blog et /blog/nutrition : intro éditoriale,
 * topic chips, lead spread asymétrique 1.55fr/1fr, marquee, grille
 * d'articles et newsletter ink. Styles partagés en globals.css.
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
  all: 26,
  nutrition: 10,
  sante: 9,
  'bien-etre': 3,
  recettes: 4,
  conseils: 3,
};

const articles: Article[] = [
  {
    slug: 'microbiote-intestinal',
    title: 'Prendre soin de son microbiote intestinal',
    excerpt:
      'Le second cerveau, l’intestin. On démêle la science récente, sans jargon, et on en tire 5 gestes concrets à intégrer cette semaine.',
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&h=750&fit=crop',
    publishedAt: '2026-05-04',
    readingTime: 10,
    author: 'Lucie Cornille',
    category: 'sante',
  },
  {
    slug: 'systeme-immunitaire-alimentation',
    title: "Renforcer son système immunitaire par l'alimentation",
    excerpt:
      'Les nutriments essentiels et les aliments clés pour booster naturellement vos défenses immunitaires.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=600&fit=crop',
    publishedAt: '2026-04-22',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'sante',
  },
  {
    slug: 'sante-cardiovasculaire',
    title: 'Protéger sa santé cardiovasculaire au quotidien',
    excerpt:
      'Les habitudes alimentaires qui contribuent à maintenir un cœur en bonne santé et prévenir les maladies cardiovasculaires.',
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&h=600&fit=crop',
    publishedAt: '2026-04-10',
    readingTime: 9,
    author: 'Lucie Cornille',
    category: 'sante',
  },
  {
    slug: 'hormones-feminines-equilibre',
    title: 'Hormones féminines : équilibre et nutrition',
    excerpt:
      "Cycle, ménopause, syndrome prémenstruel — l'assiette est un levier puissant pour accompagner les variations hormonales.",
    image:
      'https://images.unsplash.com/photo-1581281863883-2469417a1668?w=900&h=600&fit=crop',
    publishedAt: '2026-03-30',
    readingTime: 8,
    author: 'Lucie Cornille',
    category: 'sante',
  },
  {
    slug: 'diabete-type-2-prevention',
    title: 'Diabète de type 2 : la prévention par l’assiette',
    excerpt:
      'Comprendre les mécanismes de la résistance à l’insuline et les habitudes alimentaires qui réduisent réellement le risque.',
    image:
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=900&h=600&fit=crop',
    publishedAt: '2026-03-15',
    readingTime: 9,
    author: 'Lucie Cornille',
    category: 'sante',
  },
  {
    slug: 'sante-osseuse-alimentation',
    title: 'Santé osseuse : nourrir le squelette à tout âge',
    excerpt:
      'Calcium, vitamine D, magnésium, protéines — comment construire et préserver une masse osseuse solide.',
    image:
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&h=600&fit=crop',
    publishedAt: '2026-03-02',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'sante',
  },
  {
    slug: 'cholesterol-vrai-faux',
    title: 'Cholestérol : démêler le vrai du faux',
    excerpt:
      'Œufs, beurre, statines — on remet de la nuance dans un sujet trop souvent caricaturé. Ce que dit vraiment la science récente.',
    image:
      'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=900&h=600&fit=crop',
    publishedAt: '2026-02-18',
    readingTime: 6,
    author: 'Lucie Cornille',
    category: 'sante',
  },
  {
    slug: 'stress-chronique-impact',
    title: 'Stress chronique : comprendre son impact sur la santé',
    excerpt:
      'Cortisol, inflammation, sommeil, digestion : ce que le stress fait au corps, et comment l’alimentation peut atténuer ses effets.',
    image:
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=900&h=600&fit=crop',
    publishedAt: '2026-02-04',
    readingTime: 8,
    author: 'Lucie Cornille',
    category: 'sante',
  },
  {
    slug: 'inflammation-chronique-signes',
    title: 'Inflammation chronique : reconnaître les signes',
    excerpt:
      "Fatigue inexpliquée, douleurs diffuses, troubles digestifs — les signaux faibles d'une inflammation silencieuse, et les leviers nutritionnels.",
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=600&fit=crop',
    publishedAt: '2026-01-22',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'sante',
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

export default function SantePage() {
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
                  Catégorie · Santé
                </span>
                <h1>
                  Le corps <em>parle.</em>
                  <br />
                  Apprendre à <span className='hl'>l’écouter.</span>
                </h1>
              </div>
              <div className='blog-intro-meta'>
                <div className='stat'>
                  <b>{CATEGORY_COUNTS.sante}</b>
                  <span>
                    dossiers dédiés
                    <br />à la santé
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
                  <b>5</b>
                  <span>
                    sous-thèmes — microbiote, immunité,
                    <br />
                    hormones, cardiovasculaire, inflammation
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
              <Link href={'/blog/sante' as never} className='topic active'>
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
            <span aria-current='page'>Santé</span>
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
