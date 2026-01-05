'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { Shield, Check, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Section Garantie Satisfait ou Remboursé
 *
 * Section de réassurance pour réduire la friction d'achat
 * en proposant une garantie sans risque.
 *
 * Features:
 * - Grande icône shield centrale
 * - 3 points de garantie avec checkmarks
 * - CTA vers consultation
 * - Design rassurant et professionnel
 * - Animations au scroll
 */
export function GuaranteeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const guaranteePoints = [
    {
      id: 1,
      icon: Clock,
      text: 'Première consultation de 1h30 complète',
    },
    {
      id: 2,
      icon: RefreshCw,
      text: 'Remboursement sous 7 jours si non satisfaite',
    },
    {
      id: 3,
      icon: Check,
      text: 'Aucun engagement à long terme requis',
    },
  ];

  return (
    <section
      id='guarantee'
      className={cn(
        'relative',
        'bg-gradient-to-br from-primary/5 to-white',
        'py-[80px] px-10',
        'md:py-[100px] md:px-16 lg:px-20'
      )}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1080px]'>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className={cn(
            'bg-white',
            'p-10 md:p-12',
            'rounded-2xl',
            'shadow-[0_8px_30px_rgba(44,62,60,0.12)]',
            'border-2 border-primary/20',
            'text-center'
          )}
        >
          {/* Shield Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className={cn(
              'w-20 h-20',
              'bg-primary',
              'rounded-full',
              'flex items-center justify-center',
              'mx-auto mb-6',
              'shadow-lg'
            )}
          >
            <Shield className='w-10 h-10 text-white' strokeWidth={2.5} />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={cn(
              "font-sans",
              'text-[2rem] md:text-[2.5rem]',
              'font-bold',
              'text-[#2C3E3C]',
              'mb-4'
            )}
          >
            Garantie 100% Satisfait ou Remboursé
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem]',
              'text-[#667674]',
              'leading-[1.7]',
              'mb-8',
              'max-w-[840px]',
              'mx-auto'
            )}
          >
            Je sais à quel point il peut être difficile de faire confiance à
            quelqu'un avec votre santé. C'est pourquoi je vous offre{' '}
            <strong className='text-primary'>
              une garantie totale de satisfaction
            </strong>{' '}
            après notre première consultation de 1h30. Si vous sentez que mon
            approche ne vous correspond pas, je vous rembourse sans vous
            demander de justification.
          </motion.p>

          {/* Guarantee Points */}
          <div className='space-y-4 mb-8'>
            {guaranteePoints.map((point, index) => {
              const IconComponent = point.icon;
              return (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                  }
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className={cn(
                    'flex items-center justify-center gap-3',
                    'text-primary font-semibold',
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1rem]'
                  )}
                >
                  <div className='flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center'>
                    <IconComponent
                      className='w-4 h-4 text-primary'
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>{point.text}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div className='w-full h-[1px] bg-gray-200 my-8' />

          {/* Bottom Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.95rem]',
              'text-[#667674]',
              'italic',
              'mb-6'
            )}
          >
            Parce que vous méritez un accompagnement dans lequel vous vous
            sentez écoutée et comprise. <br />
            Essayez en toute confiance.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Button
              variant='primary'
              size='lg'
              className={cn(
                'px-8 py-4',
                'text-[1.125rem] font-semibold',
                'shadow-lg hover:shadow-xl',
                'transition-all duration-300'
              )}
              onClick={() => {
                window.location.href = '/contact?type=consultation';
              }}
            >
              Réserver Ma Consultation Sans Risque
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
