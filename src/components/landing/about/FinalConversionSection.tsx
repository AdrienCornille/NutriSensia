'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, Package, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function FinalConversionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const signatureVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <section
      ref={ref}
      className='relative w-full bg-sage-50/20 py-[100px] px-10 max-md:py-[60px] max-md:px-6 prevent-overflow'
    >
      <div className='container mx-auto max-w-[1200px]'>
        <motion.div
          className='relative bg-gradient-to-br from-primary to-[#6A8773] rounded-[20px] max-md:rounded-[16px] p-[80px] max-md:p-[50px] max-sm:p-[30px] shadow-[0_10px_40px_rgba(124,152,133,0.25)] text-center max-w-[900px] mx-auto'
          variants={containerVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Subtle Background Pattern */}
          <div
            className='absolute inset-0 opacity-5 rounded-[20px] max-md:rounded-[16px]'
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px',
            }}
          ></div>

          {/* Content */}
          <div className='relative z-10'>
            {/* Title */}
            <motion.h2
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '48px',
                lineHeight: '57.6px',
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '24px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              className='max-md:!text-[2rem] max-md:!leading-[2.4rem]'
              variants={textVariants}
              initial='hidden'
              animate={isInView ? 'visible' : 'hidden'}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Prête à Faire Connaissance ?
            </motion.h2>

            {/* Supporting Text */}
            <div className='max-w-[750px] mx-auto mb-10'>
              {/* Paragraph 1 */}
              <motion.p
                className="font-['Inter',system-ui,sans-serif] text-[1.25rem] max-md:text-[1.125rem] font-normal text-white/95 leading-[1.8] text-center mb-6"
                variants={textVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Si mon approche résonne en vous, si vous pensez qu'on pourrait
                bien travailler ensemble, je serais ravie de vous rencontrer.
              </motion.p>

              {/* Paragraph 2 + Bullets */}
              <motion.div
                className='mb-6'
                variants={textVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="font-['Inter',system-ui,sans-serif] text-[1.25rem] max-md:text-[1.125rem] font-normal text-white/95 leading-[1.8] text-center mb-4">
                  La consultation découverte, c'est l'occasion de :
                </p>
                <div className='flex flex-col gap-2 max-w-[600px] mx-auto'>
                  {[
                    'Me poser toutes vos questions',
                    'Me parler de ce que vous vivez',
                    'Voir si mon approche vous convient',
                    'Décider ensemble de la suite',
                  ].map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-center gap-3 text-center'
                    >
                      <div className='w-1.5 h-1.5 bg-white rounded-full flex-shrink-0'></div>
                      <span className="font-['Inter',system-ui,sans-serif] text-[1.125rem] max-md:text-[1rem] text-white/95">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Paragraph 3 */}
              <motion.p
                className="font-['Inter',system-ui,sans-serif] text-[1.25rem] max-md:text-[1.125rem] font-normal text-white/95 leading-[1.8] text-center"
                variants={textVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Sans pression. Sans engagement. Juste une vraie conversation.
              </motion.p>
            </div>

            {/* CTA Buttons Group */}
            <div className='flex flex-col items-center gap-4 mb-8'>
              {/* Primary CTA */}
              <motion.div
                variants={buttonVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link
                  href='/contact'
                  className="inline-flex items-center justify-center gap-3 bg-white text-[#2C3E3C] font-['Inter',system-ui,sans-serif] text-[1.125rem] font-semibold px-10 py-[18px] max-md:px-8 max-md:py-4 rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.15)] min-w-[350px] max-md:min-w-[90%] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                  role='button'
                  aria-label='Réserver une consultation découverte gratuite'
                >
                  <Calendar className='w-5 h-5' aria-hidden='true' />
                  <span>Réserver Ma Consultation Découverte</span>
                </Link>
              </motion.div>

              {/* Secondary CTA */}
              <motion.div
                variants={buttonVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link
                  href='/forfaits'
                  className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white font-['Inter',system-ui,sans-serif] text-[1.125rem] font-semibold px-10 py-4 max-md:px-8 max-md:py-[14px] rounded-lg min-w-[350px] max-md:min-w-[90%] transition-all duration-300 ease-out hover:bg-white/15 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                  role='button'
                  aria-label="Découvrir les forfaits d'accompagnement"
                >
                  <Package className='w-[18px] h-[18px]' aria-hidden='true' />
                  <span>Découvrir Mes Forfaits</span>
                </Link>
              </motion.div>

              {/* Tertiary CTA */}
              <motion.div
                variants={buttonVariants}
                initial='hidden'
                animate={isInView ? 'visible' : 'hidden'}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Link
                  href='/contact'
                  className="inline-flex items-center justify-center gap-3 bg-transparent text-white font-['Inter',system-ui,sans-serif] text-[1rem] font-semibold px-6 py-3 transition-all duration-300 ease-out hover:underline hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                  role='button'
                  aria-label='Envoyer un message direct'
                >
                  <MessageCircle
                    className='w-[18px] h-[18px]'
                    aria-hidden='true'
                  />
                  <span>M'Envoyer Un Message</span>
                </Link>
              </motion.div>
            </div>

            {/* Personal Signature */}
            <motion.div
              className='text-center mt-8'
              variants={signatureVariants}
              initial='hidden'
              animate={isInView ? 'visible' : 'hidden'}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="font-['Inter',system-ui,sans-serif] text-[1.125rem] max-md:text-[1rem] italic text-white/95 leading-[1.6]">
                Au plaisir de vous accompagner,
                <br />
                Lucie{' '}
                <span className='text-green-300' aria-label='cœur vert'>
                  💚
                </span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
