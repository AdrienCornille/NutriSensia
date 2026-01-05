'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { ClipboardList, Calculator, Rocket } from 'lucide-react';

/**
 * Section "Comment ça marche" - 3 étapes
 * Design Méditerranée avec fond turquoise #1B998B
 */
export function HowItWorksSection() {
  const t = useTranslations('CalorieCalculator');
  const { isFirstVisit } = useFirstVisit();

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) return {};
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px)`,
    };
  };

  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  const steps = [
    {
      number: '1',
      icon: ClipboardList,
      title: t('howItWorks.steps.step1.title'),
      description: t('howItWorks.steps.step1.description'),
    },
    {
      number: '2',
      icon: Calculator,
      title: t('howItWorks.steps.step2.title'),
      description: t('howItWorks.steps.step2.description'),
    },
    {
      number: '3',
      icon: Rocket,
      title: t('howItWorks.steps.step3.title'),
      description: t('howItWorks.steps.step3.description'),
    },
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: '#1B998B',
        padding: '80px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <motion.div
          style={{
            ...getHiddenStyle(30),
            textAlign: 'center',
            marginBottom: '64px',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '12px',
              display: 'block',
            }}
          >
            {t('howItWorks.subtitle')}
          </span>
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '42px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
            }}
          >
            {t('howItWorks.title')}
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}
          className='steps-grid'
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.number}
                style={{
                  ...getHiddenStyle(40),
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '40px 32px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
                animate={
                  showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
                }
                transition={getTransition(0.1 + index * 0.15)}
              >
                {/* Number badge */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontFamily: "'Marcellus', serif",
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1B998B',
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  style={{
                    marginBottom: '20px',
                    color: '#ffffff',
                  }}
                >
                  <IconComponent size={32} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '12px',
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '16px',
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
          h2 {
            font-size: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default HowItWorksSection;
