'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  emailCaptureSchema,
  type EmailCaptureData,
} from '@/lib/calculatorSchemas';
import { Check, Send, BookOpen, Utensils } from 'lucide-react';

/**
 * Section "Et maintenant ?" avec formulaire email intégré
 * Design Méditerranée avec fond terracotta #E76F51
 */
export function NextStepsSection() {
  const t = useTranslations('CalorieCalculator');
  const { isFirstVisit } = useFirstVisit();

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailCaptureData>({
    resolver: zodResolver(emailCaptureSchema),
  });

  const onSubmit = async (data: EmailCaptureData) => {
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      // Simuler l'envoi (remplacer par une vraie API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Intégrer avec votre service d'email (Mailchimp, ConvertKit, etc.)
      console.log('Email soumis:', data.email);

      setIsSubmitted(true);
      reset();
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Utensils,
      text: t('nextSteps.benefits.item1'),
    },
    {
      icon: BookOpen,
      text: t('nextSteps.benefits.item2'),
    },
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: '#E76F51',
        padding: '80px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Titre */}
        <motion.h2
          style={{
            ...getHiddenStyle(30),
            fontFamily: "'Marcellus', serif",
            fontSize: '42px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '20px',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
        >
          {t('nextSteps.title')}
        </motion.h2>

        {/* Description */}
        <motion.p
          style={{
            ...getHiddenStyle(30),
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '18px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0.1)}
        >
          {t('nextSteps.description')}
        </motion.p>

        {/* Bénéfices */}
        <motion.div
          style={{
            ...getHiddenStyle(30),
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '40px',
            maxWidth: '500px',
            margin: '0 auto 40px',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0.2)}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: '8px',
            }}
          >
            Recevez gratuitement :
          </p>
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={20} color='#FFFFFF' />
                </div>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '16px',
                    color: '#FFFFFF',
                    lineHeight: 1.5,
                  }}
                >
                  {benefit.text}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Formulaire email */}
        <motion.div
          style={getHiddenStyle(30)}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0.3)}
        >
          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxWidth: '480px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
                className='email-form'
              >
                <input
                  {...register('email')}
                  type='email'
                  placeholder={t('nextSteps.emailPlaceholder')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  style={{
                    flex: 1,
                    minWidth: '250px',
                    padding: '16px 20px',
                    fontSize: '16px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    border: `2px solid ${errors.email ? '#FCA5A5' : 'rgba(255, 255, 255, 0.3)'}`,
                    borderRadius: '35px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#FFFFFF';
                    e.target.style.backgroundColor = '#FFFFFF';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = errors.email
                      ? '#FCA5A5'
                      : 'rgba(255, 255, 255, 0.3)';
                    e.target.style.backgroundColor =
                      'rgba(255, 255, 255, 0.95)';
                  }}
                />
                <button
                  type='submit'
                  disabled={isSubmitting}
                  style={{
                    padding: '16px 28px',
                    backgroundColor: isSubmitting ? '#A89888' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '35px',
                    color: '#E76F51',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 6px 20px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Send size={18} />
                      </motion.div>
                      {t('nextSteps.submitting')}
                    </>
                  ) : (
                    <>
                      {t('nextSteps.submitButton')}
                      <Send size={18} />
                    </>
                  )}
                </button>
              </div>

              {errors.email && (
                <p
                  id='email-error'
                  role='alert'
                  style={{
                    color: '#FEE2E2',
                    fontSize: '14px',
                    marginTop: '-8px',
                  }}
                >
                  {errors.email.message}
                </p>
              )}

              {submitError && (
                <p
                  role='alert'
                  style={{
                    color: '#FEE2E2',
                    fontSize: '14px',
                    marginTop: '-8px',
                  }}
                >
                  {t('nextSteps.errorMessage')}
                </p>
              )}
            </form>
          ) : (
            /* Message de succès */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '480px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Check size={32} color='#22C55E' strokeWidth={3} />
              </div>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.5,
                }}
              >
                {t('nextSteps.successMessage')}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          h2 {
            font-size: 32px !important;
          }
          .email-form {
            flex-direction: column !important;
          }
          .email-form input {
            min-width: 100% !important;
          }
          .email-form button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  );
}

export default NextStepsSection;
