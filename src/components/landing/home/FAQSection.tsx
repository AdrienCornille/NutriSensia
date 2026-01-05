'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section FAQ - Design 2025
 *
 * Section FAQ concise avec accordion functionality pour répondre
 * aux questions fréquentes et lever les objections avant la réservation.
 *
 * Features:
 * - 6 questions essentielles avec accordion
 * - Animation smooth slide-down/up
 * - Un seul item ouvert à la fois
 * - Accessibilité WCAG AA complète
 * - Responsive mobile optimisé
 * - Link vers FAQ complète
 */
export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isFirstVisit } = useFirstVisit();

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

  // Données des 6 questions essentielles
  const faqs = [
    {
      id: 1,
      question: 'Combien de temps dure une consultation ?',
      answer:
        "La consultation découverte dure 1h30. Les consultations de suivi durent 1h chacune. C'est du temps vraiment dédié à vous, sans précipitation.",
    },
    {
      id: 2,
      question: 'Dois-je suivre un régime strict ?',
      answer:
        'Non, absolument pas. Je ne crois pas aux régimes restrictifs. On travaille sur un rééquilibrage progressif, adapté à votre vie, vos goûts, et vos besoins réels. Pas de calculs obsessionnels ni de privation.',
    },
    {
      id: 3,
      question: "Comment se passe le remboursement par l'assurance ?",
      answer:
        'Vous recevez une facture conforme aux standards ASCA/RME que vous transmettez directement à votre assurance complémentaire. Le taux de remboursement dépend de votre contrat (généralement 70-90%). La plupart des assurances suisses couvrent mes consultations (Visana, Swica, CSS, Helsana, Sanitas...).',
    },
    {
      id: 4,
      question: 'Est-ce efficace sans se voir en personne ?',
      answer:
        "Oui, tout aussi efficace ! L'accompagnement en ligne offre même des avantages : flexibilité totale, pas de déplacement, et un suivi continu via la plateforme entre les consultations. Vous avez accès à tous vos outils 24/7.",
    },
    {
      id: 5,
      question: "Combien de temps dure l'accompagnement ?",
      answer:
        "Ça dépend de vos besoins. Certaines personnes trouvent ce qu'elles cherchent en une seule consultation. D'autres préfèrent un suivi sur 3 ou 6 mois pour ancrer durablement leurs nouvelles habitudes. On adapte ensemble.",
    },
    {
      id: 6,
      question: 'Dois-je acheter des suppléments ou produits spéciaux ?',
      answer:
        "Non. Je ne vends aucun produit et ne touche aucune commission. Si je recommande des compléments alimentaires, c'est uniquement parce que votre situation le nécessite vraiment. Et vous êtes libre de les acheter où vous voulez.",
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
      id='faq'
      className={cn(
        'relative',
        'pt-[100px] pb-[80px]',
        'md:pt-[120px] md:pb-[100px]'
      )}
      style={{
        backgroundColor: '#1B998B' /* Turquoise Méditerranée */,
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
                  aria-controls={`faq-answer-${faq.id}`}
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
                  id={`faq-answer-${faq.id}`}
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
          className='text-center mt-10'
          style={getHiddenStyle(20)}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.8)}
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
