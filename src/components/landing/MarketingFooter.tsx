'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Facebook,
  Check,
  Send,
  ArrowRight,
} from 'lucide-react';
import { useGlobalFirstVisit } from '@/hooks/useGlobalFirstVisit';

/**
 * Marketing footer — DS v2 (sage / cream / peps + ink wordmark giant).
 * Top marquee strip → 4-column grid on cream → hard-bordered newsletter card →
 * giant Fraunces wordmark → ink legal bar.
 */
export function MarketingFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const { isFirstVisit } = useGlobalFirstVisit();

  const showContent = !isFirstVisit || isInView;
  const getHiddenStyle = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };
  const getTransition = (delay: number) =>
    isFirstVisit && isInView
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  const navigationLinks = [
    { label: 'À Propos', href: '/a-propos' },
    { label: 'Notre Approche', href: '/approche' },
    { label: 'Spécialisations', href: '/specialisations' },
    { label: 'Prix', href: '/prix' },
    { label: 'Plateforme', href: '/plateforme' },
    { label: 'Journal', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Confidentialité', href: '/confidentialite' },
    { label: 'CGU', href: '/conditions-generales' },
    { label: 'CGV', href: '/cgv' },
  ];

  const socialLinks = [
    {
      icon: Instagram,
      href: 'https://instagram.com/nutrisensia',
      label: 'Instagram',
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/in/nutrisensia',
      label: 'LinkedIn',
    },
    {
      icon: Facebook,
      href: 'https://facebook.com/nutrisensia',
      label: 'Facebook',
    },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('loading');
    setTimeout(() => {
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <footer ref={ref} id='main-footer'>
      {/* ── Main grid on ink ── */}
      <div
        style={{
          backgroundColor: 'var(--ns-ink)',
          color: 'var(--ns-cream-100)',
          paddingTop: 'var(--ns-sp-20)',
          paddingBottom: 'var(--ns-sp-12)',
        }}
      >
        <div className='ns2-container'>
          <motion.div
            style={getHiddenStyle(30)}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={getTransition(0)}
            className='grid grid-cols-1 md:grid-cols-12 gap-10'
          >
            {/* Brand column */}
            <div className='md:col-span-5'>
              <Link
                href='/'
                className='ns2-display'
                style={{
                  fontSize: 36,
                  color: 'var(--ns-cream-100)',
                  textDecoration: 'none',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                NutriSensia
                <span style={{ color: 'var(--ns-peps)' }}>.</span>
              </Link>
              <p
                className='ns2-body'
                style={{
                  marginTop: 20,
                  maxWidth: 360,
                  color: 'rgba(250, 246, 234, 0.7)',
                }}
              >
                Une nutrition <em>douce</em>, vivante, qui s'adapte à votre vie.
                Pas l'inverse.
              </p>

              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span
                  className='ns2-tag'
                  style={{
                    background: 'transparent',
                    borderColor: 'var(--ns-cream-100)',
                    color: 'var(--ns-cream-100)',
                  }}
                >
                  <Check className='w-3.5 h-3.5' />
                  Diplômée TCMN
                </span>
                <span
                  className='ns2-tag'
                  style={{
                    background: 'transparent',
                    borderColor: 'var(--ns-cream-100)',
                    color: 'var(--ns-cream-100)',
                  }}
                >
                  <Check className='w-3.5 h-3.5' />
                  ASCA & RME
                </span>
              </div>

              <div
                style={{
                  marginTop: 28,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {socialLinks.map(s => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={s.label}
                      style={{
                        width: 40,
                        height: 40,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'var(--ns-bw) solid var(--ns-cream-100)',
                        borderRadius: 999,
                        color: 'var(--ns-cream-100)',
                        background: 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--ns-peps)';
                        e.currentTarget.style.color = 'var(--ns-ink)';
                        e.currentTarget.style.borderColor = 'var(--ns-peps)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--ns-cream-100)';
                        e.currentTarget.style.borderColor =
                          'var(--ns-cream-100)';
                      }}
                    >
                      <Icon className='w-4 h-4' strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className='md:col-span-3'>
              <div
                className='ns2-eyebrow ns2-eyebrow-dot'
                style={{ color: 'var(--ns-cream-100)' }}
              >
                Naviguer
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  margin: '20px 0 0',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {navigationLinks.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      style={{
                        fontFamily: 'var(--ns-font-sans-stack)',
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'rgba(250, 246, 234, 0.75)',
                        textDecoration: 'none',
                      }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className='md:col-span-4'>
              <div
                className='ns2-eyebrow ns2-eyebrow-dot'
                style={{ color: 'var(--ns-cream-100)' }}
              >
                Nous écrire
              </div>
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontFamily: 'var(--ns-font-sans-stack)',
                  fontSize: 14,
                  color: 'rgba(250, 246, 234, 0.75)',
                }}
              >
                <a
                  href='mailto:contact@nutrisensia.ch'
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <Mail className='w-4 h-4' />
                  contact@nutrisensia.ch
                </a>
                <a
                  href='tel:+41XXXXXXXXX'
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <Phone className='w-4 h-4' />
                  +41 XX XXX XX XX
                </a>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <MapPin className='w-4 h-4' />
                  Lausanne, Suisse
                </span>
              </div>

              {/* Newsletter card */}
              <div
                style={{
                  marginTop: 28,
                  background: 'var(--ns-cream-50)',
                  border: 'var(--ns-bw) solid var(--ns-ink)',
                  borderRadius: 'var(--ns-r-md)',
                  padding: 20,
                  boxShadow: 'var(--ns-shadow-hard)',
                }}
              >
                <div className='ns2-eyebrow'>Newsletter</div>
                <h4
                  className='ns2-display'
                  style={{
                    fontSize: 22,
                    marginTop: 8,
                    color: 'var(--ns-ink)',
                    lineHeight: 1.2,
                  }}
                >
                  Conseils utiles,{' '}
                  <em>
                    <span className='ns2-hl'>une fois par mois</span>
                  </em>
                  . Pas de spam, pas de bla-bla.
                </h4>
                <form
                  onSubmit={handleNewsletterSubmit}
                  style={{ marginTop: 14, display: 'flex', gap: 8 }}
                >
                  <input
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='votre@email.ch'
                    aria-label='Adresse email'
                    disabled={
                      newsletterStatus === 'loading' ||
                      newsletterStatus === 'success'
                    }
                    className='ns2-input'
                    style={{
                      padding: '10px 14px',
                      fontSize: 14,
                      flex: 1,
                    }}
                  />
                  <button
                    type='submit'
                    aria-label="S'inscrire"
                    disabled={
                      newsletterStatus === 'loading' ||
                      newsletterStatus === 'success'
                    }
                    className='ns2-btn ns2-btn-peps ns2-btn-sm'
                    style={{ padding: '10px 14px' }}
                  >
                    {newsletterStatus === 'loading' && (
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          border: '2px solid currentColor',
                          borderTopColor: 'transparent',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                    )}
                    {newsletterStatus === 'success' && (
                      <Check className='w-4 h-4' />
                    )}
                    {(newsletterStatus === 'idle' ||
                      newsletterStatus === 'error') && (
                      <Send className='w-4 h-4' />
                    )}
                  </button>
                </form>
                {newsletterStatus === 'error' && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: 'var(--ns-coral)',
                    }}
                  >
                    Email invalide.
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Pro CTA strip */}
          <div
            style={{
              marginTop: 48,
              padding: '20px 24px',
              border: 'var(--ns-bw) solid var(--ns-cream-100)',
              borderRadius: 'var(--ns-r-md)',
              background: 'rgba(250, 246, 234, 0.05)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                className='ns2-eyebrow'
                style={{ color: 'var(--ns-cream-100)' }}
              >
                Pour les pros
              </div>
              <p
                className='ns2-body'
                style={{ marginTop: 4, color: 'var(--ns-cream-100)' }}
              >
                Vous êtes diététicien·ne&nbsp;? On construit la plateforme avec
                vous.
              </p>
            </div>
            <Link
              href='/inscription/nutritionniste'
              className='ns2-btn ns2-btn-sm'
              style={{
                background: 'var(--ns-peps)',
                color: 'var(--ns-ink)',
                borderColor: 'var(--ns-peps)',
              }}
            >
              Devenir partenaire
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Legal bar (ink, separated by dashed cream line) ── */}
      <div
        style={{
          background: 'var(--ns-ink)',
          color: 'var(--ns-cream-100)',
          padding: '20px 0',
          borderTop: '1px dashed rgba(250, 246, 234, 0.2)',
        }}
      >
        <div
          className='ns2-container flex flex-col md:flex-row gap-4 items-center justify-between'
          style={{ fontSize: 13 }}
        >
          <p
            style={{
              fontFamily: 'var(--ns-font-sans-stack)',
              color: 'var(--ns-cream-100)',
              opacity: 0.7,
            }}
          >
            © {new Date().getFullYear()} NutriSensia — Lausanne, Suisse
          </p>
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 18,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {legalLinks.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  style={{
                    fontFamily: 'var(--ns-font-sans-stack)',
                    color: 'var(--ns-cream-100)',
                    opacity: 0.7,
                    textDecoration: 'none',
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </footer>
  );
}
