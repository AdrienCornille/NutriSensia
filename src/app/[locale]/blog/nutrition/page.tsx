'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';

/**
 * Page Catégorie Nutrition — DS v2 Editorial
 *
 * Mêmes patterns que /blog : intro éditoriale, topic chips,
 * lead spread asymétrique 1.55fr/1fr, marquee, grille d'articles
 * et newsletter ink. Les styles partagés vivent dans globals.css.
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

// Counts pour les chips de navigation entre catégories.
// Reflète l'inventaire global des articles du Journal.
const CATEGORY_COUNTS: Record<string, number> = {
  all: 20,
  nutrition: 10,
  sante: 3,
  'bien-etre': 3,
  recettes: 4,
  conseils: 3,
};

const articles: Article[] = [
  {
    slug: 'alimentation-equilibree-bases',
    title: "Les bases d'une alimentation équilibrée pour une vie saine",
    excerpt:
      'Les principes fondamentaux pour construire une alimentation saine et durable au quotidien — équilibrer ses repas avec les bons nutriments, sans dogmatisme.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=750&fit=crop',
    publishedAt: '2026-05-02',
    readingTime: 8,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'alimentation-anti-inflammatoire',
    title: "L'alimentation anti-inflammatoire : guide complet",
    excerpt:
      "Réduire l'inflammation chronique grâce à des choix alimentaires judicieux. Les meilleurs aliments et habitudes à adopter.",
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&h=750&fit=crop',
    publishedAt: '2026-04-18',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'superaliments-mythes-realites',
    title: 'Superaliments : entre mythes et réalités',
    excerpt:
      'Quinoa, baies de goji, spiruline... Démêlons le vrai du faux sur ces aliments aux vertus supposées extraordinaires.',
    image:
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=900&h=600&fit=crop',
    publishedAt: '2026-04-05',
    readingTime: 9,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'proteines-vegetales',
    title: 'Protéines végétales : le guide complet',
    excerpt:
      'Tout savoir sur les sources de protéines végétales et comment les intégrer dans votre alimentation quotidienne.',
    image:
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=900&h=600&fit=crop',
    publishedAt: '2026-03-25',
    readingTime: 8,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'omega-3-bienfaits',
    title: 'Les bienfaits des oméga-3 pour la santé',
    excerpt:
      'Pourquoi les oméga-3 sont essentiels et où les trouver dans votre alimentation au quotidien.',
    image:
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=900&h=600&fit=crop',
    publishedAt: '2026-03-12',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'sucres-caches',
    title: 'Sucres cachés : comment les identifier',
    excerpt:
      'Apprendre à repérer les sucres cachés dans les aliments du quotidien et réduire sa consommation sans frustration.',
    image:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=900&h=600&fit=crop',
    publishedAt: '2026-03-01',
    readingTime: 6,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'fibres-alimentaires',
    title: "L'importance des fibres dans votre alimentation",
    excerpt:
      'Les fibres sont essentielles pour une bonne santé digestive. Voici comment en consommer suffisamment chaque jour.',
    image:
      'https://images.unsplash.com/photo-1507367218428-c9104f878385?w=900&h=600&fit=crop',
    publishedAt: '2026-02-18',
    readingTime: 5,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'vitamines-essentielles',
    title: 'Les vitamines essentielles et où les trouver',
    excerpt:
      'Guide complet des vitamines indispensables et des aliments qui en sont riches.',
    image:
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=900&h=600&fit=crop',
    publishedAt: '2026-02-08',
    readingTime: 9,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'index-glycemique',
    title: "Comprendre l'index glycémique des aliments",
    excerpt:
      "L'index glycémique influence votre énergie et votre poids. Apprenez à l'utiliser à votre avantage.",
    image:
      'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=900&h=600&fit=crop',
    publishedAt: '2026-01-28',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'nutrition',
  },
  {
    slug: 'mineraux-oligoelements',
    title: 'Minéraux et oligoéléments : rôles et sources',
    excerpt:
      'Ces nutriments en petites quantités sont cruciaux pour votre santé. Découvrez lesquels et où les trouver.',
    image:
      'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=900&h=600&fit=crop',
    publishedAt: '2026-01-15',
    readingTime: 8,
    author: 'Lucie Cornille',
    category: 'nutrition',
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

export default function NutritionPage() {
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
                  Catégorie · Nutrition
                </span>
                <h1>
                  Comprendre <em>ce que</em>
                  <br />
                  vous <span className='hl'>mangez.</span>
                </h1>
              </div>
              <div className='blog-intro-meta'>
                <div className='stat'>
                  <b>{CATEGORY_COUNTS.nutrition}</b>
                  <span>
                    articles dédiés
                    <br />à la nutrition
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
                    sous-thèmes — macros,
                    <br />
                    micronutriments, glycémie, fibres, mythes
                  </span>
                </div>
              </div>
            </div>

            <div className='blog-topics'>
              <Link href='/blog' className='topic'>
                Tout <span className='count'>{CATEGORY_COUNTS.all}</span>
              </Link>
              <Link href={'/blog/nutrition' as never} className='topic active'>
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
            <span aria-current='page'>Nutrition</span>
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
