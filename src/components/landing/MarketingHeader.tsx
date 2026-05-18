'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, User, ArrowRight } from 'lucide-react';
import { useGlobalFirstVisit } from '@/hooks/useGlobalFirstVisit';
import { useAuthSafe } from '@/contexts/AuthContext';

/**
 * Marketing header — DS v2 (sage / cream / peps + hard 1.5px ink borders).
 * Floating pill with offset ink shadow, ink announcement strip with peps sticker,
 * Inter nav links (active = lime highlight), peps + outline CTAs, hard-bordered
 * mobile sheet.
 */
export function MarketingHeader({
  hideAnnouncementBar = false,
  hideOnScroll = false,
}: {
  hideAnnouncementBar?: boolean;
  hideOnScroll?: boolean;
} = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [announcementInView, setAnnouncementInView] = useState(true);
  const pathname = usePathname();
  const { isFirstVisit } = useGlobalFirstVisit();
  const { isAuthenticated } = useAuthSafe();

  const ANNOUNCEMENT_HEIGHT = 44;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setAnnouncementInView(currentScrollY < ANNOUNCEMENT_HEIGHT);

    if (hideOnScroll) {
      setHidden(currentScrollY > 100);
    } else if (currentScrollY > 150) {
      if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 5) {
        setHidden(true);
      } else if (lastScrollY - currentScrollY > 5) {
        setHidden(false);
      }
    } else {
      setHidden(false);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY, hideOnScroll]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navigationLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/approche', label: 'Notre Approche' },
    { href: '/prix', label: 'Prix' },
    { href: '/plateforme', label: 'Coach 24/7' },
    { href: '/a-propos', label: 'À Propos' },
    { href: '/blog', label: 'Journal' },
  ];

  const headerVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 400, damping: 40 },
    },
    hidden: {
      y: -20,
      opacity: 0,
      transition: { type: 'spring' as const, stiffness: 400, damping: 40 },
    },
  };

  const announcementVariants = {
    initial: { height: 0, opacity: 0 },
    animate: {
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <>
      {/* ── Announcement strip ── */}
      <AnimatePresence>
        {!hideAnnouncementBar && announcementVisible && (
          <motion.div
            variants={announcementVariants}
            initial={isFirstVisit ? 'initial' : false}
            animate='animate'
            exit='exit'
            style={{
              backgroundColor: 'var(--ns-ink)',
              color: 'var(--ns-cream-100)',
              overflow: 'hidden',
              borderBottom: 'var(--ns-bw) solid var(--ns-ink)',
            }}
          >
            <div className='ns2-container relative flex items-center justify-center gap-3 py-2.5'>
              <span
                style={{
                  fontFamily: 'var(--ns-font-script-stack)',
                  fontSize: '20px',
                  color: 'var(--ns-peps)',
                  lineHeight: 1,
                }}
              >
                ★
              </span>
              <Link
                href='/ressources'
                style={{
                  fontFamily: 'var(--ns-font-sans-stack)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ns-cream-100)',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  className='ns2-eyebrow'
                  style={{ color: 'var(--ns-peps)' }}
                >
                  À lire
                </span>
                <span style={{ color: 'var(--ns-ink-4)' }}>—</span>
                Nos articles, parce que vous méritez mieux qu&apos;un reel à 2 h
                du matin
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ display: 'inline-flex' }}
                >
                  <ChevronRight className='w-4 h-4' />
                </motion.span>
              </Link>
              <button
                onClick={() => setAnnouncementVisible(false)}
                aria-label="Fermer l'annonce"
                style={{
                  position: 'absolute',
                  right: 'var(--ns-gutter)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ns-cream-100)',
                  padding: 4,
                  display: 'inline-flex',
                }}
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating header pill ── */}
      <div
        style={{
          position: 'fixed',
          top:
            !hideAnnouncementBar && announcementVisible && announcementInView
              ? `${ANNOUNCEMENT_HEIGHT + 12}px`
              : '12px',
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '0 16px',
          pointerEvents: 'none',
          transition: 'top 0.3s ease',
        }}
      >
        <motion.header
          variants={headerVariants}
          animate={hidden ? 'hidden' : 'visible'}
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            backgroundColor: 'var(--ns-cream-100)',
            border: 'var(--ns-bw) solid var(--ns-ink)',
            borderRadius: 'var(--ns-r-pill)',
            boxShadow: 'var(--ns-shadow-hard)',
            pointerEvents: 'auto',
            padding: '8px 12px 8px 24px',
          }}
        >
          <nav className='flex items-center justify-between gap-4'>
            {/* Logo */}
            <Link
              href='/'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <span
                className='ns2-display'
                style={{
                  fontSize: 22,
                  color: 'var(--ns-ink)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                NutriSensia
                <span
                  style={{
                    color: 'var(--ns-peps-deep)',
                    marginLeft: 1,
                  }}
                >
                  .
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <ul
              className='hidden lg:flex items-center justify-center'
              style={{
                listStyle: 'none',
                gap: 4,
                margin: 0,
                padding: 0,
                flex: 1,
              }}
            >
              {navigationLinks.map(link => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        display: 'inline-block',
                        padding: '8px 14px',
                        fontFamily: 'var(--ns-font-sans-stack)',
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: 'var(--ns-ink)',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                      }}
                    >
                      <span className={isActive ? 'ns2-hl' : undefined}>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop actions */}
            <div className='hidden lg:flex items-center gap-2'>
              {isAuthenticated ? (
                <Link
                  href='/dashboard'
                  className='ns2-btn ns2-btn-peps ns2-btn-sm'
                >
                  <User className='w-4 h-4' />
                  Mon espace
                </Link>
              ) : (
                <>
                  <Link
                    href='/auth/signin'
                    className='ns2-btn ns2-btn-ghost ns2-btn-sm'
                  >
                    Connexion
                  </Link>
                  <Link
                    href='/auth/signup'
                    className='ns2-btn ns2-btn-peps ns2-btn-sm'
                  >
                    Commencer
                    <ArrowRight className='w-4 h-4' />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type='button'
              className='inline-flex lg:hidden items-center justify-center'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              style={{
                width: 40,
                height: 40,
                background: mobileMenuOpen ? 'var(--ns-peps)' : 'transparent',
                border: 'var(--ns-bw) solid var(--ns-ink)',
                borderRadius: 999,
                cursor: 'pointer',
                color: 'var(--ns-ink)',
                transition: 'background 0.2s ease',
              }}
            >
              <div className='relative w-5 h-3.5'>
                <motion.span
                  animate={{
                    rotate: mobileMenuOpen ? 45 : 0,
                    y: mobileMenuOpen ? 6 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: 2,
                    background: 'var(--ns-ink)',
                    borderRadius: 2,
                  }}
                />
                <motion.span
                  animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '100%',
                    height: 2,
                    background: 'var(--ns-ink)',
                    borderRadius: 2,
                  }}
                />
                <motion.span
                  animate={{
                    rotate: mobileMenuOpen ? -45 : 0,
                    y: mobileMenuOpen ? -6 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: 2,
                    background: 'var(--ns-ink)',
                    borderRadius: 2,
                  }}
                />
              </div>
            </button>
          </nav>
        </motion.header>
      </div>

      {/* ── Mobile sheet ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-40 lg:hidden'
              style={{ backgroundColor: 'rgba(20, 22, 15, 0.4)' }}
              onClick={closeMobileMenu}
              aria-hidden='true'
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className='fixed z-50 lg:hidden flex flex-col'
              style={{
                top: 16,
                right: 16,
                bottom: 16,
                width: 'calc(100% - 32px)',
                maxWidth: 360,
                backgroundColor: 'var(--ns-cream-100)',
                border: 'var(--ns-bw) solid var(--ns-ink)',
                borderRadius: 'var(--ns-r-lg)',
                boxShadow: 'var(--ns-shadow-hard-lg)',
                overflow: 'hidden',
              }}
            >
              <div
                className='flex items-center justify-between'
                style={{
                  padding: '20px 24px',
                  borderBottom: 'var(--ns-bw) solid var(--ns-ink)',
                }}
              >
                <Link
                  href='/'
                  onClick={closeMobileMenu}
                  className='ns2-display'
                  style={{
                    fontSize: 22,
                    color: 'var(--ns-ink)',
                    textDecoration: 'none',
                    letterSpacing: '-0.04em',
                  }}
                >
                  NutriSensia
                  <span style={{ color: 'var(--ns-peps-deep)' }}>.</span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  aria-label='Fermer le menu'
                  style={{
                    width: 36,
                    height: 36,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'var(--ns-bw) solid var(--ns-ink)',
                    borderRadius: 999,
                    background: 'var(--ns-peps)',
                    cursor: 'pointer',
                    color: 'var(--ns-ink)',
                  }}
                >
                  <X className='w-4 h-4' />
                </button>
              </div>

              <nav className='flex-1 overflow-y-auto' style={{ padding: 20 }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {navigationLinks.map((link, index) => {
                    const isActive =
                      pathname === link.href ||
                      (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.25 }}
                        style={{ marginBottom: 4 }}
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobileMenu}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            fontFamily: 'var(--ns-font-sans-stack)',
                            fontSize: 16,
                            fontWeight: isActive ? 700 : 500,
                            color: 'var(--ns-ink)',
                            textDecoration: 'none',
                            borderBottom: '1px dashed rgba(20, 22, 15, 0.15)',
                          }}
                        >
                          <span className={isActive ? 'ns2-hl' : undefined}>
                            {link.label}
                          </span>
                          <ChevronRight
                            className='w-4 h-4'
                            style={{ color: 'var(--ns-ink-3)' }}
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <div
                style={{
                  padding: 20,
                  borderTop: 'var(--ns-bw) solid var(--ns-ink)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {isAuthenticated ? (
                  <Link
                    href='/dashboard'
                    onClick={closeMobileMenu}
                    className='ns2-btn ns2-btn-peps'
                    style={{ justifyContent: 'center', width: '100%' }}
                  >
                    <User className='w-4 h-4' />
                    Mon espace
                  </Link>
                ) : (
                  <>
                    <Link
                      href='/auth/signin'
                      onClick={closeMobileMenu}
                      className='ns2-btn ns2-btn-outline'
                      style={{ justifyContent: 'center', width: '100%' }}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href='/auth/signup'
                      onClick={closeMobileMenu}
                      className='ns2-btn ns2-btn-peps'
                      style={{ justifyContent: 'center', width: '100%' }}
                    >
                      Commencer
                      <ArrowRight className='w-4 h-4' />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
