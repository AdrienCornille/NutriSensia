'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * FAQ — DS v2.
 * Cream section with hard-bordered accordion items (single-open). Question
 * inline with peps + ink toggle button. Closing CTA outline-style.
 */
export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { isFirstVisit } = useFirstVisit();

  const showContent = !isFirstVisit || isInView;
  const getHidden = (yOffset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${yOffset}px)` };
  const getTransition = (delay: number) =>
    isFirstVisit && isInView
      ? { duration: 0.6, delay, ease: 'easeOut' as const }
      : { duration: 0 };

  const faqs = [
    {
      id: 1,
      question: 'Combien de temps dure une consultation ?',
      answer:
        'La consultation découverte dure 30 minutes. Les consultations de suivi durent une heure chacune. Du temps vraiment dédié à vous, sans précipitation.',
    },
    {
      id: 2,
      question: 'Dois-je suivre un régime strict ?',
      answer:
        'Non. Si vous vouliez un régime strict, vous seriez ailleurs. Notre approche : des ajustements progressifs qui tiennent dans la durée — pas trois semaines.',
    },
    {
      id: 3,
      question: 'Comment ça se passe avec mon assurance ?',
      answer:
        'Lucie est agréée ASCA & RME. Les consultations sont remboursées par la plupart des assurances complémentaires en Suisse. On vous aide à vérifier votre couverture avant de commencer.',
    },
    {
      id: 4,
      question: 'Est-ce efficace sans se voir en personne ?',
      answer:
        'Oui. Le suivi à distance permet plus de régularité, des ajustements plus rapides, et zéro trajet sous la pluie. La consultation découverte est d’ailleurs un bon test.',
    },
    {
      id: 5,
      question: 'Combien de temps avant que je n’aie plus besoin de vous ?',
      answer:
        'L’objectif, c’est précisément que vous deveniez autonome. La plupart des accompagnements durent entre trois et six mois. Après, on se revoit quand vous le souhaitez — pas par obligation.',
    },
    {
      id: 6,
      question: 'Allez-vous me vendre des compléments ?',
      answer:
        'Non. Nous ne vendons aucun complément. Si une supplémentation est utile, on vous l’indique — vous l’achetez où vous voulez. Notre revenu, ce sont les consultations, point.',
    },
  ];

  return (
    <section
      id='faq'
      ref={ref}
      style={{
        background: 'var(--ns-cream-200)',
        paddingTop: 96,
        paddingBottom: 96,
        borderTop: 'var(--ns-bw) solid var(--ns-ink)',
      }}
    >
      <div className='ns2-container'>
        {/* Header */}
        <motion.div
          style={{ marginBottom: 56, ...getHidden(20) }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <div className='ns2-eyebrow ns2-eyebrow-dot'>Vos questions</div>
          <h2
            className='ns2-display'
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              marginTop: 18,
              color: 'var(--ns-ink)',
              maxWidth: 820,
            }}
          >
            Les <em>petites</em> et les <span className='ns2-hl'>vraies</span>{' '}
            questions.
          </h2>
        </motion.div>

        {/* Accordion list */}
        <div
          style={{
            background: 'var(--ns-cream-50)',
            border: 'var(--ns-bw) solid var(--ns-ink)',
            borderRadius: 'var(--ns-r-lg)',
            boxShadow: 'var(--ns-shadow-hard)',
            overflow: 'hidden',
          }}
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.id}
                style={{
                  ...getHidden(10),
                  borderBottom:
                    index === faqs.length - 1
                      ? 'none'
                      : '1.5px solid var(--ns-ink)',
                }}
                animate={
                  showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                }
                transition={getTransition(index * 0.05)}
              >
                <button
                  type='button'
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24,
                    padding: '24px 28px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--ns-ink)',
                    fontFamily: 'var(--ns-font-serif-stack)',
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: '-0.015em',
                    lineHeight: 1.2,
                  }}
                >
                  <span>{faq.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isOpen ? 'var(--ns-peps)' : 'transparent',
                      border: '1.5px solid var(--ns-ink)',
                      borderRadius: 999,
                      color: 'var(--ns-ink)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <ChevronDown className='w-4 h-4' strokeWidth={2.2} />
                  </motion.span>
                </button>

                <motion.div
                  id={`faq-answer-${faq.id}`}
                  initial={false}
                  animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: '0 28px 24px',
                      maxWidth: 820,
                    }}
                  >
                    <p
                      className='ns2-body-lg'
                      style={{ color: 'var(--ns-fg-muted)' }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Outro CTA */}
        <motion.div
          style={{
            marginTop: 40,
            display: 'flex',
            justifyContent: 'center',
            ...getHidden(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.5)}
        >
          <Link href='/faq' className='ns2-btn ns2-btn-outline'>
            Voir toutes les questions
            <ArrowRight className='w-4 h-4' />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
