'use client';

import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { UserIcon, GlobeAltIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FormField } from '@/components/ui/FormField';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

export function CommonProfileFields() {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-6'
    >
      <div className='flex items-center space-x-3 mb-6'>
        <UserIcon className='h-6 w-6 text-primary' />
        <h2 className='text-xl font-semibold text-gray-900'>
          Informations personnelles
        </h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Prénom */}
        <FormField
          name='first_name'
          label='Prénom'
          placeholder='Votre prénom'
          required
        />

        {/* Nom de famille */}
        <FormField
          name='last_name'
          label='Nom de famille'
          placeholder='Votre nom de famille'
          required
        />
      </div>

      {/* Téléphone */}
      <FormField
        name='phone'
        label='Numéro de téléphone'
        type='tel'
        placeholder='+41 XX XXX XX XX'
        required
      />

      {/* Avatar */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>
          Photo de profil
        </label>
        <AvatarUpload
          name='avatar_url'
          currentAvatar={undefined}
          onAvatarChange={url => {
            // La logique de mise à jour sera gérée par le composant AvatarUpload
          }}
        />
        {errors.avatar_url && (
          <p className='text-sm text-red-600'>
            {errors.avatar_url.message as string}
          </p>
        )}
      </div>

      {/* Préférences de langue et fuseau horaire */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <div className='flex items-center space-x-2'>
            <GlobeAltIcon className='h-5 w-5 text-gray-500' />
            <label className='block text-sm font-medium text-gray-700'>
              Langue
            </label>
          </div>
          <select
            {...useFormContext().register('locale')}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
          >
            <option value='fr-CH'>Français (Suisse)</option>
            <option value='de-CH'>Deutsch (Schweiz)</option>
            <option value='it-CH'>Italiano (Svizzera)</option>
            <option value='en-US'>English (US)</option>
          </select>
          {errors.locale && (
            <p className='text-sm text-red-600'>
              {errors.locale.message as string}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <div className='flex items-center space-x-2'>
            <ClockIcon className='h-5 w-5 text-gray-500' />
            <label className='block text-sm font-medium text-gray-700'>
              Fuseau horaire
            </label>
          </div>
          <select
            {...useFormContext().register('timezone')}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
          >
            <option value='Europe/Zurich'>Europe/Zurich (UTC+1/+2)</option>
            <option value='Europe/Berlin'>Europe/Berlin (UTC+1/+2)</option>
            <option value='Europe/Paris'>Europe/Paris (UTC+1/+2)</option>
            <option value='Europe/Rome'>Europe/Rome (UTC+1/+2)</option>
            <option value='America/New_York'>
              America/New_York (UTC-5/-4)
            </option>
            <option value='America/Los_Angeles'>
              America/Los_Angeles (UTC-8/-7)
            </option>
          </select>
          {errors.timezone && (
            <p className='text-sm text-red-600'>
              {errors.timezone.message as string}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
