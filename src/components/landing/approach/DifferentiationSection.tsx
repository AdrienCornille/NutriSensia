'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { Heart, Network, Microscope, Smartphone } from 'lucide-react';

/**
 * Section "Ma Différence" - Page L'Approche
 *
 * Cette section présente les 4 différenciateurs clés qui distinguent
 * l'approche de Lucie des méthodes traditionnelles.
 *
 * Features:
 * - Grid 2x2 sur desktop, stack sur mobile
 * - 4 cartes avec icônes et contenu différenciant
 * - Animations hover et scroll stagger
 * - Design cohérent avec le système
 * - Responsive mobile/desktop
 *
 * @example
 * ```tsx
 * <DifferentiationSection />
 * ```
 */
export function DifferentiationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des 4 différenciateurs
  const differentiators = [
    {
      id: 1,
      title: 'Je Suis Passée Par Là',
      icon: Heart,
      content: [
        "Ce n'est pas de la théorie. J'ai vécu les régimes yo-yo, la culpabilité, la frustration.",
        'Ma transformation personnelle nourrit mon empathie. Je ne vous juge jamais. Je vous comprends vraiment.',
      ],
      highlight: 'Je ne vous juge jamais',
    },
    {
      id: 2,
      title: 'Vision Globale, Pas Symptomatique',
      icon: Network,
      content: [
        'Je ne traite pas juste vos kilos ou vos ballonnements.',
        "Je regarde l'ensemble : Hormones, digestion, sommeil, stress, inflammation, carences.",
        'Pourquoi : Tout est lié. Traiter les symptômes sans chercher les causes ne fonctionne pas.',
      ],
      highlight: 'Tout est lié',
    },
    {
      id: 3,
      title: 'Micronutrition & Nutrition Fonctionnelle',
      icon: Microscope,
      content: [
        "Au-delà des calories, je m'intéresse aux micronutriments (vitamines, minéraux) qui orchestrent votre métabolisme.",
        'Exemples :',
        '• Carence en magnésium → fringales et stress',
        '• Manque de fer → fatigue chronique',
        '• Déficit en zinc → acné hormonale',
        "Je ne devine pas : j'analyse vos symptômes et votre alimentation pour identifier les carences.",
      ],
      highlight: "j'analyse vos symptômes",
    },
    {
      id: 4,
      title: 'Accompagnement Digital Moderne',
      icon: Smartphone,
      content: [
        'Contrairement au papier et « on se revoit dans 3 semaines » :',
        '• Plateforme digitale 24/7',
        '• Plans actualisés en temps réel',
        '• Messagerie pour vos questions',
        '• Suivi quotidien',
        "Pourquoi c'est crucial : Les défis quotidiens ne vous attendent pas jusqu'à la prochaine consultation.",
      ],
      highlight: 'Plateforme digitale 24/7',
    },
  ];

  return (
    <section
      ref={ref}
      id='differentiation'
      className={cn(
        // Container principal
        'relative',
        // Gradient de fond vert sage (3% à 6% d'opacité)
        'bg-gradient-to-b from-[#f8faf9] to-[#f5f8f6]',
        'py-[100px] px-10',
        // Mobile responsive
        'max-md:py-[60px] max-md:px-6'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container mx-auto max-w-[1200px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[60px]'>
          {/* Section Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.875rem] uppercase',
              'tracking-[1.5px]',
              'text-primary',
              'font-semibold',
              'mb-3'
            )}
          >
            MA DIFFÉRENCE
          </motion.div>

          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "font-['Playfair_Display',Georgia,serif]",
              'text-[2.5rem] md:text-[2.5rem]',
              'max-md:text-[2rem]',
              'font-bold',
              'text-[#2C3E3C]',
              'text-center'
            )}
          >
            Pourquoi Mon Approche Fonctionne
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* GRID LAYOUT - 2x2 Desktop / Stack Mobile    */}
        {/* ============================================ */}
        <div
          className={cn(
            'grid',
            'grid-cols-1 md:grid-cols-2',
            'gap-10',
            'items-stretch' // Toutes les cartes ont la même hauteur
          )}
        >
          {differentiators.map((item, index) => {
            const IconComponent = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.15, // Stagger de 0.15s
                  ease: 'easeOut',
                }}
                className={cn(
                  // Structure flex pour égaliser les hauteurs
                  'flex flex-col',
                  // Base styling
                  'bg-white',
                  'p-[40px]',
                  'max-md:p-[30px]',
                  'rounded-xl',
                  'shadow-[0_4px_20px_rgba(44,62,60,0.08)]',
                  'transition-all duration-300 ease-out',
                  // Hover effects
                  'hover:-translate-y-2',
                  'hover:shadow-[0_8px_30px_rgba(44,62,60,0.15)]',
                  'cursor-default'
                )}
              >
                {/* Icône */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + index * 0.15,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  className='mb-6'
                >
                  <IconComponent
                    className={cn('w-12 h-12', 'text-primary')}
                    aria-hidden='true'
                  />
                </motion.div>

                {/* Titre H3 */}
                <h3
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1.5rem]',
                    'max-md:text-[1.25rem]',
                    'font-bold',
                    'text-[#2C3E3C]',
                    'leading-[1.3]',
                    'mb-4'
                  )}
                >
                  {item.title}
                </h3>

                {/* Contenu principal - flex-1 pour prendre l'espace restant */}
                <div
                  className={cn(
                    'flex-1',
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1rem]',
                    'leading-[1.7]',
                    'text-[#667674]',
                    'space-y-3'
                  )}
                >
                  {item.content.map((paragraph, paragraphIndex) => {
                    // Vérifier si c'est la phrase highlight
                    const isHighlight = paragraph.includes(item.highlight);

                    if (paragraph.startsWith('•')) {
                      // Liste à puces
                      return (
                        <div key={paragraphIndex} className='ml-4'>
                          <p
                            className={cn(
                              isHighlight ? 'text-primary font-semibold' : ''
                            )}
                          >
                            {paragraph}
                          </p>
                        </div>
                      );
                    } else if (
                      paragraph === 'Exemples :' ||
                      paragraph === 'Pourquoi :'
                    ) {
                      // Sous-titres
                      return (
                        <p
                          key={paragraphIndex}
                          className='font-semibold text-[#2C3E3C]'
                        >
                          {paragraph}
                        </p>
                      );
                    } else {
                      // Paragraphes normaux
                      return (
                        <p
                          key={paragraphIndex}
                          className={cn(
                            isHighlight ? 'text-primary font-semibold' : ''
                          )}
                        >
                          {isHighlight
                            ? // Mettre en évidence la phrase clé
                              paragraph
                                .split(item.highlight)
                                .map((part, partIndex, array) => (
                                  <React.Fragment key={partIndex}>
                                    {part}
                                    {partIndex < array.length - 1 && (
                                      <span className='text-primary font-semibold'>
                                        {item.highlight}
                                      </span>
                                    )}
                                  </React.Fragment>
                                ))
                            : paragraph}
                        </p>
                      );
                    }
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default DifferentiationSection;
