'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import {
  calculateCalories,
  type CalorieCalculatorData,
  type CalculatorResults,
  type ActivityLevel,
  type Goal,
  type Gender,
} from '@/lib/calculatorSchemas';
import { z } from 'zod';

// Schema étendu avec prénom
const modalFormSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez entrer un email valide'),
});

type ModalFormData = z.infer<typeof modalFormSchema>;

/**
 * Section Formulaire et Résultats du calculateur
 * Design inspiré de la référence avec layout 2 colonnes
 * Formulaire à gauche avec sliders, résultats à droite en temps réel
 */
export function CalculatorFormSection() {
  const t = useTranslations('CalorieCalculator');
  const { isFirstVisit } = useFirstVisit();

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // États du formulaire calculateur
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] =
    useState<ActivityLevel>('sedentary');
  const [goal, setGoal] = useState<Goal>('maintain');

  // États du modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Formulaire du modal
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ModalFormData>({
    resolver: zodResolver(modalFormSchema),
  });

  // Fermer le modal avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Bloquer le scroll quand le modal est ouvert
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const onModalSubmit = async (data: ModalFormData) => {
    setIsSubmitting(true);
    try {
      // Simuler l'envoi (remplacer par une vraie API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', data, 'Calories:', results.targetCalories);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitted(false);
    reset();
  };

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

  // Calcul en temps réel des résultats
  const results: CalculatorResults = useMemo(() => {
    const data: CalorieCalculatorData = {
      age,
      height,
      weight,
      gender,
      activityLevel,
      goal,
    };
    return calculateCalories(data);
  }, [age, height, weight, gender, activityLevel, goal]);

  const activityOptions: { value: ActivityLevel; label: string }[] = [
    { value: 'sedentary', label: t('form.activity.sedentary') },
    { value: 'lightlyActive', label: t('form.activity.lightlyActive') },
    { value: 'moderatelyActive', label: t('form.activity.moderatelyActive') },
    { value: 'veryActive', label: t('form.activity.veryActive') },
    { value: 'athlete', label: t('form.activity.athlete') },
  ];

  const goalOptions: { value: Goal; label: string }[] = [
    { value: 'maintain', label: t('form.goal.maintain') },
    { value: 'lose', label: t('form.goal.lose') },
    { value: 'gain', label: t('form.goal.gain') },
  ];

  // Style pour le slider personnalisé - Turquoise NutriSensia
  const sliderTrackStyle = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(to right, #1B998B 0%, #1B998B ${percentage}%, #E5DED6 ${percentage}%, #E5DED6 100%)`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id='calculator'
      style={{
        backgroundColor: '#FBF9F7',
        padding: '80px 24px',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          overflow: 'visible',
        }}
      >
        {/* Introduction de la section */}
        <motion.div
          style={{
            ...getHiddenStyle(20),
            textAlign: 'center',
            marginBottom: '48px',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '42px',
              fontWeight: 700,
              lineHeight: '50.4px',
              color: '#1B998B',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Comment ça marche
          </h2>
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '18px',
              lineHeight: '28px',
              color: '#41556b',
              maxWidth: '700px',
              margin: '0 auto',
              marginBottom: '20px',
            }}
          >
            Remplissez vos informations dans le calculateur ci-dessous et
            découvrez exactement combien de calories vous devez consommer pour
            atteindre vos objectifs.
          </p>
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '15px',
              lineHeight: '24px',
              color: '#1B998B',
              fontWeight: 600,
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            N'oubliez pas de cliquer sur le bouton en bas pour recevoir votre
            plan alimentaire GRATUIT de 7 jours adapté à vos objectifs !
          </p>
        </motion.div>

        {/* Container principal - carte style NutriSensia */}
        <motion.div
          style={{
            ...getHiddenStyle(30),
            backgroundColor: 'rgba(27, 153, 139, 0.08)',
            borderRadius: '20px',
            padding: '48px',
            border: '1px solid #E5DED6',
            boxShadow: '8px 8px 0 #E5DED6',
            overflow: 'visible',
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
        >
          {/* Titre principal */}
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '42px',
              fontWeight: 700,
              lineHeight: '50.4px',
              color: '#1B998B',
              marginBottom: '40px',
            }}
          >
            {t('form.title')}
          </h2>

          {/* Layout 2 colonnes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '48px',
              alignItems: 'start',
              overflow: 'visible',
            }}
            className='calculator-grid'
          >
            {/* Colonne gauche - Formulaire */}
            <div>
              {/* Âge - Slider */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <label
                    htmlFor='age'
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1B998B',
                    }}
                  >
                    {t('form.age.label')}
                  </label>
                  <span
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5DED6',
                      borderRadius: '8px',
                      padding: '6px 16px',
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#41556b',
                    }}
                  >
                    {age} {t('form.age.unit')}
                  </span>
                </div>
                <input
                  type='range'
                  id='age'
                  min={16}
                  max={90}
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    appearance: 'none',
                    cursor: 'pointer',
                    ...sliderTrackStyle(age, 16, 90),
                  }}
                  className='custom-slider'
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#A89888' }}>
                    16 {t('form.age.unit')}
                  </span>
                  <span style={{ fontSize: '12px', color: '#A89888' }}>
                    90 {t('form.age.unit')}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginTop: '4px',
                  }}
                >
                  {t('form.age.helper')}
                </p>
              </div>

              {/* Taille - Slider */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <label
                    htmlFor='height'
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1B998B',
                    }}
                  >
                    {t('form.height.label')}
                  </label>
                  <span
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5DED6',
                      borderRadius: '8px',
                      padding: '6px 16px',
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#41556b',
                    }}
                  >
                    {height} {t('form.height.unit')}
                  </span>
                </div>
                <input
                  type='range'
                  id='height'
                  min={140}
                  max={210}
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    appearance: 'none',
                    cursor: 'pointer',
                    ...sliderTrackStyle(height, 140, 210),
                  }}
                  className='custom-slider'
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#A89888' }}>
                    140 {t('form.height.unit')}
                  </span>
                  <span style={{ fontSize: '12px', color: '#A89888' }}>
                    210 {t('form.height.unit')}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginTop: '4px',
                  }}
                >
                  {t('form.height.helper')}
                </p>
              </div>

              {/* Poids - Slider */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <label
                    htmlFor='weight'
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1B998B',
                    }}
                  >
                    {t('form.weight.label')}
                  </label>
                  <span
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5DED6',
                      borderRadius: '8px',
                      padding: '6px 16px',
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#41556b',
                    }}
                  >
                    {weight} {t('form.weight.unit')}
                  </span>
                </div>
                <input
                  type='range'
                  id='weight'
                  min={40}
                  max={150}
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    appearance: 'none',
                    cursor: 'pointer',
                    ...sliderTrackStyle(weight, 40, 150),
                  }}
                  className='custom-slider'
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#A89888' }}>
                    40 {t('form.weight.unit')}
                  </span>
                  <span style={{ fontSize: '12px', color: '#A89888' }}>
                    150 {t('form.weight.unit')}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginTop: '4px',
                  }}
                >
                  {t('form.weight.helper')}
                </p>
              </div>

              {/* Sexe - Radio buttons */}
              <div style={{ marginBottom: '28px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1B998B',
                    marginBottom: '12px',
                  }}
                >
                  {t('form.gender.label')}
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {(['male', 'female'] as const).map(g => (
                    <label
                      key={g}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: `2px solid ${gender === g ? '#1B998B' : '#CBD5E0'}`,
                          backgroundColor:
                            gender === g ? '#1B998B' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {gender === g && (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#FFFFFF',
                            }}
                          />
                        )}
                      </div>
                      <input
                        type='radio'
                        name='gender'
                        value={g}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        style={{ display: 'none' }}
                      />
                      <span
                        style={{
                          fontFamily:
                            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '15px',
                          color: '#41556b',
                        }}
                      >
                        {t(`form.gender.${g}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Niveau d'activité - Select */}
              <div style={{ marginBottom: '28px' }}>
                <label
                  htmlFor='activityLevel'
                  style={{
                    display: 'block',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1B998B',
                    marginBottom: '8px',
                  }}
                >
                  {t('form.activity.label')}
                </label>
                <select
                  id='activityLevel'
                  value={activityLevel}
                  onChange={e =>
                    setActivityLevel(e.target.value as ActivityLevel)
                  }
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    border: '1px solid #E5DED6',
                    borderRadius: '10px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '18px',
                    paddingRight: '40px',
                  }}
                >
                  {activityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objectif - Select */}
              <div style={{ marginBottom: '8px' }}>
                <label
                  htmlFor='goal'
                  style={{
                    display: 'block',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1B998B',
                    marginBottom: '8px',
                  }}
                >
                  {t('form.goal.label')}
                </label>
                <select
                  id='goal'
                  value={goal}
                  onChange={e => setGoal(e.target.value as Goal)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    border: '1px solid #E5DED6',
                    borderRadius: '10px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '18px',
                    paddingRight: '40px',
                  }}
                >
                  {goalOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Colonne droite - Résultats */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #e5e5e5',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Titre Résultats */}
              <h3
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#1B998B',
                  marginBottom: '28px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {t('results.title')}
              </h3>

              {/* BMR */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#41556b',
                    }}
                  >
                    {t('results.bmr.shortLabel')} (MB)
                  </span>
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#41556b',
                    }}
                  >
                    {results.bmr} {t('results.bmr.unit')}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#718096',
                  }}
                >
                  {t('results.bmr.description')}
                </p>
              </div>

              {/* TDEE */}
              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#41556b',
                    }}
                  >
                    {t('results.tdee.shortLabel')} (DET)
                  </span>
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#41556b',
                    }}
                  >
                    {results.tdee} {t('results.tdee.unit')}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#718096',
                  }}
                >
                  {t('results.tdee.description')}
                </p>
              </div>

              {/* Target - Highlight */}
              <div
                style={{
                  marginBottom: '32px',
                  paddingTop: '16px',
                  paddingBottom: '32px',
                  borderTop: '1px solid #E5DED6',
                  borderBottom: '1px solid #E5DED6',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#1B998B',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    marginBottom: '16px',
                  }}
                >
                  {t('results.target.shortLabel')}
                </p>
                <p
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '64px',
                    fontWeight: 700,
                    color: '#1B998B',
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}
                >
                  {results.targetCalories}
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 500,
                      marginLeft: '8px',
                    }}
                  >
                    kcal/jour
                  </span>
                </p>
                <p
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '14px',
                    color: '#718096',
                    lineHeight: 1.5,
                  }}
                >
                  {t('results.target.description')}
                </p>
              </div>

              {/* CTA - What's Next */}
              <div style={{ position: 'relative' }}>
                <h4
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#1B998B',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                  }}
                >
                  {t('results.whatNext.title')}
                </h4>
                <p
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: '#41556b',
                    marginBottom: '20px',
                  }}
                >
                  {t('results.whatNext.description')}
                </p>

                {/* Container pour le bouton CTA */}
                <div style={{ position: 'relative' }}>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      background:
                        'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
                      color: '#FDFCFB',
                      padding: '14px 32px',
                      borderRadius: '35px',
                      border: 'none',
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      lineHeight: '25.2px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {t('results.whatNext.ctaButton')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal - Formulaire email */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCloseModal}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
            >
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
                style={{
                  backgroundColor: '#FBF9F7',
                  borderRadius: '20px',
                  padding: '40px',
                  maxWidth: '480px',
                  width: '100%',
                  position: 'relative',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Bouton fermer */}
                <button
                  onClick={handleCloseModal}
                  aria-label='Fermer'
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#E5DED6',
                    color: '#41556b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#d5cec6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#E5DED6';
                  }}
                >
                  <X size={20} />
                </button>

                {!isSubmitted ? (
                  <>
                    {/* Titre */}
                    <h3
                      style={{
                        fontFamily: "'Marcellus', serif",
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#1B998B',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '16px',
                      }}
                    >
                      {t('modal.title')}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '16px',
                        lineHeight: 1.6,
                        color: '#41556b',
                        marginBottom: '28px',
                      }}
                    >
                      {t('modal.description')}
                    </p>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit(onModalSubmit)}>
                      {/* Prénom */}
                      <div style={{ marginBottom: '20px' }}>
                        <label
                          htmlFor='firstName'
                          style={{
                            display: 'block',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#41556b',
                            marginBottom: '8px',
                          }}
                        >
                          {t('modal.firstName')}{' '}
                          <span style={{ color: '#E76F51' }}>*</span>
                        </label>
                        <input
                          {...register('firstName')}
                          id='firstName'
                          type='text'
                          placeholder={t('modal.firstNamePlaceholder')}
                          aria-invalid={!!errors.firstName}
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            fontSize: '16px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            border: `2px solid ${errors.firstName ? '#EF4444' : '#E5DED6'}`,
                            borderRadius: '12px',
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={e =>
                            (e.target.style.borderColor = '#1B998B')
                          }
                          onBlur={e =>
                            (e.target.style.borderColor = errors.firstName
                              ? '#EF4444'
                              : '#E5DED6')
                          }
                        />
                        {errors.firstName && (
                          <p
                            style={{
                              color: '#EF4444',
                              fontSize: '13px',
                              marginTop: '6px',
                            }}
                          >
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div style={{ marginBottom: '28px' }}>
                        <label
                          htmlFor='email'
                          style={{
                            display: 'block',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#41556b',
                            marginBottom: '8px',
                          }}
                        >
                          {t('modal.email')}{' '}
                          <span style={{ color: '#E76F51' }}>*</span>
                        </label>
                        <input
                          {...register('email')}
                          id='email'
                          type='email'
                          placeholder={t('modal.emailPlaceholder')}
                          aria-invalid={!!errors.email}
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            fontSize: '16px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            border: `2px solid ${errors.email ? '#EF4444' : '#E5DED6'}`,
                            borderRadius: '12px',
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={e =>
                            (e.target.style.borderColor = '#1B998B')
                          }
                          onBlur={e =>
                            (e.target.style.borderColor = errors.email
                              ? '#EF4444'
                              : '#E5DED6')
                          }
                        />
                        {errors.email && (
                          <p
                            style={{
                              color: '#EF4444',
                              fontSize: '13px',
                              marginTop: '6px',
                            }}
                          >
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Bouton submit */}
                      <button
                        type='submit'
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '16px 32px',
                          background: isSubmitting
                            ? '#A89888'
                            : 'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '35px',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                        }}
                        onMouseEnter={e => {
                          if (!isSubmitting) {
                            e.currentTarget.style.background =
                              'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
                            e.currentTarget.style.transform =
                              'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSubmitting) {
                            e.currentTarget.style.background =
                              'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {isSubmitting
                          ? t('modal.submitting')
                          : t('modal.submitButton')}
                      </button>
                    </form>
                  </>
                ) : (
                  /* Message de succès - Design simplifié */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{ textAlign: 'center', padding: '20px 0' }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Marcellus', serif",
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#2D3748',
                        marginBottom: '16px',
                      }}
                    >
                      {t('modal.successTitle')}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '16px',
                        lineHeight: 1.6,
                        color: '#41556b',
                        marginBottom: '28px',
                      }}
                    >
                      {t('modal.successMessage')}
                    </p>
                    <button
                      onClick={handleCloseModal}
                      style={{
                        padding: '14px 48px',
                        background:
                          'linear-gradient(135deg, #1B998B 0%, #147569 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '35px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #147569 0%, #0f5a50 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #1B998B 0%, #147569 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {t('modal.okButton')}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CSS pour les sliders personnalisés - Turquoise NutriSensia */}
      <style jsx>{`
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #1b998b;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(27, 153, 139, 0.3);
        }
        .custom-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #1b998b;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        .custom-slider:focus {
          outline: none;
        }
        @media (max-width: 900px) {
          .calculator-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default CalculatorFormSection;
