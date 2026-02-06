'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import type { NutritionistRegistrationData } from '@/types/nutritionist-registration';

interface Step1PersonalInfoProps {
  onNext: () => void;
}

/**
 * Étape 1: Informations personnelles
 * @see AUTH-008 dans USER_STORIES.md
 */
export function Step1PersonalInfo({ onNext }: Step1PersonalInfoProps) {
  const {
    register,
    formState: { errors },
    trigger,
    watch,
  } = useFormContext<NutritionistRegistrationData>();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const password = watch('personalInfo.password');

  const handleNext = async () => {
    const isValid = await trigger([
      'personalInfo.firstName',
      'personalInfo.lastName',
      'personalInfo.email',
      'personalInfo.phone',
      'personalInfo.password',
      'personalInfo.confirmPassword',
    ]);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className='space-y-6'>
      {/* Prénom et Nom */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Prénom <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              {...register('personalInfo.firstName', {
                required: 'Le prénom est requis',
                minLength: { value: 2, message: 'Minimum 2 caractères' },
              })}
              placeholder='Votre prénom'
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors ${
                errors.personalInfo?.firstName
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
          </div>
          {errors.personalInfo?.firstName && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.personalInfo.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Nom <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              {...register('personalInfo.lastName', {
                required: 'Le nom est requis',
                minLength: { value: 2, message: 'Minimum 2 caractères' },
              })}
              placeholder='Votre nom'
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors ${
                errors.personalInfo?.lastName
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
          </div>
          {errors.personalInfo?.lastName && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.personalInfo.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Email professionnel <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='email'
            {...register('personalInfo.email', {
              required: "L'email est requis",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide',
              },
            })}
            placeholder='votre@email.ch'
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors ${
              errors.personalInfo?.email
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          />
        </div>
        {errors.personalInfo?.email && (
          <p className='mt-1 text-sm text-red-600'>
            {errors.personalInfo.email.message}
          </p>
        )}
      </div>

      {/* Téléphone */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Téléphone <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='tel'
            {...register('personalInfo.phone', {
              required: 'Le téléphone est requis',
              pattern: {
                value: /^(\+41|0)[1-9][0-9\s]{8,}$/,
                message: 'Format suisse: +41 XX XXX XX XX ou 0XX XXX XX XX',
              },
            })}
            placeholder='+41 79 123 45 67'
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors ${
              errors.personalInfo?.phone
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          />
        </div>
        {errors.personalInfo?.phone && (
          <p className='mt-1 text-sm text-red-600'>
            {errors.personalInfo.phone.message}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Mot de passe <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('personalInfo.password', {
              required: 'Le mot de passe est requis',
              minLength: { value: 8, message: 'Minimum 8 caractères' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: '1 majuscule, 1 minuscule et 1 chiffre requis',
              },
            })}
            placeholder='Minimum 8 caractères'
            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors ${
              errors.personalInfo?.password
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
          >
            {showPassword ? (
              <EyeOff className='w-5 h-5' />
            ) : (
              <Eye className='w-5 h-5' />
            )}
          </button>
        </div>
        {errors.personalInfo?.password && (
          <p className='mt-1 text-sm text-red-600'>
            {errors.personalInfo.password.message}
          </p>
        )}
        <p className='mt-1 text-xs text-gray-500'>
          Au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre
        </p>
      </div>

      {/* Confirmation mot de passe */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Confirmer le mot de passe <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('personalInfo.confirmPassword', {
              required: 'Veuillez confirmer votre mot de passe',
              validate: value =>
                value === password || 'Les mots de passe ne correspondent pas',
            })}
            placeholder='Confirmez votre mot de passe'
            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B998B] transition-colors ${
              errors.personalInfo?.confirmPassword
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          />
          <button
            type='button'
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
          >
            {showConfirmPassword ? (
              <EyeOff className='w-5 h-5' />
            ) : (
              <Eye className='w-5 h-5' />
            )}
          </button>
        </div>
        {errors.personalInfo?.confirmPassword && (
          <p className='mt-1 text-sm text-red-600'>
            {errors.personalInfo.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Bouton suivant */}
      <div className='pt-4'>
        <button
          type='button'
          onClick={handleNext}
          className='w-full py-3 bg-[#1B998B] text-white font-medium rounded-xl hover:bg-[#158578] transition-colors'
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

export default Step1PersonalInfo;
