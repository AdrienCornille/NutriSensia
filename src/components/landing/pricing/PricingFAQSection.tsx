'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * FAQ — page Prix, DS v2.
 * Cream-200 section, hard-bordered single-open accordion. The last item
 * embeds an inline contact link, so we type the answer node as ReactNode.
 */

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    question:
      'Quelle est la différence entre nutritionniste et diététicien·ne ?',
    answer:
      "Les diététicien·ne·s HES peuvent être remboursé·e·s par l'assurance de base LAMal sur prescription médicale. En tant que nutritionniste, je vous accompagne via les assurances complémentaires, avec une approche axée sur la prévention, les habitudes durables et la compréhension de votre corps. Mon approche est complémentaire au suivi médical.",
  },
  {
    question: 'Comment se déroule une consultation en ligne ?',
    answer:
      "Très simplement. Nous nous connectons par visioconférence depuis chez vous. Il vous suffit d'un ordinateur, d'une tablette ou d'un smartphone avec une connexion internet. C'est aussi efficace qu'en présentiel, avec le confort de rester chez vous.",
  },
  {
    question: 'Dois-je préparer quelque chose avant ma première consultation ?',
    answer:
      "Non, rien d'obligatoire. Si vous le souhaitez, vous pouvez noter vos questions et préparer vos dernières analyses de sang. Mais l'essentiel, c'est de venir comme vous êtes.",
  },
  {
    question: 'Combien de temps entre chaque consultation ?',
    answer:
      'Cela dépend de vos objectifs et de votre rythme. En général, les consultations sont espacées de 2 à 4 semaines au début, puis progressivement plus espacées au fur et à mesure de votre autonomie.',
  },
  {
    question: 'Est-ce que ça va vraiment fonctionner pour moi ?',
    answer:
      "Si vous êtes prêt·e à faire de petits changements progressifs et à comprendre votre corps, oui. Notre approche n'est pas basée sur la restriction mais sur l'écoute de vos besoins. Pas de régime miracle — juste ce qui fonctionne pour VOUS.",
  },
  {
    question: 'Allez-vous me faire suivre un régime strict ?',
    answer:
      'Absolument pas. Nous ne croyons pas aux régimes restrictifs, qui ne fonctionnent jamais sur le long terme. Notre approche repose sur de petites habitudes durables, adaptées à votre vie, vos goûts et votre rythme.',
  },
  {
    question: 'Combien de temps avant de voir des résultats ?',
    answer:
      'Les premiers changements (énergie, digestion, bien-être) se ressentent souvent dès les premières semaines. Les changements plus profonds (poids, analyses sanguines) demandent généralement 2-3 mois. Chaque personne est unique.',
  },
  {
    question:
      'Est-ce que c’est pour moi si je n’ai pas de problème de santé particulier ?',
    answer:
      "Oui. Vous n'avez pas besoin d'être malade pour vouloir mieux comprendre votre corps et optimiser votre alimentation. Prévention, énergie, performances sportives, bien-être général — toutes les raisons sont bonnes.",
  },
  {
    question: 'Dois-je suivre plusieurs consultations ou une seule suffit ?',
    answer:
      "Une consultation découverte vous apporte déjà beaucoup de clarté et un plan d'action. Mais les meilleurs résultats viennent d'un suivi régulier pour ajuster, encourager et ancrer les changements. Nous vous accompagnons aussi longtemps que nécessaire.",
  },
  {
    question: 'Vous ne répondez pas à ma question ?',
    answer: (
      <>
        <Link
          href='/contact'
          style={{
            color: 'var(--ns-ink)',
            textDecoration: 'none',
            borderBottom: '1.5px solid var(--ns-peps-deep)',
            paddingBottom: 1,
          }}
        >
          Contactez-nous
        </Link>{' '}
        — nous vous répondrons avec plaisir.
      </>
    ),
  },
];

export function PricingFAQSection() {
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

  return (
    <section
      ref={ref}
      id='faq'
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
              fontSize: 'clamp(32px, 4.4vw, 56px)',
              marginTop: 18,
              color: 'var(--ns-ink)',
              maxWidth: 820,
            }}
          >
            Les réponses, <span className='ns2-hl'>sans détour</span>.
          </h2>
        </motion.div>

        {/* Accordion */}
        <div
          style={{
            background: 'var(--ns-cream-50)',
            border: 'var(--ns-bw) solid var(--ns-ink)',
            borderRadius: 'var(--ns-r-lg)',
            boxShadow: 'var(--ns-shadow-hard)',
            overflow: 'hidden',
          }}
        >
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                style={{
                  ...getHidden(10),
                  borderBottom:
                    index === FAQS.length - 1
                      ? 'none'
                      : '1.5px solid var(--ns-ink)',
                }}
                animate={
                  showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                }
                transition={getTransition(index * 0.04)}
              >
                <button
                  type='button'
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`pricing-faq-${index}`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24,
                    padding: '22px 28px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--ns-ink)',
                    fontFamily: 'var(--ns-font-serif-stack)',
                    fontSize: 20,
                    fontWeight: 500,
                    letterSpacing: '-0.015em',
                    lineHeight: 1.25,
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
                  id={`pricing-faq-${index}`}
                  initial={false}
                  animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 28px 22px', maxWidth: 820 }}>
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
      </div>
    </section>
  );
}
