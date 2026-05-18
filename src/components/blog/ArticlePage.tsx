'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { Mail } from 'lucide-react';
import { nameToSlug } from '@/data/authors';

/**
 * Composant ArticlePage — DS v2 Editorial
 *
 * Layout 2 colonnes : sidebar gauche (auteur + éditeur + TOC sticky
 * + partage) | colonne article (meta + h1 Fraunces + image + sections).
 * Reading progress bar peps en haut. Cards d'articles liés en .acard.
 * Restyle complet à partir de l'ancienne version Marcellus/teal.
 */

export interface RelatedArticle {
  slug: string;
  category: string;
  title: string;
  image: string;
  author: string;
}

export interface ArticleContent {
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
  editor: {
    name: string;
    title: string;
  };
  sections: {
    id: string;
    title: string;
    content: string[];
  }[];
  relatedArticles?: RelatedArticle[];
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

/**
 * AvatarBlock — auteur ou éditeur avec photo + identité.
 */
function AvatarBlock({
  name,
  title,
  imgIdx,
  size = 40,
}: {
  name: string;
  title: string;
  imgIdx: number;
  size?: number;
}) {
  return (
    <Link
      href={`/blog/auteurs/${nameToSlug(name)}` as never}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundImage: `url(https://i.pravatar.cc/150?img=${imgIdx})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1.5px solid var(--ns-ink)',
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: 'var(--ns-font-sans-stack)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--ns-ink)',
            lineHeight: 1.3,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: 'var(--ns-font-sans-stack)',
            fontSize: 12,
            color: 'var(--ns-ink-3)',
            lineHeight: 1.4,
            marginTop: 2,
          }}
        >
          {title}
        </div>
      </div>
    </Link>
  );
}

/**
 * ShareIcons — boutons de partage stylés ink avec hover peps.
 */
function ShareIcons({ size = 18 }: { size?: number }) {
  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    background: 'transparent',
    border: '1.5px solid var(--ns-ink)',
    borderRadius: '50%',
    color: 'var(--ns-ink)',
    cursor: 'pointer',
    transition: 'background 200ms var(--ns-ease), color 200ms var(--ns-ease)',
  };
  const onEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'var(--ns-ink)';
    e.currentTarget.style.color = 'var(--ns-peps)';
  };
  const onLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = 'var(--ns-ink)';
  };
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type='button'
        aria-label='Partager sur LinkedIn'
        style={btn}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor'>
          <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
        </svg>
      </button>
      <button
        type='button'
        aria-label='Partager sur Twitter'
        style={btn}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor'>
          <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
        </svg>
      </button>
      <button
        type='button'
        aria-label='Partager sur Facebook'
        style={btn}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor'>
          <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
        </svg>
      </button>
      <button
        type='button'
        aria-label='Partager par email'
        style={btn}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <Mail style={{ width: size, height: size }} />
      </button>
    </div>
  );
}

/**
 * RelatedCard — réutilise .acard pour homogénéité avec /blog/* category.
 */
function RelatedCard({ article }: { article: RelatedArticle }) {
  return (
    <Link
      href={`/blog/${article.category}/${article.slug}` as never}
      className='acard'
    >
      <div
        className='acard-img'
        style={{ backgroundImage: `url('${article.image}')` }}
      />
      <div className='acard-body'>
        <div className='acard-meta'>
          <span className='ns2-tag'>
            {CATEGORY_LABEL[article.category] ?? article.category}
          </span>
        </div>
        <h3>{article.title}</h3>
        <div className='acard-foot'>
          <span>Par {article.author}</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticlePage({ article }: { article: ArticleContent }) {
  const categoryLabel = CATEGORY_LABEL[article.category] ?? article.category;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const [barStyle, setBarStyle] = useState({ top: 0, height: 0 });
  const tocLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section detection
  useEffect(() => {
    const handleScroll = () => {
      const offset = 120;
      let currentSection = '';
      let minDistance = Infinity;

      article.sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = rect.top - offset;
          if (distance <= 0 && Math.abs(distance) < minDistance) {
            minDistance = Math.abs(distance);
            currentSection = section.id;
          }
        }
      });

      if (!currentSection && article.sections.length > 0) {
        currentSection = article.sections[0].id;
      }

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.sections, activeSection]);

  // TOC active bar position
  useEffect(() => {
    if (activeSection && tocLinksRef.current[activeSection]) {
      const activeLink = tocLinksRef.current[activeSection];
      const parentNav = activeLink?.parentElement;
      if (activeLink && parentNav) {
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = parentNav.getBoundingClientRect();
        setBarStyle({
          top: linkRect.top - navRect.top,
          height: linkRect.height,
        });
      }
    }
  }, [activeSection]);

  return (
    <div
      className='ns2 min-h-screen'
      style={{ backgroundColor: 'var(--ns-cream-100)' }}
    >
      {/* Barre de progression de lecture */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'rgba(20, 22, 15, 0.08)',
          zIndex: 1001,
        }}
        aria-hidden='true'
      >
        <div
          style={{
            height: '100%',
            width: `${scrollProgress}%`,
            background: 'var(--ns-peps-deep)',
            transition: 'width 150ms ease-out',
          }}
        />
      </div>

      <MarketingHeader hideAnnouncementBar={true} />
      <div style={{ height: 80 }} />

      <main style={{ paddingBottom: 96, paddingTop: 32 }}>
        <div className='ns2-container'>
          {/* Grid : sidebar + article */}
          <div className='article-grid'>
            {/* Sidebar */}
            <aside className='article-sidebar'>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                  marginBottom: 40,
                }}
              >
                <div>
                  <div
                    className='ns2-eyebrow'
                    style={{ marginBottom: 12, color: 'var(--ns-ink-3)' }}
                  >
                    Auteur
                  </div>
                  <AvatarBlock
                    name={article.author.name}
                    title={article.author.title}
                    imgIdx={1}
                  />
                </div>
                <div>
                  <div
                    className='ns2-eyebrow'
                    style={{ marginBottom: 12, color: 'var(--ns-ink-3)' }}
                  >
                    Éditeur
                  </div>
                  <AvatarBlock
                    name={article.editor.name}
                    title={article.editor.title}
                    imgIdx={2}
                  />
                </div>
              </div>

              {/* TOC + Share — sticky */}
              <div style={{ position: 'sticky', top: 32 }}>
                <div
                  className='ns2-eyebrow'
                  style={{ marginBottom: 16, color: 'var(--ns-ink-3)' }}
                >
                  Dans cet article
                </div>
                <nav style={{ position: 'relative' }}>
                  {/* Vertical bar bg */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      background: 'var(--ns-ink-4)',
                    }}
                  />
                  {/* Active bar */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      width: 3,
                      top: `${barStyle.top}px`,
                      height: `${barStyle.height}px`,
                      background: 'var(--ns-peps-deep)',
                      transition:
                        'top 300ms var(--ns-ease), height 300ms var(--ns-ease)',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      paddingLeft: 16,
                    }}
                  >
                    {article.sections.map(section => {
                      const isActive = section.id === activeSection;
                      return (
                        <a
                          key={section.id}
                          ref={el => {
                            tocLinksRef.current[section.id] = el;
                          }}
                          href={`#${section.id}`}
                          onClick={e => {
                            e.preventDefault();
                            scrollToSection(section.id);
                          }}
                          style={{
                            fontFamily: 'var(--ns-font-sans-stack)',
                            fontSize: 13,
                            lineHeight: 1.4,
                            color: isActive
                              ? 'var(--ns-ink)'
                              : 'var(--ns-ink-3)',
                            fontWeight: isActive ? 600 : 400,
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'color 200ms var(--ns-ease)',
                          }}
                        >
                          {section.title}
                        </a>
                      );
                    })}
                  </div>
                </nav>

                <div style={{ marginTop: 40 }}>
                  <div
                    className='ns2-eyebrow'
                    style={{ marginBottom: 16, color: 'var(--ns-ink-3)' }}
                  >
                    Partager
                  </div>
                  <ShareIcons />
                </div>
              </div>
            </aside>

            {/* Article */}
            <article>
              {/* Meta */}
              <div
                className='ns2-meta'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--ns-ink-3)',
                }}
              >
                <span>{categoryLabel}</span>
                <span aria-hidden='true'>·</span>
                <span>{article.readingTime} min de lecture</span>
                <span aria-hidden='true'>·</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>

              {/* Title */}
              <h1
                className='ns2-display'
                style={{
                  fontSize: 'clamp(36px, 5.2vw, 64px)',
                  margin: '0 0 40px',
                  lineHeight: 1.05,
                  letterSpacing: '-0.035em',
                  color: 'var(--ns-ink)',
                }}
              >
                {article.title}
              </h1>

              {/* Hero image (ns2-frame) */}
              <div
                className='ns2-frame'
                style={{
                  marginBottom: 56,
                  aspectRatio: '16 / 9',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image}
                  alt={article.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>

              {/* Sections */}
              {article.sections.map(section => (
                <section
                  key={section.id}
                  id={section.id}
                  style={{ marginBottom: 56, scrollMarginTop: 100 }}
                >
                  <h2
                    className='ns2-display'
                    style={{
                      fontSize: 'clamp(26px, 3.4vw, 36px)',
                      margin: '0 0 24px',
                      lineHeight: 1.1,
                      letterSpacing: '-0.025em',
                      color: 'var(--ns-ink)',
                    }}
                  >
                    {section.title}
                  </h2>
                  {section.content.map((paragraph, idx) => (
                    <p
                      key={idx}
                      style={{
                        fontFamily: 'var(--ns-font-sans-stack)',
                        fontSize: 17,
                        lineHeight: 1.7,
                        color: 'var(--ns-ink-2)',
                        margin: '0 0 16px',
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </article>
          </div>

          {/* Bloc auteur/éditeur en pied d'article */}
          <div
            style={{
              marginTop: 80,
              paddingTop: 40,
              paddingBottom: 40,
              borderTop: '1.5px solid var(--ns-ink)',
              borderBottom: '1.5px solid var(--ns-ink)',
            }}
          >
            <div className='article-footer-grid'>
              {/* Édité par */}
              <div>
                <div
                  className='ns2-eyebrow'
                  style={{ color: 'var(--ns-ink-3)', marginBottom: 16 }}
                >
                  Édité par
                </div>
                <AvatarBlock
                  name={article.editor.name}
                  title={article.editor.title}
                  imgIdx={2}
                  size={48}
                />
              </div>

              {/* Rédigé par + bio */}
              <div>
                <div
                  className='ns2-eyebrow'
                  style={{ color: 'var(--ns-ink-3)', marginBottom: 16 }}
                >
                  Rédigé par
                </div>
                <Link
                  href={
                    `/blog/auteurs/${nameToSlug(article.author.name)}` as never
                  }
                  style={{
                    display: 'flex',
                    gap: 16,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundImage: 'url(https://i.pravatar.cc/150?img=1)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '1.5px solid var(--ns-ink)',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--ns-font-sans-stack)',
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--ns-ink)',
                      }}
                    >
                      {article.author.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--ns-font-sans-stack)',
                        fontSize: 12,
                        color: 'var(--ns-ink-3)',
                        marginTop: 2,
                        marginBottom: 8,
                      }}
                    >
                      {article.author.title}
                    </div>
                    <p
                      className='ns2-body'
                      style={{ margin: 0, color: 'var(--ns-ink-2)' }}
                    >
                      Lucie est nutritionniste diplômée (ASCA/RME) passionnée
                      par l&apos;alimentation santé. Elle partage ses
                      connaissances et conseils pratiques pour vous aider à
                      adopter une alimentation équilibrée et durable au
                      quotidien.
                    </p>
                  </div>
                </Link>
              </div>

              {/* Partage */}
              <div className='article-footer-share'>
                <div
                  className='ns2-eyebrow'
                  style={{ color: 'var(--ns-ink-3)', marginBottom: 16 }}
                >
                  Partager
                </div>
                <ShareIcons />
              </div>
            </div>
          </div>

          {/* Articles liés */}
          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <div style={{ marginTop: 96 }}>
              <h2
                className='ns2-display'
                style={{
                  fontSize: 'clamp(32px, 4.5vw, 52px)',
                  margin: '0 0 48px',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: 'var(--ns-ink)',
                }}
              >
                Ces articles pourraient vous{' '}
                <em style={{ fontStyle: 'italic', fontWeight: 400 }}>
                  intéresser
                </em>
              </h2>
              <div className='grid-3'>
                {article.relatedArticles.slice(0, 6).map(relatedArticle => (
                  <RelatedCard
                    key={relatedArticle.slug}
                    article={relatedArticle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <MarketingFooter />

      <style jsx global>{`
        .article-grid {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 64px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .article-sidebar {
          display: block;
        }
        .article-footer-grid {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 32px;
          align-items: start;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) {
          .article-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .article-sidebar {
            display: none;
          }
          .article-footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .article-footer-share {
            border-top: 1px dashed var(--ns-ink-4);
            padding-top: 24px;
          }
        }
      `}</style>
    </div>
  );
}
