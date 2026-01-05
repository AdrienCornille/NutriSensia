'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { useGlobalFirstVisit } from '@/hooks/useGlobalFirstVisit';

/**
 * Navigation NutriSensia - Design Moderne Flottant
 *
 * Header flottant avec :
 * - Effet floating (marge + border-radius + shadow)
 * - Glassmorphism effect (backdrop-blur)
 * - Animation scroll-aware (compact au scroll)
 * - Framer Motion pour transitions fluides
 * - Barre d'annonce dismissible
 *
 * Palette Méditerranée :
 * - #1B998B (Turquoise Azur) - Couleur principale
 * - #E5DED6 (Beige Sand) - Accents secondaires
 * - #FBF9F7 (Crème) - Background
 * - #41556b - Texte body
 */
export function MarketingHeader({
  hideAnnouncementBar = false,
  hideOnScroll = false, // Nouveau prop: masque le header au scroll, réapparaît uniquement en haut
}: {
  hideAnnouncementBar?: boolean;
  hideOnScroll?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [announcementInView, setAnnouncementInView] = useState(true); // Track if announcement bar is still on screen
  const pathname = usePathname();
  const { isFirstVisit } = useGlobalFirstVisit(); // Animations seulement à la première visite du SITE

  // Height of the announcement bar
  const ANNOUNCEMENT_HEIGHT = 44;

  // Handle scroll direction for hide/show
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Determine if scrolled past threshold
    setScrolled(currentScrollY > 20);

    // Check if announcement bar is still visible on screen
    setAnnouncementInView(currentScrollY < ANNOUNCEMENT_HEIGHT);

    // Mode hideOnScroll: le header ne réapparaît que tout en haut de la page
    if (hideOnScroll) {
      // Le header est visible uniquement quand on est en haut de la page (< 100px)
      setHidden(currentScrollY > 100);
    } else {
      // Comportement par défaut: Hide/show based on scroll direction (only after scrolling past 150px)
      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 5) {
          setHidden(true);
        } else if (lastScrollY - currentScrollY > 5) {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY, hideOnScroll]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
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
    { href: '/forfaits', label: 'Prix' },
    { href: '/plateforme', label: 'Votre Coach 24/7' },
    { href: '/a-propos', label: 'À Propos' },
    { href: '/blog', label: 'Blog' },
  ];

  // Animation variants
  const headerVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
    hidden: {
      y: -20,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const announcementVariants = {
    initial: { height: 0, opacity: 0 },
    animate: {
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  // Animations conditionnelles basées sur isFirstVisit uniquement
  // - Première visite : éléments cachés, animation lente
  // - Pas première visite : éléments toujours visibles, pas d'animation

  // Style initial : cacher seulement si première visite
  const getHiddenStyle = (axis: 'x' | 'y', offset: number) => {
    if (!isFirstVisit) {
      // Pas première visite : éléments toujours visibles (pas de clignotement)
      return {};
    }
    // Première visite : cacher l'élément pour l'animation d'entrée
    return {
      opacity: 0,
      transform:
        axis === 'x' ? `translateX(${offset}px)` : `translateY(${offset}px)`,
    };
  };

  const getTransition = (delay: number = 0) => {
    if (isFirstVisit) {
      return {
        delay,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      };
    }
    return { duration: 0 };
  };

  const getNavLinkTransition = (index: number) => {
    if (isFirstVisit) {
      return {
        delay: index * 0.05,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      };
    }
    return { duration: 0 };
  };

  const mobileMenuVariants = {
    initial: { x: '100%' },
    animate: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <>
      {/* Announcement Bar - Dismissible (Full width, not floating) */}
      <AnimatePresence>
        {!hideAnnouncementBar && announcementVisible && (
          <motion.div
            variants={announcementVariants}
            initial={isFirstVisit ? 'initial' : false}
            animate='animate'
            exit='exit'
            style={{
              background: 'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '10px 48px',
                position: 'relative',
              }}
            >
              <motion.div
                style={getHiddenStyle('x', 0)}
                animate={{ opacity: 1, scale: 1, rotate: 0, x: 0 }}
                transition={getTransition(0.2)}
              >
                <Sparkles
                  style={{
                    width: '16px',
                    height: '16px',
                    color: '#F4A261',
                  }}
                />
              </motion.div>
              <Link
                href='/ressources'
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Découvrez nos ressources nutrition gratuites
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </motion.span>
              </Link>
              <button
                onClick={() => setAnnouncementVisible(false)}
                aria-label="Fermer l'annonce"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <X style={{ width: '14px', height: '14px', color: '#fff' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Header Container */}
      <div
        style={{
          position: 'fixed',
          top:
            !hideAnnouncementBar && announcementVisible && announcementInView
              ? '44px'
              : '12px',
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '12px 20px',
          pointerEvents:
            'none' /* Allow clicks to pass through the container */,
          transition: 'top 0.3s ease',
        }}
      >
        <motion.header
          variants={headerVariants}
          animate={hidden ? 'hidden' : 'visible'}
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            borderRadius: '60px',
            border: '1px solid rgba(229, 222, 214, 0.8)',
            overflow: 'hidden',
            transition: 'box-shadow 0.3s ease',
            boxShadow:
              '0 4px 30px rgba(0, 0, 0, 0.08), 0 1px 8px rgba(0, 0, 0, 0.04)',
            pointerEvents: 'auto' /* Re-enable clicks on the header itself */,
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          }}
        >
          <div
            style={{
              position: 'relative',
              padding: '12px 28px',
            }}
          >
            <nav
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* Logo */}
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: '0 0 auto',
                  ...getHiddenStyle('x', -20),
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={getTransition()}
              >
                <Link
                  href='/'
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <motion.img
                    src='/images/logo-nutrisensia.png'
                    alt='NutriSensia Logo'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      height: '22px',
                      width: 'auto',
                    }}
                  />
                </Link>
              </motion.div>

              {/* Navigation Menu - Desktop (Centered) */}
              <ul
                className='hidden lg:flex'
                style={{
                  display: 'flex',
                  listStyle: 'none',
                  gap: '4px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 0,
                  padding: '0 24px',
                  flex: 1,
                }}
              >
                {navigationLinks.map((link, index) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <motion.li
                      key={link.href}
                      style={{
                        whiteSpace: 'nowrap',
                        ...getHiddenStyle('y', -10),
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getNavLinkTransition(index)}
                    >
                      <Link
                        href={link.href}
                        style={{
                          display: 'block',
                          padding: '8px 14px',
                          borderRadius: '20px',
                          backgroundColor: isActive
                            ? 'rgba(27, 153, 139, 0.1)'
                            : 'transparent',
                          color: isActive ? '#1B998B' : '#41556b',
                          fontFamily:
                            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '13px',
                          fontWeight: isActive ? 600 : 500,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor =
                              'rgba(27, 153, 139, 0.05)';
                            e.currentTarget.style.color = '#1B998B';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                            e.currentTarget.style.color = '#41556b';
                          }
                        }}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Actions - Desktop */}
              <motion.div
                className='hidden lg:flex'
                style={{
                  flex: '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  ...getHiddenStyle('x', 20),
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={getTransition(0.2)}
              >
                {/* Login Button - Outline style matching CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1.5px solid #1B998B',
                    backgroundColor: 'transparent',
                    color: '#1B998B',
                  }}
                  onClick={() => {
                    window.location.href = '/auth/login';
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor =
                      'rgba(27, 153, 139, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Connexion
                </motion.button>

                {/* CTA Button - Prominent */}
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0 6px 20px rgba(27, 153, 139, 0.3)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    background:
                      'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(27, 153, 139, 0.2)',
                  }}
                  onClick={() => {
                    window.location.href = '/contact?type=consultation';
                  }}
                >
                  Commencer
                </motion.button>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type='button'
                className='lg:hidden'
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={
                  mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'
                }
                aria-expanded={mobileMenuOpen}
                style={{
                  backgroundColor: mobileMenuOpen
                    ? 'rgba(27, 153, 139, 0.1)'
                    : 'transparent',
                  borderRadius: '12px',
                  padding: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '14px',
                    position: 'relative',
                  }}
                >
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
                      height: '2px',
                      borderRadius: '2px',
                      backgroundColor: '#1B998B',
                    }}
                  />
                  <motion.span
                    animate={{
                      opacity: mobileMenuOpen ? 0 : 1,
                      scaleX: mobileMenuOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '100%',
                      height: '2px',
                      borderRadius: '2px',
                      backgroundColor: '#1B998B',
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
                      height: '2px',
                      borderRadius: '2px',
                      backgroundColor: '#1B998B',
                    }}
                  />
                </div>
              </motion.button>
            </nav>
          </div>
        </motion.header>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              className='fixed inset-0 z-40 lg:hidden'
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={closeMobileMenu}
              aria-hidden='true'
            />

            {/* Panel - Also floating style on mobile */}
            <motion.div
              variants={mobileMenuVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              className='fixed z-50 lg:hidden overflow-hidden'
              style={{
                top: '16px',
                right: '16px',
                bottom: '16px',
                width: 'calc(100% - 32px)',
                maxWidth: '360px',
                backgroundColor: 'rgba(251, 249, 247, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(229, 222, 214, 0.6)',
              }}
            >
              <nav
                className='flex flex-col h-full'
                aria-label='Navigation mobile'
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(229, 222, 214, 0.6)',
                  }}
                >
                  <Link href='/' onClick={closeMobileMenu}>
                    <img
                      src='/images/logo-nutrisensia.png'
                      alt='NutriSensia Logo'
                      style={{ height: '22px', width: 'auto' }}
                    />
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={closeMobileMenu}
                    aria-label='Fermer le menu'
                    style={{
                      backgroundColor: 'rgba(27, 153, 139, 0.1)',
                      borderRadius: '12px',
                      padding: '8px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <X
                      style={{
                        width: '18px',
                        height: '18px',
                        color: '#1B998B',
                      }}
                    />
                  </motion.button>
                </div>

                {/* Navigation Links */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
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
                          transition={{
                            delay: index * 0.05,
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          style={{ marginBottom: '4px' }}
                        >
                          <Link
                            href={link.href}
                            onClick={closeMobileMenu}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              borderRadius: '14px',
                              backgroundColor: isActive
                                ? 'rgba(27, 153, 139, 0.1)'
                                : 'transparent',
                              color: isActive ? '#1B998B' : '#41556b',
                              fontFamily:
                                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                              fontSize: '15px',
                              fontWeight: isActive ? 600 : 500,
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {link.label}
                            <ChevronRight
                              style={{
                                width: '16px',
                                height: '16px',
                                color: isActive ? '#1B998B' : '#9CA3AF',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  style={{
                    padding: '20px',
                    borderTop: '1px solid rgba(229, 222, 214, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '14px',
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: 'transparent',
                      color: '#1B998B',
                      border: '2px solid #1B998B',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      closeMobileMenu();
                      window.location.href = '/auth/login';
                    }}
                  >
                    Se connecter
                  </button>

                  <button
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '14px',
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      background:
                        'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(27, 153, 139, 0.25)',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      closeMobileMenu();
                      window.location.href = '/contact?type=consultation';
                    }}
                  >
                    Commencer maintenant
                  </button>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
