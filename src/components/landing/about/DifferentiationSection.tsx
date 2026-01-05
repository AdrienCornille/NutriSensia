'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, Smartphone, Heart, BookOpen, Eye } from 'lucide-react';

/**
 * Section Différenciation - Pourquoi Choisir Lucie
 *
 * Cette section met en valeur les 5 différenciateurs uniques qui
 * distinguent Lucie des autres nutritionnistes.
 *
 * Features:
 * - Liste verticale de 5 différenciateurs
 * - Cards horizontales avec icônes et contenu détaillé
 * - Animations au scroll avec délais échelonnés
 * - Design responsive complet
 * - Accessibilité optimisée
 */
export function DifferentiationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: '-100px',
  });

  // Données des différenciateurs
  const differentiators = [
    {
      icon: CheckCircle,
      title: "J'AI VÉCU CE QUE VOUS VIVEZ",
      description: [
        "Je ne suis pas juste quelqu'un qui a lu des livres sur les troubles digestifs ou hormonaux. Je les ai vécus. Je sais ce que c'est que de se sentir incomprise, fatiguée, frustrée.",
        'Cette empathie change tout dans la façon dont je vous accompagne.',
      ],
    },
    {
      icon: Smartphone,
      title: 'APPROCHE MODERNE ET DIGITALE',
      description: [
        "La plateforme NutriSensia n'est pas un gadget. C'est un outil qui change vraiment votre quotidien.",
        "Plans de repas accessibles partout, listes de courses automatiques, suivi en temps réel, messagerie directe : vous n'êtes jamais seule entre deux consultations.",
      ],
    },
    {
      icon: Heart,
      title: 'SPÉCIALISATION HORMONALE RARE',
      description: [
        'Peu de nutritionnistes en Suisse sont vraiment formées en santé hormonale féminine.',
        "SOPK, endométriose, résistance à l'insuline, troubles du cycle : c'est mon cœur de métier. Pas un « bonus » que je fais à côté.",
      ],
    },
    {
      icon: BookOpen,
      title: 'BASÉE SUR LA SCIENCE, PAS LES MODES',
      description: [
        'Pas de détox miracle. Pas de superaliment magique. Pas de promesses irréalistes.',
        'Tout ce que je vous recommande est appuyé par la recherche scientifique et mon expérience clinique. Ça marche vraiment. Et ça dure.',
      ],
    },
    {
      icon: Eye,
      title: 'TRANSPARENCE TOTALE',
      description: [
        'Prix clairs. Pas de frais cachés. Remboursable par assurance. Consultations flexibles.',
        "Et surtout : je vous dis toujours la vérité. Si je pense que quelque chose ne va pas marcher pour vous, je vous le dis. Si je pense qu'il faut voir un médecin, je vous oriente.",
      ],
    },
  ];

  return (
    <section
      ref={ref}
      className={cn(
        // Container principal
        'relative w-full',
        // Background sage gradient
        'bg-gradient-to-br from-[#F8FAF9] to-[#F0F5F2]',
        // Padding responsive
        'py-[100px] px-10',
        'max-md:py-[60px] max-md:px-6',
        'prevent-overflow'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container mx-auto max-w-[1100px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[60px]'>
          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              lineHeight: '57.6px',
              fontWeight: 700,
              color: '#3f6655',
              textAlign: 'center',
              marginBottom: '16px',
            }}
            className='max-md:text-[2rem] max-md:leading-[2.4rem]'
          >
            Pourquoi Choisir de Travailler Avec Moi
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem]',
              'text-[#6B7280]', // Text secondary
              'text-center',
              'mb-[60px]'
            )}
          >
            Ce qui me différencie des autres nutritionnistes
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* DIFFERENTIATORS LIST                         */}
        {/* ============================================ */}
        <div className='max-w-[1000px] mx-auto'>
          <div className='flex flex-col gap-5'>
            {differentiators.map((differentiator, index) => {
              const IconComponent = differentiator.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
                  }
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className={cn(
                    'bg-white',
                    'p-8 max-md:p-6',
                    'rounded-xl',
                    'border-l-4 border-primary',
                    'shadow-[0_2px_15px_rgba(44,62,60,0.06)]',
                    'flex items-start',
                    'gap-6 max-md:gap-4',
                    'transition-all duration-300 ease-out',
                    'hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)]'
                  )}
                >
                  {/* Icon Container */}
                  <div
                    className={cn(
                      'w-[60px] h-[60px] max-md:w-[50px] max-md:h-[50px]',
                      'rounded-full',
                      'bg-primary/15',
                      'flex items-center justify-center',
                      'flex-shrink-0'
                    )}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    >
                      <IconComponent
                        className={cn(
                          'w-7 h-7 max-md:w-6 max-md:h-6',
                          'text-primary'
                        )}
                      />
                    </motion.div>
                  </div>

                  {/* Content Container */}
                  <div className='flex-1'>
                    {/* Title */}
                    <h3
                      className={cn(
                        "font-['Inter',system-ui,sans-serif]",
                        'text-[1.25rem] max-md:text-[1.125rem]',
                        'font-bold uppercase',
                        'tracking-[0.5px]',
                        'text-primary',
                        'mb-3'
                      )}
                    >
                      {differentiator.title}
                    </h3>

                    {/* Description */}
                    <div className='space-y-3'>
                      {differentiator.description.map((paragraph, pIndex) => (
                        <p
                          key={pIndex}
                          className={cn(
                            "font-['Inter',system-ui,sans-serif]",
                            'text-[1rem] max-md:text-[0.95rem]',
                            'leading-[1.7]',
                            'text-[#6B7280]' // Text secondary
                          )}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DifferentiationSection;















