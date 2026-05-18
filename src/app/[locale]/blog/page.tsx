'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';

/**
 * Page Blog NutriSensia — DS v2 Editorial
 *
 * Refonte intégrale d'après BLOG_PAGE.md : intro éditoriale,
 * lead spread asymétrique 1.55fr/1fr, marquee ink, sections
 * thématiques (Nutrition / Santé / Bien-être / Recettes / Conseils)
 * et newsletter en panneau ink. Toutes les cards utilisent
 * le hover signature `translate(-3,-3) + 6px 6px 0 ink`.
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

const allArticles: Article[] = [
  {
    slug: 'alimentation-equilibree-bases',
    title: "Les bases d'une alimentation équilibrée pour une vie saine",
    excerpt:
      'Découvrez les principes fondamentaux pour construire une alimentation saine et durable au quotidien. Apprenez à équilibrer vos repas avec les bons nutriments pour optimiser votre énergie et votre bien-être.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=750&fit=crop',
    publishedAt: '2026-05-02',
    readingTime: 8,
    author: 'Sarah Dupont',
    category: 'nutrition',
  },
  {
    slug: 'microbiote-intestinal',
    title: 'Prendre soin de son microbiote intestinal',
    excerpt:
      'Le second cerveau, l’intestin. On démêle la science récente, sans jargon, et on en tire 5 gestes concrets à intégrer cette semaine.',
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1000&h=750&fit=crop',
    publishedAt: '2026-04-28',
    readingTime: 10,
    author: 'Sarah Dupont',
    category: 'sante',
  },
  {
    slug: 'systeme-immunitaire-alimentation',
    title: "Renforcer son système immunitaire par l'alimentation",
    excerpt:
      'Découvrez les nutriments essentiels et les aliments clés pour booster naturellement vos défenses immunitaires.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=600&fit=crop',
    publishedAt: '2026-04-20',
    readingTime: 7,
    author: 'Sarah Dupont',
    category: 'sante',
  },
  {
    slug: 'sante-cardiovasculaire',
    title: 'Protéger sa santé cardiovasculaire au quotidien',
    excerpt:
      'Les habitudes alimentaires qui contribuent à maintenir un cœur en bonne santé et prévenir les maladies cardiovasculaires.',
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&h=600&fit=crop',
    publishedAt: '2026-04-12',
    readingTime: 9,
    author: 'Sarah Dupont',
    category: 'sante',
  },
  {
    slug: 'alimentation-anti-inflammatoire',
    title: "L'alimentation anti-inflammatoire : guide complet",
    excerpt:
      "Réduisez l'inflammation chronique grâce à des choix alimentaires judicieux. Les meilleurs aliments et habitudes à adopter.",
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=600&fit=crop',
    publishedAt: '2026-04-08',
    readingTime: 7,
    author: 'Sarah Dupont',
    category: 'nutrition',
  },
  {
    slug: 'gerer-stress-alimentation',
    title: "Gérer le stress par l'alimentation",
    excerpt:
      "Certains aliments peuvent aider à réguler le stress et l'anxiété. Découvrez les nutriments essentiels pour un système nerveux apaisé.",
    image:
      'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=900&h=1100&fit=crop',
    publishedAt: '2026-04-04',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'bien-etre',
  },
  {
    slug: 'petit-dejeuner-energetique',
    title: 'Petits-déjeuners énergétiques pour bien commencer',
    excerpt:
      "Des recettes simples et nutritives pour un petit-déjeuner qui vous donnera l'énergie nécessaire toute la matinée.",
    image:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=800&fit=crop',
    publishedAt: '2026-03-30',
    readingTime: 5,
    author: 'Sarah Dupont',
    category: 'recettes',
    difficulty: 'facile',
  },
  {
    slug: 'bowls-equilibres',
    title: 'Bowls équilibrés : 10 recettes colorées et nutritives',
    excerpt:
      'Découvrez comment composer des bowls savoureux et complets pour vos déjeuners et dîners.',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop',
    publishedAt: '2026-03-22',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'recettes',
    difficulty: 'facile',
  },
  {
    slug: 'snacks-sains',
    title: 'Snacks sains pour combler les petites faims',
    excerpt:
      'Des idées de collations nutritives et faciles à préparer pour éviter les grignotages malsains.',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=800&fit=crop',
    publishedAt: '2026-03-15',
    readingTime: 4,
    author: 'Sarah Dupont',
    category: 'recettes',
    difficulty: 'facile',
  },
  {
    slug: 'soupes-nourrissantes',
    title: 'Soupes nourrissantes pour les soirs d’hiver',
    excerpt:
      'Quatre recettes de soupes complètes, riches en légumes et en protéines végétales.',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=800&fit=crop',
    publishedAt: '2026-03-08',
    readingTime: 5,
    author: 'Sarah Dupont',
    category: 'recettes',
    difficulty: 'moyen',
  },
  {
    slug: 'hydratation-importance',
    title: "L'importance de l'hydratation pour votre santé",
    excerpt:
      "L'eau est essentielle à notre organisme. Découvrez combien boire et comment optimiser votre hydratation au quotidien.",
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&h=600&fit=crop',
    publishedAt: '2026-03-02',
    readingTime: 4,
    author: 'Sarah Dupont',
    category: 'conseils',
  },
  {
    slug: 'lire-etiquettes-alimentaires',
    title: 'Apprendre à lire les étiquettes alimentaires',
    excerpt:
      'Comprendre les informations nutritionnelles sur les emballages pour faire des choix éclairés au supermarché.',
    image:
      'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=900&h=600&fit=crop',
    publishedAt: '2026-02-26',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'conseils',
  },
  {
    slug: 'courses-intelligentes',
    title: 'Faire ses courses intelligemment pour mieux manger',
    excerpt:
      'Des astuces pratiques pour organiser vos courses et remplir votre panier de produits sains et nutritifs.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=600&fit=crop',
    publishedAt: '2026-02-20',
    readingTime: 5,
    author: 'Sarah Dupont',
    category: 'conseils',
  },
  {
    slug: 'superaliments-mythes-realites',
    title: 'Superaliments : entre mythes et réalités',
    excerpt:
      'Quinoa, baies de goji, spiruline... Démêlons le vrai du faux sur ces aliments aux vertus supposées extraordinaires.',
    image:
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=900&h=600&fit=crop',
    publishedAt: '2026-02-15',
    readingTime: 9,
    author: 'Sarah Dupont',
    category: 'nutrition',
  },
  {
    slug: 'sommeil-alimentation',
    title: "Comment l'alimentation influence votre sommeil",
    excerpt:
      'Ce que vous mangez affecte directement la qualité de votre sommeil. Voici les aliments à privilégier et ceux à éviter.',
    image:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=900&h=1100&fit=crop',
    publishedAt: '2026-02-10',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'bien-etre',
  },
  {
    slug: 'meditation-pleine-conscience',
    title: 'Méditation et pleine conscience au quotidien',
    excerpt:
      'Comment intégrer la méditation dans votre routine quotidienne pour réduire le stress et améliorer votre bien-être global.',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&h=1100&fit=crop',
    publishedAt: '2026-02-04',
    readingTime: 7,
    author: 'Sarah Dupont',
    category: 'bien-etre',
  },
  {
    slug: 'proteines-vegetales',
    title: 'Protéines végétales : le guide complet',
    excerpt:
      'Tout savoir sur les sources de protéines végétales et comment les intégrer dans votre alimentation quotidienne.',
    image:
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=900&h=600&fit=crop',
    publishedAt: '2026-01-30',
    readingTime: 8,
    author: 'Sarah Dupont',
    category: 'nutrition',
  },
  {
    slug: 'omega-3-bienfaits',
    title: 'Les bienfaits des oméga-3 pour la santé',
    excerpt:
      'Découvrez pourquoi les oméga-3 sont essentiels et où les trouver dans votre alimentation.',
    image:
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=900&h=600&fit=crop',
    publishedAt: '2026-01-24',
    readingTime: 7,
    author: 'Sarah Dupont',
    category: 'nutrition',
  },
  {
    slug: 'sucres-caches',
    title: 'Sucres cachés : comment les identifier',
    excerpt:
      'Apprenez à repérer les sucres cachés dans les aliments du quotidien et réduisez votre consommation.',
    image:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=900&h=600&fit=crop',
    publishedAt: '2026-01-18',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'nutrition',
  },
  {
    slug: 'fibres-alimentaires',
    title: "L'importance des fibres dans votre alimentation",
    excerpt:
      'Les fibres sont essentielles pour une bonne santé digestive. Voici comment en consommer suffisamment.',
    image:
      'https://images.unsplash.com/photo-1507367218428-c9104f878385?w=900&h=600&fit=crop',
    publishedAt: '2026-01-12',
    readingTime: 5,
    author: 'Sarah Dupont',
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

export default function BlogPage() {
  const totalCount = allArticles.length;
  const counts: Record<string, number> = {
    nutrition: allArticles.filter(a => a.category === 'nutrition').length,
    sante: allArticles.filter(a => a.category === 'sante').length,
    'bien-etre': allArticles.filter(a => a.category === 'bien-etre').length,
    recettes: allArticles.filter(a => a.category === 'recettes').length,
    conseils: allArticles.filter(a => a.category === 'conseils').length,
  };

  const lead = allArticles[0];
  const trending = allArticles.slice(1, 5);
  const nutritionList = allArticles.filter(
    a => a.category === 'nutrition' && a.slug !== lead.slug
  );
  const santeList = allArticles.filter(a => a.category === 'sante');
  const bienEtreList = allArticles.filter(a => a.category === 'bien-etre');
  const recettesList = allArticles.filter(a => a.category === 'recettes');
  const conseilsList = allArticles.filter(a => a.category === 'conseils');

  return (
    <div
      className='ns2 min-h-screen'
      style={{ backgroundColor: 'var(--ns-cream-100)' }}
    >
      <MarketingHeader />
      <div style={{ height: 80 }} />

      <main>
        {/* 3.1 — Editorial intro */}
        <section className='blog-intro'>
          <div className='ns2-container'>
            <div className='blog-intro-grid'>
              <div>
                <span className='ns2-eyebrow ns2-eyebrow-dot'>
                  Le Journal NutriSensia
                </span>
                <h1>
                  Tout savoir sur la <em>nutrition</em>,
                  <br />
                  avec <span className='hl'>NutriSensia.</span>
                </h1>
              </div>
              <div className='blog-intro-meta'>
                <div className='stat'>
                  <b>{totalCount}</b>
                  <span>
                    articles publiés depuis
                    <br />
                    janvier 2026
                  </span>
                </div>
                <div className='stat'>
                  <b>5</b>
                  <span>
                    thèmes éditoriaux —<br />
                    nutrition, santé, bien-être, recettes, conseils
                  </span>
                </div>
                <div className='stat'>
                  <b>1×</b>
                  <span>
                    par semaine, dans
                    <br />
                    votre boîte mail
                  </span>
                </div>
              </div>
            </div>

            <div className='blog-topics'>
              <Link href='/blog' className='topic active'>
                Tout <span className='count'>{totalCount}</span>
              </Link>
              <Link href={'/blog/nutrition' as never} className='topic'>
                Nutrition <span className='count'>{counts.nutrition}</span>
              </Link>
              <Link href={'/blog/sante' as never} className='topic'>
                Santé <span className='count'>{counts.sante}</span>
              </Link>
              <Link href={'/blog/bien-etre' as never} className='topic'>
                Bien-être <span className='count'>{counts['bien-etre']}</span>
              </Link>
              <Link href={'/blog/recettes' as never} className='topic'>
                Recettes <span className='count'>{counts.recettes}</span>
              </Link>
              <Link href={'/blog/conseils' as never} className='topic'>
                Conseils pratiques{' '}
                <span className='count'>{counts.conseils}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3.2 — Lead spread */}
        <div className='ns2-container'>
          <section className='lead-spread'>
            <Link href={articleHref(lead)} className='lead-card'>
              <div
                className='lead-card-img'
                style={{ backgroundImage: `url('${lead.image}')` }}
              >
                <div className='sticker-tl'>
                  <div className='ns2-sticker'>À LIRE ↘</div>
                </div>
              </div>
              <div className='lead-card-body'>
                <div>
                  <span className='ns2-eyebrow ns2-eyebrow-dot'>
                    {CATEGORY_LABEL[lead.category]} · à la une
                  </span>
                  <h2>
                    Les bases d&apos;une <em>alimentation équilibrée</em>
                  </h2>
                </div>
                <div className='lead-card-meta'>
                  <b>{lead.author}</b>
                  {lead.readingTime} min · {formatDate(lead.publishedAt)}
                </div>
              </div>
            </Link>

            <div className='lead-rail'>
              <div className='lead-rail-head'>
                <h4>
                  Tendances <em>cette semaine</em>
                </h4>
                <span className='ns2-meta'>{trending.length} lectures</span>
              </div>
              {trending.map(article => (
                <Link
                  key={article.slug}
                  href={articleHref(article)}
                  className='rail-item'
                >
                  <div
                    className='rail-item-img'
                    style={{ backgroundImage: `url('${article.image}')` }}
                  />
                  <div>
                    <div className='rail-item-eyebrow'>
                      {CATEGORY_LABEL[article.category]}
                    </div>
                    <h3>{article.title}</h3>
                    <span className='ns2-meta'>{article.readingTime} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* 3.3 — Marquee */}
        <div className='ns2-marquee' aria-hidden='true'>
          <div className='ns2-marquee-track'>
            {[...Array(4)].flatMap((_, dup) =>
              [
                'manger en conscience',
                'le corps a raison',
                'douceur > performance',
                'une nutrition vivante',
              ].map((word, i) => (
                <span key={`${dup}-${i}`} className='ns2-marquee-item'>
                  <span>{word}</span>
                  <span className='ns2-marquee-star'>✦</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* 3.4 — Nutrition (3-up) */}
        <div className='ns2-container'>
          <section className='sec' style={{ borderTop: 0 }}>
            <div className='sec-head'>
              <div>
                <span className='ns2-eyebrow ns2-eyebrow-dot'>
                  Nutrition · {counts.nutrition} articles
                </span>
                <h2>
                  Comprendre ce que <em>vous mangez</em>
                </h2>
              </div>
              <Link
                href={'/blog/nutrition' as never}
                className='ns2-btn ns2-btn-outline ns2-btn-sm'
              >
                Voir tout →
              </Link>
            </div>

            <div className='grid-3'>
              {nutritionList.slice(0, 3).map((article, i) => (
                <Link
                  key={article.slug}
                  href={articleHref(article)}
                  className='acard'
                >
                  <div
                    className='acard-img'
                    style={{ backgroundImage: `url('${article.image}')` }}
                  >
                    {i === 0 && (
                      <div className='sticker-tl'>
                        <div className='ns2-sticker'>NOUVEAU</div>
                      </div>
                    )}
                  </div>
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

        {/* 3.5 — Santé (1 feature + 2 secondaires) */}
        <div className='ns2-container'>
          <section className='sec'>
            <div className='sec-head'>
              <div>
                <span className='ns2-eyebrow ns2-eyebrow-dot'>
                  Santé · {counts.sante} articles
                </span>
                <h2>
                  Prévenir, comprendre, <em>équilibrer</em>
                </h2>
              </div>
              <Link
                href={'/blog/sante' as never}
                className='ns2-btn ns2-btn-outline ns2-btn-sm'
              >
                Voir tout →
              </Link>
            </div>

            <div className='sante-grid'>
              {santeList[0] && (
                <Link
                  href={articleHref(santeList[0])}
                  className='sante-feature'
                >
                  <div
                    className='sante-feature-img'
                    style={{
                      backgroundImage: `url('${santeList[0].image}')`,
                    }}
                  />
                  <div className='sante-feature-body'>
                    <div>
                      <span className='ns2-eyebrow ns2-eyebrow-dot'>
                        Dossier · à la une
                      </span>
                      <h3>{santeList[0].title}</h3>
                      <p className='ns2-body' style={{ margin: 0 }}>
                        {santeList[0].excerpt}
                      </p>
                    </div>
                    <div className='acard-foot' style={{ marginTop: 32 }}>
                      <span>
                        {santeList[0].author} · {santeList[0].readingTime} min
                      </span>
                      <span>{formatDate(santeList[0].publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              )}

              <div className='sante-side'>
                {santeList.slice(1, 3).map(article => (
                  <Link
                    key={article.slug}
                    href={articleHref(article)}
                    className='acard'
                  >
                    <div
                      className='acard-img sante-side-img'
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
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 3.6 — Newsletter (panneau ink) */}
        <div className='ns2-container'>
          <section style={{ padding: '40px 0' }}>
            <div className='newsletter'>
              <div>
                <span
                  className='ns2-eyebrow'
                  style={{ color: 'var(--ns-peps)' }}
                >
                  ↘ Chaque semaine
                </span>
                <h3>
                  Restez informé·e
                  <br />
                  <em>sans spam.</em>
                </h3>
                <p>
                  Nos meilleurs conseils nutrition, recettes exclusives et
                  actualités, dans votre boîte mail. Une fois par semaine, rien
                  d&apos;autre.
                </p>
                <div className='newsletter-meta'>
                  <span>
                    <b>2 400+</b> abonnés
                  </span>
                  <span>
                    <b>0</b> spam, jamais
                  </span>
                  <span>
                    désinscription en <b>1 clic</b>
                  </span>
                </div>
              </div>
              <form onSubmit={e => e.preventDefault()}>
                <input
                  type='email'
                  placeholder='votre@email.fr'
                  aria-label='Adresse email'
                  required
                />
                <button type='submit'>S&apos;abonner ↘</button>
              </form>
            </div>
          </section>
        </div>

        {/* 3.7 — Bien-être (3-up portrait) */}
        <div className='ns2-container'>
          <section className='sec'>
            <div className='sec-head'>
              <div>
                <span className='ns2-eyebrow ns2-eyebrow-dot'>
                  Bien-être · {counts['bien-etre']} articles
                </span>
                <h2>
                  Pour le corps <em>&amp; l&apos;esprit</em>
                </h2>
              </div>
              <Link
                href={'/blog/bien-etre' as never}
                className='ns2-btn ns2-btn-outline ns2-btn-sm'
              >
                Voir tout →
              </Link>
            </div>

            <div className='grid-3'>
              {bienEtreList.slice(0, 3).map(article => (
                <Link
                  key={article.slug}
                  href={articleHref(article)}
                  className='acard'
                >
                  <div
                    className='acard-img acard-img-portrait'
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
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* 3.8 — Recettes (4-up serré, "carnet") */}
        <div className='ns2-container'>
          <section className='sec'>
            <div className='sec-head'>
              <div>
                <span className='ns2-eyebrow ns2-eyebrow-dot'>
                  Recettes · {counts.recettes} articles
                </span>
                <h2>
                  Cuisiner simple, <em>nutritif</em>
                </h2>
              </div>
              <Link
                href={'/blog/recettes' as never}
                className='ns2-btn ns2-btn-outline ns2-btn-sm'
              >
                Voir tout →
              </Link>
            </div>

            <div className='grid-4'>
              {recettesList.slice(0, 4).map(article => (
                <Link
                  key={article.slug}
                  href={articleHref(article)}
                  className='rec-card'
                >
                  <div
                    className='rec-card-img'
                    style={{ backgroundImage: `url('${article.image}')` }}
                  />
                  <div className='rec-card-body'>
                    <span className='ns2-tag'>
                      {CATEGORY_LABEL[article.category]}
                    </span>
                    <h3>{article.title}</h3>
                    <div className='ns2-meta' style={{ marginTop: 12 }}>
                      {article.readingTime} min ·{' '}
                      {article.difficulty ?? 'facile'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* 3.9 — Conseils pratiques (3-up) */}
        <div className='ns2-container'>
          <section className='sec'>
            <div className='sec-head'>
              <div>
                <span className='ns2-eyebrow ns2-eyebrow-dot'>
                  Conseils pratiques · {counts.conseils} articles
                </span>
                <h2>
                  Au quotidien, <em>sans complications</em>
                </h2>
              </div>
              <Link
                href={'/blog/conseils' as never}
                className='ns2-btn ns2-btn-outline ns2-btn-sm'
              >
                Voir tout →
              </Link>
            </div>

            <div className='grid-3'>
              {conseilsList.slice(0, 3).map(article => (
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
