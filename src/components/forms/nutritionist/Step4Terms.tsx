'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FileCheck, ExternalLink, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { NutritionistRegistrationData } from '@/types/nutritionist-registration';

interface Step4TermsProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Étape 4: Conditions d'utilisation
 * @see AUTH-008 dans USER_STORIES.md
 */
export function Step4Terms({ onNext, onBack }: Step4TermsProps) {
  const {
    control,
    formState: { errors },
    trigger,
    watch,
  } = useFormContext<NutritionistRegistrationData>();

  const terms = watch('terms');
  const allAccepted =
    terms?.acceptTerms &&
    terms?.acceptPrivacy &&
    terms?.acceptSalesTerms &&
    terms?.certifyAccuracy;

  const handleNext = async () => {
    const isValid = await trigger([
      'terms.acceptTerms',
      'terms.acceptPrivacy',
      'terms.acceptSalesTerms',
      'terms.certifyAccuracy',
    ]);
    if (isValid && allAccepted) {
      onNext();
    }
  };

  const checkboxItems = [
    {
      name: 'terms.acceptTerms' as const,
      label: "J'accepte les conditions générales d'utilisation",
      link: '/conditions',
      linkLabel: "Lire les conditions d'utilisation",
      required: true,
    },
    {
      name: 'terms.acceptPrivacy' as const,
      label: "J'accepte la politique de confidentialité",
      link: '/confidentialite',
      linkLabel: 'Lire la politique de confidentialité',
      required: true,
    },
    {
      name: 'terms.acceptSalesTerms' as const,
      label: "J'accepte les conditions générales de vente pour nutritionnistes",
      link: '/conditions-nutritionnistes',
      linkLabel: 'Lire les CGV nutritionnistes',
      required: true,
    },
    {
      name: 'terms.certifyAccuracy' as const,
      label:
        'Je certifie que toutes les informations fournies sont exactes et à jour',
      required: true,
    },
  ];

  return (
    <div className='space-y-8'>
      {/* En-tête */}
      <div className='flex items-start gap-3 p-4 bg-blue-50 rounded-xl'>
        <FileCheck className='w-5 h-5 text-blue-600 mt-0.5' />
        <div>
          <p className='text-sm font-medium text-blue-800'>
            Conditions et engagements
          </p>
          <p className='text-sm text-blue-600 mt-1'>
            Veuillez lire et accepter les conditions suivantes pour finaliser
            votre inscription.
          </p>
        </div>
      </div>

      {/* Checkboxes */}
      <div className='space-y-4'>
        {checkboxItems.map((item, index) => (
          <Controller
            key={item.name}
            name={item.name}
            control={control}
            rules={{
              validate: value =>
                value === true || 'Vous devez accepter pour continuer',
            }}
            render={({ field }) => (
              <div
                className={`p-4 border rounded-xl transition-colors ${
                  field.value
                    ? 'border-[#1B998B] bg-[#1B998B]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <label className='flex items-start gap-3 cursor-pointer'>
                  <div className='relative flex-shrink-0 mt-0.5'>
                    <input
                      type='checkbox'
                      checked={field.value || false}
                      onChange={e => field.onChange(e.target.checked)}
                      className='sr-only'
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        field.value
                          ? 'bg-[#1B998B] border-[#1B998B]'
                          : 'border-gray-300'
                      }`}
                    >
                      {field.value && <Check className='w-3 h-3 text-white' />}
                    </div>
                  </div>

                  <div className='flex-1'>
                    <p className='text-sm text-gray-800'>
                      {item.label}
                      {item.required && (
                        <span className='text-red-500 ml-1'>*</span>
                      )}
                    </p>

                    {item.link && (
                      <Link
                        href={item.link}
                        target='_blank'
                        className='inline-flex items-center gap-1 text-xs text-[#1B998B] hover:underline mt-1'
                        onClick={e => e.stopPropagation()}
                      >
                        {item.linkLabel}
                        <ExternalLink className='w-3 h-3' />
                      </Link>
                    )}
                  </div>
                </label>

                {errors.terms?.[
                  item.name.split('.')[1] as keyof typeof errors.terms
                ] && (
                  <p className='mt-2 text-sm text-red-600 pl-8'>
                    {
                      errors.terms[
                        item.name.split('.')[1] as keyof typeof errors.terms
                      ]?.message
                    }
                  </p>
                )}
              </div>
            )}
          />
        ))}
      </div>

      {/* Note légale */}
      <div className='p-4 bg-gray-50 rounded-xl'>
        <p className='text-xs text-gray-600'>
          En créant un compte professionnel sur NutriSensia, vous vous engagez à
          fournir des informations exactes et à respecter les règles
          déontologiques de votre profession. Vos documents seront vérifiés par
          notre équipe avant activation de votre compte. Ce processus peut
          prendre jusqu&apos;à 48 heures ouvrées.
        </p>
      </div>

      {/* Boutons */}
      <div className='flex gap-4 pt-4'>
        <button
          type='button'
          onClick={onBack}
          className='flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors'
        >
          Retour
        </button>
        <button
          type='button'
          onClick={handleNext}
          disabled={!allAccepted}
          className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

export default Step4Terms;
