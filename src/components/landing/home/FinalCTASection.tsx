'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { Calendar } from 'lucide-react';

/**
 * Section CTA Finale - Design 2025
 *
 * Section de conversion finale puissante qui incite à l'action
 * avec un design premium et des CTAs clairs.
 *
 * Features:
 * - CTA box avec gradient primary et ombres
 * - Double CTA (consultation + essai gratuit)
 * - Textes rassurants et motivants
 * - Animations d'entrée sophistiquées
 * - Responsive mobile optimisé
 * - Accessibilité WCAG AA complète
 */
export function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id='final-cta'
      className={cn(
        'relative',
        'bg-[#F8FAF9]',
        'pt-[100px] pb-[80px]',
        'md:pt-[120px] md:pb-[100px]'
      )}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1370px] px-6 md:px-10 lg:px-14 xl:px-20'>
        {/* ============================================ */}
        {/* CTA BOX - INNER CONTAINER                   */}
        {/* ============================================ */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'relative',
            'bg-gradient-to-br from-[#2E7D5E] to-[#1B4F3F]',
            'rounded-2xl md:rounded-[20px]',
            'p-[50px_30px] md:p-[80px_60px]',
            'shadow-[0_10px_40px_rgba(46,125,94,0.25)]',
            'text-center'
          )}
        >
          {/* ============================================ */}
          {/* H2 TITLE                                   */}
          {/* ============================================ */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              'font-sans',
              'text-[2rem] md:text-[2.5rem]',
              'font-bold',
              'text-white',
              'mb-6'
            )}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Prête à vous sentir mieux ?
          </motion.h2>

          {/* ============================================ */}
          {/* SUPPORTING TEXT                             */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={cn('mb-10', 'max-w-[960px]', 'mx-auto')}
          >
            <p
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[1.125rem] md:text-[1.25rem]',
                'font-normal',
                'text-white/95',
                'leading-[1.8]',
                'mb-4'
              )}
            >
              Vous n'avez pas besoin d'un énième régime miracle qui promet la
              lune.
            </p>

            <p
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[1.125rem] md:text-[1.25rem]',
                'font-normal',
                'text-white/95',
                'leading-[1.8]',
                'mb-4'
              )}
            >
              Vous n'avez pas besoin de vous priver pendant des semaines pour
              voir des résultats qui disparaissent en un weekend.
            </p>

            <p
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[1.125rem] md:text-[1.25rem]',
                'font-normal',
                'text-white/95',
                'leading-[1.8]',
                'mb-4'
              )}
            >
              Vous avez besoin de comprendre <strong>VOTRE</strong> corps.
              <br />
              De créer des habitudes qui fonctionnent pour <strong>VOUS</strong>
              .<br />
              D'avoir quelqu'un à vos côtés qui vous écoute vraiment.
            </p>

            <p
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[1.125rem] md:text-[1.25rem]',
                'font-semibold',
                'text-white',
                'leading-[1.8]'
              )}
            >
              Je suis là pour ça.
            </p>
          </motion.div>

          {/* ============================================ */}
          {/* PRIMARY CTA BUTTON                         */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={cn('flex flex-col items-center', 'mb-6')}
          >
            {/* Gros bouton principal */}
            <motion.button
              onClick={() => {
                // Redirection vers réservation consultation
                window.location.href = '/reservation';
              }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'inline-flex items-center gap-3',
                'justify-center',
                'bg-white',
                'text-[#2C3E3C]',
                "font-['Inter',system-ui,sans-serif]",
                'text-[1.125rem] md:text-[1.25rem]',
                'font-bold',
                'px-10 py-5 md:px-12 md:py-6',
                'rounded-xl',
                'shadow-[0_6px_20px_rgba(0,0,0,0.2)]',
                'transition-all duration-300',
                'hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
                'focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-4 focus:ring-offset-[#2E7D5E]',
                'w-full md:w-auto',
                'max-w-[720px]',
                'min-h-[56px] md:min-h-[64px]'
              )}
            >
              <Calendar className='w-5 h-5 md:w-6 md:h-6' strokeWidth={2.5} />
              <span>Réserver ma première consultation</span>
            </motion.button>
          </motion.div>

          {/* ============================================ */}
          {/* REASSURANCE TEXT                           */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.9375rem]',
              'text-white/90',
              'text-center',
              'letter-spacing-[0.3px]',
              'mb-5'
            )}
          >
            <span>1h30</span>
            <span className='mx-2'>•</span>
            <span>Remboursée par votre assurance</span>
            <span className='mx-2'>•</span>
            <span>Sans engagement</span>
          </motion.div>

          {/* ============================================ */}
          {/* SECONDARY CTA (Lien discret)               */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className={cn('text-center')}
          >
            <motion.a
              href='/contact'
              whileHover={{ y: -1 }}
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[0.9375rem]',
                'text-white/80',
                'hover:text-white',
                'transition-colors duration-200',
                'inline-block',
                'border-b border-white/30 hover:border-white/60',
                'pb-0.5',
                'focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#2E7D5E]',
                'rounded-sm'
              )}
            >
              Vous avez encore des questions ? → Écrivez-moi
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
