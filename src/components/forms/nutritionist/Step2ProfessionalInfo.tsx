'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Award, Briefcase, Globe, MapPin, ChevronDown } from 'lucide-react';
import type { NutritionistRegistrationData } from '@/types/nutritionist-registration';
import {
  SPECIALIZATIONS,
  LANGUAGES,
  YEARS_OF_EXPERIENCE,
  SWISS_CANTONS,
} from '@/types/nutritionist-registration';

interface Step2ProfessionalInfoProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Étape 2: Informations professionnelles
 * @see AUTH-008 dans USER_STORIES.md
 */
export function Step2ProfessionalInfo({
  onNext,
  onBack,
}: Step2ProfessionalInfoProps) {
  const {
    register,
    control,
    formState: { errors },
    trigger,
    watch,
  } = useFormContext<NutritionistRegistrationData>();

  const ascaNumber = watch('professionalInfo.ascaNumber');
  const rmeNumber = watch('professionalInfo.rmeNumber');

  const handleNext = async () => {
    const isValid = await trigger([
      'professionalInfo.ascaNumber',
      'professionalInfo.rmeNumber',
      'professionalInfo.specializations',
      'professionalInfo.yearsOfExperience',
      'professionalInfo.languages',
    ]);

    // Validation custom: au moins un certificat requis
    if (!ascaNumber && !rmeNumber) {
      return;
    }

    if (isValid) {
      onNext();
    }
  };

  return (
    <div className='space-y-8'>
      {/* Certifications */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <Award className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-lg font-semibold text-gray-800'>
            Certifications
          </h3>
        </div>

        <p className='text-sm text-gray-600 mb-4'>
          Au moins un numéro ASCA ou RME est requis pour l&apos;inscription.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Numéro ASCA
            </label>
            <input
              type='text'
              {...register('professionalInfo.ascaNumber', {
                validate: value => {
                  if (!value && !rmeNumber) {
                    return 'Au moins un numéro ASCA ou RME est requis';
                  }
                  return true;
                },
              })}
              placeholder='XX123456'
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors ${
                errors.professionalInfo?.ascaNumber
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {errors.professionalInfo?.ascaNumber && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.professionalInfo.ascaNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Numéro RME
            </label>
            <input
              type='text'
              {...register('professionalInfo.rmeNumber')}
              placeholder='RME123456'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors'
            />
          </div>
        </div>

        {!ascaNumber && !rmeNumber && (
          <p className='text-sm text-amber-600 bg-amber-50 p-3 rounded-lg'>
            ⚠️ Veuillez renseigner au moins un numéro ASCA ou RME
          </p>
        )}
      </div>

      {/* Spécialisations */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <Briefcase className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-lg font-semibold text-gray-800'>
            Spécialisations
          </h3>
        </div>

        <Controller
          name='professionalInfo.specializations'
          control={control}
          rules={{
            validate: value =>
              (value && value.length > 0) ||
              'Sélectionnez au moins une spécialisation',
          }}
          render={({ field }) => (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
              {SPECIALIZATIONS.map(spec => (
                <label
                  key={spec}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    field.value?.includes(spec)
                      ? 'border-[#1B998B] bg-[#1B998B]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={field.value?.includes(spec) || false}
                    onChange={e => {
                      const current = field.value || [];
                      if (e.target.checked) {
                        field.onChange([...current, spec]);
                      } else {
                        field.onChange(current.filter(s => s !== spec));
                      }
                    }}
                    className='w-4 h-4 text-[#1B998B] border-gray-300 rounded focus:ring-[#1B998B]'
                  />
                  <span className='text-sm text-gray-700'>{spec}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.professionalInfo?.specializations && (
          <p className='text-sm text-red-600'>
            {errors.professionalInfo.specializations.message}
          </p>
        )}
      </div>

      {/* Expérience et Langues */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Années d&apos;expérience <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <select
              {...register('professionalInfo.yearsOfExperience', {
                required: 'Sélectionnez votre expérience',
              })}
              className={`w-full px-4 py-3 border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors ${
                errors.professionalInfo?.yearsOfExperience
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            >
              <option value=''>Sélectionner</option>
              {YEARS_OF_EXPERIENCE.map(exp => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
            <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
          </div>
          {errors.professionalInfo?.yearsOfExperience && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.professionalInfo.yearsOfExperience.message}
            </p>
          )}
        </div>

        <div>
          <div className='flex items-center gap-2 mb-1'>
            <Globe className='w-4 h-4 text-gray-400' />
            <label className='text-sm font-medium text-gray-700'>
              Langues parlées <span className='text-red-500'>*</span>
            </label>
          </div>
          <Controller
            name='professionalInfo.languages'
            control={control}
            rules={{
              validate: value =>
                (value && value.length > 0) ||
                'Sélectionnez au moins une langue',
            }}
            render={({ field }) => (
              <div className='flex flex-wrap gap-2'>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type='button'
                    onClick={() => {
                      const current = field.value || [];
                      if (current.includes(lang.code)) {
                        field.onChange(current.filter(l => l !== lang.code));
                      } else {
                        field.onChange([...current, lang.code]);
                      }
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      field.value?.includes(lang.code)
                        ? 'border-[#1B998B] bg-[#1B998B] text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          />
          {errors.professionalInfo?.languages && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.professionalInfo.languages.message}
            </p>
          )}
        </div>
      </div>

      {/* Adresse du cabinet (optionnel) */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <MapPin className='w-5 h-5 text-[#1B998B]' />
          <h3 className='text-lg font-semibold text-gray-800'>
            Adresse du cabinet{' '}
            <span className='text-sm font-normal text-gray-500'>
              (optionnel)
            </span>
          </h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Rue et numéro
            </label>
            <input
              type='text'
              {...register('professionalInfo.cabinetAddress.street')}
              placeholder='Rue de la Paix 123'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Code postal
            </label>
            <input
              type='text'
              {...register('professionalInfo.cabinetAddress.postalCode')}
              placeholder='1200'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Ville
            </label>
            <input
              type='text'
              {...register('professionalInfo.cabinetAddress.city')}
              placeholder='Genève'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Canton
            </label>
            <div className='relative'>
              <select
                {...register('professionalInfo.cabinetAddress.canton')}
                className='w-full px-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors'
              >
                <option value=''>Sélectionner un canton</option>
                {SWISS_CANTONS.map(canton => (
                  <option key={canton.code} value={canton.code}>
                    {canton.label} ({canton.code})
                  </option>
                ))}
              </select>
              <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Biographie professionnelle{' '}
          <span className='text-sm font-normal text-gray-500'>(optionnel)</span>
        </label>
        <textarea
          {...register('professionalInfo.bio')}
          rows={4}
          placeholder='Décrivez votre parcours, votre approche et ce qui vous motive...'
          className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors resize-none'
        />
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
          disabled={!ascaNumber && !rmeNumber}
          className='flex-1 py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

export default Step2ProfessionalInfo;
