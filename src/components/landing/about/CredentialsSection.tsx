'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Microscope,
  Leaf,
  Scale,
  Hospital,
  Award,
  BookOpen,
  Lightbulb,
  Check,
} from 'lucide-react';

/**
 * Section Credentials - Formations & Reconnaissances
 *
 * Cette section présente les qualifications, formations et reconnaissances
 * professionnelles de Lucie sous forme de timeline verticale.
 *
 * Features:
 * - Timeline verticale avec dots et ligne continue
 * - 7 qualifications principales
 * - Boîte d'information "Pourquoi c'est important"
 * - Animations au scroll avec délais échelonnés
 * - Design responsive complet
 * - Accessibilité optimisée
 */
export function CredentialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: '-100px',
  });

  // Données des qualifications
  const credentials = [
    {
      icon: GraduationCap,
      title: 'DIPLÔME EN NUTRITION CLINIQUE',
      details: 'École : Institut de Formation en Nutrition • Année : 2019',
      description: 'Formation complète couvrant :',
      points: [
        'Physiologie de la nutrition',
        'Nutrition thérapeutique',
        'Biochimie nutritionnelle',
        'Accompagnement clinique',
      ],
    },
    {
      icon: Microscope,
      title: 'SANTÉ HORMONALE FÉMININE',
      description: 'Formations spécialisées en :',
      points: [
        'Syndrome des Ovaires Polykystiques (SOPK)',
        'Endométriose et fertilité',
        'Troubles du cycle menstruel',
        'Ménopause et périménopause',
        'Équilibre thyroïdien',
      ],
    },
    {
      icon: Leaf,
      title: 'NUTRITION DIGESTIVE & FONCTIONNELLE',
      description: 'Certifications en :',
      points: [
        "Syndrome de l'intestin irritable (SII)",
        'Dysbiose et microbiote',
        'Intolérances alimentaires (FODMAP, gluten, lactose)',
        'Inflammation chronique',
        'Approche anti-inflammatoire',
      ],
    },
    {
      icon: Scale,
      title: 'GESTION DU POIDS & MÉTABOLISME',
      description: 'Expertise en :',
      points: [
        "Résistance à l'insuline",
        'Métabolisme hormonal',
        'Perte de poids durable (sans régime restrictif)',
        'Troubles du comportement alimentaire',
        'Alimentation intuitive',
      ],
    },
    {
      icon: Hospital,
      title: 'ASCA (Fondation Suisse pour les Médecines Complémentaires)',
      points: [
        'Thérapeute agréée et reconnue',
        'Remboursable par les assurances complémentaires suisses',
      ],
    },
    {
      icon: Award,
      title: 'RME (Registre de Médecine Empirique)',
      points: [
        'Enregistrée au registre national',
        'Conformité aux standards professionnels suisses',
      ],
    },
    {
      icon: BookOpen,
      title: 'EN APPRENTISSAGE CONTINU',
      description: 'Parce que la science de la nutrition évolue constamment :',
      points: [
        'Conférences et symposiums annuels',
        'Formations continues en santé hormonale',
        'Lectures scientifiques régulières',
        'Échanges avec réseau de professionnels',
      ],
    },
  ];

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
            EXPERTISE
          </motion.div>

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
            className='max-md:!text-[2rem] max-md:!leading-[2.4rem]'
          >
            Formations & Reconnaissances
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
            L'expertise au service de votre santé
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* TIMELINE SECTION                             */}
        {/* ============================================ */}
        <div className='relative max-w-[900px] mx-auto'>
          {/* Timeline Line */}
          <div
            className={cn(
              'absolute',
              'left-[30px] max-md:left-[15px]',
              'top-0 bottom-0',
              'w-1',
              'bg-gradient-to-b from-primary to-primary/60',
              'z-0'
            )}
          />

          {/* Timeline Items */}
          <div className='relative z-10'>
            {credentials.map((credential, index) => {
              const IconComponent = credential.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
                  }
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                  className={cn(
                    'relative',
                    'pl-20 max-md:pl-12',
                    index < credentials.length - 1 ? 'mb-10' : ''
                  )}
                >
                  {/* Timeline Dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.15 }}
                    className={cn(
                      'absolute',
                      'left-[22px] max-md:left-[7px]',
                      'top-0',
                      'w-5 h-5 max-md:w-4 max-md:h-4',
                      'rounded-full',
                      'bg-primary',
                      'border-4 border-white',
                      'shadow-[0_0_0_4px_rgba(124,152,133,0.2)]',
                      'z-10'
                    )}
                  />

                  {/* Qualification Card */}
                  <div
                    className={cn(
                      'bg-[#F8FAF9]', // Light sage
                      'p-9 max-md:p-6',
                      'rounded-xl',
                      'border-l-4 border-primary',
                      'shadow-[0_2px_12px_rgba(44,62,60,0.06)]',
                      'transition-all duration-300 ease-out',
                      'hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)]'
                    )}
                  >
                    {/* Icon */}
                    <div className='mb-4'>
                      <IconComponent
                        className={cn(
                          'w-12 h-12 max-md:w-10 max-md:h-10',
                          'text-primary'
                        )}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className={cn(
                        "font-['Inter',system-ui,sans-serif]",
                        'text-[1.5rem] max-md:text-[1.25rem]',
                        'font-bold uppercase',
                        'tracking-[0.5px]',
                        'text-[#2C3E3C]', // Primary dark
                        'mb-3'
                      )}
                    >
                      {credential.title}
                    </h3>

                    {/* Details (if applicable) */}
                    {credential.details && (
                      <p
                        className={cn(
                          "font-['Inter',system-ui,sans-serif]",
                          'text-[0.9rem]',
                          'text-[#9CA3AF]', // Text tertiary
                          'mb-4'
                        )}
                      >
                        {credential.details}
                      </p>
                    )}

                    {/* Separator Line */}
                    <div
                      className={cn('w-[60px]', 'h-0.5', 'bg-primary', 'mb-4')}
                    />

                    {/* Description */}
                    {credential.description && (
                      <p
                        className={cn(
                          "font-['Inter',system-ui,sans-serif]",
                          'text-[0.95rem]',
                          'text-[#6B7280]', // Text secondary
                          'mb-3',
                          'font-medium'
                        )}
                      >
                        {credential.description}
                      </p>
                    )}

                    {/* Points List */}
                    <div className='flex flex-col gap-2'>
                      {credential.points.map((point, pointIndex) => (
                        <div
                          key={pointIndex}
                          className='flex items-start gap-3'
                        >
                          <div
                            className={cn(
                              'w-1.5 h-1.5',
                              'bg-primary',
                              'rounded-full',
                              'mt-2',
                              'flex-shrink-0'
                            )}
                          />
                          <p
                            className={cn(
                              "font-['Inter',system-ui,sans-serif]",
                              'text-[0.95rem]',
                              'leading-[1.6]',
                              'text-[#6B7280]' // Text secondary
                            )}
                          >
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* "POURQUOI C'EST IMPORTANT" INFO BOX         */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{
            duration: 0.6,
            delay: 0.3 + credentials.length * 0.15 + 0.2,
          }}
          className={cn(
            'bg-primary/5',
            'border-l-4 border-primary',
            'rounded-lg',
            'p-8 max-md:p-6',
            'max-w-[800px]',
            'mx-auto',
            'mt-[60px]'
          )}
        >
          {/* Icon + Title */}
          <div className='flex items-center gap-3 mb-4'>
            <Lightbulb className='w-6 h-6 text-primary' />
            <h3
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[1.125rem]',
                'font-bold',
                'text-[#2C3E3C]'
              )}
            >
              Pourquoi c'est important pour vous
            </h3>
          </div>

          {/* Points List */}
          <div className='flex flex-col gap-3'>
            {[
              'Je comprends les mécanismes biologiques derrière vos symptômes',
              'Mes recommandations sont basées sur la science, pas sur des modes',
              'Je peux collaborer avec vos médecins si nécessaire',
              'Vos consultations sont remboursables par votre assurance',
            ].map((point, index) => (
              <div key={index} className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
                <p
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.95rem]',
                    'leading-[1.6]',
                    'text-[#6B7280]'
                  )}
                >
                  {point}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CredentialsSection;
