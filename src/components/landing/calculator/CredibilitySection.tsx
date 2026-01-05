'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { Link } from '@/i18n/navigation';
import {
  FlaskConical,
  ShieldCheck,
  Award,
  ArrowRight,
  Info,
} from 'lucide-react';

/**
 * Section Crédibilité avec disclaimer
 * Design Méditerranée avec fond crème #FBF9F7
 */
export function CredibilitySection() {
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

  const credibilityPoints = [
    {
      icon: FlaskConical,
      title: t('credibility.points.scientific.title'),
      description: t('credibility.points.scientific.description'),
    },
    {
      icon: ShieldCheck,
      title: t('credibility.points.privacy.title'),
      description: t('credibility.points.privacy.description'),
    },
    {
      icon: Award,
      title: t('credibility.points.expertise.title'),
      description: t('credibility.points.expertise.description'),
    },
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: '#FBF9F7',
        padding: '100px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Titre */}
        <motion.h2
          style={{
            ...getHiddenStyle(30),
            fontFamily: "'Marcellus', serif",
            fontSize: '42px',
            fontWeight: 700,
            color: '#1B998B',
            textAlign: 'center',
            marginBottom: '56px',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
        >
          {t('credibility.title')}
        </motion.h2>

        {/* Points de crédibilité */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            marginBottom: '64px',
          }}
          className='credibility-grid'
        >
          {credibilityPoints.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <motion.div
                key={index}
                style={{
                  ...getHiddenStyle(40),
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5DED6',
                  borderRadius: '16px',
                  padding: '36px 28px',
                  textAlign: 'center',
                  boxShadow: '6px 6px 0 #E5DED6',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                animate={
                  showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
                }
                transition={getTransition(0.1 + index * 0.1)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform =
                    'translateY(-4px) translateX(-4px)';
                  e.currentTarget.style.boxShadow = '10px 10px 0 #E5DED6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform =
                    'translateY(0) translateX(0)';
                  e.currentTarget.style.boxShadow = '6px 6px 0 #E5DED6';
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'rgba(27, 153, 139, 0.08)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: '#1B998B',
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
                    color: '#1B998B',
                    marginBottom: '12px',
                    lineHeight: 1.3,
                  }}
                >
                  {point.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: '#41556b',
                  }}
                >
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <motion.div
          style={{
            ...getHiddenStyle(30),
            backgroundColor: 'rgba(27, 153, 139, 0.05)',
            border: '1px solid rgba(27, 153, 139, 0.15)',
            borderRadius: '16px',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            marginBottom: '48px',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0.4)}
          className='disclaimer-box'
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(27, 153, 139, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#1B998B',
            }}
          >
            <Info size={24} />
          </div>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#41556b',
              fontStyle: 'italic',
            }}
          >
            {t('credibility.disclaimer')}
          </p>
        </motion.div>

        {/* CTA Consultation */}
        <motion.div
          style={{
            ...getHiddenStyle(20),
            textAlign: 'center',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.5)}
        >
          <Link
            href='/contact'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
              border: 'none',
              borderRadius: '35px',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 6px 20px rgba(27, 153, 139, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {t('credibility.ctaConsultation')}
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .credibility-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          h2 {
            font-size: 32px !important;
          }
          .disclaimer-box {
            flex-direction: column !important;
            text-align: center !important;
          }
        }
      `}</style>
    </section>
  );
}

export default CredibilitySection;
