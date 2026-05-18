'use client';

import React, { use } from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { getAuthorBySlug } from '@/data/authors';
import { articles } from '@/data/articles';
import { notFound } from 'next/navigation';
import { Mail } from 'lucide-react';

/**
 * Page Auteur — DS v2 Editorial
 *
 * Hero 2-colonnes (identité + bio + social à gauche, avatar ink-bordered
 * à droite) + grille `.acard` des articles signés par l'auteur.
 */

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
  publishedAt: string;
  readingTime: number;
  author: { name: string; title: string };
  editor?: { name: string; title: string };
}

const CATEGORY_LABEL: Record<string, string> = {
  nutrition: 'Nutrition',
  sante: 'Santé',
  'bien-etre': 'Bien-être',
  recettes: 'Recettes',
  conseils: 'Conseils pratiques',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function SocialButton({
  href,
  label,
  external = true,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1.5px solid var(--ns-ink)',
        color: 'var(--ns-ink)',
        background: 'transparent',
        transition:
          'background 200ms var(--ns-ease), color 200ms var(--ns-ease)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--ns-ink)';
        e.currentTarget.style.color = 'var(--ns-peps)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--ns-ink)';
      }}
    >
      {children}
    </a>
  );
}

function ArticleCard({ article }: { article: ArticleData }) {
  const categoryLabel = CATEGORY_LABEL[article.category] ?? article.category;
  return (
    <Link
      href={`/blog/${article.category}/${article.slug}` as never}
      className='acard'
    >
      <div
        className='acard-img'
        style={{
          backgroundImage: article.image
            ? `url('${article.image}')`
            : undefined,
        }}
      />
      <div className='acard-body'>
        <div className='acard-meta'>
          <span className='ns2-tag'>{categoryLabel}</span>
          <span className='ns2-meta'>{article.readingTime} min</span>
        </div>
        <h3>{article.title}</h3>
        <div className='acard-foot'>
          <span>{article.author.name}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function AuthorPage({ params }: PageProps) {
  const { slug } = use(params);
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const authorArticles: ArticleData[] = Object.values(articles).filter(
    article =>
      article.author.name === author.name ||
      article.editor?.name === author.name
  );

  const totalReading = authorArticles.reduce(
    (sum, a) => sum + (a.readingTime ?? 0),
    0
  );
  const categoriesCovered = Array.from(
    new Set(authorArticles.map(a => a.category))
  );

  return (
    <div
      className='ns2 min-h-screen'
      style={{ backgroundColor: 'var(--ns-cream-100)' }}
    >
      <MarketingHeader />
      <div style={{ height: 80 }} />

      <main style={{ paddingBottom: 96 }}>
        {/* Hero éditorial */}
        <section className='blog-intro'>
          <div className='ns2-container'>
            <div className='author-hero-grid'>
              <div>
                <span className='ns2-eyebrow ns2-eyebrow-dot'>
                  Le Journal · Auteur
                </span>
                <h1
                  className='ns2-display'
                  style={{
                    fontSize: 'clamp(40px, 6.5vw, 84px)',
                    margin: '16px 0 12px',
                    lineHeight: 0.95,
                    letterSpacing: '-0.035em',
                    color: 'var(--ns-ink)',
                  }}
                >
                  {author.name}
                </h1>
                <p
                  className='ns2-eyebrow'
                  style={{
                    color: 'var(--ns-ink-3)',
                    letterSpacing: '0.16em',
                    margin: '0 0 28px',
                  }}
                >
                  {author.title}
                </p>
                <p
                  className='ns2-body-lg'
                  style={{
                    margin: '0 0 32px',
                    maxWidth: 560,
                    color: 'var(--ns-ink-2)',
                  }}
                >
                  {author.bio}
                </p>

                {author.social &&
                  (author.social.linkedin ||
                    author.social.twitter ||
                    author.social.email) && (
                    <div>
                      <div
                        className='ns2-eyebrow'
                        style={{
                          marginBottom: 14,
                          color: 'var(--ns-ink-3)',
                        }}
                      >
                        Suivre
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {author.social.linkedin && (
                          <SocialButton
                            href={author.social.linkedin}
                            label='LinkedIn'
                          >
                            <svg
                              width='18'
                              height='18'
                              viewBox='0 0 24 24'
                              fill='currentColor'
                            >
                              <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                            </svg>
                          </SocialButton>
                        )}
                        {author.social.twitter && (
                          <SocialButton
                            href={author.social.twitter}
                            label='Twitter'
                          >
                            <svg
                              width='18'
                              height='18'
                              viewBox='0 0 24 24'
                              fill='currentColor'
                            >
                              <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                            </svg>
                          </SocialButton>
                        )}
                        {author.social.email && (
                          <SocialButton
                            href={`mailto:${author.social.email}`}
                            label='Email'
                            external={false}
                          >
                            <Mail style={{ width: 18, height: 18 }} />
                          </SocialButton>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Avatar — ink-bordered + offset shadow signature */}
              <div className='author-hero-avatar-wrap'>
                <div
                  className='author-hero-avatar'
                  style={{ backgroundImage: `url(${author.image})` }}
                  role='img'
                  aria-label={`Photo de ${author.name}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Articles signés */}
        {authorArticles.length > 0 && (
          <div className='ns2-container'>
            <section className='sec' style={{ borderTop: 0, paddingBottom: 0 }}>
              <div className='sec-head'>
                <div>
                  <span className='ns2-eyebrow ns2-eyebrow-dot'>
                    Articles · {authorArticles.length} publiés
                    {totalReading > 0
                      ? ` · ${totalReading} min de lecture`
                      : ''}
                  </span>
                  <h2>
                    Signés <em>{author.name}</em>
                  </h2>
                </div>
                <Link
                  href='/blog'
                  className='ns2-btn ns2-btn-outline ns2-btn-sm'
                >
                  ← Toutes les catégories
                </Link>
              </div>

              <div className='grid-3'>
                {authorArticles.map(article => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>

              {categoriesCovered.length > 1 && (
                <div
                  style={{
                    marginTop: 48,
                    paddingTop: 24,
                    borderTop: '1px dashed var(--ns-ink-4)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span
                    className='ns2-eyebrow'
                    style={{ color: 'var(--ns-ink-3)' }}
                  >
                    Catégories couvertes
                  </span>
                  {categoriesCovered.map(cat => (
                    <Link
                      key={cat}
                      href={`/blog/${cat}` as never}
                      style={{
                        textDecoration: 'none',
                      }}
                    >
                      <span className='ns2-tag'>
                        {CATEGORY_LABEL[cat] ?? cat}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <MarketingFooter />

      <style jsx global>{`
        .author-hero-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 56px;
          align-items: center;
        }
        .author-hero-avatar-wrap {
          display: flex;
          justify-content: center;
        }
        .author-hero-avatar {
          width: clamp(200px, 22vw, 280px);
          aspect-ratio: 1;
          border-radius: 50%;
          border: 1.5px solid var(--ns-ink);
          background-size: cover;
          background-position: center;
          background-color: var(--ns-cream-200);
          box-shadow: var(--ns-shadow-hard-lg);
        }
        @media (max-width: 900px) {
          .author-hero-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .author-hero-avatar-wrap {
            order: -1;
            justify-content: flex-start;
          }
          .author-hero-avatar {
            width: 180px;
          }
        }
      `}</style>
    </div>
  );
}
