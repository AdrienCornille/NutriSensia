'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section FAQ pour la page Plateforme - Design identique à la page d'accueil
 *
 * Section FAQ concise avec accordion functionality pour répondre
 * aux questions fréquentes sur la plateforme.
 *
 * Features:
 * - 6 questions essentielles avec accordion
 * - Animation smooth slide-down/up
 * - Un seul item ouvert à la fois
 * - Accessibilité WCAG AA complète
 * - Responsive mobile optimisé
 * - Link vers FAQ complète
 */
export function PlatformFAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Helpers pour les animations conditionnelles
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) return {};
    return { opacity: 0, transform: `translateY(${yOffset}px)` };
  };

  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  // Données des 6 questions spécifiques à la plateforme
  const faqs = [
    {
      id: 1,
      question: 'Comment accéder à la plateforme ?',
      answer:
        "Après votre consultation, vous recevrez un email avec vos identifiants de connexion. Vous pouvez ensuite accéder à la plateforme via l'application mobile (iOS/Android) ou directement sur le web depuis votre navigateur.",
    },
    {
      id: 2,
      question: 'Mes données sont-elles sécurisées ?',
      answer:
        'Absolument. Nous utilisons un chiffrement de niveau bancaire (SSL/TLS) et nos serveurs sont hébergés en Suisse, conformément au RGPD. Vos données médicales sont traitées avec la plus grande confidentialité et ne sont jamais partagées avec des tiers.',
    },
    {
      id: 3,
      question: 'Puis-je utiliser la plateforme hors ligne ?',
      answer:
        'Oui, la plupart des fonctionnalités sont disponibles hors ligne. Vous pouvez consulter votre plan nutritionnel, vos recettes et vos rappels même sans connexion internet. La synchronisation se fait automatiquement dès que vous retrouvez une connexion.',
    },
    {
      id: 4,
      question: "Que se passe-t-il si j'oublie mon mot de passe ?",
      answer:
        "Pas de panique ! Vous pouvez réinitialiser votre mot de passe directement depuis la page de connexion en cliquant sur 'Mot de passe oublié'. Vous recevrez un email avec un lien sécurisé pour créer un nouveau mot de passe.",
    },
    {
      id: 5,
      question: 'La plateforme fonctionne-t-elle sur tous les appareils ?',
      answer:
        "Oui, la plateforme est compatible avec tous les appareils modernes : smartphones (iOS/Android), tablettes, ordinateurs (Windows/Mac/Linux). Votre expérience s'adapte automatiquement à la taille de votre écran.",
    },
    {
      id: 6,
      question: 'Puis-je annuler mon abonnement à tout moment ?',
      answer:
        "Bien sûr ! Vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel. Aucun frais caché, aucune question posée. Vous gardez l'accès jusqu'à la fin de votre période de facturation.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAccordion(index);
    }
  };

  return (
    <section
      id='faq-plateforme'
      className={cn(
        'relative',
        'pt-[100px] pb-[80px]',
        'md:pt-[120px] md:pb-[100px]'
      )}
      style={{
        backgroundColor: '#1B998B' /* Turquoise Azur - Méditerranée */,
      }}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1370px] px-6 md:px-10 lg:px-14 xl:px-20'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[50px]'>
          {/* H2 Title - Marcellus serif selon Style Guide */}
          <motion.h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              lineHeight: '57.6px',
              fontWeight: 700,
              color: '#ffffff',
              ...getHiddenStyle(30),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={getTransition(0)}
          >
            Vos questions
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* ACCORDION CONTAINER                          */}
        {/* ============================================ */}
        <div ref={ref} className={cn('w-full', 'flex flex-col')}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.id}
                style={getHiddenStyle(20)}
                animate={
                  showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={getTransition(index * 0.1)}
                className={cn(
                  'border-b border-white/20',
                  'py-6',
                  index === 0 && 'pt-0'
                )}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleAccordion(index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className={cn(
                    'w-full',
                    'flex justify-between items-center',
                    'bg-transparent',
                    'border-none',
                    'text-left',
                    'p-0',
                    'cursor-pointer',
                    'transition-all duration-300',
                    'hover:text-primary',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
                    'rounded-lg',
                    'min-h-[44px]', // Touch target minimum
                    'py-2' // Extra padding for better touch
                  )}
                  aria-expanded={isOpen}
                  aria-controls={`faq-platform-answer-${faq.id}`}
                  role='button'
                >
                  {/* Question Text */}
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: '27px',
                      flex: 1,
                      transition: 'color 0.3s',
                    }}
                  >
                    {faq.question}
                  </span>

                  {/* Chevron Icon */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'flex-shrink-0',
                      'ml-4',
                      'transition-colors duration-300'
                    )}
                  >
                    <ChevronDown
                      className={cn('w-5 h-5 md:w-6 md:h-6', 'text-white')}
                      strokeWidth={2}
                      aria-hidden='true'
                    />
                  </motion.div>
                </button>

                {/* Answer Panel */}
                <motion.div
                  id={`faq-platform-answer-${faq.id}`}
                  initial={false}
                  animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className={cn('overflow-hidden')}
                >
                  <motion.div
                    initial={false}
                    animate={{ y: isOpen ? 0 : -10 }}
                    transition={{ duration: 0.3 }}
                    className='pt-4'
                  >
                    <p
                      style={{
                        fontFamily:
                          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '16px',
                        lineHeight: '24px',
                        color: 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* ============================================ */}
        {/* LINK TO FULL FAQ                             */}
        {/* ============================================ */}
        <motion.div
          style={getHiddenStyle(20)}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.8)}
          className='text-center mt-10'
        >
          <motion.a
            href='/faq'
            whileHover={{ scale: 1.02 }}
            className={cn(
              'inline-flex items-center gap-2',
              "font-['Inter',system-ui,sans-serif]",
              'text-[1rem]',
              'font-semibold',
              'text-white',
              'transition-all duration-300',
              'hover:gap-3',
              'group',
              'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2',
              'rounded-lg',
              'px-2 py-1',
              'cursor-pointer'
            )}
          >
            <span className='transition-transform group-hover:translate-x-1'>
              →
            </span>
            <span className='border-b-2 border-transparent group-hover:border-white transition-all'>
              Voir toutes les questions
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
