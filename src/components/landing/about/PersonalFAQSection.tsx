'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

/**
 * Section FAQ Personnelle - Questions Qu'On Me Pose Souvent
 *
 * Cette section répond aux questions spécifiques sur Lucie et son approche,
 * avec un design d'accordéon interactif et accessible.
 *
 * Features:
 * - Accordéon avec une seule question ouverte à la fois
 * - Animations fluides pour les transitions
 * - Design responsive et accessible
 * - Contenu personnel et chaleureux
 */
export function PersonalFAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: '-100px',
  });

  // État pour gérer l'accordéon (une seule question ouverte à la fois)
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const accordionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Données des FAQ
  const faqs = [
    {
      id: 'creation-nutrisensia',
      question:
        'Pourquoi avoir créé NutriSensia plutôt que de travailler dans un cabinet classique ?',
      answer:
        "Parce que je voulais offrir plus qu'une consultation par mois. Je voyais mes patientes motivées après nos rendez-vous, puis perdues le reste du temps. La plateforme digitale permet un accompagnement continu, des ajustements rapides, et surtout : vous n'êtes jamais seule avec vos questions.",
    },
    {
      id: 'approche-alimentaire',
      question: 'Est-ce que vous suivez votre propre approche alimentaire ?',
      answer:
        "Absolument. Pas de façon rigide ou obsessionnelle, mais je mange selon les principes que j'enseigne. Je priorise les aliments qui soutiennent mes hormones et ma digestion, j'écoute ma faim, et je me fais plaisir sans culpabilité. C'est un équilibre qui se vit au quotidien.",
    },
    {
      id: 'nombre-patientes',
      question: 'Combien de patientes suivez-vous en même temps ?',
      answer:
        'Volontairement, je limite mon nombre de patientes actives pour pouvoir offrir un accompagnement de qualité à chacune. Je préfère suivre moins de personnes mais bien, plutôt que de multiplier les consultations express.',
    },
    {
      id: 'langues-consultation',
      question: 'Proposez-vous des consultations en français uniquement ?',
      answer:
        "Je consulte principalement en français. Si vous êtes plus à l'aise en anglais, nous pouvons également échanger dans cette langue. L'important est que vous puissiez vous exprimer librement.",
    },
    {
      id: 'hommes-consultation',
      question: 'Travaillez-vous aussi avec des hommes ?',
      answer:
        "Ma spécialisation est la santé hormonale féminine, c'est donc mon cœur de métier. Cependant, je peux accompagner des hommes pour des problématiques digestives ou métaboliques. N'hésitez pas à me contacter pour voir si je peux vous aider.",
    },
    {
      id: 'localisation-consultations',
      question: 'Faut-il habiter Lausanne pour vous consulter ?',
      answer:
        "Non ! Je consulte en visioconférence, ce qui me permet d'accompagner des patientes partout en Suisse romande (et même en France voisine). Seule la consultation découverte peut se faire en présentiel si vous le souhaitez et que vous êtes dans la région.",
    },
  ];

  // Fonction pour basculer l'accordéon
  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Gestion du clavier
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAccordion(index);
    }
  };

  return (
    <section
      ref={ref}
      className={cn(
        // Container principal
        'relative w-full',
        // Background blanc
        'bg-white',
        // Padding responsive
        'py-[100px] px-10',
        'max-md:py-[60px] max-md:px-6',
        'prevent-overflow'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container mx-auto max-w-[900px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[50px]'>
          {/* Section Label */}
          <motion.div
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={headerVariants}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.875rem]',
              'uppercase',
              'tracking-[1.5px]',
              'text-primary',
              'font-semibold',
              'mb-3',
              'text-center'
            )}
          >
            VOS QUESTIONS
          </motion.div>

          {/* H2 Title */}
          <motion.h2
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={headerVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              lineHeight: '57.6px',
              fontWeight: 700,
              color: '#3f6655',
              textAlign: 'center',
              marginBottom: '50px',
            }}
            className='max-md:!text-[2rem] max-md:!leading-[2.4rem]'
          >
            Questions Qu'On Me Pose Souvent
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* ACCORDION FAQ                                */}
        {/* ============================================ */}
        <motion.div
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          variants={accordionVariants}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='w-full flex flex-col'
        >
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={cn(
                // Bordure et padding
                'border-b border-[#E5E7E6]',
                'py-6',
                // Premier élément sans padding-top
                index === 0 && 'pt-0',
                // Transition
                'transition-all duration-300 ease-out'
              )}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleAccordion(index)}
                onKeyDown={e => handleKeyDown(e, index)}
                aria-expanded={openIndex === index}
                aria-controls={`answer-panel-${faq.id}`}
                className={cn(
                  // Layout
                  'w-full',
                  'flex justify-between items-center',
                  'bg-transparent',
                  'border-none',
                  'text-left',
                  'p-0',
                  'cursor-pointer',
                  // Focus states
                  'focus:outline-none',
                  'focus:ring-2 focus:ring-primary/20',
                  'focus:ring-offset-2',
                  'rounded-sm',
                  // Transition
                  'transition-colors duration-200',
                  // Hover
                  'hover:bg-gray-50/50',
                  'group'
                )}
              >
                {/* Question Text */}
                <span
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1.125rem] max-md:text-[1rem]',
                    'font-bold',
                    'leading-[1.4]',
                    'flex-1',
                    'pr-4',
                    'text-left',
                    // Couleur dynamique
                    openIndex === index ? 'text-primary' : 'text-[#2C3E3C]',
                    // Transition
                    'transition-colors duration-300'
                  )}
                >
                  {faq.question}
                </span>

                {/* Chevron Icon */}
                <ChevronDown
                  className={cn(
                    'w-6 h-6',
                    'text-primary',
                    'ml-4',
                    'flex-shrink-0',
                    'transition-transform duration-300 ease-out',
                    // Rotation conditionnelle
                    openIndex === index && 'rotate-180',
                    // Hover effect
                    'group-hover:scale-110'
                  )}
                  aria-hidden='true'
                />
              </button>

              {/* Answer Panel */}
              <div
                id={`answer-panel-${faq.id}`}
                className={cn(
                  // Transition de hauteur
                  'overflow-hidden',
                  'transition-all duration-300 ease-out',
                  // Hauteur conditionnelle
                  openIndex === index ? 'max-h-96 pt-4' : 'max-h-0 pt-0'
                )}
              >
                <div className='pb-2'>
                  <p
                    className={cn(
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[1rem] max-md:text-[0.95rem]',
                      'leading-[1.7]',
                      'text-[#6B7280]', // Text secondary
                      'text-left'
                    )}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default PersonalFAQSection;
