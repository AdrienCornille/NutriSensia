'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { useGlobalFirstVisit } from '@/hooks/useGlobalFirstVisit';

/**
 * Footer Marketing Complet - Design Méditerranée 2025
 *
 * Footer complet avec toutes les informations nécessaires :
 * - 3 colonnes : Brand, Navigation, Contact
 * - Badges de crédentials et réseaux sociaux
 * - Sticky reassurance bar
 * - Responsive mobile optimisé
 * - Accessibilité WCAG AA
 * - Palette Méditerranée : background #0F4F48 (Turquoise foncé profond)
 */
export function MarketingFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const { isFirstVisit } = useGlobalFirstVisit(); // Animations seulement à la première visite du SITE

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Style initial : cacher seulement si première visite
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) {
      return {};
    }
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px)`,
    };
  };

  // Transition : animation seulement si première visite et en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  const navigationLinks = [
    { label: 'À Propos', href: '/a-propos' },
    { label: 'Nos Spécialisations', href: '/specialisations' },
    { label: 'Prix', href: '/prix' },
    { label: 'Plateforme', href: '/plateforme' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { label: 'Mentions Légales', href: '/mentions-legales' },
    { label: 'Politique de Confidentialité', href: '/confidentialite' },
    { label: 'Conditions Générales', href: '/conditions-generales' },
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

  // Gestion de la soumission newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus('error');
      return;
    }

    setNewsletterStatus('loading');

    // Simuler un appel API (à remplacer par votre vraie API)
    setTimeout(() => {
      console.log('Email inscrit à la newsletter:', email);
      setNewsletterStatus('success');
      setEmail('');

      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setNewsletterStatus('idle');
      }, 3000);
    }, 1000);
  };

  return (
    <>
      {/* ============================================ */}
      {/* MAIN FOOTER                                  */}
      {/* ============================================ */}
      <footer
        id='main-footer'
        className={cn(
          'bg-[#0F4F48]' /* Turquoise foncé profond - Méditerranée */,
          'text-white',
          'py-[60px] px-10 md:px-16 lg:px-20',
          'pb-[30px] md:pb-[30px]'
        )}
      >
        <div className='container mx-auto max-w-[1200px]'>
          {/* ============================================ */}
          {/* MAIN FOOTER CONTENT - 3 COLUMNS            */}
          {/* ============================================ */}
          <motion.div
            ref={ref}
            style={getHiddenStyle(30)}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={getTransition(0)}
            className={cn(
              'grid grid-cols-1 md:grid-cols-4',
              'gap-10 md:gap-8',
              'mb-10'
            )}
          >
            {/* ============================================ */}
            {/* COLUMN 1: BRAND & DESCRIPTION (40%)        */}
            {/* ============================================ */}
            <div className={cn('md:col-span-1', 'text-center md:text-left')}>
              {/* Logo/Brand Name */}
              <img
                src='/images/logo-nutrisensia-blanc.png'
                alt='NutriSensia'
                className='mb-5 h-8 w-auto mx-auto md:mx-0'
              />

              {/* Tagline */}
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.95rem]',
                  'text-[#C5CDC9]',
                  'leading-[1.6]',
                  'max-w-[350px]',
                  'mx-auto md:mx-0',
                  'mb-6'
                )}
              >
                Accompagnement nutritionnel en ligne pour retrouver énergie et
                bien-être durable.
              </p>

              {/* Credentials Badges */}
              <div className={cn('mb-6', 'space-y-2')}>
                <div
                  className={cn(
                    'flex items-center gap-2',
                    'justify-center md:justify-start',
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.875rem]',
                    'text-[#C5CDC9]'
                  )}
                >
                  <Check className='w-4 h-4 text-primary' strokeWidth={2.5} />
                  <span>Diplômée TCMA</span>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2',
                    'justify-center md:justify-start',
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.875rem]',
                    'text-[#C5CDC9]'
                  )}
                >
                  <Check className='w-4 h-4 text-primary' strokeWidth={2.5} />
                  <span>Agréments ASCA & RME</span>
                </div>
              </div>

              {/* Social Media Icons */}
              <div
                className={cn(
                  'flex items-center gap-4',
                  'justify-center md:justify-start'
                )}
              >
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={social.label}
                      className={cn(
                        'w-6 h-6',
                        'text-[#C5CDC9]',
                        'transition-all duration-300',
                        'hover:text-primary hover:scale-110',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-[#0F4F48]',
                        'rounded'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent className='w-6 h-6' strokeWidth={1.5} />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* ============================================ */}
            {/* COLUMN 2: NAVIGATION LINKS (30%)           */}
            {/* ============================================ */}
            <div className={cn('md:col-span-1')}>
              {/* Column Title */}
              <h4
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1rem]',
                  'font-semibold',
                  'text-white',
                  'mb-5'
                )}
              >
                Navigation
              </h4>

              {/* Link List */}
              <nav className='space-y-3'>
                {navigationLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    className={cn(
                      'block',
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[0.95rem]',
                      'text-[#C5CDC9]',
                      'transition-all duration-200',
                      'hover:text-white hover:translate-x-1',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-[#0F4F48]',
                      'rounded px-1 py-0.5'
                    )}
                    whileHover={{ x: 4 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* ============================================ */}
            {/* COLUMN 3: CONTACT & LEGAL (30%)            */}
            {/* ============================================ */}
            <div className={cn('md:col-span-1')}>
              {/* Column Title */}
              <h4
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1rem]',
                  'font-semibold',
                  'text-white',
                  'mb-5'
                )}
              >
                Contact
              </h4>

              {/* Contact Information */}
              <div className='space-y-3 mb-8'>
                {/* Email */}
                <motion.a
                  href='mailto:contact@nutrisensia.ch'
                  className={cn(
                    'flex items-center gap-3',
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.95rem]',
                    'text-[#C5CDC9]',
                    'transition-colors duration-200',
                    'hover:text-white',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-[#0F4F48]',
                    'rounded px-1 py-1'
                  )}
                  whileHover={{ x: 2 }}
                >
                  <Mail
                    className='w-4 h-4 text-[#C5CDC9] flex-shrink-0'
                    strokeWidth={1.5}
                  />
                  <span>contact@nutrisensia.ch</span>
                </motion.a>

                {/* Phone */}
                <motion.a
                  href='tel:+41123456789'
                  className={cn(
                    'flex items-center gap-3',
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.95rem]',
                    'text-[#C5CDC9]',
                    'transition-colors duration-200',
                    'hover:text-white',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-[#0F4F48]',
                    'rounded px-1 py-1'
                  )}
                  whileHover={{ x: 2 }}
                >
                  <Phone
                    className='w-4 h-4 text-[#C5CDC9] flex-shrink-0'
                    strokeWidth={1.5}
                  />
                  <span>+41 XX XXX XX XX</span>
                </motion.a>

                {/* Location */}
                <div
                  className={cn(
                    'flex items-center gap-3',
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.95rem]',
                    'text-[#C5CDC9]'
                  )}
                >
                  <MapPin
                    className='w-4 h-4 text-[#C5CDC9] flex-shrink-0'
                    strokeWidth={1.5}
                  />
                  <span>Lausanne, Suisse</span>
                </div>
              </div>

              {/* Legal Links */}
              <nav className='space-y-2'>
                {legalLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    className={cn(
                      'block',
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[0.875rem]',
                      'text-[#C5CDC9]',
                      'transition-colors duration-200',
                      'hover:text-white',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-[#0F4F48]',
                      'rounded px-1 py-0.5'
                    )}
                    whileHover={{ x: 2 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* ============================================ */}
            {/* COLUMN 4: NEWSLETTER                        */}
            {/* ============================================ */}
            <div className={cn('md:col-span-1', 'bg-white/5 p-6 rounded-lg')}>
              {/* Column Title */}
              <h4
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1rem]',
                  'font-semibold',
                  'text-white',
                  'mb-3'
                )}
              >
                Conseils Nutrition Gratuits
              </h4>

              {/* Description */}
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.875rem]',
                  'text-[#C5CDC9]',
                  'mb-4'
                )}
              >
                Recevez nos meilleurs conseils chaque semaine
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleNewsletterSubmit} className='space-y-3'>
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='votre@email.ch'
                  disabled={
                    newsletterStatus === 'loading' ||
                    newsletterStatus === 'success'
                  }
                  className={cn(
                    'w-full px-3 py-2',
                    'rounded-lg',
                    'bg-white/10 border border-white/20',
                    'text-white placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200',
                    'text-sm'
                  )}
                />

                <button
                  type='submit'
                  disabled={
                    newsletterStatus === 'loading' ||
                    newsletterStatus === 'success'
                  }
                  className={cn(
                    'w-full',
                    'px-4 py-2 rounded-[35px]',
                    'text-white font-semibold text-sm',
                    'flex items-center justify-center gap-2',
                    'transition-all duration-300',
                    'disabled:opacity-70 disabled:cursor-not-allowed',
                    newsletterStatus === 'success' && 'bg-green-600'
                  )}
                  style={{
                    background:
                      newsletterStatus === 'success'
                        ? '#16a34a'
                        : 'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
                  }}
                  onMouseEnter={e => {
                    if (newsletterStatus !== 'success') {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (newsletterStatus !== 'success') {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
                    }
                  }}
                >
                  {newsletterStatus === 'loading' && (
                    <>
                      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Inscription...
                    </>
                  )}
                  {newsletterStatus === 'success' && (
                    <>
                      <Check className='w-4 h-4' />
                      Inscrit !
                    </>
                  )}
                  {(newsletterStatus === 'idle' ||
                    newsletterStatus === 'error') && (
                    <>
                      <Send className='w-4 h-4' />
                      S'inscrire
                    </>
                  )}
                </button>

                {newsletterStatus === 'error' && (
                  <p className='text-xs text-red-400'>
                    Email invalide. Veuillez réessayer.
                  </p>
                )}
              </form>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* BOTTOM BAR                                  */}
          {/* ============================================ */}
          <motion.div
            style={getHiddenStyle(20)}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.2)}
            className={cn(
              'border-t border-white/10',
              'pt-6 mt-10',
              'flex flex-col md:flex-row',
              'justify-between items-center',
              'gap-4'
            )}
          >
            {/* Left Side - Copyright */}
            <p
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[0.875rem]',
                'text-[#9BA5A3]',
                'text-center md:text-left'
              )}
            >
              © 2025 NutriSensia. Tous droits réservés.
            </p>

            {/* Right Side - Credits */}
            <p
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[0.875rem]',
                'text-[#9BA5A3]',
                'text-center md:text-right'
              )}
            >
              Créé avec ❤️ pour votre santé
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  );
}
